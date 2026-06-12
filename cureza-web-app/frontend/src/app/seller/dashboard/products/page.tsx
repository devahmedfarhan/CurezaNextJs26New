'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Search, Plus, Edit2, Trash2, Loader2, Clock, 
    AlertCircle, CheckCircle, XCircle, Eye, ShoppingBag, 
    ArrowUpRight, AlertTriangle, MessageSquare 
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

// Status badge component for consistent styling
const StatusBadge = ({ status, displayStatus }: { status: string; displayStatus?: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'published':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30', dot: 'bg-emerald-500', icon: CheckCircle, label: 'Active' };
            case 'draft':
                return { bg: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/50', dot: 'bg-gray-400', icon: Clock, label: 'Draft' };
            case 'pending_approval':
                return { bg: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30', dot: 'bg-amber-500', icon: Clock, label: 'Pending Approval' };
            case 'pending_update':
                return { bg: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30', dot: 'bg-blue-500', icon: Clock, label: 'Update Pending' };
            case 'delete_requested':
                return { bg: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30', dot: 'bg-rose-500', icon: AlertCircle, label: 'Delete Requested' };
            case 'archived':
                return { bg: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50', dot: 'bg-rose-600', icon: XCircle, label: 'Rejected' };
            default:
                return { bg: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/30', dot: 'bg-gray-500', icon: AlertCircle, label: status };
        }
    };

    const config = getStatusConfig(status);
    const label = displayStatus || config.label;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${config.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {label}
        </span>
    );
};

export default function SellerProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/seller/products');
            setProducts(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: any) => {
        if (product.pending_change_request || product.status === 'pending_update') {
            showToast('This product has a pending change request. Please wait for admin review.', 'warning');
            return;
        }
        router.push(`/seller/dashboard/products/${product.id}/edit`);
    };

    const handleDeleteClick = (product: any) => {
        if (product.pending_change_request) {
            showToast('This product has a pending change request. Please wait for admin review.', 'warning');
            return;
        }
        if (product.status === 'delete_requested') {
            showToast('A delete request is already pending for this product.', 'warning');
            return;
        }
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        setDeleting(true);
        try {
            await api.delete(`/seller/products/${productToDelete.id}`);
            showToast('Delete request submitted for approval.', 'success');
            setDeleteModalOpen(false);
            setProductToDelete(null);
            fetchProducts(); // Refresh list
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to submit delete request', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const titleMatch = product.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const skuMatch = product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        
        let categoryName = '';
        if (product.category) {
            categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
        }
        const categoryMatch = categoryName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return titleMatch || skuMatch || categoryMatch;
    });

    const hasPendingAction = (product: any) => {
        return product.pending_change_request ||
            ['pending_update', 'delete_requested', 'pending_approval'].includes(product.status);
    };

    // Calculate Summary Stats
    const totalCount = products.length;
    const activeCount = products.filter(p => p.status === 'published').length;
    const pendingCount = products.filter(p => 
        ['pending_approval', 'pending_update', 'delete_requested'].includes(p.status) || p.pending_change_request
    ).length;
    const lowStockCount = products.filter(p => p.stock <= 10 || p.stock_status === 'low_stock' || p.stock === 0).length;

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-outfit font-extrabold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
                        <ShoppingBag className="text-cureza-green" size={28} />
                        My Products Catalog
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium">Manage listings, check stock availability, and monitor review statuses.</p>
                </div>
                <Link
                    href="/seller/dashboard/products/add"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-cureza-green hover:bg-green-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-100 dark:shadow-none hover:-translate-y-0.5 transition-all w-full md:w-auto"
                >
                    <Plus size={18} /> Add New Product
                </Link>
            </div>

            {/* Stats Dashboard Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Listings */}
                <div className="premium-card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:scale-[1.02] transition-all">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Listings</span>
                        <span className="text-3xl font-outfit font-black text-gray-900 dark:text-gray-100 block mt-1.5">{totalCount}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                        <ShoppingBag size={20} />
                    </div>
                </div>

                {/* Live on Shop */}
                <div className="premium-card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:scale-[1.02] transition-all">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Live on Shop</span>
                        <span className="text-3xl font-outfit font-black text-emerald-600 dark:text-emerald-400 block mt-1.5">{activeCount}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={20} />
                    </div>
                </div>

                {/* Under Review */}
                <div className="premium-card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:scale-[1.02] transition-all">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Under Review</span>
                        <span className="text-3xl font-outfit font-black text-amber-600 dark:text-amber-400 block mt-1.5">{pendingCount}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Clock size={20} />
                    </div>
                </div>

                {/* Stock Alert */}
                <div className="premium-card p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:scale-[1.02] transition-all">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Stock Alerts</span>
                        <span className="text-3xl font-outfit font-black text-rose-600 dark:text-rose-400 block mt-1.5">{lowStockCount}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={20} />
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-emerald-50/40 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-cureza-green flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-emerald-800 dark:text-emerald-300">
                        <p className="font-outfit font-bold text-gray-900 dark:text-gray-100">Marketplace Verification Process</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                            To ensure high-quality standards, newly added products and modified listings require Super Admin verification. Approved changes go live instantly.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="premium-card p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products by title, SKU, or category name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Products Table Wrapper */}
            <div className="premium-card overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl">
                {loading ? (
                    <div className="p-24 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-cureza-green" size={40} />
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Catalog...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="premium-table-header border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-gray-500">Product Details</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-gray-500 text-center">Price</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-gray-500 text-center">Stock</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-all">
                                            {/* Details cell */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-800 group-hover:scale-105 transition-transform flex items-center justify-center">
                                                        {product.image ? (
                                                            <img 
                                                                src={product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${product.image}`} 
                                                                alt="" 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        ) : (
                                                            <span className="text-xl">📦</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-outfit font-extrabold text-gray-900 dark:text-gray-100 block text-base group-hover:text-cureza-green transition-colors">{product.title}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                                                                {typeof product.category === 'object' ? product.category?.name : product.category}
                                                            </span>
                                                            {product.sku && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.sku}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Rejection / Note reasons support */}
                                                        {product.status === 'archived' && (product.rejection_reason || product.admin_note) && (
                                                            <div className="mt-2 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100/30 rounded-lg p-2.5 flex items-start gap-2 max-w-md animate-in fade-in">
                                                                <MessageSquare className="text-rose-500 flex-shrink-0 mt-0.5" size={13} />
                                                                <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed font-semibold">
                                                                    <span className="uppercase text-[9px] font-black block text-rose-500 mb-0.5">Rejection Note:</span>
                                                                    {product.rejection_reason || product.admin_note}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Pending request badge */}
                                                        {product.pending_change_request && (
                                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-2 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded border border-blue-100/30 inline-block">
                                                                {product.pending_change_request.change_type === 'edit' ? '📝 Edit pending approval' :
                                                                    product.pending_change_request.change_type === 'delete' ? '🗑️ Delete request pending' : '⏳ Pending review'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Price Cell */}
                                            <td className="px-8 py-6 text-center font-outfit font-extrabold text-gray-900 dark:text-gray-100 text-base">
                                                ₹{product.price}
                                            </td>

                                            {/* Stock Cell */}
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-outfit font-black text-lg ${
                                                        product.stock === 0 ? 'text-rose-600' :
                                                        product.stock <= 10 ? 'text-amber-500' : 'text-emerald-600'
                                                    }`}>
                                                        {product.stock}
                                                    </span>
                                                    <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider mt-0.5">Available</span>
                                                    
                                                    {/* Visual mini stock bar */}
                                                    <div className="w-12 h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${
                                                                product.stock === 0 ? 'bg-rose-500 w-0' :
                                                                product.stock <= 10 ? 'bg-amber-500 w-1/3' : 'bg-emerald-500 w-full'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-8 py-6">
                                                <StatusBadge
                                                    status={product.status}
                                                    displayStatus={product.display_status}
                                                />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    {/* View live store link */}
                                                    <Link
                                                        href={`/product/${product.slug || product.id}`}
                                                        target="_blank"
                                                        className="p-2 text-gray-400 hover:text-cureza-green hover:bg-cureza-green-50/40 rounded-xl transition-all"
                                                        title="View Live Store Page"
                                                    >
                                                        <Eye size={17} />
                                                    </Link>

                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        disabled={hasPendingAction(product)}
                                                        className={`p-2 rounded-xl transition-all ${
                                                            hasPendingAction(product)
                                                                ? 'text-gray-200 dark:text-gray-800 cursor-not-allowed'
                                                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                                                        }`}
                                                        title={hasPendingAction(product) ? 'Under review - cannot edit' : 'Edit Listing'}
                                                    >
                                                        <Edit2 size={17} />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDeleteClick(product)}
                                                        disabled={hasPendingAction(product)}
                                                        className={`p-2 rounded-xl transition-all ${
                                                            hasPendingAction(product)
                                                                ? 'text-gray-200 dark:text-gray-800 cursor-not-allowed'
                                                                : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                                                        }`}
                                                        title={hasPendingAction(product) ? 'Under review - cannot delete' : 'Request Delete'}
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <ShoppingBag className="text-gray-300 dark:text-gray-700" size={48} />
                                                <span className="text-base font-outfit font-bold text-gray-700 dark:text-gray-300">
                                                    {searchTerm ? 'No products matched search term.' : 'Your catalog is currently empty.'}
                                                </span>
                                                <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                                                    {searchTerm ? 'Try checking your search spelling or looking for alternative words.' : 'Get started by creating your first product. It will undergo quick review and then go live.'}
                                                </p>
                                                {!searchTerm && (
                                                    <Link 
                                                        href="/seller/dashboard/products/add"
                                                        className="px-4 py-2 bg-cureza-green text-white font-bold text-xs rounded-xl shadow-md hover:bg-green-700 transition-all mt-2"
                                                    >
                                                        Create Product
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-7 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl text-rose-600 dark:text-rose-400">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-outfit font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Request Deletion</h3>
                                <span className="text-[10px] text-rose-500 font-extrabold tracking-wider uppercase">Action Required Review</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3 font-medium">
                            Are you sure you want to request deletion of <strong className="text-gray-900 dark:text-gray-100 font-bold">"{productToDelete?.title}"</strong>?
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed mb-6 font-medium">
                            This will submit a delete request to the Super Admin. The listing remains visible on store shelves until approved.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setProductToDelete(null);
                                }}
                                className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xs rounded-xl transition-all"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-100 dark:shadow-none hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                {deleting && <Loader2 size={14} className="animate-spin" />}
                                {deleting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
