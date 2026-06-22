<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\SellerWallet;
use App\Models\SellerTransaction;
use App\Services\WalletService;

$sellerId = 5;
$seller = User::with('sellerProfile')->find($sellerId);
if (!$seller) {
    die("Seller with ID {$sellerId} not found.\n");
}

echo "Seller Brand: '" . ($seller->sellerProfile->brand_name ?? 'N/A') . "'\n";

$wallet = SellerWallet::where('seller_id', $sellerId)->first();
if ($wallet) {
    echo "Before Simulating Release:\n";
    echo "  Total Earnings: {$wallet->total_earnings}\n";
    echo "  Pending Amount: {$wallet->pending_amount}\n";
    echo "  Available Balance: {$wallet->available_balance}\n";
    echo "  Paid Amount: {$wallet->paid_amount}\n";
}

// Find transaction 26 or transaction associated with order 30
$txn = SellerTransaction::where('order_id', 30)->where('seller_id', $sellerId)->first();
if ($txn) {
    echo "Updating Transaction #{$txn->id} to be older than 7 days and reconciled...\n";
    $txn->reconciliation_status = 'reconciled';
    $txn->created_at = now()->subDays(8);
    
    $meta = $txn->metadata ?? [];
    $meta['hold_until'] = now()->subDays(1)->toDateTimeString();
    $meta['escrow_status'] = 'held'; // must be held to be eligible for release
    $txn->metadata = $meta;
    
    $txn->save();
}

echo "Running WalletService->releaseEscrowBalances()...\n";
$service = new WalletService();
$result = $service->releaseEscrowBalances();
print_r($result);

// Refresh wallet
$wallet->refresh();
echo "\nAfter Simulating Release:\n";
echo "  Total Earnings: {$wallet->total_earnings}\n";
echo "  Pending Amount: {$wallet->pending_amount}\n";
echo "  Available Balance: {$wallet->available_balance}\n";
echo "  Paid Amount: {$wallet->paid_amount}\n";
