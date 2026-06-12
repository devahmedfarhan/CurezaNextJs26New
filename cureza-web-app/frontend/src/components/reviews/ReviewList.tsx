'use client';

import React from 'react';
import ReviewCard from './ReviewCard';
import { Loader2 } from 'lucide-react';

interface Review {
    id: number;
    customer: {
        name: string;
        email?: string;
    };
    rating: number;
    review_text: string;
    reviewed_at: string;
    media_items?: Array<{
        id: number;
        media_type: string;
        media_path: string;
        thumbnail_path?: string;
    }>;
    reply?: {
        seller: {
            name: string;
        };
        reply_text: string;
        created_at: string;
    };
    product?: {
        name: string;
    };
}

interface ReviewListProps {
    reviews: Review[];
    loading?: boolean;
    showProduct?: boolean;
    emptyMessage?: string;
    onLoadMore?: () => void;
    hasMore?: boolean;
    className?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    loading = false,
    showProduct = false,
    emptyMessage = 'No reviews yet',
    onLoadMore,
    hasMore = false,
    className = '',
}) => {
    if (loading && reviews.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!loading && reviews.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                    </svg>
                </div>
                <p className="text-gray-500 font-medium">{emptyMessage}</p>
                <p className="text-sm text-gray-400 mt-1">
                    Be the first to share your experience!
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} showProduct={showProduct} />
            ))}

            {/* Load more button */}
            {hasMore && onLoadMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-blue-500 hover:text-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Load More Reviews'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
