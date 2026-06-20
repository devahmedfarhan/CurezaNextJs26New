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
        // System Overview Stats
        $totalSellers = SellerProfile::count();
        $activeSellers = SellerProfile::where('is_verified', true)->count();
        $pendingApprovals = SellerProfile::where('is_verified', false)->count();

        $totalDoctors = User::where('role', 'doctor')->count();
        $activeDoctors = User::where('role', 'doctor')->where('doctor_status', 'approved')->count();

        $totalUsers = User::where('role', 'customer')->count();

        // 1. Platform & Seller Stats
        $sellerGrossSales = (float) Order::where('payment_status', 'paid')->sum('final_amount');
        $sellerNetEarnings = (float) Order::where('payment_status', 'paid')
            ->selectRaw('SUM(CASE WHEN commission_calculated_at IS NOT NULL THEN seller_earnings ELSE final_amount * 0.725 END) as val')
            ->value('val') ?? 0;
        $sellerPlatformCommission = (float) Order::where('payment_status', 'paid')
            ->selectRaw('SUM(CASE WHEN commission_calculated_at IS NOT NULL THEN platform_commission_amount ELSE final_amount * 0.25 END) as val')
            ->value('val') ?? 0;

        // Today's Seller Stats
        $todaySellerGrossSales = (float) Order::where('payment_status', 'paid')
            ->whereDate('created_at', Carbon::today())
            ->sum('final_amount');
        $todaySellerNetEarnings = (float) Order::where('payment_status', 'paid')
            ->whereDate('created_at', Carbon::today())
            ->selectRaw('SUM(CASE WHEN commission_calculated_at IS NOT NULL THEN seller_earnings ELSE final_amount * 0.725 END) as val')
            ->value('val') ?? 0;
        $todaySellerPlatformCommission = (float) Order::where('payment_status', 'paid')
            ->whereDate('created_at', Carbon::today())
            ->selectRaw('SUM(CASE WHEN commission_calculated_at IS NOT NULL THEN platform_commission_amount ELSE final_amount * 0.25 END) as val')
            ->value('val') ?? 0;

        // 2. Doctor Stats
        $doctorGrossSales = (float) \App\Models\Appointment::where('payment_status', 'paid')->sum('amount');
        $doctorNetEarnings = (float) \App\Models\Appointment::where('payment_status', 'paid')
            ->selectRaw('SUM(amount * case when is_follow_up = 1 then 1.0 when consultation_type = \'chat\' then 0.80 else 0.85 end) as val')
            ->value('val') ?? 0;
        $doctorPlatformCommission = $doctorGrossSales - $doctorNetEarnings;

        // Today's Doctor Stats
        $todayDoctorGrossSales = (float) \App\Models\Appointment::where('payment_status', 'paid')
            ->whereDate('appointment_date', Carbon::today())
            ->sum('amount');
        $todayDoctorNetEarnings = (float) \App\Models\Appointment::where('payment_status', 'paid')
            ->whereDate('appointment_date', Carbon::today())
            ->selectRaw('SUM(amount * case when is_follow_up = 1 then 1.0 when consultation_type = \'chat\' then 0.80 else 0.85 end) as val')
            ->value('val') ?? 0;
        $todayDoctorPlatformCommission = $todayDoctorGrossSales - $todayDoctorNetEarnings;

        // 3. Combined Platform Totals
        $platformGrossSales = $sellerGrossSales + $doctorGrossSales;
        $platformNetRevenue = $sellerPlatformCommission + $doctorPlatformCommission;
        $todayPlatformGrossSales = $todaySellerGrossSales + $todayDoctorGrossSales;
        $todayPlatformNetRevenue = $todaySellerPlatformCommission + $todayDoctorPlatformCommission;

        // 4. Order Stats
        $totalOrders = Order::count();
        $todayOrders = Order::whereDate('created_at', Carbon::today())->count();

        // 5. Registration counts
        $todaySellers = SellerProfile::whereDate('created_at', Carbon::today())->count();
        $todayDoctors = User::where('role', 'doctor')->whereDate('created_at', Carbon::today())->count();

        // 6. COD vs Prepaid stats
        $totalCodOrders = Order::where('payment_method', 'cod')->count();
        $todayCodOrders = Order::where('payment_method', 'cod')->whereDate('created_at', Carbon::today())->count();
        $totalCodAmount = (float) Order::where('payment_method', 'cod')->where('payment_status', 'paid')->sum('final_amount');
        $todayCodAmount = (float) Order::where('payment_method', 'cod')->where('payment_status', 'paid')->whereDate('created_at', Carbon::today())->sum('final_amount');

        $totalPaidOrders = Order::where('payment_method', '!=', 'cod')->count();
        $todayPaidOrders = Order::where('payment_method', '!=', 'cod')->whereDate('created_at', Carbon::today())->count();
        $totalPaidAmount = (float) Order::where('payment_method', '!=', 'cod')->where('payment_status', 'paid')->sum('final_amount');
        $todayPaidAmount = (float) Order::where('payment_method', '!=', 'cod')->where('payment_status', 'paid')->whereDate('created_at', Carbon::today())->sum('final_amount');

        $pendingPayoutAmount = (float) Payout::where('status', 'pending')->sum('requested_amount');

        // Recent Activity
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
                'total_orders' => $totalOrders,
                'today_orders' => $todayOrders,

                'platform_gross_sales' => $platformGrossSales,
                'platform_net_revenue' => $platformNetRevenue,
                'today_platform_gross_sales' => $todayPlatformGrossSales,
                'today_platform_net_revenue' => $todayPlatformNetRevenue,

                'seller_gross_sales' => $sellerGrossSales,
                'seller_net_earnings' => $sellerNetEarnings,
                'seller_platform_commission' => $sellerPlatformCommission,
                'today_seller_gross_sales' => $todaySellerGrossSales,
                'today_seller_net_earnings' => $todaySellerNetEarnings,
                'today_seller_platform_commission' => $todaySellerPlatformCommission,

                'doctor_gross_sales' => $doctorGrossSales,
                'doctor_net_earnings' => $doctorNetEarnings,
                'doctor_platform_commission' => $doctorPlatformCommission,
                'today_doctor_gross_sales' => $todayDoctorGrossSales,
                'today_doctor_net_earnings' => $todayDoctorNetEarnings,
                'today_doctor_platform_commission' => $todayDoctorPlatformCommission,

                'today_sellers' => $todaySellers,
                'today_doctors' => $todayDoctors,

                'total_cod_orders' => $totalCodOrders,
                'today_cod_orders' => $todayCodOrders,
                'total_cod_amount' => $totalCodAmount,
                'today_cod_amount' => $todayCodAmount,

                'total_paid_orders' => $totalPaidOrders,
                'today_paid_orders' => $todayPaidOrders,
                'total_paid_amount' => $totalPaidAmount,
                'today_paid_amount' => $todayPaidAmount,
                'pending_payout_amount' => $pendingPayoutAmount,
            ],
            'recent_activities' => $recentActivities,
            'recent_orders' => $recentOrders
        ]);
    }
}
