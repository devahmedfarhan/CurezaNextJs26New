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
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600 animate-pulse" />;
    return null;
  };

  const getTrendText = () => {
    if (trend === 'up') return 'Rising Satisfaction';
    return 'Consistent';
  };

  return (
    <div className={`flex items-center gap-6 text-[#052326] ${className}`}>
      {/* Large rating number */}
      <div className="text-left">
        <div className="text-5xl font-extrabold tracking-tighter">
          {Number(averageRating) > 0 ? Number(averageRating).toFixed(1) : '—'}
        </div>
        <RatingStars rating={Number(averageRating)} size="md" className="justify-start mt-2" />
        <p className="text-xs text-[#052326]/60 font-light mt-1.5">
          Based on {totalReviews} community {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Optional trend indicator */}
      {showTrend && (
        <div className="flex flex-col gap-1 text-[10px] uppercase tracking-wider font-bold">
          <div className="flex items-center gap-1.5 text-green-600">
            {getTrendIcon()}
            <span>{getTrendText()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingSummary;
