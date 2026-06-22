'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit, Package, Search, X, Check, Eye, HelpCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function BundlesPage() {
    const [bundles, setBundles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const { showToast } = useToast();

    // Form Stats
    const [products, setProducts] = useState<any[]>([]);
    const [selectedBundledIds, setSelectedBundledIds] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        main_product_id: '',
        discount_percentage: 10,
        title: '',
        is_active: true
    });

    // Search filters for product lists
    const [mainSearch, setMainSearch] = useState('');
    const [bundledSearch, setBundledSearch] = useState('');

    // Fetch bundles
    useEffect(() => {
        fetchBundles();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products?limit=100');
            if (Array.isArray(res.data)) {
                setProducts(res.data);
            } else if (res.data?.data && Array.isArray(res.data.data)) {
                setProducts(res.data.data);
            } else {
                setProducts([]);
            }
        } catch (e) {
            console.error('Failed to load products', e);
            setProducts([]);
        }
    };

    const fetchBundles = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/bundles');
            if (res.data?.data) {
                setBundles(res.data.data); // Paginated response
            } else if (Array.isArray(res.data)) {
                setBundles(res.data);
            } else {
                setBundles([]);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to load bundles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getProductTitle = (id: any) => {
        if (!id) return '';
        const prod = products.find(p => p.id.toString() === id.toString());
        return prod ? prod.title : `Product #${id}`;
    };

    const getProductPrice = (id: any) => {
        if (!id) return null;
        const prod = products.find(p => p.id.toString() === id.toString());
        return prod ? prod.price : null;
    };

    const handleToggleActive = async (bundle: any) => {
        try {
            const updatedActive = !bundle.is_active;
            await api.put(`/admin/bundles/${bundle.id}`, {
                is_active: updatedActive
            });
            showToast(`Bundle status updated!`, 'success');
            // Optimistic update locally
            setBundles(prev => prev.map(b => b.id === bundle.id ? { ...b, is_active: updatedActive } : b));
        } catch (error) {
            console.error(error);
            showToast('Failed to toggle status', 'error');
        }
    };

    const handleEdit = (bundle: any) => {
        setFormData({
            main_product_id: bundle.main_product_id?.toString() || '',
            discount_percentage: bundle.discount_percentage || 10,
            title: bundle.title || '',
            is_active: bundle.is_active ?? true
        });
        
        // Parse bundled product IDs (ensure strings for comparison)
        const ids = Array.isArray(bundle.bundled_product_ids) 
            ? bundle.bundled_product_ids.map((id: any) => id.toString())
            : [];
        setSelectedBundledIds(ids);
        
        setEditId(bundle.id);
        setIsEditing(true);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this bundle?')) return;
        try {
            await api.delete(`/admin/bundles/${id}`);
            showToast('Bundle deleted successfully!', 'success');
            fetchBundles();
        } catch (error) {
            console.error(error);
            showToast('Failed to delete bundle', 'error');
        }
    };

    const handleSave = async () => {
        if (!formData.main_product_id) {
            return showToast("Please select a main product", "error");
        }
        if (selectedBundledIds.length === 0) {
            return showToast("Please add at least one bundled product", "error");
        }

        try {
            const payload = {
                main_product_id: parseInt(formData.main_product_id),
                bundled_product_ids: selectedBundledIds.map(id => parseInt(id)),
                discount_percentage: formData.discount_percentage,
                title: formData.title,
                is_active: formData.is_active
            };

            if (isEditing && editId) {
                await api.put(`/admin/bundles/${editId}`, payload);
                showToast("Bundle updated successfully!", "success");
            } else {
                await api.post('/admin/bundles', payload);
                showToast("Bundle created successfully!", "success");
            }

            resetForm();
            fetchBundles();
        } catch (e) {
            console.error(e);
            showToast("Failed to save bundle offer", "error");
        }
    };

    const resetForm = () => {
        setIsCreating(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
            main_product_id: '',
            discount_percentage: 10,
            title: '',
            is_active: true
        });
        setSelectedBundledIds([]);
        setMainSearch('');
        setBundledSearch('');
    };

    const addBundledId = (id: string) => {
        if (!id) return;
        if (id === formData.main_product_id) {
            return showToast("Bundled item cannot be the same as main product", "error");
        }
        if (!selectedBundledIds.includes(id)) {
            setSelectedBundledIds([...selectedBundledIds, id]);
        }
    };

    const removeBundledId = (id: string) => {
        setSelectedBundledIds(selectedBundledIds.filter(item => item !== id));
    };

    // Filtered lists for searchable dropdowns
    const filteredMainProducts = products.filter(p => 
        p.title.toLowerCase().includes(mainSearch.toLowerCase()) || 
        p.id.toString().includes(mainSearch)
    );

    const filteredBundledProducts = products.filter(p => 
        (p.title.toLowerCase().includes(bundledSearch.toLowerCase()) || 
        p.id.toString().includes(bundledSearch)) &&
        p.id.toString() !== formData.main_product_id
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[10px] border-[0.35px] border-black/50">
                <div className="space-y-1.5">
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Bundle Offers</h1>
                    <p className="text-xs text-gray-500 font-normal">Configure 'Frequently Bought Together' promotional deals</p>
                </div>
                <button
                    onClick={() => {
                        if (isCreating) resetForm();
                        else setIsCreating(true);
                    }}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-[10px] hover:bg-neutral-900 transition-all font-medium text-xs"
                >
                    {isCreating ? 'Cancel' : (
                        <>
                            <Plus size={14} />
                            <span>Create New Bundle</span>
                        </>
                    )}
                </button>
            </div>

            {/* Creation / Editing Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-[10px] border-[0.35px] border-black/50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center border-b-[0.35px] border-black/50 pb-4">
                        <h3 className="font-semibold text-base text-gray-900">
                            {isEditing ? 'Edit Bundle Offer' : 'Create New Bundle Offer'}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-neutral-50 rounded-lg">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Main Product Selection with local search */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Main Product (Primary Item)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Search size={14} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search main product..."
                                    className="pl-9 pr-4 py-2 w-full border-[0.35px] border-black/50 rounded-[10px] focus:border-black text-xs font-normal outline-none"
                                    value={mainSearch}
                                    onChange={e => setMainSearch(e.target.value)}
                                />
                            </div>
                            <select
                                size={4}
                                className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 text-xs max-h-40 focus:outline-none focus:border-black bg-white"
                                value={formData.main_product_id}
                                onChange={e => {
                                    setFormData({ ...formData, main_product_id: e.target.value });
                                    // Remove from bundle list if it was there
                                    setSelectedBundledIds(selectedBundledIds.filter(id => id !== e.target.value));
                                }}
                            >
                                <option value="">-- Select Main Product --</option>
                                {filteredMainProducts.map(p => (
                                    <option key={p.id} value={p.id} className="py-1">
                                        ID {p.id} - {p.title} (₹{p.price})
                                    </option>
                                ))}
                            </select>
                            {formData.main_product_id && (
                                <div className="text-xs text-neutral-800 font-medium bg-neutral-50/50 p-2 rounded-[10px] border-[0.35px] border-black/50 flex items-center gap-1.5">
                                    <Check size={14} /> Selected: {getProductTitle(formData.main_product_id)}
                                </div>
                            )}
                        </div>

                        {/* Bundled Product Selection (Supports multiple add-ons) */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Add-on Item(s) (Discounted Bundled Products)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Search size={14} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search add-on products..."
                                    className="pl-9 pr-4 py-2 w-full border-[0.35px] border-black/50 rounded-[10px] focus:border-black text-xs font-normal outline-none"
                                    value={bundledSearch}
                                    onChange={e => setBundledSearch(e.target.value)}
                                />
                            </div>
                            <select
                                size={4}
                                className="w-full border-[0.35px] border-black/50 rounded-[10px] px-3 py-2 text-xs max-h-40 focus:outline-none focus:border-black bg-white"
                                onChange={e => {
                                    addBundledId(e.target.value);
                                    // Reset dropdown value
                                    e.target.value = "";
                                }}
                                value=""
                            >
                                <option value="">-- Click product below to add to bundle list --</option>
                                {filteredBundledProducts.map(p => (
                                    <option key={p.id} value={p.id} className="py-1">
                                        ID {p.id} - {p.title} (₹{p.price})
                                    </option>
                                ))}
                            </select>

                            {/* Selected Bundle Items Badge List */}
                            <div className="space-y-1.5 mt-3">
                                <span className="block text-[10px] font-medium text-gray-500 tracking-normal uppercase">Selected Add-ons ({selectedBundledIds.length})</span>
                                {selectedBundledIds.length === 0 ? (
                                    <div className="text-xs text-gray-400 bg-neutral-50/50 p-3 rounded-[10px] border-[0.35px] border-dashed border-black/50 text-center">
                                        No items added. Click products in list to add them.
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {selectedBundledIds.map(id => (
                                            <div key={id} className="inline-flex items-center gap-1.5 bg-neutral-50 border-[0.35px] border-black/50 text-neutral-800 px-3 py-1 rounded-[10px] text-xs font-medium">
                                                <span>{getProductTitle(id)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeBundledId(id)}
                                                    className="text-gray-450 hover:text-black p-0.5 rounded-full hover:bg-neutral-100"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Discount parameters */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Bundle Discount Percentage (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                className="w-full border-[0.35px] border-black/50 rounded-[10px] px-4 py-2.5 focus:border-black text-xs font-normal outline-none"
                                value={formData.discount_percentage}
                                onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 1 })}
                            />
                            <p className="text-[10px] text-gray-500 font-normal">Discount will be applied to the add-on products in this bundle</p>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Bundle Title (Marketing Tagline)</label>
                            <input
                                type="text"
                                className="w-full border-[0.35px] border-black/50 rounded-[10px] px-4 py-2.5 focus:border-black text-xs font-normal outline-none"
                                placeholder="e.g. Double Cleanse Kit, Skincare Duo"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Status Checkbox */}
                        <div className="flex items-center gap-2 pt-2 col-span-1 lg:col-span-2">
                            <input
                                type="checkbox"
                                id="form_is_active"
                                checked={formData.is_active}
                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded text-black focus:ring-black h-4 w-4 border-black/50"
                                style={{ borderRadius: '4px' }}
                            />
                            <label htmlFor="form_is_active" className="text-xs font-medium text-gray-700 cursor-pointer">
                                Mark bundle offer active immediately
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t-[0.35px] border-black/50 pt-4 mt-6">
                        <button
                            onClick={resetForm}
                            className="bg-neutral-50 border-[0.35px] border-black/50 text-gray-750 px-5 py-2.5 rounded-[10px] font-medium hover:bg-neutral-100 transition-colors text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-black text-white px-5 py-2.5 rounded-[10px] font-medium hover:bg-neutral-900 transition-colors text-xs"
                        >
                            {isEditing ? 'Update Bundle' : 'Save Bundle'}
                        </button>
                    </div>
                </div>
            )}

            {/* Bundles Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-3 bg-white rounded-[10px] border-[0.35px] border-black/50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-[0.5px] border-black"></div>
                    <span className="text-xs font-medium">Loading bundle promotions...</span>
                </div>
            ) : bundles.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 rounded-[10px] border-[0.35px] border-dashed border-black/50">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-semibold text-gray-900">No active bundles found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto text-xs font-normal">
                        Create bundles combining your main catalog items with matching add-on accessories at a discount.
                    </p>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="mt-6 inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-[10px] hover:bg-neutral-900 transition-all font-medium text-xs"
                    >
                        <Plus size={14} /> Create Bundle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {bundles.map((bundle) => {
                        const bundledIds = Array.isArray(bundle.bundled_product_ids) ? bundle.bundled_product_ids : [];
                        return (
                            <div 
                                key={bundle.id} 
                                className="bg-white border-[0.35px] border-black/50 rounded-[10px] overflow-hidden hover:border-black transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div className="p-6 space-y-4">
                                    {/* Card header */}
                                    <div className="flex justify-between items-start">
                                        <span className="inline-flex items-center rounded-[10px] bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800 border-[0.35px] border-black/50">
                                            {bundle.discount_percentage}% OFF Add-ons
                                        </span>
                                        <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(bundle)}
                                                className="text-gray-400 hover:text-black p-1.5 hover:bg-neutral-50 rounded-lg transition-colors border-[0.35px] border-transparent hover:border-neutral-950/10"
                                                title="Edit bundle"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(bundle.id)}
                                                className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors border-[0.35px] border-transparent hover:border-rose-500/10"
                                                title="Delete bundle"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Titles */}
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-900 group-hover:text-black transition-colors leading-tight">
                                            {bundle.title || 'Untitled Bundle Promo'}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 mt-1 font-normal">ID: #{bundle.id} • Created {new Date(bundle.created_at || Date.now()).toLocaleDateString()}</p>
                                    </div>

                                    {/* Products mapping details */}
                                    <div className="space-y-3 bg-neutral-50/50 p-4 rounded-[10px] border-[0.35px] border-black/50 text-xs font-normal">
                                        <div>
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-normal block">Primary Item</span>
                                            <span className="font-semibold text-gray-800 line-clamp-1 mt-0.5">{getProductTitle(bundle.main_product_id) || bundle.main_product?.title || `Product #${bundle.main_product_id}`}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-normal block">Bundled Add-ons ({bundledIds.length})</span>
                                            <div className="space-y-1 mt-1">
                                                {bundledIds.map((id: any) => (
                                                    <div key={id} className="text-xs text-gray-600 flex justify-between items-center bg-white px-2.5 py-1 rounded-[10px] border-[0.35px] border-black/50">
                                                        <span className="truncate font-medium max-w-[180px]">{getProductTitle(id)}</span>
                                                        {getProductPrice(id) && <span className="text-gray-500 shrink-0 font-normal">₹{getProductPrice(id)}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle Active Status footer */}
                                <div className="border-t-[0.35px] border-black/50 px-6 py-4 bg-neutral-50/50 flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Bundle Status</span>
                                    <button 
                                        onClick={() => handleToggleActive(bundle)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] font-medium transition-all border-[0.35px] ${
                                            bundle.is_active 
                                                ? 'bg-emerald-50 text-emerald-700 border-black/50 hover:bg-emerald-100/50' 
                                                : 'bg-neutral-50 text-gray-600 border-[0.35px] border-black/50 hover:bg-neutral-100'
                                        }`}
                                    >
                                        <span className={`h-1.5 w-1.5 rounded-full ${bundle.is_active ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                                        {bundle.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tutorial / Guidelines Section */}
            <div className="bg-neutral-50 border-[0.35px] border-black/50 rounded-[10px] p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-black" />
                    <h3 className="text-sm font-semibold text-gray-900">How It Works & Guidelines | Bundle Offers Setup</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600 leading-relaxed font-normal">
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">1. Select Primary & Add-on Products</h4>
                        <p>
                            Bundle banane ke liye sabse pehle ek "Main Product" select karein jo primary item hoga. Uske baad list se ek ya zyada "Add-on Items" choose karein jo customer ko sath me beche jayenge.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">2. Discount Configuration</h4>
                        <p>
                            Bundle Discount Percentage (%) field me likha hua discount sirf Add-on products par apply hoga. Main product full price par rahega aur customer ko bundle package me add-ons saste padenge.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">3. Checkout and Storefront Display</h4>
                        <p>
                            Jab customer product detail page par jayega, toh use "Frequently Bought Together" section me ye bundle aur uska total pricing dikhega. Customer single-click se pure bundle ko cart me add kar sakta hai.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
