'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
    Loader2, Check, X, Star, MessageSquare, Image as ImageIcon, Video,
    Trash2, Edit2, Plus, Eye, ExternalLink, ShieldAlert, Award,
    CheckCircle, EyeOff, TrendingUp, HelpCircle, ArrowRight, User, Stethoscope, Store
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid
} from 'recharts';

interface Review {
    id: number;
    rating?: number;
    stars?: number;
    review_text?: string;
    description?: string;
    created_at?: string;
    reviewed_at?: string;
    status: string;
    customer?: { name: string; email: string };
    full_name?: string;
    email?: string;
    review_type: 'product' | 'seller';
    product?: { id: number; title: string; image: string; sku: string };
    seller?: { id: number; name: string; role?: string; specialization?: string };
    images?: string[];
    media_items?: { media_type: string; media_path: string }[];
    video_url?: string;
    reply?: { id: number; reply_text: string; created_at: string };
}

interface Stats {
    total_reviews: number;
    active_reviews: number;
    hidden_reviews: number;
    pending_moderation: number;
    product_reviews: number;
    seller_reviews: number;
    doctor_reviews_count: number;
    store_reviews_count: number;
    average_rating: number;
    total_replies: number;
    rating_breakdown: Record<number, number>;
    monthly_trend: { month: string; count: number; average: number }[];
}

export default function RatingsPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64 min-h-[500px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-cureza-green" size={40} />
                    <p className="text-gray-500 font-medium animate-pulse">Loading Ratings Dashboard...</p>
                </div>
            </div>
        }>
            <RatingsContent />
        </Suspense>
    );
}

