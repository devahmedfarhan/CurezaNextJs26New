'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/lib/api'; // Import configured axios instance
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';

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
    product_slug: string;
    category_slug: string;
    title: string;
    brand: string;
    price: number;
    image: string;
    quantity: number;
    is_gift?: boolean;
    patientDetails?: PatientDetails;
}

export interface CartSummary {
    subtotal: number;
    discount: number;
    milestone_discount?: number;
    milestone_free_shipping?: boolean;
    coupon_applied: string | null;
    coupon_message: string | null;
    taxable_amount: number;
    cgst: number;
    sgst: number;
    igst: number;
    total_tax: number;
    shipping_cost: number;
    platform_fee: number;
    wallet_deduction: number;
    projected_cashback: number;
    wallet_balance: number;
    rewards: {
        current_milestone_id: number | null;
        next_milestone_name: string | null;
        amount_to_next_milestone: number;
        progress_percentage: number;
        active_slabs: Array<{
            id: number;
            name: string;
            threshold: number;
            unlocked: boolean;
            icon: string | null;
            free_shipping?: boolean;
            discount_amount?: number | null;
            gift_product?: {
                id: number;
                title: string;
                price: number;
                sku: string;
            } | null;
        }>;
    } | null;
    final_total: number;
}

interface CartContextType {
    items: CartItem[];
    summary: CartSummary | null;
    addToCart: (product: any, quantity: number, patientDetails?: PatientDetails, openDrawer?: boolean) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    totalItems: number;
    isLoading: boolean;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => Promise<void>;
    toggleCoins: () => Promise<void>;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getOptimisticSummary = (newItems: CartItem[], currentSummary: CartSummary | null): CartSummary | null => {
    if (newItems.length === 0) return null;

    const newSubtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!currentSummary) {
        const shipping = newSubtotal >= 500 ? 0 : 40;
        return {
            subtotal: newSubtotal,
            discount: 0,
            taxable_amount: newSubtotal,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total_tax: 0,
            shipping_cost: shipping,
            platform_fee: 0,
            wallet_deduction: 0,
            projected_cashback: 0,
            wallet_balance: 0,
            rewards: null,
            final_total: newSubtotal + shipping
        };
    }

    const diff = newSubtotal - currentSummary.subtotal;
    
    let newShipping = currentSummary.shipping_cost;
    if (currentSummary.shipping_cost > 0 && newSubtotal >= 500) {
        newShipping = 0;
    } else if (currentSummary.shipping_cost === 0 && newSubtotal < 500) {
        newShipping = 40;
    }
    
    const shippingDiff = newShipping - currentSummary.shipping_cost;

    return {
        ...currentSummary,
        subtotal: newSubtotal,
        shipping_cost: newShipping,
        final_total: Math.max(0, currentSummary.final_total + diff + shippingDiff)
    };
};

