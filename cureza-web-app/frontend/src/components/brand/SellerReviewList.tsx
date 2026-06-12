'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare } from 'lucide-react';
import api from '@/lib/api';

interface SellerReviewListProps {
    sellerId: number;
    refreshTrigger: number;
}

export default function SellerReviewList({ sellerId, refreshTrigger }: SellerReviewListProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!sellerId) return;

            try {
                // Using the public endpoint for seller reviews
                const res = await api.get(`/public/sellers/${sellerId}/reviews`);
                // Backend returns: { success: true, data: { data: [...], current_page: 1, ... } }
                // So reviews array is at res.data.data.data
                setReviews(res.data.data?.data || []);
            } catch (error) {
                console.error('Failed to fetch seller reviews', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [sellerId, refreshTrigger]);

    if (loading) return <div className="py-12 text-center text-gray-500">Loading seller reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Star className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500">This seller hasn't received any reviews yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => {
                const displayName = review.full_name || review.customer?.name || 'Customer';
                const displayInitial = displayName.charAt(0);
                const displayRating = review.rating || review.stars || 5;
                const displayContent = review.review_text || review.description;
                const createdDate = review.created_at || review.reviewed_at || new Date().toISOString();

                return (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg uppercase border border-white shadow-sm">
                                    {displayInitial}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{displayName}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < displayRating ? "currentColor" : "none"} className={i < displayRating ? "" : "text-gray-300"} />
                                            ))}
                                        </div>
                                        <span>•</span>
                                        <span>{new Date(createdDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            {review.order && (
                                <span className="text-xs font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1">
                                    <CheckCircle size={12} /> Verified Purchase
                                </span>
                            )}
                        </div>

                        {/* Associated Product (if any) */}
                        {review.product && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                                {review.product.image && (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                                        <img src={review.product.image} className="w-full h-full object-cover" alt={review.product.title} />
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Review for Product</p>
                                    <a href={`/shop/category/${review.product.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                                        {review.product.title}
                                    </a>
                                </div>
                            </div>
                        )}

                        <p className="text-gray-700 leading-relaxed mb-4 text-base">{displayContent}</p>

                        {/* Seller Reply */}
                        {review.reply && (
                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mt-6 ml-4 relative">
                                <div className="absolute -top-3 left-4 bg-white px-2 py-0.5 rounded border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                                    Seller Response
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        S
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">Seller Response</p>
                                        <p className="text-xs text-gray-500">{new Date(review.reply.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed pl-11">{review.reply.reply_text}</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
