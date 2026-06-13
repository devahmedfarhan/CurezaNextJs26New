'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Loader2, Check, X, Eye, ArrowRight, ArrowRightLeft } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function StoreApprovalsPage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [allCategoriesAndConcerns, setAllCategoriesAndConcerns] = useState<any[]>([]);

    // Approval/Rejection handling
    const [rejectReason, setRejectReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
        fetchClassifications();
    }, []);

    const fetchClassifications = async () => {
        try {
            const res = await axios.get('/categories');
            setAllCategoriesAndConcerns(res.data || []);
        } catch (e) {
            console.error('Failed to load classifications', e);
        }
    };

    const getClassificationName = (id: any) => {
        const item = allCategoriesAndConcerns.find(c => String(c.id) === String(id));
        return item ? item.name : `ID: ${id}`;
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get('/admin/store-requests?status=pending');
            setRequests(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        setIsProcessing(true);
        try {
            await axios.post(`/admin/store-requests/${selectedRequest.id}/approve`);
            showToast("Store profile updated successfully", "success");
            setIsDetailsOpen(false);
            fetchRequests();
        } catch (err) {
            showToast("Failed to approve", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!rejectReason.trim()) {
            showToast("Rejection reason is required", "error");
            return;
        }
        setIsProcessing(true);
        try {
            await axios.post(`/admin/store-requests/${selectedRequest.id}/reject`, {
                rejection_reason: rejectReason
            });
            showToast("Request rejected", "success");
            setIsDetailsOpen(false);
            setIsRejectDialogOpen(false);
            fetchRequests();
        } catch (err) {
            showToast("Failed to reject", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return '/fallback.png';
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Store Change Requests</h1>
                <span className="text-sm text-gray-500">{requests.length} pending</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Seller / Brand</th>
                            <th className="px-6 py-4">Requested On</th>
                            <th className="px-6 py-4">Updated Fields</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No pending requests found.
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                                {req.seller?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{req.brand?.name}</div>
                                                <div className="text-xs text-gray-500">by {req.seller?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {Object.keys(req.proposed_data).map(key => (
                                                req.proposed_data[key] !== req.brand?.[key === 'banner_path' ? 'banner_path' : key] && (
                                                    <span key={key} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-100">
                                                        {key.replace('_', ' ')}
                                                    </span>
                                                )
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => { setSelectedRequest(req); setIsDetailsOpen(true); }}
                                            className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* DETAILS DIALOG */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>Review Store Profile Changes</DialogTitle>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-8 py-4">

                            {/* Comparison Section */}
                             <div className="grid grid-cols-2 gap-8">
                                {/* OLD */}
                                <div className="space-y-4 opacity-70 border-r pr-4 border-gray-100">
                                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider border-b pb-2">Current Live Version</h3>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Banner</label>
                                        <div className="h-24 bg-gray-100 rounded-md overflow-hidden">
                                            <img src={getImageUrl(selectedRequest.brand?.banner_path)} className="w-full h-full object-cover grayscale" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Logo</label>
                                        <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
                                            <img src={getImageUrl(selectedRequest.brand?.logo)} className="w-full h-full object-contain grayscale" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Name</label>
                                        <div className="font-semibold text-gray-700">{selectedRequest.brand?.name}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Short Desc</label>
                                        <div className="text-sm text-gray-600">{selectedRequest.brand?.short_description}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400">SEO Title</label>
                                        <div className="text-xs text-gray-600 font-medium">{selectedRequest.brand?.meta_title || 'N/A'}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400">SEO Description</label>
                                        <div className="text-xs text-gray-600 leading-relaxed">{selectedRequest.brand?.meta_description || 'N/A'}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Live FAQs Count</label>
                                        <div className="text-xs font-bold text-gray-700">
                                            {Array.isArray(selectedRequest.brand?.faqs) ? selectedRequest.brand.faqs.length : 0} FAQs
                                        </div>
                                    </div>
                                </div>

                                {/* NEW */}
                                <div className="space-y-4 bg-green-50/40 p-4 rounded-xl border border-green-100">
                                    <h3 className="font-bold text-green-700 text-xs uppercase tracking-wider border-b border-green-200 pb-2 flex items-center justify-between">
                                        Proposed Changes
                                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px]">NEW</span>
                                    </h3>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-green-750 font-semibold">Banner</label>
                                        <div className="h-24 bg-white rounded-md overflow-hidden border border-green-100 shadow-sm">
                                            <img src={getImageUrl(selectedRequest.proposed_data.banner_path)} className="w-full h-full object-cover" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-green-755 font-semibold">Logo</label>
                                        <div className="w-16 h-16 bg-white rounded-full overflow-hidden border border-green-100 shadow-sm">
                                            <img src={getImageUrl(selectedRequest.proposed_data.logo)} className="w-full h-full object-contain" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-green-760 font-semibold">Name</label>
                                        <div className="font-bold text-gray-900">{selectedRequest.proposed_data.name}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-green-760 font-semibold">Short Desc</label>
                                        <div className="text-sm text-gray-800 font-medium">{selectedRequest.proposed_data.short_description}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-green-760 font-semibold">Keywords</label>
                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(selectedRequest.proposed_data.keywords) && selectedRequest.proposed_data.keywords.map((k: string) => (
                                                <span key={k} className="text-[10px] bg-white border border-green-200 px-1.5 py-0.5 rounded text-green-800">{k}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SEO proposed fields */}
                                    <div className="border-t border-green-100 pt-3">
                                        <label className="text-[10px] uppercase font-bold text-green-760 font-semibold">Proposed SEO Title</label>
                                        <div className="text-xs text-gray-900 font-bold">{selectedRequest.proposed_data.meta_title || 'Not Configured'}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-green-760 font-semibold">Proposed SEO Description</label>
                                        <div className="text-xs text-gray-800 leading-normal">{selectedRequest.proposed_data.meta_description || 'Not Configured'}</div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-green-760 font-semibold">Proposed SEO Keywords</label>
                                        <div className="text-xs text-gray-800">{selectedRequest.proposed_data.meta_keywords || 'Not Configured'}</div>
                                    </div>

                                    {/* Proposed Categories & Concerns */}
                                    <div className="border-t border-green-100 pt-3 space-y-2">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-green-760 font-semibold block mb-1">Proposed Categories</label>
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(selectedRequest.proposed_data.categories) && selectedRequest.proposed_data.categories.length > 0 ? (
                                                    selectedRequest.proposed_data.categories.map((id: number) => (
                                                        <span key={id} className="text-[10px] bg-white border border-green-200 px-2 py-0.5 rounded text-green-800">
                                                            {getClassificationName(id)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">None selected</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-green-760 font-semibold block mb-1">Proposed Concerns</label>
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(selectedRequest.proposed_data.concerns) && selectedRequest.proposed_data.concerns.length > 0 ? (
                                                    selectedRequest.proposed_data.concerns.map((id: number) => (
                                                        <span key={id} className="text-[10px] bg-white border border-green-200 px-2 py-0.5 rounded text-green-800">
                                                            {getClassificationName(id)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">None selected</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proposed FAQs */}
                                    <div className="border-t border-green-100 pt-3 space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-green-760 font-semibold block">Proposed FAQs ({selectedRequest.proposed_data.faqs?.length || 0})</label>
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                            {Array.isArray(selectedRequest.proposed_data.faqs) && selectedRequest.proposed_data.faqs.length > 0 ? (
                                                selectedRequest.proposed_data.faqs.map((faq: any, i: number) => (
                                                    <div key={i} className="bg-white p-2.5 rounded-lg border border-green-100 space-y-1">
                                                        <div className="text-[10px] font-extrabold text-green-900">Q: {faq.question}</div>
                                                        <div className="text-[10px] text-gray-600">A: {faq.answer}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">No FAQs configured</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setIsRejectDialogOpen(true)}
                                    className="px-5 py-2.5 border border-red-200 text-red-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-all"
                                >
                                    Reject Request
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                    Approve & Publish Live
                                </button>
                            </div>

                            {/* Reject Dialog Nested */}
                            {isRejectDialogOpen && (
                                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                                    <label className="block text-sm font-bold text-red-800 mb-2">Reason for Rejection</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="w-full p-2 text-sm border border-red-200 rounded-md focus:outline-none focus:border-red-400"
                                        placeholder="e.g. Image quality too low..."
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setIsRejectDialogOpen(false)} className="text-xs text-gray-500 font-bold px-3 py-1">Cancel</button>
                                        <button onClick={handleReject} className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">Confirm Rejection</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
