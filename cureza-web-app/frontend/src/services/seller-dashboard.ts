import api from '@/lib/api';

export interface DashboardSummary {
    sales: { value: number; change: number; trend: 'up' | 'down' };
    orders: { value: number; change: number; trend: 'up' | 'down' };
    avg_order_value: { value: number; change: number; trend: 'up' | 'down' };
    products: { active: number; out_of_stock: number };
    revenue: { gross: number; commission: number; net: number; pending_payout: number; paid_payout: number };
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
