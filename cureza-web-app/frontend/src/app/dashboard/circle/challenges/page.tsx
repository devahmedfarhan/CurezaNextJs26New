'use client';

import { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function CircleChallengesPage() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const loadChallenges = () => {
        api.get('/user/challenges')
            .then((res) => {
                setChallenges(res.data || []);
            })
            .catch((err) => console.error("Error loading challenges:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadChallenges();
    }, []);

    const handleJoin = async (id: number) => {
        setActionLoading(id);
        try {
            await api.post(`/user/challenges/${id}/join`);
            loadChallenges();
        } catch (err) {
            console.error("Error joining challenge:", err);
            alert("Failed to join challenge. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleClaim = async (id: number) => {
        setActionLoading(id);
        try {
            const res = await api.post(`/user/challenges/${id}/claim`);
            alert(res.data.message || "XP Claimed successfully!");
            loadChallenges();
        } catch (err: any) {
            console.error("Error claiming points:", err);
            alert(err.response?.data?.message || "Failed to claim points. Make sure the goal is completed!");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Challenges & Quests</h1>
                <p className="text-gray-500">Participate in challenges to earn massive bonus XP</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {challenges.length === 0 ? (
                    <div className="bg-white p-8 text-center border border-gray-200 rounded-xl text-gray-500">
                        No active challenges currently. Check back soon!
                    </div>
                ) : (
                    challenges.map((item) => {
                        const isJoined = item.status !== 'not_started';
                        const isCompleted = item.current_value >= item.goal_value;
                        const isClaimed = item.status === 'claimed';
                        const progressPercent = Math.min(Math.max((item.current_value / item.goal_value) * 100, 0), 100);

                        return (
                            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6 gap-6 hover:shadow-md transition-shadow">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                            isClaimed 
                                                ? 'bg-gray-100 text-gray-500' 
                                                : isCompleted 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : isJoined 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {isClaimed ? 'Claimed' : isCompleted ? 'Completed' : isJoined ? 'In Progress' : 'Available'}
                                        </span>
                                        <span className="text-xs font-bold text-yellow-600">+{item.reward_points} XP</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                    
                                    {isJoined && (
                                        <div className="space-y-2 pt-2 max-w-md">
                                            <div className="flex justify-between text-xs font-semibold text-gray-500">
                                                <span>Progress: {item.current_value.toLocaleString()} / {item.goal_value.toLocaleString()}</span>
                                                <span>{Math.round(progressPercent)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`} 
                                                    style={{ width: `${progressPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center shrink-0">
                                    {!isJoined && (
                                        <button
                                            onClick={() => handleJoin(item.id)}
                                            disabled={actionLoading === item.id}
                                            className="w-full md:w-auto bg-[#052326] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-95 transition-all"
                                        >
                                            {actionLoading === item.id ? 'Joining...' : 'Join Challenge'}
                                        </button>
                                    )}
                                    {isJoined && isCompleted && !isClaimed && (
                                        <button
                                            onClick={() => handleClaim(item.id)}
                                            disabled={actionLoading === item.id}
                                            className="w-full md:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-all flex items-center gap-2"
                                        >
                                            {actionLoading === item.id ? 'Claiming...' : <><CheckCircle size={16} /> Claim Reward</>}
                                        </button>
                                    )}
                                    {isJoined && !isCompleted && (
                                        <div className="w-full md:w-auto text-center border border-gray-200 text-gray-500 px-6 py-2 rounded-lg text-sm font-medium bg-gray-50 flex items-center gap-2">
                                            <Clock size={16} /> Ongoing
                                        </div>
                                    )}
                                    {isClaimed && (
                                        <div className="w-full md:w-auto text-center border border-green-200 text-green-600 px-6 py-2 rounded-lg text-sm font-medium bg-green-50/50 flex items-center gap-2">
                                            <CheckCircle size={16} /> Claimed
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
