<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function revenue(Request $request)
    {
        $period = $request->input('period', 'monthly'); // daily, monthly, yearly
        
        $query = Order::where('payment_status', 'paid');

        if ($period == 'daily') {
            $data = $query->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(final_amount) as revenue'),
                DB::raw('SUM(admin_commission) as commission')
            )
            ->whereDate('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        } else {
            $data = $query->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(final_amount) as revenue'),
                DB::raw('SUM(admin_commission) as commission')
            )
            ->whereDate('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        }

        return response()->json($data);
    }

    public function userGrowth()
    {
        $users = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as total')
        )
        ->where('role', 'customer')
        ->whereDate('created_at', '>=', Carbon::now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return response()->json($users);
    }

    public function topPerformance()
    {
        // Top Sellers by Revenue
        $topSellers = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('users', 'products.seller_id', '=', 'users.id')
            ->select('users.name', DB::raw('SUM(order_items.price * order_items.quantity) as revenue'))
            ->groupBy('users.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        return response()->json([
            'top_sellers' => $topSellers
        ]);
    }

    public function systemHealth()
    {
        return response()->json([
            'total_products' => Product::count(),
            'total_appointments' => Appointment::count(),
            'total_orders' => Order::count(),
            'server_time' => now(),
            // Add more health checks if needed (queue size, etc.)
        ]);
    }
}
