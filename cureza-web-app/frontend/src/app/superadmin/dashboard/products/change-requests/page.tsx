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
        create: { bg: 'bg-green-100', text: 'text-green-700', icon: Plus, label: 'New Product' },
        edit: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Edit, label: 'Edit Request' },
        delete: { bg: 'bg-red-100', text: 'text-red-700', icon: Trash2, label: 'Delete Request' },
    }[type] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle, label: type };

    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
            <Icon size={12} />
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
                    <p className="text-gray-500">Review and approve seller product changes</p>
                </div>
                <Link
                    href="/superadmin/dashboard/products"
                    className="text-sm text-cureza-green hover:underline flex items-center gap-1"
                >
                    <ChevronLeft size={16} /> Back to Products
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Clock className="text-yellow-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                <p className="text-xs text-gray-500">Total Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Plus className="text-green-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending_create}</p>
                                <p className="text-xs text-gray-500">New Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Edit className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending_edit}</p>
                                <p className="text-xs text-gray-500">Edit Requests</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <Trash2 className="text-red-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending_delete}</p>
                                <p className="text-xs text-gray-500">Delete Requests</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-cureza-green focus:border-cureza-green sm:text-sm"
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
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-cureza-green text-sm"
                >
                    <option value="">All Types</option>
                    <option value="create">New Products</option>
                    <option value="edit">Edit Requests</option>
                    <option value="delete">Delete Requests</option>
                </select>
            </div>

            {/* Change Requests Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="animate-spin text-cureza-green" size={32} />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">No pending change requests</p>
                        <p className="text-sm mt-1">All seller requests have been reviewed</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                                    {request.product?.image ? (
                                                        <img src={getImageUrl(request.product.image)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{request.product?.title || 'Unknown Product'}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {request.product?.brand?.name} • ₹{request.product?.price}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{request.seller?.name}</div>
                                            <div className="text-xs text-gray-500">{request.seller?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <ChangeTypeBadge type={request.change_type} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(request.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/superadmin/dashboard/products/change-requests/${request.id}`}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={processingId === request.id}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    {processingId === request.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Check size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(request)}
                                                    disabled={processingId === request.id}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    <X size={18} />
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
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <X className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Reject Change Request</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Rejecting <strong>{requestToReject?.change_type}</strong> request for <strong>"{requestToReject?.product?.title}"</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Provide a reason for rejection..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setRejectModalOpen(false);
                                    setRequestToReject(null);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={processingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || processingId !== null}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processingId && <Loader2 size={16} className="animate-spin" />}
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
