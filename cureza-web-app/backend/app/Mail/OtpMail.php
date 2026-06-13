<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    /**
     * Create a new message instance.
     */
    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Cureza - Your Verification Code: ' . $this->otp)
                    ->html($this->getHtmlString());
    }

    /**
     * Get the HTML content for the email.
     */
    protected function getHtmlString(): string
    {
        return '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 24px; font-weight: bold; color: #15803d; background-color: #f0fdf4; padding: 10px 20px; border-radius: 8px; display: inline-block;">Cureza</span>
            </div>
            <h2 style="color: #1f2937; text-align: center; font-size: 20px; margin-bottom: 10px;">Verify Your Account</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; text-align: center;">
                Use the verification code below to verify your login or registration. This OTP code is valid for 3 minutes.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 5px; padding: 12px 24px; background-color: #f3f4f6; border-radius: 8px; border: 1px dashed #d1d5db; display: inline-block;">' . htmlspecialchars($this->otp) . '</span>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
                If you did not request this code, please ignore this email.
            </p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 11px; text-align: center;">
                © 2026 Cureza Wellness Pvt Ltd. All rights reserved.
            </p>
        </div>
        ';
    }
}
