<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Services\CommissionService;
use App\Services\WalletService;
use App\Services\PayoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SellerFinanceController extends Controller
{
    protected $commissionService;
    protected $walletService;
    protected $payoutService;

    public function __construct()
    {
        $this->commissionService = new CommissionService();
        $this->walletService = new WalletService();
        $this->payoutService = new PayoutService();
    }

    /**
     * Get finance summary
     * GET /api/seller/finance/summary
     */
    public function summary(Request $request)
    {
        $sellerId = Auth::id();
        $range = $request->input('range', '30_days');

        // Get date range
        $dates = $this->getDateRange($range);

        // Get commission summary
        $commissionSummary = $this->commissionService->getSellerCommissionSummary(
            $sellerId,
            $dates['start'],
            $dates['end']
        );

        // Get wallet balance
        $balance = $this->walletService->getBalance($sellerId);

        // Get payout statistics
        $payoutStats = $this->payoutService->getPayoutHistory($sellerId, [
            'per_page' => 1000
        ]);

        $pendingPayouts = $payoutStats->where('status', 'pending')->sum('requested_amount');
        $approvedPayouts = $payoutStats->where('status', 'approved')->sum('approved_amount');

        return response()->json([
            'summary' => [
                'total_sales' => $commissionSummary['total_sales'],
                'platform_commission' => $commissionSummary['total_platform_commission'],
                'gateway_fee' => $commissionSummary['total_gateway_fee'],
                'net_earnings' => $commissionSummary['total_earnings'],
                'order_count' => $commissionSummary['order_count'],
            ],
            'wallet' => $balance,
            'payouts' => [
                'pending' => round($pendingPayouts, 2),
                'approved' => round($approvedPayouts, 2),
            ],
            'commission_rate' => $commissionSummary['current_commission_rate'],
        ]);
    }

    /**
     * Get commission breakdown
     * GET /api/seller/finance/commission-breakdown
     */
    public function commissionBreakdown(Request $request)
    {
        $sellerId = Auth::id();
        $range = $request->input('range', '30_days');
        $dates = $this->getDateRange($range);

        $summary = $this->commissionService->getSellerCommissionSummary(
            $sellerId,
            $dates['start'],
            $dates['end']
        );

        return response()->json($summary);
    }

    /**
     * Get transaction history
     * GET /api/seller/finance/transactions
     */
    public function transactions(Request $request)
    {
        $sellerId = Auth::id();

        $filters = [
            'type' => $request->input('type'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'per_page' => $request->input('per_page', 15),
        ];

        $transactions = $this->walletService->getTransactionHistory($sellerId, $filters);

        return response()->json($transactions);
    }

    /**
     * Request payout
     * POST /api/seller/finance/request-payout
     */
    public function requestPayout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:100',
            'bank_details' => 'required|array',
            'bank_details.account_holder_name' => 'required|string',
            'bank_details.account_number' => 'required|string',
            'bank_details.ifsc_code' => 'required|string',
            'bank_details.bank_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $sellerId = Auth::id();
            $payout = $this->payoutService->requestPayout(
                $sellerId,
                $request->amount,
                $request->bank_details
            );

            return response()->json([
                'message' => 'Payout request submitted successfully',
                'payout' => $payout
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to request payout',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get payout history
     * GET /api/seller/finance/payouts
     */
    public function payouts(Request $request)
    {
        $sellerId = Auth::id();

        $filters = [
            'status' => $request->input('status'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'per_page' => $request->input('per_page', 15),
        ];

        $payouts = $this->payoutService->getPayoutHistory($sellerId, $filters);

        return response()->json($payouts);
    }

    /**
     * Export finance data
     * GET /api/seller/finance/export
     */
    public function export(Request $request)
    {
        $sellerId = Auth::id();
        $type = $request->input('type', 'transactions');
        $range = $request->input('range', '30_days');
        $dates = $this->getDateRange($range);

        $filename = "finance-{$type}-" . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($type, $sellerId, $dates) {
            $file = fopen('php://output', 'w');

            if ($type === 'transactions') {
                fputcsv($file, ['Date', 'Type', 'Description', 'Amount', 'Balance After']);

                $transactions = $this->walletService->getTransactionHistory($sellerId, [
                    'start_date' => $dates['start'],
                    'end_date' => $dates['end'],
                    'per_page' => 10000
                ]);

                foreach ($transactions as $txn) {
                    fputcsv($file, [
                        $txn->created_at->format('Y-m-d H:i:s'),
                        $txn->type,
                        $txn->description,
                        $txn->amount,
                        $txn->balance_after
                    ]);
                }
            } elseif ($type === 'summary') {
                $summary = $this->commissionService->getSellerCommissionSummary(
                    $sellerId,
                    $dates['start'],
                    $dates['end']
                );

                fputcsv($file, ['Metric', 'Value']);
                fputcsv($file, ['Total Sales', $summary['total_sales']]);
                fputcsv($file, ['Platform Commission', $summary['total_platform_commission']]);
                fputcsv($file, ['Gateway Fee', $summary['total_gateway_fee']]);
                fputcsv($file, ['Net Earnings', $summary['total_earnings']]);
                fputcsv($file, ['Order Count', $summary['order_count']]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Helper: Get date range
     */
    private function getDateRange($range)
    {
        switch ($range) {
            case 'today':
                return [
                    'start' => now()->startOfDay(),
                    'end' => now()->endOfDay()
                ];
            case '7_days':
                return [
                    'start' => now()->subDays(7),
                    'end' => now()
                ];
            case '30_days':
                return [
                    'start' => now()->subDays(30),
                    'end' => now()
                ];
            case 'this_month':
                return [
                    'start' => now()->startOfMonth(),
                    'end' => now()->endOfMonth()
                ];
            case 'last_month':
                return [
                    'start' => now()->subMonth()->startOfMonth(),
                    'end' => now()->subMonth()->endOfMonth()
                ];
            case 'all_time':
                return [
                    'start' => null,
                    'end' => null
                ];
            default:
                return [
                    'start' => now()->subDays(30),
                    'end' => now()
                ];
        }
    }
}
