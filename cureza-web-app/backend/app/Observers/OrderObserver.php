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
        $isCOD = strtolower($order->payment_method ?? '') === 'cod';
        $triggerSettlement = false;
        
        if ($order->isDirty('status')) {
            if (!$isCOD && $order->status === 'delivered') {
                $triggerSettlement = true;
            } elseif ($isCOD && $order->status === 'cod_reconciled') {
                $triggerSettlement = true;
            }
        }

        if ($triggerSettlement) {
            try {
                $this->commissionService->processOrderCommission($order);
                Log::info("Settlement and commission auto-calculated for order #{$order->order_number}");
            } catch (\Exception $e) {
                Log::error("Failed to auto-calculate settlement for order #{$order->order_number}: " . $e->getMessage());
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
