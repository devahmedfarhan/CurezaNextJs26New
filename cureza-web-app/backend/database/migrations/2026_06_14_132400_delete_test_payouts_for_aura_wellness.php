<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Payout;
use App\Models\SellerWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DeleteTestPayoutsForAuraWellness extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $sellerId = 5; // Aura Wellness user ID from debug dump

        Log::info("Reverting test payouts and resetting wallet for Seller ID = {$sellerId}");

        // 1. Delete Payout Request ID 3
        $payout = Payout::find(3);
        if ($payout) {
            Log::info("Deleting Payout ID #3: Amount = {$payout->requested_amount}, Status = {$payout->status}");
            $payout->delete();
        }

        // 2. Delete any transaction logs referencing payout ID 3
        DB::table('transaction_logs')
            ->where('wallet_type', 'seller')
            ->where('description', 'like', '%payout%')
            ->delete();

        // 3. Reset wallet paid_amount to 0 and ensure correct balance
        $wallet = SellerWallet::where('seller_id', $sellerId)->first();
        if ($wallet) {
            Log::info("Original Wallet: Earnings = {$wallet->total_earnings}, Available = {$wallet->available_balance}, Paid = {$wallet->paid_amount}");
            $wallet->paid_amount = 0.00;
            $wallet->pending_amount = 0.00;
            $wallet->on_hold_amount = 0.00;
            $wallet->available_balance = 8198.54; // Earning 15 (6749.26) + Earning 16 (1449.28)
            $wallet->total_earnings = 8198.54;
            $wallet->save();
            Log::info("Updated Wallet: Earnings = {$wallet->total_earnings}, Available = {$wallet->available_balance}, Paid = {$wallet->paid_amount}");
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // No rollback
    }
}
