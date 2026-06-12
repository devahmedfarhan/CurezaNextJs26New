'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, Video } from 'lucide-react';
import api from '@/lib/api';

interface ReviewListProps {
    productId: number;
    refreshTrigger: number; // Used to trigger re-fetch after submission
}

export default function ReviewList({ productId, refreshTrigger }: ReviewListProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchReviews = async () => {
            // Avoid undefined productId calls
            if (!productId) return;

            try {
                const res = await api.get(`/products/${productId}/reviews`);
                setReviews(res.data);
            } catch (error) {
                console.error('Failed to fetch reviews', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId, refreshTrigger]);

    if (loading) return <div className="py-8 text-center text-gray-500">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <Star className="mx-auto text-gray-300 mb-3" size={48} />
                <h3 className="text-lg font-bold text-gray-900">No Reviews Yet</h3>
                <p className="text-gray-500">Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {reviews.map((review) => {
                // Determine name to display (legacy full_name or eager loaded customer.name)
                const displayName = review.full_name || review.customer?.name || 'Customer';
                const displayInitial = displayName.charAt(0);
                const displayRating = review.rating || review.stars || 5;
                const displayContent = review.review_text || review.description;
                const createdDate = review.created_at || review.reviewed_at || new Date().toISOString();

                // Merge legacy images and new media items
                const legacyImages = typeof review.images === 'string' ? JSON.parse(review.images) : (review.images || []);
                const mediaItems = review.media_items || review.mediaItems || [];

                return (
                    <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg uppercase">
                                    {displayInitial}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{displayName}</h4>
                                    {(review.email || review.customer?.email) && (
                                        <p className="text-xs text-gray-400">{review.email || review.customer?.email}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1 text-green-600">
                                            <CheckCircle size={12} /> Verified Buyer
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(createdDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < displayRating ? "currentColor" : "none"} className={i < displayRating ? "" : "text-gray-300"} />
                                ))}
                            </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-4">{displayContent}</p>

                        {/* Review Media (Images & Videos) */}
                        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                            {/* New Media Items */}
                            {mediaItems.length > 0 && mediaItems.map((media: any, i: number) => (
                                <div key={`media-${i}`} className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 relative group cursor-pointer">
                                    {media.media_type === 'image' ? (
                                        <img
                                            src={`${BACKEND_URL}/storage/${media.media_path}`}
                                            alt="Review Media"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-black flex items-center justify-center text-white">
                                            <Video size={24} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Legacy Images */}
                            {legacyImages.length > 0 && legacyImages.map((img: any, i: number) => {
                                if (typeof img !== 'string') return null;
                                return (
                                    <div key={`legacy-${i}`} className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={img.startsWith('http') ? img : `${BACKEND_URL}/storage/${img}`}
                                            alt={`Review ${i}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )
                            })}

                            {/* Legacy Video Link */}
                            {review.video_url && (
                                <a href={review.video_url} target="_blank" rel="noopener noreferrer" className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 text-blue-600 hover:bg-blue-50">
                                    <Video size={32} />
                                </a>
                            )}
                        </div>

                        {/* Seller Reply */}
                        {review.reply && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-cureza-green rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        S
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm">Seller Response</span>
                                    <span className="text-xs text-gray-500">• {new Date(review.reply.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{review.reply.reply_text}</p>
                            </div>
                        )}

                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                            <ThumbsUp size={16} /> <span className="text-xs">Helpful</span>
                        </button>
                    </div>
                )
            })}
        </div>
    );
}
