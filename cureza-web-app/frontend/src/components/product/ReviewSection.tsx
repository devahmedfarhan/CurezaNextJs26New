'use client';

import { Star, ThumbsUp } from 'lucide-react';

export interface Review {
    id: number;
    userName: string;
    rating: number;
    date: string;
    comment: string;
    helpful: number;
    verified: boolean;
}

interface ReviewSectionProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: { stars: number; count: number; percentage: number }[];
}

export default function ReviewSection({
    reviews,
    averageRating,
    totalReviews,
    ratingBreakdown,
}: ReviewSectionProps) {
    return (
        <div className="space-y-8">
            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                {/* Overall Rating */}
                <div className="text-center md:text-left">
                    <div className="text-5xl font-bold text-charcoal dark:text-gray-100 mb-2">
                        {averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={20}
                                fill={star <= Math.round(averageRating) ? '#16a34a' : 'none'}
                                className={
                                    star <= Math.round(averageRating)
                                        ? 'text-cureza-green'
                                        : 'text-gray-300'
                                }
                            />
                        ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Based on {totalReviews} reviews
                    </p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                    {ratingBreakdown.map((item) => (
                        <div key={item.stars} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                                {item.stars} <Star size={12} className="inline" />
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cureza-green rounded-full transition-all"
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-charcoal dark:text-gray-100">
                                        {review.userName}
                                    </span>
                                    {review.verified && (
                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                            Verified Purchase
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={14}
                                                fill={star <= review.rating ? '#16a34a' : 'none'}
                                                className={
                                                    star <= review.rating
                                                        ? 'text-cureza-green'
                                                        : 'text-gray-300'
                                                }
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {review.date}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            {review.comment}
                        </p>
                        <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cureza-green transition">
                            <ThumbsUp size={14} />
                            Helpful ({review.helpful})
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
