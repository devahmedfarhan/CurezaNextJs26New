<?php

namespace App\Listeners;

use App\Events\OrderCancelled;
use App\Events\OrderStatusChanged;
use App\Services\InventoryService;
use App\Services\CommissionService;
use Illuminate\Support\Facades\Log;

class OrderListener
{
    protected InventoryService $inventoryService;
    protected CommissionService $commissionService;

    public function __construct(InventoryService $inventoryService, CommissionService $commissionService)
    {
        $this->inventoryService = $inventoryService;
        $this->commissionService = $commissionService;
    }

    /**
     * Handle when an order is explicitly cancelled.
     */
    public function handleOrderCancelled(OrderCancelled $event): void
    {
        $order = $event->order;
        Log::info("OrderListener: Processing cancellation for Order #{$order->order_number}");

        $order->loadMissing('items');
        foreach ($order->items as $item) {
            try {
                $this->inventoryService->restoreStock($item->product_id, $item->quantity);
            } catch (\Exception $e) {
                Log::error("OrderListener: Failed to restore stock for product #{$item->product_id} in Order #{$order->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * Handle general order status changes.
     */
    public function handleOrderStatusChanged(OrderStatusChanged $event): void
    {
        $order = $event->order;
        $oldStatus = $event->oldStatus;
        $newStatus = $event->newStatus;

        Log::info("OrderListener: Order #{$order->order_number} transitioned from {$oldStatus} to {$newStatus}");

        $order->loadMissing('items');

        // 1. If delivered or cod_reconciled, process seller commission automatically
        $isCOD = strtolower($order->payment_method ?? '') === 'cod';
        $triggerStatus = $isCOD ? 'cod_reconciled' : 'delivered';

        if ($newStatus === $triggerStatus) {
            try {
                $this->commissionService->processOrderCommission($order);
            } catch (\Exception $e) {
                Log::error("OrderListener: Failed to process commission for Order #{$order->order_number}: " . $e->getMessage());
            }
        }

        // 2. If status transitions to cancelled, restore stock & refund commission
        if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            foreach ($order->items as $item) {
                try {
                    $this->inventoryService->restoreStock($item->product_id, $item->quantity);
                } catch (\Exception $e) {
                    Log::error("OrderListener: Failed to restore stock for product #{$item->product_id} in Order #{$order->id}: " . $e->getMessage());
                }
            }

            try {
                $this->commissionService->handleRefund($order);
            } catch (\Exception $e) {
                Log::error("OrderListener: Failed to reverse commission for Order #{$order->order_number}: " . $e->getMessage());
            }
        }
    }
}
