'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
    className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onChange,
    showValue = false,
    className = '',
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    };

    const handleClick = (value: number) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex items-center gap-0.5">
                {Array.from({ length: maxRating }, (_, index) => {
                    const starValue = index + 1;
                    const fillPercentage = Math.min(Math.max(displayRating - index, 0), 1) * 100;

                    return (
                        <div
                            key={index}
                            className={`relative ${interactive ? 'cursor-pointer transform transition-transform hover:scale-110' : ''}`}
                            onClick={() => handleClick(starValue)}
                            onMouseEnter={() => handleMouseEnter(starValue)}
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* Background star (empty) */}
                            <Star
                                className={`${sizeClasses[size]} text-gray-300 transition-colors duration-200`}
                                fill="currentColor"
                            />

                            {/* Foreground star (filled) */}
                            <div
                                className="absolute top-0 left-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    className={`${sizeClasses[size]} ${interactive && hoverRating >= starValue
                                        ? 'text-yellow-400'
                                        : 'text-yellow-500'
                                        } transition-colors duration-200`}
                                    fill="currentColor"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {showValue && (
                <span className={`font-medium text-gray-700 ${textSizeClasses[size]} ml-1`}>
                    {Number(rating).toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default RatingStars;
