<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ShiprocketService
{
    protected $baseUrl;
    protected $email;
    protected $password;
    protected $apiKey;
    protected $isMock;
    protected $isSandbox;

    public function __construct()
    {
        $this->email = env('SHIPROCKET_API_EMAIL');
        $this->password = env('SHIPROCKET_API_PASSWORD');
        $this->apiKey = env('SHIPROCKET_API_KEY');
        $this->isMock = filter_var(env('SHIPROCKET_MOCK', true), FILTER_VALIDATE_BOOLEAN);
        $this->isSandbox = filter_var(env('SHIPROCKET_SANDBOX', false), FILTER_VALIDATE_BOOLEAN);

        // Standard API URLs
        $this->baseUrl = $this->isSandbox 
            ? 'https://sandbox.shiprocket.co/v1/external' 
            : 'https://api.shiprocket.in/v1/external';
    }

    /**
     * Authenticate and get Bearer Token.
     * Caches token to avoid redundant login API calls (valid for 24h).
     */
    public function authenticate()
    {
        if ($this->isMock) {
            return 'mock_jwt_token_cureza_123456';
        }

        return Cache::remember('shiprocket_bearer_token', 86000, function () {
            try {
                Log::info('Attempting to authenticate with Shiprocket API...');
                $response = Http::post("{$this->baseUrl}/auth/login", [
                    'email' => $this->email,
                    'password' => $this->password
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    Log::info('Shiprocket authentication successful.');
                    return $data['token'] ?? null;
                }

                Log::error('Shiprocket Authentication Failed: ' . $response->body());
                return null;
            } catch (\Exception $e) {
                Log::error('Shiprocket Auth Exception: ' . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Get headers for authenticated requests.
     */
    protected function getHeaders()
    {
        $token = $this->authenticate();
        return [
            'Content-Type' => 'application/json',
            'Authorization' => "Bearer {$token}"
        ];
    }

    /**
     * Register a new Seller pickup location in Shiprocket.
     */
    public function createPickupAddress(array $data)
    {
        if ($this->isMock) {
            return [
                'success' => true,
                'pickup_location' => $data['pickup_location'] ?? 'seller_pickup_point',
                'location_id' => rand(100000, 999999),
                'message' => 'Pickup location registered successfully (MOCK).'
            ];
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/pickup/address", $data);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Shiprocket Create Pickup Address failed: ' . $response->body());
            return ['success' => false, 'error' => $response->json()];
        } catch (\Exception $e) {
            Log::error('Shiprocket Create Pickup Address exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Check Pincode Serviceability & Courier Rates.
     */
    public function checkServiceability($fromPincode, $toPincode, $weight, $cod = false)
    {
        if ($this->isMock) {
            // Simulated rate card matching Shiprocket specs
            return [
                'success' => true,
                'data' => [
                    'available_couriers' => [
                        [
                            'courier_company_id' => 10,
                            'courier_name' => 'Delhivery Express',
                            'rate' => 65.00 + ($weight * 15.00),
                            'etd' => now()->addDays(2)->format('Y-m-d'),
                            'cod' => 1
                        ],
                        [
                            'courier_company_id' => 12,
                            'courier_name' => 'BlueDart Premium',
                            'rate' => 95.00 + ($weight * 25.00),
                            'etd' => now()->addDays(1)->format('Y-m-d'),
                            'cod' => 1
                        ],
                        [
                            'courier_company_id' => 14,
                            'courier_name' => 'Xpressbees Surface',
                            'rate' => 50.00 + ($weight * 10.00),
                            'etd' => now()->addDays(4)->format('Y-m-d'),
                            'cod' => $cod ? 1 : 0
                        ]
                    ]
                ]
            ];
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->get("{$this->baseUrl}/courier/serviceability", [
                    'pickup_postcode' => $fromPincode,
                    'delivery_postcode' => $toPincode,
                    'weight' => $weight,
                    'cod' => $cod ? 1 : 0
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            Log::error('Shiprocket Serviceability check failed: ' . $response->body());
            return ['success' => false, 'error' => $response->json()];
        } catch (\Exception $e) {
            Log::error('Shiprocket Serviceability exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Create shipment / order in Shiprocket.
     */
    public function createOrder(Order $order, $sellerId, $weight, $dimensions = [])
    {
        $sellerItems = $order->items()->where('seller_id', $sellerId)->get();
        if ($sellerItems->isEmpty()) {
            return ['success' => false, 'error' => 'No items found for this seller.'];
        }

        // Get shipping address details
        $shipping = $order->shipping_address_json;
        $sellerProfile = \App\Models\SellerProfile::where('user_id', $sellerId)->first();
        $pickupNickname = $sellerProfile ? 'seller_loc_' . $sellerProfile->id : 'default_pickup_location';

        $orderItemsPayload = [];
        foreach ($sellerItems as $item) {
            $orderItemsPayload[] = [
                'name' => $item->product_name,
                'sku' => $item->product ? $item->product->sku : 'SKU-' . $item->product_id,
                'units' => (int) $item->quantity,
                'selling_price' => (float) $item->price,
                'discount' => 0.0,
                'tax' => (float) $item->gst_amount
            ];
        }

        $payload = [
            'order_id' => $order->order_number . '-' . $sellerId, // Sub-order number uniquely identified
            'order_date' => $order->created_at->format('Y-m-d H:i'),
            'pickup_location' => $pickupNickname,
            'channel_id' => '',
            'comment' => $order->order_notes ?? 'Cureza Marketplace Order',
            'billing_customer_name' => $shipping['name'] ?? $order->user->name ?? 'Guest Customer',
            'billing_last_name' => '',
            'billing_address' => $shipping['address'] ?? $shipping['line'] ?? 'N/A',
            'billing_address_2' => '',
            'billing_city' => $shipping['city'] ?? 'N/A',
            'billing_pincode' => $shipping['pincode'] ?? $shipping['zip'] ?? 'N/A',
            'billing_state' => $shipping['state'] ?? 'N/A',
            'billing_country' => 'India',
            'billing_email' => $order->user->email ?? 'customer@cureza.in',
            'billing_phone' => $shipping['phone'] ?? $order->user->phone ?? '0000000000',
            'shipping_is_billing' => true,
            'order_items' => $orderItemsPayload,
            'payment_method' => strtoupper($order->payment_method) === 'COD' ? 'COD' : 'Prepaid',
            'sub_total' => (float) $sellerItems->sum('total'),
            'length' => (int) ($dimensions['l'] ?? 10),
            'width' => (int) ($dimensions['w'] ?? 10),
            'height' => (int) ($dimensions['h'] ?? 10),
            'weight' => (float) $weight
        ];

        if ($this->isMock) {
            return [
                'success' => true,
                'order_id' => rand(1000000, 9999999),
                'shipment_id' => rand(10000000, 99999999),
                'status' => 'NEW',
                'message' => 'Shiprocket mock order created.'
            ];
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/orders/create/adhoc", $payload);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'order_id' => $data['order_id'] ?? null,
                    'shipment_id' => $data['shipment_id'] ?? null,
                    'status' => $data['status'] ?? null,
                    'response' => $data
                ];
            }

            Log::error('Shiprocket Create Order failed: ' . $response->body());
            return ['success' => false, 'error' => $response->json()];
        } catch (\Exception $e) {
            Log::error('Shiprocket Create Order exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Assign AWB and generate Tracking Code.
     */
    public function assignAWB($shipmentId, $courierCompanyId = null)
    {
        if ($this->isMock) {
            return [
                'success' => true,
                'awb_code' => 'SRK' . rand(100000000, 999999999) . 'IN',
                'courier_name' => $courierCompanyId == 12 ? 'BlueDart Premium' : 'Delhivery Express',
                'courier_company_id' => $courierCompanyId ?? 10
            ];
        }

        try {
            $payload = ['shipment_id' => $shipmentId];
            if ($courierCompanyId) {
                $payload['courier_company_id'] = $courierCompanyId;
            }

            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/courier/assign/awb", $payload);

            if ($response->successful()) {
                $data = $response->json();
                $awbData = $data['response']['data'] ?? [];
                return [
                    'success' => true,
                    'awb_code' => $awbData['awb_code'] ?? null,
                    'courier_name' => $awbData['courier_name'] ?? 'Shiprocket Courier',
                    'courier_company_id' => $awbData['courier_company_id'] ?? null
                ];
            }

            Log::error('Shiprocket Assign AWB failed: ' . $response->body());
            return ['success' => false, 'error' => $response->json()];
        } catch (\Exception $e) {
            Log::error('Shiprocket Assign AWB exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Schedule pickup request.
     */
    public function schedulePickup($shipmentId, $pickupDate = null)
    {
        if ($this->isMock) {
            return [
                'success' => true,
                'pickup_scheduled_date' => $pickupDate ?? now()->addDay()->format('Y-m-d')
            ];
        }

        try {
            $payload = [
                'shipment_id' => [$shipmentId],
                'pickup_date' => [$pickupDate ?? now()->addDay()->format('Y-m-d')]
            ];

            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/courier/generate/pickup", $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'response' => $response->json()
                ];
            }

            Log::error('Shiprocket Schedule Pickup failed: ' . $response->body());
            return ['success' => false, 'error' => $response->json()];
        } catch (\Exception $e) {
            Log::error('Shiprocket Schedule Pickup exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Fetch Printable Label PDF URL.
     */
    public function getLabelUrl($shipmentId)
    {
        if ($this->isMock) {
            return 'https://cureza-mocks.s3.ap-south-1.amazonaws.com/labels/mock-shipping-label.pdf';
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/shipments/labels", [
                    'shipment_id' => [$shipmentId]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['label_url'] ?? null;
            }

            Log::error('Shiprocket Get Label URL failed: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Shiprocket Get Label URL exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Fetch printable Manifest PDF.
     */
    public function getManifestUrl($shipmentId)
    {
        if ($this->isMock) {
            return 'https://cureza-mocks.s3.ap-south-1.amazonaws.com/manifests/mock-manifest.pdf';
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/manifests/generate", [
                    'shipment_id' => [$shipmentId]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['manifest_url'] ?? null;
            }

            Log::error('Shiprocket Get Manifest URL failed: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('Shiprocket Get Manifest URL exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Direct tracking details fetch (on-demand pull).
     */
    public function trackByAwb($awbCode)
    {
        if ($this->isMock) {
            return [
                'success' => true,
                'tracking_data' => [
                    'awb' => $awbCode,
                    'current_status' => 'IN TRANSIT',
                    'etd' => now()->addDays(2)->format('Y-m-d')
                ]
            ];
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->get("{$this->baseUrl}/shipments/track/awb/{$awbCode}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'tracking_data' => $response->json()
                ];
            }

            Log::error("Shiprocket Track AWB {$awbCode} failed: " . $response->body());
            return ['success' => false, 'error' => $response->json()];
        } catch (\Exception $e) {
            Log::error("Shiprocket Track AWB {$awbCode} exception: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
