import 'react-native-get-random-values'; // Must be imported BEFORE uuid
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { cartApi, CartItem, CartSummary, AddToCartRequest } from '../api';
import { config } from '../constants';

interface CartState {
    // State
    items: CartItem[];
    summary: CartSummary | null;
    isLoading: boolean;
    sessionId: string | null;

    // Actions
    initialize: () => Promise<void>;
    fetchCart: () => Promise<void>;
    addToCart: (data: AddToCartRequest) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => Promise<void>;

    // Computed
    totalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    // Initial state
    items: [],
    summary: null,
    isLoading: false,
    sessionId: null,


    // Initialize session for guest cart
    initialize: async () => {
        try {
            let sessionId = await SecureStore.getItemAsync(config.STORAGE_KEYS.SESSION_ID);

            if (!sessionId) {
                sessionId = uuidv4();
                await SecureStore.setItemAsync(config.STORAGE_KEYS.SESSION_ID, sessionId);
            }

            set({ sessionId });

            // Fetch cart in background - don't block initialization
            // This allows the app to start even if the API is slow or unavailable
            get().fetchCart().catch(error => {
                console.error('Background cart fetch failed:', error);
                // Silently fail - user can retry later
            });
        } catch (error) {
            console.error('Cart initialization error:', error);
            // Even if session ID creation fails, don't block the app
        }
    },

    // Fetch cart from API
    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const response = await cartApi.getCart();

            // Transform API response to cart items
            const items: CartItem[] = (response.data?.items || [])
                .filter((item: any) => item && item.product)
                .map((item: any) => ({
                    id: item.id,
                    product_id: item.product.id,
                    title: item.product.title,
                    brand: item.product.brand?.name || item.product.seller?.name || 'Cureza',
                    price: parseFloat(item.price),
                    image: item.product.image,
                    quantity: item.quantity,
                    patient_name: item.patient_name,
                    patient_age: item.patient_age,
                    patient_gender: item.patient_gender,
                    health_concern: item.health_concern,
                }));

            set({
                items,
                summary: response.summary,
                isLoading: false,
            });
        } catch (error) {
            console.error('Fetch cart error:', error);
            set({ items: [], summary: null, isLoading: false });
        }
    },

    // Add item to cart
    addToCart: async (data) => {
        set({ isLoading: true });
        try {
            await cartApi.addToCart(data);
            await get().fetchCart();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Update quantity
    updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
            return get().removeItem(itemId);
        }

        set({ isLoading: true });
        try {
            await cartApi.updateCartItem(itemId, quantity);
            await get().fetchCart();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Remove item
    removeItem: async (itemId) => {
        set({ isLoading: true });
        try {
            await cartApi.removeCartItem(itemId);
            await get().fetchCart();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Clear cart
    clearCart: async () => {
        set({ isLoading: true });
        try {
            await cartApi.clearCart();
            set({ items: [], summary: null, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Apply coupon
    applyCoupon: async (code) => {
        set({ isLoading: true });
        try {
            const response = await cartApi.applyCoupon(code);
            set({ summary: response.summary, isLoading: false });
            return { success: true, message: response.message };
        } catch (error: any) {
            set({ isLoading: false });
            const message = error.response?.data?.message || 'Invalid coupon';
            return { success: false, message };
        }
    },

    // Remove coupon
    removeCoupon: async () => {
        set({ isLoading: true });
        try {
            await cartApi.removeCoupon();
            await get().fetchCart();
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // Computed: total items count
    totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
    },
}));

export default useCartStore;
