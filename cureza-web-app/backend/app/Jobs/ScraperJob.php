<?php

namespace App\Jobs;

use App\Models\ScrapedProduct;
use App\Models\ScrapingTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ScraperJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $url;
    protected $brandId;
    protected $categoryId;
    protected $depth;
    protected $taskId;
    protected $platform;

    public function __construct(string $url, ?int $brandId = null, ?int $categoryId = null, string $depth = 'single', ?int $taskId = null, string $platform = 'auto')
    {
        $this->url = $url;
        $this->brandId = $brandId;
        $this->categoryId = $categoryId;
        $this->depth = $depth;
        $this->taskId = $taskId;
        $this->platform = $platform ?: 'auto';
    }

    public function handle(): void
    {
        $task = ScrapingTask::find($this->taskId);
        if ($task) {
            $task->addLog("Starting background scraper task...");
            $task->addLog("Target URL: {$this->url}");
            $task->addLog("Depth mode: {$this->depth}");
            $task->addLog("Platform selection: " . strtoupper($this->platform));
        }

        Log::info("Starting scrape job for URL: {$this->url} on platform: {$this->platform}");

        try {
            $urlsToScrape = [$this->url];

            if ($this->depth === 'catalog') {
                if ($task) {
                    $task->addLog("Discovering links from catalog list page...");
                }
                $urlsToScrape = $this->discoverProductUrls($this->url, $task);
                if ($task) {
                    $task->addLog("Discovered " . count($urlsToScrape) . " potential product links.");
                    $task->update(['total_count' => count($urlsToScrape)]);
                }
            } else {
                if ($task) {
                    $task->update(['total_count' => 1]);
                }
            }

            if (empty($urlsToScrape)) {
                if ($task) {
                    $task->addLog("No product links were discovered from this page. Task stopped.");
                    $task->update(['status' => 'failed']);
                }
                return;
            }

            $successCount = 0;
            foreach ($urlsToScrape as $index => $productUrl) {
                if ($task) {
                    $task->refresh();
                    if ($task->status === 'cancelled') {
                        $task->addLog("Scraping task halted: Cancelled by user.");
                        return;
                    }
                }

                if ($index > 0) {
                    sleep(rand(1, 3));
                }

                if ($task) {
                    $task->addLog("Scraping page " . ($index + 1) . "/" . count($urlsToScrape) . ": $productUrl");
                }

                $success = $this->scrapeProductPage($productUrl, $task);
                if ($success) {
                    $successCount++;
                }

                if ($task) {
                    $task->increment('processed_count');
                }
            }

            if ($task) {
                // Ensure status isn't marked completed if it was cancelled during the last delay check
                $task->refresh();
                if ($task->status === 'cancelled') {
                    $task->addLog("Scraping task halted: Cancelled by user.");
                    return;
                }
                
                $task->update(['status' => 'completed']);
                $task->addLog("Scraping task completed successfully! Integrated {$successCount} drafts.");
            }

        } catch (\Exception $e) {
            if ($task) {
                $task->update(['status' => 'failed']);
                $task->addLog("Fatal Error: " . $e->getMessage());
            }
            Log::error("Failed to run scraper job: " . $e->getMessage());
        }
    }

    protected function discoverProductUrls(string $catalogUrl, ?ScrapingTask $task = null): array
    {
        $discovered = [];

        // 1. Try Sitemap scan first
        try {
            $discovered = $this->discoverProductUrlsFromSitemap($catalogUrl, $task);
        } catch (\Exception $e) {
            Log::error("Sitemap discovery exception: " . $e->getMessage());
            if ($task) {
                $task->addLog("Sitemap check failed: " . $e->getMessage());
            }
        }

        // 2. Fallback to DOM parsing if no URLs were found in sitemaps
        if (empty($discovered)) {
            if ($task) {
                $task->addLog("No product links discovered in sitemaps. Falling back to DOM catalog crawling...");
            }

            $html = $this->fetchHtml($catalogUrl, $task);
            if (!$html) return [];

            $dom = new \DOMDocument();
            @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
            $xpath = new \DOMXPath($dom);

            // Standard e-commerce selector patterns for WooCommerce, Shopify, etc.
            $queries = [
                "//a[contains(@class, 'woocommerce-loop-product__link')]/@href",
                "//a[contains(@class, 'woocommerce-LoopProduct-link')]/@href",
                "//li[contains(@class, 'product')]//a/@href",
                "//div[contains(@class, 'product')]//a/@href",
                "//a[contains(@class, 'product')]/@href",
                "//a[contains(@href, '/product/')]/@href",
                "//a[contains(@href, '/products/')]/@href",
                "//a[contains(@class, 'grid-view-item__link')]/@href"
            ];

            foreach ($queries as $query) {
                $nodes = $xpath->query($query);
                foreach ($nodes as $node) {
                    $url = $node->nodeValue;
                    // Normalize URL
                    if (str_starts_with($url, '/')) {
                        $parsedUrl = parse_url($catalogUrl);
                        $url = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? '') . $url;
                    }
                    if (filter_var($url, FILTER_VALIDATE_URL) && !in_array($url, $discovered)) {
                        if ($this->isValidProductUrl($url)) {
                            $discovered[] = $url;
                        }
                    }
                }
            }
        }

        // Limit catalog depth discovery to 100 items to keep it clean and fast
        return array_slice($discovered, 0, 100);
    }

    protected function discoverProductUrlsFromSitemap(string $baseUrl, ?ScrapingTask $task = null): array
    {
        $parsed = parse_url($baseUrl);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';
        if (empty($host)) {
            return [];
        }
        $domainUrl = "{$scheme}://{$host}";

        // Candidate sitemap files/paths to search
        $sitemapPaths = [
            '/product-sitemap.xml',
            '/sitemap_index.xml',
            '/wp-sitemap.xml',
            '/wp-sitemap-posts-product-1.xml',
            '/sitemap-products.xml',
            '/sitemap.xml'
        ];

        $discoveredUrls = [];

        foreach ($sitemapPaths as $path) {
            $sitemapUrl = $domainUrl . $path;
            if ($task) {
                $task->addLog("Checking sitemap: {$sitemapUrl}");
            }
            Log::info("Checking sitemap: {$sitemapUrl}");

            $xmlContent = $this->fetchHtml($sitemapUrl, $task);
            if (!$xmlContent) {
                continue;
            }

            // Simple XML/regex parsing of <loc> tags
            preg_match_all('/<loc>(https?:\/\/[^<]+)<\/loc>/i', $xmlContent, $matches);
            if (empty($matches[1])) {
                continue;
            }

            $locs = array_map('trim', $matches[1]);
            
            // Check if this sitemap is an index sitemap (contains links to other sitemaps)
            $subSitemaps = [];
            foreach ($locs as $loc) {
                if (str_contains($loc, '.xml')) {
                    if (str_contains($loc, 'product') || str_contains($loc, 'sitemap-products')) {
                        $subSitemaps[] = $loc;
                    }
                }
            }

            if (!empty($subSitemaps)) {
                if ($task) {
                    $task->addLog("Sitemap index found. Sub-sitemaps: " . count($subSitemaps));
                }
                foreach ($subSitemaps as $subSitemap) {
                    if ($task) {
                        $task->addLog("Fetching sub-sitemap: {$subSitemap}");
                    }
                    $subXmlContent = $this->fetchHtml($subSitemap, $task);
                    if ($subXmlContent) {
                        preg_match_all('/<loc>(https?:\/\/[^<]+)<\/loc>/i', $subXmlContent, $subMatches);
                        if (!empty($subMatches[1])) {
                            foreach ($subMatches[1] as $prodLoc) {
                                $prodLoc = trim($prodLoc);
                                if (!str_contains($prodLoc, '.xml') && $this->isValidProductUrl($prodLoc)) {
                                    $discoveredUrls[] = $prodLoc;
                                }
                            }
                        }
                    }
                }
            } else {
                foreach ($locs as $loc) {
                    if (!str_contains($loc, '.xml') && $this->isValidProductUrl($loc)) {
                        $discoveredUrls[] = $loc;
                    }
                }
            }

            if (!empty($discoveredUrls)) {
                $discoveredUrls = array_values(array_unique($discoveredUrls));
                if ($task) {
                    $task->addLog("Success: Discovered " . count($discoveredUrls) . " URLs via sitemap {$path}.");
                }
                break;
            }
        }

        return $discoveredUrls;
    }

    protected function isValidProductUrl(string $url): bool
    {
        if (str_ends_with($url, '.xml') || str_contains($url, '.xml?')) {
            return false;
        }

        $excl = [
            '/product-category/', '/category/', '/product-tag/', '/tag/',
            '/cart/', '/checkout/', '/my-account/', '/wp-json/', '?wc-ajax=',
            '/about/', '/contact/', '/blog/', '/news/', '/wp-content/', '/wp-includes/'
        ];

        foreach ($excl as $pattern) {
            if (str_contains($url, $pattern)) {
                return false;
            }
        }

        $parsed = parse_url($url);
        $path = trim($parsed['path'] ?? '', '/');
        if (empty($path)) {
            return false;
        }

        if ($path === 'shop' || $path === 'store' || $path === 'cbd-store' || $path === 'cbd-store/page/2') {
            return false;
        }

        return true;
    }

    protected function scrapeProductPage(string $productUrl, ?ScrapingTask $task = null): bool
    {
        $isShopify = $this->platform === 'shopify' || ($this->platform === 'auto' && str_contains($productUrl, '/products/'));

        // 1. Check if it's a Shopify URL and attempt direct JSON integration
        if ($isShopify) {
            try {
                $jsonUrl = $productUrl;
                if (!str_ends_with($productUrl, '.js')) {
                    $cleanUrl = strtok($productUrl, '?');
                    $jsonUrl = rtrim($cleanUrl, '/') . '.js';
                }

                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->withoutVerifying()
                ->timeout(15)
                ->get($jsonUrl);

                if ($response->ok()) {
                    $shopifyData = $response->json();
                    if ($shopifyData && isset($shopifyData['title'])) {
                        if ($task) {
                            $task->addLog("Shopify platform detected. Parsing raw JSON details directly.");
                        }

                        $images = [];
                        if (isset($shopifyData['images'])) {
                            foreach ($shopifyData['images'] as $img) {
                                if (str_starts_with($img, '//')) {
                                    $img = 'https:' . $img;
                                }
                                $images[] = $img;
                            }
                        }

                        $price = null;
                        if (isset($shopifyData['price'])) {
                            $price = floatval($shopifyData['price']) / 100.0;
                        } elseif (isset($shopifyData['variants'][0]['price'])) {
                            $vPrice = $shopifyData['variants'][0]['price'];
                            $price = str_contains($vPrice, '.') ? floatval($vPrice) : floatval($vPrice) / 100.0;
                        }

                        $productData = [
                            'source_url' => $productUrl,
                            'title' => trim(html_entity_decode($shopifyData['title'])),
                            'price' => $price,
                            'description' => isset($shopifyData['description']) ? trim(strip_tags(html_entity_decode($shopifyData['description']))) : null,
                            'images' => $images,
                            'sku' => $shopifyData['variants'][0]['sku'] ?? null,
                            'status' => 'pending',
                            'brand_id' => $this->brandId,
                            'category_id' => $this->categoryId,
                        ];

                        ScrapedProduct::create($productData);
                        if ($task) {
                            $task->addLog("Success (Shopify JSON): Parsed \"{$productData['title']}\" (Price: ₹" . ($productData['price'] ?: 'N/A') . ")");
                        }
                        return true;
                    }
                }
            } catch (\Exception $e) {
                Log::info("Shopify JSON API attempt failed, falling back to HTML parsing: " . $e->getMessage());
            }
        }

        // 2. Standard HTML Scraping fallbacks
        $html = $this->fetchHtml($productUrl, $task);
        if (!$html) {
            if ($task) {
                $task->addLog("Failed: Page content is empty or server rejected request.");
            }
            return false;
        }

        // Parse HTML
        $dom = new \DOMDocument();
        @$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
        $xpath = new \DOMXPath($dom);

        $productData = [
            'source_url' => $productUrl,
            'title' => null,
            'price' => null,
            'description' => null,
            'images' => [],
            'sku' => null,
            'status' => 'pending',
            'brand_id' => $this->brandId,
            'category_id' => $this->categoryId,
        ];

        // 2.1 JSON-LD Schema
        $jsonLdNodes = $xpath->query("//script[@type='application/ld+json']");
        foreach ($jsonLdNodes as $node) {
            $data = json_decode($node->nodeValue, true);
            if ($data) {
                $productSchema = $this->findProductSchema($data);
                if ($productSchema) {
                    $productData['title'] = $productSchema['name'] ?? null;
                    $productData['description'] = $productSchema['description'] ?? null;
                    
                    if (isset($productSchema['offers'])) {
                        $offers = $productSchema['offers'];
                        if (isset($offers['price'])) {
                            $productData['price'] = floatval($offers['price']);
                        } elseif (is_array($offers) && isset($offers[0]['price'])) {
                            $productData['price'] = floatval($offers[0]['price']);
                        }
                    }

                    if (isset($productSchema['image'])) {
                        $images = is_array($productSchema['image']) ? $productSchema['image'] : [$productSchema['image']];
                        $productData['images'] = array_map(function($img) {
                            return is_array($img) ? ($img['url'] ?? '') : $img;
                        }, $images);
                    }

                    $productData['sku'] = $productSchema['sku'] ?? $productSchema['mpn'] ?? null;
                    break;
                }
            }
        }

        // 2.2 OpenGraph Meta & WooCommerce Specific Title
        if (empty($productData['title'])) {
            $productData['title'] = $xpath->query("//h1[contains(@class, 'product_title')] | //h1[contains(@class, 'product-title')]")->item(0)?->nodeValue;
        }

        if (empty($productData['title'])) {
            $productData['title'] = $this->getMetaContent($xpath, 'og:title') ?: $this->getMetaContent($xpath, 'twitter:title') ?: $xpath->query('//title')->item(0)?->nodeValue;
        }

        // WooCommerce Specific Description check
        if (empty($productData['description'])) {
            $descNode = $xpath->query("//div[@id='tab-description'] | //div[contains(@class, 'woocommerce-Tabs-panel--description')] | //div[contains(@class, 'woocommerce-product-details__short-description')]")->item(0);
            if ($descNode) {
                $productData['description'] = trim($descNode->nodeValue);
            }
        }

        if (empty($productData['description'])) {
            $productData['description'] = $this->getMetaContent($xpath, 'og:description') ?: $this->getMetaContent($xpath, 'description');
        }

        // WooCommerce Sale & Regular Price check
        if (empty($productData['price'])) {
            $wooPriceNode = $xpath->query("//p[contains(@class, 'price')]//ins//span[contains(@class, 'amount')] | //*[contains(@class, 'price')]//ins | //span[contains(@class, 'woocommerce-Price-amount')]")->item(0);
            if ($wooPriceNode) {
                $priceStr = $wooPriceNode->nodeValue;
            } else {
                $priceStr = $this->getMetaContent($xpath, 'product:price:amount') ?: $this->getMetaContent($xpath, 'og:price:amount');
            }

            if ($priceStr) {
                $cleanPrice = str_replace([',', '₹', '$', '£', '€'], '', $priceStr);
                preg_match('/\d+([.]\d+)?/', $cleanPrice, $matches);
                if (!empty($matches)) {
                    $productData['price'] = floatval($matches[0]);
                }
            }
        }

        if (empty($productData['price'])) {
            $priceText = $xpath->query("//span[contains(@class, 'price')] | //p[contains(@class, 'price')] | //*[contains(@class, 'current-price')]")->item(0)?->nodeValue;
            if ($priceText) {
                $cleanPrice = str_replace([',', '₹', '$', '£', '€'], '', $priceText);
                preg_match('/\d+([.]\d+)?/', $cleanPrice, $matches);
                if (!empty($matches)) {
                    $productData['price'] = floatval($matches[0]);
                }
            }
        }

        // WooCommerce Image Gallery links first
        $wooGalleryLinks = $xpath->query("//div[contains(@class, 'woocommerce-product-gallery')]//a/@href | //div[contains(@class, 'woocommerce-product-gallery')]//img");
        foreach ($wooGalleryLinks as $node) {
            $src = null;
            if ($node->nodeName === 'href') {
                $src = $node->nodeValue;
            } elseif ($node->nodeName === 'img') {
                $src = $node->getAttribute('data-large_image') ?: $node->getAttribute('data-src') ?: $node->getAttribute('src');
            }

            if ($src) {
                if (str_starts_with($src, '/')) {
                    $parsedUrl = parse_url($productUrl);
                    $src = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? '') . $src;
                }
                if (filter_var($src, FILTER_VALIDATE_URL) && !in_array($src, $productData['images'])) {
                    if (!str_contains($src, 'logo') && !str_contains($src, 'icon') && !str_contains($src, 'lazy.svg')) {
                        $productData['images'][] = $src;
                    }
                }
            }
        }

        if (empty($productData['images'])) {
            $ogImage = $this->getMetaContent($xpath, 'og:image');
            if ($ogImage) {
                $productData['images'][] = $ogImage;
            }
        }

        // 2.4 Try to extract image gallery from DOM img attributes
        if (empty($productData['images'])) {
            $imageContainers = [
                "//div[contains(@class, 'product-gallery')]//img",
                "//div[contains(@class, 'woocommerce-product-gallery')]//img",
                "//div[contains(@class, 'product-images')]//img",
                "//div[contains(@class, 'product__photo')]//img",
                "//div[contains(@id, 'slider')]//img",
                "//div[contains(@class, 'gallery')]//img",
                "//img[contains(@class, 'product-gallery')]",
                "//img[contains(@class, 'attachment-shop_single')]"
            ];

            foreach ($imageContainers as $imgQuery) {
                $imgNodes = $xpath->query($imgQuery);
                foreach ($imgNodes as $imgNode) {
                    $src = $imgNode->getAttribute('src') ?: $imgNode->getAttribute('data-src') ?: $imgNode->getAttribute('data-lazy-src') ?: $imgNode->getAttribute('data-origin');
                    if ($src) {
                        if (str_starts_with($src, '/')) {
                            $parsedUrl = parse_url($productUrl);
                            $src = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? '') . $src;
                        }
                        if (filter_var($src, FILTER_VALIDATE_URL) && !in_array($src, $productData['images'])) {
                            if (!str_contains($src, 'logo') && !str_contains($src, 'icon') && !str_contains($src, 'badge')) {
                                $productData['images'][] = $src;
                            }
                        }
                    }
                }
            }
        }

        // Final generic image extract if still absolutely empty
        if (empty($productData['images'])) {
            $imgs = $xpath->query("//img");
            foreach ($imgs as $imgNode) {
                $src = $imgNode->getAttribute('src') ?: $imgNode->getAttribute('data-src');
                if ($src) {
                    if (str_starts_with($src, '/')) {
                        $parsedUrl = parse_url($productUrl);
                        $src = ($parsedUrl['scheme'] ?? 'https') . '://' . ($parsedUrl['host'] ?? '') . $src;
                    }
                    if (filter_var($src, FILTER_VALIDATE_URL) && !in_array($src, $productData['images'])) {
                        if (str_contains($src, '/products/') || str_contains($src, '/uploads/') || str_contains($src, '/wp-content/')) {
                            $productData['images'][] = $src;
                        }
                    }
                }
            }
        }

        // Final cleanup & save
        if ($productData['title']) {
            $productData['title'] = trim(html_entity_decode($productData['title']));
            if ($productData['description']) {
                $productData['description'] = trim(strip_tags(html_entity_decode($productData['description'])));
            }

            // Remove duplicates and limit to 10 images max to save database payload space
            $productData['images'] = array_slice(array_unique($productData['images']), 0, 10);

            ScrapedProduct::create($productData);
            if ($task) {
                $task->addLog("Success: Parsed \"{$productData['title']}\" (Price: ₹" . ($productData['price'] ?: 'N/A') . ") with " . count($productData['images']) . " image(s).");
            }
            return true;
        } else {
            if ($task) {
                $task->addLog("Failed: Page did not contain valid e-commerce product title or schema structures.");
            }
            return false;
        }
    }

    protected function findProductSchema(array $data): ?array
    {
        if (isset($data['@type']) && $data['@type'] === 'Product') {
            return $data;
        }
        if (isset($data['@graph']) && is_array($data['@graph'])) {
            foreach ($data['@graph'] as $item) {
                if (isset($item['@type']) && $item['@type'] === 'Product') {
                    return $item;
                }
            }
        }
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $found = $this->findProductSchema($value);
                if ($found) return $found;
            }
        }
        return null;
    }

    protected function getMetaContent(\DOMXPath $xpath, string $property): ?string
    {
        $node = $xpath->query("//meta[@property='{$property}']/@content | //meta[@name='{$property}']/@content")->item(0);
        return $node ? $node->nodeValue : null;
    }

    protected function fetchHtml(string $url, ?ScrapingTask $task = null): ?string
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.5',
            ])
            ->withoutVerifying()
            ->timeout(25)
            ->get($url);

            if ($response->ok()) {
                return $response->body();
            }

            $errMsg = "HTTP Status Code " . $response->status();
            if ($task) {
                $task->addLog("Warning: Server returned status {$response->status()} for URL {$url}");
            }
            Log::warning("Scraper HTTP fail: {$errMsg} on {$url}");
            return null;
        } catch (\Exception $e) {
            $errMsg = $e->getMessage();
            if ($task) {
                $task->addLog("Connection Error: " . $errMsg);
            }
            Log::warning("Scraper Exception: {$errMsg} on {$url}");
            return null;
        }
    }
}
