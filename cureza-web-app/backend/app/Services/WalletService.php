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
     * Get wallet for update (locked)
     * 
     * @param int $sellerId
     * @return SellerWallet
     */
    private function getWalletForUpdate($sellerId)
    {
        $wallet = SellerWallet::where('seller_id', $sellerId)->lockForUpdate()->first();
        if (!$wallet) {
            $this->initializeWallet($sellerId);
            $wallet = SellerWallet::where('seller_id', $sellerId)->lockForUpdate()->first();
        }
        return $wallet;
    }

    /**
     * Credit earnings to seller wallet (with 7-day escrow hold)
     * 
     * @param int $sellerId
     * @param int $orderId
     * @param float $amount
     * @param string $description
     * @param array $metadata
     * @param float $tcs
     * @param float $tds
     * @param string $reconciliationStatus
     * @return bool
     */
    public function creditEarnings($sellerId, $orderId, $amount, $description, $metadata = [], $tcs = 0.00, $tds = 0.00, $reconciliationStatus = 'pending')
    {
        DB::beginTransaction();
        try {
            $wallet = $this->getWalletForUpdate($sellerId);
            $balanceBefore = $wallet->available_balance;

            // Credit to pending_amount for the 7-day escrow period
            $wallet->total_earnings += $amount;
            $wallet->pending_amount += $amount;
            $wallet->save();

            // Record transaction
            SellerTransaction::create([
                'seller_id' => $sellerId,
                'order_id' => $orderId,
                'type' => SellerTransaction::TYPE_EARNING,
                'amount' => $amount,
                'tcs_deduction' => $tcs,
                'tds_deduction' => $tds,
                'reconciliation_status' => $reconciliationStatus,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance, // available_balance unchanged
                'description' => $description,
                'metadata' => array_merge($metadata, [
                    'hold_until' => now()->addDays(7)->toDateTimeString(),
                    'escrow_status' => 'held'
                ]),
            ]);

            // Audit transaction log
            DB::table('transaction_logs')->insert([
                'wallet_type' => 'seller',
                'wallet_id' => $wallet->id,
                'action' => 'credit_earnings',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);

            DB::commit();
            Log::info("Credited ₹{$amount} to seller {$sellerId} wallet pending_amount (held for 7 days escrow)");
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
    public function debitAmount($sellerId, $orderId, $amount, $description, $type = 'adjustment', $payoutId = null, $metadata = [], $tcs = 0.00, $tds = 0.00)
    {
        DB::beginTransaction();
        try {
            $wallet = $this->getWalletForUpdate($sellerId);
            $balanceBefore = $wallet->available_balance;

            if ($type === 'refund') {
                // Deduct from total earnings
                $wallet->total_earnings -= $amount;

                // Smart routing of debits between pending and available balances
                if ($wallet->pending_amount >= $amount) {
                    $wallet->pending_amount -= $amount;
                } else {
                    $remaining = $amount - $wallet->pending_amount;
                    $wallet->pending_amount = 0;
                    $wallet->available_balance -= $remaining;
                }
            } else {
                // Deduct directly from available balance (e.g. payouts, non-refund adjustments)
                // Balance is allowed to go negative to prevent deadlocks on required adjustments
                $wallet->available_balance -= $amount;
            }
            $wallet->save();

            // Record transaction
            SellerTransaction::create([
                'seller_id' => $sellerId,
                'order_id' => $orderId,
                'payout_id' => $payoutId,
                'type' => $type,
                'amount' => $amount,
                'tcs_deduction' => $tcs,
                'tds_deduction' => $tds,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => $description,
                'metadata' => $metadata,
            ]);

            // Audit transaction log
            DB::table('transaction_logs')->insert([
                'wallet_type' => 'seller',
                'wallet_id' => $wallet->id,
                'action' => 'debit_amount',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
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
            $wallet = $this->getWalletForUpdate($sellerId);
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

            // Audit transaction log
            DB::table('transaction_logs')->insert([
                'wallet_type' => 'seller',
                'wallet_id' => $wallet->id,
                'action' => 'process_payout',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
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
            $wallet = $this->getWalletForUpdate($sellerId);
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

            // Audit transaction log
            DB::table('transaction_logs')->insert([
                'wallet_type' => 'seller',
                'wallet_id' => $wallet->id,
                'action' => 'put_on_hold',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => "Amount put on hold: {$reason}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
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
            $wallet = $this->getWalletForUpdate($sellerId);

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

            // Audit transaction log
            DB::table('transaction_logs')->insert([
                'wallet_type' => 'seller',
                'wallet_id' => $wallet->id,
                'action' => 'release_from_hold',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->available_balance,
                'description' => "Amount released from hold: {$reason}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
            ]);

            DB::commit();
            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Release escrowed balances older than 7 days
     */
    public function releaseEscrowBalances()
    {
        DB::beginTransaction();
        try {
            $cutoff = now()->subDays(7);
            
            // Find transactions held that are past the cutoff
            $transactions = SellerTransaction::where('type', SellerTransaction::TYPE_EARNING)
                ->where('created_at', '<=', $cutoff)
                ->get()
                ->filter(function ($tx) {
                    $meta = $tx->metadata ?? [];
                    return isset($meta['escrow_status']) && $meta['escrow_status'] === 'held';
                });

            $releasedCount = 0;
            $releasedAmount = 0;

            foreach ($transactions as $tx) {
                $wallet = $this->getWalletForUpdate($tx->seller_id);
                $amount = (float)$tx->amount;

                if ($wallet->pending_amount >= $amount) {
                    $balanceBefore = $wallet->available_balance;
                    
                    // Move from pending to available
                    $wallet->pending_amount -= $amount;
                    $wallet->available_balance += $amount;
                    $wallet->save();

                    // Mark transaction metadata as released
                    $meta = $tx->metadata ?? [];
                    $meta['escrow_status'] = 'released';
                    $meta['released_at'] = now()->toDateTimeString();
                    $tx->metadata = $meta;
                    $tx->save();

                    // Record adjustment transaction for auditability
                    SellerTransaction::create([
                        'seller_id' => $tx->seller_id,
                        'order_id' => $tx->order_id,
                        'type' => SellerTransaction::TYPE_ADJUSTMENT,
                        'amount' => $amount,
                        'balance_before' => $balanceBefore,
                        'balance_after' => $wallet->available_balance,
                        'description' => "Escrow released for Order #{$tx->order_id}",
                        'metadata' => ['original_transaction_id' => $tx->id],
                    ]);

                    $releasedCount++;
                    $releasedAmount += $amount;
                }
            }

            DB::commit();
            Log::info("Released escrow for {$releasedCount} transactions, total amount: ₹{$releasedAmount}");
            return [
                'released_count' => $releasedCount,
                'released_amount' => $releasedAmount
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to release escrow balances: " . $e->getMessage());
            throw $e;
        }
    }
}
