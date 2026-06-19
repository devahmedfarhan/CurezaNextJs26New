'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { Plus, Trash2, Tag, Calendar, Percent, IndianRupee, Pencil, Search, Filter, X, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
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
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[10px] border-[0.35px] border-neutral-950/10">
                <div className="space-y-1.5">
                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Offers & Coupons</h1>
                    <p className="text-xs text-gray-500 font-normal">Manage coupon promo codes, fixed discounts, and purchase thresholds</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-black text-white px-4 py-2.5 rounded-[10px] font-medium flex items-center gap-2 hover:bg-neutral-900 transition text-xs"
                >
                    <Plus size={14} /> Create Coupon
                </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border-[0.35px] border-neutral-950/10 p-5 rounded-[10px] flex items-center gap-4">
                    <div className="p-3 bg-neutral-50 text-black border-[0.35px] border-neutral-950/10 rounded-[10px]">
                        <Tag className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 font-normal tracking-normal block">Total Coupons</span>
                        <span className="text-2xl font-semibold text-gray-900">{totalCount}</span>
                    </div>
                </div>
                <div className="bg-white border-[0.35px] border-neutral-950/10 p-5 rounded-[10px] flex items-center gap-4">
                    <div className="p-3 bg-neutral-50 text-black border-[0.35px] border-neutral-950/10 rounded-[10px]">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 font-normal tracking-normal block">Active Codes</span>
                        <span className="text-2xl font-semibold text-gray-900">{activeCount}</span>
                    </div>
                </div>
                <div className="bg-white border-[0.35px] border-neutral-950/10 p-5 rounded-[10px] flex items-center gap-4">
                    <div className="p-3 bg-neutral-50 text-black border-[0.35px] border-neutral-950/10 rounded-[10px]">
                        <Percent className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 font-normal tracking-normal block">Percent Discount</span>
                        <span className="text-2xl font-semibold text-gray-900">{percentCount}</span>
                    </div>
                </div>
                <div className="bg-white border-[0.35px] border-neutral-950/10 p-5 rounded-[10px] flex items-center gap-4">
                    <div className="p-3 bg-neutral-50 text-black border-[0.35px] border-neutral-950/10 rounded-[10px]">
                        <IndianRupee className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 font-normal tracking-normal block">Fixed Discount</span>
                        <span className="text-2xl font-semibold text-gray-900">{fixedCount}</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-5 rounded-[10px] border-[0.35px] border-neutral-950/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={14} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search coupon codes..."
                        className="pl-9 pr-4 py-2 w-full border-[0.35px] border-neutral-950/10 rounded-[10px] focus:border-black text-xs font-normal outline-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    <div className="flex items-center gap-2">
                        <Filter size={12} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">Filters:</span>
                    </div>

                    {/* Status filter */}
                    <select
                        className="border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-2 text-xs font-normal focus:outline-none focus:border-black bg-white"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>

                    {/* Type filter */}
                    <select
                        className="border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-2 text-xs font-normal focus:outline-none focus:border-black bg-white"
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
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[10px] p-6 w-full max-w-md border-[0.35px] border-neutral-950/10 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b-[0.35px] border-neutral-950/10 pb-3">
                            <h2 className="text-base font-semibold text-gray-900">
                                {isEditing ? 'Edit Coupon Promo' : 'Create New Coupon'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-neutral-50 rounded-lg">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border-[0.35px] border-neutral-950/10 rounded-[10px] px-3.5 py-2 bg-white text-gray-900 text-xs focus:border-black font-semibold uppercase tracking-wider outline-none"
                                    placeholder="e.g. SUMMER25"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Discount Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-2 bg-white text-gray-900 text-xs focus:border-black outline-none"
                                    >
                                        <option value="percent">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-2 text-xs focus:border-black outline-none"
                                        placeholder={formData.type === 'percent' ? 'e.g. 15' : 'e.g. 200'}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Min. Cart Value</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.min_cart_value}
                                        onChange={(e) => setFormData({ ...formData, min_cart_value: e.target.value })}
                                        className="w-full border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-2 text-xs focus:border-black outline-none"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1">Expires At</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-2 text-xs focus:border-black outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded text-black focus:ring-black h-4 w-4 border-neutral-950/20"
                                    style={{ borderRadius: '4px' }}
                                />
                                <label htmlFor="is_active" className="text-xs font-medium text-gray-700 cursor-pointer">Mark coupon active</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-3 border-t-[0.35px] border-neutral-950/10">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 hover:bg-neutral-50 border-[0.35px] border-neutral-950/10 rounded-[10px] text-xs font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded-[10px] hover:bg-neutral-900 text-xs font-medium"
                                >
                                    {isEditing ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white rounded-[10px] border-[0.35px] border-neutral-950/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-neutral-50/50 text-gray-500 font-medium tracking-normal text-xs border-b-[0.35px] border-neutral-950/10">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Discount Offer</th>
                                <th className="px-6 py-4">Min. Cart Value</th>
                                <th className="px-6 py-4">Expiry Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-[0.35px] divide-neutral-950/10">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-black"></div>
                                            <span className="text-[10px] font-medium">Loading coupons list...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-450">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-350" />
                                        <p className="font-semibold text-xs text-gray-500">No coupons matches the current filters.</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">Try clearing search parameters or make a new one.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCoupons.map((coupon) => {
                                    const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
                                    return (
                                        <tr key={coupon.id} className="hover:bg-neutral-50/40 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 bg-neutral-50 text-black rounded-[10px] border-[0.35px] border-neutral-950/10">
                                                        <Tag size={13} />
                                                    </div>
                                                    <span className="font-semibold text-gray-900 tracking-wider">{coupon.code}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-semibold text-gray-700">
                                                    {coupon.type === 'percent' ? (
                                                        <span className="flex items-center gap-1.5 text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-[10px] text-[10px] border-[0.35px] border-neutral-950/10">
                                                            <Percent size={10} /> {coupon.value}% OFF
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-neutral-700 bg-neutral-50 px-2.5 py-0.5 rounded-[10px] text-[10px] border-[0.35px] border-neutral-950/10">
                                                            <IndianRupee size={10} /> ₹{coupon.value} OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                {coupon.min_cart_value ? `₹${coupon.min_cart_value}` : (
                                                    <span className="text-gray-300 font-normal">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {coupon.expires_at ? (
                                                    <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isExpired ? 'text-rose-700 bg-rose-50 border-[0.35px] border-rose-500/10 px-2 py-0.5 rounded-[10px]' : 'text-gray-655'}`}>
                                                        <Calendar size={11} />
                                                        {format(new Date(coupon.expires_at), 'MMM d, yyyy h:mm a')}
                                                        {isExpired && <span className="text-[9px] font-semibold uppercase tracking-wider ml-1">Expired</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-[10px] font-medium border-[0.35px] border-neutral-950/10">No Expiry</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(coupon)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-[10px] font-medium transition-all border-[0.35px] ${
                                                        coupon.is_active 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-500/10 hover:bg-emerald-100/50' 
                                                            : 'bg-neutral-50 text-gray-550 border-neutral-950/10 hover:bg-neutral-100'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                                                    {coupon.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="text-gray-500 hover:text-black hover:bg-neutral-50 p-2 rounded-[10px] transition-colors border-[0.35px] border-transparent hover:border-neutral-950/10"
                                                        title="Edit Coupon"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id)}
                                                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-[10px] transition-colors border-[0.35px] border-transparent hover:border-rose-500/10"
                                                        title="Delete Coupon"
                                                    >
                                                        <Trash2 size={13} />
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

            {/* Tutorial / Guidelines Section */}
            <div className="bg-neutral-50 border-[0.35px] border-neutral-950/10 rounded-[10px] p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-black" />
                    <h3 className="text-sm font-semibold text-gray-900">How It Works & Guidelines | Offers & Coupons Setup</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600 leading-relaxed font-normal">
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">1. Coupon Creation (Naye Coupon Kaise Banayein)</h4>
                        <p>
                            Aap top right par "Create Coupon" button par click karke naya code configure kar sakte hain. Code hamesha automatic uppercase banega (jaise: FESTIVE20).
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">2. Discount Types & Values</h4>
                        <p>
                            Aap percentage discount select kar sakte hain (jaise 15% off) ya phir ek flat fixed amount discount (jaise ₹200 off). Min. Cart Value define karke aap check laga sakte hain ke customer ki cart me utni price ki items hon tabhi ye discount active ho.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">3. Expiry & Active Status</h4>
                        <p>
                            Expires At field se aap future date set kar sakte hain jiske baad coupon code expire ho jayega. "Mark coupon active" check karke aap isko checkout par use karne ke liye activate kar sakte hain. Active status ko table se direct toggle bhi kiya ja sakta hai.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
