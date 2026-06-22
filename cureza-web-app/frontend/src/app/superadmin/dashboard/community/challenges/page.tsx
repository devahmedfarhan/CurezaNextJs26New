'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AdminChallengesPage() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form States
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        type: 'purchase',
        goal_value: 1,
        reward_points: 100,
        start_date: '',
        end_date: '',
        is_active: true
    });

    const loadData = () => {
        setLoading(true);
        api.get('/admin/challenges')
            .then((res) => {
                setChallenges(res.data || []);
            })
            .catch((err) => console.error("Error loading challenges:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenCreate = () => {
        setEditingId(null);
        setForm({
            title: '',
            description: '',
            type: 'purchase',
            goal_value: 1,
            reward_points: 100,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            is_active: true
        });
        setIsOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingId(item.id);
        setForm({
            title: item.title,
            description: item.description,
            type: item.type,
            goal_value: item.goal_value,
            reward_points: item.reward_points,
            start_date: item.start_date.split(' ')[0],
            end_date: item.end_date.split(' ')[0],
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
                await api.put(`/admin/challenges/${editingId}`, form);
                alert("Challenge updated successfully!");
            } else {
                await api.post('/admin/challenges', form);
                alert("Challenge created successfully!");
            }
            setIsOpen(false);
            loadData();
        } catch (err) {
            console.error("Error saving challenge:", err);
            alert("Failed to save challenge.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this challenge?")) return;
        try {
            await api.delete(`/admin/challenges/${id}`);
            alert("Challenge deleted successfully!");
            loadData();
        } catch (err) {
            console.error("Error deleting challenge:", err);
            alert("Failed to delete challenge.");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-9 w-32 bg-neutral-100 rounded-[10px]"></div>
                </div>
                <div className="h-64 bg-neutral-100 rounded-[10px]"></div>
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
                    <span>Create Challenge</span>
                </button>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden">
                {challenges.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">No challenges configured yet. Click "Create Challenge" to start!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 border-b-[0.5px] border-black/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">Title / Description</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Goal Value Target</th>
                                    <th className="p-3">XP Reward</th>
                                    <th className="p-3">Duration</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-[0.5px] divide-neutral-950/10">
                                {challenges.map((item) => {
                                    const start = new Date(item.start_date).toLocaleDateString();
                                    const end = new Date(item.end_date).toLocaleDateString();

                                    return (
                                        <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="p-3 max-w-xs">
                                                <p className="font-medium text-gray-900">{item.title}</p>
                                                <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.description}</p>
                                            </td>
                                            <td className="p-3 capitalize text-gray-650 font-normal">{item.type}</td>
                                            <td className="p-3 font-semibold text-gray-900">{item.goal_value.toLocaleString()}</td>
                                            <td className="p-3 font-semibold text-gray-900">+{item.reward_points} XP</td>
                                            <td className="p-3 text-[10px] text-gray-400">
                                                <span className="block">{start}</span>
                                                <span className="block text-gray-400 mt-0.5">to {end}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-[6px] border-[0.5px] ${
                                                    item.is_active 
                                                        ? 'bg-green-50 text-green-800 border-black/50' 
                                                        : 'bg-neutral-50 text-neutral-500 border-black/50'
                                                }`}>
                                                    {item.is_active ? 'Active' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex gap-1.5 justify-end">
                                                    <button
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="p-1 text-gray-500 hover:text-black hover:bg-neutral-50 rounded-[6px] border-[0.5px] border-transparent hover:border-neutral-950/10 transition-colors"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1 text-gray-500 hover:text-red-650 hover:bg-neutral-50 rounded-[6px] border-[0.5px] border-transparent hover:border-neutral-950/10 transition-colors"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 max-w-md w-full p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-semibold text-gray-900">{editingId ? 'Edit Challenge' : 'Create Challenge'}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-black text-base font-semibold transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-gray-700">Challenge Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Wellness Warrior"
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
                                    placeholder="Explain how users can complete this quest..."
                                    rows={3}
                                    className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Challenge Type</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                    >
                                        <option value="purchase">Purchases Count</option>
                                        <option value="referral">Referrals Count</option>
                                        <option value="steps">Steps Goal</option>
                                        <option value="social">Social Actions</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Goal Value Target</label>
                                    <input
                                        type="number"
                                        name="goal_value"
                                        value={form.goal_value}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Reward points (XP)</label>
                                    <input
                                        type="number"
                                        name="reward_points"
                                        value={form.reward_points}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                        required
                                    />
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
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={form.end_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white font-normal"
                                        required
                                    />
                                </div>
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
                                        <><Save size={13} /> Save Challenge</>
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
