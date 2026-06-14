import api from '@/lib/api';

export interface DashboardSummary {
    sales: { value: number; change: number; trend: 'up' | 'down' };
    orders: { value: number; change: number; trend: 'up' | 'down' };
    avg_order_value: { value: number; change: number; trend: 'up' | 'down' };
    products: { 
        total: number;
        active: number; 
        pending: number;
        out_of_stock: number;
        low_stock: number;
    };
    revenue: { 
        gross: number; 
        commission: number; 
        gateway_fee?: number;
        tcs?: number;
        tds?: number;
        net: number; 
        pending_payout: number; 
        paid_payout: number; 
    };
    orders_breakdown?: {
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    coupons_summary?: {
        active_count: number;
        total_redeemed: number;
        total_discount: number;
        list: Array<{ code: string; value: number; type: string }>;
    };
    reviews_summary?: {
        avg_rating: number;
        total_count: number;
        positive_percentage: number;
        pending_reply: number;
        latest: Array<{ customer_name: string; rating: number; review_text: string; date: string }>;
    };
    support_summary?: {
        open_count: number;
        resolved_count: number;
        latest: { ticket_number: string; subject: string; status: string } | null;
    };
    settings_summary?: {
        brand_name: string;
        brand_slug: string;
        brand_desc: string;
        bank_name: string;
        bank_account: string;
        gst_number: string;
        notifications_enabled: boolean;
        two_factor_enabled: boolean;
    };
}

export interface SalesDataPoint {
    date: string;
    total_sales: number;
}

export interface OrderStatusData {
    [key: string]: number;
}

export interface TopProduct {
    product_id: number;
    product_name: string;
    units_sold: number;
    revenue: number;
    stock_left: number;
    image: string | null;
}

export interface RecentOrder {
    id: number;
    order_number: string;
    product_name: string;
    customer: string;
    date: string;
    amount: number;
    status: string;
}

export const SellerDashboardService = {
    getSummary: async (range: string = '30_days') => {
        const response = await api.get<DashboardSummary>('/seller/dashboard/summary', { params: { range } });
        return response.data;
    },

    getSalesGraph: async (range: string = '30_days', groupBy: string = 'day') => {
        const response = await api.get<SalesDataPoint[]>('/seller/dashboard/sales-graph', { params: { range, group_by: groupBy } });
        return response.data;
    },

    getOrderStatus: async () => {
        const response = await api.get<OrderStatusData>('/seller/dashboard/order-status');
        return response.data;
    },

    getTopProducts: async (range: string = '30_days') => {
        const response = await api.get<TopProduct[]>('/seller/dashboard/top-products', { params: { range } });
        return response.data;
    },

    getRecentOrders: async () => {
        const response = await api.get<RecentOrder[]>('/seller/dashboard/recent-orders');
        return response.data;
    },

    exportReport: async (type: 'orders' | 'sales' | 'products' | 'shipments') => {
        const response = await api.get('/seller/dashboard/export', {
            params: { type },
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}-report.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
