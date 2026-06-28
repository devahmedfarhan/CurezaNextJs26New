<?php

namespace App\Services\Communication;

use App\Models\Subscriber;
use App\Services\Communication\CommunicationService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class NewsletterService
{
    protected $communicationService;

    public function __construct(CommunicationService $communicationService)
    {
        $this->communicationService = $communicationService;
    }

    /**
     * Subscribe a user. If double opt-in is enabled, send verification link.
     */
    public function subscribe(string $email, string $name = null, array $tags = [], array $segments = [], bool $requireDoubleOptIn = true): Subscriber
    {
        $subscriber = Subscriber::where('email', $email)->first();

        // Generate token for opt-in verification
        $token = Str::random(40);

        if ($subscriber) {
            // Merge tags and segments
            $existingTags = $subscriber->tags ?? [];
            $existingSegments = $subscriber->segments ?? [];

            $subscriber->update([
                'name' => $name ?: $subscriber->name,
                'tags' => array_unique(array_merge($existingTags, $tags)),
                'segments' => array_unique(array_merge($existingSegments, $segments)),
                // If they are unsubscribed or pending, reset their opt-in verification token
                'double_opt_in_token' => $requireDoubleOptIn ? $token : null,
                'status' => $requireDoubleOptIn ? 'pending' : 'subscribed',
            ]);
        } else {
            $subscriber = Subscriber::create([
                'email' => $email,
                'name' => $name,
                'status' => $requireDoubleOptIn ? 'pending' : 'subscribed',
                'double_opt_in_token' => $requireDoubleOptIn ? $token : null,
                'tags' => $tags,
                'segments' => $segments,
            ]);
        }

        if ($requireDoubleOptIn && $subscriber->status === 'pending') {
            $this->sendDoubleOptInVerification($subscriber);
        }

        return $subscriber;
    }

    /**
     * Verify double opt-in.
     */
    public function verifyOptIn(string $token): ?Subscriber
    {
        $subscriber = Subscriber::where('double_opt_in_token', $token)->first();
        if ($subscriber) {
            $subscriber->update([
                'status' => 'subscribed',
                'double_opt_in_token' => null,
                'double_opt_in_verified_at' => now(),
            ]);
            return $subscriber;
        }
        return null;
    }

    /**
     * Unsubscribe user.
     */
    public function unsubscribe(string $email): bool
    {
        $subscriber = Subscriber::where('email', $email)->first();
        if ($subscriber) {
            $subscriber->update([
                'status' => 'unsubscribed'
            ]);
            return true;
        }
        return false;
    }

    /**
     * Import newsletter subscribers from a CSV file.
     */
    public function importCSV(string $filePath): array
    {
        $importedCount = 0;
        $failedCount = 0;

        if (($handle = fopen($filePath, 'r')) !== false) {
            // Read header
            $header = fgetcsv($handle);
            
            // Map header indexes
            $emailIdx = array_search('email', $header) !== false ? array_search('email', $header) : 0;
            $nameIdx = array_search('name', $header) !== false ? array_search('name', $header) : 1;
            $tagsIdx = array_search('tags', $header) !== false ? array_search('tags', $header) : 2;
            $segmentsIdx = array_search('segments', $header) !== false ? array_search('segments', $header) : 3;

            while (($row = fgetcsv($handle)) !== false) {
                try {
                    $email = trim($row[$emailIdx] ?? '');
                    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        $failedCount++;
                        continue;
                    }

                    $name = trim($row[$nameIdx] ?? '') ?: null;
                    
                    // Parse tags and segments
                    $tagsStr = $row[$tagsIdx] ?? '';
                    $tags = !empty($tagsStr) ? array_map('trim', explode(',', $tagsStr)) : [];
                    
                    $segmentsStr = $row[$segmentsIdx] ?? '';
                    $segments = !empty($segmentsStr) ? array_map('trim', explode(',', $segmentsStr)) : [];

                    // Fast import without double opt-in validation
                    $this->subscribe($email, $name, $tags, $segments, false);
                    $importedCount++;
                } catch (\Exception $e) {
                    Log::error("CSV import error on row: " . json_encode($row) . ". Error: " . $e->getMessage());
                    $failedCount++;
                }
            }
            fclose($handle);
        }

        return [
            'imported' => $importedCount,
            'failed' => $failedCount,
        ];
    }

    /**
     * Send Double Opt-in verification email.
     */
    protected function sendDoubleOptInVerification(Subscriber $subscriber)
    {
        $verificationUrl = config('app.url', 'http://localhost:3000') . '/newsletter/verify?token=' . $subscriber->double_opt_in_token;

        $variables = [
            'name' => $subscriber->name ?: 'Wellness Explorer',
            'email' => $subscriber->email,
            'verification_link' => $verificationUrl,
        ];

        // Send template or raw HTML fallback
        $this->communicationService->send(
            $subscriber->email,
            'Please verify your Cureza subscription',
            'newsletter.double_opt_in',
            $variables
        );
    }
}
