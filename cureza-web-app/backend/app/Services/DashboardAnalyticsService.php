<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\SellerProfile;
use App\Models\ActivityLog;
use App\Models\Payout;
use App\Models\Appointment;
use App\Models\Product;
use App\Models\Coupon;
use App\Models\Review;
use App\Models\Ticket;
use App\Models\Brand;
use App\Models\SellerNotificationSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardAnalyticsService
{
    /**
     * Get statistics for the Super Admin dashboard.
     */
    public function getAdminDashboardStats(): array
    {
        $totalSellers = SellerProfile::count();
        $activeSellers = SellerProfile::where('is_verified', true)->count();
        $pendingApprovals = SellerProfile::where('is_verified', false)->count();

        $totalDoctors = User::where('role', 'doctor')->count();
        $activeDoctors = User::where('role', 'doctor')->where('doctor_status', 'approved')->count();

        $totalUsers = User::where('role', 'customer')->count();

        // 1. Platform & Seller Stats (excluding cancelled orders for consistency)
        $sellerGrossSales = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->sum('final_amount');
            
        $sellerGrossSalesBeforeDiscount = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        $sellerTotalDiscounts = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->selectRaw('SUM(CASE WHEN total_amount + shipping_amount > final_amount THEN total_amount + shipping_amount - final_amount ELSE 0 END) as val')
            ->value('val') ?? 0;

        $sellerNetEarnings = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->selectRaw('SUM(CASE WHEN commission_calculated_at IS NOT NULL THEN seller_earnings ELSE final_amount * 0.725 END) as val')
            ->value('val') ?? 0;

        $sellerPlatformCommission = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->selectRaw('SUM(CASE WHEN commission_calculated_at IS NOT NULL THEN platform_commission_amount ELSE final_amount * 0.25 END) as val')
            ->value('val') ?? 0;

        // Today's Seller Stats
        $todaySellerGrossSales = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereDate('created_at', Carbon::today())
            ->sum('final_amount');

        $todaySellerGrossSalesBeforeDiscount = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');

        $todaySellerTotalDiscounts = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereDate('created_at', Carbon::today())
            ->selectRaw('SUM(CASE WHEN total_amount + shipping_amount > final_amount THEN total_amount + shipping_amount - final_amount ELSE 0 END) as val')
            ->value('val') ?? 0;

        $todaySellerNetEarnings = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereDate('created_at', Carbon::today())
            ->selectRaw('SUM(CASE WHEN commission_calculated_at IS NOT NULL THEN seller_earnings ELSE final_amount * 0.725 END) as val')
            ->value('val') ?? 0;

        $todaySellerPlatformCommission = (float) Order::where('payment_status', 'paid')
            ->where('status', '!=', 'cancelled')
            ->whereDate('created_at', Carbon::today())
            ->selectRaw('SUM(CASE WHEN commission_calculated_at IS NOT NULL THEN platform_commission_amount ELSE final_amount * 0.25 END) as val')
            ->value('val') ?? 0;

        // 2. Doctor Stats (using payment_status = 'paid' AND status = 'completed' for dashboard/finance alignment)
        $doctorGrossSales = (float) Appointment::where('payment_status', 'paid')
            ->where('status', 'completed')
            ->sum('amount');

        // Extract share calculation to central method
        $doctorNetEarnings = 0.0;
        $appointments = Appointment::where('payment_status', 'paid')
            ->where('status', 'completed')
            ->get();

        foreach ($appointments as $appt) {
            $doctorNetEarnings += $this->calculateDoctorEarnings($appt);
        }
        $doctorPlatformCommission = $doctorGrossSales - $doctorNetEarnings;

        // Today's Doctor Stats
        $todayDoctorGrossSales = (float) Appointment::where('payment_status', 'paid')
            ->where('status', 'completed')
            ->whereDate('appointment_date', Carbon::today())
            ->sum('amount');

        $todayDoctorNetEarnings = 0.0;
        $todayAppointments = Appointment::where('payment_status', 'paid')
            ->where('status', 'completed')
            ->whereDate('appointment_date', Carbon::today())
            ->get();

        foreach ($todayAppointments as $appt) {
            $todayDoctorNetEarnings += $this->calculateDoctorEarnings($appt);
        }
        $todayDoctorPlatformCommission = $todayDoctorGrossSales - $todayDoctorNetEarnings;

        // 3. Combined Platform Totals
        $platformGrossSales = $sellerGrossSales + $doctorGrossSales;
        $platformNetRevenue = $sellerPlatformCommission + $doctorPlatformCommission;
        $todayPlatformGrossSales = $todaySellerGrossSales + $todayDoctorGrossSales;
        $todayPlatformNetRevenue = $todaySellerPlatformCommission + $todayDoctorPlatformCommission;

        $platformGrossSalesBeforeDiscount = $sellerGrossSalesBeforeDiscount + $doctorGrossSales;
        $platformTotalDiscounts = $sellerTotalDiscounts;
        $todayPlatformGrossSalesBeforeDiscount = $todaySellerGrossSalesBeforeDiscount + $todayDoctorGrossSales;
        $todayPlatformTotalDiscounts = $todaySellerTotalDiscounts;

        // 4. Order Stats
        $totalOrders = Order::count();
        $todayOrders = Order::whereDate('created_at', Carbon::today())->count();

        // 5. Registration counts
        $todaySellers = SellerProfile::whereDate('created_at', Carbon::today())->count();
        $todayDoctors = User::where('role', 'doctor')->whereDate('created_at', Carbon::today())->count();

        // 6. COD vs Prepaid stats
        $totalCodOrders = Order::where('payment_method', 'cod')->count();
        $todayCodOrders = Order::where('payment_method', 'cod')->whereDate('created_at', Carbon::today())->count();
        $totalCodAmount = (float) Order::where('payment_method', 'cod')->where('payment_status', 'paid')->where('status', '!=', 'cancelled')->sum('final_amount');
        $todayCodAmount = (float) Order::where('payment_method', 'cod')->where('payment_status', 'paid')->where('status', '!=', 'cancelled')->whereDate('created_at', Carbon::today())->sum('final_amount');

        $totalPaidOrders = Order::where('payment_method', '!=', 'cod')->where('payment_status', 'paid')->count();
        $todayPaidOrders = Order::where('payment_method', '!=', 'cod')->where('payment_status', 'paid')->whereDate('created_at', Carbon::today())->count();
        $totalPaidAmount = (float) Order::where('payment_method', '!=', 'cod')->where('payment_status', 'paid')->where('status', '!=', 'cancelled')->sum('final_amount');
        $todayPaidAmount = (float) Order::where('payment_method', '!=', 'cod')->where('payment_status', 'paid')->where('status', '!=', 'cancelled')->whereDate('created_at', Carbon::today())->sum('final_amount');

        $pendingPayoutAmount = (float) Payout::where('status', 'pending')->sum('requested_amount');

        return [
            'total_sellers' => $totalSellers,
            'active_sellers' => $activeSellers,
            'pending_approvals' => $pendingApprovals,
            'total_doctors' => $totalDoctors,
            'active_doctors' => $activeDoctors,
            'total_users' => $totalUsers,
            'total_orders' => $totalOrders,
            'today_orders' => $todayOrders,

            'platform_gross_sales' => round($platformGrossSales, 2),
            'platform_gross_sales_before_discount' => round($platformGrossSalesBeforeDiscount, 2),
            'platform_total_discounts' => round($platformTotalDiscounts, 2),
            'platform_net_revenue' => round($platformNetRevenue, 2),
            'today_platform_gross_sales' => round($todayPlatformGrossSales, 2),
            'today_platform_gross_sales_before_discount' => round($todayPlatformGrossSalesBeforeDiscount, 2),
            'today_platform_total_discounts' => round($todayPlatformTotalDiscounts, 2),
            'today_platform_net_revenue' => round($todayPlatformNetRevenue, 2),

            'seller_gross_sales' => round($sellerGrossSales, 2),
            'seller_gross_sales_before_discount' => round($sellerGrossSalesBeforeDiscount, 2),
            'seller_total_discounts' => round($sellerTotalDiscounts, 2),
            'seller_net_earnings' => round($sellerNetEarnings, 2),
            'seller_platform_commission' => round($sellerPlatformCommission, 2),
            'today_seller_gross_sales' => round($todaySellerGrossSales, 2),
            'today_seller_gross_sales_before_discount' => round($todaySellerGrossSalesBeforeDiscount, 2),
            'today_seller_total_discounts' => round($todaySellerTotalDiscounts, 2),
            'today_seller_net_earnings' => round($todaySellerNetEarnings, 2),
            'today_seller_platform_commission' => round($todaySellerPlatformCommission, 2),

            'doctor_gross_sales' => round($doctorGrossSales, 2),
            'doctor_net_earnings' => round($doctorNetEarnings, 2),
            'doctor_platform_commission' => round($doctorPlatformCommission, 2),
            'today_doctor_gross_sales' => round($todayDoctorGrossSales, 2),
            'today_doctor_net_earnings' => round($todayDoctorNetEarnings, 2),
            'today_doctor_platform_commission' => round($todayDoctorPlatformCommission, 2),

            'today_sellers' => $todaySellers,
            'today_doctors' => $todayDoctors,

            'total_cod_orders' => $totalCodOrders,
            'today_cod_orders' => $todayCodOrders,
            'total_cod_amount' => round($totalCodAmount, 2),
            'today_cod_amount' => round($todayCodAmount, 2),

            'total_paid_orders' => $totalPaidOrders,
            'today_paid_orders' => $todayPaidOrders,
            'total_paid_amount' => round($totalPaidAmount, 2),
            'today_paid_amount' => round($todayPaidAmount, 2),
            'pending_payout_amount' => round($pendingPayoutAmount, 2),
        ];
    }

    /**
     * Get statistics for a specific Doctor's dashboard.
     */
    public function getDoctorDashboardStats(int $doctorId): array
    {
        $totalPatients = Appointment::where('doctor_id', $doctorId)
            ->distinct('patient_id')
            ->count('patient_id');

        $totalAppointments = Appointment::where('doctor_id', $doctorId)->count();

        $completedAppointments = Appointment::where('doctor_id', $doctorId)
            ->where('payment_status', 'paid')
            ->where('status', 'completed')
            ->get();

        $totalEarnings = 0;
        foreach ($completedAppointments as $appt) {
            $totalEarnings += $this->calculateDoctorEarnings($appt);
        }

        $pendingRequests = Appointment::where('doctor_id', $doctorId)
            ->where('status', 'pending')
            ->count();

        return [
            'total_patients' => $totalPatients,
            'total_appointments' => $totalAppointments,
            'total_earnings' => round($totalEarnings, 2),
            'pending_requests' => $pendingRequests,
        ];
    }

    /**
     * Centralized share split rules for doctors.
     */
    public function calculateDoctorEarnings(Appointment $appt): float
    {
        $amt = (float)$appt->amount;
        $isFollowUp = $appt->is_follow_up == 1 || $appt->is_follow_up == true;
        
        if ($isFollowUp) {
            $docShare = 1.0;
        } else {
            // Load rate dynamically from doctor's user/profile or use fallback
            $doctor = $appt->doctor;
            if ($doctor && isset($doctor->consultation_commission_rate)) {
                $docShare = (float)$doctor->consultation_commission_rate / 100;
            } else if ($appt->consultation_type === 'chat') {
                $docShare = 0.80;
            } else {
                $docShare = 0.85;
            }
        }
        
        return $amt * $docShare;
    }

    /**
     * Get summary metrics for a seller dashboard.
     */
    public function getSellerDashboardStats(int $sellerId, string $range): array
    {
        $startDate = $this->getStartDate($range);
        $dateRange = ['start' => $startDate, 'end' => now()];

        // 1. Current period sales and orders (only non-cancelled, matching seller dashboard logic)
        $currentStats = OrderItem::where('seller_id', $sellerId)
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

        // Previous period sales and orders
        $previousStartDate = $this->getPreviousStartDate($range);
        $previousRange = ['start' => $previousStartDate, 'end' => $startDate];

        $previousStats = OrderItem::where('seller_id', $sellerId)
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
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        // 2. Product Stats
        $productStats = Product::where('seller_id', $sellerId)
            ->selectRaw("
                count(*) as total,
                sum(case when status = 'published' then 1 else 0 end) as active,
                sum(case when status in ('pending_approval', 'pending_update', 'delete_requested') then 1 else 0 end) as pending,
                sum(case when stock <= 0 then 1 else 0 end) as out_of_stock,
                sum(case when stock <= 10 then 1 else 0 end) as low_stock
            ")
            ->first();

        // 3. Payout stats
        $payoutStats = Payout::where('seller_id', $sellerId)
            ->selectRaw("
                coalesce(sum(case when status = 'pending' then requested_amount else 0 end), 0) as pending,
                coalesce(sum(case when status = 'approved' then approved_amount else 0 end), 0) as approved
            ")
            ->first();

        $wallet = \App\Models\SellerWallet::where('seller_id', $sellerId)->first();
        $availableBalance = $wallet ? $wallet->available_balance : 0;

        // Product views and conversion yield
        $totalViews = Product::where('seller_id', $sellerId)->sum('views_count') ?? 0;
        $conversionRate = $totalViews > 0 ? ($totalOrders / $totalViews) * 100 : 0;

        // COD Ratio
        $paymentStats = OrderItem::where('seller_id', $sellerId)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', '!=', 'cancelled')
            ->selectRaw("
                coalesce(sum(case when lower(orders.payment_method) = 'cod' then order_items.total else 0 end), 0) as cod_sales,
                coalesce(sum(order_items.total), 0) as total_sales
            ")
            ->first();
        $codSales = (float)$paymentStats->cod_sales;
        $totalSalesForCod = (float)$paymentStats->total_sales;
        $codRatio = $totalSalesForCod > 0 ? ($codSales / $totalSalesForCod) * 100 : 40.0;

        // Seller commission rates
        $currentCommission = (new \App\Services\CommissionService())->getSellerCommissionRate($sellerId);
        $commissionRate = [
            'platform' => $currentCommission->base_commission_percentage,
            'gateway' => $currentCommission->payment_gateway_percentage,
            'total' => $currentCommission->effective_commission_percentage,
        ];

        // Deductions
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

        // Orders breakdown
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
            'delivered' => ($orderStats['delivered'] ?? 0) + ($orderStats['cod_reconciled'] ?? 0),
            'cancelled' => $orderStats['cancelled'] ?? 0,
        ];

        // Coupons summary
        $activeCouponsCount = Coupon::where('is_active', true)
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

        $couponsSummary = [
            'active_count' => $activeCouponsCount,
            'total_redeemed' => (int)$couponStats->count,
            'total_discount' => round((float)$couponStats->discount, 2),
            'list' => Coupon::where('is_active', true)->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))->limit(5)->get()->map(fn($c) => ['code' => $c->code, 'value' => (float)$c->value, 'type' => $c->type === 'percent' ? 'percentage' : 'fixed'])
        ];

        // Reviews
        $reviews = Review::where('seller_id', $sellerId);
        $totalReviewsCount = $reviews->count();
        $avgRating = $reviews->avg('rating') ?? 0;
        $positiveReviewsCount = Review::where('seller_id', $sellerId)->where('rating', '>=', 4)->count();
        $positivePercentage = $totalReviewsCount > 0 ? ($positiveReviewsCount / $totalReviewsCount) * 100 : 0;
        $pendingReply = Review::where('seller_id', $sellerId)->doesntHave('reply')->count();

        $reviewsSummary = [
            'avg_rating' => round($avgRating, 1),
            'total_count' => $totalReviewsCount,
            'positive_percentage' => round($positivePercentage, 1),
            'pending_reply' => $pendingReply,
            'latest' => Review::where('seller_id', $sellerId)->with('customer:id,name')->latest()->limit(2)->get()->map(fn($rev) => ['customer_name' => $rev->customer ? $rev->customer->name : ($rev->full_name ?? 'Anonymous'), 'rating' => $rev->rating, 'review_text' => $rev->review_text ?? $rev->description ?? '', 'date' => $rev->created_at->toDateString()])
        ];

        // Support
        $ticketStats = Ticket::where('created_by_id', $sellerId)
            ->selectRaw("
                sum(case when status not in ('resolved', 'closed') then 1 else 0 end) as open,
                sum(case when status in ('resolved', 'closed') then 1 else 0 end) as resolved
            ")
            ->first();
        $latestTicket = Ticket::where('created_by_id', $sellerId)->latest()->first();

        $supportSummary = [
            'open_count' => (int)$ticketStats->open,
            'resolved_count' => (int)$ticketStats->resolved,
            'latest' => $latestTicket ? ['ticket_number' => 'CRZ-T-' . $latestTicket->id, 'subject' => $latestTicket->subject, 'status' => $latestTicket->status] : null
        ];

        // Settings
        $profile = SellerProfile::where('user_id', $sellerId)->first();
        $brand = Brand::where('user_id', $sellerId)->first();
        $notifications = SellerNotificationSetting::where('seller_id', $sellerId)->first();

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

        return [
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
                'total' => (int)$productStats->total,
                'active' => (int)$productStats->active,
                'pending' => (int)$productStats->pending,
                'out_of_stock' => (int)$productStats->out_of_stock,
                'low_stock' => (int)$productStats->low_stock
            ],
            'revenue' => [
                'gross' => round($totalSales, 2),
                'commission' => round($totalCommission, 2),
                'gateway_fee' => round($gatewayFee, 2),
                'tcs' => round($tcs, 2),
                'tds' => round($tds, 2),
                'net' => round($availableBalance, 2),
                'pending_payout' => round((float)$payoutStats->pending, 2),
                'paid_payout' => round((float)$payoutStats->approved, 2)
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
        ];
    }

    /**
     * Helpers for date range parsing.
     */
    public function getStartDate($range)
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

    public function getPreviousStartDate($range)
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
