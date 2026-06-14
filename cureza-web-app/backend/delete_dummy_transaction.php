<?php

use App\Models\SellerWallet;
use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Delete the dummy seeded transactions if any remain
$deletedTxns = DB::table('seller_transactions')
    ->where('description', 'like', '%Order #10023%')
    ->delete();

if ($deletedTxns > 0) {
    echo "Deleted {$deletedTxns} remaining dummy transactions.\n";
}

// 2. Delete the dummy pending payouts
$deletedPayouts = DB::table('payouts')
    ->where(function($query) {
        $query->where('bank_details', 'like', '%1234567890%')
              ->orWhere('bank_details', 'like', '%SBIN0000001%');
    })
    ->delete();

if ($deletedPayouts > 0) {
    echo "Deleted {$deletedPayouts} dummy payout requests.\n";
}

// 3. Correct transaction balance logs chronologically for each seller
$wallets = SellerWallet::all();

foreach ($wallets as $wallet) {
    $sellerId = $wallet->seller_id;

    // Get all transactions chronologically (oldest first)
    $txns = DB::table('seller_transactions')
        ->where('seller_id', $sellerId)
        ->orderBy('created_at', 'asc')
        ->get();

    $runningBalance = 0;
    foreach ($txns as $txn) {
        $balanceBefore = $runningBalance;
        
        // Earning adds to balance, payouts/refunds subtract from balance
        if ($txn->type === 'earning') {
            $runningBalance += $txn->amount;
        } else {
            $runningBalance -= $txn->amount;
        }
        
        $balanceAfter = $runningBalance;

        // Update database with correct calculations
        DB::table('seller_transactions')
            ->where('id', $txn->id)
            ->update([
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter
            ]);
    }

    // Sum of actual earnings transactions
    $totalEarnings = DB::table('seller_transactions')
        ->where('seller_id', $sellerId)
        ->where('type', 'earning')
        ->sum('amount');

    // Sum of approved payouts
    $paidAmount = DB::table('payouts')
        ->where('seller_id', $sellerId)
        ->where('status', 'approved')
        ->sum('approved_amount');

    // Sum of pending payouts
    $pendingAmount = DB::table('payouts')
        ->where('seller_id', $sellerId)
        ->where('status', 'pending')
        ->sum('requested_amount');

    // Update wallet balance fields
    $wallet->total_earnings = $totalEarnings;
    $wallet->paid_amount = $paidAmount;
    $wallet->pending_amount = $pendingAmount;
    $wallet->available_balance = $totalEarnings - $paidAmount - $pendingAmount;
    $wallet->save();

    echo "Recalculated & Corrected Seller ID {$sellerId} wallet:\n";
    echo "  Total Earnings (TVL): ₹" . number_format($totalEarnings, 2) . "\n";
    echo "  Paid Amount (Successfully Injected): ₹" . number_format($paidAmount, 2) . "\n";
    echo "  Pending Amount (In-Flight Pipeline): ₹" . number_format($pendingAmount, 2) . "\n";
    echo "  Available Balance (Liquid Now): ₹" . number_format($wallet->available_balance, 2) . "\n";
    echo "  Recalculated transaction count: " . count($txns) . "\n\n";
}

echo "All seller transaction ledger balances recalculated chronologically!\n";
