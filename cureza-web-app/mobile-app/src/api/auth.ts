import apiClient from './client';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
}

export interface OtpRequest {
    email?: string;
    phone?: string;
}

export interface VerifyOtpRequest {
    email?: string;
    phone?: string;
    otp: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    password: string;
    password_confirmation: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'customer' | 'seller' | 'doctor' | 'admin' | 'super_admin';
    email_verified_at: string | null;
    created_at: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    message?: string;
}

// Backend API Response (uses access_token)
interface BackendAuthResponse {
    user: User;
    access_token?: string;
    token?: string;
    token_type?: string;
    message?: string;
    status?: string;
    action?: string;
}

// Auth API functions
export const authApi = {
    /**
     * Login with email and password
     * @throws Error if user is not a customer
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<BackendAuthResponse>('/login', data);

        // Transform backend response to app format
        const token = response.data.access_token || response.data.token || '';

        // Validate user role - only customers allowed
        if (response.data.user.role !== 'customer') {
            throw new Error('This app is for customers only. Please use the web portal for other account types.');
        }

        return {
            user: response.data.user,
            token,
            message: response.data.message,
        };
    },

    /**
     * Register new customer
     */
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<BackendAuthResponse>('/register', data);
        const token = response.data.access_token || response.data.token || '';

        return {
            user: response.data.user,
            token,
            message: response.data.message,
        };
    },

    /**
     * Send OTP for email/phone verification
     */
    sendOtp: async (data: OtpRequest): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/send-otp', data);
        return response.data;
    },

    /**
     * Verify OTP
     */
    verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<BackendAuthResponse>('/auth/verify-otp', data);
        const token = response.data.access_token || response.data.token || '';

        return {
            user: response.data.user,
            token,
            message: response.data.message,
        };
    },

    /**
     * Forgot password - request reset
     */
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password with OTP
     */
    resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
        const response = await apiClient.post('/auth/reset-password', data);
        return response.data;
    },

    /**
     * Logout - invalidate token
     */
    logout: async (): Promise<void> => {
        await apiClient.post('/logout');
    },

    /**
     * Get current user
     */
    getUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/user');
        return response.data;
    },

    /**
     * Change password
     */
    changePassword: async (current_password: string, password: string, password_confirmation: string): Promise<{ message: string }> => {
        const response = await apiClient.post('/change-password', {
            current_password,
            password,
            password_confirmation,
        });
        return response.data;
    },
};

export default authApi;
