<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\SellerWallet;
use App\Models\SellerTransaction;
use App\Models\User;
use App\Services\CommissionService;
use App\Services\PayoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminFinanceController extends Controller
{
    protected $commissionService;
    protected $payoutService;

    public function __construct()
    {
        $this->commissionService = new CommissionService();
        $this->payoutService = new PayoutService();
    }

    /**
     * Get platform finance overview
     * GET /api/admin/finance/overview
     */
    public function overview(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Total revenue (all delivered orders)
        $revenueQuery = Order::where('status', 'delivered')
            ->whereNotNull('commission_calculated_at');

        if ($startDate) $revenueQuery->where('created_at', '>=', $startDate);
        if ($endDate) $revenueQuery->where('created_at', '<=', $endDate);

        $totalRevenue = $revenueQuery->sum('final_amount');
        $platformCommission = $revenueQuery->sum('platform_commission_amount');
        $gatewayFees = $revenueQuery->sum('payment_gateway_fee');
        $sellerEarnings = $revenueQuery->sum('seller_earnings');

        // Payout statistics
        $payoutStats = $this->payoutService->getPayoutStatistics($startDate, $endDate);

        // Refunds
        $refundQuery = Order::where('status', 'refunded');
        if ($startDate) $refundQuery->where('updated_at', '>=', $startDate);
        if ($endDate) $refundQuery->where('updated_at', '<=', $endDate);
        $totalRefunds = $refundQuery->sum('final_amount');

        return response()->json([
            'revenue' => [
                'total' => round($totalRevenue, 2),
                'platform_commission' => round($platformCommission, 2),
                'gateway_fees' => round($gatewayFees, 2),
                'seller_earnings' => round($sellerEarnings, 2),
            ],
            'payouts' => $payoutStats,
            'refunds' => [
                'total' => round($totalRefunds, 2),
                'count' => $refundQuery->count(),
            ],
            'net_platform_earnings' => round($platformCommission - $gatewayFees, 2),
        ]);
    }

    /**
     * Get seller-wise revenue breakdown
     * GET /api/admin/finance/sellers
     */
    public function sellers(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $perPage = $request->input('per_page', 15);

        // Get all sellers with their wallets
        $sellersQuery = User::where('role', 'seller')
            ->with(['sellerProfile', 'sellerWallet'])
            ->whereHas('sellerWallet');

        $sellers = $sellersQuery->paginate($perPage);

        $sellersData = $sellers->map(function ($seller) use ($startDate, $endDate) {
            // Get seller's orders
            $ordersQuery = Order::whereHas('items', function ($q) use ($seller) {
                $q->where('seller_id', $seller->id);
            })
            ->where('status', 'delivered')
            ->whereNotNull('commission_calculated_at');

            if ($startDate) $ordersQuery->where('created_at', '>=', $startDate);
            if ($endDate) $ordersQuery->where('created_at', '<=', $endDate);

            $orders = $ordersQuery->get();

            $totalSales = 0;
            $platformCommission = 0;
            $gatewayFee = 0;
            $sellerEarnings = 0;

            foreach ($orders as $order) {
                $sellerItems = $order->items->where('seller_id', $seller->id);
                $sellerTotal = $sellerItems->sum('total');
                
                $commission = $this->commissionService->getSellerCommissionRate($seller->id, $order->created_at);
                $commAmount = $sellerTotal * ($commission->base_commission_percentage / 100);
                $gwFee = $sellerTotal * ($commission->payment_gateway_percentage / 100);
                
                $totalSales += $sellerTotal;
                $platformCommission += $commAmount;
                $gatewayFee += $gwFee;
                $sellerEarnings += ($sellerTotal - $commAmount - $gwFee);
            }

            $currentCommission = $this->commissionService->getSellerCommissionRate($seller->id);

            return [
                'seller_id' => $seller->id,
                'seller_name' => $seller->name,
                'brand_name' => $seller->sellerProfile->brand_name ?? 'N/A',
                'total_sales' => round($totalSales, 2),
                'platform_commission' => round($platformCommission, 2),
                'gateway_fee' => round($gatewayFee, 2),
                'seller_earnings' => round($sellerEarnings, 2),
                'wallet_balance' => round($seller->sellerWallet->available_balance ?? 0, 2),
                'pending_payouts' => round($seller->sellerWallet->pending_amount ?? 0, 2),
                'commission_rate' => [
                    'platform' => $currentCommission->base_commission_percentage,
                    'gateway' => $currentCommission->payment_gateway_percentage,
                ],
                'order_count' => $orders->count(),
            ];
        });

        return response()->json([
            'data' => $sellersData,
            'pagination' => [
                'current_page' => $sellers->currentPage(),
                'last_page' => $sellers->lastPage(),
                'per_page' => $sellers->perPage(),
                'total' => $sellers->total(),
            ]
        ]);
    }

    /**
     * Get commission breakdown
     * GET /api/admin/finance/commission-breakdown
     */
    public function commissionBreakdown(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $ordersQuery = Order::where('status', 'delivered')
            ->whereNotNull('commission_calculated_at');

        if ($startDate) $ordersQuery->where('created_at', '>=', $startDate);
        if ($endDate) $ordersQuery->where('created_at', '<=', $endDate);

        $orders = $ordersQuery->get();

        // Group by commission rate
        $breakdown = [];
        foreach ($orders as $order) {
            $itemsBySeller = $order->items->groupBy('seller_id');
            
            foreach ($itemsBySeller as $sellerId => $items) {
                if (!$sellerId) continue;
                
                $commission = $this->commissionService->getSellerCommissionRate($sellerId, $order->created_at);
                $rate = $commission->effective_commission_percentage;
                
                if (!isset($breakdown[$rate])) {
                    $breakdown[$rate] = [
                        'commission_rate' => $rate,
                        'platform_rate' => $commission->base_commission_percentage,
                        'gateway_rate' => $commission->payment_gateway_percentage,
                        'total_sales' => 0,
                        'total_commission' => 0,
                        'order_count' => 0,
                    ];
                }
                
                $sellerTotal = $items->sum('total');
                $commAmount = $sellerTotal * ($commission->base_commission_percentage / 100);
                $gwFee = $sellerTotal * ($commission->payment_gateway_percentage / 100);
                
                $breakdown[$rate]['total_sales'] += $sellerTotal;
                $breakdown[$rate]['total_commission'] += ($commAmount + $gwFee);
                $breakdown[$rate]['order_count']++;
            }
        }

        return response()->json([
            'breakdown' => array_values($breakdown),
            'total_orders' => $orders->count(),
        ]);
    }

    /**
     * Get all transactions
     * GET /api/admin/finance/transactions
     */
    public function transactions(Request $request)
    {
        $perPage = (int)$request->input('per_page', 15);
        $page = (int)$request->input('page', 1);

        $allTransactions = collect();

        // 1. Seller Transactions
        if (!$request->has('stakeholder_type') || $request->stakeholder_type === 'all' || $request->stakeholder_type === 'seller') {
            $sellerTxQuery = SellerTransaction::with(['seller', 'order', 'payout']);
            
            if ($request->has('start_date') && $request->start_date) {
                $sellerTxQuery->where('created_at', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $sellerTxQuery->where('created_at', '<=', $request->end_date);
            }

            $sellerTransactions = $sellerTxQuery->get();

            foreach ($sellerTransactions as $tx) {
                $allTransactions->push([
                    'id' => 'seller_' . $tx->id,
                    'date' => $tx->created_at ? $tx->created_at->toISOString() : null,
                    'stakeholder_name' => $tx->seller->name ?? 'Unknown Seller',
                    'stakeholder_role' => 'seller',
                    'type' => $tx->type,
                    'gross_amount' => (float)$tx->amount,
                    'net_amount' => (float)$tx->amount,
                    'commission' => 0.0,
                    'reference_id' => $tx->order->order_number ?? ($tx->payout->transaction_id ?? ($tx->payout_id ? 'Payout #' . $tx->payout_id : 'N/A')),
                    'description' => $tx->description ?? ucfirst($tx->type) . ' transaction'
                ]);
            }
        }

        // 2. Doctor Transactions (Appointments & Payouts)
        if (!$request->has('stakeholder_type') || $request->stakeholder_type === 'all' || $request->stakeholder_type === 'doctor') {
            // Appointments
            $apptQuery = \App\Models\Appointment::with('doctor')->where('status', 'completed');
            if ($request->has('start_date') && $request->start_date) {
                $apptQuery->where('appointment_date', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $apptQuery->where('appointment_date', '<=', $request->end_date);
            }

            $appointments = $apptQuery->get();
            foreach ($appointments as $appt) {
                $amt = (float)$appt->amount;
                $isFollowUp = $appt->is_follow_up == 1 || $appt->is_follow_up == true;
                if ($isFollowUp) {
                    $docShare = 1.0;
                } else if ($appt->consultation_type === 'chat') {
                    $docShare = 0.80;
                } else {
                    $docShare = 0.85;
                }
                $docEarnings = $amt * $docShare;
                $comm = $amt * (1 - $docShare);

                $allTransactions->push([
                    'id' => 'doctor_appt_' . $appt->id,
                    'date' => $appt->appointment_date ? $appt->appointment_date->toISOString() : ($appt->created_at ? $appt->created_at->toISOString() : null),
                    'stakeholder_name' => $appt->doctor->name ?? 'Unknown Doctor',
                    'stakeholder_role' => 'doctor',
                    'type' => 'earning',
                    'gross_amount' => $amt,
                    'net_amount' => $docEarnings,
                    'commission' => $comm,
                    'reference_id' => $appt->payment_id ?? 'Appt #' . $appt->id,
                    'description' => 'Consultation Booking (' . ucfirst($appt->consultation_type) . ')'
                ]);
            }

            // Doctor Payouts
            $docPayoutsQuery = \App\Models\Payout::with('user')
                ->where('status', 'approved')
                ->whereHas('user', function($q) {
                    $q->where('role', 'doctor');
                });
            
            if ($request->has('start_date') && $request->start_date) {
                $docPayoutsQuery->where('processed_at', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $docPayoutsQuery->where('processed_at', '<=', $request->end_date);
            }

            $docPayouts = $docPayoutsQuery->get();
            foreach ($docPayouts as $payout) {
                $allTransactions->push([
                    'id' => 'doctor_payout_' . $payout->id,
                    'date' => $payout->processed_at ? $payout->processed_at->toISOString() : ($payout->created_at ? $payout->created_at->toISOString() : null),
                    'stakeholder_name' => $payout->user->name ?? 'Unknown Doctor',
                    'stakeholder_role' => 'doctor',
                    'type' => 'payout',
                    'gross_amount' => (float)$payout->approved_amount,
                    'net_amount' => (float)$payout->approved_amount,
                    'commission' => 0.0,
                    'reference_id' => $payout->transaction_id ?? 'Payout #' . $payout->id,
                    'description' => 'Doctor Payout Released'
                ]);
            }
        }

        // 3. Customer Transactions (Orders & Refunds)
        if (!$request->has('stakeholder_type') || $request->stakeholder_type === 'all' || $request->stakeholder_type === 'customer') {
            // Orders
            $orderQuery = Order::with('user');
            if ($request->has('start_date') && $request->start_date) {
                $orderQuery->where('created_at', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $orderQuery->where('created_at', '<=', $request->end_date);
            }

            $orders = $orderQuery->get();
            foreach ($orders as $order) {
                $allTransactions->push([
                    'id' => 'customer_order_' . $order->id,
                    'date' => $order->created_at ? $order->created_at->toISOString() : null,
                    'stakeholder_name' => $order->user->name ?? 'Guest Customer',
                    'stakeholder_role' => 'customer',
                    'type' => 'order_payment',
                    'gross_amount' => (float)$order->final_amount,
                    'net_amount' => (float)$order->final_amount,
                    'commission' => 0.0,
                    'reference_id' => $order->order_number,
                    'description' => 'Payment for Order #' . $order->order_number
                ]);
            }

            // Refunds
            $refundQuery = \App\Models\Refund::with(['user', 'order']);
            if ($request->has('start_date') && $request->start_date) {
                $refundQuery->where('created_at', '>=', $request->start_date);
            }
            if ($request->has('end_date') && $request->end_date) {
                $refundQuery->where('created_at', '<=', $request->end_date);
            }

            $refunds = $refundQuery->get();
            foreach ($refunds as $refund) {
                $allTransactions->push([
                    'id' => 'customer_refund_' . $refund->id,
                    'date' => $refund->created_at ? $refund->created_at->toISOString() : null,
                    'stakeholder_name' => $refund->user->name ?? ($refund->order->user->name ?? 'Customer'),
                    'stakeholder_role' => 'customer',
                    'type' => 'refund',
                    'gross_amount' => (float)$refund->amount,
                    'net_amount' => (float)$refund->amount,
                    'commission' => 0.0,
                    'reference_id' => $refund->order->order_number ?? 'Refund #' . $refund->id,
                    'description' => 'Refund for Order: ' . ($refund->order->order_number ?? '')
                ]);
            }
        }

        // Apply filters like search
        if ($request->has('search') && $request->search) {
            $search = strtolower($request->search);
            $allTransactions = $allTransactions->filter(function($tx) use ($search) {
                return str_contains(strtolower($tx['stakeholder_name']), $search) ||
                       str_contains(strtolower($tx['reference_id']), $search) ||
                       str_contains(strtolower($tx['description']), $search);
            });
        }

        // Apply filters like type
        if ($request->has('type') && $request->type && $request->type !== 'all') {
            $type = $request->type;
            $allTransactions = $allTransactions->filter(function($tx) use ($type) {
                return $tx['type'] === $type;
            });
        }

        // Sort by date desc
        $sortedTransactions = $allTransactions->sortByDesc('date')->values();

        // Paginate the collection
        $offset = ($page - 1) * $perPage;
        $itemsForCurrentPage = $sortedTransactions->slice($offset, $perPage)->values();

        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $itemsForCurrentPage,
            $sortedTransactions->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return response()->json($paginator);
    }

    /**
     * Export finance data
     * GET /api/admin/finance/export
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'overview');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $filename = "admin-finance-{$type}-" . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($type, $startDate, $endDate) {
            $file = fopen('php://output', 'w');

            if ($type === 'sellers') {
                fputcsv($file, ['Seller Name', 'Brand', 'Total Sales', 'Platform Commission', 'Gateway Fee', 'Seller Earnings', 'Wallet Balance', 'Orders']);

                $sellers = User::where('role', 'seller')
                    ->with(['sellerProfile', 'sellerWallet'])
                    ->get();

                foreach ($sellers as $seller) {
                    $summary = $this->commissionService->getSellerCommissionSummary($seller->id, $startDate, $endDate);
                    
                    fputcsv($file, [
                        $seller->name,
                        $seller->sellerProfile->brand_name ?? 'N/A',
                        $summary['total_sales'],
                        $summary['total_platform_commission'],
                        $summary['total_gateway_fee'],
                        $summary['total_earnings'],
                        $seller->sellerWallet->available_balance ?? 0,
                        $summary['order_count'],
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get doctor-wise consultation & revenue statistics
     * GET /api/admin/finance/doctors
     */
    public function doctors(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $perPage = $request->input('per_page', 15);

        // Fetch all approved doctors
        $doctorsQuery = User::where('role', 'doctor')
            ->where('doctor_status', 'approved');

        $doctors = $doctorsQuery->paginate($perPage);

        $doctorsData = $doctors->map(function ($doctor) use ($startDate, $endDate) {
            // Get completed appointments
            $appointmentsQuery = \App\Models\Appointment::where('doctor_id', $doctor->id)
                ->where('status', 'completed');

            if ($startDate) $appointmentsQuery->where('appointment_date', '>=', $startDate);
            if ($endDate) $appointmentsQuery->where('appointment_date', '<=', $endDate);

            $appointments = $appointmentsQuery->get();

            $grossSales = 0;
            $doctorEarnings = 0;
            $platformCommission = 0;

            foreach ($appointments as $appt) {
                $amt = (float) $appt->amount;
                $isFollowUp = $appt->is_follow_up == 1 || $appt->is_follow_up == true;

                if ($isFollowUp) {
                    $docShare = 1.0;
                } else if ($appt->consultation_type === 'chat') {
                    $docShare = 0.80;
                } else {
                    $docShare = 0.85; // Video / Audio / default
                }

                $grossSales += $amt;
                $doctorEarnings += ($amt * $docShare);
                $platformCommission += ($amt * (1 - $docShare));
            }

            // Get pending payouts in payouts table
            $pendingPayouts = \App\Models\Payout::where('user_id', $doctor->id)
                ->where('status', 'pending')
                ->sum('requested_amount');

            return [
                'doctor_id' => $doctor->id,
                'doctor_name' => $doctor->name,
                'specialization' => $doctor->specialization ?? 'N/A',
                'gross_sales' => round($grossSales, 2),
                'doctor_earnings' => round($doctorEarnings, 2),
                'platform_commission' => round($platformCommission, 2),
                'pending_payouts' => round($pendingPayouts, 2),
                'bank_account_holder' => $doctor->bank_account_holder,
                'bank_name' => $doctor->bank_name,
                'bank_account_number' => $doctor->bank_account_number,
                'bank_ifsc' => $doctor->bank_ifsc,
                'bookings_count' => $appointments->count(),
            ];
        });

        // Global Doctor aggregates for overview
        $allCompletedAppointments = \App\Models\Appointment::where('status', 'completed')->get();
        $globalGross = 0;
        $globalDocEarn = 0;
        $globalComm = 0;

        foreach ($allCompletedAppointments as $appt) {
            $amt = (float) $appt->amount;
            $isFollowUp = $appt->is_follow_up == 1 || $appt->is_follow_up == true;

            if ($isFollowUp) {
                $docShare = 1.0;
            } else if ($appt->consultation_type === 'chat') {
                $docShare = 0.80;
            } else {
                $docShare = 0.85;
            }

            $globalGross += $amt;
            $globalDocEarn += ($amt * $docShare);
            $globalComm += ($amt * (1 - $docShare));
        }

        return response()->json([
            'data' => $doctorsData,
            'aggregates' => [
                'total_gross' => round($globalGross, 2),
                'total_doctor_earnings' => round($globalDocEarn, 2),
                'total_commission' => round($globalComm, 2),
            ],
            'pagination' => [
                'current_page' => $doctors->currentPage(),
                'last_page' => $doctors->lastPage(),
                'per_page' => $doctors->perPage(),
                'total' => $doctors->total(),
            ]
        ]);
    }
}
