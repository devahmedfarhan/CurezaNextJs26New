<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payout;
use App\Services\PayoutService;
use App\Services\WalletService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PayoutController extends Controller
{
    protected $payoutService;
    protected $walletService;

    public function __construct()
    {
        $this->payoutService = new PayoutService();
        $this->walletService = new WalletService();
    }

    /**
     * Get all payouts with filters
     * GET /api/admin/payouts
     */
    public function index(Request $request)
    {
        $query = Payout::with(['seller', 'seller.sellerProfile', 'processedBy'])
            ->orderBy('requested_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        if ($request->has('start_date')) {
            $query->where('requested_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('requested_at', '<=', $request->end_date);
        }

        $perPage = $request->input('per_page', 15);
        $payouts = $query->paginate($perPage);

        return response()->json($payouts);
    }

    /**
     * Get payout details
     * GET /api/admin/payouts/{id}
     */
    public function show($id)
    {
        $payout = Payout::with([
            'seller',
            'seller.sellerProfile',
            'seller.sellerWallet',
            'processedBy',
            'transactions'
        ])->findOrFail($id);

        \Illuminate\Support\Facades\Gate::authorize('view', $payout);

        // Get seller's recent transactions
        $recentTransactions = $this->walletService->getTransactionHistory(
            $payout->seller_id,
            ['per_page' => 10]
        );

        return response()->json([
            'payout' => $payout,
            'recent_transactions' => $recentTransactions,
        ]);
    }

    /**
     * Get pending payouts
     * GET /api/admin/payouts/pending
     */
    public function pending(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $payouts = $this->payoutService->getPendingPayouts($perPage);

        return response()->json($payouts);
    }

    /**
     * Approve payout
     * POST /api/admin/payouts/{id}/approve
     */
    public function approve(Request $request, $id)
    {
        $payout = Payout::findOrFail($id);
        \Illuminate\Support\Facades\Gate::authorize('manage', $payout);

        $validator = Validator::make($request->all(), [
            'transaction_id' => 'nullable|string',
            'approved_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $adminId = Auth::id();
            $payout = $this->payoutService->approvePayout(
                $id,
                $adminId,
                $request->transaction_id,
                $request->approved_amount
            );

            return response()->json([
                'message' => 'Payout approved successfully',
                'payout' => $payout
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve payout',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Reject payout
     * POST /api/admin/payouts/{id}/reject
     */
    public function reject(Request $request, $id)
    {
        $payout = Payout::findOrFail($id);
        \Illuminate\Support\Facades\Gate::authorize('manage', $payout);

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $adminId = Auth::id();
            $payout = $this->payoutService->rejectPayout(
                $id,
                $adminId,
                $request->reason
            );

            return response()->json([
                'message' => 'Payout rejected',
                'payout' => $payout
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reject payout',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get payout statistics
     * GET /api/admin/payouts/statistics
     */
    public function statistics(Request $request)
    {
        $stats = $this->payoutService->getPayoutStatistics(
            $request->input('start_date'),
            $request->input('end_date')
        );

        return response()->json($stats);
    }
}
