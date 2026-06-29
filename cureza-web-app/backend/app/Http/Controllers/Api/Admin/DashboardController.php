<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use App\Models\SellerProfile;
use App\Models\ActivityLog;
use App\Models\Payout;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = (new \App\Services\DashboardAnalyticsService())->getAdminDashboardStats();

        // Recent Activity
        $recentActivities = ActivityLog::with('user')->latest()->limit(5)->get();
        $recentOrders = Order::with('user')->latest()->limit(5)->get();

        return response()->json([
            'stats' => $stats,
            'recent_activities' => $recentActivities,
            'recent_orders' => $recentOrders
        ]);
    }
}
