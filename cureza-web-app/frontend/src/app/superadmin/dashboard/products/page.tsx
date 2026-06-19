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
        window.location.href = `/superadmin/dashboard/products/${id}/edit`;
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/products/${id}`);
            fetchProducts(currentPage);
        } catch (error) {
            console.error('Delete failed', error);
            alert('Failed to delete product.');
        }
    };

    const filteredProducts = products;

    return (
        <div className="space-y-6 animate-in fade-in duration-550">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-[0.5px] border-neutral-950/15 dark:border-gray-800">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-black dark:text-white">
                                <Plus size={22} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                Product Catalog
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-medium text-xs">
                            Manage your global e-commerce listings, merchant inventory, status verifications, and approvals.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link 
                            href="/superadmin/dashboard/products/bulk" 
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 border-[0.5px] border-neutral-950/15 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-black text-xs hover:bg-gray-50 dark:hover:bg-gray-750 transition-all"
                        >
                            <Upload size={14} className="text-gray-400" />
                            Bulk Import
                        </Link>
                        <Link 
                            href="/superadmin/dashboard/products/create" 
                            className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 rounded-lg font-black hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95 text-xs"
                        >
                            <Plus size={16} />
                            Add Product
                        </Link>
                    </div>
                </div>
            </div>

            {/* Card-based Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex flex-col items-start p-5 text-left border-[0.5px] rounded-[10px] transition-all cursor-pointer ${
                        activeTab === 'all'
                            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                            : 'border-neutral-950/15 bg-white text-gray-950 hover:bg-neutral-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-850'
                    }`}
                >
                    <div className="flex justify-between items-center w-full mb-1">
                        <span className="text-xs font-bold tracking-wider">All Products</span>
                        <div className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            activeTab === 'all' ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}>
                            Catalog
                        </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${activeTab === 'all' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        Browse and manage all registered products in the system.
                    </p>
                </button>

                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex flex-col items-start p-5 text-left border-[0.5px] rounded-[10px] transition-all cursor-pointer ${
                        activeTab === 'pending'
                            ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                            : 'border-neutral-950/15 bg-white text-gray-950 hover:bg-neutral-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-850'
                    }`}
                >
                    <div className="flex justify-between items-center w-full mb-1">
                        <span className="text-xs font-bold tracking-wider">Pending Approvals</span>
                        <div className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            activeTab === 'pending' ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}>
                            Approval Required
                        </div>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${activeTab === 'pending' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        Verify and approve new product catalog listings from sellers.
                    </p>
                </button>

                <Link
                    href="/superadmin/dashboard/products/change-requests"
                    className="flex flex-col items-start p-5 text-left border-[0.5px] rounded-[10px] bg-white text-gray-950 hover:bg-neutral-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-850 transition-all"
                >
                    <div className="flex justify-between items-center w-full mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tracking-wider">Change Requests</span>
                            {pendingChangeCount > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                                    {pendingChangeCount}
                                </span>
                            )}
                        </div>
                        <div className="px-2 py-0.5 text-[10px] font-bold rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                            Updates
                        </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                        Review proposed product details updates and deletion requests.
                    </p>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-900 border-[0.5px] border-neutral-950/15 dark:border-gray-800 rounded-lg font-bold text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black/10 focus:border-black dark:focus:ring-white/10 dark:focus:border-white transition-all"
                    placeholder="Search products by title or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Products List Table */}
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-950/10 dark:divide-gray-800">
                            <thead className="bg-neutral-50/50 dark:bg-gray-850/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Stock</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Status</th>
                                    <th className="px-6 py-4" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-950/5 dark:divide-gray-850">
                                {[1, 2, 3].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-neutral-100 dark:bg-gray-850 rounded-lg" />
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="h-3.5 bg-neutral-100 dark:bg-gray-850 rounded w-32" />
                                                    <div className="h-2.5 bg-neutral-100 dark:bg-gray-850 rounded w-16" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-neutral-100 dark:bg-gray-850 rounded w-20" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-neutral-100 dark:bg-gray-850 rounded w-14" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-neutral-100 dark:bg-gray-850 rounded w-16" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-3.5 bg-neutral-100 dark:bg-gray-850 rounded w-16" />
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
                            <table className="min-w-full divide-y divide-neutral-950/10 dark:divide-gray-800">
                                <thead className="bg-neutral-50/55 dark:bg-gray-850/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Product</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Category</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Seller</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Price</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Stock</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-950/5 dark:divide-gray-850 text-xs">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-neutral-50/50 dark:hover:bg-gray-850/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 shrink-0 bg-neutral-50 dark:bg-gray-850 border-[0.5px] border-neutral-950/10 rounded-lg overflow-hidden flex items-center justify-center text-gray-400">
                                                            {product.image ? (
                                                                <img src={getImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-[9px] uppercase font-bold">Img</span>
                                                            )}
                                                        </div>
                                                        <div className="ml-4 min-w-0">
                                                            <div className="text-gray-950 dark:text-gray-100 font-bold truncate max-w-[200px]" title={product.title}>{product.title}</div>
                                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider pt-0.5">Id: Prd-{product.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-300 font-medium">
                                                    {product.category?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-300 font-medium">
                                                    {product.seller?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-950 dark:text-white font-extrabold">
                                                    ₹{parseFloat(product.price).toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-wider rounded border ${
                                                        product.stock > 10 
                                                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200/30' 
                                                            : product.stock > 0 
                                                            ? 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200' 
                                                            : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/30'
                                                    }`}>
                                                        {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-wider rounded border ${
                                                        product.status === 'published' || product.status === 'approved'
                                                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200/30' 
                                                            : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200'
                                                    }`}>
                                                        {product.status.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                                        {activeTab === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(product.id)}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-md transition-all"
                                                                    title="Approve Submission"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(product.id)}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-all"
                                                                    title="Reject Submission"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleView(product.id)}
                                                            className="p-1.5 text-gray-400 hover:text-black hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all"
                                                            title="View details"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(product.id)}
                                                            className="p-1.5 text-gray-400 hover:text-black hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-all"
                                                            title="Edit Details"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-full text-gray-300">
                                                        <Plus size={32} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-base font-bold text-gray-900 dark:text-white">No Products Found</p>
                                                        <p className="text-xs text-gray-500 max-w-xs">Register your first system catalog product or adjust filters.</p>
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
                            <div className="bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-t border-neutral-950/10 dark:border-gray-800 rounded-b-[10px]">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-neutral-950/15 dark:border-gray-700 text-[10px] font-black uppercase tracking-wider rounded-lg text-gray-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-neutral-950/15 dark:border-gray-700 text-[10px] font-black uppercase tracking-wider rounded-lg text-gray-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                            Showing <span className="text-gray-900 dark:text-white">{(currentPage - 1) * 15 + 1}</span> to{' '}
                                            <span className="text-gray-900 dark:text-white">
                                                {Math.min(currentPage * 15, totalItems)}
                                            </span>{' '}
                                            of <span className="text-gray-900 dark:text-white">{totalItems}</span> listings
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-lg -space-x-px border border-neutral-950/10 dark:border-gray-800 overflow-hidden" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-3 py-2 border-r border-neutral-950/10 dark:border-gray-850 bg-white dark:bg-gray-900 text-xs font-medium text-gray-500 hover:bg-neutral-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <ChevronLeft size={14} />
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`relative inline-flex items-center px-3.5 py-1.5 border-r border-neutral-950/10 dark:border-gray-850 text-[10px] font-black uppercase tracking-wider transition-all ${
                                                        currentPage === page
                                                            ? 'z-10 bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                                            : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-neutral-50 dark:hover:bg-gray-850'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-3 py-2 bg-white dark:bg-gray-900 text-xs font-medium text-gray-500 hover:bg-neutral-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Next</span>
                                                <ChevronRight size={14} />
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
