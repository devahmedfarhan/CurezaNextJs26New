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
        console.log('AdminPage: Auth state changed', { authLoading, user: !!user });
        if (!authLoading) {
            if (user) {
                fetchCategories();
                fetchProductsList();
            } else {
                console.log('AdminPage: No user, redirecting to login');
                window.location.href = '/login'; // Force redirect
            }
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Master Data Management</h1>
                    <p className="text-gray-500">Manage Product Categories, Concerns, and Page Collections</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleInitDB}
                        disabled={isInitializingDb}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        title="Initialize collections database tables and run migrations"
                    >
                        {isInitializingDb ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Database size={18} />
                        )}
                        Init Collections DB
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add {activeTab === 'category' ? 'Category' : activeTab === 'concern' ? 'Concern' : 'Collection'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('category')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'category'
                            ? 'border-cureza-green text-cureza-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Product Categories
                    </button>
                    <button
                        onClick={() => setActiveTab('concern')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'concern'
                            ? 'border-cureza-green text-cureza-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Shop by Concern
                    </button>
                    <button
                        onClick={() => setActiveTab('collection')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${activeTab === 'collection'
                            ? 'border-cureza-green text-cureza-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Page Collections (Offers/Sale)
                    </button>
                </nav>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab === 'category' ? 'categories' : activeTab === 'concern' ? 'concerns' : 'collections'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                />
            </div>

            {/* DEBUG PANEL */}
            <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono overflow-auto max-h-60 space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold">Diagnostics Panel</h3>
                    <button onClick={fetchCategories} className="bg-blue-500 text-white px-2 py-1 rounded">Force Refresh</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <p>Auth Loading: {String(authLoading)}</p>
                    <p>User Logged In: {String(!!user)}</p>
                    <p>Is Loading Data: {String(isLoading)}</p>
                    <p>Error: <span className="text-red-600">{error || 'None'}</span></p>
                    <p>Total Categories: {categories.length}</p>
                    <p>Total Collections: {collections.length}</p>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-cureza-green" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            activeTab === 'category' ? 'bg-blue-50 text-blue-600' :
                                            activeTab === 'concern' ? 'bg-purple-50 text-purple-600' :
                                            'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            {activeTab === 'collection' ? <Layers size={24} /> : <Folder size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                            <p className="text-xs text-gray-500">/{item.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                {item.description && (
                                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-50">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {item.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {activeTab === 'collection' && (
                                    <span className="text-xs text-gray-500 font-medium">
                                        {(item as any).products_count ?? 0} Products
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No {activeTab === 'category' ? 'categories' : activeTab === 'concern' ? 'concerns' : 'collections'} found.
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
