'use client';

import { Trophy, Star, TrendingUp, Users, Gift, Target } from 'lucide-react';
import Link from 'next/link';

export default function CircleHomePage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cureza Circle</h1>
                    <p className="text-gray-500">Your wellness journey rewards and community</p>
                </div>
                <Link href="/dashboard/circle/rewards" className="bg-cureza-green text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Gift size={18} />
                    Redeem Points
                </Link>
            </div>

            {/* Hero Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Trophy size={40} className="text-white" />
                        </div>
                        <div>
                            <p className="text-gray-400 font-medium mb-1">Current Tier</p>
                            <h2 className="text-3xl font-bold mb-2">Gold Member</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Star size={14} className="text-yellow-400" fill="currentColor" />
                                <span>Top 5% of community</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-gray-400 font-medium mb-1">Available XP</p>
                        <h2 className="text-4xl font-bold text-yellow-400 mb-2">12,450</h2>
                        <p className="text-sm text-gray-300">550 XP to Platinum Tier</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 relative pt-6">
                    <div className="flex justify-between text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                        <span>Gold</span>
                        <span>Platinum</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monthly Challenge</p>
                            <h3 className="font-bold text-gray-900">12/30 Days</h3>
                        </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Referrals</p>
                            <h3 className="font-bold text-gray-900">15 Friends</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2 font-medium">+3 this month</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Rank</p>
                            <h3 className="font-bold text-gray-900">#42</h3>
                        </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-2 font-medium">Top 100 Leaderboard</p>
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
                    <Link key={item.name} href={item.href} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-cureza-green hover:shadow-md transition-all text-center group">
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
