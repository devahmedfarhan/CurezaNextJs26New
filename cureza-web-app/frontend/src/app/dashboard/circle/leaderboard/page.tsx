'use client';

import { Trophy, Medal, Crown } from 'lucide-react';

export default function CircleLeaderboardPage() {
    const leaders = [
        { rank: 1, name: 'Priya S.', xp: 25400, badge: 'Diamond' },
        { rank: 2, name: 'Rahul K.', xp: 22100, badge: 'Platinum' },
        { rank: 3, name: 'Amit V.', xp: 19800, badge: 'Platinum' },
        { rank: 4, name: 'Sneha R.', xp: 18500, badge: 'Gold' },
        { rank: 5, name: 'Vikram S.', xp: 17200, badge: 'Gold' },
    ];

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Community Leaderboard</h1>
                <p className="text-gray-500">Top wellness champions of the month</p>
            </div>

            {/* Top 3 Podium */}
            <div className="flex justify-center items-end gap-4 mb-12">
                {/* 2nd Place */}
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-2 border-4 border-white shadow-lg relative">
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-full">2</div>
                    </div>
                    <p className="font-bold text-gray-900">Rahul K.</p>
                    <p className="text-xs text-gray-500">22,100 XP</p>
                </div>

                {/* 1st Place */}
                <div className="text-center relative -top-6">
                    <Crown className="text-yellow-400 mx-auto mb-2 animate-bounce" size={32} fill="currentColor" />
                    <div className="w-24 h-24 bg-yellow-100 rounded-full mx-auto mb-2 border-4 border-yellow-400 shadow-xl relative">
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full">1</div>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">Priya S.</p>
                    <p className="text-sm text-yellow-600 font-bold">25,400 XP</p>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-2 border-4 border-white shadow-lg relative">
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">3</div>
                    </div>
                    <p className="font-bold text-gray-900">Amit V.</p>
                    <p className="text-xs text-gray-500">19,800 XP</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {leaders.slice(3).map((leader) => (
                    <div key={leader.rank} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                            <span className="w-8 text-center font-bold text-gray-400">#{leader.rank}</span>
                            <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                            <span className="font-medium text-gray-900">{leader.name}</span>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-gray-900 block">{leader.xp.toLocaleString()} XP</span>
                            <span className="text-xs text-gray-500">{leader.badge}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
