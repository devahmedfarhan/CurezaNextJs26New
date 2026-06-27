<?php

// Bootstrap Laravel
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "1. Adding 'checkout_rating' column to 'orders' table if not exists...\n";
    if (!Schema::hasColumn('orders', 'checkout_rating')) {
        Schema::table('orders', function (Blueprint $table) {
            $table->integer('checkout_rating')->nullable()->after('status');
        });
        echo "Column 'checkout_rating' created successfully!\n";
    } else {
        echo "Column 'checkout_rating' already exists.\n";
    }

    echo "2. Seeding 'CUREHEALTH15' coupon into 'coupons' table...\n";
    $couponExists = DB::table('coupons')->where('code', 'CUREHEALTH15')->exists();
    if (!$couponExists) {
        DB::table('coupons')->insert([
            'code' => 'CUREHEALTH15',
            'type' => 'percent',
            'value' => 15.00,
            'min_cart_value' => 0.00,
            'is_active' => true,
            'expires_at' => now()->addYears(5),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "Coupon 'CUREHEALTH15' created successfully!\n";
    } else {
        echo "Coupon 'CUREHEALTH15' already exists.\n";
    }
    
    echo "Setup completed successfully!\n";

} catch (\Exception $e) {
    echo "Error during setup: " . $e->getMessage() . "\n";
}
