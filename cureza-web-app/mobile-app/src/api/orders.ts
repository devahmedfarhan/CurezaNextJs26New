import apiClient from './client';

export interface Address {
    id: number;
    name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    is_default: boolean;
}

export interface OrderItem {
    id: number;
    product_id: number;
    title: string;
    image: string;
    price: number;
    quantity: number;
    subtotal: number;
    brand?: string;
}

export interface Order {
    id: number;
    order_number: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    payment_method: string;
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total: number;
    shipping_address: Address;
    billing_address?: Address;
    items: OrderItem[];
    tracking_number?: string;
    tracking_url?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface OrdersResponse {
    data: Order[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface CheckoutData {
    shipping_address_id: number;
    billing_address_id?: number;
    payment_method: string;
    notes?: string;
    coupon_code?: string;
}

export interface CheckoutCalculation {
    subtotal: number;
    discount: number;
    tax: number;
    shipping_cost: number;
    total: number;
    shipping_methods: Array<{
        id: string;
        name: string;
        cost: number;
        estimated_days: string;
    }>;
}

// Orders API functions
export const ordersApi = {
    /**
     * Get user's orders
     */
    getOrders: async (page = 1): Promise<OrdersResponse> => {
        const response = await apiClient.get('/orders', { params: { page } });
        return response.data;
    },

    /**
     * Get single order details
     */
    getOrder: async (id: number): Promise<Order> => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data.data || response.data;
    },

    /**
     * Track order
     */
    trackOrder: async (id: number): Promise<any> => {
        const response = await apiClient.get(`/orders/${id}/track`);
        return response.data;
    },

    /**
     * Download invoice (returns blob URL)
     */
    getInvoiceUrl: (id: number): string => {
        return `${apiClient.defaults.baseURL}/orders/${id}/invoice`;
    },
};

// Checkout API functions
export const checkoutApi = {
    /**
     * Initiate checkout - get preliminary data
     */
    initiate: async (): Promise<any> => {
        const response = await apiClient.get('/checkout/initiate');
        return response.data;
    },

    /**
     * Calculate checkout totals
     */
    calculate: async (data: Partial<CheckoutData>): Promise<CheckoutCalculation> => {
        const response = await apiClient.post('/checkout/calculate', data);
        return response.data;
    },

    /**
     * Place order
     */
    placeOrder: async (data: CheckoutData): Promise<Order> => {
        const response = await apiClient.post('/orders', data);
        return response.data.data || response.data;
    },
};

// Address API functions
export const addressApi = {
    /**
     * Get user's addresses
     */
    getAddresses: async (): Promise<Address[]> => {
        const response = await apiClient.get('/addresses');
        return response.data.data || response.data;
    },

    /**
     * Create new address
     */
    createAddress: async (data: Omit<Address, 'id'>): Promise<Address> => {
        const response = await apiClient.post('/addresses', data);
        return response.data.data || response.data;
    },

    /**
     * Update address
     */
    updateAddress: async (id: number, data: Partial<Address>): Promise<Address> => {
        const response = await apiClient.put(`/addresses/${id}`, data);
        return response.data.data || response.data;
    },

    /**
     * Delete address
     */
    deleteAddress: async (id: number): Promise<void> => {
        await apiClient.delete(`/addresses/${id}`);
    },
};

export default ordersApi;
