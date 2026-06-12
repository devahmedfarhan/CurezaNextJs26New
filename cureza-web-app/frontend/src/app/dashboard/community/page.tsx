'use client';

import { useState, useEffect } from 'react';
import { Crown, Star, Lock, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface Tier {
    id: number;
    name: string;
    min_points: number;
    benefits: string[];
    icon: string;
}

export default function CommunityPage() {
    const [currentTier, setCurrentTier] = useState<Tier | null>(null);
    const [nextTier, setNextTier] = useState<Tier | null>(null);
    const [points, setPoints] = useState(0);
    const [pointsNeeded, setPointsNeeded] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/community')
            .then((res) => {
                setCurrentTier(res.data.current_tier);
                setNextTier(res.data.next_tier);
                setPoints(res.data.points);
                setPointsNeeded(res.data.points_needed);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading community...</div>;

    const progress = nextTier ? (points / nextTier.min_points) * 100 : 100;

    return (
        <div className="space-y-8">
            <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Crown size={120} />
                </div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Cureza Circle</h1>
                    <p className="text-purple-100 mb-8">Unlock exclusive benefits as you grow with us.</p>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Crown size={32} className="text-yellow-300" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-200 uppercase tracking-wider font-semibold">Current Status</p>
                            <h2 className="text-4xl font-bold text-white">{currentTier?.name} Member</h2>
                        </div>
                    </div>

                    {nextTier && (
                        <div className="max-w-md">
                            <div className="flex justify-between text-sm mb-2">
                                <span>{points} Points</span>
                                <span>{nextTier.min_points} Points ({nextTier.name})</span>
                            </div>
                            <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <p className="text-sm mt-2 text-purple-100">
                                Earn {pointsNeeded} more points to unlock {nextTier.name} status!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Benefits Card */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Star className="text-yellow-500" size={20} /> Your Benefits
                    </h3>
                    <ul className="space-y-3">
                        {currentTier?.benefits?.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Next Tier Teaser */}
                {nextTier && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-500">
                            <Lock size={20} /> Next Level: {nextTier.name}
                        </h3>
                        <ul className="space-y-3 opacity-60">
                            {nextTier.benefits?.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
