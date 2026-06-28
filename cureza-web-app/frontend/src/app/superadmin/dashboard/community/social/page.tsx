'use client';

import { useState, useEffect } from 'react';
import { Check, X, ExternalLink, Calendar, Eye, Heart, HelpCircle, Loader2, Award, Gift, DollarSign, Star } from 'lucide-react';
import api from '@/lib/api';

interface Submission {
    id: number;
    platform: 'instagram' | 'youtube';
    link: string;
    content_type: 'photo' | 'video' | 'both';
    views_count: number;
    likes_count: number;
    status: 'pending' | 'approved' | 'rejected';
    points_awarded: number;
    xp_awarded: number;
    bonus_type: 'none' | 'points' | 'coupon' | 'cash' | 'free_product';
    bonus_details: string | null;
    created_at: string;
    customer: {
        name: string;
        email: string;
    };
    moderator?: {
        name: string;
    };
    moderated_at?: string;
}

export default function AdminSocialSubmissions() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [platformFilter, setPlatformFilter] = useState('');

    // Modal state for moderating a submission
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
    const [viewsCount, setViewsCount] = useState(0);
    const [likesCount, setLikesCount] = useState(0);
    const [bonusType, setBonusType] = useState<'none' | 'points' | 'coupon' | 'cash' | 'free_product'>('none');
    const [bonusDetails, setBonusDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/social-submissions', {
                params: {
                    page,
                    status: statusFilter,
                    platform: platformFilter
                }
            });
            setSubmissions(res.data?.data?.data || []);
            setTotalPages(res.data?.data?.last_page || 1);
        } catch (err) {
            console.error("Error loading submissions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [page, statusFilter, platformFilter]);

    const handleOpenModal = (sub: Submission) => {
        setSelectedSub(sub);
        setViewsCount(sub.views_count || 0);
        setLikesCount(sub.likes_count || 0);
        setBonusType(sub.bonus_type || 'none');
        setBonusDetails(sub.bonus_details || '');
        setIsModalOpen(true);
    };

    const handleModerate = async (status: 'approved' | 'rejected') => {
        if (!selectedSub) return;
        setSubmitting(true);

        try {
            await api.patch(`/admin/social-submissions/${selectedSub.id}/status`, {
                status,
                views_count: viewsCount,
                likes_count: likesCount,
                bonus_type: bonusType,
                bonus_details: bonusType !== 'none' ? bonusDetails : null
            });
            setIsModalOpen(false);
            fetchSubmissions();
        } catch (err) {
            console.error("Error moderating submission:", err);
            alert("Failed to moderate submission.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            
            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
                        <select 
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white focus:outline-none focus:border-black"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending Moderation</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Platform</label>
                        <select 
                            value={platformFilter}
                            onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
                            className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white focus:outline-none focus:border-black"
                        >
                            <option value="">All Platforms</option>
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                        </select>
                    </div>
                </div>

                <div className="text-xs text-gray-500 font-medium">
                    Verify that videos mention <strong className="text-black">"Cureza Wellness Hub"</strong> and posts are live for at least 1 week.
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Loading submissions...
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500 font-medium">No submissions found matching filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 border-b-[0.5px] border-black/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Platform / Format</th>
                                    <th className="p-3">Review Link</th>
                                    <th className="p-3">Engagement (Likes/Views)</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Rewards & Bonuses</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-[0.5px] divide-neutral-950/10">
                                {submissions.map((sub) => {
                                    let badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-150';
                                    if (sub.status === 'approved') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';
                                    if (sub.status === 'rejected') badgeColor = 'bg-red-50 text-red-700 border-red-150';

                                    return (
                                        <tr key={sub.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="p-3">
                                                <p className="font-semibold text-gray-900">{sub.customer.name}</p>
                                                <p className="text-[10px] text-gray-400">{sub.customer.email}</p>
                                            </td>
                                            <td className="p-3">
                                                <span className="capitalize font-medium text-gray-700">{sub.platform}</span>
                                                <span className="block text-[10px] text-gray-400 capitalize">Format: {sub.content_type}</span>
                                            </td>
                                            <td className="p-3">
                                                <a 
                                                    href={sub.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                                                >
                                                    Open Link <ExternalLink size={12} />
                                                </a>
                                                <span className="block text-[10px] text-gray-400 mt-0.5">Submitted: {new Date(sub.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td className="p-3 font-normal text-gray-600">
                                                <span className="block flex items-center gap-1"><Eye size={12} className="text-gray-400" /> {sub.views_count.toLocaleString()} views</span>
                                                <span className="block flex items-center gap-1 mt-0.5"><Heart size={12} className="text-gray-400" /> {sub.likes_count.toLocaleString()} likes</span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-block text-[10px] font-bold border rounded px-1.5 py-0.5 uppercase tracking-wider ${badgeColor}`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="p-3 space-y-1">
                                                {sub.status === 'approved' ? (
                                                    <>
                                                        <p className="font-semibold text-gray-900">+{sub.points_awarded} pts / +{sub.xp_awarded} XP</p>
                                                        {sub.bonus_type !== 'none' && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-250 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                Viral Bonus: {sub.bonus_type}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                {sub.status === 'pending' ? (
                                                    <button
                                                        onClick={() => handleOpenModal(sub)}
                                                        className="bg-black text-white hover:bg-neutral-800 px-3 py-1.5 rounded-[10px] text-xs font-semibold uppercase tracking-wider transition-colors"
                                                    >
                                                        Moderate
                                                    </button>
                                                ) : (
                                                    <div className="text-[10px] text-gray-400">
                                                        <span className="block font-medium">By {sub.moderator?.name || 'Admin'}</span>
                                                        <span className="block mt-0.5">{sub.moderated_at ? new Date(sub.moderated_at).toLocaleDateString() : ''}</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 border-[0.5px] border-black/50 text-xs font-medium rounded-[10px] bg-white hover:bg-neutral-50 disabled:opacity-50 transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-medium text-neutral-650 bg-neutral-50 px-3 py-1.5 rounded-[10px] border-[0.5px] border-black/50">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 border-[0.5px] border-black/50 text-xs font-medium rounded-[10px] bg-white hover:bg-neutral-50 disabled:opacity-50 transition-all"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Moderation & Viral Bonus Modal */}
            {isModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[12px] border border-black/30 w-full max-w-md p-6 space-y-4 shadow-xl">
                        
                        <div className="flex items-center justify-between pb-3 border-b border-gray-150">
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">Moderate Review Submission</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Submitted by {selectedSub.customer.name}</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-black font-semibold text-base"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Verification Link */}
                            <div className="p-3 bg-neutral-50 rounded-lg border border-black/5 flex items-center justify-between text-xs">
                                <div>
                                    <span className="font-semibold text-gray-750 block">Platform: {selectedSub.platform.toUpperCase()} ({selectedSub.content_type})</span>
                                    <span className="text-[10px] text-gray-400 block mt-0.5">Please check if video/photo includes: "Cureza Wellness Hub"</span>
                                </div>
                                <a 
                                    href={selectedSub.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all border border-blue-200"
                                >
                                    Open Link <ExternalLink size={12} />
                                </a>
                            </div>

                            {/* Engagement Inputs */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Views Count</label>
                                    <input 
                                        type="number"
                                        value={viewsCount}
                                        onChange={(e) => setViewsCount(parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Likes Count</label>
                                    <input 
                                        type="number"
                                        value={likesCount}
                                        onChange={(e) => setLikesCount(parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white font-medium"
                                    />
                                </div>
                            </div>

                            {/* Viral Bonus selection */}
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Viral Engagement Bonus</label>
                                <select 
                                    value={bonusType}
                                    onChange={(e) => setBonusType(e.target.value as any)}
                                    className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white font-medium focus:outline-none"
                                >
                                    <option value="none">None (Standard Rewards Only)</option>
                                    <option value="points">Extra points (XP/Points Credit)</option>
                                    <option value="coupon">Discount Coupon Voucher</option>
                                    <option value="cash">Cash Prize Reward</option>
                                    <option value="free_product">Free Choice Product</option>
                                </select>
                            </div>

                            {bonusType !== 'none' && (
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">
                                        {bonusType === 'points' && 'Extra Points (Number only)'}
                                        {bonusType === 'coupon' && 'Voucher Code Details'}
                                        {bonusType === 'cash' && 'Cash Prize Reward Amount (e.g. ₹5,000)'}
                                        {bonusType === 'free_product' && 'Free Product Choice Details'}
                                    </label>
                                    <input 
                                        type="text"
                                        value={bonusDetails}
                                        onChange={(e) => setFormDetails(e.target.value)}
                                        placeholder={
                                            bonusType === 'points' ? 'e.g. 500' :
                                            bonusType === 'coupon' ? 'e.g. VIRAL500 (₹500 off coupon)' :
                                            bonusType === 'cash' ? 'e.g. ₹10,000 Cash Transfer' :
                                            'e.g. Unlocked choice of any standard wellness product'
                                        }
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white font-medium"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-3 border-t border-gray-150">
                            <button
                                onClick={() => handleModerate('rejected')}
                                disabled={submitting}
                                className="flex-1 bg-red-50 text-red-650 hover:bg-red-100/70 border border-red-200/50 py-2.5 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleModerate('approved')}
                                disabled={submitting}
                                className="flex-1 bg-[#052326] text-white hover:bg-opacity-95 py-2.5 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Approve & Reward
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );

    // Helpers
    function setFormDetails(val: string) {
        setBonusDetails(val);
    }
}
