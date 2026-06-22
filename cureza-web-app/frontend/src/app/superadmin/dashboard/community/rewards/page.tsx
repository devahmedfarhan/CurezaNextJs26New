'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, Save, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function AdminRewardsPage() {
    const [rewards, setRewards] = useState<any[]>([]);
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [redemptionsPage, setRedemptionsPage] = useState(1);
    const [redemptionsStatus, setRedemptionsStatus] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        points_cost: 1000,
        type: 'coupon',
        coupon_code: '',
        stock: -1,
        image_url: '',
        is_active: true
    });

    const loadCatalog = async () => {
        try {
            const res = await api.get('/admin/rewards');
            setRewards(res.data || []);
        } catch (err) {
            console.error("Error loading rewards catalog:", err);
        }
    };

    const loadRedemptions = async () => {
        try {
            const res = await api.get('/admin/rewards-redemptions', {
                params: { page: redemptionsPage, status: redemptionsStatus }
            });
            setRedemptions(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total
            });
        } catch (err) {
            console.error("Error loading redemptions:", err);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([loadCatalog(), loadRedemptions()]);
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
    }, [redemptionsPage, redemptionsStatus]);

    const handleOpenCreate = () => {
        setEditingId(null);
        setForm({
            name: '',
            description: '',
            points_cost: 1000,
            type: 'coupon',
            coupon_code: '',
            stock: -1,
            image_url: '',
            is_active: true
        });
        setIsOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            description: item.description,
            points_cost: item.points_cost,
            type: item.type,
            coupon_code: item.coupon_code || '',
            stock: item.stock,
            image_url: item.image_url || '',
            is_active: item.is_active
        });
        setIsOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;
        if (type === 'number') {
            finalValue = parseInt(value) || 0;
        } else if (name === 'is_active') {
            finalValue = value === 'true';
        }
        setForm(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/admin/rewards/${editingId}`, form);
                alert("Reward catalog item updated successfully!");
            } else {
                await api.post('/admin/rewards', form);
                alert("Reward catalog item created successfully!");
            }
            setIsOpen(false);
            loadCatalog();
        } catch (err) {
            console.error("Error saving reward item:", err);
            alert("Failed to save reward item.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this reward?")) return;
        try {
            await api.delete(`/admin/rewards/${id}`);
            alert("Reward item deleted successfully!");
            loadCatalog();
        } catch (err) {
            console.error("Error deleting reward item:", err);
            alert("Failed to delete reward item.");
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/admin/rewards-redemptions/${id}/status`, { status });
            alert(`Redemption marked as ${status}!`);
            loadRedemptions();
        } catch (err) {
            console.error("Error updating redemption status:", err);
            alert("Failed to update status.");
        }
    };

    if (loading && rewards.length === 0) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-64 bg-neutral-100 rounded-[10px]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Section 1: Rewards Catalog */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b-[0.5px] border-black/50 pb-3">
                    <h2 className="text-sm font-semibold text-gray-900">Reward Items Catalog</h2>
                    <button
                        onClick={handleOpenCreate}
                        className="bg-black text-white px-3 py-1.5 rounded-[10px] text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        <span>Add Reward Item</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.length === 0 ? (
                        <div className="col-span-full bg-white p-8 text-center border-[0.5px] border-black/50 rounded-[10px] text-xs text-gray-500">
                            No rewards configured. Click "Add Reward Item" to start.
                        </div>
                    ) : (
                        rewards.map((item) => (
                            <div key={item.id} className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden flex flex-col relative">
                                <span className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-[6px] border-[0.5px] border-black/50 bg-neutral-50 text-neutral-600 capitalize">
                                    {item.type}
                                </span>
                                <div className="bg-neutral-50 border-b-[0.5px] border-black/50 h-28 flex items-center justify-center text-neutral-400">
                                    <Gift size={36} />
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                                        <p className="text-xs text-gray-900 font-semibold mt-1">{item.points_cost.toLocaleString()} XP Points</p>
                                        <p className="text-xs text-gray-500 mt-2 font-normal leading-relaxed min-h-[36px]">{item.description}</p>
                                        <div className="text-[10px] text-gray-400 mt-3 space-y-1 font-normal">
                                            <p>Stock: {item.stock === -1 ? 'Unlimited' : `${item.stock} left`}</p>
                                            {item.coupon_code && <p className="truncate">Default Code: {item.coupon_code}</p>}
                                            <p>Status: {item.is_active ? 'Active' : 'Draft'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end border-t-[0.5px] border-black/50 pt-3 mt-4">
                                        <button
                                            onClick={() => handleOpenEdit(item)}
                                            className="px-2.5 py-1 border-[0.5px] border-black/50 text-gray-600 rounded-[10px] text-xs font-medium hover:bg-neutral-50 flex items-center gap-1 transition-colors"
                                        >
                                            <Edit2 size={12} />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-2.5 py-1 border-[0.5px] border-black/50 text-red-650 rounded-[10px] text-xs font-medium hover:bg-red-50/50 flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Section 2: User Redemptions */}
            <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b-[0.5px] border-black/50 pb-3">
                    <h2 className="text-sm font-semibold text-gray-900">User Redemptions Log</h2>
                    <select
                        value={redemptionsStatus}
                        onChange={(e) => { setRedemptionsStatus(e.target.value); setRedemptionsPage(1); }}
                        className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal self-end sm:self-center"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden">
                    {redemptions.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-500">No redemptions found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-neutral-50 border-b-[0.5px] border-black/50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Reward Item</th>
                                        <th className="p-3">Spent</th>
                                        <th className="p-3">Coupon/Shipping Address</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-[0.5px] divide-neutral-950/10">
                                    {redemptions.map((item) => {
                                        const date = new Date(item.created_at).toLocaleDateString();
                                        const user = item.user;
                                        const reward = item.reward;
                                        const isPending = item.status === 'pending';
                                        const isFulfilled = item.status === 'fulfilled';
                                        const isCancelled = item.status === 'cancelled';

                                        return (
                                            <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="p-3">
                                                    <p className="font-medium text-gray-900">{user?.name || 'Customer'}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{user?.email || ''}</p>
                                                    <span className="text-[10px] text-gray-450 block mt-0.5">Redeemed: {date}</span>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-medium text-gray-900">{reward?.name || 'Redeemed Item'}</p>
                                                    <span className="text-[10px] bg-neutral-50 border-[0.5px] border-black/50 text-neutral-600 px-2 py-0.5 rounded-[6px] font-medium capitalize mt-1 inline-block">{reward?.type}</span>
                                                </td>
                                                <td className="p-3 font-semibold text-red-650">-{item.points_spent} XP</td>
                                                <td className="p-3 max-w-xs">
                                                    {item.coupon_code && (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-gray-400 font-medium">Coupon:</span>
                                                            <code className="bg-neutral-50 px-2 py-0.5 border-[0.5px] border-black/50 rounded-[6px] text-xs font-mono text-gray-800 font-semibold select-all">
                                                                {item.coupon_code}
                                                            </code>
                                                        </div>
                                                    )}
                                                    {item.shipping_address && (
                                                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed font-normal">
                                                            <strong>Shipping Address:</strong> {item.shipping_address}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-[6px] border-[0.5px] capitalize ${
                                                        isFulfilled 
                                                            ? 'bg-green-50 text-green-800 border-black/50' 
                                                            : isCancelled
                                                                ? 'bg-red-50 text-red-800 border-black/50'
                                                                : 'bg-neutral-50 text-neutral-600 border-black/50'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right">
                                                    {isPending && reward?.type === 'physical' && (
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'fulfilled')}
                                                                className="px-2.5 py-1 bg-black text-white rounded-[10px] text-xs font-medium hover:bg-neutral-805 flex items-center gap-1 transition-colors"
                                                            >
                                                                <CheckCircle2 size={12} />
                                                                <span>Ship</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                                                                className="px-2.5 py-1 border-[0.5px] border-black/50 text-red-650 rounded-[10px] text-xs font-medium hover:bg-red-50/50 flex items-center gap-1 transition-colors"
                                                            >
                                                                <XCircle size={12} />
                                                                <span>Cancel</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between pt-4">
                        <p className="text-xs text-gray-400 font-normal">Total: {pagination.total} records</p>
                        <div className="flex gap-2">
                            <button
                                disabled={redemptionsPage <= 1}
                                onClick={() => setRedemptionsPage(redemptionsPage - 1)}
                                className="px-2.5 py-1 border-[0.5px] border-black/50 rounded-[10px] text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-medium self-center px-2 text-gray-600">Page {redemptionsPage} of {pagination.last_page}</span>
                            <button
                                disabled={redemptionsPage >= pagination.last_page}
                                onClick={() => setRedemptionsPage(redemptionsPage + 1)}
                                className="px-2.5 py-1 border-[0.5px] border-black/50 rounded-[10px] text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 max-w-md w-full p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-semibold text-gray-900">{editingId ? 'Edit Reward Item' : 'Add Reward Item'}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-black text-base font-semibold transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Reward Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., ₹500 Off Coupon"
                                    className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide details about the reward benefit..."
                                    rows={3}
                                    className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">XP Points Cost</label>
                                    <input
                                        type="number"
                                        name="points_cost"
                                        value={form.points_cost}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Reward Type</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                    >
                                        <option value="coupon">Discount Coupon</option>
                                        <option value="physical">Physical Gift Box</option>
                                        <option value="digital">Digital Download / eBook</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Default Coupon Code</label>
                                    <input
                                        type="text"
                                        name="coupon_code"
                                        value={form.coupon_code}
                                        onChange={handleInputChange}
                                        placeholder="e.g., REDEEM500 (Optional)"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Stock Count</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleInputChange}
                                        min="-1"
                                        placeholder="-1 for unlimited"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Active Status</label>
                                <select
                                    name="is_active"
                                    value={form.is_active ? 'true' : 'false'}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                >
                                    <option value="true">Active (Visible)</option>
                                    <option value="false">Draft (Hidden)</option>
                                </select>
                            </div>

                            <div className="flex gap-2.5 pt-3 border-t-[0.5px] border-black/50">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 border-[0.5px] border-black/50 text-gray-700 py-1.5 rounded-[10px] text-xs font-medium hover:bg-neutral-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-black text-white py-1.5 rounded-[10px] text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    {saving ? (
                                        <><Loader2 size={13} className="animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save size={13} /> Save Reward</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
