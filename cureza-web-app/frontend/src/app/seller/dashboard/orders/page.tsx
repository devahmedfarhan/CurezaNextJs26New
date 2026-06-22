'use client';

import Link from 'next/link';
import { Search, Filter, Eye, Truck, XCircle, ChevronRight, ChevronLeft, MoreVertical, Download, FileText, Trash2, CheckCircle, CheckSquare, Square, Info, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '@/lib/api';

// Status badge component for consistent styling
const OrderStatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { bg: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30', dot: 'bg-amber-500', label: 'Pending' };
            case 'processing':
                return { bg: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30', dot: 'bg-blue-500', label: 'Processing' };
            case 'shipped':
                return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30', dot: 'bg-indigo-500', label: 'Shipped' };
            case 'delivered':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30', dot: 'bg-emerald-500', label: 'Delivered' };
            case 'cod_reconciled':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30', dot: 'bg-emerald-500', label: 'Ready to Payout' };
            case 'cancelled':
            default:
                return { bg: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30', dot: 'bg-rose-500', label: 'Cancelled' };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider border ${config.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
};

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter, searchTerm]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params: any = { page };
            if (statusFilter !== 'All') params.status = statusFilter;
            if (searchTerm) params.search = searchTerm;

            const response = await axios.get('/seller/orders', { params });
            setOrders(response.data.data);
            setLastPage(response.data.last_page);
        } catch (error) {
            console.error('Failed to fetch seller orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchOrders();
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(orders.map(o => o.id));
        }
    };

    const toggleSelectOrder = (orderId: number) => {
        if (selectedOrders.includes(orderId)) {
            setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        } else {
            setSelectedOrders([...selectedOrders, orderId]);
        }
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            await axios.put(`/seller/orders/${orderId}/status`, { status: newStatus });
            alert(`Order status updated to ${newStatus}`);
            fetchOrders();
            setOpenDropdown(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const bulkUpdateStatus = async (newStatus: string) => {
        if (selectedOrders.length === 0) {
            alert('Please select orders first');
            return;
        }

        try {
            await Promise.all(
                selectedOrders.map(orderId =>
                    axios.put(`/seller/orders/${orderId}/status`, { status: newStatus })
                )
            );
            alert(`${selectedOrders.length} orders updated to ${newStatus}`);
            setSelectedOrders([]);
            setShowBulkActions(false);
            fetchOrders();
        } catch (error) {
            alert('Failed to update some orders');
        }
    };

    const downloadInvoice = async (orderId: number) => {
        try {
            const response = await axios.get(`/seller/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.html`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setOpenDropdown(null);
        } catch (error) {
            alert('Failed to download invoice');
        }
    };

    const bulkDownloadInvoices = async () => {
        if (selectedOrders.length === 0) {
            alert('Please select orders first');
            return;
        }

        try {
            const response = await axios.post('/seller/orders/bulk-invoices', {
                order_ids: selectedOrders
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bulk-invoices-${new Date().toISOString().split('T')[0]}.html`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            alert(`Downloaded combined invoice for ${selectedOrders.length} orders`);
            setShowBulkActions(false);
        } catch (error) {
            alert('Failed to download bulk invoices');
        }
    };

    const downloadShippingLabel = async (orderId: number) => {
        try {
            const response = await axios.get(`/seller/orders/${orderId}/shipping-label`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `shipping-label-${orderId}.html`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setOpenDropdown(null);
        } catch (error) {
            alert('Failed to download shipping label');
        }
    };

    const bulkDownloadShippingLabels = async () => {
        if (selectedOrders.length === 0) {
            alert('Please select orders first');
            return;
        }

        try {
            const response = await axios.post('/seller/orders/bulk-shipping-labels', {
                order_ids: selectedOrders
            }, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bulk-shipping-labels-${new Date().toISOString().split('T')[0]}.html`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            alert(`Downloaded combined shipping labels for ${selectedOrders.length} orders`);
            setShowBulkActions(false);
        } catch (error) {
            alert('Failed to download bulk shipping labels');
        }
    };

    const requestOrderDeletion = async (orderId: number) => {
        if (!confirm('Are you sure you want to request deletion of this order? This will require Super Admin approval.')) {
            return;
        }

        try {
            alert('Order deletion request sent to Super Admin for approval');
            setOpenDropdown(null);
        } catch (error) {
            alert('Failed to request order deletion');
        }
    };

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-outfit font-extrabold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
                        <FileText className="text-cureza-green" size={28} />
                        Order Console
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium">Real-Time Marketplace Fulfillment and Tracking Node.</p>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedOrders.length > 0 && (
                <div className="bg-gray-900 text-white px-6 py-4 rounded-lg flex items-center justify-between border border-gray-850 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <CheckSquare size={18} className="text-cureza-green" />
                        </div>
                        <div>
                            <span className="font-black text-xl tracking-tighter">{selectedOrders.length}</span>
                            <span className="ml-2.5 font-extrabold text-[9px] tracking-widest text-gray-400">Total Selections</span>
                        </div>
                        <div className="h-6 w-px bg-white/10 mx-2"></div>
                        <button
                            onClick={() => setSelectedOrders([])}
                            className="text-[9px] font-extrabold tracking-widest bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all border border-white/5"
                        >
                            Reset
                        </button>
                    </div>
                    <button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="px-6 py-2.5 bg-cureza-green text-white rounded-lg hover:bg-emerald-600 transition-all font-black text-[9px] tracking-widest flex items-center gap-2"
                    >
                        Execute Batch Actions <MoreVertical size={14} />
                    </button>
                </div>
            )}

            {/* Bulk Actions Dropdown */}
            {showBulkActions && selectedOrders.length > 0 && (
                <div className="premium-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
                    <div>
                        <p className="text-[9px] font-extrabold text-gray-400 tracking-widest mb-4">Fulfillment Pipeline</p>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    if (confirm("Are you sure you want to cancel the selected orders?")) {
                                        bulkUpdateStatus('cancelled');
                                    }
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-105 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 rounded-lg flex items-center gap-2 transition-all border border-rose-100 dark:border-rose-900/30"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-550"></div>
                                Bulk Cancel Orders
                            </button>
                        </div>
                    </div>

                    <div>
                        <p className="text-[9px] font-extrabold text-gray-400 tracking-widest mb-4">Manifest Downloads</p>
                        <div className="space-y-2">
                            <button
                                onClick={bulkDownloadInvoices}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold bg-emerald-50 text-cureza-green hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 rounded-lg flex items-center gap-2 transition-all border border-emerald-100 dark:border-emerald-900/30"
                            >
                                <FileText size={14} />
                                Generate Bulk Invoices
                            </button>
                            <button
                                onClick={bulkDownloadShippingLabels}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-2 transition-all border border-blue-100 dark:border-blue-900/30"
                            >
                                <Truck size={14} />
                                Export Shipping Labels
                            </button>
                        </div>
                    </div>

                    <div className="bg-amber-50/50 dark:bg-amber-950/10 p-5 rounded-lg border border-amber-100 dark:border-amber-900/30 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1 text-amber-700 dark:text-amber-400">
                            <Info size={14} />
                            <p className="text-[9px] font-black tracking-widest">Protocol Warning</p>
                        </div>
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-bold leading-relaxed">
                            Batch Operations are Irreversible. Ensure All {selectedOrders.length} Identifiers are Verified Before Execution.
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="premium-card p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="relative">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search Orders by SKU, ID, or Customer Name/Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-cureza-green/15 focus:border-cureza-green transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </form>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex overflow-x-auto pb-2 no-scrollbar">
                <div className="flex bg-gray-100/80 dark:bg-gray-800/40 p-1 rounded-lg gap-1 border border-black/[0.03] dark:border-white/[0.03]">
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${
                                statusFilter === status
                                    ? 'bg-white text-gray-900 shadow-sm border border-black/[0.05] dark:bg-gray-900 dark:text-white dark:border-white/[0.05]'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-transparent'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="premium-card overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-none min-h-[480px] flex flex-col justify-between">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="premium-table-header border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-5 py-3 w-10">
                                    <button 
                                        onClick={toggleSelectAll} 
                                        className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all"
                                    >
                                        {selectedOrders.length === orders.length && orders.length > 0 ? (
                                            <CheckSquare size={12} className="text-cureza-green" />
                                        ) : (
                                            <Square size={12} />
                                        )}
                                    </button>
                                </th>
                                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-gray-500">Reference</th>
                                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-gray-500">Customer Details</th>
                                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-gray-500">Order Date</th>
                                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-gray-500 text-center">Quantity</th>
                                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-gray-500 text-center">Net Total</th>
                                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-gray-500">Fulfillment</th>
                                <th className="px-5 py-3 text-[10px] font-bold tracking-wider text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center">
                                        <div className="animate-pulse flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="animate-spin text-cureza-green" size={32} />
                                            <span className="text-[9px] font-bold text-gray-400 tracking-widest">Synchronizing Registry...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                                            <XCircle size={40} className="text-gray-300 dark:text-gray-700" />
                                            <span className="text-[10px] font-bold text-gray-400 tracking-widest">No Matching Order Nodes Found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-all">
                                        <td className="px-5 py-3.5">
                                            <button
                                                onClick={() => toggleSelectOrder(order.id)}
                                                className={`w-5 h-5 flex items-center justify-center rounded border transition-all ${selectedOrders.includes(order.id)
                                                    ? 'bg-cureza-green border-cureza-green text-white'
                                                    : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                {selectedOrders.includes(order.id) ? (
                                                    <CheckSquare size={12} />
                                                ) : (
                                                    <Square size={12} className="opacity-0" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Link href={`/seller/dashboard/orders/${order.id}`} className="font-outfit font-bold text-gray-900 dark:text-gray-100 hover:text-cureza-green dark:hover:text-cureza-green transition-colors tracking-tight text-xs block">
                                                #{order.order_number}
                                            </Link>
                                            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium tracking-wide mt-0.5 opacity-60">ID: {order.id}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 flex items-center justify-center font-bold text-gray-400 text-xs">
                                                    {order.user?.name?.charAt(0) || 'G'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{order.user ? order.user.name : 'Guest Client'}</p>
                                                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-medium tracking-tight mt-0.5">{order.user?.email || 'Unauthorized Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="block text-[9px] text-gray-400 dark:text-gray-500 font-medium tracking-wide mt-0.5 opacity-60">
                                                {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold text-xs border border-gray-100 dark:border-gray-800">
                                                {order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <p className="font-outfit font-bold text-gray-900 dark:text-gray-100 text-xs tracking-tight">₹{order.items?.reduce((acc: number, item: any) => acc + parseFloat(item.total), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</p>
                                            <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 tracking-wider opacity-60 block mt-0.5">Gross Value</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                <Link href={`/seller/dashboard/orders/${order.id}`} className="p-1.5 text-gray-400 hover:text-cureza-green hover:bg-cureza-green-50/40 rounded-lg transition-all" title="View Details">
                                                    <Eye size={15} />
                                                </Link>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                                                        className={`p-1.5 rounded-lg transition-all ${openDropdown === order.id ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-gray-800' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                    >
                                                        <MoreVertical size={15} />
                                                    </button>

                                                    {openDropdown === order.id && (
                                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            {/* Status Change Options - Only Cancel is manually allowed */}
                                                            {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                                                                <div className="p-1.5 border-b border-gray-100 dark:border-gray-800">
                                                                    <p className="px-2 py-1 text-[8px] font-bold text-gray-400 tracking-wider">Fulfillment Actions</p>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to cancel this order?')) {
                                                                                updateOrderStatus(order.id, 'cancelled');
                                                                            }
                                                                        }}
                                                                        className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors font-bold"
                                                                    >
                                                                        Cancel Order
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/25">
                                                                    <p className="text-[9px] text-gray-400 font-bold tracking-tight italic">
                                                                        {order.status === 'delivered'
                                                                            ? '✓ Order Completed'
                                                                            : '✗ Order Cancelled'}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Download Options */}
                                                            <div className="p-1.5 border-b border-gray-100 dark:border-gray-800">
                                                                <button
                                                                    onClick={() => downloadInvoice(order.id)}
                                                                    className="w-full text-left px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors font-semibold flex items-center gap-2"
                                                                >
                                                                    <FileText size={13} className="text-gray-400" />
                                                                    Download Invoice
                                                                </button>
                                                                <button
                                                                    onClick={() => downloadShippingLabel(order.id)}
                                                                    className="w-full text-left px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors font-semibold flex items-center gap-2"
                                                                >
                                                                    <Truck size={13} className="text-gray-400" />
                                                                    Download Shipping Label
                                                                </button>
                                                            </div>

                                                            {/* Delete Option */}
                                                            <div className="p-1.5">
                                                                <button
                                                                    onClick={() => requestOrderDeletion(order.id)}
                                                                    className="w-full text-left px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors font-bold flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={13} />
                                                                    Request Deletion
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/20 dark:bg-gray-900/25">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Showing Page {page} of {lastPage}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                            disabled={page === lastPage}
                            className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {openDropdown !== null && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenDropdown(null)}
                />
            )}
        </div>
    );
}
