'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/lib/api'; // Import configured axios instance
import { v4 as uuidv4 } from 'uuid';

export interface PatientDetails {
    patient_name: string;
    patient_age: number;
    patient_gender: string;
    health_concern: string;
    prescription_path?: string;
    doctor_id?: number;
}

export interface CartItem {
    id: number;
    product_id: number;
    title: string;
    brand: string;
    price: number;
    image: string;
    quantity: number;
    patientDetails?: PatientDetails;
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

interface CartContextType {
    items: CartItem[];
    summary: CartSummary | null;
    addToCart: (product: any, quantity: number, patientDetails?: PatientDetails) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    totalItems: number;
    isLoading: boolean;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [summary, setSummary] = useState<CartSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        let sid = localStorage.getItem('session_id');
        if (!sid) {
            sid = uuidv4();
            localStorage.setItem('session_id', sid);
        }
        setSessionId(sid);
        fetchCart(sid);
    }, []);

    const fetchCart = async (sid: string) => {
        setIsLoading(true);
        try {
            const response = await axios.get('/cart', {
                headers: { 'X-Session-ID': sid }
            });
            console.log('Cart Response Data:', response.data);
            const rawItems = response.data.data.items;
            console.log('Raw Cart Items:', rawItems);

            // Transform backend response to CartItem format
            const cartItems = response.data.data.items
                .filter((item: any) => item && item.product) // Filter out invalid items
                .map((item: any) => ({
                    id: item.id, // Cart Item ID
                    product_id: item.product.id,
                    title: item.product.title,
                    brand: item.product.brand ? item.product.brand.name : (item.product.seller ? item.product.seller.name : 'Cureza'),
                    price: parseFloat(item.price), // Snapshot price
                    image: item.product.image,
                    quantity: item.quantity,
                    patientDetails: item.patient_name ? {
                        patient_name: item.patient_name,
                        patient_age: item.patient_age,
                        patient_gender: item.patient_gender,
                        health_concern: item.health_concern,
                        prescription_path: item.prescription_path,
                        doctor_id: item.doctor_id
                    } : undefined
                }));
            setItems(cartItems);
            setSummary(response.data.summary);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setItems([]);
            setSummary(null);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async (product: any, quantity: number, patientDetails?: PatientDetails) => {
        setIsLoading(true);
        try {
            const payload: any = {
                product_id: product.id,
                quantity: quantity,
            };

            if (patientDetails) {
                payload.patient_name = patientDetails.patient_name;
                payload.patient_age = patientDetails.patient_age;
                payload.patient_gender = patientDetails.patient_gender;
                payload.health_concern = patientDetails.health_concern;
                payload.prescription_path = patientDetails.prescription_path;
                payload.doctor_id = patientDetails.doctor_id;
            }

            await axios.post('/cart/add', payload, {
                headers: { 'X-Session-ID': sessionId }
            });
            await fetchCart(sessionId);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (itemId: number) => {
        try {
            await axios.delete(`/cart/items/${itemId}`, {
                headers: { 'X-Session-ID': sessionId }
            });
            await fetchCart(sessionId);
        } catch (error) {
            console.error('Failed to remove from cart:', error);
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            return removeFromCart(itemId);
        }
        try {
            await axios.put(`/cart/items/${itemId}`, { quantity }, {
                headers: { 'X-Session-ID': sessionId }
            });
            await fetchCart(sessionId);
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const clearCart = async () => {
        try {
            await axios.delete('/cart/clear', {
                headers: { 'X-Session-ID': sessionId }
            });
            setItems([]);
            setSummary(null);
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const applyCoupon = async (code: string) => {
        try {
            const response = await axios.post('/cart/coupon', { code }, {
                headers: { 'X-Session-ID': sessionId }
            });
            setSummary(response.data.summary);
            return { success: true, message: response.data.message };
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Invalid coupon';
            // If invalid, we probably should refetch cart to be sure of state?
            // Or assuming nothing changed.
            return { success: false, message: msg };
        }
    };

    const removeCoupon = async () => {
        try {
            await axios.delete('/cart/coupon', {
                headers: { 'X-Session-ID': sessionId }
            });
            await fetchCart(sessionId);
        } catch (error) {
            console.error('Failed to remove coupon:', error);
        }
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                summary,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                isLoading,
                applyCoupon,
                removeCoupon
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
