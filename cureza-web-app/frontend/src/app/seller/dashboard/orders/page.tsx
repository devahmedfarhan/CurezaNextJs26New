'use client';

import Link from 'next/link';
import { Search, Filter, Eye, Truck, XCircle, ChevronRight, ChevronLeft, MoreVertical, Download, FileText, Trash2, CheckCircle, CheckSquare, Square, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '@/lib/api';

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
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Console</h1>
                    <p className="text-gray-500 mt-1 font-medium italic border-l-2 border-cureza-green pl-4">Real-time marketplace fulfillment and tracking node.</p>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 lg:w-80 group">
                        <input
                            type="text"
                            placeholder="Find by SKU, ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-3xl border border-gray-100 bg-white text-sm font-bold focus:outline-none focus:ring-8 focus:ring-green-500/5 focus:border-cureza-green transition-all shadow-sm group-hover:shadow-md"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-cureza-green transition-colors" size={18} />
                    </form>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedOrders.length > 0 && (
                <div className="bg-gray-900 text-white px-8 py-5 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-gray-200 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-6">
                        <div className="bg-white/10 p-3 rounded-2xl">
                            <CheckSquare size={24} className="text-cureza-green" />
                        </div>
                        <div>
                            <span className="font-black text-2xl tracking-tighter">{selectedOrders.length}</span>
                            <span className="ml-3 font-extrabold text-[10px] uppercase tracking-widest text-gray-400">Total Selections</span>
                        </div>
                        <div className="h-10 w-px bg-white/10 mx-2"></div>
                        <button
                            onClick={() => setSelectedOrders([])}
                            className="text-[10px] font-extrabold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/5"
                        >
                            Reset
                        </button>
                    </div>
                    <button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="px-8 py-3 bg-cureza-green text-white rounded-2xl hover:bg-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-3 active:scale-95"
                    >
                        Execute Batch Actions <MoreVertical size={16} />
                    </button>
                </div>
            )}

            {/* Bulk Actions Dropdown */}
            {showBulkActions && selectedOrders.length > 0 && (
                <div className="premium-card p-10 grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in zoom-in-95 duration-300">
                    <div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-6">Transition Pipeline</p>
                        <div className="space-y-3">
                            {['processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => bulkUpdateStatus(status)}
                                    className="w-full text-left px-5 py-4 text-xs font-bold bg-gray-50 hover:bg-white hover:shadow-lg hover:shadow-gray-100 rounded-2xl flex items-center gap-3 transition-all border border-transparent hover:border-gray-100 group"
                                >
                                    <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-cureza-green transition-colors"></div>
                                    Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-6">Manifest Downloads</p>
                        <div className="space-y-3">
                            <button
                                onClick={bulkDownloadInvoices}
                                className="w-full text-left px-5 py-4 text-xs font-bold bg-emerald-50 text-cureza-green hover:bg-white hover:shadow-lg hover:shadow-emerald-100 rounded-2xl flex items-center gap-3 transition-all border border-transparent hover:border-emerald-100"
                            >
                                <FileText size={16} />
                                Generate Bulk Invoices
                            </button>
                            <button
                                onClick={bulkDownloadShippingLabels}
                                className="w-full text-left px-5 py-4 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-white hover:shadow-lg hover:shadow-blue-100 rounded-2xl flex items-center gap-3 transition-all border border-transparent hover:border-blue-100"
                            >
                                <Truck size={16} />
                                Export Shipping Labels
                            </button>
                        </div>
                    </div>

                    <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2 text-amber-700">
                            <Info size={16} />
                            <p className="text-[10px] font-black uppercase tracking-widest">Protocol Warning</p>
                        </div>
                        <p className="text-xs text-amber-800 font-bold leading-relaxed">
                            Batch operations are irreversible. Ensure all {selectedOrders.length} identifiers are verified before execution.
                        </p>
                    </div>
                </div>
            )}

            {/* Status Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => { setStatusFilter(status); setPage(1); }}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${statusFilter === status
                            ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200 -translate-y-1'
                            : 'bg-white text-gray-400 border-white hover:border-gray-100 hover:text-gray-900 shadow-sm'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="premium-table-header">
                            <tr>
                                <th className="px-8 py-6 w-10">
                                    <button onClick={toggleSelectAll} className="w-8 h-8 flex items-center justify-center rounded-xl border-2 border-white/20 hover:bg-white/10 transition-all">
                                        {selectedOrders.length === orders.length && orders.length > 0 ? (
                                            <CheckSquare size={18} />
                                        ) : (
                                            <Square size={18} />
                                        )}
                                    </button>
                                </th>
                                <th className="px-8 py-6">Reference</th>
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Timestamp</th>
                                <th className="px-8 py-6 text-center">Unit Count</th>
                                <th className="px-8 py-6 text-center">Valuation</th>
                                <th className="px-8 py-6">Pipeline</th>
                                <th className="px-8 py-6 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-4"></div>
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Synchronizing Registry...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <XCircle size={48} className="text-gray-300 mb-4" />
                                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">No matching order nodes found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.id} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => toggleSelectOrder(order.id)}
                                            className={`w-7 h-7 flex items-center justify-center rounded-xl border-2 transition-all ${selectedOrders.includes(order.id)
                                                ? 'bg-cureza-green border-cureza-green text-white shadow-lg shadow-green-100'
                                                : 'border-gray-100 bg-white group-hover:border-gray-200'
                                                }`}
                                        >
                                            {selectedOrders.includes(order.id) ? (
                                                <CheckSquare size={14} />
                                            ) : (
                                                <Square size={14} className="opacity-0" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Link href={`/seller/dashboard/orders/${order.id}`} className="font-black text-gray-900 hover:text-cureza-green transition-colors tracking-tight text-base">
                                            #{order.order_number}
                                        </Link>
                                        <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1.5 opacity-60">ID: {order.id}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-50 flex items-center justify-center font-black text-gray-400 text-sm group-hover:bg-white group-hover:shadow-md transition-all">
                                                {order.user?.name?.charAt(0) || 'G'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{order.user ? order.user.name : 'Guest Client'}</p>
                                                <p className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">{order.user?.email || 'Unauthorized Email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-bold text-gray-700">
                                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 opacity-60">
                                            {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-50 text-gray-900 font-black text-xs border border-gray-100 group-hover:bg-white transition-all">
                                            {order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <p className="font-black text-gray-900 text-lg tracking-tighter">₹{order.items.reduce((acc: number, item: any) => acc + parseFloat(item.total), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-40">Gross Value</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'pending' ? 'bg-amber-500' :
                                                order.status === 'processing' ? 'bg-blue-500' :
                                                    order.status === 'shipped' ? 'bg-indigo-500' :
                                                        order.status === 'delivered' ? 'bg-emerald-500' :
                                                            'bg-rose-500'
                                                }`}></span>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/seller/dashboard/orders/${order.id}`} className="p-3 bg-white text-gray-400 hover:text-cureza-green border border-gray-100 hover:border-cureza-green rounded-2xl transition-all shadow-sm hover:shadow-md" title="View Details">
                                                <Eye size={20} />
                                            </Link>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                                                    className={`p-3 bg-white border rounded-2xl transition-all shadow-sm hover:shadow-md ${openDropdown === order.id ? 'text-gray-900 border-gray-900 shadow-inner' : 'text-gray-400 border-gray-100 hover:text-gray-900'}`}
                                                >
                                                    <MoreVertical size={20} />
                                                </button>

                                                {openDropdown === order.id && (
                                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                        {/* Status Change Options */}
                                                        {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                                                            <div className="p-2 border-b border-gray-50">
                                                                <p className="px-3 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Change Status</p>
                                                                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                                    order.status !== status && (
                                                                        <button
                                                                            key={status}
                                                                            onClick={() => updateOrderStatus(order.id, status)}
                                                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
                                                                        >
                                                                            <CheckCircle size={14} className="text-gray-400" />
                                                                            Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                        </button>
                                                                    )
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">
                                                                    {order.status === 'delivered'
                                                                        ? '✓ Order completed'
                                                                        : '✗ Order cancelled'}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Download Options */}
                                                        <div className="p-2 border-b border-gray-50">
                                                            <button
                                                                onClick={() => downloadInvoice(order.id)}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
                                                            >
                                                                <FileText size={14} className="text-gray-400" />
                                                                Download Invoice
                                                            </button>
                                                            <button
                                                                onClick={() => downloadShippingLabel(order.id)}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
                                                            >
                                                                <Truck size={14} className="text-gray-400" />
                                                                Download Shipping Label
                                                            </button>
                                                        </div>

                                                        {/* Delete Option */}
                                                        <div className="p-2">
                                                            <button
                                                                onClick={() => requestOrderDeletion(order.id)}
                                                                className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors font-bold"
                                                            >
                                                                <Trash2 size={14} />
                                                                Request Deletion
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Showing page {page} of {lastPage}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                            disabled={page === lastPage}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
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
