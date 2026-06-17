'use client';

import { useState, useEffect } from 'react';
import { Save, Users, Share2, Zap, Gift, HelpCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AdminCommunityPage() {
    const [stats, setStats] = useState<any>(null);
    const [rules, setRules] = useState<any>({
        xp_per_100_spent: 10,
        xp_per_review: 50,
        xp_per_photo_upload: 100,
        xp_per_referral: 1000
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const loadData = async () => {
        try {
            const [statsRes, rulesRes] = await Promise.all([
                api.get('/admin/community/stats'),
                api.get('/admin/community/settings')
            ]);
            setStats(statsRes.data);
            setRules(rulesRes.data);
        } catch (err) {
            console.error("Error loading admin community data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRules((prev: any) => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const handleSaveRules = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');
        try {
            const res = await api.post('/admin/community/settings', rules);
            setRules(res.data.rules);
            setSuccessMessage('Earning rules updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error("Error saving rules:", err);
            alert("Failed to save earning rules.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Cureza Circle & Gamification</h1>
                <p className="text-gray-500">Configure global XP rules, view participation statistics, and manage gamification assets.</p>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-[#052326] rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Members</p>
                        <h3 className="text-2xl font-bold text-gray-900">{(stats?.total_members || 0).toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <Share2 size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Referrals Program</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {stats?.completed_referrals || 0} <span className="text-xs font-medium text-gray-400">/ {stats?.total_referrals || 0}</span>
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">XP Minted</p>
                        <h3 className="text-2xl font-bold text-gray-900">{(stats?.total_xp_distributed || 0).toLocaleString()} XP</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                        <Gift size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Redemptions processed</p>
                        <h3 className="text-2xl font-bold text-gray-900">{(stats?.total_redemptions || 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* XP Earning Rules form */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <Zap size={24} className="text-yellow-600" />
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Earning Rules Configuration</h3>
                        <p className="text-xs text-gray-500">Determine how many points (XP) are awarded to users for performing actions.</p>
                    </div>
                </div>

                <form onSubmit={handleSaveRules} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">XP per ₹100 Spent</label>
                            <input
                                type="number"
                                name="xp_per_100_spent"
                                value={rules.xp_per_100_spent}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                required
                            />
                            <span className="text-[10px] text-gray-400 block font-medium">Points earned per ₹100 paid on orders.</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">XP for Product Review</label>
                            <input
                                type="number"
                                name="xp_per_review"
                                value={rules.xp_per_review}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                required
                            />
                            <span className="text-[10px] text-gray-400 block font-medium">Points awarded for writing a product review.</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">XP for Photo Upload</label>
                            <input
                                type="number"
                                name="xp_per_photo_upload"
                                value={rules.xp_per_photo_upload}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                required
                            />
                            <span className="text-[10px] text-gray-400 block font-medium">Points awarded for uploading photos in reviews.</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">XP for Referral Completion</label>
                            <input
                                type="number"
                                name="xp_per_referral"
                                value={rules.xp_per_referral}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                                required
                            />
                            <span className="text-[10px] text-gray-400 block font-medium">Points awarded to referrer when friend completes their 1st purchase.</span>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-semibold">
                            {successMessage}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#052326] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2"
                        >
                            {saving ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            ) : (
                                <><Save size={16} /> Save Configuration</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
