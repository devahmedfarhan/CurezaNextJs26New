<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\Communication\CommunicationService;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    protected $communicationService;

    public function __construct(CommunicationService $communicationService)
    {
        $this->communicationService = $communicationService;
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        if ($order->isDirty('status')) {
            $oldStatus = $order->getOriginal('status');
            $newStatus = $order->status;
            Log::info("OrderObserver: Order #{$order->order_number} status changed from '{$oldStatus}' to '{$newStatus}'.");

            // Sync order items status
            $order->items()->update(['status' => $newStatus]);

            $this->dispatchOrderStatusEmail($order, $newStatus);

            // Dispatch dynamic domain event for state synchronization
            event(new \App\Events\OrderStatusChanged($order, $oldStatus, $newStatus));
        }

        if ($order->isDirty('payment_status')) {
            $oldPaymentStatus = $order->getOriginal('payment_status');
            $newPaymentStatus = $order->payment_status;
            Log::info("OrderObserver: Order #{$order->order_number} payment status changed from '{$oldPaymentStatus}' to '{$newPaymentStatus}'.");

            if ($newPaymentStatus === 'paid') {
                $this->dispatchOrderStatusEmail($order, 'payment_success');
            } elseif ($newPaymentStatus === 'failed') {
                $this->dispatchOrderStatusEmail($order, 'payment_failed');
            }
        }
    }

    /**
     * Handle the Order "created" event (Order Confirmation).
     */
    public function created(Order $order): void
    {
        Log::info("OrderObserver: Order #{$order->order_number} created. Dispatching confirmation email.");
        $this->dispatchOrderStatusEmail($order, 'confirmed');

        // Dispatch domain event for order creation
        event(new \App\Events\OrderCreated($order));
    }

    /**
     * Dispatch status emails via the unified CommunicationService.
     */
    protected function dispatchOrderStatusEmail(Order $order, string $status): void
    {
        // Gather recipient details
        $email = $order->email ?? ($order->user ? $order->user->email : null);
        $name = $order->shipping_name ?? ($order->user ? $order->user->name : 'Valued Customer');

        if (empty($email)) {
            Log::warning("OrderObserver: No email found for Order #{$order->order_number}. Unable to send email.");
            return;
        }

        // Setup common template variables
        $variables = [
            'name' => $name,
            'email' => $email,
            'order_number' => $order->order_number,
            'total_amount' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'shipping_address' => trim("{$order->shipping_address}, {$order->shipping_city}, {$order->shipping_state} {$order->shipping_pincode}"),
            'tracking_number' => $order->tracking_number ?? 'N/A',
            'tracking_url' => $order->tracking_url ?? '#',
            'carrier' => $order->carrier ?? 'Standard Courier',
        ];

        // Map status to dynamic templates & subjects
        $templateKey = "order.{$status}";
        $subject = "";
        $options = [];

        switch ($status) {
            case 'confirmed':
                $subject = "Cureza Order Confirmed: #{$order->order_number} 🌿";
                // Pass order_id to generate & attach PDF invoice in queue
                $options['attachments'] = [
                    [
                        'type' => 'pdf_invoice',
                        'order_id' => $order->id,
                    ]
                ];
                break;

            case 'payment_success':
                $subject = "Cureza Payment Successful: Order #{$order->order_number} 💳";
                break;

            case 'payment_failed':
                $subject = "Cureza Payment Failed: Order #{$order->order_number} ⚠️";
                break;

            case 'processing':
                $subject = "Cureza Order Processing: #{$order->order_number}";
                break;

            case 'packed':
                $subject = "Cureza Order Packed: #{$order->order_number} 📦";
                break;

            case 'shipped':
                $subject = "Cureza Order Shipped! Tracking ID: " . ($order->tracking_number ?? '');
                break;

            case 'delivered':
                $subject = "Cureza Order Delivered! Enjoy your Wellness Products 💚";
                break;

            case 'cancelled':
                $subject = "Cureza Order Cancelled: #{$order->order_number}";
                break;

            case 'refunded':
                $subject = "Cureza Refund Processed: Order #{$order->order_number} 💸";
                break;

            default:
                Log::warning("OrderObserver: Unhandled order status '{$status}'. Skipping email.");
                return;
        }

        try {
            \App\Services\NotificationService::send(
                $templateKey,
                [
                    'email' => $email,
                    'phone' => $order->phone ?? ($order->user ? $order->user->phone : null),
                    'name' => $name,
                ],
                $variables
            );
        } catch (\Exception $e) {
            Log::error("OrderObserver failed to send notification for Order #{$order->order_number} on status {$status}. Error: " . $e->getMessage());
        }
    }
}
