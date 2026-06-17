'use client';

import { useState, useEffect } from 'react';
import { Award, Lock } from 'lucide-react';
import api from '@/lib/api';

export default function CircleBadgesPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/badges')
            .then((res) => {
                setBadges(res.data || []);
            })
            .catch((err) => console.error("Error loading badges:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="h-28 bg-gray-200 rounded-xl"></div>
                    <div className="h-28 bg-gray-200 rounded-xl"></div>
                    <div className="h-28 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Badges & Achievements</h1>
                <p className="text-gray-500">Showcase your wellness milestones and unlock achievements</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge) => (
                    <div key={badge.id} className={`p-6 rounded-xl border text-center relative group ${badge.unlocked ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                        {!badge.unlocked && (
                            <div className="absolute top-3 right-3 text-gray-400">
                                <Lock size={16} />
                            </div>
                        )}
                        <div className={`text-4xl mb-3 ${!badge.unlocked && 'grayscale opacity-50'}`}>
                            {badge.icon || '🏅'}
                        </div>
                        <h3 className="font-bold text-gray-900">{badge.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
                        {badge.unlocked && badge.unlocked_at && (
                            <p className="text-[10px] text-green-600 font-semibold mt-2">Unlocked {badge.unlocked_at}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
