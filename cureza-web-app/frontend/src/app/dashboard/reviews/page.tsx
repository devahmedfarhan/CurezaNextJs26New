'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import api from '@/lib/api';

interface Review {
    id: number;
    product: {
        title: string;
    };
    rating: number; // mapped from stars
    created_at: string;
    description: string;
    // likes: number; // Backend doesn't seem to have likes yet
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/reviews')
            .then((res) => {
                // Map backend response to frontend structure if needed
                // Assuming backend returns array of reviews with 'stars' and 'product' relation
                const mappedReviews = res.data.map((r: any) => ({
                    id: r.id,
                    product: r.product,
                    rating: r.stars,
                    created_at: new Date(r.created_at).toLocaleDateString(),
                    description: r.description,
                }));
                setReviews(mappedReviews);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">My Reviews</h1>

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-500">You haven't written any reviews yet.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex gap-4 mb-4">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                                    🌿
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal dark:text-gray-100">{review.product?.title || 'Product'}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">• {review.created_at}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-4">"{review.description}"</p>

                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                {/* <div className="flex items-center gap-1">
                                    <ThumbsUp size={14} /> {review.likes} Helpful
                                </div> */}
                                {/* <button className="text-cureza-green hover:underline">Edit Review</button> */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
