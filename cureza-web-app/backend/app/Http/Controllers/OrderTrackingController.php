<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class OrderTrackingController extends Controller
{
    public function track($id)
    {
        // Fetch order by id or order number
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        // Guest / Auth check: If order belongs to a user, check permission
        $user = Auth::guard('sanctum')->user();
        if ($order->user_id !== null) {
            if (!$user || ($user->id !== $order->user_id && !in_array($user->role, ['admin', 'super_admin', 'vendor']))) {
                return response()->json(['message' => 'Unauthorized to track this order.'], 403);
            }
        }

        // Check if there is a courier shipment
        $shipment = \App\Models\Shipment::where('order_id', $order->id)->first();

        // Define standard steps
        $steps = [
            ['status' => 'placed', 'label' => 'Order Placed', 'icon' => 'Package'],
            ['status' => 'processing', 'label' => 'Processing & Packed', 'icon' => 'Loader'],
            ['status' => 'shipped', 'label' => 'Shipped', 'icon' => 'Truck'],
            ['status' => 'out_for_delivery', 'label' => 'Out for Delivery', 'icon' => 'MapPin'],
            ['status' => 'delivered', 'label' => 'Delivered', 'icon' => 'CheckCircle'],
        ];

        // Map status to progress index
        $currentStatusIndex = 0;
        $statusSource = $shipment ? $shipment->status : $order->status;

        switch ($statusSource) {
            case 'pending':
            case 'placed':
                $currentStatusIndex = 0; 
                break;
            case 'processing':
            case 'pickup_scheduled':
                $currentStatusIndex = 1;
                break;
            case 'shipped':
            case 'picked_up':
                $currentStatusIndex = 2;
                break;
            case 'out_for_delivery':
                $currentStatusIndex = 3;
                break;
            case 'delivered':
            case 'completed':
                $currentStatusIndex = 4;
                break;
            case 'cancelled':
                $currentStatusIndex = -1;
                break;
        }

        $timeline = [];
        foreach ($steps as $index => $step) {
            $isCompleted = $index <= $currentStatusIndex;
            $isCurrent = $index === $currentStatusIndex;
            
            $timestamp = null;
            if ($index == 0) {
                $timestamp = $order->created_at->format('M d, Y h:i A');
            } elseif ($index == 1 && ($shipment && $shipment->pickup_scheduled_at)) {
                $timestamp = $shipment->pickup_scheduled_at->format('M d, Y h:i A');
            } elseif ($index == 2 && ($shipment && $shipment->shipped_at)) {
                $timestamp = $shipment->shipped_at->format('M d, Y h:i A');
            } elseif ($isCurrent && $index > 0) {
                $timestamp = $order->updated_at->format('M d, Y h:i A');
            }

            $timeline[] = [
                'step' => $step['label'],
                'status' => $step['status'],
                'is_completed' => $isCompleted || $currentStatusIndex == 4,
                'is_current' => $isCurrent,
                'timestamp' => $timestamp,
                'description' => $this->getStepDescription($step['status'], $isCompleted, $shipment)
            ];
        }

        return response()->json([
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'current_status' => $shipment ? $shipment->status : $order->status,
            'tracking_id' => $shipment ? $shipment->tracking_number : $order->tracking_id,
            'tracking_provider' => $shipment ? $shipment->courier_name : $order->tracking_provider,
            'timeline' => $timeline
        ]);
    }

    private function getStepDescription($status, $isCompleted, $shipment = null) {
        if (!$isCompleted) return 'Pending...';
        
        switch ($status) {
            case 'placed': 
                return 'Your order has been placed successfully.';
            case 'processing': 
                if ($shipment && $shipment->pickup_time_slot) {
                    return "Package has been packed. Delhivery pickup scheduled for slot: {$shipment->pickup_time_slot}.";
                }
                return 'We are packing your items.';
            case 'shipped': 
                return 'Your order is on the way via courier partner Delhivery.';
            case 'out_for_delivery': 
                return 'Delhivery delivery associate is carrying your package and is out for delivery.';
            case 'delivered': 
                return 'Package delivered successfully. Thank you for shopping with Cureza!';
            default: 
                return '';
        }
    }
}
