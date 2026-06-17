'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Users, Gift, Target } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CircleHomePage() {
    const [communityData, setCommunityData] = useState<any>(null);
    const [walletData, setWalletData] = useState<any>(null);
    const [leaderboardData, setLeaderboardData] = useState<any>(null);
    const [referralsData, setReferralsData] = useState<any>(null);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [comm, wallet, lead, refs, chals] = await Promise.allSettled([
                    api.get('/user/community'),
                    api.get('/user/wallet'),
                    api.get('/user/leaderboard'),
                    api.get('/user/referrals'),
                    api.get('/user/challenges'),
                ]);
                
                if (comm.status === 'fulfilled') setCommunityData(comm.value.data);
                if (wallet.status === 'fulfilled') setWalletData(wallet.value.data);
                if (lead.status === 'fulfilled') setLeaderboardData(lead.value.data);
                if (refs.status === 'fulfilled') setReferralsData(refs.value.data);
                if (chals.status === 'fulfilled') setChallenges(chals.value.data);
            } catch (err) {
                console.error("Error fetching circle data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    const currentTierName = communityData?.current_tier?.name || 'Silver';
    const nextTierName = communityData?.next_tier?.name || 'Gold';
    const points = communityData?.points || 0;
    const pointsNeeded = communityData?.points_needed || 0;
    
    // Calculate progress bar percentage
    const minPointsCurrent = communityData?.current_tier?.min_points || 0;
    const minPointsNext = communityData?.next_tier?.min_points || 1000;
    const progressRange = minPointsNext - minPointsCurrent;
    const progressCurrent = points - minPointsCurrent;
    const progressPercent = progressRange > 0 ? Math.min(Math.max((progressCurrent / progressRange) * 100, 0), 100) : 100;

    // Challenge counts
    const activeChallengeCount = challenges.filter(c => c.status === 'in_progress').length;
    const completedChallengeCount = challenges.filter(c => c.status === 'completed' || c.status === 'claimed').length;

    // Referral counts
    const totalReferrals = referralsData?.referrals?.length || 0;
    const completedReferrals = referralsData?.referrals?.filter((r: any) => r.status === 'completed').length || 0;

    // User Leaderboard rank
    const userRank = leaderboardData?.user_rank || '-';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cureza Circle</h1>
                    <p className="text-gray-500">Your wellness journey rewards and community</p>
                </div>
                <Link href="/dashboard/circle/rewards" className="bg-[#052326] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
                    <Gift size={18} />
                    Redeem Points
                </Link>
            </div>

            {/* Hero Card */}
            <div className="bg-gradient-to-r from-gray-900 to-[#052326] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Trophy size={40} className="text-white" />
                        </div>
                        <div>
                            <p className="text-gray-400 font-medium mb-1">Current Tier</p>
                            <h2 className="text-3xl font-bold mb-2">{currentTierName} Member</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Star size={14} className="text-yellow-400" fill="currentColor" />
                                <span>Dynamic Tier System</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-gray-400 font-medium mb-1">Available XP</p>
                        <h2 className="text-4xl font-bold text-yellow-400 mb-2">{points.toLocaleString()}</h2>
                        {pointsNeeded > 0 ? (
                            <p className="text-sm text-gray-300">{pointsNeeded} XP to {nextTierName} Tier</p>
                        ) : (
                            <p className="text-sm text-yellow-300">Ultimate Platinum Rank Unlocked!</p>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {pointsNeeded > 0 && (
                    <div className="mt-8 relative pt-6">
                        <div className="flex justify-between text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                            <span>{currentTierName}</span>
                            <span>{nextTierName}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Challenges</p>
                            <h3 className="font-bold text-gray-900">
                                {completedChallengeCount} Completed
                            </h3>
                        </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">{activeChallengeCount} ongoing challenges</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Referrals</p>
                            <h3 className="font-bold text-gray-900">{completedReferrals} / {totalReferrals} Friends</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2 font-medium">Referred friends completed orders</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Global Rank</p>
                            <h3 className="font-bold text-gray-900">#{userRank}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-2 font-medium">Ranked by global XP balance</p>
                </div>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { name: 'Activity Log', href: '/dashboard/circle/activity', icon: '📜' },
                    { name: 'Refer & Earn', href: '/dashboard/circle/referrals', icon: '🤝' },
                    { name: 'Leaderboard', href: '/dashboard/circle/leaderboard', icon: '🏆' },
                    { name: 'Badges', href: '/dashboard/circle/badges', icon: '🎖️' },
                ].map((item) => (
                    <Link key={item.name} href={item.href} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#052326] hover:shadow-md transition-all text-center group">
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
