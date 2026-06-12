'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft,
    Loader2,
    Check,
    X,
    User,
    Calendar,
    Package,
    Edit,
    Trash2,
    Plus,
    ArrowRight,
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
    changes?: Record<string, { old: any; new: any }>;
    product: {
        id: number;
        title: string;
        image: string | null;
        price: number;
        status: string;
        short_description: string;
        brand?: { name: string };
        category?: { name: string };
    };
    seller: {
        id: number;
        name: string;
        email: string;
    };
    reviewer?: {
        id: number;
        name: string;
    };
}

// Change type badge component
const ChangeTypeBadge = ({ type }: { type: string }) => {
    const config = {
        create: { bg: 'bg-green-100', text: 'text-green-700', icon: Plus, label: 'New Product' },
        edit: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Edit, label: 'Edit Request' },
        delete: { bg: 'bg-red-100', text: 'text-red-700', icon: Trash2, label: 'Delete Request' },
    }[type] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle, label: type };

    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
            <Icon size={16} />
            {config.label}
        </span>
    );
};

// Diff row component for showing field changes
const DiffRow = ({ field, oldValue, newValue }: { field: string; oldValue: any; newValue: any }) => {
    // Format the field name for display
    const formatFieldName = (name: string) => {
        return name
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Format values for display
    const formatValue = (value: any) => {
        if (value === null || value === undefined) return <span className="text-gray-400 italic">Empty</span>;
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        if (typeof value === 'string' && value.length > 200) return value.substring(0, 200) + '...';
        return String(value);
    };

    return (
        <tr className="border-b border-gray-100 last:border-0">
            <td className="py-3 px-4 text-sm font-medium text-gray-700 w-1/4">
                {formatFieldName(field)}
            </td>
            <td className="py-3 px-4 text-sm bg-red-50/50 w-5/12">
                <div className="text-red-700 break-words">{formatValue(oldValue)}</div>
            </td>
            <td className="py-1 px-2 w-8">
                <ArrowRight className="text-gray-400" size={16} />
            </td>
            <td className="py-3 px-4 text-sm bg-green-50/50 w-5/12">
                <div className="text-green-700 break-words">{formatValue(newValue)}</div>
            </td>
        </tr>
    );
};

export default function ChangeRequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [request, setRequest] = useState<ChangeRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchChangeRequest();
        }
    }, [params.id]);

    const fetchChangeRequest = async () => {
        try {
            const res = await api.get(`/admin/change-requests/${params.id}`);
            setRequest(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load change request', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!request) return;

        setProcessing(true);
        try {
            await api.post(`/admin/change-requests/${request.id}/approve`);
            showToast('Change request approved successfully', 'success');
            router.push('/superadmin/dashboard/products/change-requests');
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to approve request', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!request || !rejectReason.trim()) {
            showToast('Please provide a rejection reason', 'warning');
            return;
        }

        setProcessing(true);
        try {
            await api.post(`/admin/change-requests/${request.id}/reject`, {
                reason: rejectReason.trim()
            });
            showToast('Change request rejected', 'success');
            router.push('/superadmin/dashboard/products/change-requests');
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to reject request', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-cureza-green" size={32} />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Change request not found</p>
                <Link href="/superadmin/dashboard/products/change-requests" className="text-cureza-green hover:underline mt-2 inline-block">
                    Back to Change Requests
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Link
                        href="/superadmin/dashboard/products/change-requests"
                        className="text-sm text-gray-500 hover:text-cureza-green flex items-center gap-1 mb-2"
                    >
                        <ChevronLeft size={16} /> Back to Change Requests
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Change Request #{request.id}</h1>
                </div>
                <ChangeTypeBadge type={request.change_type} />
            </div>

            {/* Meta Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {request.product?.image ? (
                                <img src={getImageUrl(request.product.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{request.product?.title}</h3>
                            <p className="text-sm text-gray-500">{request.product?.brand?.name} • {request.product?.category?.name}</p>
                            <p className="text-sm font-medium text-gray-700 mt-1">₹{request.product?.price}</p>
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Submitted By</h3>
                            <p className="text-sm text-gray-500">{request.seller?.name}</p>
                            <p className="text-xs text-gray-400">{request.seller?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Submission Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Submitted On</h3>
                            <p className="text-sm text-gray-500">{formatDate(request.created_at)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Changes Diff View (for edit requests) */}
            {request.change_type === 'edit' && request.changes && Object.keys(request.changes).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">Proposed Changes</h2>
                        <p className="text-sm text-gray-500">Review the changes before approving</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Current Value</th>
                                    <th className="py-2 px-4"></th>
                                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">Proposed Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(request.changes).map(([field, change]) => (
                                    <DiffRow
                                        key={field}
                                        field={field}
                                        oldValue={change.old}
                                        newValue={change.new}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* New Product Details (for create requests) */}
            {request.change_type === 'create' && request.proposed_data && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">New Product Details</h2>
                        <p className="text-sm text-gray-500">Review the product details before approving</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(request.proposed_data)
                            .filter(([key]) => !['id', 'created_at', 'updated_at', 'deleted_at', 'seller_id'].includes(key))
                            .map(([key, value]) => (
                                <div key={key} className="border-b border-gray-100 pb-3">
                                    <span className="text-xs text-gray-500 uppercase">{key.replace(/_/g, ' ')}</span>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {value === null ? <span className="text-gray-400 italic">Not set</span> :
                                            typeof value === 'object' ? JSON.stringify(value) :
                                                String(value)}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Delete Request Confirmation */}
            {request.change_type === 'delete' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <Trash2 className="text-red-600" size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-800">Delete Request</h3>
                            <p className="text-red-700 mt-1">
                                The seller has requested to delete this product. If approved, the product will be soft-deleted
                                and no longer visible to customers.
                            </p>
                            <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                                <p className="text-sm text-gray-600">
                                    <strong>Product:</strong> {request.product?.title}<br />
                                    <strong>Price:</strong> ₹{request.product?.price}<br />
                                    <strong>Brand:</strong> {request.product?.brand?.name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {request.status === 'pending' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Take Action</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleApprove}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {processing ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                            Approve {request.change_type === 'create' ? 'Product' : request.change_type === 'edit' ? 'Changes' : 'Deletion'}
                        </button>
                        <button
                            onClick={() => setRejectModalOpen(true)}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                            <X size={20} />
                            Reject Request
                        </button>
                    </div>
                </div>
            )}

            {/* Status if already processed */}
            {request.status !== 'pending' && (
                <div className={`rounded-xl border p-6 ${request.status === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        {request.status === 'approved' ? (
                            <Check className="text-green-600" size={24} />
                        ) : (
                            <X className="text-red-600" size={24} />
                        )}
                        <div>
                            <h3 className={`font-semibold ${request.status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                                Request {request.status === 'approved' ? 'Approved' : 'Rejected'}
                            </h3>
                            {request.reviewed_at && (
                                <p className={`text-sm ${request.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                    on {formatDate(request.reviewed_at)}
                                    {request.reviewer && ` by ${request.reviewer.name}`}
                                </p>
                            )}
                            {request.rejection_reason && (
                                <p className="text-sm text-red-700 mt-2">
                                    <strong>Reason:</strong> {request.rejection_reason}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                            Please provide a reason for rejecting this {request.change_type} request.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Explain why this request is being rejected..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setRejectModalOpen(false);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || processing}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing && <Loader2 size={16} className="animate-spin" />}
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
