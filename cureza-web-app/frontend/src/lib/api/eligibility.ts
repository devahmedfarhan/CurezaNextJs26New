import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Check if customer can review a product
export const canReviewProduct = async (productId: number) => {
    try {
        const response = await api.get(`/customer/can-review/product/${productId}`);
        return response.data;
    } catch (error) {
        return { can_review: false, order_id: null };
    }
};

// Check if customer can review a seller
export const canReviewSeller = async (sellerId: number) => {
    try {
        const response = await api.get(`/customer/can-review/seller/${sellerId}`);
        return response.data;
    } catch (error) {
        return { can_review: false, order_id: null };
    }
};

export default api;
