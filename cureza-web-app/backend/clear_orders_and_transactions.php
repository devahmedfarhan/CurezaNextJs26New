<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    echo "=========================================\n";
    echo "DELETING ALL ORDERS & TRANSACTION RECORDS\n";
    echo "=========================================\n\n";

    // 1. Delete Orders, Order Items, Shipments, Refunds
    $tablesToTruncate = [
        'order_items',
        'orders',
        'shipments',
        'refunds',
        'payouts',
        'seller_transactions',
        'wallet_transactions',
        'transaction_logs'
    ];

    foreach ($tablesToTruncate as $table) {
        $count = DB::table($table)->count();
        DB::table($table)->delete();
        echo "Table '{$table}': Deleted {$count} records.\n";
    }

    echo "\n--- Resetting Wallet Balances ---\n";

    // 2. Reset Seller Wallets to 0
    $sellerWalletCount = DB::table('seller_wallets')->count();
    DB::table('seller_wallets')->update([
        'total_earnings' => 0,
        'pending_amount' => 0,
        'available_balance' => 0,
        'paid_amount' => 0,
        'on_hold_amount' => 0,
    ]);
    echo "Reset {$sellerWalletCount} seller wallet(s) to zero balance.\n";

    // 3. Reset User Wallets to 0
    $userWalletCount = DB::table('wallets')->count();
    DB::table('wallets')->update([
        'balance' => 0,
        'points' => 0,
        'xp' => 0,
        'checkin_streak' => 0,
    ]);
    echo "Reset {$userWalletCount} customer/user wallet(s) to zero balance.\n";

    DB::commit();
    echo "\n=========================================\n";
    echo "CLEANUP COMPLETED SUCCESSFULLY!\n";
    echo "=========================================\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "Error during database cleanup: " . $e->getMessage() . "\n";
}
