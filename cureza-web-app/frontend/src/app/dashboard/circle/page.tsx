'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Users, Gift, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CircleHomePage() {
    const [communityData, setCommunityData] = useState<any>(null);
    const [walletData, setWalletData] = useState<any>(null);
    const [referralsData, setReferralsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Check-in and event states
    const [checkinStreakState, setCheckinStreakState] = useState<number>(0);
    const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
    const [eventCode, setEventCode] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [claimingEvent, setClaimingEvent] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);

    const fetchAll = async () => {
        try {
            const [comm, wallet, refs] = await Promise.allSettled([
                api.get('/user/community'),
                api.get('/user/wallet'),
                api.get('/user/referrals'),
            ]);
            
            if (comm.status === 'fulfilled') {
                setCommunityData(comm.value.data);
                setCheckinStreakState(comm.value.data.checkin_streak || 0);
                if (comm.value.data.last_checkin_at) {
                    const lastCheckin = new Date(comm.value.data.last_checkin_at);
                    const today = new Date();
                    const isToday = lastCheckin.getDate() === today.getDate() &&
                                    lastCheckin.getMonth() === today.getMonth() &&
                                    lastCheckin.getFullYear() === today.getFullYear();
                    setHasCheckedInToday(isToday);
                } else {
                    setHasCheckedInToday(false);
                }
            }
            if (wallet.status === 'fulfilled') setWalletData(wallet.value.data);
            if (refs.status === 'fulfilled') setReferralsData(refs.value.data);
        } catch (err) {
            console.error("Error fetching circle data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            const res = await api.post('/user/daily-checkin');
            setHasCheckedInToday(true);
            setCheckinStreakState(res.data.streak);
            // Refresh to update point balances
            const commRes = await api.get('/user/community');
            setCommunityData(commRes.data);
            alert(res.data.message || "Checked in successfully!");
        } catch (err: any) {
            console.error("Check-in error:", err);
            alert(err.response?.data?.message || "Failed to check in.");
        } finally {
            setCheckingIn(false);
        }
    };

    const handleClaimEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventCode.trim() || !eventTitle.trim()) {
            alert("Please enter both Event Code and Event Title.");
            return;
        }
        setClaimingEvent(true);
        try {
            const res = await api.post('/user/claim-event-points', {
                event_code: eventCode,
                event_title: eventTitle
            });
            // Refresh community data to update points and XP
            const commRes = await api.get('/user/community');
            setCommunityData(commRes.data);
            setEventCode('');
            setEventTitle('');
            alert(res.data.message || "Event points claimed successfully!");
        } catch (err: any) {
            console.error("Claim event error:", err);
            alert(err.response?.data?.message || "Failed to claim event points.");
        } finally {
            setClaimingEvent(false);
        }
    };

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
            </div>
        );
    }

    const currentTierName = communityData?.current_tier?.name || 'Silver';
    const nextTierName = communityData?.next_tier?.name || 'Gold';
    const points = communityData?.points || 0; // redeemable points
    const xp = communityData?.xp || 0;         // lifetime experience points
    const pointsNeeded = communityData?.points_needed || 0;
    
    // Calculate progress bar percentage
    const minPointsCurrent = communityData?.current_tier?.min_points || 0;
    const minPointsNext = communityData?.next_tier?.min_points || 1000;
    const progressRange = minPointsNext - minPointsCurrent;
    const progressCurrent = xp - minPointsCurrent;
    const progressPercent = progressRange > 0 ? Math.min(Math.max((progressCurrent / progressRange) * 100, 0), 100) : 100;

    // Referral counts
    const totalReferrals = referralsData?.referrals?.length || 0;
    const completedReferrals = referralsData?.referrals?.filter((r: any) => r.status === 'completed').length || 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cureza Circle</h1>
                    <p className="text-gray-500 text-sm">Your wellness journey rewards, lifetime XP status, and check-ins</p>
                </div>
                <Link href="/dashboard/circle/rewards" className="bg-[#052326] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#052326]/90 transition-all font-semibold shadow-sm text-sm">
                    <Gift size={16} />
                    Rewards Store
                </Link>
            </div>

            {/* Hero Card */}
            <div className="bg-gradient-to-r from-gray-900 via-[#06282b] to-[#0a3a3e] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Trophy size={36} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white/60 font-bold text-xs uppercase tracking-wider mb-0.5">Current Status</p>
                            <h2 className="text-2xl font-black mb-1.5">{currentTierName} Tier Member</h2>
                            <div className="flex items-center gap-2 text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full border border-white/5 w-fit">
                                <Star size={12} className="text-yellow-400" fill="currentColor" />
                                <span>Lifetime Tier System</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-center md:text-right">
                        <div>
                            <p className="text-white/60 font-bold text-xs uppercase tracking-wider mb-0.5">Redeemable Points</p>
                            <h2 className="text-3xl font-black text-[#F0C417]">{points.toLocaleString()} <span className="text-xs font-normal text-white/50">pts</span></h2>
                            <p className="text-[10px] text-white/40">Spend in Rewards Store</p>
                        </div>
                        <div>
                            <p className="text-white/60 font-bold text-xs uppercase tracking-wider mb-0.5">Lifetime Experience</p>
                            <h2 className="text-3xl font-black text-emerald-400">{xp.toLocaleString()} <span className="text-xs font-normal text-white/50">XP</span></h2>
                            {pointsNeeded > 0 ? (
                                <p className="text-[10px] text-white/70">{pointsNeeded} XP needed for {nextTierName}</p>
                            ) : (
                                <p className="text-[10px] text-yellow-300 font-bold">Ultimate Platinum Rank!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {pointsNeeded > 0 && (
                    <div className="mt-8 relative pt-4 border-t border-white/10">
                        <div className="flex justify-between text-[10px] font-bold text-white/60 mb-2 uppercase tracking-wider">
                            <span>{currentTierName} ({minPointsCurrent} XP)</span>
                            <span>{nextTierName} ({minPointsNext} XP)</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Daily Check-in Card */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Daily Check-in Streak</h3>
                                <p className="text-xs text-gray-500">Visit Cureza daily to grow your streak and claim XP boosts</p>
                            </div>
                        </div>
                        <div className="bg-neutral-50 dark:bg-gray-800/40 p-4 rounded-xl border border-neutral-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Your Streak</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{checkinStreakState} Days</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Next Reward</span>
                                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                    <Zap size={14} className="fill-current" /> +20 XP
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        {hasCheckedInToday ? (
                            <button
                                disabled
                                className="w-full py-3 bg-neutral-100 dark:bg-gray-800 text-neutral-400 dark:text-gray-500 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed border border-neutral-200/50 dark:border-gray-700/50"
                            >
                                <CheckCircle2 size={16} className="text-green-500" />
                                Checked In Today (Streak Active)
                            </button>
                        ) : (
                            <button
                                onClick={handleCheckIn}
                                disabled={checkingIn}
                                className="w-full py-3 bg-[#052326] text-white hover:bg-opacity-95 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98]"
                            >
                                {checkingIn ? 'Checking in...' : 'Claim Daily Check-in (+20 XP)'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats (Referrals Card centered to match check-in card) */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Referrals</p>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{completedReferrals} / {totalReferrals} Friends</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2 font-medium">Earned +200 XP & +100 pts per friend's first completed purchase</p>
                </div>
            </div>

            {/* Quick Links Grid (centered and columns scaled for 3 links) */}
            <div className="max-w-2xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { name: 'Activity Log', href: '/dashboard/circle/activity', icon: '📜' },
                    { name: 'Refer & Earn', href: '/dashboard/circle/referrals', icon: '🤝' },
                    { name: 'Badges', href: '/dashboard/circle/badges', icon: '🎖️' },
                ].map((item) => (
                    <Link key={item.name} href={item.href} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-[#052326] hover:shadow-md transition-all text-center group">
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
