'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, Edit, Trash2, Eye, Download, Upload, Check, X, Loader2 } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
                    <p className="text-gray-500">Manage all products across the marketplace</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/superadmin/dashboard/products/bulk" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        <Upload size={18} />
                        Bulk Import
                    </Link>
                    <Link href="/superadmin/dashboard/products/create" className="flex items-center gap-2 bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <Plus size={18} />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all'
                            ? 'border-cureza-green text-cureza-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        All Products
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending'
                            ? 'border-cureza-green text-cureza-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Pending Approvals
                    </button>
                    <Link
                        href="/superadmin/dashboard/products/change-requests"
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'changes'
                                ? 'border-cureza-green text-cureza-green'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Change Requests
                        {pendingChangeCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingChangeCount}
                            </span>
                        )}
                    </Link>
                </nav>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-cureza-green focus:border-cureza-green sm:text-sm transition-colors"
                        placeholder="Search by product name or brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="animate-spin text-cureza-green" size={32} />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                                        {product.image ? (
                                                            <img src={getImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">Img</div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                                        <div className="text-xs text-gray-500">ID: PRD-{product.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.seller?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{product.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' :
                                                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    {activeTab === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(product.id)}
                                                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                title="Approve"
                                                            >
                                                                <Check size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(product.id)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Reject"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleView(product.id)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(product.id)}
                                                        className="p-1 text-gray-400 hover:text-cureza-green transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(currentPage - 1) * 15 + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * 15, totalItems)}
                                        </span>{' '}
                                        of <span className="font-medium">{totalItems}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            &larr;
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    currentPage === page
                                                        ? 'z-10 bg-cureza-green border-cureza-green text-white'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            &rarr;
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </>)}
            </div>
        </div>
    );
}
