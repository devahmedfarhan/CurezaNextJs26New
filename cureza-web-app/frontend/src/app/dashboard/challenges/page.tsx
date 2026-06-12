'use client';

import { useState, useEffect } from 'react';
import { Target, Trophy, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface Challenge {
    id: number;
    title: string;
    description: string;
    goal_value: number;
    reward_points: number;
    end_date: string;
    current_value: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'claimed';
}

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = () => {
        api.get('/user/challenges')
            .then((res) => setChallenges(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleJoin = (id: number) => {
        api.post(`/user/challenges/${id}/join`)
            .then(() => {
                fetchChallenges(); // Refresh list
            })
            .catch((err) => console.error(err));
    };

    if (loading) return <div>Loading challenges...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Monthly Challenges</h1>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    <Trophy size={16} /> Earn Bonus Points
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <Target size={32} />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-bold text-lg text-charcoal dark:text-gray-100">{challenge.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{challenge.description}</p>

                            <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Trophy size={14} className="text-yellow-500" /> {challenge.reward_points} Points</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> Ends {new Date(challenge.end_date).toLocaleDateString()}</span>
                            </div>

                            {challenge.status !== 'not_started' && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Progress</span>
                                        <span>{challenge.current_value} / {challenge.goal_value}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-cureza-green rounded-full transition-all"
                                            style={{ width: `${Math.min((challenge.current_value / challenge.goal_value) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-shrink-0">
                            {challenge.status === 'not_started' ? (
                                <button
                                    onClick={() => handleJoin(challenge.id)}
                                    className="bg-cureza-green text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Join Challenge
                                </button>
                            ) : challenge.status === 'completed' ? (
                                <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium cursor-default">
                                    Claim Reward
                                </button>
                            ) : (
                                <button className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-6 py-2 rounded-lg font-medium cursor-default flex items-center gap-2">
                                    In Progress <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
