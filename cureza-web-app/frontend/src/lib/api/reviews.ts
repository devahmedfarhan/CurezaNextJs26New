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

// Customer review functions
export const createProductReview = async (data: FormData) => {
    return api.post('/customer/reviews/product', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createSellerReview = async (data: {
    seller_id: number;
    order_id: number;
    rating: number;
    review_text?: string;
}) => {
    return api.post('/customer/reviews/seller', data);
};

export const getMyReviews = async (type?: string) => {
    return api.get('/customer/reviews', { params: { type } });
};

export const checkProductEligibility = async (productId: number) => {
    return api.get(`/customer/products/${productId}/eligibility`);
};

// Seller review functions
export const getSellerReviews = async (params: {
    type?: string;
    rating?: number;
    has_reply?: boolean;
    product_id?: number;
    page?: number;
    per_page?: number;
}) => {
    return api.get('/seller/reviews', { params });
};

export const getSellerReviewDetail = async (id: number) => {
    return api.get(`/seller/reviews/${id}`);
};

export const replyToReview = async (reviewId: number, replyText: string) => {
    return api.post(`/seller/reviews/${reviewId}/reply`, { reply_text: replyText });
};

export const getSellerReviewsStatistics = async () => {
    return api.get('/seller/reviews/statistics');
};

export const getPendingReplies = async () => {
    return api.get('/seller/reviews/pending');
};

// Public review functions
export const getProductReviews = async (productId: number, params?: {
    rating?: number;
    sort?: string;
    page?: number;
    per_page?: number;
}) => {
    return api.get(`/public/products/${productId}/reviews`, { params });
};

export const getProductRating = async (productId: number) => {
    return api.get(`/public/products/${productId}/rating`);
};

export const getSellerPublicReviews = async (sellerId: number, params?: {
    type?: string;
    rating?: number;
    page?: number;
    per_page?: number;
}) => {
    return api.get(`/public/sellers/${sellerId}/reviews`, { params });
};

export const getSellerRating = async (sellerId: number) => {
    return api.get(`/public/sellers/${sellerId}/rating`);
};

// Admin review functions
export const getAllReviews = async (params?: {
    status?: string;
    type?: string;
    seller_id?: number;
    product_id?: number;
    rating?: number;
    search?: string;
    page?: number;
    per_page?: number;
}) => {
    return api.get('/admin/reviews', { params });
};

export const getReviewDetail = async (id: number) => {
    return api.get(`/admin/reviews/${id}`);
};

export const createManualReview = async (data: {
    customer_id: number;
    seller_id?: number;
    product_id?: number;
    order_id: number;
    review_type: 'product' | 'seller';
    rating: number;
    review_text?: string;
}) => {
    return api.post('/admin/reviews', data);
};

export const updateReview = async (id: number, data: {
    rating?: number;
    review_text?: string;
}) => {
    return api.put(`/admin/reviews/${id}`, data);
};

export const deleteReview = async (id: number) => {
    return api.delete(`/admin/reviews/${id}`);
};

export const updateReviewStatus = async (id: number, status: 'active' | 'hidden' | 'deleted') => {
    return api.patch(`/admin/reviews/${id}/status`, { status });
};

export const getReviewStatistics = async () => {
    return api.get('/admin/reviews/statistics');
};

export default api;
