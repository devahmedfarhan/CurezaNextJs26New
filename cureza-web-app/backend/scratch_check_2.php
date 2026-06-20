<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\SellerTransaction;

$seller = User::where('role', 'vendor')->first();
echo "Seller: {$seller->name} (ID: {$seller->id})\n\n";

$txns = SellerTransaction::where('seller_id', $seller->id)->get();
foreach ($txns as $txn) {
    echo "TXN ID: {$txn->id} | Order ID: {$txn->order_id} | Amount: ₹" . number_format($txn->amount, 2) . "\n";
    echo "  TCS: ₹" . number_format($txn->tcs_deduction, 2) . " | TDS: ₹" . number_format($txn->tds_deduction, 2) . "\n";
    echo "  Metadata: " . json_encode($txn->metadata) . "\n\n";
}
