<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class SystemSettingsService
{
    const CACHE_KEY = 'system_settings_cache';

    /**
     * Get all settings (cached).
     */
    public static function getAllSettings()
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            try {
                if (!Schema::hasTable('system_settings')) {
                    return collect();
                }
                return SystemSetting::all();
            } catch (\Exception $e) {
                Log::warning('Failed to load system settings from DB: ' . $e->getMessage());
                return collect();
            }
        });
    }

    /**
     * Clear settings cache.
     */
    public static function clearCache()
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Apply settings values to Laravel's runtime config.
     */
    public static function loadToConfig()
    {
        // Don't execute if the table doesn't exist
        try {
            if (!Schema::hasTable('system_settings')) {
                return;
            }
        } catch (\Exception $e) {
            // Safe fallback during bootstrap/migrations
            return;
        }

        $settings = self::getAllSettings();

        if ($settings->isEmpty()) {
            return;
        }

        // Map settings to Laravel configuration
        $configMap = [
            // Email/SMTP settings
            'mail_host' => 'mail.mailers.smtp.host',
            'mail_port' => 'mail.mailers.smtp.port',
            'mail_username' => 'mail.mailers.smtp.username',
            'mail_password' => 'mail.mailers.smtp.password',
            'mail_encryption' => 'mail.mailers.smtp.encryption',
            'mail_from_address' => 'mail.from.address',
            'mail_from_name' => 'mail.from.name',

            // Google login settings
            'google_client_id' => 'services.google.client_id',
            'google_client_secret' => 'services.google.client_secret',
            'google_auth_enabled' => 'services.google.enabled',

            // Razorpay settings
            'razorpay_key' => 'services.razorpay.key',
            'razorpay_secret' => 'services.razorpay.secret',
            'razorpay_webhook_secret' => 'services.razorpay.webhook_secret',
            'razorpay_enabled' => 'services.razorpay.enabled',

            // Stripe settings
            'stripe_key' => 'services.stripe.key',
            'stripe_secret' => 'services.stripe.secret',
            'stripe_webhook_secret' => 'services.stripe.webhook_secret',
            'stripe_enabled' => 'services.stripe.enabled',

            // PayU settings
            'payu_merchant_key' => 'services.payu.merchant_key',
            'payu_merchant_salt' => 'services.payu.merchant_salt',
            'payu_mode' => 'services.payu.mode',
            'payu_enabled' => 'services.payu.enabled',

            // PhonePe settings
            'phonepe_merchant_id' => 'services.phonepe.merchant_id',
            'phonepe_salt_key' => 'services.phonepe.salt_key',
            'phonepe_salt_index' => 'services.phonepe.salt_index',
            'phonepe_mode' => 'services.phonepe.mode',
            'phonepe_enabled' => 'services.phonepe.enabled',

            // COD settings
            'cod_enabled' => 'services.cod.enabled',

            // OTP settings
            'otp_enabled' => 'services.otp.enabled',

            // Order number settings
            'order_number_format' => 'services.order.format',
            'order_number_prefix' => 'services.order.prefix',
            'order_number_year' => 'services.order.year',

            // Cart & Checkout settings
            'cart_free_shipping_enabled' => 'services.cart.free_shipping_enabled',
            'cart_free_shipping_threshold' => 'services.cart.free_shipping_threshold',
            'checkout_secure_badge_text' => 'services.checkout.secure_badge_text',
            'checkout_order_notes_enabled' => 'services.checkout.order_notes_enabled',
            'checkout_save_address_default' => 'services.checkout.save_address_default',
        ];

        $overrides = [];
        foreach ($settings as $setting) {
            if (isset($configMap[$setting->key])) {
                $val = $setting->value;
                
                // Convert truthy/falsy values for boolean fields
                if (in_array($setting->key, ['google_auth_enabled', 'razorpay_enabled', 'otp_enabled', 'stripe_enabled', 'payu_enabled', 'phonepe_enabled', 'cod_enabled', 'cart_free_shipping_enabled', 'checkout_order_notes_enabled', 'checkout_save_address_default'])) {
                    $val = filter_var($val, FILTER_VALIDATE_BOOLEAN);
                }

                $overrides[$configMap[$setting->key]] = $val;
            }
        }

        if (!empty($overrides)) {
            config($overrides);
        }
    }
}
