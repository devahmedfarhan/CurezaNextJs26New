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
    show_in_mega_menu?: boolean;
    mega_menu_section?: string;
}

export interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    is_active: boolean;
}

interface CategoryContextType {
    categories: Category[];
    concerns: Category[];
    collections: Collection[];
    refreshCategories: () => Promise<void>;
    isLoading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [concerns, setConcerns] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = async () => {
        console.log('CategoryContext: Fetching categories & collections...');
        setIsLoading(true);
        try {
            const categoriesRes = await api.get('/categories');
            console.log('CategoryContext: Categories fetched successfully', categoriesRes.data);
            const all = categoriesRes.data;
            setCategories(all.filter((c: Category) => c.type === 'category'));
            setConcerns(all.filter((c: Category) => c.type === 'concern'));
        } catch (error) {
            console.error('CategoryContext: Failed to fetch categories', error);
        }

        try {
            const collectionsRes = await api.get('/collections');
            console.log('CategoryContext: Collections fetched successfully', collectionsRes.data);
            setCollections(collectionsRes.data);
        } catch (error) {
            console.error('CategoryContext: Failed to fetch collections', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <CategoryContext.Provider value={{ categories, concerns, collections, refreshCategories: fetchCategories, isLoading }}>
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
