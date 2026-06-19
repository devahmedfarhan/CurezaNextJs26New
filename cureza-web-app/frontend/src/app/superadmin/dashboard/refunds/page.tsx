'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import api from '@/lib/api';

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
    const [activeTab, setActiveTab] = useState<'refunds' | 'cancelled'>('refunds');

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Refunds & Cancellations</h1>
                    <p className="text-gray-500">Manage refund requests and order cancellations</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadPaidOrders}
                        className="bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold shadow-sm transition-colors text-sm"
                    >
                        Initiate Manual Refund
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('refunds')}
                        className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all ${activeTab === 'refunds'
                            ? 'border-cureza-green text-cureza-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Refund Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all ${activeTab === 'cancelled'
                            ? 'border-cureza-green text-cureza-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Cancelled Products
                    </button>
                </nav>
            </div>

            {activeTab === 'refunds' ? (
                <>
                    {/* Search and Filter Bar */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-cureza-green focus:border-cureza-green sm:text-sm transition-colors"
                                placeholder="Search by Refund ID or Order #..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['All', 'pending', 'approved', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === status
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Refunds List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={8} className="px-6 py-4 text-center">Loading...</td></tr>
                                    ) : refunds.length === 0 ? (
                                        <tr><td colSpan={8} className="px-6 py-4 text-center">No refund requests found.</td></tr>
                                    ) : (
                                        refunds.map((refund) => (
                                            <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{refund.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-cureza-green hover:underline cursor-pointer">{refund.order?.order_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{refund.user?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{refund.amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{refund.reason}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        refund.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {refund.status === 'approved' && <CheckCircle size={12} />}
                                                        {refund.status === 'rejected' && <XCircle size={12} />}
                                                        {refund.status === 'pending' && <AlertCircle size={12} />}
                                                        {refund.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(refund.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {refund.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => openApproveModal(refund.id)} className="text-green-600 hover:text-green-900" title="Approve">
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button onClick={() => openRejectModal(refund.id)} className="text-red-600 hover:text-red-900" title="Reject">
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 font-medium italic">Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Search and Filters for Cancelled Items */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-cureza-green focus:border-cureza-green sm:text-sm transition-colors"
                                placeholder="Search by Product or Order #..."
                                value={cancelledSearch}
                                onChange={(e) => setCancelledSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Cancelled Items Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Description</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {cancelledLoading ? (
                                        <tr><td colSpan={9} className="px-6 py-4 text-center">Loading...</td></tr>
                                    ) : cancelledItems.length === 0 ? (
                                        <tr><td colSpan={9} className="px-6 py-4 text-center">No cancelled products found.</td></tr>
                                    ) : (
                                        cancelledItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{item.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cureza-green">{item.order?.order_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.order?.user?.name || 'Guest'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.product_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.seller?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-650">₹{item.price}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-650">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">₹{item.total}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.updated_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
                            <button disabled={cancelledPage <= 1} onClick={() => setCancelledPage(cancelledPage - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                            <span className="text-sm text-gray-600">Page {cancelledPage} of {cancelledTotalPages}</span>
                            <button disabled={cancelledPage >= cancelledTotalPages} onClick={() => setCancelledPage(cancelledPage + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                        </div>
                    </div>
                </>
            )}

            {/* Manual Initiate Refund Request Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Initiate Manual Refund</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRefund} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Order (Paid)</label>
                                <select
                                    required
                                    value={manualOrderId}
                                    onChange={(e) => {
                                        setManualOrderId(e.target.value);
                                        const selectedOrd = ordersList.find(o => o.id === parseInt(e.target.value));
                                        if (selectedOrd) setManualAmount(selectedOrd.final_amount);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green text-sm"
                                >
                                    <option value="">-- Select Paid Order --</option>
                                    {ordersList.map(o => (
                                        <option key={o.id} value={o.id}>
                                            {o.order_number} ({o.user?.name || 'Guest'}) - ₹{o.final_amount}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={manualAmount}
                                    onChange={(e) => setManualAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green"
                                    placeholder="Enter Refund Amount"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Refund</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={manualReason}
                                    onChange={(e) => setManualReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Customer requested return for damaged items"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                                <textarea
                                    rows={2}
                                    value={manualNotes}
                                    onChange={(e) => setManualNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Any internal processing notes..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={manualLoading}
                                    className="px-4 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-900 text-lg">Approve Refund Request</h3>
                            <button onClick={() => setConfirmApproveOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                                <p className="font-semibold">Important Return Package Verification</p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Verify that the customer's return package has safely arrived at the warehouse and that the return has been formally accepted.
                                </p>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer select-none pt-2">
                                <input
                                    type="checkbox"
                                    checked={confirmPackageReceived}
                                    onChange={(e) => setConfirmPackageReceived(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-cureza-green border-gray-300 rounded focus:ring-cureza-green"
                                />
                                <span className="text-sm font-semibold text-gray-800">
                                    I confirm return package is received and return is accepted.
                                </span>
                            </label>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Admin Remarks / Notes</label>
                                <textarea
                                    rows={2}
                                    value={confirmNotes}
                                    onChange={(e) => setConfirmNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Enter details about return shipment validation..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmApproveOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={confirmLoading || !confirmPackageReceived}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 transition-colors"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-900 text-lg">Reject Refund Request</h3>
                            <button onClick={() => setConfirmRejectOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="State the reason why refund request is rejected (e.g. package not returned or damaged)..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmRejectOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={confirmRejectLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 transition-colors"
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
