'use client';

import { Target, CheckCircle, Clock } from 'lucide-react';

export default function CircleChallengesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Monthly Challenges</h1>
                <p className="text-gray-500">Complete tasks to earn bonus XP and badges</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Active Challenge */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">November Challenge</span>
                            <h3 className="text-2xl font-bold mt-2">The Wellness Warrior</h3>
                            <p className="text-blue-100 mt-1">Complete 30 days of mindful activities</p>
                        </div>
                        <Target size={40} className="text-white/80" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Progress</span>
                            <span>12/30 Days</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2">
                            <div className="bg-white h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Daily Tasks */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900">Daily Quests</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {[
                            { task: 'Log your water intake', xp: 50, status: 'completed' },
                            { task: 'Read a wellness article', xp: 100, status: 'pending' },
                            { task: 'Share a product review', xp: 200, status: 'pending' },
                        ].map((quest, i) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    {quest.status === 'completed' ? (
                                        <CheckCircle className="text-green-500" size={20} />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                    )}
                                    <span className={quest.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}>
                                        {quest.task}
                                    </span>
                                </div>
                                <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    +{quest.xp} XP
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
