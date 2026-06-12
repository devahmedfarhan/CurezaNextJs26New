'use client';

import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { Loader2, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { createSellerReview } from '@/lib/api/reviews';

interface SellerReviewFormProps {
    sellerId: number;
    orderId: number;
    sellerName?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

const SellerReviewForm: React.FC<SellerReviewFormProps> = ({
    sellerId,
    orderId,
    sellerName,
    onSuccess,
    onCancel,
    className = '',
}) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await createSellerReview({
                seller_id: sellerId,
                order_id: orderId,
                rating,
                review_text: reviewText || undefined,
            });

            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                    Review Submitted!
                </h3>
                <p className="text-green-700">
                    Thank you for rating this seller.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Rate Seller Experience
                    </h3>
                    {sellerName && (
                        <p className="text-gray-600">for {sellerName}</p>
                    )}
                </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Experience <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                    Rate the seller's service, packaging, shipping speed, and communication
                </p>
                <RatingStars
                    rating={rating}
                    interactive
                    onChange={setRating}
                    size="xl"
                />
            </div>

            {/* Review Text */}
            <div className="mb-6">
                <label htmlFor="seller-review-text" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback (Optional)
                </label>
                <textarea
                    id="seller-review-text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={5}
                    maxLength={2000}
                    placeholder="Share your experience with this seller's service..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                    {reviewText.length} / 2000
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || rating === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Review'
                    )}
                </button>
            </div>
        </form>
    );
};

export default SellerReviewForm;
