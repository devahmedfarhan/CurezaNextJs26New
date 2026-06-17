'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import api from '@/lib/api';

export default function AdminLeaderboardPage() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/leaderboard')
            .then((res) => {
                setLeaders(res.data.leaders || []);
            })
            .catch((err) => console.error("Error loading leaderboard:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Leaderboard & Rankings</h1>
                <p className="text-gray-500">Global user placements based on points accumulated.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 w-24">Rank</th>
                                <th className="p-4">User Name</th>
                                <th className="p-4">Current XP Points</th>
                                <th className="p-4">Tier Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {leaders.map((leader) => {
                                let tierColor = 'text-gray-500 bg-gray-100';
                                if (leader.badge === 'Gold') tierColor = 'text-yellow-800 bg-yellow-100';
                                if (leader.badge === 'Platinum') tierColor = 'text-purple-800 bg-purple-100';

                                return (
                                    <tr key={leader.rank} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-extrabold text-gray-900">
                                            {leader.rank === 1 && <span className="inline-flex items-center gap-1 text-yellow-600"><Trophy size={16} /> #1</span>}
                                            {leader.rank === 2 && <span className="inline-flex items-center gap-1 text-gray-400"><Trophy size={16} /> #2</span>}
                                            {leader.rank === 3 && <span className="inline-flex items-center gap-1 text-amber-700"><Trophy size={16} /> #3</span>}
                                            {leader.rank > 3 && `#${leader.rank}`}
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">{leader.name}</td>
                                        <td className="p-4 font-bold text-yellow-600">{leader.xp.toLocaleString()} XP</td>
                                        <td className="p-4">
                                            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${tierColor}`}>
                                                {leader.badge}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
