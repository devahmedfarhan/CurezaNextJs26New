<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $order;
    public $sellerItems;
    public $sellerTotal;

    /**
     * Create a new notification instance.
     */
    public function __construct($order, $sellerItems, $sellerTotal)
    {
        $this->order = $order;
        $this->sellerItems = $sellerItems;
        $this->sellerTotal = $sellerTotal;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $productCount = $this->sellerItems->sum('quantity');
        $products = $this->sellerItems->map(function ($item) {
            return [
                'title' => $item->product->title ?? 'Unknown Product',
                'quantity' => $item->quantity,
                'price' => $item->price,
            ];
        })->toArray();

        return [
            'type' => 'new_order',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number ?? 'ORD-' . $this->order->id,
            'customer_name' => $this->order->user->name ?? 'Guest',
            'customer_email' => $this->order->user->email ?? '',
            'total_amount' => $this->sellerTotal,
            'product_count' => $productCount,
            'products' => $products,
            'title' => 'New Order Received',
            'message' => "You have received a new order from {$this->order->user->name} for ₹" . number_format($this->sellerTotal, 2),
            'action_url' => '/seller/dashboard/orders/' . $this->order->id,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
