<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$order = App\Models\Order::with('items')->find(30);
if ($order) {
    echo "Order 30 status: '{$order->status}', payment_status: '{$order->payment_status}', payment_method: '{$order->payment_method}', created_at: '{$order->created_at}', updated_at: '{$order->updated_at}'\n";
    foreach ($order->items as $item) {
        echo "  Item ID: {$item->id}, Product: '{$item->product_name}', Seller: {$item->seller_id}, Total: {$item->total}\n";
        $sellerId = $item->seller_id;
    }
}

if (isset($sellerId)) {
    $wallet = App\Models\SellerWallet::where('seller_id', $sellerId)->first();
    if ($wallet) {
        echo "\nSeller Wallet:\n";
        echo "  Total Earnings: {$wallet->total_earnings}\n";
        echo "  Pending Amount: {$wallet->pending_amount}\n";
        echo "  Available Balance: {$wallet->available_balance}\n";
        echo "  Paid Amount: {$wallet->paid_amount}\n";
        echo "  On Hold Amount: {$wallet->on_hold_amount}\n";
    }
}

echo "\nTransactions:\n";
$txns = App\Models\SellerTransaction::where('order_id', 30)->get();
foreach ($txns as $t) {
    echo "Txn ID: {$t->id}, Type: '{$t->type}', Amount: {$t->amount}, Rec Status: '{$t->reconciliation_status}', Created: '{$t->created_at}'\n";
    echo "  Metadata: " . json_encode($t->metadata) . "\n";
}

$seller = App\Models\User::find(5);
$brand = App\Models\Brand::where('user_id', 5)->first();
echo "\nSeller 5 Name: '{$seller->name}', Brand: '" . ($brand ? $brand->name : 'N/A') . "'\n";
