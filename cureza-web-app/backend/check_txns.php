<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$sellerId = 5;
$wallet = App\Models\SellerWallet::where('seller_id', $sellerId)->first();
if ($wallet) {
    echo "\nSeller Wallet:\n";
    echo "  Total Earnings: {$wallet->total_earnings}\n";
    echo "  Pending Amount: {$wallet->pending_amount}\n";
    echo "  Available Balance: {$wallet->available_balance}\n";
    echo "  Paid Amount: {$wallet->paid_amount}\n";
    echo "  On Hold Amount: {$wallet->on_hold_amount}\n";
}

echo "\nOrder 30 Items:\n";
$order30 = App\Models\Order::with('items')->find(30);
if ($order30) {
    foreach ($order30->items as $item) {
        echo "  Item CZ30: base_price={$item->base_price}, net_amount={$item->net_amount}, total={$item->total}\n";
    }
}

echo "\nOrder 31 Items:\n";
$order31 = App\Models\Order::with('items')->find(31);
if ($order31) {
    foreach ($order31->items as $item) {
        echo "  Item CZ31: base_price={$item->base_price}, net_amount={$item->net_amount}, total={$item->total}\n";
    }
}


echo "\nTransaction 29 full attributes:\n";
$txn29 = App\Models\SellerTransaction::find(29);
if ($txn29) {
    print_r($txn29->toArray());
}

echo "\nAll Transactions for Seller 5:\n";
$txns = App\Models\SellerTransaction::where('seller_id', $sellerId)->get();
foreach ($txns as $t) {
    echo "Txn ID: {$t->id}, Type: '{$t->type}', Amount: {$t->amount}, Rec Status: '{$t->reconciliation_status}', Order ID: '{$t->order_id}', Created: '{$t->created_at}'\n";
    echo "  Metadata: " . json_encode($t->metadata) . "\n";
}

