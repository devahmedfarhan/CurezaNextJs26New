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
        
        // Get sales data
        $currentSales = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->where('created_at', '>=', $startDate)
        ->sum('final_amount');
        
        // Get previous period sales for comparison
        $previousStartDate = $this->getPreviousStartDate($range);
        $previousSales = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->whereBetween('created_at', [$previousStartDate, $startDate])
        ->sum('final_amount');
        
        $salesChange = $previousSales > 0 ? (($currentSales - $previousSales) / $previousSales) * 100 : 0;
        
        // Get orders count
        $currentOrders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->where('created_at', '>=', $startDate)
        ->count();
        
        $previousOrders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->whereBetween('created_at', [$previousStartDate, $startDate])
        ->count();
        
        $ordersChange = $previousOrders > 0 ? (($currentOrders - $previousOrders) / $previousOrders) * 100 : 0;
        
        // Average order value
        $avgOrderValue = $currentOrders > 0 ? $currentSales / $currentOrders : 0;
        
        // Products stats
        $activeProducts = Product::where('seller_id', $sellerId)
            ->where('status', 'approved')
            ->count();
            
        $outOfStock = Product::where('seller_id', $sellerId)
            ->where('stock', '<=', 0)
            ->count();
        
        // Revenue breakdown
        $grossRevenue = $currentSales;
        $commission = $grossRevenue * 0.10; // 10% platform fee
        $netRevenue = $grossRevenue - $commission;
        
        return response()->json([
            'sales' => [
                'value' => round($currentSales, 2),
                'change' => round($salesChange, 2),
                'trend' => $salesChange >= 0 ? 'up' : 'down'
            ],
            'orders' => [
                'value' => $currentOrders,
                'change' => round($ordersChange, 2),
                'trend' => $ordersChange >= 0 ? 'up' : 'down'
            ],
            'avg_order_value' => [
                'value' => round($avgOrderValue, 2),
                'change' => 0,
                'trend' => 'up'
            ],
            'products' => [
                'active' => $activeProducts,
                'out_of_stock' => $outOfStock
            ],
            'revenue' => [
                'gross' => round($grossRevenue, 2),
                'commission' => round($commission, 2),
                'net' => round($netRevenue, 2),
                'pending_payout' => round($netRevenue * 0.7, 2), // 70% pending
                'paid_payout' => round($netRevenue * 0.3, 2) // 30% paid
            ]
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
        
        $salesData = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->where('created_at', '>=', $startDate)
        ->select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(final_amount) as total_sales')
        )
        ->groupBy('date')
        ->orderBy('date')
        ->get();
        
        return response()->json($salesData);
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
        
        $orders = Order::whereHas('items', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->with(['items' => function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId)->with('product');
        }, 'user'])
        ->latest()
        ->limit(10)
        ->get()
        ->map(function ($order) {
            $firstItem = $order->items->first();
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'product_name' => $firstItem ? $firstItem->product_name : 'N/A',
                'customer' => $order->user ? $order->user->name : 'Guest',
                'date' => $order->created_at->format('M d, Y'),
                'amount' => $order->final_amount,
                'status' => $order->status
            ];
        });
        
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
