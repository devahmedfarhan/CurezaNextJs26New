'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { Plus, Trash2, Tag, Calendar, Percent, IndianRupee, Pencil } from 'lucide-react';
import { format } from 'date-fns';

interface Coupon {
    id: number;
    code: string;
    type: 'fixed' | 'percent';
    value: number;
    min_cart_value: number | null;
    expires_at: string | null;
    is_active: boolean;
}

export default function OffersPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'percent',
        value: '',
        min_cart_value: '',
        expires_at: '',
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get('/admin/coupons');
            setCoupons(response.data);
        } catch (error) {
            console.error('Failed to fetch coupons', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setFormData({
            code: coupon.code || '',
            type: coupon.type || 'percent',
            value: coupon.value !== undefined && coupon.value !== null ? coupon.value.toString() : '',
            min_cart_value: coupon.min_cart_value !== undefined && coupon.min_cart_value !== null ? coupon.min_cart_value.toString() : '',
            expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '', // Format for datetime-local
            is_active: coupon.is_active ?? true
        });
        setEditId(coupon.id);
        setIsEditing(true);
        setIsCreating(true); // Re-use the modal
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                value: parseFloat(formData.value),
                min_cart_value: formData.min_cart_value ? parseFloat(formData.min_cart_value) : null,
                expires_at: formData.expires_at || null,
            };

            if (isEditing && editId) {
                await axios.put(`/admin/coupons/${editId}`, payload);
            } else {
                await axios.post('/admin/coupons', payload);
            }

            closeModal();
            fetchCoupons();
        } catch (error: any) {
            console.error('Failed to save coupon', error);
            if (error.response && error.response.data) {
                const message = error.response.data.message || 'Validation failed';
                const errors = error.response.data.errors;
                if (errors) {
                    const errorMessages = Object.values(errors).flat().join('\n');
                    alert(`${message}\n\n${errorMessages}`);
                } else {
                    alert(`Failed to save coupon: ${message}`);
                }
            } else {
                alert('Failed to save coupon. Please try again.');
            }
        }
    };

    const closeModal = () => {
        setIsCreating(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
            code: '',
            type: 'percent',
            value: '',
            min_cart_value: '',
            expires_at: '',
            is_active: true
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await axios.delete(`/admin/coupons/${id}`);
            fetchCoupons();
        } catch (error) {
            console.error('Failed to delete coupon', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offers & Coupons</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage discount codes and promotions</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-cureza-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-800 transition"
                >
                    <Plus size={20} /> Create Coupon
                </button>
            </div>

            {/* Create/Edit Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cureza-green"
                                    placeholder="e.g. SUMMER25"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="percent">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="e.g. 10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Cart Value</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.min_cart_value}
                                        onChange={(e) => setFormData({ ...formData, min_cart_value: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires At</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded text-cureza-green focus:ring-cureza-green"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-800"
                                >
                                    {isEditing ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Min. Cart</th>
                                <th className="px-6 py-4">Expiry</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading coupons...</td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No coupons found. Create one to get started!</td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Tag size={16} className="text-cureza-green" />
                                                <span className="font-bold text-gray-900 dark:text-white">{coupon.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                                                {coupon.type === 'percent' ? <Percent size={14} /> : <IndianRupee size={14} />}
                                                <span>{coupon.value}{coupon.type === 'percent' ? '%' : ' INR'} OFF</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {coupon.min_cart_value ? `₹${coupon.min_cart_value}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {coupon.expires_at ? (
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {format(new Date(coupon.expires_at), 'MMM d, yyyy')}
                                                </div>
                                            ) : (
                                                <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">No Expiry</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition"
                                                    title="Edit Coupon"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
