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
        create: { bg: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200/30', icon: Plus, label: 'New Product' },
        edit: { bg: 'bg-neutral-50 dark:bg-gray-850 text-neutral-800 dark:text-neutral-200 border-neutral-250/20', icon: Edit, label: 'Edit Request' },
        delete: { bg: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/30', icon: Trash2, label: 'Delete Request' },
    }[type] || { bg: 'bg-neutral-50 dark:bg-gray-850 text-neutral-800 dark:text-neutral-200 border-neutral-250/20', icon: AlertCircle, label: type };

    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${config.bg}`}>
            <Icon size={12} />
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
        <tr className="border-b border-neutral-950/5 dark:border-gray-850 last:border-0">
            <td className="py-3 px-4 text-xs font-bold text-gray-700 dark:text-gray-300 w-1/4">
                {formatFieldName(field)}
            </td>
            <td className="py-3 px-4 text-xs bg-red-50/20 w-5/12">
                <div className="text-red-700 dark:text-red-450 break-words font-medium">{formatValue(oldValue)}</div>
            </td>
            <td className="py-1 px-2 w-8 text-center">
                <ArrowRight className="text-gray-400 mx-auto" size={14} />
            </td>
            <td className="py-3 px-4 text-xs bg-green-50/20 w-5/12">
                <div className="text-green-700 dark:text-green-400 break-words font-medium">{formatValue(newValue)}</div>
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
                <Loader2 className="animate-spin text-black dark:text-white" size={24} />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="text-center py-12">
                <p className="text-xs text-gray-550">Change request not found</p>
                <Link href="/superadmin/dashboard/products/change-requests" className="text-xs text-black dark:text-white hover:underline mt-2 inline-block font-bold">
                    Back to Change Requests
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-550">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-[0.5px] border-neutral-950/15 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 rounded-[10px]">
                <div>
                    <Link
                        href="/superadmin/dashboard/products/change-requests"
                        className="text-[11px] font-bold text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 mb-1.5"
                    >
                        <ChevronLeft size={12} /> Back to Change Requests
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Change Request #{request.id}</h1>
                </div>
                <ChangeTypeBadge type={request.change_type} />
            </div>

            {/* Meta Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Product Info */}
                <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-neutral-50 dark:bg-gray-850 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border-[0.5px] border-neutral-950/10">
                            {request.product?.image ? (
                                <img src={getImageUrl(request.product.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xs text-gray-900 dark:text-white truncate">{request.product?.title}</h3>
                            <p className="text-[10px] text-gray-450 dark:text-gray-400 font-medium">{request.product?.brand?.name} • {request.product?.category?.name}</p>
                            <p className="text-xs font-extrabold text-gray-800 dark:text-neutral-200 mt-1">₹{request.product?.price}</p>
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-100 dark:bg-gray-800 rounded-md text-neutral-600 dark:text-neutral-400">
                            <User size={16} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xs text-gray-900 dark:text-white">Submitted By</h3>
                            <p className="text-[11px] text-gray-650 dark:text-gray-300 font-medium">{request.seller?.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{request.seller?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Submission Info */}
                <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-neutral-100 dark:bg-gray-800 rounded-md text-neutral-600 dark:text-neutral-400">
                            <Calendar size={16} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xs text-gray-900 dark:text-white">Submitted On</h3>
                            <p className="text-[11px] text-gray-650 dark:text-gray-300 font-medium">{formatDate(request.created_at)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Changes Diff View (for edit requests) */}
            {request.change_type === 'edit' && request.changes && Object.keys(request.changes).length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-950/10 dark:border-gray-800 bg-neutral-50/30">
                        <h2 className="font-bold text-sm text-gray-900 dark:text-white">Proposed Changes</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Review the changes before approving</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50/20 dark:bg-gray-850/30 border-b border-neutral-950/5">
                                <tr>
                                    <th className="py-2 px-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Field</th>
                                    <th className="py-2 px-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Value</th>
                                    <th className="py-2 px-4"></th>
                                    <th className="py-2 px-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Proposed Value</th>
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
                <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-950/10 dark:border-gray-800 bg-neutral-50/30">
                        <h2 className="font-bold text-sm text-gray-900 dark:text-white">New Product Details</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Review the product details before approving</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        {Object.entries(request.proposed_data)
                            .filter(([key]) => !['id', 'created_at', 'updated_at', 'deleted_at', 'seller_id'].includes(key))
                            .map(([key, value]) => (
                                <div key={key} className="border-b border-neutral-950/5 pb-2.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                                    <p className="text-xs text-gray-900 dark:text-white mt-1 leading-relaxed">
                                        {value === null ? <span className="text-gray-450 italic">Not set</span> :
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
                <div className="bg-red-50/20 border-[0.5px] border-red-200/50 rounded-[10px] p-5">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-red-50 rounded-md text-red-600">
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-red-800 dark:text-red-400">Delete Request</h3>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                                The seller has requested to delete this product. If approved, the product will be soft-deleted
                                and no longer visible to customers.
                            </p>
                            <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border-[0.5px] border-red-200/35">
                                <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed">
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
                <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-neutral-950/15 dark:border-gray-800 p-6">
                    <h2 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Take Action</h2>
                    <div className="flex flex-col sm:flex-row gap-4 text-xs font-bold">
                        <button
                            onClick={handleApprove}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Approve {request.change_type === 'create' ? 'Product' : request.change_type === 'edit' ? 'Changes' : 'Deletion'}
                        </button>
                        <button
                            onClick={() => setRejectModalOpen(true)}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-700 border-[0.5px] border-red-200/30 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <X size={16} />
                            Reject Request
                        </button>
                    </div>
                </div>
            )}

            {/* Status if already processed */}
            {request.status !== 'pending' && (
                <div className={`rounded-[10px] border-[0.5px] p-6 ${request.status === 'approved'
                        ? 'bg-green-50/20 border-green-200/40 text-green-900 dark:text-green-400'
                        : 'bg-red-50/20 border-red-200/40 text-red-900 dark:text-red-400'
                    }`}>
                    <div className="flex items-center gap-3">
                        {request.status === 'approved' ? (
                            <Check className="text-green-600" size={20} />
                        ) : (
                            <X className="text-red-600" size={20} />
                        )}
                        <div>
                            <h3 className="font-bold text-sm">
                                Request {request.status === 'approved' ? 'Approved' : 'Rejected'}
                            </h3>
                            {request.reviewed_at && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    on {formatDate(request.reviewed_at)}
                                    {request.reviewer && ` by ${request.reviewer.name}`}
                                </p>
                            )}
                            {request.rejection_reason && (
                                <p className="text-xs text-red-700 dark:text-red-300 mt-2 font-medium">
                                    <strong>Reason:</strong> {request.rejection_reason}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-850 rounded-[10px] p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 rounded-md text-red-600">
                                <X size={20} />
                            </div>
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Reject Change Request</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            Please provide a reason for rejecting this {request.change_type} request.
                        </p>
                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Explain why this request is being rejected..."
                                className="w-full px-3 py-2 border-[0.5px] border-neutral-950/15 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-[1.5px] focus:ring-black/10 focus:border-black dark:focus:ring-white/10 dark:focus:border-white text-xs min-h-[100px] resize-none leading-relaxed"
                            />
                        </div>
                        <div className="flex gap-3 justify-end text-xs">
                            <button
                                onClick={() => {
                                    setRejectModalOpen(false);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-gray-750 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || processing}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                {processing && <Loader2 size={12} className="animate-spin" />}
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
