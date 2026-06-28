<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Shipment;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class ShiprocketWebhookController extends Controller
{
    /**
     * Handle incoming Shiprocket Webhook updates.
     * Endpoint path: /api/v1/updates/callback (complying with no-keyword URL rules)
     */
    public function handle(Request $request)
    {
        // 1. Authenticate webhook using the X-Api-Key header
        $clientKey = $request->header('X-Api-Key');
        $serverKey = env('SHIPROCKET_WEBHOOK_TOKEN', 'cureza_secure_webhook_key_123');

        if (empty($clientKey) || $clientKey !== $serverKey) {
            Log::warning('Shiprocket Webhook Access Denied: Invalid X-Api-Key header.', [
                'received_key' => substr($clientKey ?? '', 0, 5) . '...'
            ]);
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // 2. Parse payload
        $payload = $request->all();
        Log::info('Shiprocket Webhook Payload received:', $payload);

        $awb = $payload['awb'] ?? null;
        $statusId = (int) ($payload['current_status_id'] ?? ($payload['shipment_status_id'] ?? 0));
        $statusName = strtoupper($payload['current_status'] ?? ($payload['shipment_status'] ?? ''));
        $srOrderId = $payload['sr_order_id'] ?? null;

        if (empty($awb)) {
            Log::warning('Shiprocket Webhook missing AWB number.');
            return response()->json(['success' => false, 'message' => 'Missing AWB'], 400);
        }

        // 3. Find Shipment
        $shipment = Shipment::where('tracking_number', $awb)->first();

        if (!$shipment) {
            // Fallback search by parsed order reference ID from payload
            $refOrderId = $payload['order_id'] ?? ''; // e.g. "CUR-10023-12" (orderNumber-sellerId)
            Log::info("Shipment with AWB {$awb} not found. Attempting reference search: {$refOrderId}");
            
            if (strpos($refOrderId, '-') !== false) {
                $parts = explode('-', $refOrderId);
                $sellerId = array_pop($parts);
                $orderNumber = implode('-', $parts);

                $order = Order::where('order_number', $orderNumber)->first();
                if ($order) {
                    $shipment = Shipment::where('order_id', $order->id)
                        ->where('seller_id', $sellerId)
                        ->first();
                }
            }
        }

        if (!$shipment) {
            Log::error("Shiprocket Webhook Error: Shipment not found for AWB {$awb}");
            return response()->json(['success' => false, 'message' => 'Shipment record not found'], 200); 
            // Return 200 to prevent Shiprocket from retrying invalid records indefinitely
        }

        // 4. Map Shiprocket Status Code to Cureza Internal Status
        $order = $shipment->order;
        $oldStatus = $shipment->status;
        $newShipmentStatus = null;
        $newOrderStatus = null;

        // Shiprocket Standard Status IDs:
        // 6  ➔ Shipped / AWB Assigned
        // 7  ➔ Picked Up / In Transit
        // 17 ➔ Out for Delivery
        // 21 ➔ Delivered
        // 9  ➔ RTO / Cancelled
        switch ($statusId) {
            case 6:
                $newShipmentStatus = 'pickup_scheduled';
                $newOrderStatus = 'processing';
                break;
            case 7:
                $newShipmentStatus = 'picked_up';
                $newOrderStatus = 'shipped';
                break;
            case 17:
                $newShipmentStatus = 'out_for_delivery';
                $newOrderStatus = 'out_for_delivery';
                break;
            case 21:
                $newShipmentStatus = 'delivered';
                break;
            case 9:
                $newShipmentStatus = 'cancelled';
                $newOrderStatus = 'cancelled';
                break;
            default:
                // Map based on text status in case custom status codes are sent
                if (str_contains($statusName, 'DELIVERED')) {
                    $statusId = 21;
                    $newShipmentStatus = 'delivered';
                } elseif (str_contains($statusName, 'OUT FOR DELIVERY')) {
                    $statusId = 17;
                    $newShipmentStatus = 'out_for_delivery';
                    $newOrderStatus = 'out_for_delivery';
                } elseif (str_contains($statusName, 'PICK') || str_contains($statusName, 'TRANSIT')) {
                    $statusId = 7;
                    $newShipmentStatus = 'picked_up';
                    $newOrderStatus = 'shipped';
                } elseif (str_contains($statusName, 'CANCEL') || str_contains($statusName, 'RTO')) {
                    $statusId = 9;
                    $newShipmentStatus = 'cancelled';
                    $newOrderStatus = 'cancelled';
                }
                break;
        }

        // 5. Apply transitions
        if ($newShipmentStatus && $newShipmentStatus !== $oldStatus) {
            $shipment->status = $newShipmentStatus;

            if ($newShipmentStatus === 'picked_up') {
                $shipment->shipped_at = now();
            } elseif ($newShipmentStatus === 'delivered') {
                $shipment->delivered_at = now();
                
                // For COD, mark remittance as remitted upon delivery
                if (strtolower($order->payment_method) === 'cod') {
                    $shipment->remittance_status = 'remitted';
                    $shipment->remitted_at = now();
                }
            }
            $shipment->save();
            Log::info("Shipment AWB {$awb} updated: {$oldStatus} ➔ {$newShipmentStatus}");
            
            // Log/Trigger notification templates if any
            // Event log helper can be added here
        }

        if ($order) {
            // Apply corresponding order-level status changes
            if ($newOrderStatus) {
                $order->status = $newOrderStatus;
                $order->save();
                Log::info("Order ID {$order->id} status updated to: {$newOrderStatus}");
            }

            // Custom checks for delivered shipments
            if ($newShipmentStatus === 'delivered') {
                if (strtolower($order->payment_method) === 'cod') {
                    $order->payment_status = 'paid';
                    $order->save();
                }

                // Check if ALL vendor shipments under this parent order are delivered
                $undeliveredCount = $order->shipments()->where('status', '!=', 'delivered')->count();
                if ($undeliveredCount === 0) {
                    $oldOrderStatus = $order->status;
                    $order->status = 'delivered';
                    $order->save();
                    Log::info("All shipments for Order ID {$order->id} are delivered. Order marked DELIVERED.");

                    if ($oldOrderStatus !== 'delivered') {
                        $user = $order->user;
                        if ($user) {
                            $rules = \App\Services\GamificationService::getRules();
                            $purchaseXP = $rules['xp_product_purchase'] ?? 100;
                            $pointsPer100 = $rules['points_per_100_spent'] ?? 10;
                            
                            $orderTotal = (float) ($order->total ?? 0);
                            $purchasePoints = floor($orderTotal / 100) * $pointsPer100;

                            \App\Services\GamificationService::adjustXPAndPoints(
                                $user,
                                $purchaseXP,
                                $purchasePoints,
                                "Delivered product purchase (Order #" . $order->order_number . ")",
                                'credit',
                                'order_' . $order->id
                            );

                            // Complete referral
                            \App\Services\GamificationService::completeReferral($user);
                        }
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'shipment_status' => $newShipmentStatus ?? $oldStatus,
            'order_status' => $order ? $order->status : null
        ], 200);
    }
}
