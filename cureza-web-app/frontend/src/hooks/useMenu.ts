import useSWR from 'swr';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cureza_menu_items';

export interface MenuItem {
    id: number;
    title: string;
    url: string;
    children?: MenuItem[];
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useMenu() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Initialize from LocalStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setMenuItems(JSON.parse(stored));
                    setIsLoading(false);
                } catch (e) {
                    console.error('Failed to parse menu items', e);
                }
            }
        }
    }, []);

    // 2. Background Fetch
    const { data, error } = useSWR('/menu-items', fetcher, {
        revalidateOnFocus: false, // Menu rarely changes
        revalidateOnReconnect: false,
        onSuccess: (newData) => {
            setMenuItems(newData);
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            }
            setIsLoading(false);
        }
    });

    return {
        menuItems: data || menuItems, // Prefer fresh data, fallback to local
        isLoading: isLoading && !data && menuItems.length === 0,
        isError: error
    };
}
