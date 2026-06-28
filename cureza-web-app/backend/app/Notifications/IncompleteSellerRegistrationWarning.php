<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\SellerProfile;

class IncompleteSellerRegistrationWarning extends Notification
{
    use Queueable;

    protected $profile;

    /**
     * Create a new notification instance.
     */
    public function __construct(SellerProfile $profile)
    {
        $this->profile = $profile;
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
        $registerUrl = config('app.frontend_url', 'http://localhost:3000') . '/seller/register';

        return (new MailMessage)
            ->subject('Action Required: Complete your Cureza Seller Onboarding')
            ->greeting('Hello ' . ($notifiable->name ?? 'Seller') . ',')
            ->line('We noticed that you started registering as a seller on Cureza, but your account registration and KYC documentation are still incomplete.')
            ->line('Complete documentation is required before we can verify your seller profile and allow you to list your products.')
            ->action('Complete Your Registration', $registerUrl)
            ->line('Please note: If your registration remains incomplete, your temporary account progress will be automatically deleted in 24 hours to secure our platform. After that, you would need to register again from scratch.')
            ->line('If you have any questions or need assistance, feel free to reply to this email or contact support at support@cureza.in.')
            ->salutation('Best Regards,  \nThe Cureza Onboarding Team');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'seller_registration_warning',
            'title' => 'KYC Onboarding Incomplete',
            'message' => 'Your seller registration remains incomplete. Please upload documents within 24 hours to avoid account deletion.',
            'action_url' => '/seller/register',
        ];
    }
}
