'use client';

import { useState, useEffect } from 'react';
import { Save, Users, Share2, Zap, Gift, Loader2 } from 'lucide-react';
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="h-20 bg-neutral-100 rounded-[10px]"></div>
                    <div className="h-20 bg-neutral-100 rounded-[10px]"></div>
                    <div className="h-20 bg-neutral-100 rounded-[10px]"></div>
                    <div className="h-20 bg-neutral-100 rounded-[10px]"></div>
                </div>
                <div className="h-64 bg-neutral-100 rounded-[10px]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 flex items-center gap-4">
                    <div className="p-3 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[10px]">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Total Members</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{(stats?.total_members || 0).toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 flex items-center gap-4">
                    <div className="p-3 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[10px]">
                        <Share2 size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Referrals Program</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-0.5">
                          {stats?.completed_referrals || 0} <span className="text-xs font-normal text-gray-400">/ {stats?.total_referrals || 0}</span>
                        </h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 flex items-center gap-4">
                    <div className="p-3 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[10px]">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">XP Minted</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{(stats?.total_xp_distributed || 0).toLocaleString()} XP</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 flex items-center gap-4">
                    <div className="p-3 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[10px]">
                        <Gift size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Redemptions Processed</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{(stats?.total_redemptions || 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* XP Earning Rules Form */}
            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 max-w-3xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-[0.5px] border-black/50">
                    <Zap size={18} className="text-black" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Earning Rules Configuration</h3>
                        <p className="text-xs text-gray-400 font-normal mt-0.5">Determine how many points (XP) are awarded to users for performing actions.</p>
                    </div>
                </div>

                <form onSubmit={handleSaveRules} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700">XP per ₹100 Spent</label>
                            <input
                                type="number"
                                name="xp_per_100_spent"
                                value={rules.xp_per_100_spent}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 font-normal"
                                required
                            />
                            <span className="text-[10px] text-gray-400 block font-normal">Points earned per ₹100 paid on orders.</span>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700">XP for Product Review</label>
                            <input
                                type="number"
                                name="xp_per_review"
                                value={rules.xp_per_review}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 font-normal"
                                required
                            />
                            <span className="text-[10px] text-gray-400 block font-normal">Points awarded for writing a product review.</span>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700">XP for Photo Upload</label>
                            <input
                                type="number"
                                name="xp_per_photo_upload"
                                value={rules.xp_per_photo_upload}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 font-normal"
                                required
                            />
                            <span className="text-[10px] text-gray-400 block font-normal">Points awarded for uploading photos in reviews.</span>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-700">XP for Referral Completion</label>
                            <input
                                type="number"
                                name="xp_per_referral"
                                value={rules.xp_per_referral}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 font-normal"
                                required
                            />
                            <span className="text-[10px] text-gray-400 block font-normal">Points awarded to referrer when friend completes their first purchase.</span>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="p-3 bg-green-50 border-[0.5px] border-black/50 text-green-800 rounded-[10px] text-xs font-medium">
                            {successMessage}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t-[0.5px] border-black/50">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-black text-white px-4 py-2 rounded-[10px] text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2"
                        >
                            {saving ? (
                                <><Loader2 size={14} className="animate-spin" /> Saving...</>
                            ) : (
                                <><Save size={14} /> Save Configuration</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
