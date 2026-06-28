'use client';

import { useState, useEffect } from 'react';
import { Save, Users, Share2, Zap, Gift, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function AdminCommunityPage() {
    const [stats, setStats] = useState<any>(null);
    const [rules, setRules] = useState<any>({
        xp_product_purchase: 100,
        points_per_100_spent: 10,
        xp_write_review: 50,
        points_write_review: 20,
        xp_ugc_upload: 100,
        points_ugc_upload: 40,
        xp_refer_friend: 200,
        points_refer_friend: 100,
        xp_upload_prescription: 150,
        points_upload_prescription: 0,
        xp_join_event: 250,
        points_join_event: 50,
        xp_daily_checkin: 20,
        points_daily_checkin: 0,
        xp_instagram_review: 500,
        points_instagram_review: 250,
        xp_youtube_review: 1000,
        points_youtube_review: 500,
        referral_module_enabled: true,
        influencer_module_enabled: true,
        challenges_module_enabled: true
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
        const { name, value, type, checked } = e.target;
        setRules((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (parseInt(value) || 0)
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

    const activityGroups = [
        {
            title: "🛒 Product Purchase",
            desc: "Triggered automatically when order is updated to delivered.",
            fields: [
                { label: "Purchase XP (Flat)", name: "xp_product_purchase", desc: "XP earned per delivered order." },
                { label: "Points per ₹100 Spent", name: "points_per_100_spent", desc: "Redeemable points per ₹100 order value." }
            ]
        },
        {
            title: "✍️ Honest Product Review",
            desc: "Awarded when an admin approves/moderates a customer product review.",
            fields: [
                { label: "Review XP", name: "xp_write_review", desc: "XP for writing a product review." },
                { label: "Review Points", name: "points_write_review", desc: "Redeemable points for review." }
            ]
        },
        {
            title: "📸 UGC Photo & Video Upload",
            desc: "Extra points awarded if review contains approved photo/video uploads.",
            fields: [
                { label: "UGC Media XP", name: "xp_ugc_upload", desc: "Additional XP for media." },
                { label: "UGC Media Points", name: "points_ugc_upload", desc: "Additional points for media." }
            ]
        },
        {
            title: "🤝 Refer a Friend",
            desc: "Triggered on referral completion when referee completes first order.",
            fields: [
                { label: "Referrer XP", name: "xp_refer_friend", desc: "XP earned by the referrer." },
                { label: "Referrer Points", name: "points_refer_friend", desc: "Points earned by the referrer." }
            ]
        },
        {
            title: "📄 Upload Valid Prescription",
            desc: "Triggered when doctor approves a product prescription request.",
            fields: [
                { label: "Prescription XP", name: "xp_upload_prescription", desc: "XP earned on prescription approval." },
                { label: "Prescription Points", name: "points_upload_prescription", desc: "Points earned on prescription approval." }
            ]
        },
        {
            title: "🔥 Daily Check-in Streak",
            desc: "Triggered when user clicks 'Check-in' on dashboard.",
            fields: [
                { label: "Daily Check-in XP", name: "xp_daily_checkin", desc: "XP earned per check-in." },
                { label: "Daily Check-in Points", name: "points_daily_checkin", desc: "Points earned per check-in." }
            ]
        },
        {
            title: "📸 Instagram Influencer Review",
            desc: "Awarded when admin approves a review link posted on Instagram.",
            fields: [
                { label: "Instagram Review XP", name: "xp_instagram_review", desc: "XP for Instagram post." },
                { label: "Instagram Review Points", name: "points_instagram_review", desc: "Points for Instagram post." }
            ]
        },
        {
            title: "🎥 YouTube Influencer Review",
            desc: "Awarded when admin approves a review link posted on YouTube.",
            fields: [
                { label: "YouTube Review XP", name: "xp_youtube_review", desc: "XP for YouTube video." },
                { label: "YouTube Review Points", name: "points_youtube_review", desc: "Points for YouTube video." }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            {/* Statistics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/55 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[10px]">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Total Members</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{(stats?.total_members || 0).toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/55 flex items-center gap-4 shadow-sm">
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
                <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/55 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[10px]">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Total XP Minted</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{(stats?.total_xp_distributed || 0).toLocaleString()} XP</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/55 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[10px]">
                        <Gift size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">Redemptions Processed</p>
                        <h3 className="text-lg font-semibold text-gray-900 mt-0.5">{(stats?.total_redemptions || 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Earning Rules Form */}
            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-black/50 max-w-4xl shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-[0.5px] border-black/30">
                    <Zap size={18} className="text-black" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">Loyalty Program Configuration</h3>
                        <p className="text-xs text-gray-400 font-normal mt-0.5">Configure XP and Redeemable Points for all user engagement events.</p>
                    </div>
                </div>

                <form onSubmit={handleSaveRules} className="space-y-6">
                    {/* Circle Module Toggles */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4 hover:border-black/25 transition-all">
                        <div>
                            <h4 className="font-extrabold text-gray-900 text-sm">🔄 Circle Module Toggles</h4>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Enable or disable specific community modules for your customers.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-black/25 transition-all">
                                <input 
                                    type="checkbox"
                                    name="referral_module_enabled"
                                    checked={rules.referral_module_enabled !== false}
                                    onChange={handleChange as any}
                                    className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                                />
                                <div>
                                    <span className="block text-xs font-bold text-gray-800">Refer & Earn</span>
                                    <span className="block text-[9px] text-gray-400">Enable referrals module</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-black/25 transition-all">
                                <input 
                                    type="checkbox"
                                    name="influencer_module_enabled"
                                    checked={rules.influencer_module_enabled !== false}
                                    onChange={handleChange as any}
                                    className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                                />
                                <div>
                                    <span className="block text-xs font-bold text-gray-800">Influencer Reviews Hub</span>
                                    <span className="block text-[9px] text-gray-400">Enable social reviews submissions</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-black/25 transition-all">
                                <input 
                                    type="checkbox"
                                    name="challenges_module_enabled"
                                    checked={rules.challenges_module_enabled !== false}
                                    onChange={handleChange as any}
                                    className="w-4 h-4 rounded text-black border-gray-300 focus:ring-black"
                                />
                                <div>
                                    <span className="block text-xs font-bold text-gray-800">Challenges</span>
                                    <span className="block text-[9px] text-gray-400">Enable user quests/milestones</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activityGroups.map((group, groupIdx) => (
                            <div key={groupIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4 hover:border-black/25 transition-all">
                                <div>
                                    <h4 className="font-extrabold text-gray-900 text-sm">{group.title}</h4>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{group.desc}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {group.fields.map((field) => (
                                        <div key={field.name} className="space-y-1">
                                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider">{field.label}</label>
                                            <input
                                                type="number"
                                                name={field.name}
                                                value={rules[field.name] !== undefined ? rules[field.name] : 0}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 font-bold"
                                                required
                                            />
                                            <span className="text-[8px] text-gray-400 leading-normal block">{field.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {successMessage && (
                        <div className="p-3 bg-green-50 border-[0.5px] border-green-300 text-green-800 rounded-[10px] text-xs font-semibold">
                            {successMessage}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t-[0.5px] border-gray-200">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-black text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm"
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
