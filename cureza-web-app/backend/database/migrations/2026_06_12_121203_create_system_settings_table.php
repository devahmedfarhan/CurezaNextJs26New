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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->index();
            $table->text('value')->nullable();
            $table->string('group')->index();
            $table->boolean('is_secret')->default(false);
            $table->timestamps();
        });

        // Insert defaults
        $defaults = [
            // Email Group
            ['key' => 'mail_host', 'value' => '127.0.0.1', 'group' => 'email', 'is_secret' => false],
            ['key' => 'mail_port', 'value' => '2525', 'group' => 'email', 'is_secret' => false],
            ['key' => 'mail_username', 'value' => null, 'group' => 'email', 'is_secret' => false],
            ['key' => 'mail_password', 'value' => null, 'group' => 'email', 'is_secret' => true],
            ['key' => 'mail_encryption', 'value' => null, 'group' => 'email', 'is_secret' => false],
            ['key' => 'mail_from_address', 'value' => 'hello@example.com', 'group' => 'email', 'is_secret' => false],
            ['key' => 'mail_from_name', 'value' => 'Cureza', 'group' => 'email', 'is_secret' => false],

            // Google OAuth Group
            ['key' => 'google_auth_enabled', 'value' => '0', 'group' => 'google', 'is_secret' => false],
            ['key' => 'google_client_id', 'value' => '', 'group' => 'google', 'is_secret' => false],
            ['key' => 'google_client_secret', 'value' => '', 'group' => 'google', 'is_secret' => true],

            // Razorpay Payment Group
            ['key' => 'razorpay_enabled', 'value' => '1', 'group' => 'payment', 'is_secret' => false],
            ['key' => 'razorpay_key', 'value' => 'rzp_test_123456789', 'group' => 'payment', 'is_secret' => false],
            ['key' => 'razorpay_secret', 'value' => '', 'group' => 'payment', 'is_secret' => true],
            ['key' => 'razorpay_webhook_secret', 'value' => '', 'group' => 'payment', 'is_secret' => true],

            // OTP Group
            ['key' => 'otp_enabled', 'value' => '1', 'group' => 'otp', 'is_secret' => false],
            ['key' => 'otp_expiry_minutes', 'value' => '3', 'group' => 'otp', 'is_secret' => false],
            ['key' => 'otp_length', 'value' => '4', 'group' => 'otp', 'is_secret' => false],
        ];

        foreach ($defaults as $default) {
            DB::table('system_settings')->insert(array_merge($default, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
