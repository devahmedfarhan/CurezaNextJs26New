<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketReplyNotification extends Notification
{
    use Queueable;

    protected $ticket;
    protected $senderRole;

    /**
     * Create a new notification instance.
     */
    public function __construct($ticket, $senderRole)
    {
        $this->ticket = $ticket;
        $this->senderRole = $senderRole;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable)
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    public function toDatabase($notifiable)
    {
        // Determine URL based on who is receiving it
        // If receiver is admin, url is superadmin...
        // But user role logic is on frontend usually or we can store generic relative path?
        // Let's store a generic path logic or key. Frontend can decide.
        // Actually, simple logic:
        // If notifiable is admin -> superadmin path
        // If notifiable is user -> dashboard path (which might need role prefix)
        
        // Simpler: Just store the ID and let frontend Click Handler route based on current user role.
        
        return [
            'ticket_id' => $this->ticket->id,
            'title' => 'New Reply on Ticket',
            'message' => 'New reply on ticket #' . $this->ticket->id,
            'action_url_suffix' => '/dashboard/support/' . $this->ticket->id, // Frontend can prefix
            'type' => 'ticket_reply'
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