export function CartProvider({ children }: { children: ReactNode }) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [summary, setSummary] = useState<CartSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        let sid = localStorage.getItem('session_id');
        if (!sid) {
            sid = uuidv4();
            localStorage.setItem('session_id', sid);
        }
        setSessionId(sid);

        // Load cart items & summary from localStorage on mount
        const savedItems = localStorage.getItem('cart_items');
        if (savedItems) {
            try {
                setItems(JSON.parse(savedItems));
            } catch (e) {}
        }
        const savedSummary = localStorage.getItem('cart_summary');
        if (savedSummary) {
            try {
                setSummary(JSON.parse(savedSummary));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (items.length > 0) {
            localStorage.setItem('cart_items', JSON.stringify(items));
        } else {
            localStorage.removeItem('cart_items');
        }
    }, [items]);

    useEffect(() => {
        if (summary) {
            localStorage.setItem('cart_summary', JSON.stringify(summary));
        } else {
            localStorage.removeItem('cart_summary');
        }
    }, [summary]);

    useEffect(() => {
        if (!isAuthLoading && sessionId) {
            fetchCart(sessionId);
        }
    }, [user, isAuthLoading, sessionId]);

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
                    product_slug: item.product.slug,
                    category_slug: item.product.category ? item.product.category.slug : 'general',
                    title: item.product.title,
                    brand: item.product.brand ? item.product.brand.name : (item.product.seller ? item.product.seller.name : 'Cureza'),
                    price: parseFloat(item.price), // Snapshot price
                    image: item.product.image,
                    quantity: item.quantity,
                    is_gift: !!item.is_gift,
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

    const addToCart = async (product: any, quantity: number, patientDetails?: PatientDetails, openDrawer: boolean = true) => {
        if (openDrawer) {
            setIsCartOpen(true);
        }

        const backupItems = [...items];
        const backupSummary = summary;

        // Construct optimistic item
        const tempItem: CartItem = {
            id: -Math.floor(Math.random() * 1000000), // Temporary ID
            product_id: product.id,
            product_slug: product.slug || '',
            category_slug: (product.category && typeof product.category === 'object') ? product.category.slug : (product.category || 'general'),
            title: product.title,
            brand: (product.brand && typeof product.brand === 'object') ? product.brand.name : (product.brand || 'Cureza'),
            price: parseFloat(product.price) || 0,
            image: product.image || '',
            quantity: quantity,
            patientDetails: patientDetails
        };

        // Optimistically update items state and summary
        setItems(prev => {
            const existingIndex = prev.findIndex(item => 
                item.product_id === product.id && 
                (!product.variant_id || (item as any).variant_id === product.variant_id)
            );
            let updated;
            if (existingIndex > -1) {
                updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity
                };
            } else {
                updated = [...prev, tempItem];
            }
            setSummary(curr => getOptimisticSummary(updated, curr));
            return updated;
        });

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
            setItems(backupItems);
            setSummary(backupSummary);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (itemId: number) => {
        if (itemId < 0) return; // Ignore temporary optimistic items

        const backupItems = [...items];
        const backupSummary = summary;

        // Optimistically remove
        setItems(prev => {
            const updated = prev.filter(item => item.id !== itemId);
            setSummary(curr => getOptimisticSummary(updated, curr));
            return updated;
        });

        try {
            await axios.delete(`/cart/items/${itemId}`, {
                headers: { 'X-Session-ID': sessionId }
            });
            await fetchCart(sessionId);
        } catch (error) {
            console.error('Failed to remove from cart:', error);
            setItems(backupItems);
            setSummary(backupSummary);
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        if (itemId < 0) return; // Ignore temporary optimistic items

        if (quantity <= 0) {
            return removeFromCart(itemId);
        }

        const backupItems = [...items];
        const backupSummary = summary;

        // Optimistically update quantity
        setItems(prev => {
            const updated = prev.map(item => 
                item.id === itemId ? { ...item, quantity } : item
            );
            setSummary(curr => getOptimisticSummary(updated, curr));
            return updated;
        });

        try {
            await axios.put(`/cart/items/${itemId}`, { quantity }, {
                headers: { 'X-Session-ID': sessionId }
            });
            await fetchCart(sessionId);
        } catch (error) {
            console.error('Failed to update quantity:', error);
            setItems(backupItems);
            setSummary(backupSummary);
        }
    };

    const clearCart = async () => {
        const backupItems = [...items];
        const backupSummary = summary;

        setItems([]);
        setSummary(null);

        try {
            await axios.delete('/cart/clear', {
                headers: { 'X-Session-ID': sessionId }
            });
        } catch (error) {
            console.error('Failed to clear cart:', error);
            setItems(backupItems);
            setSummary(backupSummary);
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

    const toggleCoins = async () => {
        try {
            await axios.post('/cart/coins/redeem', {}, {
                headers: { 'X-Session-ID': sessionId }
            });
            await fetchCart(sessionId);
        } catch (error) {
            console.error('Failed to toggle coins:', error);
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
                removeCoupon,
                toggleCoins,
                isCartOpen,
                setIsCartOpen
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
