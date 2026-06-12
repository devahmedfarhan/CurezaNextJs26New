export interface DashboardStats {
    total_sellers: number;
    active_sellers: number;
    pending_approvals: number;
    total_doctors: number;
    active_doctors: number;
    total_users: number;
    total_revenue: number;
    today_orders: number;
    today_revenue: number;
    total_orders?: number;
}

export interface RecentActivity {
    id: number;
    user_id?: number;
    action: string;
    description: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

export interface RecentOrder {
    id: number;
    order_number: string;
    final_amount: string;
    status: string;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

export interface DashboardData {
    stats: DashboardStats;
    recent_activities: RecentActivity[];
    recent_orders: RecentOrder[];
}

export interface RevenueData {
    month?: string;
    date?: string;
    revenue: string;
    commission: string;
}

export interface UserGrowthData {
    date: string;
    total: number;
}

export interface TopSeller {
    id: number;
    name: string;
    revenue: string;
}

export interface TopPerformanceData {
    top_sellers: TopSeller[];
}

export interface SystemHealthData {
    total_products: number;
    total_appointments: number;
    total_orders: number;
}

export interface Payout {
    id: number;
    amount: string;
    status: string;
    created_at: string;
    user?: {
        name: string;
    };
}
