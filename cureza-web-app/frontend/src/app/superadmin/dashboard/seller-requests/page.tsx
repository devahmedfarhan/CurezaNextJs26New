'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
    Loader2, Landmark, User, ShieldCheck, Clock, CheckCircle,
    XCircle, Eye, AlertTriangle, ChevronRight, Search, Filter, ArrowLeft
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

    const getImageUrl = (path: any) => {
        if (!path) return '#';
        if (typeof path !== 'string') return '#';
        if (path.startsWith('http')) return path;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backendUrl}${path}` : `${backendUrl}/storage/${path}`;
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-cureza-green" size={32} />
            </div>
        );
    }

    if (selectedRequest) {
        return (
            <div className="w-full space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <button
                        onClick={() => setSelectedRequest(null)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900 border border-gray-200"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            Review {selectedRequest.section.toUpperCase()} Request
                            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${selectedRequest.section === 'bank' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                selectedRequest.section === 'profile' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    'bg-orange-50 text-orange-700 border-orange-100'
                            }`}>
                                {selectedRequest.section}
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">Submitted by <span className="font-bold text-gray-900">{selectedRequest.seller?.name}</span> ({selectedRequest.seller?.email}) on {new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Original Data */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="border-b border-gray-100 pb-3">
                            <h3 className="font-extrabold text-gray-400 uppercase text-[10px] tracking-widest">Original Data</h3>
                            <p className="text-xs text-gray-400 mt-1 font-medium">Currently active properties in the database</p>
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {Object.entries(selectedRequest.old_data || {}).map(([key, val]) => (
                                <div key={key} className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                                    <p className="text-sm font-bold text-gray-700 break-words">{String(val || 'N/A')}</p>
                                </div>
                            ))}
                            {(!selectedRequest.old_data || Object.keys(selectedRequest.old_data).length === 0) && (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-sm text-gray-400 italic font-medium">No existing records found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Proposed Changes */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="border-b border-gray-100 pb-3">
                            <h3 className="font-extrabold text-cureza-green uppercase text-[10px] tracking-widest">Proposed Changes</h3>
                            <p className="text-xs text-gray-400 mt-1 font-medium">New properties submitted for compliance clearance</p>
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {Object.entries(selectedRequest.new_data || {}).map(([key, val]) => {
                                const isChanged = selectedRequest.old_data?.[key] !== val;
                                return (
                                    <div key={key} className={`p-4 rounded-2xl border transition-all ${isChanged ? 'bg-green-50/50 border-green-200' : 'bg-gray-50/50 border-gray-100 opacity-70'}`}>
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                                        {key.includes('image') || key.includes('cheque') || key.includes('signature') || key.includes('logo') || key.includes('banner') || String(val).startsWith('/storage/') ? (
                                            <a href={getImageUrl(val)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-blue-600 px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all shadow-sm">
                                                View Document <Eye size={14} />
                                            </a>
                                        ) : (
                                            <p className={`text-sm font-extrabold ${isChanged ? 'text-green-800' : 'text-gray-700'} break-words`}>
                                                {Array.isArray(val) ? val.join(', ') : String(val || 'N/A')}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-100">
                    <button
                        onClick={() => setShowRejectDialog(true)}
                        className="px-6 py-3 rounded-2xl border border-red-200 text-red-600 font-extrabold text-sm hover:bg-red-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        <XCircle size={18} />
                        Reject Request
                    </button>
                    <button
                        onClick={() => handleApprove(selectedRequest.id)}
                        disabled={isProcessing}
                        className="px-8 py-3 rounded-2xl bg-gray-900 text-white font-extrabold text-sm hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-xl shadow-gray-200"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} className="text-cureza-green" />}
                        Approve & Apply
                    </button>
                </div>

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

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seller Change Requests</h1>
                    <p className="text-gray-500 font-medium mt-1">Review and manage seller profile, bank, and KYC updates.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/75 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Seller</th>
                            <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Section</th>
                            <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">Submitted At</th>
                            <th className="px-6 py-4 text-[10px] font-extrabold uppercase text-gray-400 tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">No pending requests found.</td>
                            </tr>
                        )}
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-cureza-green/10 flex items-center justify-center text-cureza-green font-extrabold text-sm">
                                            {req.seller?.name?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-gray-900 text-sm">{req.seller?.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{req.seller?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${req.section === 'bank' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            req.section === 'profile' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                        {req.section}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                    {new Date(req.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setSelectedRequest(req)}
                                        className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-black transition-all shadow-md shadow-gray-200/50 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Eye size={14} />
                                        Review
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
