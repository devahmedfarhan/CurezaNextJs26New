import menuItemsData from '@/data/menu-items.json';

export interface MenuItem {
    id: number;
    title: string;
    url: string;
    parent_id?: number | null;
    order?: number;
    is_active?: boolean;
    active_children?: MenuItem[];
    children?: MenuItem[];
}

export function useMenu() {
    // Map active_children to children for backward/forward compatibility
    const parsedMenuItems = ((menuItemsData || []) as any[]).map(item => {
        const children = item.active_children || item.children || [];
        // Map nested children recursively if any
        const mapChildren = (childs: any[]): MenuItem[] => {
            return childs.map(c => ({
                ...c,
                children: c.active_children || c.children || []
            }));
        };

        return {
            ...item,
            children: mapChildren(children)
        } as MenuItem;
    });

    return {
        menuItems: parsedMenuItems,
        isLoading: false,
        isError: null
    };
}
