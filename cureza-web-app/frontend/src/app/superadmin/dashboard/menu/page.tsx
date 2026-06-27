'use client';

import { useState, useEffect } from 'react';
import { 
    Plus, Edit, Trash2, X, ChevronRight, ChevronLeft, 
    ArrowUp, ArrowDown, CornerDownRight, Link as LinkIcon, 
    Tag, Sparkles, Store, ShoppingBag, Eye, EyeOff, Loader2, Search
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface MenuItem {
    id: number;
    title: string;
    url: string;
    parent_id: number | null;
    order: number;
    is_active: boolean;
    children?: MenuItem[];
}

interface Category {
    id: number;
    name: string;
    slug: string;
    type: string;
    show_in_mega_menu?: boolean;
    mega_menu_section?: string | null;
}

interface Brand {
    id: number;
    name: string;
    slug: string;
    is_active?: boolean;
    show_in_mega_menu?: boolean;
    mega_menu_section?: string | null;
}

interface Collection {
    id: number;
    name: string;
    slug: string;
    is_active?: boolean;
}

interface FlatItem {
    id: number;
    title: string;
    url: string;
    parent_id: number | null;
    order: number;
    is_active: boolean;
}

export default function AdminMenuPage() {
    const [activeTab, setActiveTab] = useState<'custom-links' | 'categories-mega' | 'concerns-mega' | 'brands-mega'>('custom-links');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Search filters for sidebars
    const [searchPages, setSearchPages] = useState('');
    const [searchCats, setSearchCats] = useState('');
    const [searchConcerns, setSearchConcerns] = useState('');
    const [searchBrands, setSearchBrands] = useState('');
    const [searchCollections, setSearchCollections] = useState('');

    // Checkbox selections for bulk add
    const [selectedCats, setSelectedCats] = useState<number[]>([]);
    const [selectedConcerns, setSelectedConcerns] = useState<number[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<number[]>([]);

    // Search filters inside mega menu tabs
    const [filterCategoryText, setFilterCategoryText] = useState('');
    const [filterConcernText, setFilterConcernText] = useState('');
    const [filterBrandText, setFilterBrandText] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        parent_id: '' as string | number,
        order: 0,
        is_active: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [linkType, setLinkType] = useState<'custom' | 'category' | 'concern' | 'brand' | 'collection'>('custom');

    const fetchMenuItems = async () => {
        setIsLoading(true);
        try {
            const menuRes = await api.get('/admin/menu-items');
            setMenuItems(menuRes.data || []);

            try {
                const catRes = await api.get('/admin/categories');
                setCategories(catRes.data || []);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }

            try {
                const brandRes = await api.get('/admin/brands');
                setBrands(brandRes.data || []);
            } catch (err) {
                console.error('Failed to fetch brands', err);
            }

            try {
                const collRes = await api.get('/admin/collections');
                setCollections(collRes.data || []);
            } catch (err) {
                console.error('Failed to fetch collections', err);
            }
        } catch (error: any) {
            console.error('Failed to fetch menu items data', error);
            showToast('Failed to load menu data. Check console for details.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenuItems();
    }, []);

    // Update mega menu database settings
    const handleUpdateCategoryMegaMenu = async (catId: number, show: boolean, section: string | null) => {
        try {
            const cat = categories.find(c => c.id === catId);
            if (!cat) return;
            
            await api.put(`/admin/categories/${catId}`, {
                name: cat.name,
                type: cat.type,
                show_in_mega_menu: show,
                mega_menu_section: section === '' ? null : section
            });
            showToast('Mega Menu setting updated', 'success');
            // Optimistic local state update to prevent flashing loaders
            setCategories(prev => prev.map(c => c.id === catId ? { ...c, show_in_mega_menu: show, mega_menu_section: section } : c));
        } catch (err) {
            console.error('Failed to update category mega menu', err);
            showToast('Failed to update categories mega menu settings', 'error');
            fetchMenuItems();
        }
    };

    const handleUpdateBrandMegaMenu = async (brandId: number, show: boolean, section: string | null) => {
        try {
            const brand = brands.find(b => b.id === brandId);
            if (!brand) return;
            
            await api.put(`/admin/brands/${brandId}`, {
                name: brand.name,
                show_in_mega_menu: show,
                mega_menu_section: section === '' ? null : section
            });
            showToast('Mega Menu setting updated', 'success');
            setBrands(prev => prev.map(b => b.id === brandId ? { ...b, show_in_mega_menu: show, mega_menu_section: section } : b));
        } catch (err) {
            console.error('Failed to update brand mega menu', err);
            showToast('Failed to update brand mega menu settings', 'error');
            fetchMenuItems();
        }
    };

    const handleOpenModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                url: item.url || '',
                parent_id: item.parent_id || '',
                order: item.order,
                is_active: item.is_active
            });
            // Try to deduce type from url
            if (item.url?.startsWith('/shop?category=')) {
                setLinkType('category');
            } else if (item.url?.startsWith('/shop?concern=')) {
                setLinkType('concern');
            } else if (item.url?.startsWith('/brand/')) {
                setLinkType('brand');
            } else if (item.url?.startsWith('/shop?collection=')) {
                setLinkType('collection');
            } else {
                setLinkType('custom');
            }
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                url: '',
                parent_id: '',
                order: 0,
                is_active: true
            });
            setLinkType('custom');
        }
        setIsModalOpen(true);
    };

    const handleLinkTypeChange = (type: typeof linkType) => {
        setLinkType(type);
        setFormData({ ...formData, url: '', title: '' });
    };

    const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const slug = e.target.value;
        if (!slug) return;

        let url = '';
        let title = '';

        if (linkType === 'category') {
            url = `/shop?category=${slug}`;
            title = categories.find(c => c.slug === slug)?.name || '';
        } else if (linkType === 'concern') {
            url = `/shop?concern=${slug}`;
            title = categories.find(c => c.slug === slug)?.name || '';
        } else if (linkType === 'brand') {
            url = `/brand/${slug}`;
            title = brands.find(b => b.slug === slug)?.name || '';
        } else if (linkType === 'collection') {
            url = `/shop?collection=${slug}`;
            title = collections.find(c => c.slug === slug)?.name || '';
        }

        setFormData({
            ...formData,
            url,
            title: title || formData.title
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            parent_id: formData.parent_id === '' ? null : Number(formData.parent_id)
        };

        try {
            if (editingItem) {
                await api.put(`/admin/menu-items/${editingItem.id}`, payload);
                showToast('Menu item updated successfully', 'success');
            } else {
                await api.post('/admin/menu-items', payload);
                showToast('Menu item created successfully', 'success');
            }
            setIsModalOpen(false);
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to save menu item', error);
            showToast('Failed to save menu item', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure? This will delete all nested sub-items too.')) return;
        try {
            await api.delete(`/admin/menu-items/${id}`);
            showToast('Menu item deleted successfully', 'success');
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to delete menu item', error);
            showToast('Failed to delete menu item', 'error');
        }
    };

    const handleQuickAdd = async (title: string, url: string) => {
        try {
            const topLevelCount = menuItems.length;
            await api.post('/admin/menu-items', {
                title,
                url,
                parent_id: null,
                order: topLevelCount + 1,
                is_active: true
            });
            showToast(`"${title}" added to menu`, 'success');
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to quick add item', error);
            showToast('Failed to add item', 'error');
        }
    };

    const handleBulkAdd = async (type: 'category' | 'concern' | 'brand' | 'collection') => {
        let itemsToAdd: { title: string, url: string }[] = [];
        
        if (type === 'category') {
            itemsToAdd = categories
                .filter(c => selectedCats.includes(c.id))
                .map(c => ({ title: c.name, url: `/shop?category=${c.slug}` }));
            setSelectedCats([]);
        } else if (type === 'concern') {
            itemsToAdd = categories
                .filter(c => selectedConcerns.includes(c.id))
                .map(c => ({ title: c.name, url: `/shop?concern=${c.slug}` }));
            setSelectedConcerns([]);
        } else if (type === 'brand') {
            itemsToAdd = brands
                .filter(b => selectedBrands.includes(b.id))
                .map(b => ({ title: b.name, url: `/brand/${b.slug}` }));
            setSelectedBrands([]);
        } else if (type === 'collection') {
            itemsToAdd = collections
                .filter(c => selectedCollections.includes(c.id))
                .map(c => ({ title: c.name, url: `/shop?collection=${c.slug}` }));
            setSelectedCollections([]);
        }

        if (itemsToAdd.length === 0) {
            showToast('No items selected', 'warning');
            return;
        }

        setIsLoading(true);
        try {
            const startOrder = menuItems.length + 1;
            for (let i = 0; i < itemsToAdd.length; i++) {
                await api.post('/admin/menu-items', {
                    title: itemsToAdd[i].title,
                    url: itemsToAdd[i].url,
                    parent_id: null,
                    order: startOrder + i,
                    is_active: true
                });
            }
            showToast(`Successfully added ${itemsToAdd.length} items to menu`, 'success');
            fetchMenuItems();
        } catch (error) {
            console.error('Failed bulk add', error);
            showToast('Failed to add selected items', 'error');
            fetchMenuItems();
        }
    };

    const handleToggleActive = async (item: MenuItem) => {
        try {
            await api.put(`/admin/menu-items/${item.id}`, {
                title: item.title,
                url: item.url,
                parent_id: item.parent_id,
                order: item.order,
                is_active: !item.is_active
            });
            showToast(`"${item.title}" ${item.is_active ? 'deactivated' : 'activated'}`, 'success');
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to toggle state', error);
            showToast('Failed to toggle status', 'error');
        }
    };

    // Advanced Hierarchy shifters
    const getFlatItemsList = (items: MenuItem[]): FlatItem[] => {
        let flat: FlatItem[] = [];
        items.forEach(item => {
            flat.push({
                id: item.id,
                title: item.title,
                url: item.url,
                parent_id: item.parent_id,
                order: item.order,
                is_active: item.is_active
            });
            if (item.children) {
                flat = [...flat, ...getFlatItemsList(item.children)];
            }
        });
        return flat;
    };

    const handleHierarchyChange = async (itemId: number, action: 'UP' | 'DOWN' | 'INDENT' | 'OUTDENT') => {
        const allFlatItems = getFlatItemsList(menuItems);
        const item = allFlatItems.find(i => i.id === itemId);
        if (!item) return;

        const getSiblings = (parentId: number | null) => {
            return allFlatItems
                .filter(i => i.parent_id === parentId)
                .sort((a, b) => a.order - b.order);
        };

        const siblings = getSiblings(item.parent_id);
        const currentIndex = siblings.findIndex(s => s.id === itemId);

        if (action === 'UP') {
            if (currentIndex === 0) return;
            const prevSibling = siblings[currentIndex - 1];
            const tempOrder = item.order;
            item.order = prevSibling.order;
            prevSibling.order = tempOrder;
        } else if (action === 'DOWN') {
            if (currentIndex === siblings.length - 1) return;
            const nextSibling = siblings[currentIndex + 1];
            const tempOrder = item.order;
            item.order = nextSibling.order;
            nextSibling.order = tempOrder;
        } else if (action === 'INDENT') {
            if (currentIndex === 0) {
                showToast('Need a sibling above to indent under', 'warning');
                return;
            }
            const newParent = siblings[currentIndex - 1];
            item.parent_id = newParent.id;
            const newParentChildren = allFlatItems.filter(i => i.parent_id === newParent.id);
            item.order = newParentChildren.length + 1;
        } else if (action === 'OUTDENT') {
            if (item.parent_id === null) return;
            const parentItem = allFlatItems.find(i => i.id === item.parent_id);
            if (!parentItem) return;
            
            item.parent_id = parentItem.parent_id;
            item.order = parentItem.order + 1;

            const grandparentSiblings = getSiblings(parentItem.parent_id);
            grandparentSiblings.forEach(s => {
                if (s.order > parentItem.order && s.id !== item.id) {
                    s.order += 1;
                }
            });
        }

        const parentIds = Array.from(new Set(allFlatItems.map(i => i.parent_id)));
        parentIds.forEach(pId => {
            const group = allFlatItems.filter(i => i.parent_id === pId).sort((a, b) => a.order - b.order);
            group.forEach((item, index) => {
                item.order = index + 1;
            });
        });

        const reorderPayload = allFlatItems.map(i => ({
            id: i.id,
            order: i.order,
            parent_id: i.parent_id
        }));

        try {
            setIsLoading(true);
            await api.post('/admin/menu-items/reorder', { items: reorderPayload });
            showToast('Menu structure updated successfully', 'success');
            fetchMenuItems();
        } catch (error) {
            console.error('Failed to update hierarchy', error);
            showToast('Failed to save hierarchy changes', 'error');
            fetchMenuItems();
        } finally {
            setIsLoading(false);
        }
    };

    const getFlatItemsForSelect = (items: MenuItem[], prefix = ''): { id: number, title: string }[] => {
        let flat: { id: number, title: string }[] = [];
        items.forEach(item => {
            flat.push({ id: item.id, title: prefix + item.title });
            if (item.children) {
                flat = [...flat, ...getFlatItemsForSelect(item.children, prefix + '-- ')];
            }
        });
        return flat;
    };

    const getDescendantIds = (item: MenuItem): number[] => {
        let ids: number[] = [];
        if (item.children) {
            item.children.forEach(child => {
                ids.push(child.id);
                ids = [...ids, ...getDescendantIds(child)];
            });
        }
        return ids;
    };

    const flatItems = getFlatItemsForSelect(menuItems);
    const forbiddenParentIds = editingItem ? [editingItem.id, ...getDescendantIds(editingItem)] : [];
    const availableParents = flatItems.filter(item => !forbiddenParentIds.includes(item.id));

    const getItemType = (url: string) => {
        if (!url) return 'custom';
        if (url.startsWith('/shop?category=')) return 'category';
        if (url.startsWith('/shop?concern=')) return 'concern';
        if (url.startsWith('/brand/')) return 'brand';
        if (url.startsWith('/shop?collection=')) return 'collection';
        return 'custom';
    };

    const getItemBadge = (url: string) => {
        const type = getItemType(url);
        switch (type) {
            case 'category':
                return { label: 'Category', icon: <Tag size={12} />, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'concern':
                return { label: 'Concern', icon: <Sparkles size={12} />, className: 'bg-purple-50 text-purple-700 border-purple-200' };
            case 'brand':
                return { label: 'Brand', icon: <Store size={12} />, className: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'collection':
                return { label: 'Collection', icon: <ShoppingBag size={12} />, className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
            default:
                return { label: 'Custom URL', icon: <LinkIcon size={12} />, className: 'bg-blue-50 text-blue-700 border-blue-200' };
        }
    };

    const renderHierarchyItem = (item: MenuItem, index: number, siblings: MenuItem[], depth = 0) => {
        const badge = getItemBadge(item.url);
        const hasChildren = item.children && item.children.length > 0;

        return (
            <div key={item.id} className="relative group/tree bg-white/70 backdrop-blur-md">
                <div 
                    className="flex items-center justify-between p-3.5 border-b border-black/5 hover:bg-slate-50/50 transition-colors relative"
                    style={{ paddingLeft: `${depth * 32 + 16}px` }}
                >
                    {/* Visual Connection Lines */}
                    {depth > 0 && (
                        <div 
                            className="absolute top-0 bottom-0 flex pointer-events-none" 
                            style={{ left: `${(depth - 1) * 32 + 20}px` }}
                        >
                            <div className="absolute top-0 bottom-0 w-[1.5px] bg-[#2E7D32]/25" />
                            <div className="absolute h-[1.5px] bg-[#2E7D32]/25 w-4 top-1/2" />
                        </div>
                    )}

                    <div className="flex items-center gap-3 z-10">
                        {depth > 0 && <CornerDownRight size={14} className="text-[#2E7D32]/40" />}
                        <span className="font-semibold text-sm text-slate-800">{item.title}</span>
                        <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 max-w-xs truncate">
                            {item.url || '/'}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] font-semibold border px-2 py-0.5 rounded-full ${badge.className}`}>
                            {badge.icon}
                            {badge.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 z-10">
                        <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5 border border-slate-200">
                            <button
                                onClick={() => handleHierarchyChange(item.id, 'UP')}
                                disabled={index === 0}
                                title="Move Up"
                                className="p-1 rounded text-slate-500 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <ArrowUp size={13} />
                            </button>
                            <button
                                onClick={() => handleHierarchyChange(item.id, 'DOWN')}
                                disabled={index === siblings.length - 1}
                                title="Move Down"
                                className="p-1 rounded text-slate-500 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <ArrowDown size={13} />
                            </button>
                            <button
                                onClick={() => handleHierarchyChange(item.id, 'OUTDENT')}
                                disabled={depth === 0}
                                title="Outdent"
                                className="p-1 rounded text-slate-500 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <ChevronLeft size={13} />
                            </button>
                            <button
                                onClick={() => handleHierarchyChange(item.id, 'INDENT')}
                                disabled={index === 0}
                                title="Indent"
                                className="p-1 rounded text-slate-500 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <ChevronRight size={13} />
                            </button>
                        </div>

                        <button
                            onClick={() => handleToggleActive(item)}
                            title={item.is_active ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-md border transition-all ${
                                item.is_active 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/50' 
                                : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100/50'
                            }`}
                        >
                            {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        <button 
                            onClick={() => handleOpenModal(item)} 
                            title="Edit"
                            className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
                        >
                            <Edit size={14} />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)} 
                            title="Delete"
                            className="p-1.5 rounded-md border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {hasChildren && (
                    <div className="relative">
                        {item.children!.map((child, childIdx) => 
                            renderHierarchyItem(child, childIdx, item.children!, depth + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Filter helpers for sidebars
    const COMMON_PAGES = [
        { title: 'Home', url: '/' },
        { title: 'Shop All', url: '/shop' },
        { title: 'New Launches', url: '/new-launches' },
        { title: 'Bestsellers', url: '/bestsellers' },
        { title: 'Blog', url: '/blog' },
        { title: 'Offers', url: '/offers' },
        { title: 'About Us', url: '/about' },
        { title: 'Contact Us', url: '/contact' },
        { title: 'FAQ', url: '/faq' },
    ];

    const filteredPages = COMMON_PAGES.filter(p => p.title.toLowerCase().includes(searchPages.toLowerCase()));
    
    const filteredCats = categories
        .filter(c => c.type === 'category')
        .filter(c => c.name.toLowerCase().includes(searchCats.toLowerCase()));
        
    const filteredConcerns = categories
        .filter(c => c.type === 'concern')
        .filter(c => c.name.toLowerCase().includes(searchConcerns.toLowerCase()));

    const filteredBrands = brands
        .filter(b => b.name.toLowerCase().includes(searchBrands.toLowerCase()));

    const filteredCollections = collections
        .filter(c => c.name.toLowerCase().includes(searchCollections.toLowerCase()));

    const toggleSelect = (id: number, list: number[], setter: React.Dispatch<React.SetStateAction<number[]>>) => {
        if (list.includes(id)) {
            setter(list.filter(item => item !== id));
        } else {
            setter([...list, id]);
        }
    };

    // Mega menu columns grouping
    const categorySections = [
        { key: 'thc', label: 'Medical Cannabis THC' },
        { key: 'cbd', label: 'CBD & Hemp Products' },
        { key: 'herbal', label: 'Herbal & Ayurveda' },
        { key: 'supplements', label: 'Supplements & Wellness' }
    ];

    const concernSections = [
        { key: 'mental', label: 'Mental Wellness' },
        { key: 'physical', label: 'Physical & Pain Relief' },
        { key: 'general', label: 'General & Skin Health' }
    ];

    const brandSections = [
        { key: 'cannabis_hemp', label: 'Cannabis & Hemp' },
        { key: 'ayurvedic_herbal', label: 'Ayurvedic & Herbal' },
        { key: 'wellness_care', label: 'Wellness & Care' }
    ];

    return (
        <div className="w-full space-y-6 pb-20 select-none">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        Menu & Mega Menu Management
                    </h1>
                    <p className="text-slate-400 text-sm">Control live website navbar links, categories, brands, concerns and custom routes</p>
                </div>
                {activeTab === 'custom-links' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-[0_4px_14px_rgba(16,185,129,0.2)] border-none"
                    >
                        <Plus size={16} /> Add Custom Link
                    </button>
                )}
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap border-b border-slate-200 gap-1.5 p-1 bg-slate-100 rounded-xl max-w-4xl">
                {[
                    { id: 'custom-links', label: 'Header/Footer Custom Links', icon: <LinkIcon size={14} /> },
                    { id: 'categories-mega', label: 'Shop By Category columns', icon: <Tag size={14} /> },
                    { id: 'concerns-mega', label: 'Shop By Concern columns', icon: <Sparkles size={14} /> },
                    { id: 'brands-mega', label: 'Shop By Brand columns', icon: <Store size={14} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg transition-all ${
                            activeTab === tab.id
                            ? 'bg-white text-[#2E7D32] shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB 1: CUSTOM NAVIGATION TREE BUILDER */}
            {activeTab === 'custom-links' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
                    {/* LEFT SIDEBAR: QUICK ACCORDIONS */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Pages accordion */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                                <span>Pages</span>
                                <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-600">{filteredPages.length} links</span>
                            </div>
                            <div className="p-3 border-b border-slate-100 bg-white">
                                <input 
                                    type="text"
                                    placeholder="Search pages..."
                                    value={searchPages}
                                    onChange={e => setSearchPages(e.target.value)}
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                                />
                            </div>
                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                                {filteredPages.map((page, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-700">{page.title}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{page.url}</span>
                                        </div>
                                        <button
                                            onClick={() => handleQuickAdd(page.title, page.url)}
                                            className="text-xs bg-slate-50 hover:bg-black hover:text-white border border-slate-200 hover:border-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-semibold"
                                        >
                                            <Plus size={11} /> Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Categories accordion */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                                <span>Categories</span>
                                <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-600">{filteredCats.length} items</span>
                            </div>
                            <div className="p-3 border-b border-slate-100 bg-white flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchCats}
                                    onChange={e => setSearchCats(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                                />
                                {selectedCats.length > 0 && (
                                    <button
                                        onClick={() => handleBulkAdd('category')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-all"
                                    >
                                        Add ({selectedCats.length})
                                    </button>
                                )}
                            </div>
                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                                {filteredCats.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={selectedCats.includes(cat.id)}
                                                onChange={() => toggleSelect(cat.id, selectedCats, setSelectedCats)}
                                                className="w-3.5 h-3.5 border-slate-300 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                            />
                                            <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
                                        </label>
                                        <button
                                            onClick={() => handleQuickAdd(cat.name, `/shop?category=${cat.slug}`)}
                                            className="text-xs bg-slate-50 hover:bg-black hover:text-white border border-slate-200 hover:border-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-semibold"
                                        >
                                            <Plus size={11} /> Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Concerns accordion */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                                <span>Concerns</span>
                                <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-600">{filteredConcerns.length} items</span>
                            </div>
                            <div className="p-3 border-b border-slate-100 bg-white flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="Search concerns..."
                                    value={searchConcerns}
                                    onChange={e => setSearchConcerns(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                                />
                                {selectedConcerns.length > 0 && (
                                    <button
                                        onClick={() => handleBulkAdd('concern')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-all"
                                    >
                                        Add ({selectedConcerns.length})
                                    </button>
                                )}
                            </div>
                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                                {filteredConcerns.map(concern => (
                                    <div key={concern.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={selectedConcerns.includes(concern.id)}
                                                onChange={() => toggleSelect(concern.id, selectedConcerns, setSelectedConcerns)}
                                                className="w-3.5 h-3.5 border-slate-300 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                            />
                                            <span className="text-xs font-semibold text-slate-700">{concern.name}</span>
                                        </label>
                                        <button
                                            onClick={() => handleQuickAdd(concern.name, `/shop?concern=${concern.slug}`)}
                                            className="text-xs bg-slate-50 hover:bg-black hover:text-white border border-slate-200 hover:border-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-semibold"
                                        >
                                            <Plus size={11} /> Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Brands accordion */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                                <span>Brands</span>
                                <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-600">{filteredBrands.length} brands</span>
                            </div>
                            <div className="p-3 border-b border-slate-100 bg-white flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="Search brands..."
                                    value={searchBrands}
                                    onChange={e => setSearchBrands(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                                />
                                {selectedBrands.length > 0 && (
                                    <button
                                        onClick={() => handleBulkAdd('brand')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-all"
                                    >
                                        Add ({selectedBrands.length})
                                    </button>
                                )}
                            </div>
                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                                {filteredBrands.map(brand => (
                                    <div key={brand.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={selectedBrands.includes(brand.id)}
                                                onChange={() => toggleSelect(brand.id, selectedBrands, setSelectedBrands)}
                                                className="w-3.5 h-3.5 border-slate-300 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                            />
                                            <span className="text-xs font-semibold text-slate-700">{brand.name}</span>
                                        </label>
                                        <button
                                            onClick={() => handleQuickAdd(brand.name, `/brand/${brand.slug}`)}
                                            className="text-xs bg-slate-50 hover:bg-black hover:text-white border border-slate-200 hover:border-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-semibold"
                                        >
                                            <Plus size={11} /> Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Collections accordion */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 font-bold text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
                                <span>Collections</span>
                                <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-600">{filteredCollections.length} pages</span>
                            </div>
                            <div className="p-3 border-b border-slate-100 bg-white flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="Search collections..."
                                    value={searchCollections}
                                    onChange={e => setSearchCollections(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                                />
                                {selectedCollections.length > 0 && (
                                    <button
                                        onClick={() => handleBulkAdd('collection')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-all"
                                    >
                                        Add ({selectedCollections.length})
                                    </button>
                                )}
                            </div>
                            <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                                {filteredCollections.map(coll => (
                                    <div key={coll.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={selectedCollections.includes(coll.id)}
                                                onChange={() => toggleSelect(coll.id, selectedCollections, setSelectedCollections)}
                                                className="w-3.5 h-3.5 border-slate-300 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                            />
                                            <span className="text-xs font-semibold text-slate-700">{coll.name}</span>
                                        </label>
                                        <button
                                            onClick={() => handleQuickAdd(coll.name, `/shop?collection=${coll.slug}`)}
                                            className="text-xs bg-slate-50 hover:bg-black hover:text-white border border-slate-200 hover:border-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-semibold"
                                        >
                                            <Plus size={11} /> Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: TREE BUILDER */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                            <div className="p-4 border-b border-slate-200 bg-slate-50/40 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span>Navigation Structure</span>
                                <span>Controls & Actions</span>
                            </div>

                            {isLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
                                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                                    <p className="text-sm font-medium">Loading menu layout...</p>
                                </div>
                            ) : menuItems.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 gap-3">
                                    <CornerDownRight size={48} className="text-slate-300" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-600">Your menu is empty</p>
                                        <p className="text-xs text-slate-400 max-w-xs mt-1">Select items from the sidebars on the left or add a custom link to get started.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-black/5 flex-1 bg-white">
                                    {menuItems.map((item, idx) => 
                                        renderHierarchyItem(item, idx, menuItems, 0)
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CATEGORIES MEGA MENU MANAGER */}
            {activeTab === 'categories-mega' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                        <span className="text-sm font-bold text-slate-700">Assign Product Categories to live Mega Menu columns</span>
                        <div className="relative w-72">
                            <input
                                type="text"
                                placeholder="Filter categories..."
                                value={filterCategoryText}
                                onChange={e => setFilterCategoryText(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white"
                            />
                            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Render assigned columns */}
                        {[
                            ...categorySections,
                            { key: 'unassigned', label: 'Hidden / Unassigned Categories' }
                        ].map(section => {
                            const sectionItems = categories
                                .filter(c => c.type === 'category')
                                .filter(c => c.name.toLowerCase().includes(filterCategoryText.toLowerCase()))
                                .filter(c => {
                                    if (section.key === 'unassigned') {
                                        return !categorySections.some(s => s.key === c.mega_menu_section) || c.show_in_mega_menu === false;
                                    }
                                    return c.mega_menu_section === section.key && c.show_in_mega_menu !== false;
                                });

                            return (
                                <div key={section.key} className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[400px] flex flex-col">
                                    <div className="pb-3 border-b border-slate-200 mb-3 flex flex-col">
                                        <h3 className="font-bold text-xs text-slate-800 leading-tight">{section.label}</h3>
                                        <span className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{sectionItems.length} items</span>
                                    </div>

                                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
                                        {sectionItems.map(cat => (
                                            <div key={cat.id} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm flex flex-col gap-2.5">
                                                <div className="flex justify-between items-start gap-1">
                                                    <span className="text-xs font-semibold text-slate-700 leading-tight">{cat.name}</span>
                                                    <button
                                                        onClick={() => handleUpdateCategoryMegaMenu(cat.id, !(cat.show_in_mega_menu !== false), cat.mega_menu_section || null)}
                                                        className={`p-1 rounded ${
                                                            cat.show_in_mega_menu !== false 
                                                            ? 'text-emerald-600 hover:bg-emerald-50' 
                                                            : 'text-red-400 hover:bg-red-50'
                                                        }`}
                                                        title={cat.show_in_mega_menu !== false ? 'Show in Mega Menu' : 'Hidden'}
                                                    >
                                                        {cat.show_in_mega_menu !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                                                    <span className="text-[9px] text-slate-400 uppercase font-bold">Assign Column</span>
                                                    <select
                                                        value={cat.mega_menu_section || ''}
                                                        onChange={e => handleUpdateCategoryMegaMenu(cat.id, true, e.target.value || null)}
                                                        className="w-full px-2 py-1 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded focus:outline-none"
                                                    >
                                                        <option value="">-- Hide / Unassign --</option>
                                                        {categorySections.map(s => (
                                                            <option key={s.key} value={s.key}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                        {sectionItems.length === 0 && (
                                            <div className="text-center py-8 text-xs text-slate-400 italic">No categories here</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 3: CONCERNS MEGA MENU MANAGER */}
            {activeTab === 'concerns-mega' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                        <span className="text-sm font-bold text-slate-700">Assign Health Concerns to live Mega Menu columns</span>
                        <div className="relative w-72">
                            <input
                                type="text"
                                placeholder="Filter concerns..."
                                value={filterConcernText}
                                onChange={e => setFilterConcernText(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white"
                            />
                            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            ...concernSections,
                            { key: 'unassigned', label: 'Hidden / Unassigned Concerns' }
                        ].map(section => {
                            const sectionItems = categories
                                .filter(c => c.type === 'concern')
                                .filter(c => c.name.toLowerCase().includes(filterConcernText.toLowerCase()))
                                .filter(c => {
                                    if (section.key === 'unassigned') {
                                        return !concernSections.some(s => s.key === c.mega_menu_section) || c.show_in_mega_menu === false;
                                    }
                                    return c.mega_menu_section === section.key && c.show_in_mega_menu !== false;
                                });

                            return (
                                <div key={section.key} className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[400px] flex flex-col">
                                    <div className="pb-3 border-b border-slate-200 mb-3 flex flex-col">
                                        <h3 className="font-bold text-xs text-slate-800 leading-tight">{section.label}</h3>
                                        <span className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{sectionItems.length} items</span>
                                    </div>

                                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
                                        {sectionItems.map(concern => (
                                            <div key={concern.id} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm flex flex-col gap-2.5">
                                                <div className="flex justify-between items-start gap-1">
                                                    <span className="text-xs font-semibold text-slate-700 leading-tight">{concern.name}</span>
                                                    <button
                                                        onClick={() => handleUpdateCategoryMegaMenu(concern.id, !(concern.show_in_mega_menu !== false), concern.mega_menu_section || null)}
                                                        className={`p-1 rounded ${
                                                            concern.show_in_mega_menu !== false 
                                                            ? 'text-emerald-600 hover:bg-emerald-50' 
                                                            : 'text-red-400 hover:bg-red-50'
                                                        }`}
                                                    >
                                                        {concern.show_in_mega_menu !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                                                    <span className="text-[9px] text-slate-400 uppercase font-bold">Assign Column</span>
                                                    <select
                                                        value={concern.mega_menu_section || ''}
                                                        onChange={e => handleUpdateCategoryMegaMenu(concern.id, true, e.target.value || null)}
                                                        className="w-full px-2 py-1 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded focus:outline-none"
                                                    >
                                                        <option value="">-- Hide / Unassign --</option>
                                                        {concernSections.map(s => (
                                                            <option key={s.key} value={s.key}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                        {sectionItems.length === 0 && (
                                            <div className="text-center py-8 text-xs text-slate-400 italic">No concerns here</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 4: BRANDS MEGA MENU MANAGER */}
            {activeTab === 'brands-mega' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                        <span className="text-sm font-bold text-slate-700">Assign Product Brands to live Mega Menu columns</span>
                        <div className="relative w-72">
                            <input
                                type="text"
                                placeholder="Filter brands..."
                                value={filterBrandText}
                                onChange={e => setFilterBrandText(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white"
                            />
                            <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            ...brandSections,
                            { key: 'unassigned', label: 'Hidden / Unassigned Brands' }
                        ].map(section => {
                            const sectionItems = brands
                                .filter(b => b.name.toLowerCase().includes(filterBrandText.toLowerCase()))
                                .filter(b => {
                                    if (section.key === 'unassigned') {
                                        return !brandSections.some(s => s.key === b.mega_menu_section) || b.show_in_mega_menu === false;
                                    }
                                    return b.mega_menu_section === section.key && b.show_in_mega_menu !== false;
                                });

                            return (
                                <div key={section.key} className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[400px] flex flex-col">
                                    <div className="pb-3 border-b border-slate-200 mb-3 flex flex-col">
                                        <h3 className="font-bold text-xs text-slate-800 leading-tight">{section.label}</h3>
                                        <span className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{sectionItems.length} brands</span>
                                    </div>

                                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
                                        {sectionItems.map(brand => (
                                            <div key={brand.id} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm flex flex-col gap-2.5">
                                                <div className="flex justify-between items-start gap-1">
                                                    <span className="text-xs font-semibold text-slate-700 leading-tight">{brand.name}</span>
                                                    <button
                                                        onClick={() => handleUpdateBrandMegaMenu(brand.id, !(brand.show_in_mega_menu !== false), brand.mega_menu_section || null)}
                                                        className={`p-1 rounded ${
                                                            brand.show_in_mega_menu !== false 
                                                            ? 'text-emerald-600 hover:bg-emerald-50' 
                                                            : 'text-red-400 hover:bg-red-50'
                                                        }`}
                                                    >
                                                        {brand.show_in_mega_menu !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                                                    <span className="text-[9px] text-slate-400 uppercase font-bold">Assign Column</span>
                                                    <select
                                                        value={brand.mega_menu_section || ''}
                                                        onChange={e => handleUpdateBrandMegaMenu(brand.id, true, e.target.value || null)}
                                                        className="w-full px-2 py-1 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded focus:outline-none"
                                                    >
                                                        <option value="">-- Hide / Unassign --</option>
                                                        {brandSections.map(s => (
                                                            <option key={s.key} value={s.key}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                        {sectionItems.length === 0 && (
                                            <div className="text-center py-8 text-xs text-slate-400 italic">No brands here</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ADD/EDIT MODAL FOR CUSTOM LINKS */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h2 className="font-bold text-slate-800 text-base">
                                {editingItem ? 'Edit Menu Link' : 'Add Custom Link'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Link Source Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: 'custom', label: 'Custom URL' },
                                        { key: 'category', label: 'Category' },
                                        { key: 'concern', label: 'Concern' },
                                        { key: 'brand', label: 'Brand' },
                                        { key: 'collection', label: 'Collection' }
                                    ].map(opt => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleLinkTypeChange(opt.key as typeof linkType)}
                                            className={`px-2.5 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                                                linkType === opt.key 
                                                ? 'bg-black text-white border-black' 
                                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {linkType === 'custom' ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">URL Route Path</label>
                                    <input
                                        type="text"
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white font-mono text-xs"
                                        placeholder="/shop or https://..."
                                        required
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select {linkType}</label>
                                    <select
                                        onChange={handleItemSelect}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-black font-semibold text-slate-700"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a {linkType}...</option>
                                        {linkType === 'category' && categories.filter(c => c.type === 'category').map(c => (
                                            <option key={c.id} value={c.slug}>{c.name}</option>
                                        ))}
                                        {linkType === 'concern' && categories.filter(c => c.type === 'concern').map(c => (
                                            <option key={c.id} value={c.slug}>{c.name}</option>
                                        ))}
                                        {linkType === 'brand' && brands.map(b => (
                                            <option key={b.id} value={b.slug}>{b.name}</option>
                                        ))}
                                        {linkType === 'collection' && collections.map(c => (
                                            <option key={c.id} value={c.slug}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Link Display Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white font-semibold text-slate-800"
                                    placeholder="Enter link name..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Parent Item</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-black font-semibold text-slate-700"
                                >
                                    <option value="">None (Top-Level Menu)</option>
                                    {availableParents.map(item => (
                                        <option key={item.id} value={item.id}>{item.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sort Position Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-black font-semibold text-slate-700"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                                    />
                                    <label htmlFor="is_active" className="text-xs font-bold text-slate-600 cursor-pointer select-none">Active Link</label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black hover:bg-neutral-800 text-white py-3 rounded-xl transition-all font-semibold text-sm border-none shadow-md flex justify-center items-center gap-2 mt-4"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Menu Link'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
