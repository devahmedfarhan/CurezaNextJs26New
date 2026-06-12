import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../constants';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: config.API_TIMEOUT,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Request interceptor - attach auth token and session ID
apiClient.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
        try {
            // Attach auth token if exists
            const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
            if (token && requestConfig.headers) {
                requestConfig.headers.Authorization = `Bearer ${token}`;
            }

            // Attach session ID for guest cart
            const sessionId = await SecureStore.getItemAsync(config.STORAGE_KEYS.SESSION_ID);
            if (sessionId && requestConfig.headers) {
                requestConfig.headers['X-Session-ID'] = sessionId;
            }
        } catch (error) {
            console.error('Error reading secure storage:', error);
        }

        return requestConfig;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired, clear auth data
            try {
                await SecureStore.deleteItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
                await SecureStore.deleteItemAsync(config.STORAGE_KEYS.USER_DATA);
                // Navigation to login will be handled by auth store
            } catch (e) {
                console.error('Error clearing auth data:', e);
            }
        }

        return Promise.reject(error);
    }
);

// API error type
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status: number;
}

// Helper to extract error message
export const getApiErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as any;
        return data?.message || data?.error || 'An unexpected error occurred';
    }
    return 'An unexpected error occurred';
};

export default apiClient;
