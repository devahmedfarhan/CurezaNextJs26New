'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Eye, Download, Upload, Check, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/imageHelper';

export default function AdminProductsPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'changes'>('all');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [pendingChangeCount, setPendingChangeCount] = useState(0);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Search debouncing
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Reset page to 1 on tab or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, debouncedSearchTerm]);

    // Fetch products on dependency updates
    useEffect(() => {
        if (activeTab !== 'changes') {
            fetchProducts(currentPage);
        }
    }, [activeTab, currentPage, debouncedSearchTerm]);

    useEffect(() => {
        // Fetch pending change request count
        const fetchChangeCount = async () => {
            try {
                const res = await api.get('/admin/change-requests/stats');
                setPendingChangeCount(res.data.pending || 0);
            } catch (error) {
                console.error(error);
            }
        };
        fetchChangeCount();
    }, []);

    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            let res;
            const searchParam = debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : '';
            if (activeTab === 'all') {
                res = await api.get(`/admin/products/all?page=${page}${searchParam}`);
            } else {
                res = await api.get(`/admin/products/pending?page=${page}${searchParam}`);
            }

            // Handle paginated response
            if (res.data && res.data.data !== undefined) {
                setProducts(res.data.data);
                setCurrentPage(res.data.current_page || 1);
                setTotalPages(res.data.last_page || 1);
                setTotalItems(res.data.total || 0);
            } else {
                setProducts(res.data || []);
                setCurrentPage(1);
                setTotalPages(1);
                setTotalItems(res.data ? res.data.length : 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/admin/products/${id}/approve`);
            // alert('Product Approved Successfully');
            fetchProducts(currentPage); // Refresh list
        } catch (error) {
            console.error('Approve failed', error);
            alert('Failed to approve product. Please check console.');
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Are you sure you want to reject this product?')) return;
        try {
            await api.post(`/admin/products/${id}/reject`);
            fetchProducts(currentPage); // Refresh list
        } catch (error) {
            console.error('Reject failed', error);
            alert('Failed to reject product.');
        }
    };

    const handleView = (id: number) => {
        window.location.href = `/superadmin/dashboard/products/${id}`;
    };

    const handleEdit = (id: number) => {
        // Navigate to edit page
        window.location.href = `/superadmin/dashboard/products/${id}/edit`;
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/products/${id}`);
            // alert('Product Deleted Successfully');
            fetchProducts(currentPage);
        } catch (error) {
            console.error('Delete failed', error);
            alert('Failed to delete product.');
        }
    };

    const filteredProducts = products;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Plus size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-cureza-green/10 rounded-2xl text-cureza-green">
                                <Plus size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Product <span className="text-cureza-green">Catalog</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-medium">
                            Manage your global e-commerce listings, merchant inventory, status verifications, and approvals.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link 
                            href="/superadmin/dashboard/products/bulk" 
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-2xl font-black text-xs hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm"
                        >
                            <Upload size={16} className="text-gray-400" />
                            BULK IMPORT
                        </Link>
                        <Link 
                            href="/superadmin/dashboard/products/create" 
                            className="flex items-center justify-center gap-2 bg-cureza-green text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-green-100 dark:shadow-none hover:bg-green-700 transition-all active:scale-95 text-xs uppercase"
                        >
                            <Plus size={18} />
                            Add Product
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 dark:border-gray-800">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`py-4 px-1 border-b-2 font-black text-xs uppercase tracking-wider transition-all ${
                            activeTab === 'all'
                                ? 'border-cureza-green text-cureza-green'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        All Products
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`py-4 px-1 border-b-2 font-black text-xs uppercase tracking-wider transition-all ${
                            activeTab === 'pending'
                                ? 'border-cureza-green text-cureza-green'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        Pending Approvals
                    </button>
                    <Link
                        href="/superadmin/dashboard/products/change-requests"
                        className={`py-4 px-1 border-b-2 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                            activeTab === 'changes'
                                ? 'border-cureza-green text-cureza-green'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                        }`}
                    >
                        Change Requests
                        {pendingChangeCount > 0 && (
                            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full leading-none">
                                {pendingChangeCount}
                            </span>
                        )}
                    </Link>
                </nav>
            </div>

            {/* Search and Filters */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl font-bold text-sm text-gray-900 dark:text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green transition-all"
                    placeholder="Search products by title or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Products List Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                            <thead className="bg-gray-50/50 dark:bg-gray-850/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                                {[1, 2, 3].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-md w-32" />
                                                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-md w-16" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-md w-20" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-md w-14" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-md w-16" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-md w-16" />
                                        </td>
                                        <td className="px-6 py-4" />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                <thead className="bg-gray-50/50 dark:bg-gray-850/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Seller</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-850 font-bold text-sm">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex items-center justify-center text-gray-400">
                                                            {product.image ? (
                                                                <img src={getImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-[10px] uppercase font-black">Img</span>
                                                            )}
                                                        </div>
                                                        <div className="ml-4 min-w-0">
                                                            <div className="text-gray-950 dark:text-gray-100 truncate max-w-[200px]" title={product.title}>{product.title}</div>
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-0.5">ID: PRD-{product.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 font-medium">
                                                    {product.category?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 font-medium">
                                                    {product.seller?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-950 dark:text-white font-extrabold">
                                                    ₹{parseFloat(product.price).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase tracking-wider rounded-full border ${
                                                        product.stock > 10 
                                                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-100/50 dark:border-green-900/20' 
                                                            : product.stock > 0 
                                                            ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-100/50 dark:border-yellow-900/20' 
                                                            : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-100/50 dark:border-red-900/20'
                                                    }`}>
                                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase tracking-wider rounded-full border ${
                                                        product.status === 'published' || product.status === 'approved'
                                                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-100/50 dark:border-green-900/20' 
                                                            : product.status === 'pending' || product.status === 'pending_approval' || product.status === 'pending_update'
                                                            ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-100/50 dark:border-yellow-900/20' 
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                                                    }`}>
                                                        {product.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                                        {activeTab === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(product.id)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-xl transition-all"
                                                                    title="Approve Submission"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(product.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                                                                    title="Reject Submission"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleView(product.id)}
                                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl transition-all"
                                                            title="View details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(product.id)}
                                                            className="p-2 text-gray-400 hover:text-cureza-green hover:bg-green-50 dark:hover:bg-green-950/20 rounded-xl transition-all"
                                                            title="Edit Details"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-full text-gray-300">
                                                        <Plus size={40} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">No products found</p>
                                                        <p className="text-sm text-gray-500 max-w-xs">Register your first system catalog product or adjust filters.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 rounded-b-3xl">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs font-black uppercase tracking-wider rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        PREV
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs font-black uppercase tracking-wider rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        NEXT
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                            Showing <span className="text-gray-900 dark:text-white">{(currentPage - 1) * 15 + 1}</span> to{' '}
                                            <span className="text-gray-900 dark:text-white">
                                                {Math.min(currentPage * 15, totalItems)}
                                            </span>{' '}
                                            of <span className="text-gray-900 dark:text-white">{totalItems}</span> listings
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px border border-gray-100 dark:border-gray-800 overflow-hidden" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-3 py-2 border-r border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <ChevronLeft size={16} />
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border-r border-gray-150 dark:border-gray-800 text-xs font-black uppercase tracking-wider transition-all ${
                                                        currentPage === page
                                                            ? 'z-10 bg-cureza-green text-white border-cureza-green'
                                                            : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-3 py-2 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Next</span>
                                                <ChevronRight size={16} />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
