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
                <div key={`media-${i}`} className="aspect-square rounded-[10px] overflow-hidden bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-800 relative group flex items-center justify-center">
                    {media.media_type === 'image' ? (
                        <img src={`${BACKEND_URL}/storage/${media.media_path}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-450 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800">
                            <Video size={24} className="mb-1" />
                            <span className="text-[10px] font-medium">Video</span>
                        </div>
                    )}
                </div>
            ))}

            {(typeof review.images === 'string' ? JSON.parse(review.images) : (review.images || [])).map((img: any, i: number) => {
                if (typeof img !== 'string') return null;
                return (
                    <div key={`img-${i}`} className="aspect-square rounded-[10px] overflow-hidden bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-800 flex items-center justify-center relative group">
                        <img
                            src={img.startsWith('http') ? img : `${BACKEND_URL}/storage/${img}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                            alt={`Review Image ${i + 1}`}
                        />
                    </div>
                )
            })}

            {review.video_url && (
                <a href={review.video_url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-[10px] bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-800 flex flex-col items-center justify-center text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <Video size={24} className="mb-1" />
                    <span className="text-[10px] font-medium flex items-center gap-0.5">Open Video <ExternalLink size={8} /></span>
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
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-[0.5px] border-black/50 dark:border-neutral-800">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Star size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-lg">
                                <Star size={20} />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                Ratings & Reviews Desk
                            </h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl font-normal text-xs">
                            System-wide moderation panel for customer reviews across products, seller stores, and doctors. Track satisfaction and manage seller responses.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditingReview(null); resetForm(); setIsModalOpen(true); }}
                        className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-[10px] font-medium hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all active:scale-95 text-xs self-start md:self-center"
                    >
                        <Plus size={16} /> Create Manual Review
                    </button>
                </div>
            </div>


            {/* Analytics Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Metrics Grid */}
                    {statsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-28 bg-white dark:bg-gray-900 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] animate-pulse" />
                            ))}
                        </div>
                    ) : stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-neutral-500">
                                    <span className="text-xs font-medium">Total Reviews</span>
                                    <MessageSquare size={16} />
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total_reviews}</span>
                                    <span className="text-xs text-green-600 font-medium bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-[10px]">
                                        Active: {stats.active_reviews}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-neutral-500">
                                    <span className="text-xs font-medium">Pending Moderation</span>
                                    <ShieldAlert size={16} />
                                </div>
                                <div className="mt-3 flex items-baseline gap-2 text-xs">
                                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending_moderation}</span>
                                    {stats.pending_moderation > 0 && (
                                        <span className="px-2 py-0.5 bg-red-50 text-red-600 dark:bg-red-950/30 text-[10px] font-medium rounded-full">
                                            Action Needed
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-neutral-500">
                                    <span className="text-xs font-medium">Average Rating</span>
                                    <Star size={16} />
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.average_rating}</span>
                                    <span className="text-xs text-neutral-400 font-normal">/ 5.0 Stars</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-neutral-500">
                                    <span className="text-xs font-medium">Seller Replies</span>
                                    <CheckCircle size={16} />
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total_replies}</span>
                                    <span className="text-xs text-neutral-400 font-normal">Replies moderated</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Breakdown & Trend Charts */}
                    {isMounted && stats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Rating Distribution</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={50} tickLine={false} axisLine={false} className="text-xs font-medium text-gray-500" />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                            <Bar dataKey="Count" fill="#000000" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Review Trends</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.monthly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="month" className="text-xs font-medium text-gray-500" />
                                            <YAxis className="text-xs font-medium text-gray-500" />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                                            <Line type="monotone" dataKey="count" stroke="#000000" strokeWidth={2} name="Total Reviews" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="average" stroke="#737373" strokeWidth={1.5} name="Avg Rating" dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Breakdown by Type Grid */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-medium tracking-wider text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-[10px]">Products</span>
                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mt-1.5">{stats.product_reviews}</h4>
                                    <p className="text-xs text-neutral-500 font-normal">Reviews for items on store</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-850 flex items-center justify-center text-neutral-900 dark:text-neutral-100 border-[0.5px] border-black/50 dark:border-neutral-800">
                                    <Store size={20} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-medium tracking-wider text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-[10px]">Store Reviews</span>
                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mt-1.5">{stats.store_reviews_count}</h4>
                                    <p className="text-xs text-neutral-500 font-normal">Store and service reviews</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-850 flex items-center justify-center text-neutral-900 dark:text-neutral-100 border-[0.5px] border-black/50 dark:border-neutral-800">
                                    <Store size={20} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-medium tracking-wider text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-[10px]">Doctors</span>
                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mt-1.5">{stats.doctor_reviews_count}</h4>
                                    <p className="text-xs text-neutral-500 font-normal">Consultation satisfaction reviews</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-850 flex items-center justify-center text-neutral-900 dark:text-neutral-100 border-[0.5px] border-black/50 dark:border-neutral-800">
                                    <Stethoscope size={20} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Moderation Reminder Alert Banner */}
                    {stats && stats.pending_moderation > 0 && (
                        <div className="bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-lg">
                                    <ShieldAlert size={22} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Pending Approvals Awaiting Moderation</h4>
                                    <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">There are {stats.pending_moderation} customer reviews requiring admin approval before publishing.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { handleTabChange('products'); setStatusFilter('pending'); }}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 font-medium text-xs rounded-[10px] transition-all"
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
                    <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex flex-col md:flex-row gap-4 items-end justify-between">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full text-xs">
                            <div>
                                <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Moderation Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none transition-all dark:text-white"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending Approval</option>
                                    <option value="active">Approved (Active)</option>
                                    <option value="hidden">Rejected (Hidden)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Filter Rating</label>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none transition-all dark:text-white"
                                >
                                    <option value="">All Ratings</option>
                                    {[5, 4, 3, 2, 1].map((r) => (
                                        <option key={r} value={r}>{r} Stars</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Search Query</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search Customer, Target, Reply..."
                                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-850 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none transition-all dark:text-white placeholder:text-neutral-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table / List */}
                    {loading ? (
                        <div className="flex justify-center py-16 bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-neutral-900 dark:text-white" size={32} />
                                <p className="text-xs text-neutral-500 font-medium animate-pulse">Fetching reviews list...</p>
                            </div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 space-y-3">
                            <MessageSquare className="mx-auto text-neutral-300 dark:text-neutral-700" size={48} />
                            <p className="text-sm font-medium text-neutral-500">No reviews found matching current filters.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {reviews.map((review) => {
                                const displayName = review.customer?.name || review.full_name || 'Anonymous Customer';
                                const displayRating = review.rating || review.stars || 0;

                                return (
                                    <div key={review.id} className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 hover:border-neutral-950/20 dark:hover:border-neutral-700 transition-all flex flex-col md:flex-row gap-6 relative group">
                                        {/* Main Review Panel */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    {/* Badge based on Type */}
                                                    {review.review_type === 'seller' ? (
                                                        review.seller?.role === 'doctor' ? (
                                                            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[9px] font-medium uppercase tracking-wider rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-750 flex items-center gap-0.5">
                                                                <Stethoscope size={10} /> Doctor Consultation
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[9px] font-medium uppercase tracking-wider rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-750 flex items-center gap-0.5">
                                                                <Store size={10} /> Store / Brand
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[9px] font-medium uppercase tracking-wider rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-750 flex items-center gap-0.5">
                                                            <Store size={10} /> Store Product
                                                        </span>
                                                    )}

                                                    {/* Rating Display */}
                                                    <div className="flex text-neutral-950 dark:text-white">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < displayRating ? "currentColor" : "none"} className={i < displayRating ? "" : "text-neutral-300 dark:text-neutral-700"} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-900 dark:text-white">{displayRating}.0</span>
                                                </div>

                                                {/* Action Bar */}
                                                <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEditModal(review)} className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all" title="Edit Review Content">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(review.id)} className="p-1.5 text-gray-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all" title="Delete Review">
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button onClick={() => openViewModal(review)} className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all" title="View Full Info">
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Review Text */}
                                            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-normal">
                                                {review.review_text || review.description || <span className="text-gray-400 dark:text-gray-650 italic">No text content provided</span>}
                                            </p>

                                            {/* Media Grid attached */}
                                            {(review.media_items?.length! > 0 || (typeof review.images === 'string' ? JSON.parse(review.images || '[]') : review.images || []).length > 0 || review.video_url) && (
                                                <div className="max-w-xs pt-1">
                                                    {renderMediaGrid(review)}
                                                </div>
                                            )}

                                            {/* Footer metadata */}
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 dark:text-gray-500 pt-3 border-t-[0.5px] border-black/50 dark:border-neutral-850">
                                                <span className="font-medium text-gray-800 dark:text-gray-205 flex items-center gap-1"><User size={12} /> {displayName}</span>
                                                <span>•</span>
                                                <span>{review.customer?.email || review.email}</span>
                                                <span>•</span>
                                                <span>{new Date(review.created_at || review.reviewed_at!).toLocaleDateString()}</span>
                                            </div>

                                            {/* Reply snippet */}
                                            {review.reply && (
                                                <div className="mt-3 bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] p-3.5 space-y-1 relative group/reply">
                                                    <div className="flex items-center justify-between text-xs font-medium text-neutral-900 dark:text-neutral-100">
                                                        <div className="flex items-center gap-1">
                                                            <span className="w-5 h-5 rounded-full bg-neutral-250 dark:bg-neutral-700 flex items-center justify-center text-[10px]">S</span>
                                                            <span>Seller Response</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteReply(review.reply!.id)}
                                                            className="p-1 text-gray-400 hover:text-red-650 rounded bg-white dark:bg-neutral-900 border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none opacity-0 group-hover/reply:opacity-100 transition-opacity"
                                                            title="Delete Reply"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed font-normal pl-6">{review.reply.reply_text}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Target Info Panel (Product / Seller / Doctor) */}
                                        <div className="w-full md:w-60 flex flex-col justify-between gap-4 border-t-[0.5px] md:border-t-0 md:border-l border-black/50 dark:border-neutral-800 pt-4 md:pt-0 pl-0 md:pl-6 flex-shrink-0">
                                            <div>
                                                <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-450 dark:text-gray-505 block mb-2">Moderation Target</span>
                                                {review.product ? (
                                                    <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800">
                                                        <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {review.product.image ? (
                                                                <img
                                                                    src={review.product.image.startsWith('http') ? review.product.image : `${BACKEND_URL}/storage/${review.product.image}`}
                                                                    alt={review.product.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <ImageIcon size={18} className="text-gray-450" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-snug">{review.product.title}</p>
                                                            <p className="text-[9px] text-gray-500 dark:text-gray-450 mt-0.5">Product ID: {review.product.id}</p>
                                                        </div>
                                                    </div>
                                                ) : review.review_type === 'seller' ? (
                                                    review.seller?.role === 'doctor' ? (
                                                        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800">
                                                            <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 font-semibold text-sm uppercase flex-shrink-0">
                                                                {(review.seller?.name || 'D').charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-snug">{review.seller?.name || 'Unknown Doctor'}</p>
                                                                <p className="text-[9px] text-neutral-500 dark:text-neutral-450 mt-0.5 truncate">{review.seller?.specialization || 'Doctor'}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800">
                                                            <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 font-semibold text-sm uppercase flex-shrink-0">
                                                                {(review.seller?.name || 'S').charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-snug">{review.seller?.name || 'Unknown Seller'}</p>
                                                                <p className="text-[9px] text-neutral-500 dark:text-neutral-450 mt-0.5 font-medium uppercase tracking-wider">Store</p>
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800">
                                                        <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                            <ImageIcon size={18} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate leading-snug">No Target Linked</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Approval Actions buttons */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                                                    <span>Status: {review.status}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {review.status === 'hidden' ? (
                                                        <span className="flex items-center justify-center gap-1 py-2 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-[10px] text-xs font-medium border-[0.5px] border-red-200/50 cursor-not-allowed">
                                                            Rejected
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusUpdate(review.id, 'hidden')}
                                                            className="flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-105 text-red-600 dark:bg-red-950/30 rounded-[10px] text-xs font-medium transition-colors border-[0.5px] border-red-200/50"
                                                        >
                                                            <X size={14} /> Reject
                                                        </button>
                                                    )}
                                                    {review.status === 'active' ? (
                                                        <span className="flex items-center justify-center gap-1 py-2 bg-neutral-50 dark:bg-neutral-850 text-neutral-400 dark:text-neutral-600 rounded-[10px] text-xs font-medium border-[0.5px] border-black/50 dark:border-neutral-800 cursor-not-allowed">
                                                            <Check size={14} /> Published
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusUpdate(review.id, 'active')}
                                                            className="flex items-center justify-center gap-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-[10px] text-xs font-medium transition-colors border-[0.5px] border-transparent shadow-none"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
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
                                        className="px-4 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 text-xs font-medium rounded-[10px] bg-white dark:bg-gray-900 dark:text-white shadow-none hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-xs font-medium text-neutral-650 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-850 px-3 py-1.5 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-850">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="px-4 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 text-xs font-medium rounded-[10px] bg-white dark:bg-gray-900 dark:text-white shadow-none hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] shadow-none w-full max-w-lg overflow-hidden border-[0.5px] border-black/50 dark:border-neutral-800 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b-[0.5px] border-black/50 dark:border-neutral-800">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                {editingReview ? 'Edit Review Content' : 'Create Manual Review'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-850 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            {!editingReview && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Review Type</label>
                                            <select
                                                value={formData.review_type}
                                                onChange={(e) => setFormData({ ...formData, review_type: e.target.value as any })}
                                                className="w-full px-3 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none bg-neutral-50 dark:bg-neutral-850 dark:text-white"
                                            >
                                                <option value="product">Product Review</option>
                                                <option value="seller">Seller / Doctor Review</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Order ID *</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.order_id}
                                                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                                                className="w-full px-3 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none bg-neutral-50 dark:bg-neutral-850 dark:text-white font-semibold"
                                                placeholder="e.g. 1045"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Customer ID *</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.customer_id}
                                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                                className="w-full px-3 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none bg-neutral-50 dark:bg-neutral-850 dark:text-white font-semibold"
                                                placeholder="e.g. 12"
                                            />
                                        </div>
                                        {formData.review_type === 'product' ? (
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Product ID *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.product_id}
                                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                                    className="w-full px-3 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none bg-neutral-50 dark:bg-neutral-850 dark:text-white font-semibold"
                                                    placeholder="Product ID"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Seller/Doctor ID *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.seller_id}
                                                    onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                                                    className="w-full px-3 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none bg-neutral-50 dark:bg-neutral-850 dark:text-white font-semibold"
                                                    placeholder="Seller or Doctor ID"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Rating Stars</label>
                                    <select
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none bg-neutral-50 dark:bg-neutral-850 dark:text-white font-semibold"
                                    >
                                        {[5, 4, 3, 2, 1].map(num => (
                                            <option key={num} value={num}>{num} Stars</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        disabled={!!editingReview}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none bg-neutral-50 dark:bg-neutral-850 dark:text-white font-semibold disabled:opacity-50"
                                    >
                                        <option value="active">Active (Published)</option>
                                        <option value="pending">Pending Approval</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Review Content Text</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={formData.review_text}
                                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] text-xs font-normal focus:ring-1 focus:ring-black focus:border-black outline-none resize-none bg-neutral-50 dark:bg-neutral-850 dark:text-white placeholder:text-neutral-400"
                                    placeholder="Write review description..."
                                ></textarea>
                            </div>

                            {editingReview && (editingReview.images?.length! > 0 || editingReview.media_items?.length! > 0 || editingReview.video_url) && (
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">Attached Media Files (Read-Only)</label>
                                    {renderMediaGrid(editingReview)}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2 text-xs font-semibold">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-black text-white dark:bg-white dark:text-black font-medium rounded-[10px] hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors text-xs"
                                >
                                    {editingReview ? 'Save Changes' : 'Create Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 border-[0.5px] border-black/50 dark:border-neutral-800 text-neutral-600 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 font-medium rounded-[10px] text-xs transition-colors"
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
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] shadow-none w-full max-w-2xl overflow-hidden border-[0.5px] border-black/50 dark:border-neutral-800 animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b-[0.5px] border-black/50 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Review Moderation Audit</h2>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Review Identifier: #{viewingReview.id} • Status: {viewingReview.status}</p>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-750 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs font-semibold">
                            {/* User Header */}
                            <div className="flex items-start justify-between font-semibold">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-semibold text-sm uppercase border-[0.5px] border-black/50">
                                        {(viewingReview.customer?.name || viewingReview.full_name || 'C').charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{viewingReview.customer?.name || viewingReview.full_name}</h3>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-normal">{viewingReview.customer?.email || viewingReview.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-0.5 justify-end text-neutral-950 dark:text-white mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < (viewingReview.rating || viewingReview.stars || 0) ? "currentColor" : "none"} className={i < (viewingReview.rating || viewingReview.stars || 0) ? "" : "text-neutral-300 dark:text-neutral-700"} />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-normal text-gray-400">
                                        {new Date(viewingReview.created_at || viewingReview.reviewed_at!).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Content Description */}
                            <div className="bg-neutral-50 dark:bg-neutral-850 p-4 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800">
                                <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-450 dark:text-gray-505 block mb-1">Customer Sentiment Content</span>
                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-normal">{viewingReview.review_text || viewingReview.description}</p>
                            </div>

                            {/* Media Section */}
                            {(viewingReview.media_items?.length! > 0 || viewingReview.images?.length! > 0 || viewingReview.video_url) && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Uploaded Visual Evidence</h4>
                                    {renderMediaGrid(viewingReview)}
                                </div>
                            )}

                            {/* Linked Moderation Target details */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-850 p-4 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 space-y-2">
                                <h4 className="text-[9px] font-semibold uppercase tracking-wider text-gray-455 dark:text-gray-500">Associated Platform Entity</h4>
                                {viewingReview.product && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-[10px] border-[0.5px] border-gray-205 dark:border-neutral-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {viewingReview.product.image ? (
                                                <img src={viewingReview.product.image.startsWith('http') ? viewingReview.product.image : `${BACKEND_URL}/storage/${viewingReview.product.image}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon size={20} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">{viewingReview.product.title}</p>
                                            <p className="text-[9px] text-gray-500 dark:text-gray-450 mt-0.5">Product SKU: {viewingReview.product.sku || 'N/A'} • ID: {viewingReview.product.id}</p>
                                        </div>
                                    </div>
                                )}
                                {viewingReview.review_type === 'seller' && viewingReview.seller && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 font-semibold text-sm uppercase flex-shrink-0">
                                            {viewingReview.seller.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-950 dark:text-white leading-snug">{viewingReview.seller.name}</p>
                                            <p className="text-[9px] text-neutral-500 dark:text-neutral-450 font-medium uppercase tracking-wider mt-0.5">
                                                {viewingReview.seller.role === 'doctor' ? `👨‍⚕️ Doctor (${viewingReview.seller.specialization || 'Consultant'})` : 'Store Partner'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Seller Replies Section */}
                            {viewingReview.reply ? (
                                <div className="bg-neutral-50 dark:bg-neutral-850 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] p-4 space-y-2 relative group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black rounded-full flex items-center justify-center text-[9px] font-semibold">
                                                S
                                            </div>
                                            <span className="font-semibold text-gray-900 dark:text-white text-xs">Seller Response</span>
                                            <span className="text-[9px] text-gray-400 font-normal">• {new Date(viewingReview.reply.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteReply(viewingReview.reply!.id)}
                                            className="p-1 text-gray-400 hover:text-red-650 hover:bg-white dark:hover:bg-neutral-850 rounded transition-colors shadow-none"
                                            title="Delete Reply"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed font-normal pl-7">{viewingReview.reply.reply_text}</p>
                                </div>
                            ) : (
                                <div className="bg-neutral-50 dark:bg-neutral-850 p-4 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 border-dashed text-center">
                                    <p className="text-xs text-neutral-550 dark:text-neutral-450 font-normal">No replies have been recorded for this review yet.</p>
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="flex gap-3 pt-4 border-t-[0.5px] border-black/50 dark:border-neutral-800 font-semibold">
                                {viewingReview.status !== 'hidden' && (
                                    <button
                                        onClick={() => { handleStatusUpdate(viewingReview.id, 'hidden'); setIsViewModalOpen(false); }}
                                        className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-[10px] font-medium transition-colors text-xs border-[0.5px] border-black/50"
                                    >
                                        Reject Review
                                    </button>
                                )}
                                {viewingReview.status !== 'active' && (
                                    <button
                                        onClick={() => { handleStatusUpdate(viewingReview.id, 'active'); setIsViewModalOpen(false); }}
                                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-[10px] font-medium transition-colors text-xs shadow-none"
                                    >
                                        Approve & Publish Review
                                    </button>
                                )}
                                <button
                                    onClick={() => { setIsViewModalOpen(false); openEditModal(viewingReview); }}
                                    className="px-5 py-2.5 border-[0.5px] border-black/50 dark:border-neutral-800 text-neutral-600 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 font-medium rounded-[10px] text-xs transition-all"
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
