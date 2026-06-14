<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard summary (KPIs).
     */
    public function summary(Request $request)
    {
        $sellerId = auth()->id();
        $dateRange = $this->getDateRange($request);

        // 1. Total Sales (Revenue) - Include all non-cancelled orders (handling COD)
        $totalSales = OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', function ($q) use ($dateRange) {
                if ($dateRange['start'] && $dateRange['end']) {
                    $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                }
                $q->where('status', '!=', 'cancelled'); // Count confirmed/pending/shipped/delivered
            })
            ->sum('total');

        // Previous Period for % Change
        $previousRange = $this->getPreviousDateRange($request);
        $previousSales = OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', function ($q) use ($previousRange) {
                if ($previousRange['start'] && $previousRange['end']) {
                    $q->whereBetween('created_at', [$previousRange['start'], $previousRange['end']]);
                }
                $q->where('status', '!=', 'cancelled');
            })
            ->sum('total');

        $salesChange = $previousSales > 0 ? (($totalSales - $previousSales) / $previousSales) * 100 : ($totalSales > 0 ? 100 : 0);

        // 2. Total Orders (Distinct Orders containing seller's items)
        $totalOrders = OrderItem::where('seller_id', $sellerId)
            ->whereHas('order', function ($q) use ($dateRange) {
                if ($dateRange['start'] && $dateRange['end']) {
                    $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                }
                $q->where('status', '!=', 'cancelled');
            })
            ->distinct('order_id')
            ->count('order_id');
            
        // Previous Orders for % Change
        $previousOrders = OrderItem::where('seller_id', $sellerId)
             ->whereHas('order', function ($q) use ($previousRange) {
                if ($previousRange['start'] && $previousRange['end']) {
                    $q->whereBetween('created_at', [$previousRange['start'], $previousRange['end']]);
                }
                $q->where('status', '!=', 'cancelled');
            })
            ->distinct('order_id')
            ->count('order_id');
            
        $ordersChange = $previousOrders > 0 ? (($totalOrders - $previousOrders) / $previousOrders) * 100 : ($totalOrders > 0 ? 100 : 0);

        // 3. Average Order Value
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;
        
        // 4. Products Count (Active)
        $totalProducts = Product::where('seller_id', $sellerId)->count();

        $activeProducts = Product::where('seller_id', $sellerId)
            ->where('status', 'published')
            ->count();
            
        $pendingProducts = Product::where('seller_id', $sellerId)
            ->whereIn('status', ['pending_approval', 'pending_update', 'delete_requested'])
            ->count();
        
        // 5. Out of Stock / Low Stock
        $outOfStock = Product::where('seller_id', $sellerId)
            ->where('stock', '<=', 0)
            ->count();

        $lowStock = Product::where('seller_id', $sellerId)
            ->where('stock', '<=', 10)
            ->count();

        // 6. Payouts Section
        $pendingPayout = \App\Models\Payout::where('seller_id', $sellerId)
            ->where('status', 'pending')
            ->sum('requested_amount');

        $paidPayout = \App\Models\Payout::where('seller_id', $sellerId)
            ->where('status', 'approved')
            ->sum('approved_amount');

        // Let's use Wallet details for available balance
        $wallet = \App\Models\SellerWallet::where('seller_id', $sellerId)->first();
        $availableBalance = $wallet ? $wallet->available_balance : 0;

        // Use CommissionService
        $commissionService = new \App\Services\CommissionService();
        $commissionSummary = $commissionService->getSellerCommissionSummary($sellerId, $dateRange['start'], $dateRange['end']);

        $totalCommission = $commissionSummary['total_platform_commission'];
        $gatewayFee = $commissionSummary['total_gateway_fee'];
        $tcs = $totalSales * 0.01;
        $tds = $totalSales * 0.01;

        // 7. Orders Breakdown by Status
        $orderStats = OrderItem::where('seller_id', $sellerId)
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

        // 8. Coupons Summary
        $activeCouponsCount = \App\Models\Coupon::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->count();

        $totalRedeemed = Order::whereHas('items', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            })
            ->whereNotNull('coupon_code')
            ->where('status', '!=', 'cancelled')
            ->count();

        $totalDiscount = Order::whereHas('items', function ($q) use ($sellerId) {
                $q->where('seller_id', $sellerId);
            })
            ->whereNotNull('coupon_code')
            ->where('status', '!=', 'cancelled')
            ->sum('discount_amount');

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

        // 10. Support Summary
        $openTickets = \App\Models\Ticket::where('created_by_id', $sellerId)
            ->whereNotIn('status', ['resolved', 'closed'])
            ->count();

        $resolvedTickets = \App\Models\Ticket::where('created_by_id', $sellerId)
            ->whereIn('status', ['resolved', 'closed'])
            ->count();

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
            'orders_breakdown' => $ordersBreakdown,
            'coupons_summary' => $couponsSummary,
            'reviews_summary' => $reviewsSummary,
            'support_summary' => $supportSummary,
            'settings_summary' => $settingsSummary
        ]);
    }

    /**
     * Get sales trend graph data.
     */
    public function salesGraph(Request $request)
    {
        $sellerId = auth()->id();
        $dateRange = $this->getDateRange($request);
        $groupBy = $request->get('group_by', 'day'); // day, week, month

        $query = OrderItem::where('seller_id', $sellerId)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->select(
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('SUM(order_items.total) as total_sales')
            );

        if ($dateRange['start'] && $dateRange['end']) {
            $query->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']]);
        }

        $salesData = $query->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date');

        // Fill missing dates if the range is within 95 days to avoid memory/loop issues
        $finalData = [];
        
        if ($dateRange['start'] && $dateRange['end'] && $dateRange['start']->diffInDays($dateRange['end']) <= 95) {
            $currentDate = $dateRange['start']->copy();
            $endDate = $dateRange['end']->copy();
            
            while ($currentDate->lte($endDate)) {
                $dateString = $currentDate->format('Y-m-d');
                $finalData[] = [
                    'date' => $dateString,
                    'total_sales' => isset($salesData[$dateString]) ? (float)$salesData[$dateString]->total_sales : 0
                ];
                $currentDate->addDay();
            }
        } else {
            // For longer ranges or all_time, return existing data points mapped cleanly
            foreach ($salesData as $row) {
                $finalData[] = [
                    'date' => $row->date,
                    'total_sales' => (float)$row->total_sales
                ];
            }
        }
        
        return response()->json($finalData);
    }
    
    // ... topProducts, orderStatus similar status check update ...
        /**
     * Get Order Status Breakdown.
     */
    public function orderStatus(Request $request)
    {
        $sellerId = auth()->id();
        $stats = OrderItem::where('seller_id', $sellerId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return response()->json($stats);
    }

    /**
     * Get Top Selling Products.
     */
    public function topProducts(Request $request)
    {
        $sellerId = auth()->id();
        $dateRange = $this->getDateRange($request);

        $query = OrderItem::where('seller_id', $sellerId)
            ->select(
                'product_id', 
                'product_name', 
                DB::raw('SUM(quantity) as units_sold'), 
                DB::raw('SUM(total) as revenue')
            )
            ->whereHas('order', function($q) use ($dateRange) {
                 if ($dateRange['start'] && $dateRange['end']) {
                    $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                }
                $q->where('status', '!=', 'cancelled');
            })
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('units_sold')
            ->limit(5);

        $products = $query->get();
        
        foreach($products as $prod) {
            $p = Product::find($prod->product_id);
            $prod->stock_left = $p ? $p->stock : 0;
            $prod->image = $p ? $p->image : null;
        }

        return response()->json($products);
    }

    /**
     * Get Recent Orders for Seller Dashboard.
     */
    public function recentOrders(Request $request)
    {
        $sellerId = auth()->id();
        
        $orders = OrderItem::where('seller_id', $sellerId)
            ->whereHas('order') // Ensure order exists
            ->with(['order' => function($q) {
                $q->select('id', 'order_number', 'created_at', 'status', 'user_id', 'payment_status');
            }, 'order.user:id,name'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($item) {
                if (!$item->order) return null;

                return [
                    'id' => $item->order->id,
                    'order_number' => $item->order->order_number,
                    'product_name' => $item->product_name,
                    'customer' => $item->order->user ? $item->order->user->name : 'Guest',
                    'date' => $item->order->created_at->format('Y-m-d H:i'),
                    'amount' => $item->total,
                    'status' => $item->status,
                    'payment_status' => $item->order->payment_status
                ];
            })
            ->filter()
            ->values();

        return response()->json($orders);
    }


    /**
     * Export Reports.
     */
    public function export(Request $request)
    {
        $sellerId = auth()->id();
        $type = $request->get('type', 'orders'); // orders, sales, products, shipments
        
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$type-report.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($sellerId, $type) {
            $file = fopen('php://output', 'w');
            
            if ($type === 'orders') {
                fputcsv($file, ['Order ID', 'Date', 'Customer', 'Product', 'Quantity', 'Total', 'Order Status', 'Payment Status']);
                
                OrderItem::where('seller_id', $sellerId)
                    ->with(['order', 'order.user'])
                    ->orderBy('created_at', 'desc')
                    ->chunk(100, function($items) use ($file) {
                        foreach ($items as $item) {
                            fputcsv($file, [
                                $item->order->order_number,
                                $item->created_at->format('Y-m-d H:i'),
                                $item->order->user ? $item->order->user->name : 'Guest',
                                $item->product_name,
                                $item->quantity,
                                $item->total,
                                $item->status,
                                $item->order->payment_status
                            ]);
                        }
                    });
            } elseif ($type === 'sales') {
                 fputcsv($file, ['Date', 'Orders Count', 'Total Sales']);
                 $sales = OrderItem::where('seller_id', $sellerId)
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', '!=', 'cancelled')
                    ->select(
                        DB::raw('DATE(orders.created_at) as date'),
                        DB::raw('COUNT(DISTINCT orders.id) as count'),
                        DB::raw('SUM(order_items.total) as total')
                    )
                    ->groupBy('date')
                    ->orderBy('date', 'desc')
                    ->get();
                    
                  foreach($sales as $row) {
                      fputcsv($file, [$row->date, $row->count, $row->total]);
                  }
            } elseif ($type === 'products') {
                fputcsv($file, ['Product Name', 'Price', 'Units Sold', 'Revenue', 'Stock Left']);
                 $products = Product::where('seller_id', $sellerId)->get();
                 foreach($products as $p) {
                     $sold = OrderItem::where('product_id', $p->id)->sum('quantity');
                     $revenue = OrderItem::where('product_id', $p->id)->sum('total');
                     
                     fputcsv($file, [
                         $p->name,
                         $p->price,
                         $sold,
                         $revenue,
                         $p->stock
                     ]);
                 }
            } elseif ($type === 'shipments') {
                fputcsv($file, ['Order ID', 'Courier', 'Tracking #', 'Status', 'Shipped At']);
                \App\Models\Shipment::where('seller_id', $sellerId)
                    ->with('order')
                    ->chunk(100, function($shipments) use ($file) {
                        foreach($shipments as $shipment) {
                             fputcsv($file, [
                                 $shipment->order ? $shipment->order->order_number : 'N/A',
                                 $shipment->courier_name,
                                 $shipment->tracking_number,
                                 $shipment->status,
                                 $shipment->shipped_at
                             ]);
                        }
                    });
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
    
    // Helper for Date Range
    private function getDateRange(Request $request)
    {
        $range = $request->get('range', '30_days');
        $now = Carbon::now();

        switch ($range) {
            case 'today':
                return ['start' => $now->copy()->startOfDay(), 'end' => $now->copy()->endOfDay()];
            case '7_days':
                return ['start' => $now->copy()->subDays(7)->startOfDay(), 'end' => $now->copy()->endOfDay()];
            case '30_days':
                return ['start' => $now->copy()->subDays(30)->startOfDay(), 'end' => $now->copy()->endOfDay()];
            case 'last_month':
                 return ['start' => $now->copy()->subMonth()->startOfMonth(), 'end' => $now->copy()->subMonth()->endOfMonth()];
            case 'all_time':
                 return ['start' => null, 'end' => null];
            case 'custom':
                 return [
                     'start' => $request->start ? Carbon::parse($request->start) : null,
                     'end' => $request->end ? Carbon::parse($request->end) : null,
                 ];
            default:
                 return ['start' => $now->copy()->subDays(30)->startOfDay(), 'end' => $now->copy()->endOfDay()];
        }
    }
    
    private function getPreviousDateRange(Request $request) 
    {
        // Simple logic for previous period comparison (same duration)
         $range = $request->get('range', '30_days');
         $now = Carbon::now();
         
         switch ($range) {
            case 'today':
                return ['start' => $now->copy()->subDay()->startOfDay(), 'end' => $now->copy()->subDay()->endOfDay()];
            case '7_days':
                return ['start' => $now->copy()->subDays(14)->startOfDay(), 'end' => $now->copy()->subDays(7)->endOfDay()];
            case '30_days':
                return ['start' => $now->copy()->subDays(60)->startOfDay(), 'end' => $now->copy()->subDays(30)->endOfDay()];
             default:
                return ['start' => null, 'end' => null];
         }
    }
}
