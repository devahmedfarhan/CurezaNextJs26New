'use client';

import React, { useEffect, useState } from 'react';
import {
    RatingSummary,
    RatingBreakdown,
    ReviewList,
    ProductReviewForm,
} from '@/components/reviews';
import { getProductRating, getProductReviews, checkProductEligibility } from '@/lib/api/reviews';
import { MessageSquare, TrendingUp, Filter } from 'lucide-react';

interface ProductReviewsProps {
    productId: number;
    productName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
    const [rating, setRating] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState('newest');
    const [canWrite, setCanWrite] = useState(false);
    const [eligibleOrderId, setEligibleOrderId] = useState<number | null>(null);
    const [eligibilityMessage, setEligibilityMessage] = useState<string>('');

    useEffect(() => {
        fetchRating();
        fetchReviews();
        checkEligibility();
    }, [productId, filterRating, sortBy]);

    const checkEligibility = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setCanWrite(false);
            setEligibilityMessage('Please login to write a review.');
            return;
        }

        try {
            const response = await checkProductEligibility(productId);
            const { can_review, is_pending, order_id, message } = response.data.data;

            if (is_pending) {
                setCanWrite(false);
                setEligibilityMessage(message);
            } else {
                setCanWrite(can_review);
                setEligibilityMessage(message);
            }

            setEligibleOrderId(order_id);
        } catch (error) {
            console.error('Failed to check eligibility:', error);
            setCanWrite(false);
            setEligibilityMessage('Unable to verify purchase status.');
        }
    };

    const fetchRating = async () => {
        try {
            const response = await getProductRating(productId);
            setRating(response.data.data);
        } catch (error) {
            console.error('Failed to fetch rating:', error);
        }
    };

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getProductReviews(productId, {
                page,
                per_page: 10,
                rating: filterRating || undefined,
                sort: sortBy,
            });

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

    const handleLoadMore = () => {
        fetchReviews(currentPage + 1);
    };

    const handleReviewSubmitted = () => {
        setShowForm(false);
        fetchRating();
        fetchReviews(1);
    };

    const handleFilterByRating = (rating: number) => {
        setFilterRating(filterRating === rating ? null : rating);
        setCurrentPage(1);
    };

    return (
        <div className="mt-16 border-t border-gray-200 pt-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                    <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
                </div>

                {canWrite ? (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                        {showForm ? 'Cancel Review' : 'Write a Review'}
                    </button>
                ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 italic">
                        {eligibilityMessage}
                    </div>
                )}
            </div>

            {/* Review Form */}
            {showForm && canWrite && eligibleOrderId && (
                <div className="mb-8">
                    <ProductReviewForm
                        productId={productId}
                        orderId={eligibleOrderId}
                        productName={productName}
                        onSuccess={handleReviewSubmitted}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* Reviews Content */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Sidebar - Rating Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                        <RatingSummary
                            averageRating={rating?.average_rating || 0}
                            totalReviews={rating?.total_reviews || 0}
                            showTrend
                            trend="stable"
                        />
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                        <RatingBreakdown
                            breakdown={rating?.breakdown || {
                                5: { count: 0, percentage: 0 },
                                4: { count: 0, percentage: 0 },
                                3: { count: 0, percentage: 0 },
                                2: { count: 0, percentage: 0 },
                                1: { count: 0, percentage: 0 },
                            }}
                            totalReviews={rating?.total_reviews || 0}
                            onFilterByRating={handleFilterByRating}
                        />

                        {filterRating && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setFilterRating(null)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear filter
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sort Options */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Sort Reviews</h3>
                        </div>
                        <div className="space-y-2">
                            {[
                                { value: 'newest', label: 'Most Recent' },
                                { value: 'highest', label: 'Highest Rated' },
                                { value: 'lowest', label: 'Lowest Rated' },
                                { value: 'oldest', label: 'Oldest First' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSortBy(option.value)}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${sortBy === option.value
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Content - Reviews List */}
                <div className="lg:col-span-2">
                    <ReviewList
                        reviews={reviews}
                        loading={loading}
                        emptyMessage="No reviews yet. Be the first to review this product!"
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
