'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AdminBadgesPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form States
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        icon: '🏅',
        rule_type: 'points_milestone',
        rule_value: 500,
        is_active: true
    });

    const loadData = () => {
        setLoading(true);
        api.get('/admin/badges')
            .then((res) => {
                setBadges(res.data || []);
            })
            .catch((err) => console.error("Error loading badges:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenCreate = () => {
        setEditingId(null);
        setForm({
            name: '',
            description: '',
            icon: '🏅',
            rule_type: 'points_milestone',
            rule_value: 500,
            is_active: true
        });
        setIsOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            description: item.description,
            icon: item.icon,
            rule_type: item.rule_type,
            rule_value: item.rule_value,
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

        setForm(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/admin/badges/${editingId}`, form);
                alert("Badge updated successfully!");
            } else {
                await api.post('/admin/badges', form);
                alert("Badge created successfully!");
            }
            setIsOpen(false);
            loadData();
        } catch (err) {
            console.error("Error saving badge:", err);
            alert("Failed to save badge.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this badge?")) return;
        try {
            await api.delete(`/admin/badges/${id}`);
            alert("Badge deleted successfully!");
            loadData();
        } catch (err) {
            console.error("Error deleting badge:", err);
            alert("Failed to delete badge.");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-9 w-32 bg-neutral-100 rounded-[10px]"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-48 bg-neutral-100 rounded-[10px]"></div>
                    <div className="h-48 bg-neutral-100 rounded-[10px]"></div>
                    <div className="h-48 bg-neutral-100 rounded-[10px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end items-center">
                <button
                    onClick={handleOpenCreate}
                    className="bg-black text-white px-3 py-1.5 rounded-[10px] text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
                >
                    <Plus size={14} />
                    <span>Create Badge</span>
                </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.length === 0 ? (
                    <div className="col-span-full bg-white p-8 text-center border-[0.5px] border-black/50 rounded-[10px] text-xs text-gray-500">
                        No badges configured yet. Click "Create Badge" to start!
                    </div>
                ) : (
                    badges.map((item) => (
                        <div key={item.id} className="bg-white rounded-[10px] border-[0.5px] border-black/50 p-5 space-y-3.5 relative flex flex-col justify-between">
                            <span className={`absolute top-4 right-4 text-[10px] font-medium px-2 py-0.5 rounded-[6px] border-[0.5px] ${
                                item.is_active 
                                    ? 'bg-green-50 text-green-800 border-black/50' 
                                    : 'bg-neutral-50 text-neutral-500 border-black/50'
                            }`}>
                                {item.is_active ? 'Active' : 'Draft'}
                            </span>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3.5">
                                    <div className="text-2xl w-11 h-11 bg-neutral-50 border-[0.5px] border-black/50 rounded-[10px] flex items-center justify-center">
                                        {item.icon || '🏅'}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-medium capitalize mt-0.5">
                                            Rule: {item.rule_type.replace(/_/g, ' ')} ({item.rule_value})
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 font-normal leading-relaxed min-h-[36px]">{item.description}</p>
                            </div>

                            <div className="flex gap-2 justify-end border-t-[0.5px] border-black/50 pt-3">
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
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 max-w-md w-full p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-semibold text-gray-900">{editingId ? 'Edit Badge' : 'Create Badge'}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-black text-base font-semibold transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1 col-span-2">
                                    <label className="block text-xs font-medium text-gray-700">Badge Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Streak Master"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={form.icon}
                                        onChange={handleInputChange}
                                        placeholder="🔥"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal text-center text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    placeholder="Explain how users can unlock this badge..."
                                    rows={3}
                                    className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Unlock Rule Trigger</label>
                                    <select
                                        name="rule_type"
                                        value={form.rule_type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                    >
                                        <option value="points_milestone">XP Points Milestone</option>
                                        <option value="challenges_completed">Challenges Completed</option>
                                        <option value="purchases_made">Orders Placed</option>
                                        <option value="referrals_made">Referrals Completed</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Threshold Value</label>
                                    <input
                                        type="number"
                                        name="rule_value"
                                        value={form.rule_value}
                                        onChange={handleInputChange}
                                        min="1"
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
                                        <><Save size={13} /> Save Badge</>
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
