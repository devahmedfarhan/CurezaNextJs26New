'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Clock, CheckCircle2, EyeOff, Stethoscope, Store, HelpCircle } from 'lucide-react';
import api from '@/lib/api';

interface Review {
    id: number;
    review_type: 'product' | 'seller';
    rating: number;
    review_text: string;
    status: string;
    created_at: string;
    product?: {
        id: number;
        title: string;
        image?: string;
    };
    seller?: {
        id: number;
        name: string;
        role?: string;
        specialization?: string;
    };
    reply?: {
        id: number;
        reply_text: string;
        created_at: string;
    };
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    useEffect(() => {
        api.get('/customer/reviews')
            .then((res) => {
                const rawReviews = res.data?.data?.data || res.data?.data || [];
                const mappedReviews = rawReviews.map((r: any) => ({
                    id: r.id,
                    review_type: r.review_type || 'product',
                    rating: r.rating || r.stars || 0,
                    review_text: r.review_text || r.description || '',
                    status: r.status || 'pending',
                    created_at: new Date(r.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    }),
                    product: r.product,
                    seller: r.seller,
                    reply: r.reply,
                }));
                setReviews(mappedReviews);
            })
            .catch((err) => console.error("Error loading customer reviews:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-64 bg-gray-100 dark:bg-gray-850 rounded animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                        <div 
                            key={n} 
                            className="bg-white dark:bg-gray-900 p-6 rounded-[8px] animate-pulse space-y-4"
                            style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)', boxShadow: 'none' }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-850 rounded"></div>
                                </div>
                            </div>
                            <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-850 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Reviews</h1>
                <p className="text-gray-500 text-xs mt-1">Manage and track your product reviews, store feedback, and doctor ratings</p>
            </div>

            <div className="space-y-5">
                {reviews.length === 0 ? (
                    <div 
                        className="bg-white dark:bg-gray-900 p-12 text-center text-gray-500 dark:text-gray-400"
                        style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)', boxShadow: 'none' }}
                    >
                        <MessageSquare className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
                        <p className="text-sm font-medium">You haven't written any reviews yet.</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Reviews you write for products, sellers, or doctors will appear here.</p>
                    </div>
                ) : (
                    reviews.map((review) => {
                        const isSellerType = review.review_type === 'seller';
                        const isDoctor = isSellerType && review.seller?.role === 'doctor';

                        // Resolve badge and text
                        let badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-200/50 dark:bg-yellow-950/20 dark:text-yellow-400';
                        let badgeIcon = <Clock size={12} />;
                        let badgeText = 'Awaiting Moderation';

                        if (review.status === 'active' || review.status === 'approved') {
                            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400';
                            badgeIcon = <CheckCircle2 size={12} />;
                            badgeText = 'Published';
                        } else if (review.status === 'hidden' || review.status === 'rejected') {
                            badgeColor = 'bg-red-50 text-red-700 border-red-200/50 dark:bg-red-950/20 dark:text-red-400';
                            badgeIcon = <EyeOff size={12} />;
                            badgeText = 'Hidden';
                        }

                        return (
                            <div 
                                key={review.id} 
                                className="bg-white dark:bg-gray-900 p-6 relative flex flex-col gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                                style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)', boxShadow: 'none' }}
                            >
                                {/* Moderation Badge */}
                                <div className="absolute top-6 right-6">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[4px] border uppercase tracking-wider ${badgeColor}`}>
                                        {badgeIcon}
                                        {badgeText}
                                    </span>
                                </div>

                                {/* Header Info */}
                                <div className="flex gap-4 items-center">
                                    {/* Icon / Thumbnail */}
                                    {isDoctor ? (
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center shrink-0 border border-blue-150 dark:border-blue-900/30">
                                            <Stethoscope size={20} />
                                        </div>
                                    ) : isSellerType ? (
                                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center shrink-0 border border-purple-150 dark:border-purple-900/30">
                                            <Store size={20} />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-850 rounded-lg overflow-hidden shrink-0 border border-gray-150 dark:border-gray-800 flex items-center justify-center">
                                            {review.product?.image ? (
                                                <img 
                                                    src={review.product.image.startsWith('http') ? review.product.image : `${BACKEND_URL}/storage/${review.product.image}`}
                                                    alt={review.product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl">🌿</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Titles */}
                                    <div className="pr-24">
                                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                                            {isDoctor 
                                                ? review.seller?.name 
                                                : isSellerType 
                                                    ? review.seller?.name 
                                                    : review.product?.title || 'Product'}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">
                                            {isDoctor 
                                                ? (review.seller?.specialization || 'Consultation Review') 
                                                : isSellerType 
                                                    ? 'Store Feedback' 
                                                    : 'Product Review'}
                                        </p>
                                    </div>
                                </div>

                                {/* Star & Date row */}
                                <div className="flex items-center gap-3 py-1 border-t border-b border-gray-100 dark:border-gray-800/80">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-200 dark:text-gray-800"} />
                                        ))}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{review.rating}.0</span>
                                    <span className="text-gray-300 dark:text-gray-800">|</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{review.created_at}</span>
                                </div>

                                {/* Review Text body */}
                                <div>
                                    <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed italic">
                                        "{review.review_text || 'No review comments provided.'}"
                                    </p>
                                </div>

                                {/* Seller Reply Box */}
                                {review.reply && (
                                    <div className="bg-neutral-50 dark:bg-gray-800/20 p-4 rounded-[6px] border border-black/5 dark:border-white/5 space-y-2 mt-1">
                                        <div className="flex items-center justify-between text-xs font-semibold text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-1.5">
                                                <MessageSquare size={14} className="text-gray-500" />
                                                <span>
                                                    {isDoctor ? 'Doctor\'s Response' : 'Seller\'s Response'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-normal">
                                                {new Date(review.reply.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-655 dark:text-gray-350 text-xs leading-relaxed pl-5 font-normal">
                                            {review.reply.reply_text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