function RatingsContent() {
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'overview';

    const [isMounted, setIsMounted] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // List Filters
    const [statusFilter, setStatusFilter] = useState<'pending' | 'active' | 'hidden' | 'all'>('all');
    const [ratingFilter, setRatingFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [viewingReview, setViewingReview] = useState<Review | null>(null);

    // Manual Create Form
    const [formData, setFormData] = useState({
        product_id: '',
        customer_id: '',
        seller_id: '',
        order_id: '',
        review_type: 'product' as 'product' | 'seller',
        full_name: '',
        email: '',
        rating: 5,
        review_text: '',
        status: 'active'
    });

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch Stats
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await api.get('/admin/reviews/statistics');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch statistics', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch Reviews depending on tab
    const fetchReviews = async () => {
        if (activeTab === 'overview') return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
            });

            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (ratingFilter) params.append('rating', ratingFilter);
            if (searchTerm) params.append('search', searchTerm);

            // Tab specific filters
            if (activeTab === 'products') {
                params.append('type', 'product');
            } else if (activeTab === 'sellers') {
                params.append('type', 'seller');
                params.append('seller_role', 'vendor');
            } else if (activeTab === 'doctors') {
                params.append('type', 'seller');
                params.append('seller_role', 'doctor');
            } else if (activeTab === 'replies') {
                params.append('has_reply', 'true');
            }

            const res = await api.get(`/admin/reviews?${params.toString()}`);
            if (res.data.success) {
                setReviews(res.data.data.data);
                setTotalPages(res.data.data.last_page);
            } else {
                setReviews(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
            showToast('Failed to load reviews', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        setPage(1);
        fetchReviews();
    }, [activeTab, statusFilter, ratingFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            setPage(1);
            fetchReviews();
        }, 400);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    // Handle pagination page change
    useEffect(() => {
        fetchReviews();
    }, [page]);

    const handleTabChange = (tab: string) => {
        router.push(`/superadmin/dashboard/ratings?tab=${tab}`);
    };

    const handleStatusUpdate = async (id: number, status: 'active' | 'hidden') => {
        try {
            await api.patch(`/admin/reviews/${id}/status`, { status });
            showToast(`Review ${status === 'active' ? 'approved' : 'rejected'} successfully`, 'success');
            fetchReviews();
            fetchStats();
        } catch (error) {
            console.error('Failed to update status', error);
            showToast('Failed to update review status', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            showToast('Review deleted successfully', 'success');
            fetchReviews();
            fetchStats();
        } catch (error) {
            console.error('Failed to delete review', error);
            showToast('Failed to delete review', 'error');
        }
    };

    const handleDeleteReply = async (replyId: number) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;
        try {
            await api.delete(`/admin/reviews/reply/${replyId}`);
            showToast('Reply deleted successfully', 'success');
            fetchReviews();
            fetchStats();
            setIsViewModalOpen(false);
        } catch (error) {
            console.error('Failed to delete reply', error);
            showToast('Failed to delete reply', 'error');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingReview) {
                await api.put(`/admin/reviews/${editingReview.id}`, {
                    rating: Number(formData.rating),
                    review_text: formData.review_text
                });
                showToast('Review updated successfully', 'success');
            } else {
                await api.post('/admin/reviews', {
                    ...formData,
                    rating: Number(formData.rating)
                });
                showToast('Review created successfully', 'success');
            }
            setIsModalOpen(false);
            setEditingReview(null);
            resetForm();
            fetchReviews();
            fetchStats();
        } catch (error: any) {
            console.error('Failed to save review', error);
            showToast(error.response?.data?.message || 'Failed to save review', 'error');
        }
    };

    const openEditModal = (review: Review) => {
        setEditingReview(review);
        setFormData({
            product_id: review.product?.id.toString() || '',
            customer_id: '',
            seller_id: review.seller?.id.toString() || '',
            order_id: '',
            review_type: review.review_type,
            full_name: review.customer?.name || review.full_name || '',
            email: review.customer?.email || review.email || '',
            rating: review.rating || review.stars || 5,
            review_text: review.review_text || review.description || '',
            status: review.status
        });
        setIsModalOpen(true);
    };

    const openViewModal = (review: Review) => {
        setViewingReview(review);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            product_id: '',
            customer_id: '',
            seller_id: '',
            order_id: '',
            review_type: 'product',
            full_name: '',
            email: '',
            rating: 5,
            review_text: '',
            status: 'active'
        });
    };

    const renderMediaGrid = (review: Review) => (
        <div className="grid grid-cols-3 gap-3">
            {review.media_items?.map((media, i) => (
                <div key={`media-${i}`} className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 relative group flex items-center justify-center">
                    {media.media_type === 'image' ? (
                        <img src={`${BACKEND_URL}/storage/${media.media_path}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                            <Video size={24} className="mb-1" />
                            <span className="text-[10px] font-semibold uppercase">Video</span>
                        </div>
                    )}
                </div>
            ))}

            {(typeof review.images === 'string' ? JSON.parse(review.images) : (review.images || [])).map((img: any, i: number) => {
                if (typeof img !== 'string') return null;
                return (
                    <div key={`img-${i}`} className="aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-150 flex items-center justify-center relative group">
                        <img
                            src={img.startsWith('http') ? img : `${BACKEND_URL}/storage/${img}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                            alt={`Review Image ${i + 1}`}
                        />
                    </div>
                )
            })}

            {review.video_url && (
                <a href={review.video_url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg bg-blue-50/50 border border-blue-100 flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                    <Video size={24} className="mb-1 animate-pulse" />
                    <span className="text-[10px] font-bold flex items-center gap-0.5">Open Video <ExternalLink size={8} /></span>
                </a>
            )}
        </div>
    );

    // Recharts rating breakdown formatted data
    const chartData = stats ? Object.entries(stats.rating_breakdown).map(([stars, count]) => ({
        name: `${stars} ★`,
        Count: count
    })).reverse() : [];

    return (
        <div className="space-y-8 pb-12">
            {/* Elegant Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-slate-800 to-indigo-950 p-8 shadow-lg border border-slate-700/30">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                            Ratings & Reviews Desk
                        </h1>
                        <p className="text-slate-300 mt-2 max-w-xl text-sm leading-relaxed">
                            System-wide moderation panel for customer reviews across products, seller stores, and doctors. Track satisfaction and manage seller responses.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditingReview(null); resetForm(); setIsModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm self-start md:self-center border border-indigo-500/20"
                    >
                        <Plus size={18} /> Create Manual Review
                    </button>
                </div>
            </div>

            {/* Custom Tabbed Submenu */}
            <div className="border-b border-gray-250 flex overflow-x-auto scrollbar-none gap-2 bg-gray-50/50 p-1 rounded-xl border">
                {[
                    { id: 'overview', label: 'Overview Analytics', count: null },
                    { id: 'products', label: 'Product Reviews', count: stats?.product_reviews },
                    { id: 'sellers', label: 'Store Reviews', count: stats?.store_reviews_count },
                    { id: 'doctors', label: 'Doctor Reviews', count: stats?.doctor_reviews_count },
                    { id: 'replies', label: 'Seller Replies', count: stats?.total_replies },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/80 font-extrabold'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                        }`}
                    >
                        {tab.label}
                        {tab.count !== null && (
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                                activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200/70 text-gray-600'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Analytics Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                    {/* Metrics Grid */}
                    {statsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-28 bg-white border border-gray-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-all duration-300 group-hover:scale-110 pointer-events-none" />
                                <div className="flex items-center gap-3 text-indigo-600">
                                    <MessageSquare size={20} />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Reviews</span>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-gray-900">{stats.total_reviews}</span>
                                    <span className="text-xs text-green-600 font-bold flex items-center gap-0.5">
                                        Active: {stats.active_reviews}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-all duration-300 group-hover:scale-110 pointer-events-none" />
                                <div className="flex items-center gap-3 text-amber-600">
                                    <ShieldAlert size={20} />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Moderation</span>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-gray-900">{stats.pending_moderation}</span>
                                    {stats.pending_moderation > 0 && (
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full animate-bounce">
                                            Action Needed
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 transition-all duration-300 group-hover:scale-110 pointer-events-none" />
                                <div className="flex items-center gap-3 text-yellow-500">
                                    <div className="flex">
                                        <Star size={16} fill="currentColor" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Average Rating</span>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-gray-900">{stats.average_rating}</span>
                                    <span className="text-xs text-gray-500">/ 5.0 Stars</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-all duration-300 group-hover:scale-110 pointer-events-none" />
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <CheckCircle size={20} />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Seller Replies</span>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-gray-900">{stats.total_replies}</span>
                                    <span className="text-xs text-gray-500">Replies moderated</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Breakdown & Trend Charts */}
                    {isMounted && stats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-gray-900">Rating Distribution</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={50} tickLine={false} axisLine={false} className="text-xs font-bold text-gray-500" />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                            <Bar dataKey="Count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-gray-900">Monthly Review Trends</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="month" className="text-xs font-bold text-gray-500" />
                                            <YAxis className="text-xs font-bold text-gray-500" />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} name="Total Reviews" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={2} name="Avg Rating" dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Breakdown by Type Grid */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-indigo-50/50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Products</span>
                                    <h4 className="text-2xl font-extrabold text-gray-950 mt-1">{stats.product_reviews}</h4>
                                    <p className="text-xs text-gray-500">Reviews for items on store</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Store size={24} />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50/50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Seller Stores</span>
                                    <h4 className="text-2xl font-extrabold text-gray-950 mt-1">{stats.store_reviews_count}</h4>
                                    <p className="text-xs text-gray-500">Store and service reviews</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Store size={24} />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-teal-50/50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Doctors</span>
                                    <h4 className="text-2xl font-extrabold text-gray-950 mt-1">{stats.doctor_reviews_count}</h4>
                                    <p className="text-xs text-gray-500">Consultation satisfaction reviews</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Stethoscope size={24} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Moderation Reminder Alert Banner */}
                    {stats && stats.pending_moderation > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-900 text-sm">Pending approvals awaiting moderation</h4>
                                    <p className="text-xs text-amber-700 mt-0.5">There are {stats.pending_moderation} customer reviews requiring admin approval before publishing.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { handleTabChange('products'); setStatusFilter('pending'); }}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                            >
                                Moderate Now <ArrowRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* List Review Content Tabs */}
            {activeTab !== 'overview' && (
                <div className="space-y-6">
                    {/* Filters Toolbar */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end justify-between">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Moderation Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="pending">Pending approval</option>
                                    <option value="active">Approved (Active)</option>
                                    <option value="hidden">Rejected (Hidden)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Filter Rating</label>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="">All ratings</option>
                                    {[5, 4, 3, 2, 1].map((r) => (
                                        <option key={r} value={r}>{r} Stars</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Search Query</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search customer, target, reply..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table / List */}
                    {loading ? (
                        <div className="flex justify-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                                <p className="text-xs text-gray-500 font-semibold animate-pulse">Fetching reviews list...</p>
                            </div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
                            <MessageSquare className="mx-auto text-gray-300" size={48} />
                            <p className="text-sm font-semibold text-gray-500">No reviews found matching current filters.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {reviews.map((review) => {
                                const displayName = review.customer?.name || review.full_name || 'Anonymous Customer';
                                const displayRating = review.rating || review.stars || 0;

                                return (
                                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-250 hover:border-gray-350 shadow-sm hover:shadow transition-all flex flex-col md:flex-row gap-6 relative group">
                                        {/* Main Review Panel */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    {/* Badge based on Type */}
                                                    {review.review_type === 'seller' ? (
                                                        review.seller?.role === 'doctor' ? (
                                                            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[9px] font-extrabold uppercase tracking-wider rounded border border-teal-100 flex items-center gap-0.5">
                                                                <Stethoscope size={10} /> Doctor Consultation
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[9px] font-extrabold uppercase tracking-wider rounded border border-purple-100 flex items-center gap-0.5">
                                                                <Store size={10} /> Store / Brand
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-extrabold uppercase tracking-wider rounded border border-blue-100 flex items-center gap-0.5">
                                                            <Store size={10} /> Store Product
                                                        </span>
                                                    )}

                                                    {/* Rating Display */}
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < displayRating ? "currentColor" : "none"} className={i < displayRating ? "" : "text-gray-250"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-extrabold text-gray-900">{displayRating}.0</span>
                                                </div>

                                                {/* Action Bar */}
                                                <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(review)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit Review Content">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(review.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Review">
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button onClick={() => openViewModal(review)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all" title="View Full Info">
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Review Text */}
                                            <p className="text-gray-800 text-sm leading-relaxed font-medium">
                                                {review.review_text || review.description || <span className="text-gray-400 italic">No text content provided</span>}
                                            </p>

                                            {/* Media Grid attached */}
                                            {(review.media_items?.length! > 0 || (typeof review.images === 'string' ? JSON.parse(review.images || '[]') : review.images || []).length > 0 || review.video_url) && (
                                                <div className="max-w-xs pt-1">
                                                    {renderMediaGrid(review)}
                                                </div>
                                            )}

                                            {/* Footer metadata */}
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 pt-3 border-t border-gray-100">
                                                <span className="font-bold text-gray-800 flex items-center gap-1"><User size={12} /> {displayName}</span>
                                                <span>•</span>
                                                <span>{review.customer?.email || review.email}</span>
                                                <span>•</span>
                                                <span>{new Date(review.created_at || review.reviewed_at!).toLocaleDateString()}</span>
                                            </div>

                                            {/* Reply snippet */}
                                            {review.reply && (
                                                <div className="mt-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3.5 space-y-1 relative group/reply">
                                                    <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                                                        <div className="flex items-center gap-1">
                                                            <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">S</span>
                                                            <span>Seller Response</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteReply(review.reply!.id)}
                                                            className="p-1 text-gray-400 hover:text-red-600 rounded bg-white border border-gray-100 shadow-sm opacity-0 group-hover/reply:opacity-100 transition-opacity"
                                                            title="Delete Reply"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-700 text-xs leading-relaxed font-medium pl-6">{review.reply.reply_text}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Target Info Panel (Product / Seller / Doctor) */}
                                        <div className="w-full md:w-60 flex flex-col justify-between gap-4 border-t md:border-t-0 md:border-l border-gray-150 pt-4 md:pt-0 pl-0 md:pl-6 flex-shrink-0">
                                            <div>
                                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 block mb-2">Moderation Target</span>
                                                {review.product ? (
                                                    <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-150/50">
                                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {review.product.image ? (
                                                                <img
                                                                    src={review.product.image.startsWith('http') ? review.product.image : `${BACKEND_URL}/storage/${review.product.image}`}
                                                                    alt={review.product.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <ImageIcon size={18} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate leading-snug">{review.product.title}</p>
                                                            <p className="text-[9px] text-gray-500 mt-0.5">Product ID: {review.product.id}</p>
                                                        </div>
                                                    </div>
                                                ) : review.review_type === 'seller' ? (
                                                    review.seller?.role === 'doctor' ? (
                                                        <div className="flex items-center gap-3 bg-teal-50/50 p-2.5 rounded-xl border border-teal-100/50">
                                                            <div className="w-10 h-10 bg-white rounded-lg border border-teal-150 flex items-center justify-center text-teal-600 font-extrabold text-sm uppercase flex-shrink-0">
                                                                {(review.seller?.name || 'D').charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-extrabold text-gray-900 truncate leading-snug">{review.seller?.name || 'Unknown Doctor'}</p>
                                                                <p className="text-[9px] text-teal-600 mt-0.5 truncate">{review.seller?.specialization || 'Doctor'}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/50">
                                                            <div className="w-10 h-10 bg-white rounded-lg border border-purple-150 flex items-center justify-center text-purple-600 font-extrabold text-sm uppercase flex-shrink-0">
                                                                {(review.seller?.name || 'S').charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-extrabold text-gray-900 truncate leading-snug">{review.seller?.name || 'Unknown Seller'}</p>
                                                                <p className="text-[9px] text-purple-600 mt-0.5 font-bold uppercase tracking-wider">Store</p>
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-150">
                                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                            <ImageIcon size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-900 truncate leading-snug">No Target Linked</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Approval Actions buttons */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                                    <span>Status: {review.status}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {review.status !== 'hidden' ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(review.id, 'hidden')}
                                                            className="flex items-center justify-center gap-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors border border-rose-100"
                                                        >
                                                            <X size={14} /> Reject
                                                        </button>
                                                    ) : (
                                                        <div />
                                                    )}
                                                    {review.status !== 'active' ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(review.id, 'active')}
                                                            className="flex items-center justify-center gap-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs font-bold transition-colors border border-emerald-100 col-span-2"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-1 py-2 bg-gray-50 text-gray-400 rounded-xl text-xs font-bold border border-gray-200 cursor-not-allowed">
                                                            <Check size={14} /> Published
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-6 gap-3">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                        className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-xs font-bold text-gray-600 bg-gray-150 px-3 py-1.5 rounded-lg border">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-xl bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-extrabold text-gray-900">
                                {editingReview ? 'Edit Review Content' : 'Create Manual Review'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {!editingReview && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Review Type</label>
                                            <select
                                                value={formData.review_type}
                                                onChange={(e) => setFormData({ ...formData, review_type: e.target.value as any })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="product">Product Review</option>
                                                <option value="seller">Seller / Doctor Review</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Order ID *</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.order_id}
                                                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="e.g. 1045"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Customer ID *</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.customer_id}
                                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="e.g. 12"
                                            />
                                        </div>
                                        {formData.review_type === 'product' ? (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product ID *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.product_id}
                                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="Product ID"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Seller/Doctor ID *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.seller_id}
                                                    onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="Seller or Doctor ID"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rating Stars</label>
                                    <select
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {[5, 4, 3, 2, 1].map(num => (
                                            <option key={num} value={num}>{num} Stars</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        disabled={!!editingReview}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                                    >
                                        <option value="active">Active (Published)</option>
                                        <option value="pending">Pending approval</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Review Content Text</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={formData.review_text}
                                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    placeholder="Write review description..."
                                ></textarea>
                            </div>

                            {editingReview && (editingReview.images?.length! > 0 || editingReview.media_items?.length! > 0 || editingReview.video_url) && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attached Media Files (Read-Only)</label>
                                    {renderMediaGrid(editingReview)}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition-colors text-xs"
                                >
                                    {editingReview ? 'Save Changes' : 'Create Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-3 border border-gray-250 text-gray-600 hover:bg-gray-50 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {isViewModalOpen && viewingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-150 bg-gray-50">
                            <div>
                                <h2 className="text-base font-extrabold text-gray-900">Review Moderation Audit</h2>
                                <p className="text-[10px] text-gray-400 mt-0.5">Review Identifier: #{viewingReview.id} • Status: {viewingReview.status}</p>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* User Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm uppercase">
                                        {(viewingReview.customer?.name || viewingReview.full_name || 'C').charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-sm">{viewingReview.customer?.name || viewingReview.full_name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{viewingReview.customer?.email || viewingReview.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-0.5 justify-end text-yellow-400 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < (viewingReview.rating || viewingReview.stars || 0) ? "currentColor" : "none"} className={i < (viewingReview.rating || viewingReview.stars || 0) ? "" : "text-gray-250"} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {new Date(viewingReview.created_at || viewingReview.reviewed_at!).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Content Description */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150">
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">Customer Sentiment Content</span>
                                <p className="text-gray-800 text-sm leading-relaxed font-semibold">{viewingReview.review_text || viewingReview.description}</p>
                            </div>

                            {/* Media Section */}
                            {(viewingReview.media_items?.length! > 0 || viewingReview.images?.length! > 0 || viewingReview.video_url) && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uploaded Visual Evidence</h4>
                                    {renderMediaGrid(viewingReview)}
                                </div>
                            )}

                            {/* Linked Moderation Target details */}
                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 space-y-2">
                                <h4 className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Associated Platform Entity</h4>
                                {viewingReview.product && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {viewingReview.product.image ? (
                                                <img src={viewingReview.product.image.startsWith('http') ? viewingReview.product.image : `${BACKEND_URL}/storage/${viewingReview.product.image}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 leading-snug">{viewingReview.product.title}</p>
                                            <p className="text-[9px] text-gray-500 mt-0.5">Product SKU: {viewingReview.product.sku || 'N/A'} • ID: {viewingReview.product.id}</p>
                                        </div>
                                    </div>
                                )}
                                {viewingReview.review_type === 'seller' && viewingReview.seller && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-250 flex items-center justify-center text-indigo-700 font-extrabold text-sm uppercase flex-shrink-0">
                                            {viewingReview.seller.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-950 leading-snug">{viewingReview.seller.name}</p>
                                            <p className="text-[9px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                                                {viewingReview.seller.role === 'doctor' ? `👨‍⚕️ Doctor (${viewingReview.seller.specialization || 'Consultant'})` : 'Store Partner'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Seller Replies Section */}
                            {viewingReview.reply ? (
                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2 relative group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                                                S
                                            </div>
                                            <span className="font-extrabold text-gray-900 text-xs">Seller Response</span>
                                            <span className="text-[9px] text-gray-400">• {new Date(viewingReview.reply.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteReply(viewingReview.reply!.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-colors shadow-sm"
                                            title="Delete Reply"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <p className="text-gray-700 text-xs leading-relaxed font-semibold pl-7">{viewingReview.reply.reply_text}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed text-center">
                                    <p className="text-xs text-gray-500 font-medium">No replies have been recorded for this review yet.</p>
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                {viewingReview.status !== 'hidden' && (
                                    <button
                                        onClick={() => { handleStatusUpdate(viewingReview.id, 'hidden'); setIsViewModalOpen(false); }}
                                        className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-colors text-xs border border-rose-100"
                                    >
                                        Reject Review
                                    </button>
                                )}
                                {viewingReview.status !== 'active' && (
                                    <button
                                        onClick={() => { handleStatusUpdate(viewingReview.id, 'active'); setIsViewModalOpen(false); }}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-xs shadow"
                                    >
                                        Approve & Publish Review
                                    </button>
                                )}
                                <button
                                    onClick={() => { setIsViewModalOpen(false); openEditModal(viewingReview); }}
                                    className="px-5 py-3 border border-gray-250 text-gray-600 hover:bg-gray-50 font-bold rounded-xl text-xs transition-all"
                                >
                                    Modify Content
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
