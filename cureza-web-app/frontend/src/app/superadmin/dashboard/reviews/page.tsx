'use client';

import React, { useEffect, useState } from 'react';
import {
    getAllReviews,
    getReviewStatistics,
    updateReviewStatus,
    deleteReview,
    updateReview,
} from '@/lib/api/reviews';
import {
    Shield,
    Eye,
    EyeOff,
    Trash2,
    Edit,
    Filter,
    Search,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Star,
    TrendingUp,
} from 'lucide-react';

export default function SuperAdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [editingReview, setEditingReview] = useState<any>(null);
    const [editText, setEditText] = useState('');
    const [editRating, setEditRating] = useState(5);

    useEffect(() => {
        fetchStatistics();
        fetchReviews();
    }, [filterStatus, filterType, filterRating, searchTerm]);

    const fetchStatistics = async () => {
        try {
            const response = await getReviewStatistics();
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        }
    };

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const params: any = {
                page,
                per_page: 20,
            };

            if (filterStatus !== 'all') params.status = filterStatus;
            if (filterType !== 'all') params.type = filterType;
            if (filterRating) params.rating = filterRating;
            if (searchTerm) params.search = searchTerm;

            const response = await getAllReviews(params);
            const data = response.data.data;

            if (page === 1) {
                setReviews(data.data);
            } else {
                setReviews([...reviews, ...data.data]);
            }

            setHasMore(data.current_page < data.last_page);
            setCurrentPage(data.current_page);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async (reviewId: number, newStatus: string) => {
        if (!confirm(`Are you sure you want to ${newStatus} this review?`)) return;

        try {
            await updateReviewStatus(reviewId, newStatus as any);
            fetchReviews(1);
            fetchStatistics();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

        try {
            await deleteReview(reviewId);
            fetchReviews(1);
            fetchStatistics();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete review');
        }
    };

    const handleEdit = (review: any) => {
        setEditingReview(review);
        setEditText(review.review_text || '');
        setEditRating(review.rating);
    };

    const handleSaveEdit = async () => {
        if (!editingReview) return;

        try {
            await updateReview(editingReview.id, {
                rating: editRating,
                review_text: editText,
            });
            setEditingReview(null);
            fetchReviews(1);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update review');
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
                    <p className="text-gray-600 mt-1">
                        Moderate and manage all customer reviews
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-5 h-5" />
                    <span>Super Admin Controls</span>
                </div>
            </div>

            {/* Statistics */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Reviews</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {statistics.total_reviews}
                                </p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700">Active</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {statistics.active_reviews}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700">Hidden</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {statistics.hidden_reviews}
                                </p>
                            </div>
                            <EyeOff className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700">Avg Rating</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {statistics.average_rating?.toFixed(1) || '0.0'}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700">Replies</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {statistics.total_replies}
                                </p>
                            </div>
                            <Star className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="hidden">Hidden</option>
                            <option value="deleted">Deleted</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="product">Product</option>
                            <option value="seller">Seller/Brand</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                        </label>
                        <select
                            value={filterRating || ''}
                            onChange={(e) =>
                                setFilterRating(e.target.value ? parseInt(e.target.value) : null)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search reviews..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Rating
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Review
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading && reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                        No reviews found
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {review.customer?.name || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {review.product?.name || review.seller?.name || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded ${review.review_type === 'product'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                    }`}
                                            >
                                                {review.review_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                <span className="font-medium">{review.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 max-w-md">
                                            <p className="text-sm text-gray-700 line-clamp-2">
                                                {review.review_text || 'No text'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded ${review.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : review.status === 'hidden'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {review.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-500">
                                            {new Date(review.reviewed_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(review)}
                                                    title="Edit"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {review.status === 'active' ? (
                                                    <button
                                                        onClick={() => handleChangeStatus(review.id, 'hidden')}
                                                        title="Hide"
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                                                    >
                                                        <EyeOff className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleChangeStatus(review.id, 'active')}
                                                        title="Show"
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    title="Delete"
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="px-4 py-4 border-t border-gray-200 flex justify-center">
                        <button
                            onClick={() => fetchReviews(currentPage + 1)}
                            disabled={loading}
                            className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Review</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating
                                </label>
                                <select
                                    value={editRating}
                                    onChange={(e) => setEditRating(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value={5}>5 Stars</option>
                                    <option value={4}>4 Stars</option>
                                    <option value={3}>3 Stars</option>
                                    <option value={2}>2 Stars</option>
                                    <option value={1}>1 Star</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Review Text
                                </label>
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditingReview(null)}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
