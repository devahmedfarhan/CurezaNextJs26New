<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\SellerTransaction;
use App\Models\SellerWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanUpAdjustmentTransactions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $adjustments = SellerTransaction::whereIn('id', [17, 19])->get();
        $affectedSellers = [];

        foreach ($adjustments as $adj) {
            $orderId = $adj->order_id;
            $sellerId = $adj->seller_id;
            $adjAmount = (float)$adj->amount;
            $affectedSellers[$sellerId] = true;

            Log::info("Processing clean up for Adjustment ID #{$adj->id}: Order ID = {$orderId}, Seller ID = {$sellerId}, Amount = {$adjAmount}");

            if ($orderId) {
                // Find the original earning transaction for this order
                $origTxn = SellerTransaction::where('order_id', $orderId)
                    ->where('seller_id', $sellerId)
                    ->where('type', 'earning')
                    ->whereNotIn('id', [17, 19])
                    ->first();

                if ($origTxn) {
                    Log::info("Found original transaction ID #{$origTxn->id}. Updating amount from {$origTxn->amount} to " . ($origTxn->amount + $adjAmount));
                    
                    // Add the gateway fee back to the original earning transaction
                    $origTxn->amount = (float)$origTxn->amount + $adjAmount;

                    // Update metadata
                    $meta = $origTxn->metadata ?? [];
                    $meta['gateway_fee'] = 0.00;
                    $meta['gateway_percentage'] = 0.00;
                    $origTxn->metadata = $meta;
                    $origTxn->save();
                } else {
                    Log::warning("Original transaction not found for Order ID = {$orderId}, Seller ID = {$sellerId}");
                }
            }

            // Delete the adjustment transaction
            $adj->delete();
        }

        // Clean up transaction logs for 17 and 19
        DB::table('transaction_logs')
            ->where('wallet_type', 'seller')
            ->where(function($q) {
                $q->where('description', 'like', '%17%')
                  ->orWhere('description', 'like', '%19%');
            })
            ->delete();

        // Recalculate running balances for all affected sellers
        foreach (array_keys($affectedSellers) as $sellerId) {
            Log::info("Recalculating running balances for Seller ID = {$sellerId}");

            $txns = SellerTransaction::where('seller_id', $sellerId)
                ->orderBy('id', 'asc')
                ->get();

            $runningBalance = 0.00;
            foreach ($txns as $txn) {
                $isCredit = in_array($txn->type, ['earning', 'adjustment']);
                $txn->balance_before = $runningBalance;
                
                if ($isCredit) {
                    $txn->balance_after = $runningBalance + (float)$txn->amount;
                } else {
                    $txn->balance_after = $runningBalance - (float)$txn->amount;
                }
                
                $txn->save();
                $runningBalance = $txn->balance_after;
            }

            // Update wallet balance to match the recalculated final running balance
            $wallet = SellerWallet::where('seller_id', $sellerId)->first();
            if ($wallet) {
                Log::info("Updating wallet for Seller ID = {$sellerId} to match final running balance: {$runningBalance}");
                $wallet->available_balance = $runningBalance;
                
                // Recalculate total earnings from transaction history
                $totalEarnings = SellerTransaction::where('seller_id', $sellerId)
                    ->whereIn('type', ['earning', 'adjustment'])
                    ->sum('amount');
                $wallet->total_earnings = $totalEarnings;
                $wallet->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // No rollback needed
    }
}
