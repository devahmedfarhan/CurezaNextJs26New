'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, FolderOpen, Search, X, Loader2, Layers, Database } from 'lucide-react';
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Database size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cureza-green/10 rounded-2xl text-cureza-green">
                                <Layers size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Master <span className="text-cureza-green">Catalog Data</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-medium">
                            Manage Product Categories, Medical Concerns, and special Promotion Collections across the store layout.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleInitDB}
                            disabled={isInitializingDb}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-2xl font-black text-xs hover:bg-gray-50 dark:hover:bg-gray-750 transition-all disabled:opacity-50"
                            title="Initialize collections database tables and run migrations"
                        >
                            {isInitializingDb ? (
                                <Loader2 className="animate-spin text-cureza-green" size={16} />
                            ) : (
                                <Database size={16} className="text-gray-400" />
                            )}
                            INIT COLLECTIONS DB
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-2 bg-cureza-green text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-green-100 dark:shadow-none hover:bg-green-700 transition-all active:scale-95 text-xs"
                        >
                            <Plus size={18} />
                            ADD {activeTab.toUpperCase()}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 dark:border-gray-800">
                <nav className="-mb-px flex space-x-8">
                    {(['category', 'concern', 'collection'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 border-b-2 font-black text-xs uppercase tracking-wider transition-all ${
                                activeTab === tab
                                    ? 'border-cureza-green text-cureza-green'
                                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            {tab === 'category' ? 'Product Categories' : tab === 'concern' ? 'Shop by Concern' : 'Page Collections'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Search and Filters */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab === 'category' ? 'categories' : activeTab === 'concern' ? 'concerns' : 'collections'} by name...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl font-bold text-sm text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                />
            </div>

            {/* Diagnostics Panel Collapsible */}
            <details className="group bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-2xl">
                <summary className="flex justify-between items-center px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none outline-none">
                    <span>System Diagnostics</span>
                    <span className="text-[10px] text-cureza-green font-mono group-open:hidden">SHOW</span>
                    <span className="text-[10px] text-gray-400 font-mono hidden group-open:inline">HIDE</span>
                </summary>
                <div className="px-6 pb-6 pt-2 text-[10px] font-mono grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100/50 dark:border-gray-800/50 text-gray-500">
                    <p>Auth Loading: {String(authLoading)}</p>
                    <p>User Logged In: {String(!!user)}</p>
                    <p>Is Loading Data: {String(isLoading)}</p>
                    <p>Error: <span className="text-red-500">{error || 'None'}</span></p>
                    <p>Total Categories: {categories.length}</p>
                    <p>Total Collections: {collections.length}</p>
                    <button onClick={fetchCategories} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-md font-bold hover:bg-gray-50 transition-colors w-fit">Force Refresh</button>
                </div>
            </details>

            {/* Grid List with skeleton states */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 space-y-4 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-2/3" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-md w-1/3" />
                                </div>
                            </div>
                            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 hover:shadow-xl hover:border-cureza-green/20 transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                                            activeTab === 'category' 
                                                ? 'bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 border-blue-100/50 dark:border-blue-900/20' 
                                                : activeTab === 'concern' 
                                                ? 'bg-purple-50/50 dark:bg-purple-950/20 text-purple-600 border-purple-100/50 dark:border-purple-900/20' 
                                                : 'bg-emerald-50/50 dark:bg-emerald-950/20 text-cureza-green border-emerald-100/50 dark:border-emerald-900/20'
                                        }`}>
                                            {activeTab !== 'collection' && (item as Category).icon ? (
                                                <span className="text-xl leading-none">{(item as Category).icon}</span>
                                            ) : activeTab === 'collection' ? (
                                                <Layers size={20} />
                                            ) : (
                                                <Folder size={20} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-outfit font-extrabold text-base text-gray-950 dark:text-gray-100 tracking-tight truncate uppercase leading-tight" title={item.name}>
                                                {item.name}
                                            </h3>
                                            <p className="text-[11px] font-bold text-gray-400 tracking-wider truncate">/{item.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="p-2 text-gray-400 hover:text-cureza-green hover:bg-green-50 dark:hover:bg-green-950/20 rounded-xl transition-all"
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                {item.description && (
                                    <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                    item.is_active 
                                        ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-100/50 dark:border-green-900/30' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                }`}>
                                    {item.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {activeTab === 'collection' && (
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        {item.products_count ?? 0} Products
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-md text-gray-200">
                                <Layers size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">No items found</h3>
                                <p className="text-gray-400 text-xs font-medium max-w-xs">There are no matches for "{searchQuery}". Create a new item to populate the database.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg">
                                {editingItem ? 'Edit' : 'Add'} {activeTab === 'category' ? 'Category' : activeTab === 'concern' ? 'Concern' : 'Collection'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                />
                            </div>

                            {activeTab !== 'collection' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                                        <select
                                            value={formData.parent_id}
                                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                        >
                                            <option value="">None (Top Level)</option>
                                            {parentOptions.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji/Text)</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="e.g. 🌿"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null })}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-cureza-green hover:file:bg-green-100"
                                />
                                {editingItem?.image && !formData.image && (
                                    <p className="text-xs text-gray-500 mt-1">Current: {editingItem.image.split('/').pop()}</p>
                                )}
                            </div>

                            {activeTab !== 'collection' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Heading</label>
                                    <input
                                        type="text"
                                        value={formData.sub_heading}
                                        onChange={(e) => setFormData({ ...formData, sub_heading: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                />
                            </div>

                            {activeTab !== 'collection' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bottom Description (SEO)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.bottom_description}
                                        onChange={(e) => setFormData({ ...formData, bottom_description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                    />
                                </div>
                            )}

                            {/* Products checklist for collections */}
                            {activeTab === 'collection' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Select Products for this Collection</label>
                                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50/50">
                                        {productsList.map((product) => {
                                            const isChecked = formData.product_ids.includes(product.id);
                                            return (
                                                <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...formData.product_ids, product.id]
                                                                : formData.product_ids.filter(id => id !== product.id);
                                                            setFormData({ ...formData, product_ids: newIds });
                                                        }}
                                                        className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green"
                                                    />
                                                    <div className="text-sm">
                                                        <span className="font-semibold text-gray-800">{product.title}</span>
                                                        <span className="text-xs text-gray-500 ml-2">₹{product.price} ({product.brand?.name || 'Generic'})</span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                        {productsList.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-4">No published products available.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
