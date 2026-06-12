import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, User } from '../api';
import { config } from '../constants';

interface AuthState {
    // State
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isInitialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, phone: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    sendOtp: (email?: string, phone?: string) => Promise<void>;
    verifyOtp: (otp: string, email?: string, phone?: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, otp: string, password: string) => Promise<void>;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // Initial state
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isInitialized: false,

    // Initialize auth from storage
    initialize: async () => {
        try {
            const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
            const userJson = await SecureStore.getItemAsync(config.STORAGE_KEYS.USER_DATA);

            if (token && userJson) {
                const user = JSON.parse(userJson);

                // Verify user is a customer
                if (user.role === 'customer') {
                    set({ token, user, isAuthenticated: true, isInitialized: true });
                    return;
                }
            }

            set({ isInitialized: true });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ isInitialized: true });
        }
    },

    // Login
    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await authApi.login({ email, password });

            // Save to secure storage
            await SecureStore.setItemAsync(config.STORAGE_KEYS.AUTH_TOKEN, response.token);
            await SecureStore.setItemAsync(config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Register
    register: async (name, email, phone, password) => {
        set({ isLoading: true });
        try {
            const response = await authApi.register({
                name,
                email,
                phone,
                password,
                password_confirmation: password,
            });

            // Save to secure storage
            await SecureStore.setItemAsync(config.STORAGE_KEYS.AUTH_TOKEN, response.token);
            await SecureStore.setItemAsync(config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Logout
    logout: async () => {
        set({ isLoading: true });
        try {
            // Call API to invalidate token
            await authApi.logout();
        } catch (error) {
            // Ignore API errors, still clear local data
            console.error('Logout API error:', error);
        } finally {
            // Clear storage
            await SecureStore.deleteItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
            await SecureStore.deleteItemAsync(config.STORAGE_KEYS.USER_DATA);

            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    // Send OTP
    sendOtp: async (email, phone) => {
        set({ isLoading: true });
        try {
            await authApi.sendOtp({ email, phone });
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Verify OTP
    verifyOtp: async (otp, email, phone) => {
        set({ isLoading: true });
        try {
            const response = await authApi.verifyOtp({ otp, email, phone });

            // Save to secure storage
            await SecureStore.setItemAsync(config.STORAGE_KEYS.AUTH_TOKEN, response.token);
            await SecureStore.setItemAsync(config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Forgot Password
    forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
            await authApi.forgotPassword(email);
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Reset Password
    resetPassword: async (email, otp, password) => {
        set({ isLoading: true });
        try {
            await authApi.resetPassword({
                email,
                otp,
                password,
                password_confirmation: password,
            });
            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Update user data
    updateUser: (user) => {
        set({ user });
        SecureStore.setItemAsync(config.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    },
}));

export default useAuthStore;
