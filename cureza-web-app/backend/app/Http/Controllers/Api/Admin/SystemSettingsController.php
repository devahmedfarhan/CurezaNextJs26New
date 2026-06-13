<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\SystemSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemSettingsController extends Controller
{
    /**
     * Display a listing of system settings grouped by their category.
     */
    public function index()
    {
        $settings = SystemSetting::all();

        // Group settings and mask secrets
        $groupedSettings = $settings->groupBy('group')->map(function ($items) {
            return $items->map(function ($item) {
                $value = $item->value;
                if ($item->is_secret && !empty($value)) {
                    $value = '********'; // Mask secret value
                }
                return [
                    'key' => $item->key,
                    'value' => $value,
                    'group' => $item->group,
                    'is_secret' => $item->is_secret,
                ];
            });
        });

        return response()->json($groupedSettings);
    }

    /**
     * Store or update system settings.
     */
    public function store(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:system_settings,key',
            'settings.*.value' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->settings as $settingData) {
                $setting = SystemSetting::where('key', $settingData['key'])->first();
                if (!$setting) {
                    continue;
                }

                $newValue = $settingData['value'];

                // If setting is a secret and value is masked, don't update it
                if ($setting->is_secret && $newValue === '********') {
                    continue;
                }

                $setting->value = $newValue;
                $setting->save();
            }

            DB::commit();

            // Clear cache to apply changes instantly
            SystemSettingsService::clearCache();
            SystemSettingsService::loadToConfig();

            return response()->json([
                'message' => 'Settings updated successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Settings update failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public settings.
     */
    public function publicSettings()
    {
        $publicKeys = [
            'google_auth_enabled',
            'google_client_id',
            'otp_enabled',
            'razorpay_enabled',
            'razorpay_key',
            'stripe_enabled',
            'stripe_key',
            'payu_enabled',
            'payu_merchant_key',
            'phonepe_enabled',
            'phonepe_merchant_id',
            'cod_enabled',
            'cart_free_shipping_enabled',
            'cart_free_shipping_threshold',
            'checkout_secure_badge_text',
            'checkout_order_notes_enabled',
            'checkout_save_address_default',
            'cart_drawer_primary_color',
            'cart_drawer_animation_speed',
            'cart_drawer_title',
            'cart_drawer_logo_url',
            'cart_drawer_urgency_text',
            'cart_drawer_empty_text',
            'cart_drawer_empty_cta_label',
            'cart_drawer_secure_text',
            'cart_drawer_checkout_cta_label',
            'cart_drawer_reviews_text',
            'cart_drawer_upsell_title',
            'cart_drawer_upsell_mode',
            'cart_drawer_enable_rewards',
            'cart_drawer_enable_coupons',
            'cart_drawer_enable_coins',
            'cart_drawer_enable_upsell',
            'cart_drawer_enable_delivery_note',
            'cart_coins_earn_percentage',
            'cart_coins_max_earn_limit',
            'cart_coins_conversion_rate',
            'cart_drawer_pinned_upsells',
            'theme_primary_color',
            'theme_background_color',
            'theme_border_radius',
            'theme_font_heading',
            'theme_font_body',
            'homepage_section_order'
        ];

        $settings = SystemSetting::whereIn('key', $publicKeys)->get();

        $publicSettings = [];
        $booleanKeys = [
            'google_auth_enabled', 
            'otp_enabled', 
            'razorpay_enabled', 
            'stripe_enabled', 
            'payu_enabled', 
            'phonepe_enabled', 
            'cod_enabled',
            'cart_free_shipping_enabled',
            'checkout_order_notes_enabled',
            'checkout_save_address_default',
            'cart_drawer_enable_rewards',
            'cart_drawer_enable_coupons',
            'cart_drawer_enable_coins',
            'cart_drawer_enable_upsell',
            'cart_drawer_enable_delivery_note'
        ];

        foreach ($settings as $setting) {
            $val = $setting->value;
            if (in_array($setting->key, $booleanKeys)) {
                $val = filter_var($val, FILTER_VALIDATE_BOOLEAN);
            }
            $publicSettings[$setting->key] = $val;
        }

        // Add defaults if they are missing
        if (!isset($publicSettings['google_auth_enabled'])) $publicSettings['google_auth_enabled'] = false;
        if (!isset($publicSettings['google_client_id'])) $publicSettings['google_client_id'] = '';
        if (!isset($publicSettings['otp_enabled'])) $publicSettings['otp_enabled'] = true;
        if (!isset($publicSettings['razorpay_enabled'])) $publicSettings['razorpay_enabled'] = true;
        if (!isset($publicSettings['razorpay_key'])) $publicSettings['razorpay_key'] = '';
        if (!isset($publicSettings['stripe_enabled'])) $publicSettings['stripe_enabled'] = false;
        if (!isset($publicSettings['stripe_key'])) $publicSettings['stripe_key'] = '';
        if (!isset($publicSettings['payu_enabled'])) $publicSettings['payu_enabled'] = false;
        if (!isset($publicSettings['payu_merchant_key'])) $publicSettings['payu_merchant_key'] = '';
        if (!isset($publicSettings['phonepe_enabled'])) $publicSettings['phonepe_enabled'] = false;
        if (!isset($publicSettings['phonepe_merchant_id'])) $publicSettings['phonepe_merchant_id'] = '';
        if (!isset($publicSettings['cod_enabled'])) $publicSettings['cod_enabled'] = true;
        if (!isset($publicSettings['cart_free_shipping_enabled'])) $publicSettings['cart_free_shipping_enabled'] = true;
        if (!isset($publicSettings['cart_free_shipping_threshold'])) $publicSettings['cart_free_shipping_threshold'] = 500;
        if (!isset($publicSettings['checkout_secure_badge_text'])) $publicSettings['checkout_secure_badge_text'] = '100% Safe & Secure Checkout';
        if (!isset($publicSettings['checkout_order_notes_enabled'])) $publicSettings['checkout_order_notes_enabled'] = true;
        if (!isset($publicSettings['checkout_save_address_default'])) $publicSettings['checkout_save_address_default'] = true;
        if (!isset($publicSettings['cart_drawer_primary_color'])) $publicSettings['cart_drawer_primary_color'] = '#16A34A';
        if (!isset($publicSettings['cart_drawer_animation_speed'])) $publicSettings['cart_drawer_animation_speed'] = 300;
        if (!isset($publicSettings['cart_drawer_title'])) $publicSettings['cart_drawer_title'] = 'YOUR CART';
        if (!isset($publicSettings['cart_drawer_logo_url'])) $publicSettings['cart_drawer_logo_url'] = '';
        if (!isset($publicSettings['cart_drawer_urgency_text'])) $publicSettings['cart_drawer_urgency_text'] = 'Get free items by meeting checkout milestones!';
        if (!isset($publicSettings['cart_drawer_empty_text'])) $publicSettings['cart_drawer_empty_text'] = 'Your cart is empty';
        if (!isset($publicSettings['cart_drawer_empty_cta_label'])) $publicSettings['cart_drawer_empty_cta_label'] = 'Continue Shopping';
        if (!isset($publicSettings['cart_drawer_secure_text'])) $publicSettings['cart_drawer_secure_text'] = '100% Safe & Secure Checkout';
        if (!isset($publicSettings['cart_drawer_checkout_cta_label'])) $publicSettings['cart_drawer_checkout_cta_label'] = 'Checkout';
        if (!isset($publicSettings['cart_drawer_reviews_text'])) $publicSettings['cart_drawer_reviews_text'] = 'Trustified & Certified wellness products';
        if (!isset($publicSettings['cart_drawer_upsell_title'])) $publicSettings['cart_drawer_upsell_title'] = 'Best offers';
        if (!isset($publicSettings['cart_drawer_upsell_mode'])) $publicSettings['cart_drawer_upsell_mode'] = 'ai';
        if (!isset($publicSettings['cart_drawer_enable_rewards'])) $publicSettings['cart_drawer_enable_rewards'] = true;
        if (!isset($publicSettings['cart_drawer_enable_coupons'])) $publicSettings['cart_drawer_enable_coupons'] = true;
        if (!isset($publicSettings['cart_drawer_enable_coins'])) $publicSettings['cart_drawer_enable_coins'] = true;
        if (!isset($publicSettings['cart_drawer_enable_upsell'])) $publicSettings['cart_drawer_enable_upsell'] = true;
        if (!isset($publicSettings['cart_drawer_enable_delivery_note'])) $publicSettings['cart_drawer_enable_delivery_note'] = true;
        if (!isset($publicSettings['cart_coins_earn_percentage'])) $publicSettings['cart_coins_earn_percentage'] = 5.0;
        if (!isset($publicSettings['cart_coins_max_earn_limit'])) $publicSettings['cart_coins_max_earn_limit'] = 500.00;
        if (!isset($publicSettings['cart_coins_conversion_rate'])) $publicSettings['cart_coins_conversion_rate'] = 1.0;
        if (!isset($publicSettings['cart_drawer_pinned_upsells'])) $publicSettings['cart_drawer_pinned_upsells'] = '[]';
        if (!isset($publicSettings['theme_primary_color'])) $publicSettings['theme_primary_color'] = '#052326';
        if (!isset($publicSettings['theme_background_color'])) $publicSettings['theme_background_color'] = '#F8F3EF';
        if (!isset($publicSettings['theme_border_radius'])) $publicSettings['theme_border_radius'] = '12px';
        if (!isset($publicSettings['theme_font_heading'])) $publicSettings['theme_font_heading'] = 'Manrope';
        if (!isset($publicSettings['theme_font_body'])) $publicSettings['theme_font_body'] = 'Inter';
        if (!isset($publicSettings['homepage_section_order'])) $publicSettings['homepage_section_order'] = 'hero,stats,purpose,partners,consultation,testimonials,marquee';

        return response()->json($publicSettings);
    }
}
