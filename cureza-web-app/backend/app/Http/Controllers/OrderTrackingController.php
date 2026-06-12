<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class OrderTrackingController extends Controller
{
    public function track($id)
    {
        $user = Auth::user();
        $order = Order::where('user_id', $user->id)->findOrFail($id);

        // Define standard steps
        $steps = [
            ['status' => 'placed', 'label' => 'Order Placed', 'icon' => 'Package'],
            ['status' => 'processing', 'label' => 'Processing', 'icon' => 'Loader'],
            ['status' => 'shipped', 'label' => 'Shipped', 'icon' => 'Truck'],
            ['status' => 'out_for_delivery', 'label' => 'Out for Delivery', 'icon' => 'MapPin'],
            ['status' => 'delivered', 'label' => 'Delivered', 'icon' => 'CheckCircle'],
        ];

        // Determine current progress index
        // Simple mapping for now
        $currentStatusIndex = 0;
        switch ($order->status) {
            case 'pending':
            case 'placed':
                $currentStatusIndex = 0; 
                break;
            case 'processing':
                $currentStatusIndex = 1;
                break;
            case 'shipped':
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
                $currentStatusIndex = -1; // Handle separately
                break;
        }

        $timeline = [];
        foreach ($steps as $index => $step) {
            $isCompleted = $index <= $currentStatusIndex;
            $isCurrent = $index === $currentStatusIndex;
            
            // Mock timestamps for completed steps
            // In a real app, we'd query an order_status_histories table
            $timestamp = null;
            $timestamp = null;
            if ($index == 0) {
                $timestamp = $order->created_at->format('M d, Y h:i A');
            } elseif ($isCurrent && $index > 0) {
                 // Use updated_at for the current active stage
                 $timestamp = $order->updated_at->format('M d, Y h:i A');
            } elseif ($isCompleted) {
                // We don't have historical timestamps for intermediate steps without an audit table
                // So we leave it null or could show a generic date if needed.
                // For now, let's only show timestamp for Placed and Current.
                $timestamp = null;
            }

            $timeline[] = [
                'step' => $step['label'],
                'status' => $step['status'],
                'is_completed' => $isCompleted || $currentStatusIndex == 4, // If delivered, all completed
                'is_current' => $isCurrent,
                'timestamp' => $timestamp,
                'description' => $this->getStepDescription($step['status'], $isCompleted)
            ];
        }

        return response()->json([
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'current_status' => $order->status,
            'tracking_id' => $order->tracking_id,
            'tracking_provider' => $order->tracking_provider,
            'timeline' => $timeline
        ]);
    }

    private function getStepDescription($status, $isCompleted) {
        if (!$isCompleted) return 'Pending...';
        
        switch ($status) {
            case 'placed': return 'Your order has been placed successfully.';
            case 'processing': return 'We are packing your items.';
            case 'shipped': return 'Your order is on the way.';
            case 'out_for_delivery': return 'Agent is out for delivery.';
            case 'delivered': return 'Package delivered successfully.';
            default: return '';
        }
    }
}
