<?php

namespace App\Notifications;

use App\Models\ProductChangeRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductChangeRequestApproved extends Notification implements ShouldQueue
{
    use Queueable;

    protected $changeRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(ProductChangeRequest $changeRequest)
    {
        $this->changeRequest = $changeRequest;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $product = $this->changeRequest->product;
        $type = $this->changeRequest->change_type;
        
        $subject = match($type) {
            'create' => 'Your Product Has Been Approved!',
            'edit' => 'Your Product Changes Have Been Approved!',
            'delete' => 'Your Product Deletion Request Was Approved',
            default => 'Product Request Approved',
        };

        $message = match($type) {
            'create' => "Great news! Your product \"{$product->title}\" has been approved and is now live on the marketplace.",
            'edit' => "Your requested changes to \"{$product->title}\" have been approved and applied.",
            'delete' => "Your request to delete \"{$product->title}\" has been processed.",
            default => "Your product request has been approved.",
        };

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name}!")
            ->line($message)
            ->action('View Your Products', url('/seller/dashboard/products'))
            ->line('Thank you for being a seller on Cureza!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $product = $this->changeRequest->product;
        $type = $this->changeRequest->change_type;

        return [
            'type' => 'product_change_approved',
            'change_type' => $type,
            'product_id' => $product->id,
            'product_title' => $product->title,
            'message' => match($type) {
                'create' => "Your product \"{$product->title}\" has been approved!",
                'edit' => "Changes to \"{$product->title}\" have been approved.",
                'delete' => "Product \"{$product->title}\" has been deleted.",
                default => "Product request approved.",
            },
            'created_at' => now()->toIso8601String(),
        ];
    }
}
