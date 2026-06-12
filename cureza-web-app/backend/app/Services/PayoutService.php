<?php

namespace App\Services;

use App\Models\Payout;
use App\Models\SellerWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayoutService
{
    protected $walletService;

    public function __construct()
    {
        $this->walletService = new WalletService();
    }

    /**
     * Request payout
     * 
     * @param int $sellerId
     * @param float $amount
     * @param array $bankDetails
     * @return Payout
     */
    public function requestPayout($sellerId, $amount, $bankDetails = [])
    {
        DB::beginTransaction();
        try {
            $wallet = SellerWallet::where('seller_id', $sellerId)->first();

            if (!$wallet || $wallet->available_balance < $amount) {
                throw new \Exception("Insufficient balance. Available: ₹" . ($wallet->available_balance ?? 0));
            }

            // Minimum payout amount check
            if ($amount < 100) {
                throw new \Exception("Minimum payout amount is ₹100");
            }

            // Create payout request
            $payout = Payout::create([
                'seller_id' => $sellerId,
                'user_id' => $sellerId, // For backward compatibility
                'requested_amount' => $amount,
                'amount' => $amount,
                'status' => 'pending',
                'bank_details' => $bankDetails,
                'requested_at' => now(),
            ]);

            DB::commit();
            Log::info("Payout request created for seller {$sellerId}, amount: ₹{$amount}");
            return $payout;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to create payout request for seller {$sellerId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get eligible amount for payout
     * 
     * @param int $sellerId
     * @return float
     */
    public function getEligibleAmount($sellerId)
    {
        $wallet = SellerWallet::where('seller_id', $sellerId)->first();
        return $wallet ? $wallet->available_balance : 0;
    }

    /**
     * Approve payout
     * 
     * @param int $payoutId
     * @param int $adminId
     * @param string|null $transactionRef
     * @param float|null $approvedAmount
     * @return Payout
     */
    public function approvePayout($payoutId, $adminId, $transactionRef = null, $approvedAmount = null)
    {
        DB::beginTransaction();
        try {
            $payout = Payout::findOrFail($payoutId);

            if ($payout->status !== 'pending') {
                throw new \Exception("Payout is not in pending status");
            }

            $amount = $approvedAmount ?? $payout->requested_amount;

            // Process wallet deduction
            $this->walletService->processPayout(
                $payout->seller_id,
                $payout->id,
                $amount,
                "Payout #{$payout->id} approved and processed"
            );

            // Update payout status
            $payout->approve($adminId, $amount, $transactionRef);

            DB::commit();
            Log::info("Payout #{$payoutId} approved by admin {$adminId}");
            return $payout;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to approve payout #{$payoutId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Reject payout
     * 
     * @param int $payoutId
     * @param int $adminId
     * @param string|null $reason
     * @return Payout
     */
    public function rejectPayout($payoutId, $adminId, $reason = null)
    {
        DB::beginTransaction();
        try {
            $payout = Payout::findOrFail($payoutId);

            if ($payout->status !== 'pending') {
                throw new \Exception("Payout is not in pending status");
            }

            // Update payout status
            $payout->reject($adminId, $reason);

            DB::commit();
            Log::info("Payout #{$payoutId} rejected by admin {$adminId}");
            return $payout;

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to reject payout #{$payoutId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get payout history for seller
     * 
     * @param int $sellerId
     * @param array $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPayoutHistory($sellerId, $filters = [])
    {
        $query = Payout::where('seller_id', $sellerId)
            ->with(['processedBy'])
            ->orderBy('requested_at', 'desc');

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['start_date'])) {
            $query->where('requested_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('requested_at', '<=', $filters['end_date']);
        }

        $perPage = $filters['per_page'] ?? 15;
        return $query->paginate($perPage);
    }

    /**
     * Get all pending payouts (for admin)
     * 
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPendingPayouts($perPage = 15)
    {
        return Payout::with(['seller', 'seller.sellerProfile'])
            ->where('status', 'pending')
            ->orderBy('requested_at', 'asc')
            ->paginate($perPage);
    }

    /**
     * Get payout statistics for admin
     * 
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function getPayoutStatistics($startDate = null, $endDate = null)
    {
        $query = Payout::query();

        if ($startDate) {
            $query->where('requested_at', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('requested_at', '<=', $endDate);
        }

        $pending = (clone $query)->where('status', 'pending')->sum('requested_amount');
        $approved = (clone $query)->where('status', 'approved')->sum('approved_amount');
        $rejected = (clone $query)->where('status', 'rejected')->count();

        return [
            'pending_amount' => round($pending, 2),
            'approved_amount' => round($approved, 2),
            'rejected_count' => $rejected,
            'total_requests' => $query->count(),
        ];
    }
}
