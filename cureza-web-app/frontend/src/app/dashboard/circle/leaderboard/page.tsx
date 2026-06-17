'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import api from '@/lib/api';

export default function CircleLeaderboardPage() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [userRank, setUserRank] = useState<any>('-');
    const [userXP, setUserXP] = useState<any>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/leaderboard')
            .then((res) => {
                setLeaders(res.data.leaders || []);
                setUserRank(res.data.user_rank || '-');
                setUserXP(res.data.user_xp || 0);
            })
            .catch((err) => console.error("Error loading leaderboard:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto"></div>
                <div className="h-48 bg-gray-200 rounded-xl max-w-md mx-auto"></div>
                <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    // Top 3 for the podium
    const top3 = [
        leaders.find(l => l.rank === 2) || { name: 'Empty', xp: 0, badge: 'Silver' },
        leaders.find(l => l.rank === 1) || { name: 'Empty', xp: 0, badge: 'Silver' },
        leaders.find(l => l.rank === 3) || { name: 'Empty', xp: 0, badge: 'Silver' },
    ];

    const listLeaders = leaders.filter(l => l.rank > 3);

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Community Leaderboard</h1>
                <p className="text-gray-500">Top wellness champions ranked by XP</p>
                <div className="inline-block bg-[#052326] text-white text-xs font-bold px-4 py-2 rounded-full mt-4 animate-bounce">
                    Your Rank: #{userRank} ({userXP.toLocaleString()} XP)
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="flex justify-center items-end gap-4 md:gap-8 mb-12 max-w-lg mx-auto pt-6">
                {/* 2nd Place */}
                <div className="text-center w-28 md:w-32">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full mx-auto mb-2 border-4 border-white shadow-lg relative flex items-center justify-center font-bold text-gray-600 text-xl">
                        {top3[0].name.charAt(0)}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">2</div>
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate">{top3[0].name}</p>
                    <p className="text-[11px] text-gray-500">{top3[0].xp.toLocaleString()} XP</p>
                </div>

                {/* 1st Place */}
                <div className="text-center w-32 md:w-36 relative -top-6">
                    <Crown className="text-yellow-400 mx-auto mb-2 animate-bounce" size={28} fill="currentColor" />
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-yellow-100 rounded-full mx-auto mb-2 border-4 border-yellow-400 shadow-xl relative flex items-center justify-center font-bold text-yellow-800 text-2xl">
                        {top3[1].name.charAt(0)}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">1</div>
                    </div>
                    <p className="font-bold text-gray-900 text-base truncate">{top3[1].name}</p>
                    <p className="text-xs text-yellow-600 font-bold">{top3[1].xp.toLocaleString()} XP</p>
                </div>

                {/* 3rd Place */}
                <div className="text-center w-28 md:w-32">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-full mx-auto mb-2 border-4 border-white shadow-lg relative flex items-center justify-center font-bold text-orange-800 text-xl">
                        {top3[2].name.charAt(0)}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</div>
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate">{top3[2].name}</p>
                    <p className="text-[11px] text-gray-500">{top3[2].xp.toLocaleString()} XP</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-xl mx-auto">
                {listLeaders.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                        No other ranking users. Earn more XP to lead!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {listLeaders.map((leader) => (
                            <div key={leader.rank} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 text-center font-bold text-gray-400 text-sm">#{leader.rank}</span>
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm border border-gray-200">
                                        {leader.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">{leader.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-gray-900 text-sm block">{leader.xp.toLocaleString()} XP</span>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{leader.badge}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
