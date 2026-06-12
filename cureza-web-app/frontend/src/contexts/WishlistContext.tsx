'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
    items: number[];
    addToWishlist: (productId: number) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    toggleWishlist: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<number[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const { user } = useAuth();

    // Load wishlist from API if user is logged in
    useEffect(() => {
        if (user) {
            api.get('/wishlist')
                .then(res => {
                    // API returns full objects, we just want IDs for simple check
                    // Assuming endpoint returns [{product_id: 1, ...}, ...] based on my controller
                    // Wait, Controller returns: $request->user()->wishlist()->with('product...')->get();
                    // So it returns Wishlist models.
                    const ids = res.data.map((item: any) => item.product_id);
                    setItems(ids);
                })
                .catch(err => console.error(err));
        } else {
            // Fallback to local storage for guests
            const savedWishlist = localStorage.getItem('cureza_wishlist');
            if (savedWishlist) {
                try {
                    setItems(JSON.parse(savedWishlist));
                } catch (error) {
                    console.error('Failed to load wishlist from localStorage:', error);
                }
            }
        }
        setIsInitialized(true);
    }, [user]);

    // Save wishlist to localStorage only for guests
    useEffect(() => {
        if (isInitialized && !user) {
            localStorage.setItem('cureza_wishlist', JSON.stringify(items));
        }
    }, [items, isInitialized, user]);

    const addToWishlist = async (productId: number) => {
        if (user) {
            try {
                await api.post('/wishlist/toggle', { product_id: productId });
                setItems(prev => [...prev, productId]);
            } catch (error) {
                console.error("Failed to add to wishlist", error);
            }
        } else {
            setItems((prevItems) => {
                if (!prevItems.includes(productId)) {
                    return [...prevItems, productId];
                }
                return prevItems;
            });
        }
    };

    const removeFromWishlist = async (productId: number) => {
        if (user) {
            try {
                await api.post('/wishlist/toggle', { product_id: productId });
                setItems(prev => prev.filter(id => id !== productId));
            } catch (error) {
                console.error("Failed to remove from wishlist", error);
            }
        } else {
            setItems((prevItems) => prevItems.filter((id) => id !== productId));
        }
    };

    const isInWishlist = (productId: number) => {
        return items.includes(productId);
    };

    const toggleWishlist = (productId: number) => {
        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(productId);
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                toggleWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
