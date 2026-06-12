'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, RefreshCw, Send } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function DoctorReviewsPage() {
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        fetchReviewsAndStats();
    }, []);

    const fetchReviewsAndStats = async () => {
        try {
            setLoading(true);
            const [reviewsRes, statsRes] = await Promise.all([
                api.get('/seller/reviews'),
                api.get('/seller/reviews/statistics')
            ]);
            
            setReviews(reviewsRes.data.data.data || []);
            setStats(statsRes.data.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load reviews and feedback', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePostReply = async (reviewId: number) => {
        if (!replyText.trim()) return;
        setSubmittingReply(true);
        try {
            await api.post(`/seller/reviews/${reviewId}/reply`, {
                reply_text: replyText
            });
            showToast('Reply posted successfully', 'success');
            setReplyText('');
            setReplyingToId(null);
            fetchReviewsAndStats(); // Refresh review list and stats
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to post reply';
            showToast(msg, 'error');
        } finally {
            setSubmittingReply(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground gap-3">
                <RefreshCw className="h-7 w-7 animate-spin text-cureza-green" />
                <p className="text-sm font-medium">Loading patient feedback...</p>
            </div>
        );
    }

    const ratingAggregate = stats?.rating_aggregate || {
        average_rating: 0,
        total_reviews: 0
    };

    // Calculate positive feedback percent (4 and 5 stars count / total)
    const rating4 = ratingAggregate.rating_4_count || 0;
    const rating5 = ratingAggregate.rating_5_count || 0;
    const total = ratingAggregate.total_reviews || 0;
    const positivePercent = total > 0 ? Math.round(((rating4 + rating5) / total) * 100) : 100;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-base font-bold text-gray-800 tracking-tight">Patient Feedback</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">View and respond to reviews from patients</p>
            </div>

            {/* Rating Overview */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-lg border border-black/[0.05] flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 rounded-md text-amber-500">
                        <Star size={15} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{Number(ratingAggregate.average_rating || 0).toFixed(1)}</h3>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Avg Rating</p>
                    </div>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/[0.05] flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 rounded-md text-blue-500">
                        <MessageSquare size={15} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{ratingAggregate.total_reviews || 0}</h3>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Feedbacks</p>
                    </div>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-black/[0.05] flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 rounded-md text-emerald-500">
                        <ThumbsUp size={15} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{positivePercent}%</h3>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Positive</p>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg border border-black/[0.05] overflow-hidden">
                <div className="px-4 py-3 border-b border-black/[0.05] flex justify-between items-center">
                    <h3 className="font-semibold text-[13px] text-gray-800">Recent Reviews</h3>
                    <span className="text-[9px] font-medium text-gray-400">Approved reviews shown publicly</span>
                </div>
                <div className="divide-y divide-black/[0.03]">
                    {reviews.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs">
                            No reviews received yet.
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="p-4 hover:bg-gray-50/30 transition-colors text-xs">
                                <div className="flex justify-between items-start mb-1.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center font-bold text-gray-500 border border-black/[0.04]">
                                            {review.customer?.name?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{review.customer?.name || review.full_name || 'Patient'}</h4>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(review.reviewed_at || review.created_at).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-0.5 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"}
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.review_text}</p>

                                <div className="space-y-3">
                                    {review.reply ? (
                                        <div className="bg-slate-50/50 border border-black/[0.04] p-3 rounded-lg text-xs mt-1.5 ml-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-bold text-cureza-green">Your Response</span>
                                                <span className="text-[9px] text-gray-400">
                                                    {new Date(review.reply.created_at).toLocaleDateString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 font-sans italic">"{review.reply.reply_text}"</p>
                                        </div>
                                    ) : (
                                        <div className="ml-3">
                                            {replyingToId === review.id ? (
                                                <div className="space-y-2 mt-2 max-w-xl">
                                                    <Textarea
                                                        placeholder="Write your professional response here..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        className="min-h-[70px] text-xs rounded-lg border-black/[0.05]"
                                                    />
                                                    <div className="flex gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handlePostReply(review.id)}
                                                            disabled={submittingReply}
                                                            className="bg-cureza-green hover:bg-green-700 font-semibold gap-1 text-[10px] h-7 rounded-lg"
                                                        >
                                                            {submittingReply ? 'Sending...' : <><Send size={10} /> Post Response</>}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 text-[10px] rounded-lg"
                                                            onClick={() => {
                                                                setReplyingToId(null);
                                                                setReplyText('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setReplyingToId(review.id)}
                                                    className="text-[10px] text-cureza-green font-bold hover:underline"
                                                >
                                                    Reply to feedback
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
