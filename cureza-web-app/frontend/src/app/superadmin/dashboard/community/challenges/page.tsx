'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Target, HelpCircle, Save, Loader2 } from 'lucide-react';
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
                    <h1 className="text-2xl font-bold text-gray-900">Challenges Manager</h1>
                    <p className="text-gray-500">Create and modify ongoing quests that reward users with points.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-[#052326] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> Create Challenge
                </button>
            </div>

            {/* list Grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {challenges.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No challenges configured yet. Click "Create Challenge" to start!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Title / Description</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Goal Goal Value</th>
                                    <th className="p-4">XP Reward</th>
                                    <th className="p-4">Duration</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {challenges.map((item) => {
                                    const start = new Date(item.start_date).toLocaleDateString();
                                    const end = new Date(item.end_date).toLocaleDateString();

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 max-w-xs">
                                                <p className="font-bold text-gray-900">{item.title}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                                            </td>
                                            <td className="p-4 capitalize text-gray-600 font-medium">{item.type}</td>
                                            <td className="p-4 font-bold text-gray-900">{item.goal_value.toLocaleString()}</td>
                                            <td className="p-4 font-bold text-yellow-600">+{item.reward_points} XP</td>
                                            <td className="p-4 text-xs text-gray-500">
                                                <span className="block">{start}</span>
                                                <span className="block text-gray-400">to {end}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${
                                                    item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {item.is_active ? 'Active' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                                                    >
                                                        <Trash2 size={16} />
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Challenge' : 'Create Challenge'}</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Challenge Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., The Wellness Warrior"
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
                                    placeholder="Explain how users can complete this quest..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Challenge Type</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                    >
                                        <option value="purchase">Purchases Count</option>
                                        <option value="referral">Referrals Count</option>
                                        <option value="steps">Steps Goal</option>
                                        <option value="social">Social Actions</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Goal Value Target</label>
                                    <input
                                        type="number"
                                        name="goal_value"
                                        value={form.goal_value}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Reward points (XP)</label>
                                    <input
                                        type="number"
                                        name="reward_points"
                                        value={form.reward_points}
                                        onChange={handleInputChange}
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    />
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={form.end_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                        required
                                    />
                                </div>
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
                                        <><Save size={16} /> Save Challenge</>
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
