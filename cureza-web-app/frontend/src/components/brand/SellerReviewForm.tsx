'use client';

import { useState, useEffect } from 'react';
import { Star, Upload, X, Loader2, LogIn } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface SellerReviewFormProps {
    sellerId: number;
    onSuccess: () => void;
}

export default function SellerReviewForm({ sellerId, onSuccess }: SellerReviewFormProps) {
    const { showToast } = useToast();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [formData, setFormData] = useState({
        full_name: user?.name || '',
        email: user?.email || '',
    });

    // We update form data if user loads late
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLoginRedirect = () => {
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
    };

    if (!user) {
        return (
            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-[#052326]/12 text-center space-y-4">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <LogIn className="text-[#052326]" size={20} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Login to Review</h3>
                <p className="text-gray-500 text-xs max-w-xs mx-auto">
                    Share your experience with this seller. Login required.
                </p>
                <button
                    onClick={handleLoginRedirect}
                    className="px-6 py-2 bg-[#052326] text-white rounded-xl font-bold text-xs hover:bg-[#0b403a] transition-colors"
                >
                    Login / Register
                </button>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            showToast('Please select a star rating', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/customer/reviews/seller', {
                seller_id: sellerId,
                rating: rating,
                review_text: reviewText,
                // Order ID is optional now. Backend verifies if user has ANY purchase.
            });

            showToast('Seller review submitted successfully!', 'success');
            setReviewText('');
            setRating(0);
            onSuccess();
        } catch (error: any) {
            console.error('Review submission failed', error);
            showToast(error.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-[10px] border-[0.5px] border-[#052326]/12 space-y-5">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="fill-amber-400 text-amber-400" size={24} />
                Rate this Seller
            </h3>

            {/* Rating */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overall Experience</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                size={32}
                                fill={star <= (hoverRating || rating) ? "#fbbf24" : "none"}
                                className={star <= (hoverRating || rating) ? "text-amber-400" : "text-gray-250"}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        disabled
                        className="w-full rounded-xl border-gray-250 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed text-sm font-bold"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full rounded-xl border-gray-250 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed text-sm font-bold"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    className="w-full rounded-xl border-gray-250 focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition-all bg-[#F8F3EF] px-4 py-3 resize-none text-sm font-medium"
                    placeholder="How was your experience with this seller? Shipping, packaging, quality..."
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#052326] text-white rounded-xl font-bold hover:bg-[#0d3f44] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" size={20} /> Submitting...
                    </>
                ) : (
                    'Submit Seller Review'
                )}
            </button>
        </form>
    );
}
