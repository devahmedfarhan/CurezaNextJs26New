'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface Category {
    id: number;
    name: string;
    slug: string;
    type: 'category' | 'concern';
    image?: string;
    description?: string;
    is_active: boolean;
}

interface CategoryContextType {
    categories: Category[];
    concerns: Category[];
    refreshCategories: () => Promise<void>;
    isLoading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [concerns, setConcerns] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = async () => {
        console.log('CategoryContext: Fetching categories...');
        try {
            const response = await api.get('/categories');
            console.log('CategoryContext: Fetched successfully', response.data);
            const all = response.data;
            setCategories(all.filter((c: Category) => c.type === 'category'));
            setConcerns(all.filter((c: Category) => c.type === 'concern'));
        } catch (error) {
            console.error('CategoryContext: Failed to fetch categories', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, concerns, refreshCategories: fetchCategories, isLoading }}>
            {children}
        </CategoryContext.Provider>
    );
}

export function useCategories() {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoryProvider');
    }
    return context;
}
