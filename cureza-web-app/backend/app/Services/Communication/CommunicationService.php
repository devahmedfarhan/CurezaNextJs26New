<?php

namespace App\Services\Communication;

use App\Models\EmailLog;
use App\Models\EmailTemplate;
use App\Jobs\SendEmailJob;
use App\Repositories\Communication\EmailTemplateRepositoryInterface;
use App\Repositories\Communication\EmailLogRepositoryInterface;
use Illuminate\Support\Facades\Log;

class CommunicationService
{
    protected $templateRepository;
    protected $logRepository;

    public function __construct(
        EmailTemplateRepositoryInterface $templateRepository,
        EmailLogRepositoryInterface $logRepository
    ) {
        $this->templateRepository = $templateRepository;
        $this->logRepository = $logRepository;
    }

    /**
     * Send email using centralized dynamic SMTP.
     *
     * @param string|array $recipient Recipient email or array ['email' => '', 'name' => '']
     * @param string $subject Email Subject
     * @param string $bodyOrTemplateKey HTML Body or Database Template Key
     * @param array $variables Variable replacements for Blade templates
     * @param array $options Additional options: attachments, theme (light/dark)
     * @return EmailLog
     */
    public function send($recipient, string $subject, string $bodyOrTemplateKey, array $variables = [], array $options = []): EmailLog
    {
        // 1. Parse Recipient
        $email = is_array($recipient) ? ($recipient['email'] ?? null) : $recipient;
        $name = is_array($recipient) ? ($recipient['name'] ?? '') : '';

        if (empty($email)) {
            throw new \InvalidArgumentException("Recipient email address cannot be empty.");
        }

        // 2. Add standard variables
        $variables['name'] = $variables['name'] ?? $name ?: 'Customer';
        $variables['email'] = $variables['email'] ?? $email;
        $variables['subject'] = $variables['subject'] ?? $subject;
        $variables['logo_url'] = $variables['logo_url'] ?? config('app.url') . '/Logo Full.svg';
        $variables['unsubscribe_url'] = $variables['unsubscribe_url'] ?? config('app.url', 'http://localhost:3000') . '/newsletter/unsubscribe?email=' . urlencode($email);

        $templateKey = null;
        $body = '';

        // 3. Resolve Template or Raw HTML
        $template = $this->templateRepository->findByKey($bodyOrTemplateKey);
        if (!$template && is_string($bodyOrTemplateKey)) {
            $template = \App\Models\EmailTemplate::where('name', $bodyOrTemplateKey)->first();
        }
        if ($template) {
            $templateKey = $template->key;
            $subject = $template->compileSubject($variables);
            $body = $template->compile($variables);
            $theme = $options['theme'] ?? $template->theme ?? 'light';
        } else {
            $body = $bodyOrTemplateKey;
            // Compile variables if they exist in curly braces
            foreach ($variables as $k => $v) {
                if (is_scalar($v)) {
                    $body = str_replace(['{{ $' . $k . ' }}', '{{' . $k . '}}', '{{ ' . $k . ' }}'], (string)$v, $body);
                }
            }
            $theme = $options['theme'] ?? 'light';
        }

        // 4. Create Email Log in database (queued state)
        $emailLog = $this->logRepository->create([
            'recipient' => $email,
            'subject' => $subject,
            'template_key' => $templateKey,
            'status' => 'queued',
            'retry_count' => 0,
            'variables' => $variables,
        ]);

        // 5. Wrap body in responsive premium CSS grid layout
        if (!empty($options['skip_layout'])) {
            $trackingPixel = '<img src="' . config('app.url', 'http://localhost:8000') . '/api/public/email/track-open/' . $emailLog->id . '" width="1" height="1" style="display:none; visibility:hidden;" />';
            $wrappedBody = $body . $trackingPixel;
        } else {
            $wrappedBody = $this->wrapInPremiumLayout($body, $subject, $theme, $emailLog->id, $variables);
        }

        // Inline CSS if a <style> block is present to ensure client compatibility (e.g. Gmail)
        if (strpos($wrappedBody, '<style') !== false) {
            $wrappedBody = $this->inlineCss($wrappedBody);
        }

        // 6. Dispatch Queue Job asynchronously
        $attachments = $options['attachments'] ?? [];
        SendEmailJob::dispatch($emailLog->id, $email, $subject, $wrappedBody, $attachments);

        return $emailLog;
    }

