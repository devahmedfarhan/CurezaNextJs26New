<?php

namespace App\Notifications;

use App\Models\ProductChangeRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProductChangeRequestRejected extends Notification implements ShouldQueue
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
        $reason = $this->changeRequest->rejection_reason;
        
        $subject = match($type) {
            'create' => 'Your Product Submission Was Not Approved',
            'edit' => 'Your Product Changes Were Not Approved',
            'delete' => 'Your Product Deletion Request Was Denied',
            default => 'Product Request Not Approved',
        };

        $message = match($type) {
            'create' => "Unfortunately, your product \"{$product->title}\" could not be approved at this time.",
            'edit' => "Your requested changes to \"{$product->title}\" were not approved.",
            'delete' => "Your request to delete \"{$product->title}\" was denied.",
            default => "Your product request was not approved.",
        };

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name},")
            ->line($message)
            ->line("**Reason:** {$reason}")
            ->line('You can make the necessary changes and resubmit your request.')
            ->action('View Your Products', url('/seller/dashboard/products'))
            ->line('If you have questions, please contact our support team.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $product = $this->changeRequest->product;
        $type = $this->changeRequest->change_type;

        return [
            'type' => 'product_change_rejected',
            'change_type' => $type,
            'product_id' => $product->id,
            'product_title' => $product->title,
            'rejection_reason' => $this->changeRequest->rejection_reason,
            'message' => match($type) {
                'create' => "Your product \"{$product->title}\" was not approved.",
                'edit' => "Changes to \"{$product->title}\" were rejected.",
                'delete' => "Deletion of \"{$product->title}\" was denied.",
                default => "Product request rejected.",
            },
            'created_at' => now()->toISOString(),
        ];
    }
}
