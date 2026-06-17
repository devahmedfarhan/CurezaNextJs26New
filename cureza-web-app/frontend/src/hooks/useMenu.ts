import menuItemsData from '@/data/menu-items.json';

export interface MenuItem {
    id: number;
    title: string;
    url: string;
    children?: MenuItem[];
}

export function useMenu() {
    return {
        menuItems: menuItemsData as MenuItem[],
        isLoading: false,
        isError: null
    };
}
