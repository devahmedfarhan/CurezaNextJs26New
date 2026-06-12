import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
    id: number;
    title: string;
    image: string;
    price: number;
    slug: string;
    category: any;
}

interface CompareState {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    clearCompare: () => void;
    isInCompare: (productId: number) => boolean;
}

export const useCompareStore = create<CompareState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const currentItems = get().items;
                if (currentItems.length >= 4) {
                    alert("You can compare up to 4 products only.");
                    return;
                }
                if (!currentItems.find(p => p.id === product.id)) {
                    set({ items: [...currentItems, product] });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter(p => p.id !== productId) });
            },
            clearCompare: () => {
                set({ items: [] });
            },
            isInCompare: (productId) => {
                return !!get().items.find(p => p.id === productId);
            },
        }),
        {
            name: 'cureza-compare-storage',
        }
    )
);
