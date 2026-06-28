<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SmtpSetting;
use App\Models\EmailTemplate;

class CommunicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function up(): void
    {
        $this->run();
    }

    public function run(): void
    {
        // 1. Seed Hostinger SMTP Provider Settings
        if (SmtpSetting::count() === 0) {
            SmtpSetting::create([
                'provider_name' => 'Hostinger Business Mail SMTP',
                'host' => 'smtp.hostinger.com',
                'port' => 465,
                'username' => 'info@cureza.in',
                'password' => 'Fickz@7880',
                'encryption' => 'ssl',
                'sender_name' => 'Cureza Wellness',
                'sender_email' => 'info@cureza.in',
                'reply_to' => 'support@cureza.in',
                'timeout' => 30,
                'retry_count' => 3,
                'max_emails_per_hour' => 100,
                'max_emails_per_day' => 1000,
                'is_active' => true,
                'is_backup' => false,
                'priority' => 1,
                'notes' => 'Primary enterprise SMTP provider for Cureza platform.',
            ]);

            // Seed a Backup SMTP setting for failover demonstration
            SmtpSetting::create([
                'provider_name' => 'Backup SendGrid SMTP',
                'host' => 'smtp.sendgrid.net',
                'port' => 587,
                'username' => 'apikey',
                'password' => 'SG.simulate_backup_api_key_for_demonstration_purposes',
                'encryption' => 'tls',
                'sender_name' => 'Cureza Backup Mailer',
                'sender_email' => 'admin@cureza.in',
                'reply_to' => 'support@cureza.in',
                'timeout' => 30,
                'retry_count' => 3,
                'max_emails_per_hour' => 100,
                'max_emails_per_day' => 1000,
                'is_active' => false,
                'is_backup' => true,
                'priority' => 2,
                'notes' => 'Fallback SMTP provider for delivery failover.',
            ]);
        }

        // 2. Seed Default Reusable Email Templates (light/dark themed)
        $templates = [
            [
                'key' => 'auth.otp',
                'name' => 'Login Verification OTP',
                'subject' => 'Cureza Verification Code: {{ $otp }}',
                'theme' => 'light',
                'variables' => ['name', 'otp'],
                'body' => '
                    <h2 style="color: #052326; margin-top: 0; font-family: \'Outfit\', sans-serif;">Security Verification Code 🔑</h2>
                    <p style="color: #052326; opacity: 0.8; font-size: 15px; line-height: 1.6;">Hello {{ $name }},</p>
                    <p style="color: #052326; opacity: 0.8; font-size: 15px; line-height: 1.6;">You requested a secure authentication OTP for your Cureza account. Please use the following code to complete your login. This code is valid for 3 minutes.</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <span style="font-size: 32px; font-weight: 700; color: #052326; letter-spacing: 6px; background-color: #F8F3EF; padding: 12px 30px; border-radius: 8px; border: 1px solid rgba(85, 85, 85, 0.18);">{{ $otp }}</span>
                    </div>

                    <p style="color: #052326; opacity: 0.6; font-size: 13px; line-height: 1.6; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 20px;">If you did not request this login verification code, please ignore this email or contact support if you suspect unauthorized activity.</p>
                '
            ],
            [
                'key' => 'newsletter.double_opt_in',
                'name' => 'Newsletter Double Opt-in Verification',
                'subject' => 'Confirm Your Subscription to Cureza Newsletter 🌿',
                'theme' => 'light',
                'variables' => ['name', 'verification_link'],
                'body' => '
                    <h2 style="color: #052326; margin-top: 0; font-family: \'Outfit\', sans-serif;">Confirm Your Subscription 🌿</h2>
                    <p style="color: #052326; opacity: 0.8; font-size: 15px; line-height: 1.6;">Hello {{ $name }},</p>
                    <p style="color: #052326; opacity: 0.8; font-size: 15px; line-height: 1.6;">Thank you for your interest in subscribing to the Cureza Wellness Newsletter! Please click the button below to verify your email address and activate your subscription.</p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="{{ $verification_link }}" class="btn" style="color: #052326 !important; text-decoration: none;">Confirm Subscription</a>
                    </div>

                    <p style="color: #052326; opacity: 0.8; font-size: 14px; line-height: 1.6;">Once confirmed, you will receive expert-curated wellness insights, guides on natural remedies, and exclusive offers on botanical ingredients.</p>
                    <p style="color: #052326; opacity: 0.6; font-size: 11px; margin-top: 20px;">If the button above does not work, copy and paste this link in your browser: <br><a href="{{ $verification_link }}">{{ $verification_link }}</a></p>
                '
            ],
            [
                'key' => 'order.confirmed',
                'name' => 'Order Confirmation & Invoice',
                'subject' => 'Cureza Order Confirmed: #{{ $order_number }} 🌿',
                'theme' => 'light',
                'variables' => ['name', 'order_number', 'total_amount', 'shipping_address', 'payment_method'],
                'body' => '
                    <h2 style="color: #052326; margin-top: 0; font-family: \'Outfit\', sans-serif;">Thank You for Your Order! 🎉</h2>
                    <p style="color: #052326; opacity: 0.8; font-size: 15px;">Hello {{ $name }},</p>
                    <p style="color: #052326; opacity: 0.8; font-size: 15px; line-height: 1.6;">We are pleased to confirm that your order <b>#{{ $order_number }}</b> has been received and is now being processed. A copy of your PDF invoice has been attached to this email.</p>
                    
                    <div style="background-color: #F8F3EF; border-radius: 8px; border: 1px solid rgba(85, 85, 85, 0.18); padding: 20px; margin: 25px 0; font-size: 14px;">
                        <h4 style="margin-top: 0; color: #052326; font-family: \'Outfit\', sans-serif; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px;">Order Summary</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #052326;">
                            <tr>
                                <td style="padding: 4px 0; font-weight: 500;">Order Number:</td>
                                <td style="padding: 4px 0; text-align: right;">#{{ $order_number }}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: 500;">Total Amount:</td>
                                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #052326;">₹{{ number_format($total_amount ?? 0, 2) }}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: 500;">Payment Mode:</td>
                                <td style="padding: 4px 0; text-align: right; text-transform: uppercase;">{{ $payment_method }}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0 4px 0; font-weight: 500; vertical-align: top;">Shipping To:</td>
                                <td style="padding: 8px 0 4px 0; text-align: right; line-height: 1.4;">{{ $shipping_address }}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="color: #052326; opacity: 0.8; font-size: 14px; line-height: 1.6;">We will send you another email with shipping updates and a tracking link as soon as your package leaves our fulfillment center.</p>
                '
            ],
            [
                'key' => 'order.shipped',
                'name' => 'Order Shipped & Carrier Tracking',
                'subject' => 'Your Cureza Order #{{ $order_number }} Has Been Shipped! 🚚',
                'theme' => 'light',
                'variables' => ['name', 'order_number', 'carrier', 'tracking_number', 'tracking_url'],
                'body' => '
                    <h2 style="color: #052326; margin-top: 0; font-family: \'Outfit\', sans-serif;">Your Package is on the Way! 🚚</h2>
                    <p style="color: #052326; opacity: 0.8; font-size: 15px;">Hello {{ $name }},</p>
                    <p style="color: #052326; opacity: 0.8; font-size: 15px; line-height: 1.6;">Exciting news! Your order <b>#{{ $order_number }}</b> has been shipped and is on its way to you via <b>{{ $carrier }}</b>.</p>
                    
                    <div style="background-color: #F8F3EF; border-radius: 8px; border: 1px solid rgba(85, 85, 85, 0.18); padding: 25px; margin: 25px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #052326;">Tracking ID: <b>{{ $tracking_number }}</b></p>
                        <a href="{{ $tracking_url }}" class="btn" style="color: #052326 !important; text-decoration: none;">Track Shipment Status</a>
                    </div>

                    <p style="color: #052326; opacity: 0.8; font-size: 14px; line-height: 1.6;">If you have any questions about your delivery, please feel free to raise a ticket in the Support Center.</p>
                '
            ],
            [
                'key' => 'marketing.welcome_series',
                'name' => 'Welcome Series Promotional',
                'subject' => 'Welcome to Cureza! Open to redeem your 10% discount 🎁',
                'theme' => 'dark',
                'variables' => ['name', 'welcome_coupon'],
                'body' => '
                    <h2 style="color: #F8F3EF; margin-top: 0; font-family: \'Outfit\', sans-serif; text-align: center;">Welcome to clinically advanced ayurveda 🌿</h2>
                    <p style="color: #F8F3EF; opacity: 0.9; font-size: 15px; line-height: 1.7; text-align: center;">Hello {{ $name }}, and welcome to Cureza. We connect ancient Ayurvedic wisdom and modern clinical sciences to formulate clean, certified wellness solutions.</p>
                    
                    <div style="background-color: rgba(255, 255, 255, 0.05); border: 1px dashed #D4AF37; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                        <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #D4AF37; letter-spacing: 2px;">Your Welcome Gift</span>
                        <h3 style="margin: 10px 0; font-size: 26px; color: #F8F3EF; font-family: \'Outfit\', sans-serif;">FLAT 10% OFF</h3>
                        <p style="margin: 0 0 20px 0; font-size: 13px; color: #F8F3EF; opacity: 0.8;">Use code <b>{{ $welcome_coupon }}</b> at checkout on your first order.</p>
                        <a href="' . config('app.url', 'http://localhost:3000') . '/shop" class="btn" style="color: #052326 !important; text-decoration: none;">Activate Discount</a>
                    </div>

                    <p style="color: #F8F3EF; opacity: 0.8; font-size: 14px; line-height: 1.6; text-align: center;">Thank you for embarking on this wellness journey with us.</p>
                '
            ]
        ];

        foreach ($templates as $data) {
            EmailTemplate::updateOrCreate(
                ['key' => $data['key']],
                $data
            );
        }
    }
}
