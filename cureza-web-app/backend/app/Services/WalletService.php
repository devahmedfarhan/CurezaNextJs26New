<?php

namespace App\Services;

use App\Models\SellerWallet;
use App\Models\SellerTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletService
{
    /**
     * Initialize wallet for a seller
     * 
     * @param int $sellerId
     * @return SellerWallet
     */
    public function initializeWallet($sellerId)
    {
        return SellerWallet::firstOrCreate(
            ['seller_id' => $sellerId],
            [
                'total_earnings' => 0,
                'pending_amount' => 0,
                'available_balance' => 0,
                'paid_amount' => 0,
                'on_hold_amount' => 0,
            ]
        );
    }

    /**
     * Credit earnings to seller wallet
     * 
     * @param int $sellerId
     * @param int $orderId
     * @param float $amount
     * @param string $description
     * @param array $metadata
     * @return bool
     */
    public function creditEarnings($sellerId, $orderId, $amount, $description, $metadata = [])
    {
        DB::beginTransaction();
        try {
            $wallet = $this->initializeWallet($sellerId);
            $balanceBefore = $wallet->available_balance;

            // Update wallet
            $wallet->total_earnings += $amount;
            $wallet->available_balance += $amount;
            $wallet->save();

            // Record transaction
            SellerTransaction::create([
                'seller_id' => $sellerId,
                'order_id' => $orderId,
                'type' => SellerTransaction::TYPE_EARNING,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => $description,
                'metadata' => $metadata,
            ]);

            DB::commit();
            Log::info("Credited ₹{$amount} to seller {$sellerId} wallet");
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to credit earnings to seller {$sellerId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Debit amount from seller wallet
     * 
     * @param int $sellerId
     * @param int|null $orderId
     * @param float $amount
     * @param string $description
     * @param string $type
     * @param int|null $payoutId
     * @return bool
     */
    public function debitAmount($sellerId, $orderId, $amount, $description, $type = 'adjustment', $payoutId = null)
    {
        DB::beginTransaction();
        try {
            $wallet = $this->initializeWallet($sellerId);
            $balanceBefore = $wallet->available_balance;

            if ($wallet->available_balance < $amount) {
                throw new \Exception("Insufficient balance. Available: ₹{$wallet->available_balance}, Required: ₹{$amount}");
            }

            // Update wallet
            $wallet->available_balance -= $amount;
            $wallet->save();

            // Record transaction
            SellerTransaction::create([
                'seller_id' => $sellerId,
                'order_id' => $orderId,
                'payout_id' => $payoutId,
                'type' => $type,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => $description,
                'metadata' => [],
            ]);

            DB::commit();
            Log::info("Debited ₹{$amount} from seller {$sellerId} wallet");
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to debit from seller {$sellerId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Process payout - mark amount as paid
     * 
     * @param int $sellerId
     * @param int $payoutId
     * @param float $amount
     * @param string $description
     * @return bool
     */
    public function processPayout($sellerId, $payoutId, $amount, $description)
    {
        DB::beginTransaction();
        try {
            $wallet = $this->initializeWallet($sellerId);
            $balanceBefore = $wallet->available_balance;

            if ($wallet->available_balance < $amount) {
                throw new \Exception("Insufficient balance for payout");
            }

            // Update wallet
            $wallet->available_balance -= $amount;
            $wallet->paid_amount += $amount;
            $wallet->save();

            // Record transaction
            SellerTransaction::create([
                'seller_id' => $sellerId,
                'payout_id' => $payoutId,
                'type' => SellerTransaction::TYPE_PAYOUT,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => $description,
                'metadata' => ['payout_id' => $payoutId],
            ]);

            DB::commit();
            Log::info("Processed payout of ₹{$amount} for seller {$sellerId}");
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to process payout for seller {$sellerId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get wallet balance breakdown
     * 
     * @param int $sellerId
     * @return array
     */
    public function getBalance($sellerId)
    {
        $wallet = $this->initializeWallet($sellerId);

        return [
            'total_earnings' => round($wallet->total_earnings, 2),
            'pending_amount' => round($wallet->pending_amount, 2),
            'available_balance' => round($wallet->available_balance, 2),
            'paid_amount' => round($wallet->paid_amount, 2),
            'on_hold_amount' => round($wallet->on_hold_amount, 2),
        ];
    }

    /**
     * Get transaction history
     * 
     * @param int $sellerId
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getTransactionHistory($sellerId, $filters = [])
    {
        $query = SellerTransaction::where('seller_id', $sellerId)
            ->with(['order', 'payout'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['start_date'])) {
            $query->where('created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('created_at', '<=', $filters['end_date']);
        }

        $perPage = $filters['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Put amount on hold (for disputes)
     * 
     * @param int $sellerId
     * @param int $orderId
     * @param float $amount
     * @param string $reason
     * @return bool
     */
    public function putOnHold($sellerId, $orderId, $amount, $reason)
    {
        DB::beginTransaction();
        try {
            $wallet = $this->initializeWallet($sellerId);
            $balanceBefore = $wallet->available_balance;

            if ($wallet->available_balance < $amount) {
                throw new \Exception("Insufficient available balance to put on hold");
            }

            // Update wallet
            $wallet->available_balance -= $amount;
            $wallet->on_hold_amount += $amount;
            $wallet->save();

            // Record transaction
            SellerTransaction::create([
                'seller_id' => $sellerId,
                'order_id' => $orderId,
                'type' => SellerTransaction::TYPE_ADJUSTMENT,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => "Amount put on hold: {$reason}",
                'metadata' => ['reason' => $reason, 'status' => 'on_hold'],
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Release amount from hold
     * 
     * @param int $sellerId
     * @param float $amount
     * @param string $reason
     * @return bool
     */
    public function releaseFromHold($sellerId, $amount, $reason)
    {
        DB::beginTransaction();
        try {
            $wallet = $this->initializeWallet($sellerId);

            if ($wallet->on_hold_amount < $amount) {
                throw new \Exception("Insufficient on-hold amount");
            }

            $balanceBefore = $wallet->available_balance;

            // Update wallet
            $wallet->on_hold_amount -= $amount;
            $wallet->available_balance += $amount;
            $wallet->save();

            // Record transaction
            SellerTransaction::create([
                'seller_id' => $sellerId,
                'type' => SellerTransaction::TYPE_ADJUSTMENT,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => "Amount released from hold: {$reason}",
                'metadata' => ['reason' => $reason, 'status' => 'released'],
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
