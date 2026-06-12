'use client';

import React from 'react';
import RatingStars from './RatingStars';
import { TrendingUp } from 'lucide-react';

interface RatingSummaryProps {
    averageRating: number;
    totalReviews: number;
    showTrend?: boolean;
    trend?: 'up' | 'down' | 'stable';
    className?: string;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({
    averageRating,
    totalReviews,
    showTrend = false,
    trend = 'stable',
    className = '',
}) => {
    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
        return null;
    };

    const getTrendText = () => {
        if (trend === 'up') return 'Trending up';
        if (trend === 'down') return 'Trending down';
        return 'Stable';
    };

    return (
        <div className={`flex items-center gap-6 ${className}`}>
            {/* Large rating number */}
            <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">
                    {Number(averageRating) > 0 ? Number(averageRating).toFixed(1) : '—'}
                </div>
                <RatingStars rating={Number(averageRating)} size="md" className="justify-center" />
                <p className="text-sm text-gray-600 mt-2">
                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
            </div>

            {/* Optional trend indicator */}
            {showTrend && trend !== 'stable' && (
                <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon()}
                    <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                        {getTrendText()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default RatingSummary;
