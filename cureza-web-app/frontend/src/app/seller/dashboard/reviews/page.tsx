'use client';

import React, { useEffect, useState } from 'react';
import {
    getSellerReviews,
    getSellerReviewsStatistics,
    replyToReview,
} from '@/lib/api/reviews';
import { ReviewList } from '@/components/reviews';
import {
    MessageSquare,
    Star,
    TrendingUp,
    Clock,
    Filter,
    Search,
    Loader2,
} from 'lucide-react';

export default function SellerReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [filterReplied, setFilterReplied] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        fetchStatistics();
        fetchReviews();
    }, [filterType, filterRating, filterReplied, searchTerm]);

    const fetchStatistics = async () => {
        try {
            const response = await getSellerReviewsStatistics();
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        }
    };

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const params: any = {
                page,
                per_page: 10,
            };

            if (filterType !== 'all') params.type = filterType;
            if (filterRating) params.rating = filterRating;
            if (filterReplied === 'replied') params.has_reply = true;
            if (filterReplied === 'pending') params.has_reply = false;

            const response = await getSellerReviews(params);
            const data = response.data.data;

            if (page === 1) {
                setReviews(data.data);
            } else {
                setReviews([...reviews, ...data.data]);
            }

            setHasMore(data.current_page < data.last_page);
            setCurrentPage(data.current_page);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewId: number) => {
        if (!replyText.trim()) return;

        setSubmittingReply(true);
        try {
            await replyToReview(reviewId, replyText);
            setReplyingTo(null);
            setReplyText('');
            fetchReviews(1);
            fetchStatistics();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to post reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    return (
        <div className="space-y-6 w-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-heading font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Reviews & Ratings</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage customer feedback and build trust.</p>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-750 rounded-[10px] p-6 text-white relative overflow-hidden group border border-neutral-955/15 dark:border-neutral-850">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Star size={80} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <Star className="w-8 h-8 text-amber-300 fill-amber-300" />
                                <span className="text-4xl font-extrabold">
                                    {statistics.rating_aggregate?.average_rating ? Number(statistics.rating_aggregate.average_rating).toFixed(1) : '0.0'}
                                </span>
                            </div>
                            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-wider">Overall Rating</p>
                            <p className="text-xs text-indigo-200/80 mt-1 font-medium">
                                Based on {statistics.rating_aggregate?.total_reviews || 0} reviews
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-[10px] p-6 border border-neutral-955/15 dark:border-neutral-800 shadow-sm border-b-4 border-b-emerald-500/30 dark:border-b-emerald-500/40">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-[10px]">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                                {statistics.reply_stats?.replied_count || 0}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Replies Sent</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                            {statistics.reply_stats?.reply_rate || 0}% Response Rate
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-[10px] p-6 border border-neutral-955/15 dark:border-neutral-800 shadow-sm border-b-4 border-b-amber-500/30 dark:border-b-amber-500/40">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-[10px]">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                                {statistics.reply_stats?.pending_replies || 0}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pending Replies</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-bold italic">Immediate attention</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-[10px] p-6 border border-neutral-955/15 dark:border-neutral-800 shadow-sm border-b-4 border-b-blue-500/30 dark:border-b-blue-500/40">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-[10px]">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                                {statistics.recent_reviews?.length || 0}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recent Feedback</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-bold">Updated just now</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-[10px] p-6 border border-neutral-955/15 dark:border-neutral-800 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Type Filter */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                            Feedback Source
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50/50 dark:bg-gray-850/50 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all cursor-pointer"
                        >
                            <option value="all">All Channels</option>
                            <option value="product">Product Quality</option>
                            <option value="seller">Brand Service</option>
                        </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                            Minimum Star Rating
                        </label>
                        <select
                            value={filterRating || ''}
                            onChange={(e) =>
                                setFilterRating(e.target.value ? parseInt(e.target.value) : null)
                            }
                            className="w-full px-3 py-2 bg-neutral-50/50 dark:bg-gray-850/50 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all cursor-pointer"
                        >
                            <option value="">Any Satisfaction</option>
                            <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                            <option value="4">⭐⭐⭐⭐ Good</option>
                            <option value="3">⭐⭐⭐ Average</option>
                            <option value="2">⭐⭐ Poor</option>
                            <option value="1">⭐ Critical</option>
                        </select>
                    </div>

                    {/* Reply Status Filter */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                            Engagement Status
                        </label>
                        <select
                            value={filterReplied}
                            onChange={(e) => setFilterReplied(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50/50 dark:bg-gray-850/50 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all cursor-pointer"
                        >
                            <option value="all">Everything</option>
                            <option value="replied">Responded</option>
                            <option value="pending">Waiting for Response</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                            Keyword Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search comments..."
                                className="w-full pl-9 pr-3 py-2 bg-neutral-50/50 dark:bg-gray-850/50 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder-gray-450"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List with Reply Functionality */}
            <div className="space-y-4">
                <h2 className="text-lg font-heading font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    Feed Reader
                </h2>

                {loading && reviews.length === 0 ? (
                    <div className="flex justify-center p-20 bg-white dark:bg-gray-900 rounded-[10px] border border-neutral-955/15 dark:border-neutral-800">
                        <Loader2 className="w-8 h-8 text-cureza-green animate-spin" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center p-20 bg-white dark:bg-gray-900 rounded-[10px] border border-neutral-955/15 dark:border-neutral-800">
                        <MessageSquare className="w-12 h-12 text-gray-250 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider text-[10px]">No feedback matches your criteria</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-white dark:bg-gray-900 rounded-[10px] border border-neutral-955/15 dark:border-neutral-800 shadow-sm p-6 sm:p-8 hover:bg-neutral-55/20 dark:hover:bg-neutral-800/10 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500"
                            >
                                {/* Review Content */}
                                <div className="mb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-sm shrink-0">
                                                {(review.customer?.name || review.full_name || 'Anonymous').charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {review.customer?.name || review.full_name || 'Anonymous Customer'}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-3 h-3 ${i < review.rating
                                                                    ? 'text-amber-400 fill-amber-400'
                                                                    : 'text-gray-200 dark:text-gray-700'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">
                                                        {new Date(review.reviewed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {review.product && (
                                            <span className="text-[10px] font-bold bg-neutral-100 dark:bg-neutral-850 text-gray-650 dark:text-gray-300 px-3 py-1 rounded-[10px] uppercase tracking-wider w-fit">
                                                📦 {review.product.title || review.product.name}
                                            </span>
                                        )}
                                    </div>

                                    {review.review_text && (
                                        <div className="relative pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800 before:rounded-full">
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic text-xs">"{review.review_text}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Reply Section */}
                                {review.reply ? (
                                    <div className="bg-indigo-50/30 dark:bg-indigo-950/15 rounded-[10px] p-5 border border-indigo-100/50 dark:border-indigo-900/30 ml-4 sm:ml-12 relative mt-4">
                                        <div className="absolute -top-3 left-6 px-2.5 bg-indigo-600 text-white text-[8px] font-bold uppercase tracking-wider rounded-full py-0.5">Merchant Response</div>
                                        <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-300 mb-2 leading-relaxed">
                                            {review.reply.reply_text}
                                        </p>
                                        <p className="text-[9px] text-indigo-450 dark:text-indigo-400 font-bold uppercase tracking-wider">
                                            Replied on {new Date(review.reply.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                ) : replyingTo === review.id ? (
                                    <div className="bg-neutral-50/50 dark:bg-gray-850/50 rounded-[10px] p-5 ml-4 sm:ml-12 border border-neutral-955/15 dark:border-neutral-800 animate-in slide-in-from-top-2 duration-300 mt-4">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Compose a thoughtful response..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all shadow-none"
                                        />
                                        <div className="flex gap-2.5 mt-3">
                                            <button
                                                onClick={() => handleReply(review.id)}
                                                disabled={submittingReply || !replyText.trim()}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 font-bold text-xs shadow-none transition-all"
                                            >
                                                {submittingReply ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    'Publish Reply'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyText('');
                                                }}
                                                className="px-4 py-2 bg-white dark:bg-gray-900 border border-neutral-955/15 dark:border-neutral-800 text-gray-700 dark:text-gray-300 rounded-[10px] hover:bg-gray-50 dark:hover:bg-gray-850 font-semibold text-xs transition-all shadow-none"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="ml-4 sm:ml-12 border-t border-neutral-955/10 dark:border-neutral-800 pt-4 mt-4">
                                        <button
                                            onClick={() => setReplyingTo(review.id)}
                                            className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold text-xs uppercase tracking-wider transition-all hover:gap-2"
                                        >
                                            Draft Response <TrendingUp size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => fetchReviews(currentPage + 1)}
                        disabled={loading}
                        className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-neutral-955/15 dark:border-neutral-800 text-gray-700 dark:text-gray-300 rounded-[10px] hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold text-xs transition-all disabled:opacity-50 shadow-none"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}
