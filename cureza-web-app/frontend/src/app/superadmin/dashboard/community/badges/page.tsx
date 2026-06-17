'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, Save, Loader2, Info } from 'lucide-react';
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
                    <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Badges & Achievements Manager</h1>
                    <p className="text-gray-500">Create achievements that users automatically unlock as they perform wellness activities.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-[#052326] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> Create Badge
                </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.length === 0 ? (
                    <div className="col-span-full bg-white p-8 text-center border rounded-xl text-gray-500">No badges configured yet. Click "Create Badge" to start!</div>
                ) : (
                    badges.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow relative">
                            <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded-full ${
                                item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {item.is_active ? 'Active' : 'Draft'}
                            </span>

                            <div className="flex items-center gap-4">
                                <div className="text-4xl p-3 bg-gray-50 border border-gray-100 rounded-xl">
                                    {item.icon || '🏅'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                    <p className="text-xs text-yellow-600 font-bold capitalize mt-0.5">
                                        Rule: {item.rule_type.replace(/_/g, ' ')} ({item.rule_value})
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 min-h-[40px]">{item.description}</p>

                            <div className="flex gap-2 justify-end border-t border-gray-100 pt-4">
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
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Badge' : 'Create Badge'}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="block text-sm font-bold text-gray-700">Badge Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Streak Master"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Badge Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={form.icon}
                                        onChange={handleInputChange}
                                        placeholder="🔥"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326] text-center text-lg"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    placeholder="Explain how users can unlock this badge..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Unlock Rule Trigger</label>
                                    <select
                                        name="rule_type"
                                        value={form.rule_type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                    >
                                        <option value="points_milestone">XP Points Milestone</option>
                                        <option value="challenges_completed">Challenges Completed</option>
                                        <option value="purchases_made">Orders Placed</option>
                                        <option value="referrals_made">Referrals Completed</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Threshold Value</label>
                                    <input
                                        type="number"
                                        name="rule_value"
                                        value={form.rule_value}
                                        onChange={handleInputChange}
                                        min="1"
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
                                        <><Save size={16} /> Save Badge</>
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
