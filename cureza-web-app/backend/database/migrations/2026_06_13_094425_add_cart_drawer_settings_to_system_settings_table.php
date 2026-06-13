<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $defaults = [
            ['key' => 'cart_drawer_primary_color', 'value' => '#16A34A', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_animation_speed', 'value' => '300', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_title', 'value' => 'YOUR CART', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_logo_url', 'value' => '', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_urgency_text', 'value' => 'Get free items by meeting checkout milestones!', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_empty_text', 'value' => 'Your cart is empty', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_empty_cta_label', 'value' => 'Continue Shopping', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_secure_text', 'value' => '100% Safe & Secure Checkout', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_checkout_cta_label', 'value' => 'Checkout', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_reviews_text', 'value' => 'Trustified & Certified wellness products', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_upsell_title', 'value' => 'Best offers', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_upsell_mode', 'value' => 'ai', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_enable_rewards', 'value' => '1', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_enable_coupons', 'value' => '1', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_enable_coins', 'value' => '1', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_enable_upsell', 'value' => '1', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_drawer_enable_delivery_note', 'value' => '1', 'group' => 'cart_drawer', 'is_secret' => false],
            ['key' => 'cart_coins_earn_percentage', 'value' => '5.0', 'group' => 'cart_coins', 'is_secret' => false],
            ['key' => 'cart_coins_max_earn_limit', 'value' => '500.00', 'group' => 'cart_coins', 'is_secret' => false],
            ['key' => 'cart_coins_conversion_rate', 'value' => '1.0', 'group' => 'cart_coins', 'is_secret' => false],
        ];

        foreach ($defaults as $default) {
            \Illuminate\Support\Facades\DB::table('system_settings')->updateOrInsert(
                ['key' => $default['key']],
                array_merge($default, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $keys = [
            'cart_drawer_primary_color', 'cart_drawer_animation_speed', 'cart_drawer_title', 'cart_drawer_logo_url',
            'cart_drawer_urgency_text', 'cart_drawer_empty_text', 'cart_drawer_empty_cta_label', 'cart_drawer_secure_text',
            'cart_drawer_checkout_cta_label', 'cart_drawer_reviews_text', 'cart_drawer_upsell_title', 'cart_drawer_upsell_mode',
            'cart_drawer_enable_rewards', 'cart_drawer_enable_coupons', 'cart_drawer_enable_coins', 'cart_drawer_enable_upsell',
            'cart_drawer_enable_delivery_note', 'cart_coins_earn_percentage', 'cart_coins_max_earn_limit', 'cart_coins_conversion_rate'
        ];
        \Illuminate\Support\Facades\DB::table('system_settings')->whereIn('key', $keys)->delete();
    }
};
