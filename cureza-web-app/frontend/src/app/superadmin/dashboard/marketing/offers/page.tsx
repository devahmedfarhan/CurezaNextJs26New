'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { Plus, Trash2, Tag, Calendar, Percent, IndianRupee, Pencil, Search, Filter, X, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/contexts/ToastContext';

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
    const { showToast } = useToast();

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'percent' | 'fixed'>('all');

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
            setIsLoading(true);
            const response = await axios.get('/admin/coupons');
            if (Array.isArray(response.data)) {
                setCoupons(response.data);
            } else {
                setCoupons([]);
            }
        } catch (error) {
            console.error('Failed to fetch coupons', error);
            showToast('Failed to load coupons', 'error');
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

    const handleToggleActive = async (coupon: Coupon) => {
        try {
            const updatedActive = !coupon.is_active;
            await axios.put(`/admin/coupons/${coupon.id}`, {
                ...coupon,
                is_active: updatedActive
            });
            showToast(`Coupon status updated!`, 'success');
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: updatedActive } : c));
        } catch (err) {
            console.error(err);
            showToast('Failed to update status', 'error');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                code: formData.code.toUpperCase().trim(),
                type: formData.type,
                value: parseFloat(formData.value),
                min_cart_value: formData.min_cart_value ? parseFloat(formData.min_cart_value) : null,
                expires_at: formData.expires_at || null,
                is_active: formData.is_active
            };

            if (isEditing && editId) {
                await axios.put(`/admin/coupons/${editId}`, payload);
                showToast("Coupon updated successfully!", "success");
            } else {
                await axios.post('/admin/coupons', payload);
                showToast("Coupon created successfully!", "success");
            }

            closeModal();
            fetchCoupons();
        } catch (error: any) {
            console.error('Failed to save coupon', error);
            if (error.response && error.response.data) {
                const message = error.response.data.message || 'Validation failed';
                showToast(message, 'error');
            } else {
                showToast('Failed to save coupon. Please try again.', 'error');
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
            showToast("Coupon deleted successfully", "success");
            fetchCoupons();
        } catch (error) {
            console.error('Failed to delete coupon', error);
            showToast("Failed to delete coupon", "error");
        }
    };

    // Filter coupons logic
    const filteredCoupons = coupons.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' 
            ? true 
            : statusFilter === 'active' 
                ? c.is_active 
                : !c.is_active;

        const matchesType = typeFilter === 'all'
            ? true
            : c.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    // Simple metrics computation
    const totalCount = coupons.length;
    const activeCount = coupons.filter(c => c.is_active).length;
    const percentCount = coupons.filter(c => c.type === 'percent').length;
    const fixedCount = coupons.filter(c => c.type === 'fixed').length;

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Offers & Coupons</h1>
                    <p className="text-gray-500 mt-1">Manage coupon promo codes, fixed discounts, and purchase thresholds</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-cureza-green text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition shadow-sm"
                >
                    <Plus size={18} /> Create Coupon
                </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-green-50 text-cureza-green rounded-xl">
                        <Tag className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Coupons</span>
                        <span className="text-2xl font-extrabold text-gray-900">{totalCount}</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Active Codes</span>
                        <span className="text-2xl font-extrabold text-gray-900">{activeCount}</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Percent className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Percent Discount</span>
                        <span className="text-2xl font-extrabold text-gray-900">{percentCount}</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-violet-50 text-violet-600 rounded-xl">
                        <IndianRupee className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Fixed Discount</span>
                        <span className="text-2xl font-extrabold text-gray-900">{fixedCount}</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search coupon codes..."
                        className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500">Filters:</span>
                    </div>

                    {/* Status filter */}
                    <select
                        className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cureza-green/20 bg-white"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active only</option>
                        <option value="inactive">Inactive only</option>
                    </select>

                    {/* Type filter */}
                    <select
                        className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cureza-green/20 bg-white"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as any)}
                    >
                        <option value="all">All Types</option>
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Flat</option>
                    </select>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h2 className="text-xl font-extrabold text-gray-900">
                                {isEditing ? 'Edit Coupon Promo' : 'Create New Coupon'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green font-bold uppercase tracking-wider"
                                    placeholder="e.g. SUMMER25"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Discount Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                    >
                                        <option value="percent">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                        placeholder={formData.type === 'percent' ? 'e.g. 15' : 'e.g. 200'}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Min. Cart Value</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.min_cart_value}
                                        onChange={(e) => setFormData({ ...formData, min_cart_value: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Expires At</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-cureza-green/20 focus:border-cureza-green"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded text-cureza-green focus:ring-cureza-green h-4 w-4 border-gray-300"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer">Mark coupon active</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-cureza-green text-white rounded-xl hover:bg-green-700 text-sm font-bold shadow-sm"
                                >
                                    {isEditing ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4.5">Code</th>
                                <th className="px-6 py-4.5">Discount Offer</th>
                                <th className="px-6 py-4.5">Min. Cart Value</th>
                                <th className="px-6 py-4.5">Expiry Date</th>
                                <th className="px-6 py-4.5">Status</th>
                                <th className="px-6 py-4.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-cureza-green"></div>
                                            <span className="text-xs font-semibold">Loading coupons list...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <AlertCircle className="h-9 w-9 mx-auto mb-2 text-gray-300" />
                                        <p className="font-bold text-sm text-gray-500">No coupons matches the current filters.</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Try clearing search parameters or make a new one.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCoupons.map((coupon) => {
                                    const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
                                    return (
                                        <tr key={coupon.id} className="hover:bg-gray-50/40 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 bg-green-50 text-cureza-green rounded-lg border border-green-100">
                                                        <Tag size={15} />
                                                    </div>
                                                    <span className="font-extrabold text-gray-900 tracking-wider">{coupon.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-bold text-gray-700">
                                                    {coupon.type === 'percent' ? (
                                                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                                                            <Percent size={12} /> {coupon.value}% OFF
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">
                                                            <IndianRupee size={12} /> ₹{coupon.value} OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-semibold">
                                                {coupon.min_cart_value ? `₹${coupon.min_cart_value}` : (
                                                    <span className="text-gray-300 font-normal">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {coupon.expires_at ? (
                                                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>
                                                        <Calendar size={13} />
                                                        {format(new Date(coupon.expires_at), 'MMM d, yyyy h:mm a')}
                                                        {isExpired && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.2 rounded-md">Expired</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold border border-green-100">No Expiry</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(coupon)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                                        coupon.is_active 
                                                            ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' 
                                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${coupon.is_active ? 'bg-green-600' : 'bg-gray-400'}`} />
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-xl transition-colors"
                                                        title="Edit Coupon"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-colors"
                                                        title="Delete Coupon"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
