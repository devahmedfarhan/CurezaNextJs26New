<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "--- Seller Accounts & Data check (Corrected Columns) ---\n";
    $emails = [
        'seller@cureza.com',
        'aurawellness@cureza-seller.com',
        'vedicpure@cureza-seller.com',
        'hemphorizon@cureza-seller.com'
    ];
    
    foreach ($emails as $email) {
        $user = App\Models\User::where('email', $email)->first();
        if ($user) {
            $prodCount = App\Models\Product::where('seller_id', $user->id)->count();
            $orderItemsCount = App\Models\OrderItem::where('seller_id', $user->id)->count();
            $totalSales = App\Models\OrderItem::where('seller_id', $user->id)->sum('total');
            echo "Seller: '$email' (ID: {$user->id})\n";
            echo "  - Products Count (seller_id): $prodCount\n";
            echo "  - Order Items Count: $orderItemsCount\n";
            echo "  - Total Sales: ₹$totalSales\n\n";
        } else {
            echo "Seller '$email' does NOT exist.\n\n";
        }
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
