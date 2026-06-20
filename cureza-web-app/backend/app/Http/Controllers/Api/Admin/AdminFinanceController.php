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
        $sellersQuery = User::where('role', 'vendor')
            ->with(['sellerProfile', 'sellerWallet'])
            ->whereHas('sellerWallet');

        $sellers = $sellersQuery->paginate($perPage);
        $sellerIds = $sellers->pluck('id')->toArray();

        // Eager load matching orders + items in a single query
        $orders = Order::whereHas('items', function ($q) use ($sellerIds) {
                $q->whereIn('seller_id', $sellerIds);
            })
            ->with(['items' => function ($q) use ($sellerIds) {
                $q->whereIn('seller_id', $sellerIds);
            }])
            ->where('status', 'delivered')
            ->whereNotNull('commission_calculated_at')
            ->when($startDate, function ($q) use ($startDate) {
                return $q->where('created_at', '>=', $startDate);
            })
            ->when($endDate, function ($q) use ($endDate) {
                return $q->where('created_at', '<=', $endDate);
            })
            ->get();

        // Group orders by seller
        $ordersBySeller = [];
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $sellerId = $item->seller_id;
                if (!isset($ordersBySeller[$sellerId])) {
                    $ordersBySeller[$sellerId] = collect();
                }
                $ordersBySeller[$sellerId]->push([
                    'order' => $order,
                    'item' => $item
                ]);
            }
        }

        // Pre-fetch all commission configurations for the page
        $commissions = \App\Models\SellerCommission::whereIn('seller_id', $sellerIds)
            ->where('is_active', true)
            ->get()
            ->groupBy('seller_id');

        $getCommissionRate = function($sellerId, $date) use ($commissions) {
            $sellerComms = $commissions->get($sellerId);
            if (!$sellerComms) {
                return (object)[
                    'base_commission_percentage' => 25.00,
                    'payment_gateway_percentage' => 2.50,
                ];
            }
            $match = $sellerComms->first(function ($comm) use ($date) {
                return $comm->valid_from <= $date && (is_null($comm->valid_until) || $comm->valid_until >= $date);
            });
            return $match ?? $sellerComms->sortByDesc('valid_from')->first() ?? (object)[
                'base_commission_percentage' => 25.00,
                'payment_gateway_percentage' => 2.50,
            ];
        };

        $sellersData = $sellers->map(function ($seller) use ($ordersBySeller, $getCommissionRate) {
            $sellerData = $ordersBySeller[$seller->id] ?? collect();
            
            $totalSales = 0;
            $platformCommission = 0;
            $gatewayFee = 0;
            $sellerEarnings = 0;
            $orderIds = [];

            foreach ($sellerData as $data) {
                $order = $data['order'];
                $item = $data['item'];
                $orderIds[$order->id] = true;

                $sellerTotal = $item->total;
                $commission = $getCommissionRate($seller->id, $order->created_at);
                $commAmount = $sellerTotal * ($commission->base_commission_percentage / 100);
                $isCOD = strtolower($order->payment_method ?? '') === 'cod';
                $gwFee = $isCOD ? 0 : ($sellerTotal * ($commission->payment_gateway_percentage / 100));

                $totalSales += $sellerTotal;
                $platformCommission += $commAmount;
                $gatewayFee += $gwFee;
            }

            $currentCommission = $getCommissionRate($seller->id, now());
            $gstOnComm = $platformCommission * 0.18;
            $tcsVal = $totalSales * 0.01;
            $tdsVal = $totalSales * 0.01;
            $sellerEarnings = $totalSales - $platformCommission - $gstOnComm - $gatewayFee - $tcsVal - $tdsVal;

            return [
                'seller_id' => $seller->id,
                'seller_name' => $seller->name,
                'brand_name' => $seller->sellerProfile->brand_name ?? 'N/A',
                'total_sales' => round($totalSales, 2),
                'platform_commission' => round($platformCommission, 2),
                'gst_on_commission' => round($gstOnComm, 2),
                'tcs_amount' => round($tcsVal, 2),
                'tds_amount' => round($tdsVal, 2),
                'gateway_fee' => round($gatewayFee, 2),
                'seller_earnings' => round($sellerEarnings, 2),
                'wallet_balance' => round($seller->sellerWallet->available_balance ?? 0, 2),
                'pending_payouts' => round($seller->sellerWallet->pending_amount ?? 0, 2),
                'commission_rate' => [
                    'platform' => $currentCommission->base_commission_percentage,
                    'gateway' => $currentCommission->payment_gateway_percentage,
                ],
                'order_count' => count($orderIds),
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
            ->whereNotNull('commission_calculated_at')
            ->with('items');

        if ($startDate) $ordersQuery->where('created_at', '>=', $startDate);
        if ($endDate) $ordersQuery->where('created_at', '<=', $endDate);

        $orders = $ordersQuery->get();

        // Pre-fetch all seller commission rates to avoid N+1 queries
        $sellerIds = $orders->flatMap(function($order) {
            return $order->items->pluck('seller_id');
        })->filter()->unique()->toArray();

        $commissions = \App\Models\SellerCommission::whereIn('seller_id', $sellerIds)
            ->where('is_active', true)
            ->get()
            ->groupBy('seller_id');

        $getCommissionRate = function($sellerId, $date) use ($commissions) {
            $sellerComms = $commissions->get($sellerId);
            if (!$sellerComms) {
                return (object)[
                    'base_commission_percentage' => 25.00,
                    'payment_gateway_percentage' => 2.50,
                    'effective_commission_percentage' => 27.50,
                ];
            }
            $match = $sellerComms->first(function ($comm) use ($date) {
                return $comm->valid_from <= $date && (is_null($comm->valid_until) || $comm->valid_until >= $date);
            });
            return $match ?? $sellerComms->sortByDesc('valid_from')->first() ?? (object)[
                'base_commission_percentage' => 25.00,
                'payment_gateway_percentage' => 2.50,
                'effective_commission_percentage' => 27.50,
            ];
        };

        // Group by commission rate
        $breakdown = [];
        foreach ($orders as $order) {
            $itemsBySeller = $order->items->groupBy('seller_id');
            
            foreach ($itemsBySeller as $sellerId => $items) {
                if (!$sellerId) continue;
                
                $commission = $getCommissionRate($sellerId, $order->created_at);
                $rate = $commission->effective_commission_percentage ?? ($commission->base_commission_percentage + $commission->payment_gateway_percentage);
                
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
                $isCOD = strtolower($order->payment_method ?? '') === 'cod';
                $gwFee = $isCOD ? 0 : ($sellerTotal * ($commission->payment_gateway_percentage / 100));
                
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
        $offset = ($page - 1) * $perPage;
        $limit = $offset + $perPage; // Fetch enough records to cover up to current page

        $allTransactions = collect();

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $search = $request->input('search');
        $searchLower = $search ? strtolower($search) : null;
        $filterType = $request->input('type', 'all');

        $stakeholderType = $request->input('stakeholder_type', 'all');
        $showSeller = $stakeholderType === 'all' || $stakeholderType === 'seller';
        $showDoctor = $stakeholderType === 'all' || $stakeholderType === 'doctor';
        $showCustomer = $stakeholderType === 'all' || $stakeholderType === 'customer';

        $totalRecords = 0;

        // 1. Seller Transactions Query
        if ($showSeller) {
            $sellerTxQuery = SellerTransaction::with(['seller', 'order', 'payout']);
            
            if ($startDate) $sellerTxQuery->where('created_at', '>=', $startDate);
            if ($endDate) $sellerTxQuery->where('created_at', '<=', $endDate);
            if ($filterType !== 'all') $sellerTxQuery->where('type', $filterType);
            
            if ($searchLower) {
                $sellerTxQuery->where(function($q) use ($searchLower) {
                    $q->whereHas('seller', function($sq) use ($searchLower) {
                        $sq->where('name', 'like', "%{$searchLower}%");
                    })
                    ->orWhere('description', 'like', "%{$searchLower}%")
                    ->orWhereHas('order', function($oq) use ($searchLower) {
                        $oq->where('order_number', 'like', "%{$searchLower}%");
                    })
                    ->orWhereHas('payout', function($pq) use ($searchLower) {
                        $pq->where('transaction_id', 'like', "%{$searchLower}%");
                    });
                });
            }

            $totalRecords += $sellerTxQuery->count();

            // Fetch only up to the required limit
            $sellerTransactions = $sellerTxQuery->orderBy('created_at', 'desc')->limit($limit)->get();

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

        // 2. Doctor Transactions Query
        if ($showDoctor) {
            // Appointments Query
            $apptQuery = \App\Models\Appointment::with('doctor')->where('status', 'completed');
            if ($startDate) $apptQuery->where('appointment_date', '>=', $startDate);
            if ($endDate) $apptQuery->where('appointment_date', '<=', $endDate);
            if ($filterType !== 'all' && $filterType !== 'earning') {
                // If filtering by non-earning type, appts will have 0 matches
                $apptQuery->whereRaw('1 = 0');
            }

            if ($searchLower) {
                $apptQuery->where(function($q) use ($searchLower) {
                    $q->whereHas('doctor', function($dq) use ($searchLower) {
                        $dq->where('name', 'like', "%{$searchLower}%");
                    })
                    ->orWhere('payment_id', 'like', "%{$searchLower}%")
                    ->orWhere('health_concern', 'like', "%{$searchLower}%");
                });
            }

            $totalRecords += $apptQuery->count();
            $appointments = $apptQuery->orderBy('appointment_date', 'desc')->limit($limit)->get();

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

            // Doctor Payouts Query
            $docPayoutsQuery = \App\Models\Payout::with('user')
                ->where('status', 'approved')
                ->whereHas('user', function($q) {
                    $q->where('role', 'doctor');
                });
            
            if ($startDate) $docPayoutsQuery->where('processed_at', '>=', $startDate);
            if ($endDate) $docPayoutsQuery->where('processed_at', '<=', $endDate);
            if ($filterType !== 'all' && $filterType !== 'payout') {
                $docPayoutsQuery->whereRaw('1 = 0');
            }

            if ($searchLower) {
                $docPayoutsQuery->where(function($q) use ($searchLower) {
                    $q->whereHas('user', function($uq) use ($searchLower) {
                        $uq->where('name', 'like', "%{$searchLower}%");
                    })
                    ->orWhere('transaction_id', 'like', "%{$searchLower}%")
                    ->orWhere('notes', 'like', "%{$searchLower}%");
                });
            }

            $totalRecords += $docPayoutsQuery->count();
            $docPayouts = $docPayoutsQuery->orderBy('processed_at', 'desc')->limit($limit)->get();

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

        // 3. Customer Transactions Query
        if ($showCustomer) {
            // Orders Query
            $orderQuery = Order::with('user');
            if ($startDate) $orderQuery->where('created_at', '>=', $startDate);
            if ($endDate) $orderQuery->where('created_at', '<=', $endDate);
            if ($filterType !== 'all' && $filterType !== 'order_payment') {
                $orderQuery->whereRaw('1 = 0');
            }

            if ($searchLower) {
                $orderQuery->where(function($q) use ($searchLower) {
                    $q->whereHas('user', function($uq) use ($searchLower) {
                        $uq->where('name', 'like', "%{$searchLower}%");
                    })
                    ->orWhere('order_number', 'like', "%{$searchLower}%");
                });
            }

            $totalRecords += $orderQuery->count();
            $orders = $orderQuery->orderBy('created_at', 'desc')->limit($limit)->get();

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

            // Refunds Query
            $refundQuery = \App\Models\Refund::with(['user', 'order']);
            if ($startDate) $refundQuery->where('created_at', '>=', $startDate);
            if ($endDate) $refundQuery->where('created_at', '<=', $endDate);
            if ($filterType !== 'all' && $filterType !== 'refund') {
                $refundQuery->whereRaw('1 = 0');
            }

            if ($searchLower) {
                $refundQuery->where(function($q) use ($searchLower) {
                    $q->whereHas('user', function($uq) use ($searchLower) {
                        $uq->where('name', 'like', "%{$searchLower}%");
                    })
                    ->orWhereHas('order', function($oq) use ($searchLower) {
                        $oq->where('order_number', 'like', "%{$searchLower}%");
                    });
                });
            }

            $totalRecords += $refundQuery->count();
            $refunds = $refundQuery->orderBy('created_at', 'desc')->limit($limit)->get();

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

        // Sort the merged subset by date descending
        $sortedTransactions = $allTransactions->sortByDesc('date')->values();

        // Slice only the relevant slice for the current page
        $itemsForCurrentPage = $sortedTransactions->slice($offset, $perPage)->values();

        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $itemsForCurrentPage,
            $totalRecords,
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

                $sellers = User::where('role', 'vendor')
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

        // Fetch all approved doctors with DB aggregations in a single query
        $doctorsQuery = User::where('role', 'doctor')
            ->where('doctor_status', 'approved')
            ->select('users.*')
            ->selectSub(function($q) use ($startDate, $endDate) {
                $q->from('appointments')
                  ->whereColumn('appointments.doctor_id', 'users.id')
                  ->where('appointments.status', 'completed')
                  ->when($startDate, function($query) use ($startDate) {
                      $query->where('appointments.appointment_date', '>=', $startDate);
                  })
                  ->when($endDate, function($query) use ($endDate) {
                      $query->where('appointments.appointment_date', '<=', $endDate);
                  })
                  ->selectRaw('count(*)');
            }, 'bookings_count')
            ->selectSub(function($q) use ($startDate, $endDate) {
                $q->from('appointments')
                  ->whereColumn('appointments.doctor_id', 'users.id')
                  ->where('appointments.status', 'completed')
                  ->when($startDate, function($query) use ($startDate) {
                      $query->where('appointments.appointment_date', '>=', $startDate);
                  })
                  ->when($endDate, function($query) use ($endDate) {
                      $query->where('appointments.appointment_date', '<=', $endDate);
                  })
                  ->selectRaw('coalesce(sum(amount), 0)');
            }, 'gross_sales')
            ->selectSub(function($q) use ($startDate, $endDate) {
                $q->from('appointments')
                  ->whereColumn('appointments.doctor_id', 'users.id')
                  ->where('appointments.status', 'completed')
                  ->when($startDate, function($query) use ($startDate) {
                      $query->where('appointments.appointment_date', '>=', $startDate);
                  })
                  ->when($endDate, function($query) use ($endDate) {
                      $query->where('appointments.appointment_date', '<=', $endDate);
                  })
                  ->selectRaw('coalesce(sum(amount * case when is_follow_up = 1 then 1.0 when consultation_type = \'chat\' then 0.80 else 0.85 end), 0)');
            }, 'doctor_earnings')
            ->selectSub(function($q) {
                $q->from('payouts')
                  ->whereColumn('payouts.user_id', 'users.id')
                  ->where('payouts.status', 'pending')
                  ->selectRaw('coalesce(sum(requested_amount), 0)');
            }, 'pending_payouts');

        $doctors = $doctorsQuery->paginate($perPage);

        $doctorsData = $doctors->map(function ($doctor) {
            $grossSales = (float)$doctor->gross_sales;
            $doctorEarnings = (float)$doctor->doctor_earnings;
            $platformCommission = $grossSales - $doctorEarnings;

            return [
                'doctor_id' => $doctor->id,
                'doctor_name' => $doctor->name,
                'specialization' => $doctor->specialization ?? 'N/A',
                'gross_sales' => round($grossSales, 2),
                'doctor_earnings' => round($doctorEarnings, 2),
                'platform_commission' => round($platformCommission, 2),
                'pending_payouts' => round((float)$doctor->pending_payouts, 2),
                'bank_account_holder' => $doctor->bank_account_holder,
                'bank_name' => $doctor->bank_name,
                'bank_account_number' => $doctor->bank_account_number,
                'bank_ifsc' => $doctor->bank_ifsc,
                'bookings_count' => (int)$doctor->bookings_count,
            ];
        });

        // Global Doctor aggregates using a single DB summary query
        $aggregates = \App\Models\Appointment::where('status', 'completed')
            ->selectRaw('
                coalesce(sum(amount), 0) as total_gross,
                coalesce(sum(amount * case when is_follow_up = 1 then 1.0 when consultation_type = \'chat\' then 0.80 else 0.85 end), 0) as total_doctor_earnings
            ')
            ->first();

        $globalGross = (float)($aggregates->total_gross ?? 0);
        $globalDocEarn = (float)($aggregates->total_doctor_earnings ?? 0);
        $globalComm = $globalGross - $globalDocEarn;

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

    /**
     * Get platform finance dashboard summary
     * GET /api/admin/finance/dashboard
     */
    public function dashboard(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Aggregated marketplace revenue query (delivered orders)
        $orderQuery = Order::where('status', 'delivered')
            ->whereNotNull('commission_calculated_at');

        if ($startDate) $orderQuery->where('created_at', '>=', $startDate);
        if ($endDate) $orderQuery->where('created_at', '<=', $endDate);

        $totalRevenue = (float)$orderQuery->sum('final_amount');
        $commissionEarnings = (float)$orderQuery->sum('platform_commission_amount');
        $gatewayFees = (float)$orderQuery->sum('payment_gateway_fee');

        // Pending Escrows (sum of pending_amount from seller_wallets)
        $pendingEscrows = (float)SellerWallet::sum('pending_amount');

        // Total Payouts (sum of paid_amount from seller_wallets)
        $totalSellerPayouts = (float)SellerWallet::sum('paid_amount');
        // Let's also check payouts table for approved doctor payouts, if any
        $totalDoctorPayouts = (float)\App\Models\Payout::where('status', 'approved')
            ->whereHas('user', function($q) {
                $q->where('role', 'doctor');
            })->sum('approved_amount');
        $totalPayouts = $totalSellerPayouts + $totalDoctorPayouts;

        // Accumulated TCS & TDS deductions from seller_transactions
        $txnQuery = SellerTransaction::query();
        if ($startDate) $txnQuery->where('created_at', '>=', $startDate);
        if ($endDate) $txnQuery->where('created_at', '<=', $endDate);

        $accumulatedTcs = (float)$txnQuery->sum('tcs_deduction');
        $accumulatedTds = (float)$txnQuery->sum('tds_deduction');

        return response()->json([
            'revenue' => [
                'marketplace_revenue' => round($totalRevenue, 2),
                'commission_earnings' => round($commissionEarnings, 2),
                'gateway_fees' => round($gatewayFees, 2),
                'net_platform_earnings' => round($commissionEarnings - $gatewayFees, 2),
            ],
            'escrow' => [
                'pending_escrows' => round($pendingEscrows, 2),
            ],
            'payouts' => [
                'total_payouts' => round($totalPayouts, 2),
                'seller_payouts' => round($totalSellerPayouts, 2),
                'doctor_payouts' => round($totalDoctorPayouts, 2),
            ],
            'compliance' => [
                'accumulated_tcs' => round($accumulatedTcs, 2),
                'accumulated_tds' => round($accumulatedTds, 2),
            ]
        ]);
    }
}