    /**
     * Wrap email body in high-end Cureza brand layout.
     */
    protected function wrapInPremiumLayout(string $body, string $subject, string $theme, int $logId, array $variables): string
    {
        $themeClass = $theme === 'dark' ? 'dark' : 'light';
        $bgColor = $theme === 'dark' ? '#052326' : '#F8F3EF';
        $contentBg = $theme === 'dark' ? '#0A3B3F' : '#FFFFFF';
        $textColor = $theme === 'dark' ? '#F8F3EF' : '#052326';
        $borderCol = $theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
        $mutedTextColor = $theme === 'dark' ? 'rgba(248, 243, 239, 0.6)' : 'rgba(5, 35, 38, 0.6)';
        $logoUrl = $variables['logo_url'] ?? '';
        $unsubscribeUrl = $variables['unsubscribe_url'] ?? '#';

        // Transparent tracking pixel
        $trackingPixel = '<img src="' . config('app.url', 'http://localhost:8000') . '/api/public/email/track-open/' . $logId . '" width="1" height="1" style="display:none; visibility:hidden;" />';

        return "
        <!DOCTYPE html>
        <html lang=\"en\">
        <head>
            <meta charset=\"utf-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>{$subject}</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background-color: {$bgColor};
                    color: {$textColor};
                }
                .wrapper {
                    width: 100%;
                    padding: 40px 0;
                    background-color: {$bgColor};
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: {$contentBg};
                    border-radius: 8px;
                    border: 1px solid {$borderCol} !important;
                    box-shadow: none !important;
                    overflow: hidden;
                }
                .header {
                    padding: 30px;
                    text-align: center;
                    background-color: #052326;
                    border-bottom: 2px solid #D4AF37;
                }
                .logo {
                    height: 40px;
                }
                .content {
                    padding: 40px 30px;
                    line-height: 1.6;
                    font-size: 14px;
                    background-color: {$contentBg};
                }
                .footer {
                    padding: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: {$mutedTextColor};
                    background-color: " . ($theme === 'dark' ? '#072E31' : '#F3ECE6') . ";
                    border-top: 1px solid {$borderCol};
                }
                .btn {
                    display: inline-block;
                    background: linear-gradient(135deg, #F0C417 0%, #D4AF37 50%, #B8860B 100%);
                    color: #052326 !important;
                    padding: 12px 24px;
                    text-decoration: none;
                    font-weight: 600;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                    font-size: 14px;
                }
                a {
                    color: #D4AF37;
                }
            </style>
        </head>
        <body>
            <div class=\"wrapper\">
                <div class=\"container\">
                    <div class=\"header\">
                        " . (!empty($logoUrl) ? "<img src=\"{$logoUrl}\" alt=\"Cureza\" class=\"logo\">" : "<span style=\"font-size: 24px; font-weight: 600; color: #F0C417; letter-spacing: 2px;\">CUREZA</span>") . "
                    </div>
                    <div class=\"content\">
                        {$body}
                    </div>
                    <div class=\"footer\">
                        <p>&copy; " . date('Y') . " Cureza. All Rights Reserved.</p>
                        <p>Veer Nariman Rd, Fort, Mumbai 400001, MH</p>
                        <p style=\"margin-top: 15px; font-size: 10px;\">
                            You are receiving this email because you registered or subscribed at cureza.in.
                            <br>
                            <a href=\"{$unsubscribeUrl}\" style=\"color: #D4AF37; text-decoration: underline;\">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            </div>
            {$trackingPixel}
        </body>
        </html>
        ";
    }

    /**
     * Inline CSS blocks into style attributes of matching HTML elements.
     */
    protected function inlineCss(string $html): string
    {
        if (empty($html)) {
            return $html;
        }

        // Disable standard libxml errors to prevent HTML5 warning logs
        $libxmlState = libxml_use_internal_errors(true);

        $dom = new \DOMDocument();
        // Wrap in a temporary <div> to ensure a single root node for DOMDocument parsing
        $wrappedHtml = '<div>' . $html . '</div>';
        $dom->loadHTML(mb_convert_encoding($wrappedHtml, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        $xpath = new \DOMXPath($dom);

        // Find all <style> tags
        $styleNodes = $xpath->query('//style');
        $cssRules = [];

        foreach ($styleNodes as $styleNode) {
            $cssText = $styleNode->nodeValue;
            
            // Basic CSS parser: matches rules in format: selector { rules }
            preg_match_all('/([^{]+)\s*\{\s*([^}]+)\s*\}/', $cssText, $matches, PREG_SET_ORDER);
            foreach ($matches as $match) {
                $selectors = explode(',', $match[1]);
                $declarations = trim($match[2]);
                
                foreach ($selectors as $selector) {
                    $selector = trim($selector);
                    if (empty($selector) || strpos($selector, '@') !== false) {
                        continue; // Skip media queries and empty selectors
                    }
                    $cssRules[] = [
                        'selector' => $selector,
                        'declarations' => $declarations
                    ];
                }
            }
        }

        // Apply rules in order of appearance
        foreach ($cssRules as $rule) {
            $selector = $rule['selector'];
            $declarations = $rule['declarations'];

            // Convert CSS selector to XPath expression
            $xPathExpr = $this->cssToXPath($selector);
            if (!$xPathExpr) {
                continue;
            }

            try {
                $matchedElements = $xpath->query($xPathExpr);
                if ($matchedElements) {
                    foreach ($matchedElements as $element) {
                        // Skip styling the style elements or the temporary root wrapper itself
                        if ($element->nodeName === 'style' || $element->parentNode === null) {
                            continue;
                        }
                        
                        $existingStyle = $element->getAttribute('style');
                        if (!empty($existingStyle)) {
                            $existingStyle = rtrim(trim($existingStyle), ';') . '; ';
                        }
                        $cleanDeclarations = str_replace(["\r", "\n", "\t"], ' ', $declarations);
                        // Clean up extra spaces
                        $cleanDeclarations = preg_replace('/\s+/', ' ', $cleanDeclarations);

                        // Add solid background-color fallback for linear-gradient backgrounds to support Gmail
                        if (stripos($cleanDeclarations, 'linear-gradient') !== false && stripos($cleanDeclarations, 'background-color') === false) {
                            if (preg_match('/#([a-fA-F0-9]{3,6})/', $cleanDeclarations, $hexMatches)) {
                                $fallbackColor = $hexMatches[0];
                                $cleanDeclarations = 'background-color: ' . $fallbackColor . '; ' . $cleanDeclarations;
                            }
                        }

                        $element->setAttribute('style', $existingStyle . $cleanDeclarations);
                    }
                }
            } catch (\Exception $e) {
                // Ignore any invalid XPath query errors
            }
        }

        // Save the HTML of all children of our temporary wrapper div
        $result = '';
        $rootDiv = $dom->documentElement;
        if ($rootDiv) {
            foreach ($rootDiv->childNodes as $child) {
                $result .= $dom->saveHTML($child);
            }
        } else {
            $result = $dom->saveHTML();
        }

        libxml_clear_errors();
        libxml_use_internal_errors($libxmlState);

        return $result;
    }

    /**
     * Convert standard CSS selectors to XPath expressions.
     */
    protected function cssToXPath(string $selector): ?string
    {
        $selector = trim($selector);
        if (empty($selector)) {
            return null;
        }

        if ($selector === '*') {
            return '//*';
        }

        // Replace multiple spaces with a single space
        $selector = preg_replace('/\s+/', ' ', $selector);

        $parts = explode(' ', $selector);
        $xpathParts = [];

        foreach ($parts as $part) {
            if (strpos($part, '.') === 0) {
                // Class selector: .className
                $className = substr($part, 1);
                $xpathParts[] = "//*[contains(concat(' ', normalize-space(@class), ' '), ' {$className} ')]";
            } elseif (strpos($part, '#') === 0) {
                // ID selector: #idName
                $idName = substr($part, 1);
                $xpathParts[] = "//*[@id='{$idName}']";
            } elseif (preg_match('/^([a-zA-Z0-9]+)\.([a-zA-Z0-9_-]+)$/', $part, $matches)) {
                // Element and Class selector: div.className
                $elementName = $matches[1];
                $className = $matches[2];
                $xpathParts[] = "//{$elementName}[contains(concat(' ', normalize-space(@class), ' '), ' {$className} ')]";
            } elseif (preg_match('/^[a-zA-Z0-9]+$/', $part)) {
                // Element selector: div
                $xpathParts[] = "//{$part}";
            } else {
                // Unsupported selector
                return null;
            }
        }

        $finalXPath = '';
        foreach ($xpathParts as $index => $xpathPart) {
            if ($index === 0) {
                $finalXPath = $xpathPart;
            } else {
                // Descendant selector
                $cleanPart = ltrim($xpathPart, '/');
                $finalXPath .= '//' . $cleanPart;
            }
        }

        return $finalXPath;
    }
}
