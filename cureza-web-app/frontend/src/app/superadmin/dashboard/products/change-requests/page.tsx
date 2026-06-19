'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    Check,
    X,
    Eye,
    Loader2,
    Clock,
    Edit,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { getImageUrl } from '@/lib/imageHelper';

interface ChangeRequest {
    id: number;
    product_id: number;
    seller_id: number;
    change_type: 'create' | 'edit' | 'delete';
    proposed_data: any;
    original_data: any;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    created_at: string;
    product: {
        id: number;
        title: string;
        image: string | null;
        price: number;
        status: string;
        brand?: { name: string };
        category?: { name: string };
    };
    seller: {
        id: number;
        name: string;
        email: string;
    };
}

interface Stats {
    pending: number;
    pending_create: number;
    pending_edit: number;
    pending_delete: number;
}

// Badge component for change type
const ChangeTypeBadge = ({ type }: { type: string }) => {
    const config = {
        create: { bg: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200/30', icon: Plus, label: 'New Product' },
        edit: { bg: 'bg-neutral-50 dark:bg-gray-850 text-neutral-800 dark:text-neutral-200 border-neutral-250/20', icon: Edit, label: 'Edit Request' },
        delete: { bg: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/30', icon: Trash2, label: 'Delete Request' },
    }[type] || { bg: 'bg-neutral-50 dark:bg-gray-850 text-neutral-800 dark:text-neutral-200 border-neutral-250/20', icon: AlertCircle, label: type };

    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${config.bg}`}>
            <Icon size={11} />
            {config.label}
        </span>
    );
};

export default function ChangeRequestsPage() {
    const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<ChangeRequest | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        fetchChangeRequests();
        fetchStats();
    }, [typeFilter, currentPage]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/change-requests/stats');
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchChangeRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('status', 'pending');
            if (typeFilter) params.append('type', typeFilter);
            params.append('page', currentPage.toString());

            const res = await api.get(`/admin/change-requests?${params.toString()}`);
            setChangeRequests(res.data.data || res.data);
            setTotalPages(res.data.last_page || 1);
        } catch (error) {
            console.error(error);
            showToast('Failed to load change requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        setProcessingId(id);
        try {
            await api.post(`/admin/change-requests/${id}/approve`);
            showToast('Change request approved successfully', 'success');
            fetchChangeRequests();
            fetchStats();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to approve request', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (request: ChangeRequest) => {
        setRequestToReject(request);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!requestToReject || !rejectReason.trim()) {
            showToast('Please provide a rejection reason', 'warning');
            return;
        }

        setProcessingId(requestToReject.id);
        try {
            await api.post(`/admin/change-requests/${requestToReject.id}/reject`, {
                reason: rejectReason.trim()
            });
            showToast('Change request rejected', 'success');
            setRejectModalOpen(false);
            setRequestToReject(null);
            setRejectReason('');
            fetchChangeRequests();
            fetchStats();
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to reject request', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = changeRequests.filter(request =>
        request.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-550">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-[0.5px] border-neutral-950/15 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 rounded-[10px]">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Change Requests</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Review and approve seller product changes</p>
                </div>
                <Link
                    href="/superadmin/dashboard/products"
                    className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1"
                >
                    <ChevronLeft size={14} /> Back to Products
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-100 dark:bg-gray-800 rounded-md text-neutral-600 dark:text-neutral-400">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-white">{stats.pending}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-100 dark:bg-gray-800 rounded-md text-neutral-600 dark:text-neutral-400">
                                <Plus size={16} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-white">{stats.pending_create}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">New Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-100 dark:bg-gray-800 rounded-md text-neutral-600 dark:text-neutral-400">
                                <Edit size={16} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-white">{stats.pending_edit}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Edit Requests</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-100 dark:bg-gray-800 rounded-md text-neutral-600 dark:text-neutral-400">
                                <Trash2 size={16} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-white">{stats.pending_delete}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delete Requests</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-9 pr-3 py-2 border-[0.5px] border-neutral-950/15 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/35 placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-[1.5px] focus:ring-black/10 focus:border-black dark:focus:ring-white/10 dark:focus:border-white text-xs"
                        placeholder="Search by product or seller..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-3 py-2 border-[0.5px] border-neutral-950/15 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-[1.5px] focus:ring-black/10 text-xs cursor-pointer font-medium"
                >
                    <option value="">All Types</option>
                    <option value="create">New Products</option>
                    <option value="edit">Edit Requests</option>
                    <option value="delete">Delete Requests</option>
                </select>
            </div>

            {/* Change Requests Table */}
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="animate-spin text-black dark:text-white" size={24} />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-12 text-center text-gray-550 dark:text-gray-400">
                        <Clock size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                        <p className="font-bold text-sm">No Pending Change Requests</p>
                        <p className="text-xs text-gray-400 mt-0.5">All seller requests have been reviewed.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-950/10 dark:divide-gray-800">
                            <thead className="bg-neutral-50/50 dark:bg-gray-850/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Seller</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wider">Submitted</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-neutral-950/5 dark:divide-gray-850 text-xs">
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-neutral-50/50 dark:hover:bg-gray-850/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 shrink-0 bg-neutral-50 dark:bg-gray-850 border-[0.5px] border-neutral-950/10 rounded-lg overflow-hidden flex items-center justify-center text-gray-400">
                                                    {request.product?.image ? (
                                                        <img src={getImageUrl(request.product.image)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                                    )}
                                                </div>
                                                <div className="ml-4 min-w-0">
                                                    <div className="text-gray-950 dark:text-gray-100 font-bold truncate max-w-[200px]">{request.product?.title || 'Unknown Product'}</div>
                                                    <div className="text-[9px] text-gray-450 dark:text-gray-400 font-medium">
                                                        {request.product?.brand?.name} • ₹{request.product?.price}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-650 dark:text-gray-300 font-medium">
                                            <div>{request.seller?.name}</div>
                                            <div className="text-[10px] text-gray-400">{request.seller?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <ChangeTypeBadge type={request.change_type} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {formatDate(request.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/superadmin/dashboard/products/change-requests/${request.id}`}
                                                    className="p-1.5 text-gray-400 hover:text-black hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={processingId === request.id}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-md transition-colors disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {processingId === request.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Check size={14} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(request)}
                                                    disabled={processingId === request.id}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-neutral-950/10 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 border border-neutral-950/15 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-gray-850"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 border border-neutral-950/15 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-neutral-50 dark:hover:bg-gray-850"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 rounded-[10px] p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 rounded-md text-red-600">
                                <X size={20} />
                            </div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Reject Change Request</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            Rejecting <strong>{requestToReject?.change_type}</strong> request for <strong>"{requestToReject?.product?.title}"</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Provide a reason for rejection..."
                                className="w-full px-3 py-2 border-[0.5px] border-neutral-950/15 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-[1.5px] focus:ring-black/10 focus:border-black dark:focus:ring-white/10 dark:focus:border-white text-xs min-h-[100px] resize-none leading-relaxed"
                            />
                        </div>
                        <div className="flex gap-3 justify-end text-xs">
                            <button
                                onClick={() => {
                                    setRejectModalOpen(false);
                                    setRequestToReject(null);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-gray-750 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                                disabled={processingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || processingId !== null}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                {processingId && <Loader2 size={12} className="animate-spin" />}
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
