import apiClient from './client';

export interface CartItem {
    id: number;
    product_id: number;
    title: string;
    brand: string;
    price: number;
    image: string;
    quantity: number;
    patient_name?: string;
    patient_age?: number;
    patient_gender?: string;
    health_concern?: string;
}

export interface CartSummary {
    subtotal: number;
    discount: number;
    coupon_applied: string | null;
    coupon_message: string | null;
    taxable_amount: number;
    cgst: number;
    sgst: number;
    igst: number;
    total_tax: number;
    shipping_cost: number;
    final_total: number;
}

export interface CartResponse {
    data: {
        items: Array<{
            id: number;
            product: {
                id: number;
                title: string;
                image: string;
                brand?: { name: string };
                seller?: { name: string };
            };
            price: string;
            quantity: number;
            patient_name?: string;
            patient_age?: number;
            patient_gender?: string;
            health_concern?: string;
        }>;
    };
    summary: CartSummary;
}

export interface AddToCartRequest {
    product_id: number;
    quantity: number;
    patient_name?: string;
    patient_age?: number;
    patient_gender?: string;
    health_concern?: string;
    prescription_path?: string;
}

// Cart API functions
export const cartApi = {
    /**
     * Get current cart
     */
    getCart: async (): Promise<CartResponse> => {
        const response = await apiClient.get('/cart');
        return response.data;
    },

    /**
     * Add item to cart
     */
    addToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
        const response = await apiClient.post('/cart/add', data);
        return response.data;
    },

    /**
     * Update cart item quantity
     */
    updateCartItem: async (itemId: number, quantity: number): Promise<CartResponse> => {
        const response = await apiClient.put(`/cart/items/${itemId}`, { quantity });
        return response.data;
    },

    /**
     * Remove item from cart
     */
    removeCartItem: async (itemId: number): Promise<void> => {
        await apiClient.delete(`/cart/items/${itemId}`);
    },

    /**
     * Clear entire cart
     */
    clearCart: async (): Promise<void> => {
        await apiClient.delete('/cart/clear');
    },

    /**
     * Apply coupon code
     */
    applyCoupon: async (code: string): Promise<{ summary: CartSummary; message: string }> => {
        const response = await apiClient.post('/cart/coupon', { code });
        return response.data;
    },

    /**
     * Remove applied coupon
     */
    removeCoupon: async (): Promise<void> => {
        await apiClient.delete('/cart/coupon');
    },

    /**
     * Get upsell products for cart
     */
    getUpsells: async (): Promise<any[]> => {
        const response = await apiClient.get('/cart/upsells');
        return response.data.data || response.data;
    },
};

export default cartApi;
