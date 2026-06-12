<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\CommissionService;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    protected $commissionService;

    public function __construct()
    {
        $this->commissionService = new CommissionService();
    }

    /**
     * Handle the Order "updated" event.
     * Trigger commission calculation when order status changes to delivered
     */
    public function updated(Order $order)
    {
        // Check if status changed to 'delivered'
        if ($order->isDirty('status') && $order->status === 'delivered') {
            try {
                $this->commissionService->processOrderCommission($order);
                Log::info("Commission auto-calculated for order #{$order->order_number}");
            } catch (\Exception $e) {
                Log::error("Failed to auto-calculate commission for order #{$order->order_number}: " . $e->getMessage());
            }
        }

        // Check if status changed to 'refunded'
        if ($order->isDirty('status') && $order->status === 'refunded') {
            try {
                $this->commissionService->handleRefund($order);
                Log::info("Refund processed for order #{$order->order_number}");
            } catch (\Exception $e) {
                Log::error("Failed to process refund for order #{$order->order_number}: " . $e->getMessage());
            }
        }
    }
}
