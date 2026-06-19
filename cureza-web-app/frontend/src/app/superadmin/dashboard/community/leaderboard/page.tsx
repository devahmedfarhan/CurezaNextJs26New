'use client';

import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
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
                <div className="h-64 bg-neutral-100 rounded-[10px]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[10px] border-[0.5px] border-neutral-950/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 border-b-[0.5px] border-neutral-950/10 text-gray-500 font-medium">
                            <tr>
                                <th className="p-3 w-24">Rank</th>
                                <th className="p-3">User Name</th>
                                <th className="p-3">Current XP Points</th>
                                <th className="p-3">Tier Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-[0.5px] divide-neutral-950/10">
                            {leaders.map((leader) => {
                                return (
                                    <tr key={leader.rank} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="p-3 font-semibold text-gray-900">
                                            {leader.rank === 1 && (
                                                <span className="inline-flex items-center gap-1 text-black font-semibold">
                                                    <Trophy size={14} /> #1
                                                </span>
                                            )}
                                            {leader.rank === 2 && (
                                                <span className="inline-flex items-center gap-1 text-neutral-600 font-semibold">
                                                    <Trophy size={14} /> #2
                                                </span>
                                            )}
                                            {leader.rank === 3 && (
                                                <span className="inline-flex items-center gap-1 text-neutral-400 font-semibold">
                                                    <Trophy size={14} /> #3
                                                </span>
                                            )}
                                            {leader.rank > 3 && `#${leader.rank}`}
                                        </td>
                                        <td className="p-3 font-medium text-gray-900">{leader.name}</td>
                                        <td className="p-3 font-semibold text-gray-900">{leader.xp.toLocaleString()} XP</td>
                                        <td className="p-3">
                                            <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-[6px] border-[0.5px] border-neutral-250 bg-neutral-50 text-neutral-700">
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
