'use client';

import { useState, useEffect } from 'react';
import { Share2, Users, Gift, Copy, Check } from 'lucide-react';
import api from '@/lib/api';

interface Referral {
    id: number;
    referred_user: {
        name: string;
        created_at: string;
    };
    reward_points: number;
    status: string;
}

export default function ReferralsPage() {
    const [referralCode, setReferralCode] = useState('');
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [totalEarned, setTotalEarned] = useState(0);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/referrals')
            .then((res) => {
                setReferralCode(res.data.referral_code);
                setReferrals(res.data.referrals);
                setTotalEarned(res.data.total_earned);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const copyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div>Loading referrals...</div>;

    return (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-charcoal dark:text-gray-100 mb-4">Refer & Earn</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Invite your friends to Cureza. They get <span className="font-bold text-green-600">10% off</span> their first order,
                    and you get <span className="font-bold text-yellow-500">500 Points</span> for each successful referral!
                </p>
            </div>

            {/* Code Box */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg text-center max-w-md mx-auto">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-4">Your Unique Referral Code</p>
                <div className="flex items-center justify-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <span className="text-2xl font-mono font-bold text-charcoal dark:text-white tracking-widest">{referralCode}</span>
                    <button
                        onClick={copyCode}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy Code"
                    >
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-gray-500" />}
                    </button>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                    <button className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                        <Share2 size={16} /> WhatsApp
                    </button>
                    <button className="flex items-center gap-2 bg-[#1DA1F2] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                        <Share2 size={16} /> Twitter
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 text-blue-600 rounded-full flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Friends Invited</p>
                        <p className="text-2xl font-bold text-charcoal dark:text-white">{referrals.length}</p>
                    </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 text-yellow-600 rounded-full flex items-center justify-center">
                        <Gift size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Points Earned</p>
                        <p className="text-2xl font-bold text-charcoal dark:text-white">{totalEarned}</p>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Referral History</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {referrals.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No referrals yet. Start inviting!</div>
                    ) : (
                        referrals.map((ref) => (
                            <div key={ref.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                        {ref.referred_user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{ref.referred_user.name}</p>
                                        <p className="text-xs text-gray-500">Joined {new Date(ref.referred_user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${ref.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {ref.status}
                                    </span>
                                    {ref.status === 'completed' && (
                                        <span className="text-sm font-bold text-yellow-500">+{ref.reward_points} pts</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
