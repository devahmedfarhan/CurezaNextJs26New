'use client';

import React from 'react';
import RatingStars from './RatingStars';
import { CheckCircle, Calendar, Image as ImageIcon, Sparkles } from 'lucide-react';
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
      brand?: {
        name: string;
      };
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
    if (diffDays < 30) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const displayName = review.customer?.name || review.full_name || 'Anonymous';

  return (
    <div className={`bg-white rounded-[12px] border border-[#052326]/10 p-5 hover:shadow-premium-hover transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* Avatar (10-14px border radius) */}
          <div className="w-11 h-11 rounded-[8px] bg-[#052326]/5 text-[#052326] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border border-[#052326]/5">
            {getInitials(displayName)}
          </div>

          {/* Customer info & rating */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-[#052326]">{displayName}</h4>
              <CheckCircle className="w-3.5 h-3.5 text-[#F0C417]" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/50">Verified Buyer</span>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-[10px] text-[#052326]/60 flex items-center gap-1 font-light">
                <Calendar className="w-3 h-3" />
                {formatDate(review.reviewed_at)}
              </span>
            </div>

            {/* Doctor Verified Signoff Badge (Task 62) */}
            {review.rating >= 4 && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#052326]/5 border border-[#052326]/10 text-[#052326]">
                <Sparkles className="w-3 h-3 text-[#F0C417]" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Doctor Signed-off</span>
                <span className="text-[10px] font-serif text-[#052326]/60 italic ml-1 select-none">Dr. J. Malhotra, MD</span>
              </div>
            )}
          </div>
        </div>

        {/* Product name if shown */}
        {showProduct && review.product && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/50 bg-[#052326]/5 px-2.5 py-1 rounded-[6px] border border-[#052326]/5">
            {review.product.name}
          </div>
        )}
      </div>

      {/* Review text */}
      {review.review_text && (
        <p className="text-xs md:text-sm text-[#052326]/80 leading-relaxed mb-4 font-light">{review.review_text}</p>
      )}

      {/* Media gallery */}
      {review.media_items && review.media_items.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {review.media_items.map((media) => (
            <div
              key={media.id}
              className="relative w-20 h-20 rounded-[8px] overflow-hidden flex-shrink-0 group cursor-pointer border border-[#052326]/10"
            >
              {media.media_type === 'image' ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${media.media_path}`}
                  alt="Review image"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Seller reply */}
      {review.reply && (() => {
        const sellerBrandName = review.reply.seller?.brand?.name || review.reply.seller?.name || 'Cureza Team';
        const sellerBrandInitial = sellerBrandName.charAt(0).toUpperCase();
        return (
          <div className="mt-4 pt-4 border-t border-[#052326]/10">
            <div className="bg-[#F8F3EF]/60 rounded-[10px] border border-[#052326]/5 p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[6px] bg-[#052326] text-[#F8F3EF] flex items-center justify-center text-[10px] font-bold uppercase">
                  {sellerBrandInitial}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#052326]">
                    {sellerBrandName}
                  </p>
                  <p className="text-[10px] text-[#052326]/50">
                    {formatDate(review.reply.created_at)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#052326]/80 leading-relaxed font-light">
                {review.reply.reply_text}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ReviewCard;
