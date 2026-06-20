<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SellerDashboardController extends Controller
{
    /**
     * Get dashboard summary statistics
     */
    public function summary(Request $request)
    {
        $sellerId = Auth::id();
        $range = $request->input('range', '30_days');
        
        // Calculate date range
        $startDate = $this->getStartDate($range);
        $dateRange = [
            'start' => $startDate,
            'end' => now()
        ];
        
        // 1. Get current period sales and orders in a single query
        $currentStats = \App\Models\OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', function ($q) use ($dateRange) {
                if ($dateRange['start'] && $dateRange['end']) {
                    $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                }
                $q->where('status', '!=', 'cancelled');
            })
            ->selectRaw('coalesce(sum(total), 0) as sales_total, count(distinct order_id) as orders_count')
            ->first();

        $totalSales = (float)$currentStats->sales_total;
        $totalOrders = (int)$currentStats->orders_count;
        
        // Get previous period sales and orders in a single query
        $previousStartDate = $this->getPreviousStartDate($range);
        $previousRange = [
            'start' => $previousStartDate,
            'end' => $startDate
        ];
        
        $previousStats = \App\Models\OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', function ($q) use ($previousRange) {
                if ($previousRange['start'] && $previousRange['end']) {
                    $q->whereBetween('created_at', [$previousRange['start'], $previousRange['end']]);
                }
                $q->where('status', '!=', 'cancelled');
            })
            ->selectRaw('coalesce(sum(total), 0) as sales_total, count(distinct order_id) as orders_count')
            ->first();

        $previousSales = (float)$previousStats->sales_total;
        $previousOrders = (int)$previousStats->orders_count;
        
        $salesChange = $previousSales > 0 ? (($totalSales - $previousSales) / $previousSales) * 100 : ($totalSales > 0 ? 100 : 0);
        $ordersChange = $previousOrders > 0 ? (($totalOrders - $previousOrders) / $previousOrders) * 100 : ($totalOrders > 0 ? 100 : 0);
        
        // 3. Average order value
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        
        // 4. Products stats in a single query
        $productStats = Product::where('seller_id', $sellerId)
            ->selectRaw('
                count(*) as total,
                sum(case when status = \'published\' then 1 else 0 end) as active,
                sum(case when status in (\'pending_approval\', \'pending_update\', \'delete_requested\') then 1 else 0 end) as pending,
                sum(case when stock <= 0 then 1 else 0 end) as out_of_stock,
                sum(case when stock <= 10 then 1 else 0 end) as low_stock
            ')
            ->first();

        $totalProducts = (int)$productStats->total;
        $activeProducts = (int)$productStats->active;
        $pendingProducts = (int)$productStats->pending;
        $outOfStock = (int)$productStats->out_of_stock;
        $lowStock = (int)$productStats->low_stock;
        
        // 6. Payouts Section in a single query
        $payoutStats = \App\Models\Payout::where('seller_id', $sellerId)
            ->selectRaw('
                coalesce(sum(case when status = \'pending\' then requested_amount else 0 end), 0) as pending,
                coalesce(sum(case when status = \'approved\' then approved_amount else 0 end), 0) as approved
            ')
            ->first();

        $pendingPayout = (float)$payoutStats->pending;
        $paidPayout = (float)$payoutStats->approved;

        // Wallet details
        $wallet = \App\Models\SellerWallet::where('seller_id', $sellerId)->first();
        $availableBalance = $wallet ? $wallet->available_balance : 0;
        
        // Calculate Conversion Yield dynamically (Orders / Product Views)
        $totalViews = \App\Models\Product::where('seller_id', $sellerId)->sum('views_count') ?? 0;
        $conversionRate = $totalViews > 0 ? ($totalOrders / $totalViews) * 105 : 0; // wait, let's keep it (totalOrders / totalViews) * 100, wait, why * 105? No, * 100 is standard! Let's do * 100.
        $conversionRate = $totalViews > 0 ? ($totalOrders / $totalViews) * 100 : 0;

        // Calculate dynamic COD ratio
        $paymentStats = \App\Models\OrderItem::where('seller_id', $sellerId)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->selectRaw('
                coalesce(sum(case when lower(orders.payment_method) = \'cod\' then order_items.total else 0 end), 0) as cod_sales,
                coalesce(sum(order_items.total), 0) as total_sales
            ')
            ->first();
        $codSales = (float)$paymentStats->cod_sales;
        $totalSalesForCod = (float)$paymentStats->total_sales;
        $codRatio = $totalSalesForCod > 0 ? ($codSales / $totalSalesForCod) * 100 : 40.0;

        // Get seller's active B2B commission rates
        $commissionService = new \App\Services\CommissionService();
        $currentCommission = $commissionService->getSellerCommissionRate($sellerId);
        $commissionRate = [
            'platform' => $currentCommission->base_commission_percentage,
            'gateway' => $currentCommission->payment_gateway_percentage,
            'total' => $currentCommission->effective_commission_percentage,
        ];

        // Fetch actual platform commission, gateway fees, TCS, TDS, and GST on commission from transaction records
        $transactions = \App\Models\SellerTransaction::where('seller_id', $sellerId)
            ->where('type', \App\Models\SellerTransaction::TYPE_EARNING)
            ->when($dateRange['start'], function($q) use ($dateRange) {
                $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            })
            ->get();

        $totalCommission = 0;
        $gatewayFee = 0;
        $tcs = 0;
        $tds = 0;
        $commissionGst = 0;

        foreach ($transactions as $txn) {
            $tcs += (float)$txn->tcs_deduction;
            $tds += (float)$txn->tds_deduction;
            $meta = $txn->metadata ?? [];
            $totalCommission += (float)($meta['platform_commission'] ?? 0);
            $gatewayFee += (float)($meta['gateway_fee'] ?? 0);
            $commissionGst += (float)($meta['platform_commission_gst'] ?? 0);
        }

        // 7. Orders Breakdown by Status
        $orderStats = \App\Models\OrderItem::where('seller_id', $sellerId)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select('orders.status as order_status', DB::raw('count(distinct orders.id) as count'))
            ->groupBy('orders.status')
            ->get()
            ->pluck('count', 'order_status')
            ->toArray();

        $ordersBreakdown = [
            'pending' => $orderStats['pending'] ?? 0,
            'processing' => ($orderStats['confirmed'] ?? 0) + ($orderStats['processing'] ?? 0),
            'shipped' => $orderStats['shipped'] ?? 0,
            'delivered' => $orderStats['delivered'] ?? 0,
            'cancelled' => $orderStats['cancelled'] ?? 0,
        ];

        // 8. Coupons Summary in a single query
        $activeCouponsCount = \App\Models\Coupon::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->count();

        $couponStats = Order::whereHas('items', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            })
            ->whereNotNull('coupon_code')
            ->where('status', '!=', 'cancelled')
            ->selectRaw('count(*) as count, coalesce(sum(discount_amount), 0) as discount')
            ->first();

        $totalRedeemed = (int)$couponStats->count;
        $totalDiscount = (float)$couponStats->discount;

        $couponsList = \App\Models\Coupon::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->limit(5)
            ->get()
            ->map(function ($c) {
                return [
                    'code' => $c->code,
                    'value' => (float)$c->value,
                    'type' => $c->type === 'percent' ? 'percentage' : 'fixed'
                ];
            });

        $couponsSummary = [
            'active_count' => $activeCouponsCount,
            'total_redeemed' => $totalRedeemed,
            'total_discount' => round($totalDiscount, 2),
            'list' => $couponsList
        ];

        // 9. Reviews Summary
        $reviews = \App\Models\Review::where('seller_id', $sellerId);
        $totalReviewsCount = $reviews->count();
        $avgRating = $reviews->avg('rating') ?? 0;
        $positiveReviewsCount = \App\Models\Review::where('seller_id', $sellerId)->where('rating', '>=', 4)->count();
        $positivePercentage = $totalReviewsCount > 0 ? ($positiveReviewsCount / $totalReviewsCount) * 100 : 0;
        $pendingReply = \App\Models\Review::where('seller_id', $sellerId)->doesntHave('reply')->count();

        $latestReviews = \App\Models\Review::where('seller_id', $sellerId)
            ->with('customer:id,name')
            ->latest()
            ->limit(2)
            ->get()
            ->map(function ($rev) {
                return [
                    'customer_name' => $rev->customer ? $rev->customer->name : ($rev->full_name ?? 'Anonymous'),
                    'rating' => $rev->rating,
                    'review_text' => $rev->review_text ?? $rev->description ?? '',
                    'date' => $rev->created_at->toDateString()
                ];
            });

        $reviewsSummary = [
            'avg_rating' => round($avgRating, 1),
            'total_count' => $totalReviewsCount,
            'positive_percentage' => round($positivePercentage, 1),
            'pending_reply' => $pendingReply,
            'latest' => $latestReviews
        ];

        // 10. Support Summary in a single query
        $ticketStats = \App\Models\Ticket::where('created_by_id', $sellerId)
            ->selectRaw('
                sum(case when status not in (\'resolved\', \'closed\') then 1 else 0 end) as open,
                sum(case when status in (\'resolved\', \'closed\') then 1 else 0 end) as resolved
            ')
            ->first();

        $openTickets = (int)$ticketStats->open;
        $resolvedTickets = (int)$ticketStats->resolved;

        $latestTicket = \App\Models\Ticket::where('created_by_id', $sellerId)
            ->latest()
            ->first();

        $latestTicketData = null;
        if ($latestTicket) {
            $latestTicketData = [
                'ticket_number' => 'CRZ-T-' . $latestTicket->id,
                'subject' => $latestTicket->subject,
                'status' => $latestTicket->status
            ];
        }

        $supportSummary = [
            'open_count' => $openTickets,
            'resolved_count' => $resolvedTickets,
            'latest' => $latestTicketData
        ];

        // 11. Settings Summary (Store profile, bank, notifications)
        $profile = \App\Models\SellerProfile::where('user_id', $sellerId)->first();
        $brand = \App\Models\Brand::where('user_id', $sellerId)->first();
        $notifications = \App\Models\SellerNotificationSetting::where('seller_id', $sellerId)->first();

        $settingsSummary = [
            'brand_name' => $brand ? $brand->name : 'N/A',
            'brand_slug' => $brand ? $brand->slug : 'n/a',
            'brand_desc' => $brand ? ($brand->short_description ?? $brand->description ?? 'No description provided') : 'No description provided',
            'bank_name' => $profile ? $profile->bank_name : '',
            'bank_account' => $profile ? $profile->bank_account_number : '',
            'gst_number' => $profile ? $profile->gst_number : '',
            'notifications_enabled' => $notifications ? (bool)($notifications->email_notifications || $notifications->order_notifications) : false,
            'two_factor_enabled' => false
        ];

        return response()->json([
            'sales' => [
                'value' => round($totalSales, 2),
                'change' => round($salesChange, 1),
                'trend' => $salesChange >= 0 ? 'up' : 'down'
            ],
            'orders' => [
                'value' => $totalOrders,
                'change' => round($ordersChange, 1),
                'trend' => $ordersChange >= 0 ? 'up' : 'down'
            ],
            'avg_order_value' => [
                'value' => round($avgOrderValue, 2),
                'change' => 0,
                'trend' => 'up'
            ],
            'products' => [
                'total' => $totalProducts,
                'active' => $activeProducts,
                'pending' => $pendingProducts,
                'out_of_stock' => $outOfStock,
                'low_stock' => $lowStock
            ],
            'revenue' => [
                'gross' => round($totalSales, 2),
                'commission' => round($totalCommission, 2),
                'gateway_fee' => round($gatewayFee, 2),
                'tcs' => round($tcs, 2),
                'tds' => round($tds, 2),
                'net' => round($availableBalance, 2),
                'pending_payout' => round($pendingPayout, 2),
                'paid_payout' => round($paidPayout, 2)
            ],
            'conversion_yield' => [
                'value' => round($conversionRate, 2),
                'trend' => $conversionRate >= 3.0 ? 'Healthy' : 'Low',
                'sub' => 'Orders / Product Views'
            ],
            'cod_ratio' => round($codRatio, 2),
            'commission_rate' => $commissionRate,
            'orders_breakdown' => $ordersBreakdown,
            'coupons_summary' => $couponsSummary,
            'reviews_summary' => $reviewsSummary,
            'support_summary' => $supportSummary,
            'settings_summary' => $settingsSummary
        ]);
    }
    
    /**
     * Get sales graph data
     */
    public function salesGraph(Request $request)
    {
        $sellerId = Auth::id();
        $range = $request->input('range', '30_days');
        $groupBy = $request->input('group_by', 'day');
        
        $startDate = $this->getStartDate($range);
        $endDate = now();
        
        $salesData = \App\Models\OrderItem::where('seller_id', $sellerId)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('SUM(order_items.total) as total_sales')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date');
            
        // Fill missing dates if range is reasonable (<= 95 days) to avoid performance issues
        $finalData = [];
        $diffInDays = $startDate->diffInDays($endDate);
        if ($diffInDays <= 95) {
            $currentDate = $startDate->copy();
            while ($currentDate->lte($endDate)) {
                $dateString = $currentDate->format('Y-m-d');
                $finalData[] = [
                    'date' => $dateString,
                    'total_sales' => isset($salesData[$dateString]) ? (float)$salesData[$dateString]->total_sales : 0
                ];
                $currentDate->addDay();
            }
        } else {
            // For longer ranges, just return the data points that exist
            foreach ($salesData as $row) {
                $finalData[] = [
                    'date' => $row->date,
                    'total_sales' => (float)$row->total_sales
                ];
            }
        }
        
        return response()->json($finalData);
    }
    
    /**
     * Get order status breakdown
     */
    public function orderStatus()
    {
        $sellerId = Auth::id();
        
        $statusCounts = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->select('status', DB::raw('count(*) as count'))
        ->groupBy('status')
        ->pluck('count', 'status')
        ->toArray();
        
        // Ensure all statuses are present
        $allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        $result = [];
        foreach ($allStatuses as $status) {
            $result[$status] = $statusCounts[$status] ?? 0;
        }
        
        return response()->json($result);
    }
    
    /**
     * Get top selling products
     */
    public function topProducts(Request $request)
    {
        $sellerId = Auth::id();
        $range = $request->input('range', '30_days');
        $startDate = $this->getStartDate($range);
        
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('order_items.seller_id', $sellerId)
            ->where('orders.created_at', '>=', $startDate)
            ->select(
                'products.id as product_id',
                'products.title as product_name',
                'products.image',
                'products.stock as stock_left',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.total) as revenue')
            )
            ->groupBy('products.id', 'products.title', 'products.image', 'products.stock')
            ->orderBy('revenue', 'desc')
            ->limit(5)
            ->get();
        
        return response()->json($topProducts);
    }
    
    /**
     * Get recent orders
     */
    public function recentOrders()
    {
        $sellerId = Auth::id();
        
        $orders = \App\Models\OrderItem::where('seller_id', $sellerId)
            ->whereHas('order')
            ->with(['order.user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                if (!$item->order) return null;
                return [
                    'id' => $item->order->id,
                    'order_number' => $item->order->order_number,
                    'product_name' => $item->product_name,
                    'customer' => $item->order->user ? $item->order->user->name : 'Guest',
                    'date' => $item->order->created_at->format('M d, Y'),
                    'amount' => $item->total,
                    'status' => $item->status ?? $item->order->status
                ];
            })
            ->filter()
            ->values();
            
        return response()->json($orders);
    }
    
    /**
     * Export reports
     */
    public function export(Request $request)
    {
        $type = $request->input('type', 'orders');
        $sellerId = Auth::id();
        
        // Simple CSV export
        $filename = $type . '-report-' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $callback = function() use ($type, $sellerId) {
            $file = fopen('php://output', 'w');
            
            if ($type === 'orders') {
                fputcsv($file, ['Order Number', 'Customer', 'Date', 'Amount', 'Status']);
                
                $orders = Order::whereHas('items', function ($q) use ($sellerId) {
                    $q->where('seller_id', $sellerId);
                })->with('user')->get();
                
                foreach ($orders as $order) {
                    fputcsv($file, [
                        $order->order_number,
                        $order->user ? $order->user->name : 'Guest',
                        $order->created_at->format('Y-m-d'),
                        $order->final_amount,
                        $order->status
                    ]);
                }
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Helper: Get start date based on range
     */
    private function getStartDate($range)
    {
        switch ($range) {
            case 'today':
                return now()->startOfDay();
            case '7_days':
                return now()->subDays(7);
            case '30_days':
                return now()->subDays(30);
            case 'last_month':
                return now()->subMonth()->startOfMonth();
            case 'all_time':
                return now()->subYears(10);
            default:
                return now()->subDays(30);
        }
    }
    
    /**
     * Helper: Get previous period start date
     */
    private function getPreviousStartDate($range)
    {
        switch ($range) {
            case 'today':
                return now()->subDay()->startOfDay();
            case '7_days':
                return now()->subDays(14);
            case '30_days':
                return now()->subDays(60);
            case 'last_month':
                return now()->subMonths(2)->startOfMonth();
            default:
                return now()->subDays(60);
        }
    }
}
