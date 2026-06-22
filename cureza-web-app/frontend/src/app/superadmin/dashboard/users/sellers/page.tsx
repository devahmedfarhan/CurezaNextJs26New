'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle, XCircle, Clock, Eye, Plus, Trash2, Search, Filter, 
  ArrowUpRight, AlertTriangle, ArrowRightLeft, FileSpreadsheet, Loader2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

function SellersPageContent() {
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const view = searchParams.get('view');

    // Tab Selection
    const [activeView, setActiveView] = useState<'directory' | 'store_requests' | 'seller_requests'>('directory');
    
    // Directory States
    const [sellers, setSellers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalSellers, setTotalSellers] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Store Changes States
    const [storeRequests, setStoreRequests] = useState<any[]>([]);
    const [selectedStoreRequest, setSelectedStoreRequest] = useState<any>(null);
    const [isStoreDetailsOpen, setIsStoreDetailsOpen] = useState(false);
    const [allCategoriesAndConcerns, setAllCategoriesAndConcerns] = useState<any[]>([]);

    // Seller Changes States
    const [sellerRequests, setSellerRequests] = useState<any[]>([]);
    const [selectedSellerRequest, setSelectedSellerRequest] = useState<any>(null);

    // Common Processing States
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionTarget, setRejectionTarget] = useState<'store' | 'seller' | null>(null);

    useEffect(() => {
        if (view === 'store_changes') {
            setActiveView('store_requests');
        } else if (view === 'seller_changes') {
            setActiveView('seller_requests');
        } else if (view === 'pending_onboarding') {
            setActiveView('directory');
            setStatusFilter('pending');
        } else {
            setActiveView('directory');
            setStatusFilter('all');
        }
        setCurrentPage(1);
    }, [view]);

    useEffect(() => {
        if (activeView === 'directory') {
            fetchSellers(currentPage, searchQuery, statusFilter);
        } else if (activeView === 'store_requests') {
            fetchStoreRequests();
            fetchClassifications();
        } else if (activeView === 'seller_requests') {
            fetchSellerRequests();
        }
    }, [activeView, currentPage, statusFilter]);

    useEffect(() => {
        if (activeView !== 'directory') return;
        const timer = setTimeout(() => {
            fetchSellers(1, searchQuery, statusFilter);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ---- Fetch API Operations ----
    const fetchSellers = async (page = 1, search = '', status = 'all') => {
        try {
            setIsLoading(true);
            const response = await api.get(`/admin/sellers?page=${page}&search=${search}&status=${status}&per_page=10`);
            if (response.data && response.data.data) {
                setSellers(response.data.data);
                setCurrentPage(response.data.current_page || 1);
                setLastPage(response.data.last_page || 1);
                setTotalSellers(response.data.total || 0);
            } else {
                setSellers(response.data || []);
                setCurrentPage(1);
                setLastPage(1);
                setTotalSellers((response.data || []).length);
            }
        } catch (error) {
            console.error('Failed to fetch sellers', error);
            showToast('Failed to load sellers', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStoreRequests = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/admin/store-requests?status=pending');
            setStoreRequests(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch store requests', err);
            showToast('Failed to load store requests', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClassifications = async () => {
        try {
            const res = await api.get('/categories');
            setAllCategoriesAndConcerns(res.data || []);
        } catch (e) {
            console.error('Failed to load classifications', e);
        }
    };

    const fetchSellerRequests = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/admin/seller-requests?status=pending');
            setSellerRequests(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch seller profile requests', err);
            showToast('Failed to load seller requests', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getClassificationName = (id: any) => {
        const item = allCategoriesAndConcerns.find(c => String(c.id) === String(id));
        return item ? item.name : `ID: ${id}`;
    };

    // ---- Approval / Rejection Operations ----
    const handleApproveOnboarding = async (id: number) => {
        try {
            await api.post(`/admin/sellers/${id}/approve`);
            showToast('Seller registration approved successfully', 'success');
            fetchSellers(currentPage, searchQuery, statusFilter);
        } catch (error) {
            console.error(error);
            showToast('Failed to approve seller', 'error');
        }
    };

    const handleRejectOnboarding = async (id: number) => {
        if (!confirm('Are you sure you want to reject this seller onboarding application?')) return;
        try {
            await api.post(`/admin/sellers/${id}/reject`);
            showToast('Seller onboarding application rejected', 'success');
            fetchSellers(currentPage, searchQuery, statusFilter);
        } catch (error) {
            console.error(error);
            showToast('Failed to reject seller onboarding', 'error');
        }
    };

    const handleApproveStoreChanges = async (id: number) => {
        setIsProcessing(true);
        try {
            await api.post(`/admin/store-requests/${id}/approve`);
            showToast("Store profile updates approved and published live", "success");
            setIsStoreDetailsOpen(false);
            fetchStoreRequests();
        } catch (err) {
            showToast("Failed to approve store requests", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApproveSellerChanges = async (id: number) => {
        if (!confirm("Are you sure you want to approve this seller change request? KYC/Bank edits will be applied immediately.")) return;
        setIsProcessing(true);
        try {
            await api.post(`/admin/seller-requests/${id}/approve`);
            showToast("Seller details approved and applied successfully", "success");
            setSelectedSellerRequest(null);
            fetchSellerRequests();
        } catch (err) {
            showToast("Failed to approve seller changes", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const triggerRejectionDialog = (target: 'store' | 'seller') => {
        setRejectionTarget(target);
        setRejectionReason('');
        setShowRejectDialog(true);
    };

    const handleConfirmRejection = async () => {
        if (!rejectionReason.trim()) {
            showToast("Please write a rejection reason", "warning");
            return;
        }

        setIsProcessing(true);
        try {
            if (rejectionTarget === 'store') {
                await api.post(`/admin/store-requests/${selectedStoreRequest.id}/reject`, {
                    rejection_reason: rejectionReason
                });
                showToast("Store profile changes rejected", "success");
                setIsStoreDetailsOpen(false);
                fetchStoreRequests();
            } else if (rejectionTarget === 'seller') {
                await api.post(`/admin/seller-requests/${selectedSellerRequest.id}/reject`, {
                    rejection_reason: rejectionReason
                });
                showToast("Seller updates rejected", "success");
                setSelectedSellerRequest(null);
                fetchSellerRequests();
            }
            setShowRejectDialog(false);
        } catch (err) {
            showToast("Rejection failed", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteSeller = async (id: number) => {
        if (!confirm('Are you sure you want to delete this seller? This will delete all products, brand profile, and associated seller records. This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/sellers/${id}`);
            showToast('Seller deleted successfully', 'success');
            fetchSellers(currentPage, searchQuery, statusFilter);
        } catch (error) {
            console.error('Failed to delete seller', error);
            showToast('Failed to delete seller', 'error');
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return '/fallback.png';
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    const getDocLabel = (id: string) => {
        const labels: any = {
            'gst_cert': 'GST Certificate',
            'bank_proof': 'Bank Account Proof',
            'pan': 'PAN Card',
            'aadhaar': 'Aadhaar Card',
            'signature': 'Specimen Signature',
            'license_ayush': 'AYUSH License',
            'license_fssai': 'FSSAI License',
            'license_drug': 'Drug License'
        };
        return labels[id] || id.replace(/_/g, ' ').toUpperCase();
    };

    return (
        <div className="space-y-6">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Seller Management Hub</h1>
                    <p className="text-neutral-500 text-xs font-normal mt-1">Review onboarding KYC applications, verify sellers, and approve store/brand updates.</p>
                </div>
                <Link
                    href="/superadmin/dashboard/users/create?type=seller"
                    className="bg-black text-white px-5 py-2.5 rounded-[10px] hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2 font-medium text-xs shadow-none shrink-0"
                >
                    <Plus size={14} />
                    Add Seller
                </Link>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3 rounded-[10px] border-[0.5px] border-black/50 shadow-none">
                <div className="flex items-center bg-neutral-50/70 p-0.5 rounded-lg border-[0.5px] border-black/50 flex-wrap">
                    <button
                        onClick={() => setActiveView('directory')}
                        className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                            activeView === 'directory' ? 'bg-white text-neutral-900 border-[0.5px] border-black/50' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        Sellers Directory
                    </button>
                    <button
                        onClick={() => setActiveView('store_requests')}
                        className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                            activeView === 'store_requests' ? 'bg-white text-neutral-900 border-[0.5px] border-black/50' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        Store Change Requests
                    </button>
                    <button
                        onClick={() => setActiveView('seller_requests')}
                        className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                            activeView === 'seller_requests' ? 'bg-white text-neutral-900 border-[0.5px] border-black/50' : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                    >
                        Seller Info Changes
                    </button>
                </div>

                {activeView === 'directory' && (
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div className="relative w-full md:w-60">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-3.5 w-3.5" />
                            <input
                                type="text"
                                placeholder="Search sellers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none w-full transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none bg-white cursor-pointer transition-all text-neutral-800"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Onboarding</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                )}
            </div>

            {/* ---- VIEW 1: SELLERS DIRECTORY & ONBOARDING ---- */}
            {activeView === 'directory' && (
                <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 shadow-none overflow-hidden animate-in fade-in duration-300">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50/50 border-b-[0.5px] border-black/50">
                            <tr className="text-neutral-500 font-medium">
                                <th className="px-6 py-4 text-xs tracking-wide">Seller / Brand</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Email</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Status</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Products</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Joined</th>
                                <th className="px-6 py-4 text-xs tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-950/5 bg-white text-neutral-750 font-normal text-xs">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-xs text-neutral-400 font-medium animate-pulse">Loading directory data...</td></tr>
                            ) : sellers.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-xs text-neutral-500 font-medium">No sellers found</td></tr>
                            ) : (
                                sellers.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-neutral-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-neutral-900">{seller.name}</div>
                                            {seller.profile?.registering_as && (
                                                <span className="block text-[10px] text-neutral-450 uppercase mt-0.5 tracking-wider font-semibold">{seller.profile.registering_as}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600">{seller.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wide border-[0.5px] 
                                                ${seller.status === 'approved' ? 'bg-green-50 text-green-700 border-black/50' :
                                                    seller.status === 'rejected' ? 'bg-red-50 text-red-700 border-black/50' :
                                                        'bg-neutral-50 text-neutral-700 border-black/50'}`}>
                                                {seller.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600">{seller.products_count || 0} Products</td>
                                        <td className="px-6 py-4 text-neutral-500">{seller.joined_date}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2.5">
                                                {seller.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleApproveOnboarding(seller.id)} 
                                                            className="text-green-700 hover:text-green-900 text-[10px] font-semibold bg-green-50 hover:bg-green-100/50 px-3 py-1.5 rounded-[10px] transition-all uppercase tracking-wider border-[0.5px] border-black/50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectOnboarding(seller.id)} 
                                                            className="text-red-700 hover:text-red-900 text-[10px] font-semibold bg-red-50 hover:bg-red-100/50 px-3 py-1.5 rounded-[10px] transition-all uppercase tracking-wider border-[0.5px] border-black/50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <Link href={`/superadmin/dashboard/users/sellers/${seller.id}`} className="p-1.5 bg-neutral-50 hover:bg-neutral-100 border-[0.5px] border-black/50 text-neutral-500 hover:text-neutral-900 rounded-lg transition-colors" title="View details">
                                                    <Eye size={12} />
                                                </Link>
                                                <button onClick={() => handleDeleteSeller(seller.id)} className="p-1.5 bg-red-50 hover:bg-red-100 border-[0.5px] border-black/50 text-red-650 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {lastPage > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white p-4 border-t-[0.5px] border-black/50">
                            <span className="text-xs text-neutral-500 font-normal">
                                Showing page <strong className="text-neutral-900">{currentPage}</strong> of <strong className="text-neutral-900">{lastPage}</strong> (Total: {totalSellers} sellers)
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    disabled={currentPage === 1 || isLoading}
                                    onClick={() => {
                                        const prev = currentPage - 1;
                                        setCurrentPage(prev);
                                        fetchSellers(prev, searchQuery, statusFilter);
                                    }}
                                    className="px-3.5 py-1.5 rounded-[10px] border-[0.5px] border-black/50 text-xs font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={currentPage === lastPage || isLoading}
                                    onClick={() => {
                                        const next = currentPage + 1;
                                        setCurrentPage(next);
                                        fetchSellers(next, searchQuery, statusFilter);
                                    }}
                                    className="px-3.5 py-1.5 rounded-[10px] border-[0.5px] border-black/50 text-xs font-medium text-neutral-650 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ---- VIEW 2: STORE CHANGE REQUESTS ---- */}
            {activeView === 'store_requests' && (
                <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 shadow-none overflow-hidden animate-in fade-in duration-300">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50/50 border-b-[0.5px] border-black/50">
                            <tr className="text-neutral-500 font-medium">
                                <th className="px-6 py-4 text-xs tracking-wide">Seller / Brand</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Requested On</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Updated Fields</th>
                                <th className="px-6 py-4 text-xs tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-950/5 bg-white text-neutral-750 font-normal">
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-12 text-xs text-neutral-400 font-medium animate-pulse">Loading store requests...</td></tr>
                            ) : storeRequests.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500 font-medium">No pending store change requests found.</td></tr>
                            ) : (
                                storeRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-[10px] bg-neutral-50 border-[0.5px] border-black/50 flex items-center justify-center font-semibold text-neutral-800 text-sm">
                                                    {req.seller?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-neutral-900 text-sm">{req.brand?.name}</div>
                                                    <div className="text-xs text-neutral-450 font-normal">by {req.seller?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 flex-wrap">
                                                {Object.keys(req.proposed_data).map(key => (
                                                    req.proposed_data[key] !== req.brand?.[key === 'banner_path' ? 'banner_path' : key] && (
                                                        <span key={key} className="px-2 py-0.5 bg-neutral-50 text-neutral-700 border-[0.5px] border-black/50 rounded-[4px] text-[10px] font-medium uppercase tracking-wide">
                                                            {key.replace('_', ' ')}
                                                        </span>
                                                    )
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => { setSelectedStoreRequest(req); setIsStoreDetailsOpen(true); }}
                                                className="px-4 py-2 bg-black hover:bg-neutral-900 text-white rounded-[10px] text-xs font-medium transition-all shadow-none"
                                            >
                                                Review Changes
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ---- VIEW 3: SELLER INFO CHANGES (KYC/BANK) ---- */}
            {activeView === 'seller_requests' && (
                <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 shadow-none overflow-hidden animate-in fade-in duration-300">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50/50 border-b-[0.5px] border-black/50">
                            <tr className="text-neutral-500 font-medium">
                                <th className="px-6 py-4 text-xs tracking-wide">Seller</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Requested Section</th>
                                <th className="px-6 py-4 text-xs tracking-wide">Submitted On</th>
                                <th className="px-6 py-4 text-xs tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-950/5 bg-white text-neutral-750 font-normal">
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-12 text-xs text-neutral-400 font-medium animate-pulse">Loading seller updates...</td></tr>
                            ) : sellerRequests.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500 font-medium">No pending seller info changes found.</td></tr>
                            ) : (
                                sellerRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-[10px] bg-neutral-100 flex items-center justify-center text-neutral-900 border-[0.5px] border-black/50 font-semibold text-sm">
                                                    {req.seller?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900 text-sm">{req.seller?.name}</p>
                                                    <p className="text-xs text-neutral-500 font-normal">{req.seller?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wide border-[0.5px] bg-neutral-50 text-neutral-700 border-black/50">
                                                {req.section}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500">
                                            {new Date(req.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedSellerRequest(req)}
                                                className="inline-flex items-center gap-1 bg-black text-white px-4 py-2 rounded-[10px] text-xs font-medium hover:bg-neutral-900 transition-all shadow-none"
                                            >
                                                Review
                                                <ArrowRight size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SELLER CHANGE DETAILS MODAL/PANEL */}
            {selectedSellerRequest && (
                <div className="bg-neutral-50/50 p-6 rounded-[10px] border-[0.5px] border-black/50 space-y-6 mt-6 animate-in slide-in-from-bottom-6 duration-500">
                    <div className="flex items-center justify-between pb-4 border-b-[0.5px] border-black/50">
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-3">
                                Review Seller {selectedSellerRequest.section} Change Request
                                <span className="bg-black text-white px-2.5 py-0.5 rounded-[4px] text-[9px] font-semibold uppercase tracking-wider">
                                    {selectedSellerRequest.section}
                                </span>
                            </h2>
                            <p className="text-xs text-neutral-500 font-normal">Submitted by {selectedSellerRequest.seller?.name} ({selectedSellerRequest.seller?.email}) on {new Date(selectedSellerRequest.created_at).toLocaleString()}</p>
                        </div>
                        <button onClick={() => setSelectedSellerRequest(null)} className="px-4 py-2 border-[0.5px] border-black/50 rounded-[10px] bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors">Close</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Current/Old Info */}
                        <div className="bg-white p-5 rounded-[10px] border-[0.5px] border-black/50 space-y-4">
                            <h3 className="font-semibold text-neutral-400 uppercase text-[9px] tracking-wider border-b-[0.5px] border-black/50 pb-2">Database Record</h3>
                            {Object.entries(selectedSellerRequest.old_data || {}).map(([key, val]: any) => (
                                <div key={key} className="text-xs font-normal">
                                    <span className="text-[9px] text-neutral-450 uppercase font-medium block mb-0.5">{key.replace(/_/g, ' ')}</span>
                                    <span className="font-medium text-neutral-700">{String(val || 'N/A')}</span>
                                </div>
                            ))}
                        </div>

                        {/* Proposed Updates */}
                        <div className="bg-white p-5 rounded-[10px] border-[0.5px] border-black/50 space-y-4">
                            <h3 className="font-semibold text-green-700 uppercase text-[9px] tracking-wider border-b-[0.5px] border-black/50 pb-2">Proposed Updates</h3>
                            {Object.entries(selectedSellerRequest.new_data || {}).map(([key, val]: any) => {
                                const isDiff = JSON.stringify(selectedSellerRequest.old_data?.[key]) !== JSON.stringify(val);
                                return (
                                    <div key={key} className={`text-xs p-2 rounded-lg transition-all ${isDiff ? 'bg-green-50 border-[0.5px] border-black/50 text-green-700' : 'opacity-70 font-normal text-neutral-600'}`}>
                                        <span className="text-[9px] text-neutral-450 uppercase font-semibold block mb-0.5">{key.replace(/_/g, ' ')}</span>
                                        {key.includes('image') || key.includes('proof') || key.includes('path') || String(val).startsWith('/storage/') ? (
                                            <a href={getImageUrl(val)} target="_blank" rel="noreferrer" className="text-blue-650 font-semibold underline block">View Uploaded Image</a>
                                        ) : (
                                            <span className="font-semibold text-neutral-900">{String(val || 'N/A')}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-[0.5px] border-black/50">
                        <button
                            onClick={() => triggerRejectionDialog('seller')}
                            className="px-6 py-2.5 border-[0.5px] border-black/50 text-red-600 hover:bg-red-50 rounded-[10px] font-medium text-xs transition-colors"
                        >
                            Reject Updates
                        </button>
                        <button
                            onClick={() => handleApproveSellerChanges(selectedSellerRequest.id)}
                            className="px-6 py-2.5 bg-black text-white rounded-[10px] hover:bg-neutral-900 font-medium text-xs transition-colors shadow-none"
                        >
                            Approve Changes
                        </button>
                    </div>
                </div>
            )}

            {/* STORE PROFILE CHANGE DETAILS DIALOG */}
            <Dialog open={isStoreDetailsOpen} onOpenChange={setIsStoreDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-[10px] p-6 bg-white shadow-none border-[0.5px] border-black/50">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-neutral-900">Review Store Details Changes</DialogTitle>
                    </DialogHeader>
                    {selectedStoreRequest && (
                        <div className="space-y-6 py-3">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Current Live */}
                                <div className="space-y-4 opacity-70 border-r-[0.5px] pr-6 border-black/50">
                                    <h3 className="font-semibold text-neutral-400 text-[10px] uppercase tracking-wider border-b-[0.5px] border-black/50 pb-2">Active Live Store</h3>
                                    
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-semibold text-neutral-400">Banner</label>
                                        <div className="h-20 bg-neutral-100 rounded-[10px] overflow-hidden border-[0.5px] border-black/50">
                                            <img src={getImageUrl(selectedStoreRequest.brand?.banner_path)} className="w-full h-full object-cover grayscale" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-semibold text-neutral-400">Logo</label>
                                        <div className="w-12 h-12 bg-neutral-100 rounded-[10px] border-[0.5px] border-black/50 overflow-hidden flex items-center justify-center">
                                            <img src={getImageUrl(selectedStoreRequest.brand?.logo)} className="w-full h-full object-contain grayscale" />
                                        </div>
                                    </div>

                                    <div className="font-normal text-xs text-neutral-600">
                                        <label className="text-[9px] uppercase font-semibold text-neutral-400 block">Name</label>
                                        <span className="font-medium text-neutral-700">{selectedStoreRequest.brand?.name}</span>
                                    </div>

                                    <div className="font-normal text-xs text-neutral-600">
                                        <label className="text-[9px] uppercase font-semibold text-neutral-400 block">Short Description</label>
                                        <p className="leading-normal">{selectedStoreRequest.brand?.short_description}</p>
                                    </div>

                                    <div className="font-normal text-xs text-neutral-600">
                                        <label className="text-[9px] uppercase font-semibold text-neutral-400 block">SEO Title</label>
                                        <p>{selectedStoreRequest.brand?.meta_title || 'N/A'}</p>
                                    </div>

                                    <div className="font-normal text-xs text-neutral-600">
                                        <label className="text-[9px] uppercase font-semibold text-neutral-400 block">SEO Description</label>
                                        <p className="leading-relaxed">{selectedStoreRequest.brand?.meta_description || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Proposed Changes */}
                                <div className="space-y-4 bg-green-50/30 p-5 rounded-[10px] border-[0.5px] border-black/50">
                                    <h3 className="font-semibold text-green-700 text-[10px] uppercase tracking-wider border-b-[0.5px] border-black/50 pb-2 flex justify-between items-center">
                                        Proposed Brand Profile
                                        <span className="bg-green-100 text-green-800 text-[8px] font-semibold px-1.5 py-0.5 rounded">New</span>
                                    </h3>

                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-semibold text-green-700">Banner</label>
                                        <div className="h-20 bg-white rounded-[10px] overflow-hidden border-[0.5px] border-black/50">
                                            <img src={getImageUrl(selectedStoreRequest.proposed_data.banner_path)} className="w-full h-full object-cover" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-semibold text-green-700">Logo</label>
                                        <div className="w-12 h-12 bg-white rounded-[10px] overflow-hidden border-[0.5px] border-black/50 flex items-center justify-center">
                                            <img src={getImageUrl(selectedStoreRequest.proposed_data.logo)} className="w-full h-full object-contain" />
                                        </div>
                                    </div>

                                    <div className="text-xs">
                                        <label className="text-[9px] uppercase font-semibold text-green-700 block">Name</label>
                                        <span className="font-semibold text-neutral-900">{selectedStoreRequest.proposed_data.name}</span>
                                    </div>

                                    <div className="text-xs">
                                        <label className="text-[9px] uppercase font-semibold text-green-700 block">Short Description</label>
                                        <p className="text-neutral-800 font-semibold leading-normal">{selectedStoreRequest.proposed_data.short_description}</p>
                                    </div>

                                    <div className="text-xs">
                                        <label className="text-[9px] uppercase font-semibold text-green-700 block">SEO Title</label>
                                        <p className="text-neutral-900 font-semibold">{selectedStoreRequest.proposed_data.meta_title || 'N/A'}</p>
                                    </div>

                                    <div className="text-xs">
                                        <label className="text-[9px] uppercase font-semibold text-green-700 block">SEO Description</label>
                                        <p className="text-neutral-900 font-semibold leading-normal">{selectedStoreRequest.proposed_data.meta_description || 'N/A'}</p>
                                    </div>

                                    {/* Proposed Categories & Concerns */}
                                    <div className="border-t-[0.5px] border-black/50 pt-3 space-y-2 text-xs">
                                        <div>
                                            <label className="text-[9px] uppercase font-semibold text-green-700 block mb-1">Categories</label>
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(selectedStoreRequest.proposed_data.categories) && selectedStoreRequest.proposed_data.categories.length > 0 ? (
                                                    selectedStoreRequest.proposed_data.categories.map((id: number) => (
                                                        <span key={id} className="text-[9px] font-semibold bg-white border-[0.5px] border-black/50 px-2 py-0.5 rounded text-green-800 uppercase">
                                                            {getClassificationName(id)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[9px] text-neutral-400 italic font-normal">None selected</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 border-t-[0.5px] border-black/50 gap-2 sm:gap-0">
                                <button
                                    onClick={() => triggerRejectionDialog('store')}
                                    className="px-4 py-2.5 text-xs font-semibold text-red-650 hover:bg-red-50 rounded-[10px] transition-colors"
                                >
                                    Reject Changes
                                </button>
                                <button
                                    onClick={() => handleApproveStoreChanges(selectedStoreRequest.id)}
                                    disabled={isProcessing}
                                    className="px-6 py-2.5 rounded-[10px] bg-black text-white text-xs font-medium hover:bg-neutral-900 transition-colors shadow-none"
                                >
                                    Approve & Publish Live
                                </button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* REJECTION REASON MODAL DIALOG */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="max-w-md rounded-[10px] p-6 bg-white shadow-none border-[0.5px] border-black/50">
                    <DialogHeader>
                        <DialogTitle className="text-base font-semibold text-neutral-900">Reject Changes</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-3 font-normal">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Reason for Rejection:</label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full h-28 p-3 rounded-[10px] border-[0.5px] border-black/50 focus:ring-1 focus:ring-black focus:border-black outline-none text-xs font-normal"
                            placeholder="e.g. Blurry upload documents or incorrect bank data..."
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <button
                            onClick={() => setShowRejectDialog(false)}
                            className="px-4 py-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50 rounded-[10px] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmRejection}
                            disabled={isProcessing}
                            className="px-6 py-2.5 rounded-[10px] bg-red-600 hover:bg-red-755 text-white text-xs font-medium transition-colors shadow-none"
                        >
                            Confirm Rejection
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

export default function SuperAdminSellersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-neutral-400 font-medium animate-pulse">Loading dashboard content...</div>}>
            <SellersPageContent />
        </Suspense>
    );
}
