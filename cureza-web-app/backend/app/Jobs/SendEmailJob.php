<?php

namespace App\Jobs;

use App\Models\EmailLog;
use App\Models\SmtpSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 4; // Initial attempt + 3 retries

    protected $logId;
    protected $recipient;
    protected $subject;
    protected $body;
    protected $attachments;

    /**
     * Create a new job instance.
     */
    public function __construct(int $logId, string $recipient, string $subject, string $body, array $attachments = [])
    {
        $this->logId = $logId;
        $this->recipient = $recipient;
        $this->subject = $subject;
        $this->body = $body;
        $this->attachments = $attachments;
    }

    /**
     * Define the backoff intervals (1 minute, 5 minutes, 15 minutes).
     */
    public function backoff()
    {
        return [60, 300, 900];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $emailLog = EmailLog::find($this->logId);
        if (!$emailLog) {
            Log::error("SendEmailJob: EmailLog ID {$this->logId} not found.");
            return;
        }

        // 1. Resolve Active SMTP Configuration
        $smtp = SmtpSetting::where('is_active', true)->first();

        // 2. Failover to Backup SMTP if primary not active/found
        if (!$smtp) {
            $smtp = SmtpSetting::where('is_backup', true)->first();
            if ($smtp) {
                Log::info("SendEmailJob: Primary SMTP inactive, fell back to backup SMTP '{$smtp->provider_name}'.");
            }
        }

        if (!$smtp) {
            // No custom SMTP configured, check if we have SystemSettings SMTP config keys
            $sysHost = \App\Models\SystemSetting::where('key', 'mail_host')->value('value');
            if ($sysHost) {
                // Synthesize a temp SMTP model from SystemSettings for compatibility
                $smtp = new SmtpSetting([
                    'provider_name' => 'System Settings SMTP',
                    'host' => $sysHost,
                    'port' => (int)\App\Models\SystemSetting::where('key', 'mail_port')->value('value'),
                    'username' => \App\Models\SystemSetting::where('key', 'mail_username')->value('value'),
                    'password' => \App\Models\SystemSetting::where('key', 'mail_password')->value('value'),
                    'encryption' => \App\Models\SystemSetting::where('key', 'mail_encryption')->value('value') ?: 'tls',
                    'sender_name' => \App\Models\SystemSetting::where('key', 'mail_from_name')->value('value') ?: 'Cureza',
                    'sender_email' => \App\Models\SystemSetting::where('key', 'mail_from_address')->value('value') ?: 'hello@cureza.in',
                ]);
            }
        }

        if (!$smtp) {
            // Local dev environment fallback - send to log driver if no configuration is present
            Log::info("SendEmailJob SIMULATED (no SMTP config): To: {$this->recipient} | Subject: {$this->subject}");
            $emailLog->update([
                'status' => 'sent',
                'provider_name' => 'Log Driver',
                'sent_at' => now(),
                'response' => 'Simulated: Sent to local log driver.',
            ]);
            return;
        }

        // Update retry count in DB log
        $emailLog->update([
            'retry_count' => $this->attempts() - 1,
            'smtp_used' => $smtp->provider_name,
        ]);

        try {
            // 3. Dynamic Configuration Injector
            $encryption = strtolower($smtp->encryption);
            if ($encryption === 'none' || empty($encryption)) {
                $encryption = null;
            }

            config([
                'mail.mailers.dynamic_smtp' => [
                    'transport' => 'smtp',
                    'host' => $smtp->host,
                    'port' => (int)$smtp->port,
                    'encryption' => $encryption,
                    'username' => $smtp->username,
                    'password' => $smtp->password,
                    'timeout' => (int)($smtp->timeout ?: 30),
                ],
                'mail.from.address' => $smtp->sender_email,
                'mail.from.name' => $smtp->sender_name,
            ]);

            // Clear instances so Laravel's MailManager re-reads configurations
            $mailManager = app('mail.manager');
            if (method_exists($mailManager, 'forgetMailer')) {
                $mailManager->forgetMailer('dynamic_smtp');
            }

            // 4. Dispatch Email
            Mail::mailer('dynamic_smtp')->html($this->body, function ($message) use ($smtp) {
                $message->to($this->recipient)
                        ->subject($this->subject);

                if (!empty($smtp->reply_to)) {
                    $message->replyTo($smtp->reply_to);
                }

                // Handle attachments
                if (!empty($this->attachments)) {
                    foreach ($this->attachments as $attachment) {
                        if (isset($attachment['type']) && $attachment['type'] === 'pdf_invoice') {
                            // Dynamic background PDF generation for Invoice
                            try {
                                $order = \App\Models\Order::with(['items.product', 'shippingMethod'])->find($attachment['order_id']);
                                if ($order) {
                                    $logoPath = public_path('storage/images/logo.png');
                                    $logoBase64 = '';
                                    if (file_exists($logoPath)) {
                                        $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                                        $data = file_get_contents($logoPath);
                                        $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                                    }
                                    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoice', compact('order', 'logoBase64'));
                                    $pdfContent = $pdf->output();
                                    $message->attachData(
                                        $pdfContent,
                                        'invoice-' . $order->order_number . '.pdf',
                                        ['mime' => 'application/pdf']
                                    );
                                }
                            } catch (\Exception $ex) {
                                Log::error("SendEmailJob: Failed to generate PDF invoice attachment. Error: " . $ex->getMessage());
                            }
                        } elseif (!empty($attachment['data'])) {
                            // Binary attachment
                            $message->attachData(
                                $attachment['data'],
                                $attachment['name'] ?? 'attachment.pdf',
                                ['mime' => $attachment['mime'] ?? 'application/pdf']
                            );
                        } elseif (!empty($attachment['path'])) {
                            // Filepath attachment
                            $message->attach($attachment['path']);
                        }
                    }
                }
            });

            // 5. Update Log to Sent
            $emailLog->update([
                'status' => 'sent',
                'sent_at' => now(),
                'response' => 'Sent successfully via SMTP.',
            ]);

        } catch (Throwable $e) {
            Log::error("SendEmailJob: Attempt {$this->attempts()} failed for recipient {$this->recipient}. Error: " . $e->getMessage());

            $emailLog->update([
                'status' => 'queued', // Keep it in queued status so it's transparent, we mark failed in failed() callback
                'error_details' => $e->getMessage() . "\n" . $e->getTraceAsString(),
            ]);

            throw $e; // Re-throw to trigger Laravel's retry backoff mechanism
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        $emailLog = EmailLog::find($this->logId);
        if ($emailLog) {
            $emailLog->update([
                'status' => 'failed',
                'error_details' => 'Failed permanently after ' . $this->tries . ' attempts. Exception: ' . $exception->getMessage(),
            ]);
        }
        Log::error("SendEmailJob: Job permanently failed for recipient {$this->recipient}. Details: " . $exception->getMessage());
    }
}
