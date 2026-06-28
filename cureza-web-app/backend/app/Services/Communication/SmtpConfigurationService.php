<?php

namespace App\Services\Communication;

use App\Models\SmtpSetting;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
use Exception;

class SmtpConfigurationService
{
    /**
     * Test a raw set of SMTP credentials by opening a connection.
     *
     * @param array $config SMTP config fields (host, port, username, password, encryption)
     * @return array ['success' => bool, 'message' => string]
     */
    public function validateCredentials(array $config): array
    {
        try {
            $host = $config['host'] ?? '';
            $port = (int)($config['port'] ?? 465);
            $username = $config['username'] ?? '';
            $password = $config['password'] ?? '';
            $encryption = strtolower($config['encryption'] ?? 'tls');

            if (empty($host) || empty($username) || empty($password)) {
                return [
                    'success' => false,
                    'message' => 'Validation failed: host, username, and password are required.'
                ];
            }

            // Determine if TLS/SSL transport mode is checked by port or encryption
            $isTls = ($encryption === 'ssl' || $port === 465);

            // Symfony Mailer transport setup
            $transport = new EsmtpTransport($host, $port, $isTls);
            $transport->setUsername($username);
            $transport->setPassword($password);

            // Start connection and authenticate
            $transport->start();
            $transport->stop();

            return [
                'success' => true,
                'message' => 'SMTP connection and authentication succeeded.'
            ];
        } catch (Exception $e) {
            Log::error('SMTP validation exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'SMTP connection/auth failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Dispatch a test email using specific SMTP credentials.
     *
     * @param string $recipient Recipient Email address
     * @param SmtpSetting $smtp SMTP Config instance
     * @return array
     */
    public function sendTestEmail(string $recipient, SmtpSetting $smtp): array
    {
        try {
            $encryption = strtolower($smtp->encryption);
            if ($encryption === 'none' || empty($encryption)) {
                $encryption = null;
            }

            // Set configuration variables temporarily
            config([
                'mail.mailers.dynamic_smtp_test' => [
                    'transport' => 'smtp',
                    'host' => $smtp->host,
                    'port' => (int)$smtp->port,
                    'encryption' => $encryption,
                    'username' => $smtp->username,
                    'password' => $smtp->password,
                    'timeout' => 15, // fast timeout for test emails
                ],
                'mail.from.address' => $smtp->sender_email,
                'mail.from.name' => $smtp->sender_name,
            ]);

            // Clear resolved instance
            $mailManager = app('mail.manager');
            if (method_exists($mailManager, 'forgetMailer')) {
                $mailManager->forgetMailer('dynamic_smtp_test');
            }

            // Dispatch test email
            Mail::mailer('dynamic_smtp_test')->html(
                "<h1>SMTP Test Succeeded!</h1><p>This is a verification email from the Cureza Enterprise Communication Center.</p>",
                function ($message) use ($recipient) {
                    $message->to($recipient)
                            ->subject("Cureza Connection Test Email");
                }
            );

            return [
                'success' => true,
                'message' => 'Test email sent successfully.'
            ];

        } catch (Exception $e) {
            Log::error('SMTP Test email dispatch failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Test email failed: ' . $e->getMessage()
            ];
        }
    }
}
