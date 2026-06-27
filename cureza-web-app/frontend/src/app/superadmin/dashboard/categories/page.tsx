'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, FolderOpen, Search, X, Loader2, Layers, Database, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/context/AuthContext';

interface Category {
    id: number;
    name: string;
    slug: string;
    type: 'category' | 'concern';
    parent_id?: number | null;
    image?: string;
    icon?: string;
    sub_heading?: string;
    description?: string;
    bottom_description?: string;
    is_active: boolean;
    products_count?: number;
    concern_products_count?: number;
    show_in_mega_menu?: boolean;
    mega_menu_section?: string | null;
    children?: Category[];
}

interface Collection {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    is_active: boolean;
    products_count?: number;
    products?: { id: number; title: string }[];
}

type TabType = 'category' | 'concern' | 'collection';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [productsList, setProductsList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('category');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortField, setSortField] = useState<string>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const { showToast } = useToast();
    const { user, isLoading: authLoading } = useAuth();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        parent_id: '' as string | number,
        image: null as File | null,
        icon: '',
        sub_heading: '',
        description: '',
        bottom_description: '',
        type: 'category' as TabType,
        is_active: true,
        show_in_mega_menu: true,
        mega_menu_section: '',
        product_ids: [] as number[]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInitializingDb, setIsInitializingDb] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        console.log('AdminPage: Fetching categories...');
        setIsLoading(true);
        setError(null);
        try {
            // Fetch Categories & Concerns
            const response = await api.get('/admin/categories');
            console.log('AdminPage: Fetched categories', response.data);
            setCategories(response.data);

            // Fetch Collections
            const collectionsResponse = await api.get('/admin/collections');
            console.log('AdminPage: Fetched collections', collectionsResponse.data);
            setCollections(collectionsResponse.data);
        } catch (error: any) {
            console.error('AdminPage: Failed to fetch categories or collections', error);
            setError(error.message || 'Unknown error');
            showToast('Failed to load categories/collections', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProductsList = async () => {
        try {
            const response = await api.get('/products');
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];
            setProductsList(data);
        } catch (err) {
            console.error('Failed to fetch products list', err);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchCategories();
            fetchProductsList();
        }
    }, [authLoading, user]);

    useEffect(() => {
        setSelectedIds([]);
        setSortField('name');
        setSortDirection('asc');
    }, [activeTab]);

    const handleInitDB = async () => {
        setIsInitializingDb(true);
        try {
            const response = await api.get('/admin/init-collections-db');
            if (response.data.success) {
                showToast(response.data.message || 'Database initialized successfully', 'success');
                fetchCategories();
            } else {
                showToast(response.data.error || 'Initialization failed', 'error');
            }
        } catch (err: any) {
            console.error('Failed to init collections db', err);
            showToast(err.message || 'Database initialization failed', 'error');
        } finally {
            setIsInitializingDb(false);
        }
    };

    const filteredItems = activeTab === 'collection'
        ? collections.filter(col => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : categories.filter(cat => cat.type === activeTab && cat.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Get potential parents (exclude self and children to prevent cycles if editing)
    const parentOptions = categories.filter(c =>
        c.type === activeTab &&
        c.id !== editingItem?.id
    );

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                parent_id: item.parent_id || '',
                image: null, // Reset file input
                icon: item.icon || '',
                sub_heading: item.sub_heading || '',
                description: item.description || '',
                bottom_description: item.bottom_description || '',
                type: activeTab,
                is_active: item.is_active,
                show_in_mega_menu: item.show_in_mega_menu !== undefined ? item.show_in_mega_menu : true,
                mega_menu_section: item.mega_menu_section || '',
                product_ids: item.products ? item.products.map((p: any) => p.id) : []
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                parent_id: '',
                image: null,
                icon: '',
                sub_heading: '',
                description: '',
                bottom_description: '',
                type: activeTab,
                is_active: true,
                show_in_mega_menu: true,
                mega_menu_section: '',
                product_ids: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('is_active', formData.is_active ? '1' : '0');
        data.append('show_in_mega_menu', formData.show_in_mega_menu ? '1' : '0');
        data.append('mega_menu_section', formData.mega_menu_section || '');

        if (formData.description) data.append('description', formData.description);

        if (activeTab === 'collection') {
            // Collections sync products
            if (formData.product_ids && formData.product_ids.length > 0) {
                formData.product_ids.forEach(id => {
                    data.append('product_ids[]', String(id));
                });
            } else {
                data.append('product_ids', ''); // empty array trigger
            }
        } else {
            // Categories/Concerns fields
            data.append('type', formData.type);
            if (formData.parent_id && formData.parent_id !== 'null' && formData.parent_id !== '') {
                data.append('parent_id', String(formData.parent_id));
            }
            if (formData.icon) data.append('icon', formData.icon);
            if (formData.sub_heading) data.append('sub_heading', formData.sub_heading);
            if (formData.bottom_description) data.append('bottom_description', formData.bottom_description);
        }

        // Strictly check if image is a File object before appending
        if (formData.image && formData.image instanceof File) {
            data.append('image', formData.image);
        }

        // Method spoofing for PUT requests with FormData (Laravel requirement)
        if (editingItem) {
            data.append('_method', 'PUT');
        }

        const url = activeTab === 'collection'
            ? (editingItem ? `/admin/collections/${editingItem.id}` : '/admin/collections')
            : (editingItem ? `/admin/categories/${editingItem.id}` : '/admin/categories');

        try {
            await api.post(url, data);
            showToast(`${activeTab === 'collection' ? 'Collection' : 'Category'} saved successfully`, 'success');
            setIsModalOpen(false);
            fetchCategories();
        } catch (error: any) {
            console.error('Failed to save category/collection', error);
            let errorMessage = error.message || 'Unknown error';
            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
                errorMessage = `Validation Error: ${validationErrors}`;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'collection' ? 'collection' : 'category'}?`)) return;
        const url = activeTab === 'collection' ? `/admin/collections/${id}` : `/admin/categories/${id}`;
        try {
            await api.delete(url);
            showToast(`${activeTab === 'collection' ? 'Collection' : 'Category'} deleted successfully`, 'success');
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category/collection', error);
            showToast('Failed to delete category/collection', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected items?`)) return;
        setIsLoading(true);
        try {
            for (const id of selectedIds) {
                const url = activeTab === 'collection' ? `/admin/collections/${id}` : `/admin/categories/${id}`;
                await api.delete(url);
            }
            showToast('Selected items deleted successfully', 'success');
            setSelectedIds([]);
            fetchCategories();
        } catch (error) {
            console.error('Bulk delete failed', error);
            showToast('Failed to delete some items', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkStatusChange = async (is_active: boolean) => {
        setIsLoading(true);
        try {
            for (const id of selectedIds) {
                const item = activeTab === 'collection' 
                    ? collections.find(c => c.id === id) 
                    : categories.find(c => c.id === id);
                if (!item) continue;
                
                const url = activeTab === 'collection' ? `/admin/collections/${id}` : `/admin/categories/${id}`;
                const data = new FormData();
                data.append('name', item.name);
                data.append('is_active', is_active ? '1' : '0');
                data.append('_method', 'PUT');
                await api.post(url, data);
            }
            showToast('Status updated successfully', 'success');
            setSelectedIds([]);
            fetchCategories();
        } catch (error) {
            console.error('Bulk status update failed', error);
            showToast('Failed to update status on some items', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortedItems = () => {
        const sorted = [...filteredItems];
        
        sorted.sort((a, b) => {
            let valA: any = '';
            let valB: any = '';

            if (sortField === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else if (sortField === 'slug') {
                valA = a.slug.toLowerCase();
                valB = b.slug.toLowerCase();
            } else if (sortField === 'products_count') {
                if (activeTab === 'collection') {
                    valA = a.products_count ?? 0;
                    valB = b.products_count ?? 0;
                } else if (activeTab === 'category') {
                    valA = a.products_count ?? 0;
                    valB = b.products_count ?? 0;
                } else {
                    valA = (a as Category).concern_products_count ?? 0;
                    valB = (b as Category).concern_products_count ?? 0;
                }
            } else if (sortField === 'status') {
                valA = a.is_active ? 1 : 0;
                valB = b.is_active ? 1 : 0;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-[0.5px] border-black/50 dark:border-gray-800">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Database size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                                <Layers size={20} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Master Catalog Data
                            </h1>
                        </div>
                        <p className="text-gray-550 dark:text-gray-400 max-w-xl font-normal text-xs">
                            Manage Product Categories, Medical Concerns, and special Promotion Collections across the store layout.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleInitDB}
                            disabled={isInitializingDb}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 border-[0.5px] border-black/50 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-[10px] font-semibold text-xs hover:bg-neutral-50 dark:hover:bg-gray-750 transition-all disabled:opacity-50"
                            title="Initialize collections database tables and run migrations"
                        >
                            {isInitializingDb ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <Database size={16} className="text-gray-400" />
                            )}
                            Initialize Collections Database
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-[10px] font-semibold hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all text-xs"
                        >
                            <Plus size={18} />
                            Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </button>
                    </div>
                </div>
            </div>

            {/* Card-based Navigation Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { type: 'category', label: 'Product Categories', count: categories.filter(c => c.type === 'category').length, desc: 'Manage catalog categories & hierarchies' },
                    { type: 'concern', label: 'Shop by Concern', count: categories.filter(c => c.type === 'concern').length, desc: 'Manage health/medical concern categories' },
                    { type: 'collection', label: 'Page Collections', count: collections.length, desc: 'Manage promotional groups & product sets' }
                ].map((item) => (
                    <button
                        key={item.type}
                        type="button"
                        onClick={() => setActiveTab(item.type as TabType)}
                        className={`flex flex-col text-left p-4 rounded-[10px] border-[0.5px] transition-all cursor-pointer ${
                            activeTab === item.type
                                ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                : 'border-black/50 bg-white hover:bg-neutral-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-850 text-gray-800 dark:text-gray-250'
                        }`}
                    >
                        <span className="text-[10px] font-semibold tracking-wider opacity-60">Section</span>
                        <span className="text-sm font-bold tracking-tight mt-1">{item.label}</span>
                        <span className={`text-[11px] mt-2 ${activeTab === item.type ? 'text-white/80' : 'text-gray-550'}`}>{item.desc}</span>
                    </button>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab === 'category' ? 'categories' : activeTab === 'concern' ? 'concerns' : 'collections'} by name...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-white dark:bg-gray-900 border-[0.5px] border-black/50 dark:border-gray-800 rounded-lg text-xs font-normal text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
            </div>

            {/* Diagnostics Panel Collapsible */}
            <details className="group bg-neutral-50/50 dark:bg-gray-850 border-[0.5px] border-black/50 dark:border-gray-800 rounded-lg">
                <summary className="flex justify-between items-center px-4 py-2.5 text-xs font-semibold text-gray-500 tracking-wide cursor-pointer select-none outline-none">
                    <span>System Diagnostics</span>
                    <span className="text-[10px] font-mono group-open:hidden">Show</span>
                    <span className="text-[10px] font-mono hidden group-open:inline">Hide</span>
                </summary>
                <div className="px-4 pb-4 pt-2 text-[10px] font-mono grid grid-cols-2 md:grid-cols-4 gap-4 border-t-[0.5px] border-black/50 text-gray-500">
                    <p>Auth Loading: {String(authLoading)}</p>
                    <p>User Logged In: {String(!!user)}</p>
                    <p>Is Loading Data: {String(isLoading)}</p>
                    <p>Error: <span className="text-red-500">{error || 'None'}</span></p>
                    <p>Total Categories: {categories.length}</p>
                    <p>Total Collections: {collections.length}</p>
                    <button onClick={fetchCategories} className="px-2.5 py-1 bg-white border-[0.5px] border-black/50 text-gray-650 rounded-md font-semibold hover:bg-neutral-50 transition-colors w-fit">Force Refresh</button>
                </div>
            </details>

            {/* Grid List with skeleton states */}
            {isLoading ? (
                <div className="bg-white dark:bg-gray-900 border-[0.5px] border-black/50 dark:border-gray-800 rounded-[10px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-[0.5px] border-black/50 bg-neutral-50/50 dark:bg-gray-850/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4 w-12 text-center">
                                        <div className="w-4 h-4 bg-neutral-100 rounded animate-pulse mx-auto" />
                                    </th>
                                    <th className="px-6 py-4">Item Details</th>
                                    <th className="px-6 py-4">Slug</th>
                                    {activeTab !== 'collection' && <th className="px-6 py-4">Hierarchy / Group</th>}
                                    <th className="px-6 py-4">Product Count</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-[0.5px] divide-black/50 dark:divide-gray-800 text-xs">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4 text-center">
                                            <div className="w-4 h-4 bg-neutral-100 dark:bg-gray-800 rounded mx-auto" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-gray-850 shrink-0" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-3.5 bg-neutral-100 dark:bg-gray-800 rounded w-24" />
                                                    <div className="h-3 bg-neutral-100/60 dark:bg-gray-800/60 rounded w-36" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3 bg-neutral-100 dark:bg-gray-800 rounded w-16" />
                                        </td>
                                        {activeTab !== 'collection' && (
                                            <td className="px-6 py-4">
                                                <div className="h-3 bg-neutral-100 dark:bg-gray-800 rounded w-28" />
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-neutral-100 dark:bg-gray-800 rounded w-12" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-16 h-5 bg-neutral-100 dark:bg-gray-800 rounded-full" />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <div className="w-6 h-6 bg-neutral-100 dark:bg-gray-800 rounded-lg" />
                                                <div className="w-6 h-6 bg-neutral-100 dark:bg-gray-800 rounded-lg" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 border-[0.5px] border-black/50 dark:border-gray-800 rounded-[10px] overflow-hidden shadow-sm">
                    {/* Bulk Actions Bar */}
                    {selectedIds.length > 0 && (
                        <div className="bg-[#052326]/5 border-b border-black/50 dark:border-gray-800 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                                <span className="text-xs font-bold text-[#052326]">
                                    {selectedIds.length} items selected
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleBulkStatusChange(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2E7D32]/10 border border-[#2E7D32]/20 hover:bg-[#2E7D32]/25 text-[#2E7D32] rounded-[8px] text-[11px] font-extrabold uppercase transition-colors"
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => handleBulkStatusChange(false)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-gray-700 rounded-[8px] text-[11px] font-extrabold uppercase transition-colors border border-black/5"
                                >
                                    Deactivate
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-[8px] text-[11px] font-extrabold uppercase transition-colors border border-red-200"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="text-xs text-gray-400 hover:text-gray-650 font-semibold px-2"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-[0.5px] border-black/50 bg-neutral-50/50 dark:bg-gray-850/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length > 0 && selectedIds.length === filteredItems.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedIds(filteredItems.map(item => item.id));
                                                } else {
                                                    setSelectedIds([]);
                                                }
                                            }}
                                            className="w-4 h-4 rounded-[3px] border-black/50 text-black focus:ring-black/10 cursor-pointer"
                                        />
                                    </th>
                                    <th 
                                        className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 select-none transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Item Details
                                            {sortField === 'name' ? (
                                                sortDirection === 'asc' ? <ChevronUp size={14} className="text-[#2E7D32]" /> : <ChevronDown size={14} className="text-[#2E7D32]" />
                                            ) : (
                                                <ArrowUpDown size={12} className="text-gray-300 hover:text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 select-none transition-colors"
                                        onClick={() => handleSort('slug')}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Slug
                                            {sortField === 'slug' ? (
                                                sortDirection === 'asc' ? <ChevronUp size={14} className="text-[#2E7D32]" /> : <ChevronDown size={14} className="text-[#2E7D32]" />
                                            ) : (
                                                <ArrowUpDown size={12} className="text-gray-300 hover:text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                    {activeTab !== 'collection' && <th className="px-6 py-4">Hierarchy / Group</th>}
                                    <th 
                                        className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 select-none transition-colors"
                                        onClick={() => handleSort('products_count')}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Product Count
                                            {sortField === 'products_count' ? (
                                                sortDirection === 'asc' ? <ChevronUp size={14} className="text-[#2E7D32]" /> : <ChevronDown size={14} className="text-[#2E7D32]" />
                                            ) : (
                                                <ArrowUpDown size={12} className="text-gray-300 hover:text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 select-none transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            Status
                                            {sortField === 'status' ? (
                                                sortDirection === 'asc' ? <ChevronUp size={14} className="text-[#2E7D32]" /> : <ChevronDown size={14} className="text-[#2E7D32]" />
                                            ) : (
                                                <ArrowUpDown size={12} className="text-gray-300 hover:text-gray-400" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-[0.5px] divide-black/50 dark:divide-gray-800 text-xs">
                                {getSortedItems().map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    const getImageUrl = (path?: string) => {
                                        if (!path) return '';
                                        if (path.startsWith('http')) return path;
                                        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                                        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
                                    };

                                    return (
                                        <tr 
                                            key={item.id}
                                            className={`hover:bg-neutral-50/40 dark:hover:bg-gray-850/20 transition-colors ${
                                                isSelected ? 'bg-neutral-50/50 dark:bg-gray-850/10' : ''
                                            }`}
                                        >
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedIds(prev => [...prev, item.id]);
                                                        } else {
                                                            setSelectedIds(prev => prev.filter(id => id !== item.id));
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded-[3px] border-black/50 text-black focus:ring-black/10 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {item.image ? (
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-black/8 shrink-0 bg-neutral-100 flex items-center justify-center">
                                                            <img 
                                                                src={getImageUrl(item.image)} 
                                                                alt={item.name} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-black/8 bg-neutral-100 dark:bg-neutral-800 text-gray-500 shrink-0">
                                                            {activeTab !== 'collection' && (item as Category).icon ? (
                                                                <span className="text-lg">{(item as Category).icon}</span>
                                                            ) : (
                                                                <Folder size={16} />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white text-xs">{item.name}</div>
                                                        {item.description && (
                                                            <div className="text-[11px] text-gray-400 font-light truncate max-w-[240px] mt-0.5" title={item.description}>
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[11px] text-gray-400">
                                                /{item.slug}
                                            </td>
                                            {activeTab !== 'collection' && (
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {(item as Category).parent_id ? (
                                                            <div className="text-[11px] font-semibold text-gray-550 flex items-center gap-1">
                                                                <FolderOpen size={10} />
                                                                Parent ID: {(item as Category).parent_id}
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-gray-400 font-medium">Top Level</div>
                                                        )}
                                                        {(item as Category).mega_menu_section ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[9px] text-[#2E7D32] font-bold uppercase tracking-wider">
                                                                Section: {(item as Category).mega_menu_section}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-neutral-100 text-[9px] text-gray-400 font-bold uppercase tracking-wider border border-black/5">
                                                                Ungrouped
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                {activeTab === 'collection' ? (
                                                    <span className="text-[11px] font-bold text-gray-500">
                                                        {item.products_count ?? 0} Products
                                                    </span>
                                                ) : activeTab === 'category' ? (
                                                    <span className="text-[11px] font-bold text-[#2E7D32] bg-[#2E7D32]/5 px-2 py-1 rounded-[6px]">
                                                        {(item as Category).products_count ?? 0} Products
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-[6px]">
                                                        {(item as Category).concern_products_count ?? 0} Products
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const url = activeTab === 'collection' ? `/admin/collections/${item.id}` : `/admin/categories/${item.id}`;
                                                            const data = new FormData();
                                                            data.append('name', item.name);
                                                            data.append('is_active', item.is_active ? '0' : '1');
                                                            data.append('_method', 'PUT');
                                                            await api.post(url, data);
                                                            showToast('Status updated successfully', 'success');
                                                            fetchCategories();
                                                        } catch (err) {
                                                            showToast('Failed to update status', 'error');
                                                        }
                                                    }}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border transition-all cursor-pointer ${
                                                        item.is_active 
                                                            ? 'bg-green-50/50 border-green-200 text-green-700 hover:bg-green-100/50' 
                                                            : 'bg-neutral-100 border-neutral-200 text-gray-400 hover:bg-neutral-200'
                                                    }`}
                                                >
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleOpenModal(item)}
                                                        className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-black/50 max-w-md w-full overflow-hidden">
                        <div className="p-4 border-b-[0.5px] border-black/50 flex justify-between items-center bg-neutral-50 dark:bg-gray-850/50">
                            <h2 className="font-semibold text-sm text-gray-955 dark:text-white">
                                {editingItem ? 'Edit' : 'Add'} {activeTab === 'category' ? 'Category' : activeTab === 'concern' ? 'Concern' : 'Collection'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-10 px-3 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-semibold text-gray-900 dark:text-white transition-all"
                                />
                            </div>

                            {activeTab !== 'collection' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-550 mb-1">Parent Category</label>
                                        <select
                                            value={formData.parent_id}
                                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                            className="w-full h-10 px-3 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-semibold text-gray-950 dark:text-gray-100 transition-all cursor-pointer"
                                        >
                                            <option value="">None (Top Level)</option>
                                            {parentOptions.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-550 mb-1">Icon (Emoji/Text)</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="e.g. 🌿"
                                            className="w-full h-10 px-3 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-semibold text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-semibold text-gray-555 mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null })}
                                    className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-[0.5px] file:border-neutral-950/15 file:text-xs file:font-semibold file:bg-neutral-50 file:text-black hover:file:bg-neutral-100"
                                />
                                {editingItem?.image && !formData.image && (
                                    <p className="text-[10px] text-gray-550 mt-1">Current: {editingItem.image.split('/').pop()}</p>
                                )}
                            </div>

                            {activeTab !== 'collection' && (
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-555 mb-1">Sub Heading</label>
                                    <input
                                        type="text"
                                        value={formData.sub_heading}
                                        onChange={(e) => setFormData({ ...formData, sub_heading: e.target.value })}
                                        className="w-full h-10 px-3 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-semibold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-semibold text-gray-555 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-normal text-gray-750 dark:text-gray-300 resize-none transition-all leading-relaxed"
                                />
                            </div>

                            {activeTab !== 'collection' && (
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-555 mb-1">Bottom Description (SEO)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.bottom_description}
                                        onChange={(e) => setFormData({ ...formData, bottom_description: e.target.value })}
                                        className="w-full p-3 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-normal text-gray-750 dark:text-gray-300 resize-none transition-all leading-relaxed"
                                    />
                                </div>
                            )}

                            {/* Products checklist for collections */}
                            {activeTab === 'collection' && (
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-semibold text-gray-555">Select Products for this Collection</label>
                                    <div className="border-[0.5px] border-black/50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-neutral-50/50">
                                        {productsList.map((product) => {
                                            const isChecked = formData.product_ids.includes(product.id);
                                            return (
                                                <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-neutral-100 p-1.5 rounded transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...formData.product_ids, product.id]
                                                                : formData.product_ids.filter(id => id !== product.id);
                                                            setFormData({ ...formData, product_ids: newIds });
                                                        }}
                                                        className="w-4 h-4 rounded-[3px] border-black/50 text-black focus:ring-black/10"
                                                    />
                                                    <div className="text-xs">
                                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{product.title}</span>
                                                        <span className="text-gray-500 ml-2">₹{product.price} ({product.brand?.name || 'Generic'})</span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                        {productsList.length === 0 && (
                                            <p className="text-xs text-gray-500 text-center py-4">No published products available.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab !== 'collection' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50/30 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="checkbox"
                                            id="show_in_mega_menu"
                                            checked={formData.show_in_mega_menu}
                                            onChange={(e) => setFormData({ ...formData, show_in_mega_menu: e.target.checked })}
                                            className="w-4 h-4 rounded-[3px] border-black/50 text-black focus:ring-black/10"
                                        />
                                        <label htmlFor="show_in_mega_menu" className="text-xs font-semibold text-gray-700">Show In Mega Menu</label>
                                    </div>

                                    {formData.show_in_mega_menu && (
                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-550 mb-1">Mega Menu Section</label>
                                            <select
                                                value={formData.mega_menu_section}
                                                onChange={(e) => setFormData({ ...formData, mega_menu_section: e.target.value })}
                                                className="w-full h-10 px-3 border-[0.5px] border-black/50 rounded-lg bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-semibold text-gray-950 dark:text-gray-100 transition-all cursor-pointer"
                                            >
                                                <option value="">None (Don't Group)</option>
                                                {activeTab === 'category' ? (
                                                    <>
                                                        <option value="thc">Medical Cannabis THC</option>
                                                        <option value="cbd">CBD & Hemp Products</option>
                                                        <option value="herbal">Herbal & Ayurveda</option>
                                                        <option value="supplements">Supplements & Wellness</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="mental">Mental Wellness</option>
                                                        <option value="physical">Physical & Pain Relief</option>
                                                        <option value="general">General & Skin Health</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded-[3px] border-black/50 text-black focus:ring-black/10"
                                />
                                <label htmlFor="is_active" className="text-xs font-semibold text-gray-700">Active</label>
                            </div>

                            <div className="pt-3 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-10 border-[0.5px] border-black/50 text-gray-750 font-semibold rounded-lg hover:bg-neutral-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 h-10 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
