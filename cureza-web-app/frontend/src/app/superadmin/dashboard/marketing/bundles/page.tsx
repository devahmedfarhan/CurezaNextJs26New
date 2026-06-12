'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Edit, Package } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function BundlesPage() {
    const [bundles, setBundles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const { showToast } = useToast();

    // Form Stats
    const [products, setProducts] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        main_product_id: '',
        bundled_product_id: '',
        discount_percentage: 10,
        title: ''
    });

    // Fetch bundles
    useEffect(() => {
        fetchBundles();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            // Basic product list for dropdown (this should be paginated/searchable in prod)
            const res = await api.get('/products?limit=100');
            // ProductController::index returns raw array mostly, but some API versions might paginate.
            // Let's handle both.
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
            // We use the admin endpoint
            const res = await api.get('/admin/bundles');
            setBundles(res.data.data); // Paginated response
        } catch (error) {
            console.error(error);
            showToast('Failed to load bundles', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bundle Offers</h1>
                    <p className="text-gray-500">Manage 'Frequently Bought Together' deals</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                >
                    {isCreating ? 'Cancel' : (
                        <>
                            <Plus size={16} />
                            <span>Create New Bundle</span>
                        </>
                    )}
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                    <h3 className="font-bold text-lg mb-4">Create New Bundle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Main Product</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2"
                                value={formData.main_product_id}
                                onChange={e => setFormData({ ...formData, main_product_id: e.target.value })}
                            >
                                <option value="">Select Product...</option>
                                {(products || []).map(p => <option key={p.id} value={p.id}>{p.id} - {p.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bundled Item (Offer)</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2"
                                value={formData.bundled_product_id}
                                onChange={e => setFormData({ ...formData, bundled_product_id: e.target.value })}
                            >
                                <option value="">Select Bundle Item...</option>
                                {(products || []).map(p => <option key={p.id} value={p.id}>{p.id} - {p.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg px-3 py-2"
                                value={formData.discount_percentage}
                                onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Title (Optional)</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2"
                                placeholder="e.g. Skin Care Duo"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={async () => {
                                if (!formData.main_product_id || !formData.bundled_product_id) return showToast("Select products", "error");
                                try {
                                    await api.post('/admin/bundles', {
                                        main_product_id: formData.main_product_id,
                                        bundled_product_ids: [formData.bundled_product_id],
                                        discount_percentage: formData.discount_percentage,
                                        title: formData.title,
                                        is_active: true
                                    });
                                    showToast("Bundle created!", "success");
                                    setIsCreating(false);
                                    fetchBundles();
                                } catch (e) {
                                    showToast("Failed to create", "error");
                                }
                            }}
                            className="bg-cureza-green text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700"
                        >
                            Save Bundle
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading bundles...</div>
            ) : bundles.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No active bundles</h3>
                    <p className="text-gray-500 mb-6">Create a bundle to boost your Average Order Value.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {bundles.map((bundle) => (
                        <div key={bundle.id} className="bg-white border text-card-foreground shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        {bundle.discount_percentage}% OFF
                                    </span>
                                    <div className="flex gap-2">
                                        <button className="text-gray-400 hover:text-blue-600">
                                            <Edit size={16} />
                                        </button>
                                        <button className="text-gray-400 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-lg mb-2">{bundle.title || 'Untitled Bundle'}</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Main: <span className="font-medium text-gray-900">{bundle.main_product?.title}</span>
                                </p>
                                <div className="text-xs text-gray-400">
                                    + {bundle.bundled_product_ids?.length} items bundled
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
