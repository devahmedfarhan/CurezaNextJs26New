'use client';

import React from 'react';
import RatingStars from './RatingStars';
import { CheckCircle, Calendar, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

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
    full_name?: string;
}

interface ReviewCardProps {
    review: Review;
    showProduct?: boolean;
    className?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    showProduct = false,
    className = '',
}) => {
    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300 ${className}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {getInitials(review.customer?.name || review.full_name || 'Anonymous')}
                    </div>

                    {/* Customer info & rating */}
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{review.customer?.name || review.full_name || 'Anonymous'}</h4>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <RatingStars rating={review.rating} size="sm" />
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(review.reviewed_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Product name if shown */}
                {showProduct && review.product && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {review.product.name}
                    </div>
                )}
            </div>

            {/* Review text */}
            {review.review_text && (
                <p className="text-gray-700 leading-relaxed mb-4">{review.review_text}</p>
            )}

            {/* Media gallery */}
            {review.media_items && review.media_items.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {review.media_items.map((media) => (
                        <div
                            key={media.id}
                            className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer"
                        >
                            {media.media_type === 'image' ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${media.media_path}`}
                                    alt="Review image"
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Seller reply */}
            {review.reply && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                {getInitials(review.reply.seller?.name || 'Seller')}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {review.reply.seller?.name || 'Seller'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatDate(review.reply.created_at)}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {review.reply.reply_text}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
