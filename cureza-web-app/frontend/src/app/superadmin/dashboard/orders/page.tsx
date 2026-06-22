'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, ChevronDown, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Order {
    id: number;
    order_number: string;
    created_at: string;
    user: { name: string; email: string } | null;
    items: {
        seller: { name: string } | null;
        product: { brand: { name: string } | null } | null;
    }[];
    final_amount: string;
    status: string;
    payment_status: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
    const [sellers, setSellers] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
    const [brandFilter, setBrandFilter] = useState('All');
    const [sellerFilter, setSellerFilter] = useState('All');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Fetch Brands for filter
        api.get('/admin/brands').then(res => {
            if (res.data.data) setBrands(res.data.data);
            else setBrands(res.data);
        }).catch(err => console.error('Failed to fetch brands', err));

        // Fetch Sellers for filter
        api.get('/admin/sellers?all=1').then(res => {
            if (res.data.data) setSellers(res.data.data);
            else if (Array.isArray(res.data)) setSellers(res.data);
            else if (res.data.sellers) setSellers(res.data.sellers);
        }).catch(err => console.error('Failed to fetch sellers', err));
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'All') params.status = statusFilter;
            if (paymentStatusFilter !== 'All') params.payment_status = paymentStatusFilter;
            if (brandFilter !== 'All') params.brand_id = brandFilter;
            if (sellerFilter !== 'All') params.seller_id = sellerFilter;
            if (fromDate) params.from_date = fromDate;
            if (toDate) params.to_date = toDate;

            const response = await api.get('/admin/orders', { params });
            const data = response.data;
            if (data.data) {
                setOrders(data.data);
                setTotalPages(data.last_page);
            } else {
                setOrders(data);
            }
            setSelectedOrderIds([]); // Reset selection on page or filter change
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, paymentStatusFilter, brandFilter, sellerFilter, fromDate, toDate, page]);

    const handleExport = async () => {
        try {
            const response = await api.get('/admin/orders/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_export_${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleBulkInvoiceDownload = async () => {
        if (selectedOrderIds.length === 0) return;
        try {
            const response = await api.post('/admin/orders/bulk-invoices', {
                order_ids: selectedOrderIds,
                seller_id: sellerFilter !== 'All' ? parseInt(sellerFilter) : null
            }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bulk_invoices_${new Date().toISOString().slice(0,10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Bulk invoice download failed:', error);
            alert('Failed to download bulk invoices');
        }
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === orders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(orders.map(o => o.id));
        }
    };

    const toggleSelectOrder = (id: number) => {
        if (selectedOrderIds.includes(id)) {
            setSelectedOrderIds(selectedOrderIds.filter(oid => oid !== id));
        } else {
            setSelectedOrderIds([...selectedOrderIds, id]);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
            default:
                return 'bg-neutral-50 text-neutral-750 border border-neutral-200 dark:bg-neutral-850 dark:text-neutral-350 dark:border-neutral-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
            case 'failed':
            case 'refunded':
                return 'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
            default:
                return 'bg-neutral-50 text-neutral-750 border border-neutral-200 dark:bg-neutral-850 dark:text-neutral-350 dark:border-neutral-800';
        }
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-[0.5px] border-black/50 dark:border-neutral-800">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShoppingBag size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                                <ShoppingBag size={20} />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                Order Management
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-normal text-xs">
                            Track and manage all orders across the platform
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 self-start md:self-center">
                        {selectedOrderIds.length > 0 && (
                            <button
                                onClick={handleBulkInvoiceDownload}
                                className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-[10px] font-medium hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95 text-xs border-[0.5px] border-transparent shadow-none"
                            >
                                <Download size={16} />
                                Bulk Invoices ({selectedOrderIds.length})
                            </button>
                        )}
                        <Link
                            href="/superadmin/dashboard/orders/create"
                            className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-[10px] font-medium hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95 text-xs border-[0.5px] border-transparent shadow-none"
                        >
                            <Package size={16} />
                            Create New Order
                        </Link>
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 bg-white border-[0.5px] border-black/50 text-gray-700 px-4 py-2.5 rounded-[10px] font-medium hover:bg-neutral-50 transition-all active:scale-95 text-xs dark:bg-gray-900 dark:text-neutral-200 dark:border-neutral-800 dark:hover:bg-neutral-800 shadow-none"
                        >
                            <Download size={16} />
                            Export All Details
                        </button>
                    </div>
                </div>
            </div>



            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 space-y-4 shadow-none">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-450" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border-[0.5px] border-black/50 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 text-xs font-normal placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black focus:border-black dark:text-white transition-colors"
                            placeholder="Search by Order ID, Customer, or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] border-[0.5px] border-black/50 text-xs font-medium transition-all ${
                            showFilters
                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                : 'bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-gray-900 dark:text-neutral-350 dark:border-neutral-800 dark:hover:bg-neutral-800 shadow-none'
                        }`}
                    >
                        <Filter size={14} />
                        <span>Filters</span>
                        <ChevronDown
                            size={14}
                            className={`transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>

                {/* Collapsible Filters Container */}
                {showFilters && (
                    <div className="flex flex-col gap-3 pt-3 border-t-[0.5px] border-black/50 dark:border-neutral-800/50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3 text-xs">
                            {/* Seller Filter */}
                            <div className="relative w-full lg:w-auto lg:min-w-[160px] lg:max-w-[200px]">
                                <select
                                    value={sellerFilter}
                                    onChange={(e) => setSellerFilter(e.target.value)}
                                    className="w-full h-10 pl-3 pr-10 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white dark:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white outline-none appearance-none cursor-pointer"
                                >
                                    <option value="All">All Sellers</option>
                                    {sellers.map(seller => (
                                        <option key={seller.id} value={seller.id}>{seller.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>

                            {/* Brand Filter */}
                            <div className="relative w-full lg:w-auto lg:min-w-[160px] lg:max-w-[200px]">
                                <select
                                    value={brandFilter}
                                    onChange={(e) => setBrandFilter(e.target.value)}
                                    className="w-full h-10 pl-3 pr-10 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white dark:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white outline-none appearance-none cursor-pointer"
                                >
                                    <option value="All">All Brands</option>
                                    {brands.map(brand => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="relative w-full lg:w-auto lg:min-w-[140px]">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full h-10 pl-3 pr-10 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white dark:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white outline-none appearance-none cursor-pointer"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>

                            {/* Payment Status Filter */}
                            <div className="relative w-full lg:w-auto lg:min-w-[140px]">
                                <select
                                    value={paymentStatusFilter}
                                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                    className="w-full h-10 pl-3 pr-10 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white dark:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white outline-none appearance-none cursor-pointer"
                                >
                                    <option value="All">All Payments</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
                                    <ChevronDown size={14} />
                                </div>
                            </div>

                            {/* Date Range - From */}
                            <div className="w-full lg:w-auto h-10 flex items-center justify-between lg:justify-start gap-2 bg-white dark:bg-gray-900 border-[0.5px] border-black/50 rounded-[10px] px-3">
                                <span className="text-[10px] text-neutral-450 uppercase font-semibold">From:</span>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="text-xs border-none focus:ring-0 p-0 bg-transparent dark:text-white outline-none cursor-pointer"
                                />
                            </div>

                            {/* Date Range - To */}
                            <div className="w-full lg:w-auto h-10 flex items-center justify-between lg:justify-start gap-2 bg-white dark:bg-gray-950 border-[0.5px] border-black/50 rounded-[10px] px-3">
                                <span className="text-[10px] text-neutral-450 uppercase font-semibold">To:</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="text-xs border-none focus:ring-0 p-0 bg-transparent dark:text-white outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Orders List Table */}
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-955/10 dark:divide-neutral-800">
                        <thead className="bg-neutral-50/50 dark:bg-gray-850/50">
                            <tr className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                <th scope="col" className="px-6 py-3.5 text-left">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-black border-black/50 rounded-[4px] focus:ring-black cursor-pointer bg-transparent"
                                        checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Order ID</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Date</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Customer</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Seller(s)</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Total</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Payment</th>
                                <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Status</th>
                                <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-955/5 dark:divide-gray-850 font-normal text-xs text-gray-700 dark:text-gray-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-xs text-neutral-500 font-normal">Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-xs text-neutral-500 font-normal">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50/40 dark:hover:bg-gray-850/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-black border-black/50 rounded-[4px] focus:ring-black cursor-pointer bg-transparent"
                                                checked={selectedOrderIds.includes(order.id)}
                                                onChange={() => toggleSelectOrder(order.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer">
                                            <Link href={`/superadmin/dashboard/orders/${order.id}`}>{order.order_number}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-normal text-neutral-550 dark:text-neutral-400">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-normal text-neutral-900 dark:text-neutral-100">
                                            {order.user?.name || 'Guest'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-normal text-neutral-500 dark:text-neutral-400">
                                            {Array.from(new Set(order.items.map(i => i.product?.brand?.name || i.seller?.name || 'N/A'))).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-neutral-900 dark:text-white">₹{order.final_amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-semibold rounded-full capitalize ${getPaymentStatusColor(order.payment_status)}`}>
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                                            <Link href={`/superadmin/dashboard/orders/${order.id}`} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                                <Eye size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-3 flex justify-between items-center border-t-[0.5px] border-black/50 dark:border-neutral-800 text-xs">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white transition-all shadow-none"
                    >
                        Previous
                    </button>
                    <span className="text-neutral-500 dark:text-neutral-450 font-normal">Page {page} of {totalPages}</span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white transition-all shadow-none"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

