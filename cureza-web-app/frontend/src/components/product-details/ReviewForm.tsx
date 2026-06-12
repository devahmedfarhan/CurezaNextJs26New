'use client';

import { useState } from 'react';
import { Star, Upload, X, Loader2, LogIn } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface ReviewFormProps {
    productId: number;
    onSuccess: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
    const { showToast } = useToast();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [formData, setFormData] = useState({
        full_name: user?.name || '',
        email: user?.email || '',
        description: '',
        video_url: ''
    });
    const [images, setImages] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLoginRedirect = () => {
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
    };

    if (!user) {
        return (
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center space-y-4">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <LogIn className="text-cureza-green" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Please Login to Review</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    You need to be logged in to share your experience with this product.
                </p>
                <button
                    onClick={handleLoginRedirect}
                    className="px-6 py-2.5 bg-cureza-green text-white rounded-full font-bold text-sm hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                    Login / Register
                </button>
            </div>
        );
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            showToast('Please select a star rating', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('product_id', productId.toString());
            data.append('stars', rating.toString());
            data.append('full_name', formData.full_name);
            data.append('email', formData.email);
            data.append('description', formData.description);
            if (formData.video_url) data.append('video_url', formData.video_url);

            images.forEach((file, index) => {
                data.append(`images[${index}]`, file);
            });

            await api.post('/reviews', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Review submitted successfully! Pending approval.', 'success');
            setFormData({ full_name: user?.name || '', email: user?.email || '', description: '', video_url: '' });
            setRating(0);
            setImages([]);
            onSuccess();
        } catch (error: any) {
            console.error('Review submission failed', error);
            showToast(error.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>

            {/* Rating */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                size={24}
                                fill={star <= (hoverRating || rating) ? "#FBBF24" : "none"}
                                className={star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green"
                        placeholder="john@example.com"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review *</label>
                <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green h-32"
                    placeholder="Tell us what you liked or disliked..."
                />
            </div>

            {/* Media Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Photos (Optional)</label>
                <div className="flex flex-wrap gap-3">
                    {images.map((file, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white hover:border-cureza-green transition-colors">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-[10px] text-gray-500 mt-1">Upload</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
                <input
                    type="url"
                    value={formData.video_url}
                    onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:ring-cureza-green focus:border-cureza-green"
                    placeholder="https://youtube.com/..."
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" size={20} /> Submitting...
                    </>
                ) : (
                    'Submit Review'
                )}
            </button>
        </form>
    );
}
