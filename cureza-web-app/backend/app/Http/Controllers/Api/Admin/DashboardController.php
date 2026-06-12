<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use App\Models\SellerProfile;
use App\Models\ActivityLog;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // System Overview Stats
        $totalSellers = SellerProfile::count();
        $activeSellers = SellerProfile::where('is_verified', true)->count();
        $pendingApprovals = SellerProfile::where('is_verified', false)->count();

        $totalDoctors = User::where('role', 'doctor')->count();
        $activeDoctors = User::where('role', 'doctor')->where('doctor_status', 'approved')->count();

        $totalUsers = User::where('role', 'customer')->count();

        // Financial Stats (approximate from orders)
        $totalRevenue = Order::where('payment_status', 'paid')->sum('final_amount');
        $totalOrders = Order::count();
        
        // Today's Stats
        $todayOrders = Order::whereDate('created_at', Carbon::today())->count();
        $todayRevenue = Order::whereDate('created_at', Carbon::today())
                             ->where('payment_status', 'paid')
                             ->sum('final_amount');

        // Recent Activity (mocked or from DB if populated)
        $recentActivities = ActivityLog::with('user')->latest()->limit(5)->get();
        
        $recentOrders = Order::with('user')->latest()->limit(5)->get();

        return response()->json([
            'stats' => [
                'total_sellers' => $totalSellers,
                'active_sellers' => $activeSellers,
                'pending_approvals' => $pendingApprovals,
                'total_doctors' => $totalDoctors,
                'active_doctors' => $activeDoctors,
                'total_users' => $totalUsers,
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'today_orders' => $todayOrders,
                'today_revenue' => $todayRevenue,
            ],
            'recent_activities' => $recentActivities,
            'recent_orders' => $recentOrders
        ]);
    }
}
