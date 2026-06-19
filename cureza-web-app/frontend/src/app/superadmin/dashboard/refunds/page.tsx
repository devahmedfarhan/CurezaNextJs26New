'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, Eye, RefreshCw, Loader2, X, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Refund {
    id: number;
    amount: string;
    reason: string;
    status: string;
    created_at: string;
    order: {
        id: number;
        order_number: string;
    };
    user: {
        name: string;
        email: string;
    };
}

export default function AdminRefundsPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64 min-h-[500px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-black" size={40} />
                    <p className="text-gray-500 font-medium animate-pulse">Loading Refunds Dashboard...</p>
                </div>
            </div>
        }>
            <RefundsContent />
        </Suspense>
    );
}

function RefundsContent() {
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get('tab') || 'refunds') as 'refunds' | 'cancelled';

    // Refund Requests States
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Cancelled Items States
    const [cancelledItems, setCancelledItems] = useState<any[]>([]);
    const [cancelledLoading, setCancelledLoading] = useState(false);
    const [cancelledSearch, setCancelledSearch] = useState('');
    const [cancelledPage, setCancelledPage] = useState(1);
    const [cancelledTotalPages, setCancelledTotalPages] = useState(1);

    // Manual Refund Form
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [manualOrderId, setManualOrderId] = useState('');
    const [manualAmount, setManualAmount] = useState('');
    const [manualReason, setManualReason] = useState('');
    const [manualNotes, setManualNotes] = useState('');
    const [manualLoading, setManualLoading] = useState(false);
    const [ordersList, setOrdersList] = useState<any[]>([]);

    // Action modals
    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
    const [confirmRefundId, setConfirmRefundId] = useState<number | null>(null);
    const [confirmPackageReceived, setConfirmPackageReceived] = useState(false);
    const [confirmNotes, setConfirmNotes] = useState('');
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
    const [confirmRejectId, setConfirmRejectId] = useState<number | null>(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [confirmRejectLoading, setConfirmRejectLoading] = useState(false);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'All') params.status = statusFilter;

            const response = await api.get('/admin/refunds', { params });
            const data = response.data;
            if (data.data) {
                setRefunds(data.data);
                setTotalPages(data.last_page);
            } else {
                setRefunds(data);
            }
        } catch (error) {
            console.error('Failed to fetch refunds:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCancelledItems = async () => {
        setCancelledLoading(true);
        try {
            const params: any = { page: cancelledPage };
            if (cancelledSearch) params.search = cancelledSearch;

            const response = await api.get('/admin/orders/cancelled-items', { params });
            const data = response.data;
            if (data.data) {
                setCancelledItems(data.data);
                setCancelledTotalPages(data.last_page);
            } else {
                setCancelledItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch cancelled items:', error);
        } finally {
            setCancelledLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (activeTab === 'refunds') {
                fetchRefunds();
            } else {
                fetchCancelledItems();
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, page, cancelledSearch, cancelledPage, activeTab]);

    const openApproveModal = (id: number) => {
        setConfirmRefundId(id);
        setConfirmPackageReceived(false);
        setConfirmNotes('');
        setConfirmApproveOpen(true);
    };

    const openRejectModal = (id: number) => {
        setConfirmRejectId(id);
        setRejectNotes('');
        setConfirmRejectOpen(true);
    };

    const handleApprove = async () => {
        if (!confirmRefundId) return;
        if (!confirmPackageReceived) {
            alert('Please confirm that the return package has been received and return accepted.');
            return;
        }
        setConfirmLoading(true);
        try {
            await api.post('/admin/refund/approve', { 
                refund_id: confirmRefundId,
                admin_notes: confirmNotes || 'Package received and return accepted.'
            });
            setConfirmApproveOpen(false);
            fetchRefunds();
        } catch (error) {
            console.error('Failed to approve refund:', error);
            alert('Failed to approve refund');
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirmRejectId) return;
        setConfirmRejectLoading(true);
        try {
            await api.post('/admin/refund/reject', { 
                refund_id: confirmRejectId,
                admin_notes: rejectNotes || 'Rejected by administrator.'
            });
            setConfirmRejectOpen(false);
            fetchRefunds();
        } catch (error) {
            console.error('Failed to reject refund:', error);
            alert('Failed to reject refund');
        } finally {
            setConfirmRejectLoading(false);
        }
    };

    const loadPaidOrders = async () => {
        try {
            const res = await api.get('/admin/orders', { params: { payment_status: 'paid' } });
            setOrdersList(res.data.data || res.data || []);
            setIsCreateModalOpen(true);
        } catch (err) {
            console.error(err);
            alert('Failed to load orders');
        }
    };

    const handleCreateRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualOrderId) return;
        setManualLoading(true);
        try {
            await api.post('/admin/refunds', {
                order_id: parseInt(manualOrderId),
                amount: parseFloat(manualAmount),
                reason: manualReason,
                admin_notes: manualNotes
            });
            setIsCreateModalOpen(false);
            setManualOrderId('');
            setManualAmount('');
            setManualReason('');
            setManualNotes('');
            fetchRefunds();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to request refund');
        } finally {
            setManualLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
            case 'rejected':
                return 'bg-red-50 text-red-700 border border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
            default:
                return 'bg-neutral-50 text-neutral-750 border border-neutral-200 dark:bg-neutral-850 dark:text-neutral-350 dark:border-neutral-800';
        }
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-[0.5px] border-neutral-950/10 dark:border-neutral-800">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <RefreshCw size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                                <RefreshCw size={20} />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                Refunds & Cancellations
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-normal text-xs">
                            Manage refund requests and order cancellations
                        </p>
                    </div>
                    <div className="flex gap-2 self-start md:self-center">
                        <button
                            onClick={loadPaidOrders}
                            className="bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-[10px] font-medium hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95 text-xs border border-transparent shadow-none"
                        >
                            Initiate Manual Refund
                        </button>
                    </div>
                </div>
            </div>



            {activeTab === 'refunds' ? (
                <>
                    {/* Search and Filter Bar */}
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-neutral-950/10 dark:border-neutral-800 space-y-4 shadow-none">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-450" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-neutral-950/15 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 text-xs font-normal placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black focus:border-black dark:text-white transition-colors"
                                    placeholder="Search by Refund ID or Order #..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs font-medium">
                                {['All', 'pending', 'approved', 'rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-2 rounded-[10px] border transition-colors capitalize ${
                                            statusFilter === status
                                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                                : 'bg-white text-neutral-600 border-neutral-950/15 hover:bg-neutral-50 dark:bg-gray-900 dark:text-neutral-350 dark:border-neutral-800 dark:hover:bg-neutral-800'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Refunds List Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] border border-neutral-950/10 dark:border-neutral-800 overflow-hidden shadow-none">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-955/10 dark:divide-neutral-800">
                                <thead className="bg-neutral-50/50 dark:bg-gray-850/50">
                                    <tr className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Refund ID</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Order</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Customer</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Amount</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Reason</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Status</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Date</th>
                                        <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-955/5 dark:divide-gray-850 font-normal text-xs text-gray-700 dark:text-gray-300">
                                    {loading ? (
                                        <tr><td colSpan={8} className="px-6 py-8 text-center text-neutral-500 font-normal">Loading...</td></tr>
                                    ) : refunds.length === 0 ? (
                                        <tr><td colSpan={8} className="px-6 py-8 text-center text-neutral-500 font-normal">No refund requests found.</td></tr>
                                    ) : (
                                        refunds.map((refund) => (
                                            <tr key={refund.id} className="hover:bg-neutral-50/40 dark:hover:bg-gray-850/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-black dark:text-white">#{refund.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer">
                                                    <Link href={`/superadmin/dashboard/orders/${refund.order?.id}`}>
                                                        {refund.order?.order_number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-900 dark:text-neutral-100 font-normal">{refund.user?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-black dark:text-white">₹{refund.amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-450 font-normal">{refund.reason}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${getStatusColor(refund.status)}`}>
                                                        {refund.status === 'approved' && <CheckCircle size={10} />}
                                                        {refund.status === 'rejected' && <XCircle size={10} />}
                                                        {refund.status === 'pending' && <AlertCircle size={10} />}
                                                        {refund.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-normal">{new Date(refund.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                                                    {refund.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-3">
                                                            <button onClick={() => openApproveModal(refund.id)} className="text-neutral-450 hover:text-black dark:hover:text-white transition-colors" title="Approve">
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button onClick={() => openRejectModal(refund.id)} className="text-neutral-450 hover:text-red-600 transition-colors" title="Reject">
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-neutral-450 font-normal italic">Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-3 flex justify-between items-center border-t border-neutral-955/10 dark:border-neutral-800 text-xs">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1.5 border border-neutral-950/10 rounded-[10px] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white transition-all shadow-none"
                            >
                                Previous
                            </button>
                            <span className="text-neutral-500 dark:text-neutral-450 font-normal">Page {page} of {totalPages}</span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1.5 border border-neutral-950/10 rounded-[10px] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white transition-all shadow-none"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Search and Filters for Cancelled Items */}
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-neutral-950/10 dark:border-neutral-800 space-y-4 shadow-none">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-450" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-neutral-950/15 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 text-xs font-normal placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-black focus:border-black dark:text-white transition-colors"
                                    placeholder="Search by Product or Order #..."
                                    value={cancelledSearch}
                                    onChange={(e) => setCancelledSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cancelled Items Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] border border-neutral-950/10 dark:border-neutral-800 overflow-hidden shadow-none">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-955/10 dark:divide-neutral-800">
                                <thead className="bg-neutral-50/50 dark:bg-gray-850/50">
                                    <tr className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Item ID</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Order</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Customer</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Product Description</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Seller</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Price</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Qty</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Total</th>
                                        <th scope="col" className="px-6 py-3.5 text-left tracking-wide">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-955/5 dark:divide-gray-850 font-normal text-xs text-gray-700 dark:text-gray-300">
                                    {cancelledLoading ? (
                                        <tr><td colSpan={9} className="px-6 py-8 text-center text-neutral-500 font-normal">Loading...</td></tr>
                                    ) : cancelledItems.length === 0 ? (
                                        <tr><td colSpan={9} className="px-6 py-8 text-center text-neutral-500 font-normal">No cancelled products found.</td></tr>
                                    ) : (
                                        cancelledItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-neutral-50/40 dark:hover:bg-gray-850/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-900 dark:text-neutral-100 font-normal">#{item.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer">
                                                    <Link href={`/superadmin/dashboard/orders/${item.order?.id}`}>
                                                        {item.order?.order_number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-700 dark:text-neutral-350 font-normal">{item.order?.user?.name || 'Guest'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-black dark:text-white">{item.product_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-550 dark:text-neutral-450 font-normal">{item.seller?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-normal">₹{item.price}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-normal">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-black dark:text-white">₹{item.total}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400 font-normal">{new Date(item.updated_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-3 flex justify-between items-center border-t border-neutral-955/10 dark:border-neutral-800 text-xs">
                            <button
                                disabled={cancelledPage <= 1}
                                onClick={() => setCancelledPage(cancelledPage - 1)}
                                className="px-3 py-1.5 border border-neutral-950/10 rounded-[10px] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white transition-all shadow-none"
                            >
                                Previous
                            </button>
                            <span className="text-neutral-500 dark:text-neutral-450 font-normal">Page {cancelledPage} of {cancelledTotalPages}</span>
                            <button
                                disabled={cancelledPage >= cancelledTotalPages}
                                onClick={() => setCancelledPage(cancelledPage + 1)}
                                className="px-3 py-1.5 border border-neutral-950/10 rounded-[10px] hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-white transition-all shadow-none"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Manual Initiate Refund Request Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] shadow-none w-full max-w-md overflow-hidden border border-neutral-950/15">
                        <div className="flex justify-between items-center p-5 border-b border-neutral-950/10 bg-neutral-50 dark:bg-neutral-850 dark:border-neutral-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Initiate Manual Refund</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-neutral-450 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRefund} className="p-6 space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-wider mb-1.5 uppercase">Select Order (Paid)</label>
                                <div className="relative w-full">
                                    <select
                                        required
                                        value={manualOrderId}
                                        onChange={(e) => {
                                            setManualOrderId(e.target.value);
                                            const selectedOrd = ordersList.find(o => o.id === parseInt(e.target.value));
                                            if (selectedOrd) setManualAmount(selectedOrd.final_amount);
                                        }}
                                        className="w-full h-10 pl-3.5 pr-10 border border-neutral-950/15 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-semibold text-gray-900 dark:text-white transition-all text-xs outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Select Paid Order --</option>
                                        {ordersList.map(o => (
                                            <option key={o.id} value={o.id}>
                                                {o.order_number} ({o.user?.name || 'Guest'}) - ₹{o.final_amount}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-wider mb-1.5 uppercase">Refund Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={manualAmount}
                                    onChange={(e) => setManualAmount(e.target.value)}
                                    className="w-full h-10 px-3.5 border border-neutral-950/15 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-semibold text-gray-900 dark:text-white transition-all text-xs outline-none"
                                    placeholder="Enter Refund Amount"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-wider mb-1.5 uppercase">Reason for Refund</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={manualReason}
                                    onChange={(e) => setManualReason(e.target.value)}
                                    className="w-full p-3.5 border border-neutral-950/15 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-normal text-gray-700 dark:text-gray-300 transition-all text-xs outline-none resize-none leading-relaxed"
                                    placeholder="Customer requested return for damaged items"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-wider mb-1.5 uppercase">Admin Notes</label>
                                <textarea
                                    rows={2}
                                    value={manualNotes}
                                    onChange={(e) => setManualNotes(e.target.value)}
                                    className="w-full p-3.5 border border-neutral-950/15 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-normal text-gray-700 dark:text-gray-300 transition-all text-xs outline-none resize-none leading-relaxed"
                                    placeholder="Any internal processing notes..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-5 py-2.5 border border-neutral-950/10 text-neutral-600 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 font-medium rounded-[10px] text-xs transition-colors bg-transparent"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={manualLoading}
                                    className="flex-1 py-2.5 bg-black text-white dark:bg-white dark:text-black font-medium rounded-[10px] hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors text-xs border border-transparent shadow-none"
                                >
                                    {manualLoading ? 'Initiating...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Refund Approval Confirmation Modal */}
            {confirmApproveOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] shadow-none w-full max-w-md overflow-hidden border border-neutral-950/15">
                        <div className="flex justify-between items-center p-5 border-b border-neutral-950/10 bg-neutral-50 dark:bg-neutral-850 dark:border-neutral-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Approve Refund Request</h3>
                            <button onClick={() => setConfirmApproveOpen(false)} className="text-neutral-450 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-xs font-semibold">
                            <div className="bg-neutral-50 dark:bg-neutral-850 border border-neutral-950/10 dark:border-neutral-800 rounded-[10px] p-4 text-xs text-neutral-700 dark:text-neutral-300 font-normal leading-relaxed">
                                <p className="font-semibold text-black dark:text-white">Important Return Package Verification</p>
                                <p className="text-[11px] text-neutral-500 mt-1">
                                    Verify that the customer's return package has safely arrived at the warehouse and that the return has been formally accepted.
                                </p>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer select-none pt-2 font-semibold">
                                <input
                                    type="checkbox"
                                    checked={confirmPackageReceived}
                                    onChange={(e) => setConfirmPackageReceived(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 text-black border-neutral-950/15 rounded-[4px] focus:ring-black cursor-pointer bg-transparent"
                                />
                                <span className="text-xs text-neutral-800 dark:text-neutral-200 font-normal">
                                    I confirm return package is received and return is accepted.
                                </span>
                            </label>

                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-wider mb-1.5 uppercase mt-2">Admin Remarks / Notes</label>
                                <textarea
                                    rows={2}
                                    value={confirmNotes}
                                    onChange={(e) => setConfirmNotes(e.target.value)}
                                    className="w-full p-3.5 border border-neutral-950/15 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-normal text-gray-700 dark:text-gray-300 transition-all text-xs outline-none resize-none leading-relaxed"
                                    placeholder="Enter details about return shipment validation..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setConfirmApproveOpen(false)}
                                    className="px-5 py-2.5 border border-neutral-950/10 text-neutral-600 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 font-medium rounded-[10px] text-xs transition-colors bg-transparent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={confirmLoading || !confirmPackageReceived}
                                    className="flex-1 py-2.5 bg-black text-white dark:bg-white dark:text-black font-medium rounded-[10px] hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors text-xs border border-transparent shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {confirmLoading ? 'Approving...' : 'Process Refund'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Rejection Modal */}
            {confirmRejectOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] shadow-none w-full max-w-md overflow-hidden border border-neutral-950/15">
                        <div className="flex justify-between items-center p-5 border-b border-neutral-950/10 bg-neutral-50 dark:bg-neutral-850 dark:border-neutral-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Reject Refund Request</h3>
                            <button onClick={() => setConfirmRejectOpen(false)} className="text-neutral-450 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 text-xs font-semibold">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 tracking-wider mb-1.5 uppercase">Reason for Rejection</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    className="w-full p-3.5 border border-neutral-950/15 rounded-[10px] bg-neutral-50/50 dark:bg-gray-800/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black font-normal text-gray-700 dark:text-gray-300 transition-all text-xs outline-none resize-none leading-relaxed"
                                    placeholder="State the reason why refund request is rejected (e.g. package not returned or damaged)..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setConfirmRejectOpen(false)}
                                    className="px-5 py-2.5 border border-neutral-950/10 text-neutral-600 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 font-medium rounded-[10px] text-xs transition-colors bg-transparent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={confirmRejectLoading}
                                    className="flex-1 py-2.5 bg-black text-white dark:bg-white dark:text-black font-medium rounded-[10px] hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors text-xs border border-transparent shadow-none"
                                >
                                    {confirmRejectLoading ? 'Rejecting...' : 'Reject Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
