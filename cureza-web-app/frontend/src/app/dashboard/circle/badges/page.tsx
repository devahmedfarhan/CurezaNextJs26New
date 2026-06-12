'use client';

import { Award, Lock } from 'lucide-react';

export default function CircleBadgesPage() {
    const badges = [
        { name: 'Early Adopter', desc: 'Joined in 2024', unlocked: true, icon: '🌟' },
        { name: 'Review Star', desc: 'Posted 10+ Reviews', unlocked: true, icon: '✍️' },
        { name: 'Wellness Guru', desc: 'Read 50+ Articles', unlocked: false, icon: '📚' },
        { name: 'Big Spender', desc: 'Spent ₹10,000+', unlocked: false, icon: '💎' },
        { name: 'Social Butterfly', desc: 'Referred 5 Friends', unlocked: true, icon: '🦋' },
        { name: 'Streak Master', desc: '30 Day Login Streak', unlocked: false, icon: '🔥' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Badges & Achievements</h1>
                <p className="text-gray-500">Showcase your wellness milestones</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.map((badge, i) => (
                    <div key={i} className={`p-6 rounded-xl border text-center relative group ${badge.unlocked ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'
                        }`}>
                        {!badge.unlocked && (
                            <div className="absolute top-3 right-3 text-gray-400">
                                <Lock size={16} />
                            </div>
                        )}
                        <div className={`text-4xl mb-3 ${!badge.unlocked && 'grayscale opacity-50'}`}>
                            {badge.icon}
                        </div>
                        <h3 className="font-bold text-gray-900">{badge.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{badge.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
