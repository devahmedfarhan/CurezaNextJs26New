'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    RatingSummary,
    RatingBreakdown,
    ReviewList,
    SellerReviewForm,
} from '@/components/reviews';
import {
    getSellerRating,
    getSellerPublicReviews,
} from '@/lib/api/reviews';
import { Store, Star, MessageSquare, TrendingUp } from 'lucide-react';

export default function BrandReviewsSection({ brandId, brandName }: { brandId: number; brandName: string }) {
    const [rating, setRating] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchRating();
        fetchReviews();
    }, [brandId, filterType, filterRating]);

    const fetchRating = async () => {
        try {
            const response = await getSellerRating(brandId);
            setRating(response.data.data);
        } catch (error) {
            console.error('Failed to fetch rating:', error);
        }
    };

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getSellerPublicReviews(brandId, {
                page,
                per_page: 10,
                type: filterType !== 'all' ? filterType : undefined,
                rating: filterRating || undefined,
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

    const handleFilterByRating = (rating: number) => {
        setFilterRating(filterRating === rating ? null : rating);
        setCurrentPage(1);
    };

    const handleReviewSubmitted = () => {
        setShowForm(false);
        fetchRating();
        fetchReviews(1);
    };

    return (
        <div className="mt-16 border-t border-gray-200 pt-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Store className="w-8 h-8 text-purple-500" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Brand Reputation</h2>
                        <p className="text-gray-600 mt-1">Customer reviews and ratings</p>
                    </div>
                </div>
            </div>

            {/* Overall Rating Card */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-purple-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <RatingSummary
                            averageRating={rating?.overall_rating || 0}
                            totalReviews={rating?.total_reviews || 0}
                            showTrend
                            trend="stable"
                        />
                        <div className="mt-4 text-sm text-gray-600">
                            <p>Overall brand rating calculated from:</p>
                            <ul className="mt-2 space-y-1">
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span>Product reviews (70%)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    <span>Brand experience (30%)</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {rating?.product_rating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Product Quality</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {rating?.brand_rating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Brand Service</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Type Filter */}
            <div className="mb-6 flex gap-2">
                {[
                    { value: 'all', label: 'All Reviews' },
                    { value: 'product', label: 'Product Reviews' },
                    { value: 'seller', label: 'Brand Reviews' },
                ].map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setFilterType(option.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === option.value
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-500'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Reviews Content */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Sidebar - Rating Breakdown */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
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
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Clear filter
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content - Reviews List */}
                <div className="lg:col-span-2">
                    <ReviewList
                        reviews={reviews}
                        loading={loading}
                        showProduct={filterType !== 'seller'}
                        emptyMessage="No reviews yet for this brand"
                        onLoadMore={() => fetchReviews(currentPage + 1)}
                        hasMore={hasMore}
                    />
                </div>
            </div>
        </div>
    );
}
