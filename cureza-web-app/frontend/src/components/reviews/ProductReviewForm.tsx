'use client';

import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createProductReview } from '@/lib/api/reviews';

interface ProductReviewFormProps {
    productId: number;
    orderId: number;
    productName?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({
    productId,
    orderId,
    productName,
    onSuccess,
    onCancel,
    className = '',
}) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (files.length + newFiles.length > 5) {
                setError('Maximum 5 images allowed');
                return;
            }
            setFiles([...files, ...newFiles]);
            setError('');
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('product_id', productId.toString());
            formData.append('order_id', orderId.toString());
            formData.append('rating', rating.toString());
            if (reviewText) {
                formData.append('review_text', reviewText);
            }

            files.forEach((file, index) => {
                formData.append(`media[${index}]`, file);
            });

            await createProductReview(formData);

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
                    Thank you for sharing your experience.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Write a Review
                {productName && <span className="text-gray-500 font-normal"> for {productName}</span>}
            </h3>

            {/* Rating */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating <span className="text-red-500">*</span>
                </label>
                <RatingStars
                    rating={rating}
                    interactive
                    onChange={setRating}
                    size="xl"
                />
            </div>

            {/* Review Text */}
            <div className="mb-6">
                <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review (Optional)
                </label>
                <textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={5}
                    maxLength={2000}
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                    {reviewText.length} / 2000
                </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Photos/Videos (Optional)
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*,video/mp4"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                    >
                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                            Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            JPG, PNG or MP4 (max 10MB each, up to 5 files)
                        </span>
                    </label>
                </div>

                {/* File Preview */}
                {files.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mt-4">
                        {files.map((file, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {file.type.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-xs text-gray-500">Video</div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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

export default ProductReviewForm;
