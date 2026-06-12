import apiClient from './client';

export interface WalletData {
    balance: number;
    transactions: Array<{
        id: number;
        type: 'credit' | 'debit';
        amount: number;
        description: string;
        created_at: string;
    }>;
}

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    read_at: string | null;
    created_at: string;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar?: string;
}

export interface UserDashboard {
    orders_count: number;
    pending_orders: number;
    wallet_balance: number;
    rewards_points: number;
    recent_orders: any[];
    recently_viewed: any[];
}

// User API functions
export const userApi = {
    /**
     * Get user dashboard overview
     */
    getDashboard: async (): Promise<UserDashboard> => {
        const response = await apiClient.get('/user/dashboard');
        return response.data;
    },

    /**
     * Update profile
     */
    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await apiClient.post('/user/profile', data);
        return response.data;
    },

    /**
     * Get wallet info
     */
    getWallet: async (): Promise<WalletData> => {
        const response = await apiClient.get('/user/wallet');
        return response.data;
    },

    /**
     * Get user's reviews
     */
    getReviews: async (): Promise<any[]> => {
        const response = await apiClient.get('/user/reviews');
        return response.data.data || response.data;
    },

    /**
     * Get prescriptions
     */
    getPrescriptions: async (): Promise<any[]> => {
        const response = await apiClient.get('/user/prescriptions');
        return response.data.data || response.data;
    },

    /**
     * Get referrals
     */
    getReferrals: async (): Promise<any> => {
        const response = await apiClient.get('/user/referrals');
        return response.data;
    },

    /**
     * Get community info
     */
    getCommunity: async (): Promise<any> => {
        const response = await apiClient.get('/user/community');
        return response.data;
    },

    /**
     * Get challenges
     */
    getChallenges: async (): Promise<any[]> => {
        const response = await apiClient.get('/user/challenges');
        return response.data.data || response.data;
    },

    /**
     * Join a challenge
     */
    joinChallenge: async (challengeId: number): Promise<any> => {
        const response = await apiClient.post(`/user/challenges/${challengeId}/join`);
        return response.data;
    },
};

// Notifications API functions
export const notificationsApi = {
    /**
     * Get notifications
     */
    getNotifications: async (): Promise<Notification[]> => {
        const response = await apiClient.get('/notifications');
        return response.data.data || response.data;
    },

    /**
     * Get unread count
     */
    getUnreadCount: async (): Promise<number> => {
        const response = await apiClient.get('/notifications/unread-count');
        return response.data.count || 0;
    },

    /**
     * Mark notifications as read
     */
    markAsRead: async (ids?: string[]): Promise<void> => {
        await apiClient.post('/notifications/read', { ids });
    },
};

// Wishlist API functions
export const wishlistApi = {
    /**
     * Get wishlist
     */
    getWishlist: async (): Promise<any[]> => {
        const response = await apiClient.get('/wishlist');
        return response.data.data || response.data;
    },

    /**
     * Toggle product in wishlist
     */
    toggle: async (productId: number): Promise<{ in_wishlist: boolean }> => {
        const response = await apiClient.post('/wishlist/toggle', { product_id: productId });
        return response.data;
    },
};

export default userApi;
