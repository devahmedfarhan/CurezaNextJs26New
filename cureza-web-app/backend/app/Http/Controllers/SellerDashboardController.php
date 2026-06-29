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
        
        $analytics = (new \App\Services\DashboardAnalyticsService())->getSellerDashboardStats($sellerId, $range);

        return response()->json($analytics);
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
                    'status' => $item->order->status === 'cod_reconciled' ? 'delivered' : $item->order->status
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
