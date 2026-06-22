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
                'platform_commission_gst' => $commissionSummary['total_platform_commission_gst'] ?? 0,
                'gateway_fee' => $commissionSummary['total_gateway_fee'],
                'shipping_charge' => $commissionSummary['total_shipping_charge'] ?? 0,
                'tcs_deduction' => $commissionSummary['total_tcs'] ?? 0,
                'tds_deduction' => $commissionSummary['total_tds'] ?? 0,
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

    /**
     * Get GSTR compliance report
     * GET /api/seller/reports/gst
     */
    public function gstReport(Request $request)
    {
        $sellerId = Auth::id();
        $range = $request->input('range', '30_days');
        $dates = $this->getDateRange($range);

        $query = \App\Models\OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', function ($q) use ($dates) {
                $q->whereIn('status', ['delivered', 'cod_reconciled']);
                if ($dates['start']) {
                    $q->where('created_at', '>=', $dates['start']);
                }
                if ($dates['end']) {
                    $q->where('created_at', '<=', $dates['end']);
                }
            })
            ->with(['order', 'product', 'seller.sellerProfile']);

        $items = $query->get();

        $taxableAmount = $items->sum('base_price');
        $cgst = $items->sum('cgst');
        $sgst = $items->sum('sgst');
        $igst = $items->sum('igst');
        $totalGst = $items->sum('gst_amount');
        $grossAmount = $items->sum('net_amount');

        // Group by GST slab
        $bySlab = $items->groupBy('gst_slab')->map(function ($items, $slab) {
            return [
                'gst_slab' => (float)$slab,
                'taxable_amount' => round($items->sum('base_price'), 2),
                'cgst' => round($items->sum('cgst'), 2),
                'sgst' => round($items->sum('sgst'), 2),
                'igst' => round($items->sum('igst'), 2),
                'gst_amount' => round($items->sum('gst_amount'), 2),
                'gross_amount' => round($items->sum('net_amount'), 2),
            ];
        })->values();

        return response()->json([
            'summary' => [
                'taxable_amount' => round($taxableAmount, 2),
                'cgst' => round($cgst, 2),
                'sgst' => round($sgst, 2),
                'igst' => round($igst, 2),
                'total_gst' => round($totalGst, 2),
                'gross_amount' => round($grossAmount, 2),
            ],
            'by_slab' => $bySlab,
            'items' => $items->map(function ($item) {
                $hsnCode = $item->hsn_code ?? ($item->product->hsn_code ?? ($item->seller->sellerProfile->default_hsn_code ?? 'N/A'));
                return [
                    'order_number' => $item->order->order_number ?? 'N/A',
                    'product_name' => $item->product_name,
                    'hsn_code' => $hsnCode,
                    'price' => (float)$item->price,
                    'gst_slab' => (float)$item->gst_slab,
                    'base_price' => (float)$item->base_price,
                    'cgst' => (float)$item->cgst,
                    'sgst' => (float)$item->sgst,
                    'igst' => (float)$item->igst,
                    'gst_amount' => (float)$item->gst_amount,
                    'net_amount' => (float)$item->net_amount,
                    'created_at' => $item->created_at->format('Y-m-d H:i:s'),
                ];
            })
        ]);
    }

    /**
     * Get settlement logs and payout detail reports
     * GET /api/seller/reports/settlement
     */
    public function settlementReport(Request $request)
    {
        $sellerId = Auth::id();
        $range = $request->input('range', '30_days');
        $dates = $this->getDateRange($range);

        $query = \App\Models\SellerTransaction::where('seller_id', $sellerId)
            ->whereIn('type', [
                \App\Models\SellerTransaction::TYPE_EARNING,
                \App\Models\SellerTransaction::TYPE_PAYOUT,
                \App\Models\SellerTransaction::TYPE_REFUND
            ])
            ->where(function($q) use ($dates) {
                if ($dates['start']) {
                    $q->where('created_at', '>=', $dates['start']);
                }
                if ($dates['end']) {
                    $q->where('created_at', '<=', $dates['end']);
                }
            })
            ->with(['order', 'payout'])
            ->orderBy('created_at', 'desc');

        $transactions = $query->get();

        $report = $transactions->map(function ($txn) use ($sellerId) {
            $order = $txn->order;

            $payoutDetails = null;
            if ($txn->type === \App\Models\SellerTransaction::TYPE_EARNING) {
                $meta = $txn->metadata ?? [];
                $payoutDetails = [
                    'order_total' => $meta['order_total'] ?? 0.00,
                    'platform_commission' => $meta['platform_commission'] ?? 0.00,
                    'gateway_fee' => $meta['gateway_fee'] ?? 0.00,
                    'shipping_charge' => $meta['shipping_charge'] ?? 0.00,
                    'tcs_amount' => (float)$txn->tcs_deduction,
                    'tds_amount' => (float)$txn->tds_deduction,
                    'net_earnings' => (float)$txn->amount,
                    'hold_until' => $meta['hold_until'] ?? null,
                    'escrow_status' => $meta['escrow_status'] ?? 'N/A',
                ];
            }

            return [
                'transaction_id' => $txn->id,
                'type' => $txn->type,
                'description' => $txn->description,
                'amount' => (float)$txn->amount,
                'tcs_deduction' => (float)$txn->tcs_deduction,
                'tds_deduction' => (float)$txn->tds_deduction,
                'reconciliation_status' => $txn->reconciliation_status,
                'balance_before' => (float)$txn->balance_before,
                'balance_after' => (float)$txn->balance_after,
                'created_at' => $txn->created_at->format('Y-m-d H:i:s'),
                'order_number' => $order->order_number ?? 'N/A',
                'payout_details' => $payoutDetails,
                'payout_status' => $txn->payout->status ?? 'N/A',
            ];
        });

        return response()->json([
            'settlements' => $report
        ]);
    }
}
