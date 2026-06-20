<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GstinVerificationService
{
    /**
     * Verify a GSTIN structural pattern and retrieve business details
     *
     * @param string $gstin
     * @return array
     */
    public function verify($gstin)
    {
        $gstin = strtoupper(trim($gstin));
        
        // 1. Structural Regex Validation (15 digit alphanumeric Indian GSTIN pattern)
        $pattern = '/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/';
        if (!preg_match($pattern, $gstin)) {
            return [
                'success' => false,
                'message' => 'Invalid GSTIN structure/pattern.',
                'data' => null
            ];
        }

        // 2. Swappable REST API lookup. If no third-party API key is configured,
        // it falls back to a sandbox validation representing structural approval.
        $apiKey = config('services.gstin.api_key');
        
        if (empty($apiKey) || $apiKey === 'mock') {
            // Free Sandbox fallback verification
            Log::info("Mock GSTIN verification triggered for {$gstin}");
            return [
                'success' => true,
                'message' => 'GSTIN pattern matches successfully (Sandbox Mode).',
                'data' => [
                    'gstin' => $gstin,
                    'trade_name' => 'Verified Sandbox Vendor Ltd',
                    'legal_name' => 'Verified Sandbox Vendor Private Limited',
                    'state_code' => substr($gstin, 0, 2),
                    'status' => 'Active',
                    'taxpayer_type' => 'Regular taxpayer',
                    'address' => '12, Wellness Street, Health City, Rajasthan, 302001'
                ]
            ];
        }

        try {
            // Placeholder/Integrator structure for third-party REST validation services (e.g. Cashfree or Sandbox API)
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Accept' => 'application/json'
            ])->get("https://api.sandbox.co.in/gstin/{$gstin}");

            if ($response->successful()) {
                $body = $response->json();
                return [
                    'success' => true,
                    'message' => 'GSTIN verified successfully from registry.',
                    'data' => [
                        'gstin' => $gstin,
                        'trade_name' => $body['data']['tradeName'] ?? $body['data']['legalName'] ?? 'N/A',
                        'legal_name' => $body['data']['legalName'] ?? 'N/A',
                        'state_code' => substr($gstin, 0, 2),
                        'status' => $body['data']['status'] ?? 'Active',
                        'taxpayer_type' => $body['data']['taxpayerType'] ?? 'Regular',
                        'address' => $body['data']['address'] ?? 'N/A'
                    ]
                ];
            }

            return [
                'success' => false,
                'message' => 'GSTIN lookup failed from registry service: ' . $response->reason(),
                'data' => null
            ];
        } catch (\Exception $e) {
            Log::error("GSTIN verification exception: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error communicating with GSTIN verification provider.',
                'data' => null
            ];
        }
    }
}
