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
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reviews & Ratings</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage customer feedback and build trust.</p>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-none shadow-indigo-100 relative overflow-hidden group border-black/50 border-[0.5px]">
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
                            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-widest">Overall Rating</p>
                            <p className="text-xs text-indigo-200/80 mt-1 font-medium">
                                Based on {statistics.rating_aggregate?.total_reviews || 0} reviews
                            </p>
                        </div>
                    </div>

                    <div className="premium-card p-6 border-b-4 border-b-emerald-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-extrabold text-gray-900 font-mono">
                                {statistics.reply_stats?.replied_count || 0}
                            </span>
                        </div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Replies Sent</p>
                        <p className="text-xs text-emerald-600 mt-1 font-extrabold">
                            {statistics.reply_stats?.reply_rate || 0}% Response Rate
                        </p>
                    </div>

                    <div className="premium-card p-6 border-b-4 border-b-amber-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-extrabold text-gray-900 font-mono">
                                {statistics.reply_stats?.pending_replies || 0}
                            </span>
                        </div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Pending Replies</p>
                        <p className="text-xs text-amber-600 mt-1 font-extrabold italic">Immediate attention</p>
                    </div>

                    <div className="premium-card p-6 border-b-4 border-b-blue-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-extrabold text-gray-900 font-mono">
                                {statistics.recent_reviews?.length || 0}
                            </span>
                        </div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Recent Feedback</p>
                        <p className="text-xs text-blue-600 mt-1 font-extrabold">Updated just now</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="premium-card p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Type Filter */}
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                            Feedback Source
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border-[0.5px] border-black/50 rounded-xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green transition-all"
                        >
                            <option value="all">All Channels</option>
                            <option value="product">Product Quality</option>
                            <option value="seller">Brand Service</option>
                        </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                            Minimum Star Rating
                        </label>
                        <select
                            value={filterRating || ''}
                            onChange={(e) =>
                                setFilterRating(e.target.value ? parseInt(e.target.value) : null)
                            }
                            className="w-full px-4 py-2.5 bg-gray-50 border-[0.5px] border-black/50 rounded-xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green transition-all"
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
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                            Engagement Status
                        </label>
                        <select
                            value={filterReplied}
                            onChange={(e) => setFilterReplied(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border-[0.5px] border-black/50 rounded-xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green transition-all"
                        >
                            <option value="all">Everything</option>
                            <option value="replied">Responded</option>
                            <option value="pending">Waiting for Response</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                            Keyword Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search comments..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-[0.5px] border-black/50 rounded-xl text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List with Reply Functionality */}
            <div className="space-y-6">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Feed Reader
                </h2>

                {loading && reviews.length === 0 ? (
                    <div className="flex justify-center p-20 premium-card">
                        <Loader2 className="w-10 h-10 text-cureza-green animate-spin" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center p-20 premium-card">
                        <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No feedback matches your criteria</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="premium-card p-8 hover:bg-gray-50/20 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500"
                            >
                                {/* Review Content */}
                                <div className="mb-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg shrink-0">
                                                {(review.customer?.name || review.full_name || 'Anonymous').charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-gray-900 text-base">
                                                    {review.customer?.name || review.full_name || 'Anonymous Customer'}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-3.5 h-3.5 ${i < review.rating
                                                                    ? 'text-amber-400 fill-amber-400'
                                                                    : 'text-gray-200'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {new Date(review.reviewed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {review.product && (
                                            <span className="text-[10px] font-extrabold bg-gray-100 text-gray-600 px-3 py-1 rounded-lg uppercase tracking-wider w-fit">
                                                📦 {review.product.title || review.product.name}
                                            </span>
                                        )}
                                    </div>

                                    {review.review_text && (
                                        <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gray-100 before:rounded-full">
                                            <p className="text-gray-700 leading-relaxed font-medium italic">"{review.review_text}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Reply Section */}
                                {review.reply ? (
                                    <div className="bg-indigo-50/50 rounded-2xl p-6 border-[0.5px] border-black/50 ml-4 sm:ml-12 relative">
                                        <div className="absolute -top-3 left-6 px-2 bg-indigo-500 text-white text-[8px] font-extrabold uppercase tracking-widest rounded-full py-0.5 shadow-none border-black/50 border-[0.5px]">Merchant Response</div>
                                        <p className="text-sm font-bold text-indigo-900 mb-2 leading-relaxed">
                                            {review.reply.reply_text}
                                        </p>
                                        <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-tight">
                                            Replied on {new Date(review.reply.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                ) : replyingTo === review.id ? (
                                    <div className="bg-gray-50 rounded-2xl p-6 ml-4 sm:ml-12 border-[0.5px] border-black/50 animate-in slide-in-from-top-2 duration-300">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Compose a thoughtful response..."
                                            rows={4}
                                            className="w-full px-6 py-4 bg-white border-[0.5px] border-black/50 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none transition-all shadow-none"
                                        />
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => handleReply(review.id)}
                                                disabled={submittingReply || !replyText.trim()}
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold text-sm shadow-none shadow-indigo-100 transition-all hover:-translate-y-0.5 border-black/50 border-[0.5px]"
                                            >
                                                {submittingReply ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
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
                                                className="px-6 py-2.5 bg-white border-[0.5px] border-black/50 text-gray-500 rounded-xl hover:bg-gray-50 font-bold text-sm transition-all"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="ml-4 sm:ml-12 border-t-[0.5px] border-black/50 pt-4">
                                        <button
                                            onClick={() => setReplyingTo(review.id)}
                                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-extrabold text-xs uppercase tracking-widest transition-all hover:gap-3"
                                        >
                                            Draft Response <TrendingUp size={14} />
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
                        className="px-6 py-3 bg-white border-[0.5px] border-black/50 rounded-lg font-medium text-gray-700 hover:border-blue-500 hover:text-blue-500 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}
