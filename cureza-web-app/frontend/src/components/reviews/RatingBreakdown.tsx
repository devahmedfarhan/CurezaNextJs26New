'use client';

import React from 'react';

interface RatingBreakdownProps {
  breakdown: {
    5: { count: number; percentage: number };
    4: { count: number; percentage: number };
    3: { count: number; percentage: number };
    2: { count: number; percentage: number };
    1: { count: number; percentage: number };
  };
  totalReviews: number;
  onFilterByRating?: (rating: number) => void;
  className?: string;
}

const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  breakdown,
  totalReviews,
  onFilterByRating,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const data = breakdown[rating as keyof typeof breakdown] || { percentage: 0, count: 0 };
        const percentage = data.percentage || 0;
        const count = data.count || 0;

        return (
          <div
            key={rating}
            className={`flex items-center gap-3 ${onFilterByRating ? 'cursor-pointer group' : ''}`}
            onClick={() => onFilterByRating && onFilterByRating(rating)}
          >
            {/* Star label */}
            <div className="flex items-center gap-1 w-10 flex-shrink-0 text-xs font-semibold text-[#052326]">
              <span>{rating}</span>
              <svg
                className="w-3.5 h-3.5 text-[#F0C417]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>

            {/* Progress bar track (10-14px border radius, i.e., rounded-[10px]) */}
            <div className="flex-1 h-2 bg-[#052326]/10 rounded-[6px] overflow-hidden transition-all duration-300">
              <div
                className="h-full bg-[#052326] group-hover:bg-[#F0C417] transition-all duration-500 ease-out rounded-[6px]"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Percentage & count */}
            <div className="w-16 flex-shrink-0 text-right text-xs font-semibold text-[#052326]">
              <span>{Number(percentage).toFixed(0)}%</span>
              <span className="text-[10px] text-[#052326]/40 ml-1 font-light">({count})</span>
            </div>
          </div>
        );
      })}

      {totalReviews === 0 && (
        <p className="text-xs text-[#052326]/40 text-center py-4">
          No ratings available yet.
        </p>
      )}
    </div>
  );
};

export default RatingBreakdown;
