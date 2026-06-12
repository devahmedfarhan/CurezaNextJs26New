'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
    Loader2, Landmark, User, ShieldCheck, Clock, CheckCircle,
    XCircle, Eye, AlertTriangle, ChevronRight, Search, Filter
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';

export default function AdminSellerRequestsPage() {
    const { showToast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await axios.get('/admin/seller-requests?status=pending');
            setRequests(res.data.data);
        } catch (err) {
            showToast("Failed to fetch requests", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Are you sure you want to approve this request? Changes will be applied immediately.")) return;

        setIsProcessing(true);
        try {
            await axios.post(`/admin/seller-requests/${id}/approve`);
            showToast("Request approved successfully", "success");
            fetchRequests();
            setSelectedRequest(null);
        } catch (err) {
            showToast("Approval failed", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) return showToast("Please provide a reason", "warning");

        setIsProcessing(true);
        try {
            await axios.post(`/admin/seller-requests/${selectedRequest.id}/reject`, {
                rejection_reason: rejectionReason
            });
            showToast("Request rejected", "success");
            fetchRequests();
            setSelectedRequest(null);
            setShowRejectDialog(false);
            setRejectionReason('');
        } catch (err) {
            showToast("Rejection failed", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-cureza-green" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Seller Change Requests</h1>
                    <p className="text-gray-500">Review and manage seller profile, bank, and KYC updates.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Seller</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Section</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Submitted At</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No pending requests found.</td>
                            </tr>
                        )}
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cureza-green/10 flex items-center justify-center text-cureza-green font-bold">
                                            {req.seller?.name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{req.seller?.name}</p>
                                            <p className="text-xs text-gray-500">{req.seller?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.section === 'bank' ? 'bg-blue-100 text-blue-700' :
                                            req.section === 'profile' ? 'bg-purple-100 text-purple-700' :
                                                'bg-orange-100 text-orange-700'
                                        }`}>
                                        {req.section}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(req.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedRequest(req)}
                                        className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                                    >
                                        <Eye size={16} />
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Comparison Dialog */}
            {selectedRequest && (
                <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                                Review {selectedRequest.section.toUpperCase()} Request
                                <span className="text-sm font-normal text-gray-500">from {selectedRequest.seller?.name}</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-8 py-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest border-b pb-2">Original Data</h3>
                                <div className="space-y-3">
                                    {Object.entries(selectedRequest.old_data || {}).map(([key, val]) => (
                                        <div key={key} className="bg-gray-50 p-3 rounded-xl border border-dashed">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-sm text-gray-500 break-words">{String(val || 'N/A')}</p>
                                        </div>
                                    ))}
                                    {(!selectedRequest.old_data || Object.keys(selectedRequest.old_data).length === 0) && (
                                        <p className="text-sm text-gray-400 italic">No existing data found.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-cureza-green uppercase text-xs tracking-widest border-b pb-2">Proposed Changes</h3>
                                <div className="space-y-3">
                                    {Object.entries(selectedRequest.new_data || {}).map(([key, val]) => {
                                        const isChanged = selectedRequest.old_data?.[key] !== val;
                                        return (
                                            <div key={key} className={`p-3 rounded-xl border ${isChanged ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                                                {key.includes('image') ? (
                                                    <a href={String(val)} target="_blank" className="text-blue-600 font-bold text-sm underline flex items-center gap-1">
                                                        View Document <Eye size={14} />
                                                    </a>
                                                ) : (
                                                    <p className={`text-sm font-bold ${isChanged ? 'text-green-800' : 'text-gray-600'} break-words`}>{String(val || 'N/A')}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-4 flex-row sm:justify-end">
                            <button
                                onClick={() => setShowRejectDialog(true)}
                                className="px-6 py-2 rounded-full border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                            >
                                <XCircle size={18} />
                                Reject Request
                            </button>
                            <button
                                onClick={() => handleApprove(selectedRequest.id)}
                                disabled={isProcessing}
                                className="px-8 py-2 rounded-full bg-cureza-green text-white font-bold hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                Approve & Apply
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Rejection Reason Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <label className="text-sm font-bold text-gray-600">Please provide a reason for rejection:</label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full h-32 p-4 rounded-xl border focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                            placeholder="e.g. Invalid IFSC code, Blurred Aadhaar image..."
                        />
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => setShowRejectDialog(false)}
                            className="px-4 py-2 text-sm font-bold text-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="px-6 py-2 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-all"
                        >
                            {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
