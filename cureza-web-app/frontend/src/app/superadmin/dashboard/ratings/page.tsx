'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
    Loader2, Check, X, Star, MessageSquare, Image as ImageIcon, Video,
    Trash2, Edit2, Plus, Eye, ExternalLink
} from 'lucide-react';

interface Review {
    id: number;
    rating?: number;
    stars?: number;
    review_text?: string;
    description?: string;
    created_at?: string;
    reviewed_at?: string;
    status: string;
    customer?: { name: string; email: string };
    full_name?: string;
    email?: string;
    review_type: 'product' | 'seller';
    product?: { id: number; title: string; image: string; sku: string };
    seller?: { id: number; name: string; role?: string };
    images?: string[];
    media_items?: { media_type: string; media_path: string }[];
    video_url?: string;
    reply?: { id: number; reply_text: string; created_at: string };
}

export default function RatingsPage() {
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'hidden'>('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter States
    const [reviewType, setReviewType] = useState<'all' | 'product' | 'seller'>('all');
    const [ratingFilter, setRatingFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [viewingReview, setViewingReview] = useState<Review | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        product_id: '',
        full_name: '',
        email: '',
        rating: 5,
        review_text: '',
        status: 'active'
    });

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                status: activeTab,
                page: page.toString(),
            });

            if (reviewType !== 'all') params.append('type', reviewType);
            if (ratingFilter) params.append('rating', ratingFilter);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`/admin/reviews?${params.toString()}`);
            if (res.data.success) {
                setReviews(res.data.data.data);
                setTotalPages(res.data.data.last_page);
            } else {
                setReviews(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
            showToast('Failed to load reviews', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchReviews();
        }, 300);
        return () => clearTimeout(debounce);
    }, [activeTab, page, reviewType, ratingFilter, searchTerm]);

    const handleStatusUpdate = async (id: number, status: 'active' | 'hidden') => {
        try {
            await api.patch(`/admin/reviews/${id}/status`, { status });
            showToast(`Review ${status === 'active' ? 'approved' : 'rejected'} successfully`, 'success');
            fetchReviews();
        } catch (error) {
            console.error('Failed to update status', error);
            showToast('Failed to update review status', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            showToast('Review deleted successfully', 'success');
            fetchReviews();
        } catch (error) {
            console.error('Failed to delete review', error);
            showToast('Failed to delete review', 'error');
        }
    };

    const handleDeleteReply = async (replyId: number) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;
        try {
            await api.delete(`/admin/reviews/reply/${replyId}`);
            showToast('Reply deleted successfully', 'success');
            // Refresh reviews to reflect changes
            fetchReviews();
            setIsViewModalOpen(false); // Close modal as data changed
        } catch (error) {
            console.error('Failed to delete reply', error);
            showToast('Failed to delete reply', 'error');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingReview) {
                await api.put(`/admin/reviews/${editingReview.id}`, {
                    ...formData,
                    rating: Number(formData.rating)
                });
                showToast('Review updated successfully', 'success');
            } else {
                await api.post('/admin/reviews', formData);
                showToast('Review created successfully', 'success');
            }
            setIsModalOpen(false);
            setEditingReview(null);
            resetForm();
            fetchReviews();
        } catch (error) {
            console.error('Failed to save review', error);
            showToast('Failed to save review', 'error');
        }
    };

    const openEditModal = (review: Review) => {
        setEditingReview(review);
        setFormData({
            product_id: review.product?.id.toString() || '',
            full_name: review.customer?.name || review.full_name || '',
            email: review.customer?.email || review.email || '',
            rating: review.rating || review.stars || 5,
            review_text: review.review_text || review.description || '',
            status: review.status
        });
        setIsModalOpen(true);
    };

    const openViewModal = (review: Review) => {
        setViewingReview(review);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            product_id: '',
            full_name: '',
            email: '',
            rating: 5,
            review_text: '',
            status: 'active'
        });
    };

    // Helper to render media grid
    const renderMediaGrid = (review: Review) => (
        <div className="grid grid-cols-3 gap-3">
            {/* New Media Items */}
            {review.media_items?.map((media, i) => (
                <div key={`media-${i}`} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative group">
                    {media.media_type === 'image' ? (
                        <img src={`${BACKEND_URL}/storage/${media.media_path}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><Video size={32} /></div>
                    )}
                </div>
            ))}

            {/* Legacy Images */}
            {(typeof review.images === 'string' ? JSON.parse(review.images) : (review.images || [])).map((img: any, i: number) => {
                if (typeof img !== 'string') return null;
                return (
                    <div key={`img-${i}`} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                            src={img.startsWith('http') ? img : `${BACKEND_URL}/storage/${img}`}
                            className="w-full h-full object-cover"
                            alt={`Review Image ${i + 1}`}
                        />
                    </div>
                )
            })}

            {/* Legacy Video Link */}
            {review.video_url && (
                <a href={review.video_url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors">
                    <Video size={32} className="mb-2" />
                    <span className="text-xs font-medium flex items-center gap-1">Open Video <ExternalLink size={10} /></span>
                </a>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h1>
                    <p className="text-sm text-gray-500">Manage, approve, and edit customer reviews</p>
                </div>
                <button
                    onClick={() => { setEditingReview(null); resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} /> Create Review
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['pending', 'active', 'hidden'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab as any); setPage(1); }}
                                className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-md transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'active' ? 'Approved' : tab === 'hidden' ? 'Rejected' : tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Review Type</label>
                    <select
                        value={reviewType}
                        onChange={(e) => { setReviewType(e.target.value as any); setPage(1); }}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">All Types</option>
                        <option value="product">Product Reviews</option>
                        <option value="seller">Brand Reviews</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rating</label>
                    <select
                        value={ratingFilter}
                        onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">All Ratings</option>
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Stars</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search customer, content..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <MessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No reviews found matching filters.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => {
                        const displayName = review.customer?.name || review.full_name || 'Customer';
                        const displayRating = review.rating || review.stars || 0;
                        const mediaItems = review.media_items || [];
                        const legacyImages = typeof review.images === 'string' ? JSON.parse(review.images) : (review.images || []);

                        return (
                            <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                                {/* Review Content */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {review.review_type === 'seller' && (
                                                review.seller?.role === 'doctor' ? (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] uppercase font-bold tracking-wider rounded">Doctor Review</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] uppercase font-bold tracking-wider rounded">Brand Review</span>
                                                )
                                            )}
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < displayRating ? "currentColor" : "none"} className={i < displayRating ? "" : "text-gray-300"} />
                                                ))}
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{displayRating}.0</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEditModal(review)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(review.id)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                            <button onClick={() => openViewModal(review)} className="p-1 text-gray-400 hover:text-gray-600" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-800 leading-relaxed line-clamp-3">{review.review_text || review.description}</p>

                                    {/* Media Preview in List */}
                                    {(mediaItems.length > 0 || legacyImages.length > 0 || review.video_url) && (
                                        <div className="flex gap-2">
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
                                                <ImageIcon size={12} /> Media Attached
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-50 mt-2">
                                        <span className="font-medium text-gray-900">{displayName}</span>
                                        <span>•</span>
                                        <span>{review.customer?.email || review.email}</span>
                                        <span>•</span>
                                        <span className="text-xs">{new Date(review.created_at || review.reviewed_at!).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Product / Brand Info & Status Actions */}
                                <div className="w-full md:w-64 flex flex-col gap-4 border-l border-gray-100 pl-0 md:pl-6">
                                    {review.product ? (
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                            <div className="w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0">
                                                {review.product.image ? (
                                                    <img
                                                        src={review.product.image.startsWith('http') ? review.product.image : `${BACKEND_URL}/storage/${review.product.image}`}
                                                        alt={review.product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 truncate">{review.product.title}</p>
                                                <p className="text-[10px] text-gray-500">ID: {review.product.id}</p>
                                            </div>
                                        </div>
                                    ) : review.review_type === 'seller' ? (
                                        review.seller?.role === 'doctor' ? (
                                            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <div className="w-12 h-12 bg-white rounded border border-blue-200 flex items-center justify-center text-blue-600 font-bold uppercase flex-shrink-0">
                                                    {(review.seller?.name || 'D').charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">👨‍⚕️ Doctor Review</p>
                                                    <p className="text-xs font-bold text-gray-900 truncate">{review.seller?.name || 'Unknown Doctor'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                <div className="w-12 h-12 bg-white rounded border border-purple-200 flex items-center justify-center text-purple-600 font-bold uppercase flex-shrink-0">
                                                    {(review.seller?.name || 'S').charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider mb-0.5">Brand Review</p>
                                                    <p className="text-xs font-bold text-gray-900 truncate">{review.seller?.name || 'Unknown Seller'}</p>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                            <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center text-gray-400">
                                                <ImageIcon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 truncate">Unknown Target</p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'pending' && (
                                        <div className="grid grid-cols-2 gap-2 mt-auto">
                                            <button
                                                onClick={() => handleStatusUpdate(review.id, 'hidden')}
                                                className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                            >
                                                <X size={16} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(review.id, 'active')}
                                                className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                                            >
                                                <Check size={16} /> Approve
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >Previous</button>
                            <span className="px-3 py-1 bg-gray-50 rounded">Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >Next</button>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">{editingReview ? 'Edit Review' : 'Create Manual Review'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {!editingReview && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.product_id}
                                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Enter Product ID"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                <select
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {[5, 4, 3, 2, 1].map(num => (
                                        <option key={num} value={num}>{num} Stars</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Review Content</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={formData.review_text}
                                    onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                ></textarea>
                            </div>

                            {/* Show Media in Edit Modal */}
                            {editingReview && (editingReview.images?.length! > 0 || editingReview.media_items?.length! > 0 || editingReview.video_url) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Attached Media (Read Only)</label>
                                    {renderMediaGrid(editingReview)}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {editingReview ? 'Update Review' : 'Create Review'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {isViewModalOpen && viewingReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Review Details</h2>
                                <p className="text-sm text-gray-500">ID: {viewingReview.id}</p>
                            </div>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Review Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                                        {(viewingReview.customer?.name || viewingReview.full_name || 'C').charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{viewingReview.customer?.name || viewingReview.full_name}</h3>
                                        <p className="text-sm text-gray-500">{viewingReview.customer?.email || viewingReview.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end text-yellow-400 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} fill={i < (viewingReview.rating || viewingReview.stars || 0) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(viewingReview.created_at || viewingReview.reviewed_at!).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-gray-800 text-lg leading-relaxed">{viewingReview.review_text || viewingReview.description}</p>
                            </div>

                            {/* Media Gallery */}
                            {(viewingReview.media_items?.length! > 0 || viewingReview.images?.length! > 0 || viewingReview.video_url) && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Attached Media</h4>
                                    {renderMediaGrid(viewingReview)}
                                </div>
                            )}

                            {/* Seller Reply Section */}
                            {viewingReview.reply && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 relative group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                S
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm">Seller Response</span>
                                            <span className="text-xs text-gray-500">• {new Date(viewingReview.reply.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteReply(viewingReview.reply!.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100"
                                            title="Delete Reply"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{viewingReview.reply.reply_text}</p>
                                </div>
                            )}

                            {/* Actions Footer */}
                            {activeTab === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => { handleStatusUpdate(viewingReview.id, 'hidden'); setIsViewModalOpen(false); }}
                                        className="flex-1 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
                                    >
                                        Reject Review
                                    </button>
                                    <button
                                        onClick={() => { handleStatusUpdate(viewingReview.id, 'active'); setIsViewModalOpen(false); }}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                                    >
                                        Approve Review
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
