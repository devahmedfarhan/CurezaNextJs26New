'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, Clipboard, Save, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function AdminRewardsPage() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'redemptions'>('catalog');
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

    const loadCatalog = () => {
        setLoading(true);
        api.get('/admin/rewards')
            .then((res) => setRewards(res.data || []))
            .catch((err) => console.error("Error loading rewards catalog:", err))
            .finally(() => setLoading(false));
    };

    const loadRedemptions = () => {
        setLoading(true);
        api.get('/admin/rewards-redemptions', {
            params: { page: redemptionsPage, status: redemptionsStatus }
        }).then((res) => {
            setRedemptions(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total
            });
        }).catch((err) => console.error("Error loading redemptions:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (activeTab === 'catalog') {
            loadCatalog();
        } else {
            loadRedemptions();
        }
    }, [activeTab, redemptionsPage, redemptionsStatus]);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rewards Shop Manager</h1>
                    <p className="text-gray-500">Configure catalog items and process user points redemptions.</p>
                </div>
                {activeTab === 'catalog' && (
                    <button
                        onClick={handleOpenCreate}
                        className="bg-[#052326] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 flex items-center gap-2 shadow-sm self-start sm:self-center"
                    >
                        <Plus size={18} /> Add Reward Item
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => { setActiveTab('catalog'); }}
                    className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
                        activeTab === 'catalog'
                            ? 'border-[#052326] text-[#052326]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Catalog Items
                </button>
                <button
                    onClick={() => { setActiveTab('redemptions'); setRedemptionsPage(1); }}
                    className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
                        activeTab === 'redemptions'
                            ? 'border-[#052326] text-[#052326]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    User Redemptions
                </button>
            </div>

            {/* Catalog tab */}
            {activeTab === 'catalog' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center p-8 text-gray-500 animate-pulse">Loading rewards shop catalog...</div>
                    ) : rewards.length === 0 ? (
                        <div className="col-span-full bg-white p-8 text-center border rounded-xl text-gray-500">No rewards configured. Click "Add Reward Item" to start.</div>
                    ) : (
                        rewards.map((item) => {
                            let typeColor = 'bg-[#052326]';
                            if (item.type === 'coupon') typeColor = 'bg-emerald-600';
                            if (item.type === 'physical') typeColor = 'bg-blue-600';
                            if (item.type === 'digital') typeColor = 'bg-purple-600';

                            return (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
                                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full text-white bg-white/25 uppercase`}>
                                        {item.type}
                                    </span>
                                    <div className={`${typeColor} h-32 flex items-center justify-center text-white`}>
                                        <Gift size={48} />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                        <p className="text-xs text-yellow-600 font-bold mt-1">{item.points_cost.toLocaleString()} XP Points</p>
                                        <p className="text-sm text-gray-500 mt-2 flex-1">{item.description}</p>
                                        <div className="text-xs text-gray-400 mt-4 space-y-1">
                                            <p>Stock: {item.stock === -1 ? 'Unlimited' : `${item.stock} left`}</p>
                                            {item.coupon_code && <p className="truncate">Default Code: {item.coupon_code}</p>}
                                            <p>Status: {item.is_active ? 'Active' : 'Draft'}</p>
                                        </div>
                                        <div className="flex gap-2 justify-end border-t border-gray-100 pt-4 mt-4">
                                            <button
                                                onClick={() => handleOpenEdit(item)}
                                                className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-1"
                                            >
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Redemptions tab */}
            {activeTab === 'redemptions' && (
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-end">
                        <select
                            value={redemptionsStatus}
                            onChange={(e) => { setRedemptionsStatus(e.target.value); setRedemptionsPage(1); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="fulfilled">Fulfilled</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500 animate-pulse">Loading redemptions log...</div>
                        ) : redemptions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No redemptions found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Reward Item</th>
                                            <th className="p-4">Spent</th>
                                            <th className="p-4">Coupon/Shipping Address</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {redemptions.map((item) => {
                                            const date = new Date(item.created_at).toLocaleDateString();
                                            const user = item.user;
                                            const reward = item.reward;

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-4">
                                                        <p className="font-bold text-gray-900">{user?.name || 'Customer'}</p>
                                                        <p className="text-xs text-gray-400">{user?.email || ''}</p>
                                                        <span className="text-[10px] text-gray-400 block mt-0.5">Redeemed: {date}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-bold text-gray-900">{reward?.name || 'Redeemed Item'}</p>
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium capitalize">{reward?.type}</span>
                                                    </td>
                                                    <td className="p-4 font-bold text-yellow-600">-{item.points_spent} XP</td>
                                                    <td className="p-4 max-w-xs">
                                                        {item.coupon_code && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs text-gray-400 font-medium">Coupon:</span>
                                                                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-800 border border-gray-200 select-all">
                                                                    {item.coupon_code}
                                                                </code>
                                                            </div>
                                                        )}
                                                        {item.shipping_address && (
                                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                                <strong>Shipping Address:</strong> {item.shipping_address}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                                            item.status === 'fulfilled' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : item.status === 'cancelled'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {item.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {item.status === 'pending' && reward?.type === 'physical' && (
                                                            <div className="flex gap-2 justify-end">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(item.id, 'fulfilled')}
                                                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center gap-1 shadow-sm"
                                                                >
                                                                    <CheckCircle2 size={12} /> Ship
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                                                                    className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 flex items-center gap-1"
                                                                >
                                                                    <XCircle size={12} /> Cancel
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
                            <p className="text-xs text-gray-500 font-medium">Total: {pagination.total} records</p>
                            <div className="flex gap-2">
                                <button
                                    disabled={redemptionsPage <= 1}
                                    onClick={() => setRedemptionsPage(redemptionsPage - 1)}
                                    className="px-3 py-1 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-bold self-center px-2">Page {redemptionsPage} of {pagination.last_page}</span>
                                <button
                                    disabled={redemptionsPage >= pagination.last_page}
                                    onClick={() => setRedemptionsPage(redemptionsPage + 1)}
                                    className="px-3 py-1 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Reward Item' : 'Add Reward Item'}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Reward Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., ₹500 Off Coupon"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide details about the reward benefit..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">XP points Cost</label>
                                    <input
                                        type="number"
                                        name="points_cost"
                                        value={form.points_cost}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Reward Type</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                    >
                                        <option value="coupon">Discount Coupon</option>
                                        <option value="physical">Physical Gift Box</option>
                                        <option value="digital">Digital Download / eBook</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Default Coupon Code</label>
                                    <input
                                        type="text"
                                        name="coupon_code"
                                        value={form.coupon_code}
                                        onChange={handleInputChange}
                                        placeholder="e.g., REDEEM500 (Optional)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Stock Count</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleInputChange}
                                        min="-1"
                                        placeholder="-1 for unlimited"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Active Status</label>
                                <select
                                    name="is_active"
                                    value={form.is_active ? 'true' : 'false'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                >
                                    <option value="true">Active (Visible)</option>
                                    <option value="false">Draft (Hidden)</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-[#052326] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save size={16} /> Save Reward</>
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
