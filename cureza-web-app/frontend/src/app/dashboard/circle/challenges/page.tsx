'use client';

import { useState, useEffect } from 'react';
import { Target, Trophy, Clock, CheckCircle2, ArrowLeft, Loader2, Play, Award } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import Slider from '@/components/common/Slider';

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

export default function CircleChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchChallenges = async () => {
        try {
            const res = await api.get('/user/challenges');
            setChallenges(res.data || []);
        } catch (err) {
            console.error("Error loading challenges:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    const handleJoin = async (id: number) => {
        setActionLoading(id);
        try {
            await api.post(`/user/challenges/${id}/join`);
            await fetchChallenges();
        } catch (err) {
            console.error("Error joining challenge:", err);
            alert("Failed to join challenge.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleClaim = async (id: number) => {
        setActionLoading(id);
        try {
            const res = await api.post(`/user/challenges/${id}/claim`);
            alert(res.data?.message || "Reward claimed successfully!");
            await fetchChallenges();
        } catch (err: any) {
            console.error("Error claiming reward:", err);
            alert(err.response?.data?.message || "Failed to claim reward.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/circle" className="p-2 border border-black/10 rounded-lg hover:bg-neutral-50 transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Ongoing Challenges</h1>
                    <p className="text-gray-500 text-xs mt-0.5">Complete activities and claim loyalty points rewards</p>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Loading challenges...
                </div>
            ) : challenges.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 p-8 text-center rounded-[8px] border border-[#555555]/18">
                    <Target size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">No active challenges available right now. Check back soon!</p>
                </div>
            ) : (
                challenges.length > 3 ? (
                    <Slider>
                        {challenges.map((challenge) => {
                            const progressPercent = Math.min(Math.round((challenge.current_value / challenge.goal_value) * 100), 100);
                            
                            return (
                                <div 
                                    key={challenge.id} 
                                    className="bg-white dark:bg-gray-900 p-5 flex flex-col justify-between space-y-4 premium-dashboard-card w-[280px] md:w-[320px] h-[250px]"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{challenge.title}</h3>
                                            <span className="bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-green-150 uppercase tracking-wider shrink-0">
                                                +{challenge.reward_points} pts
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-normal line-clamp-2">{challenge.description}</p>
                                    </div>

                                    {/* Progress Section */}
                                    {challenge.status !== 'not_started' && (
                                        <div className="space-y-1.5 pt-2">
                                            <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                                                <span>Progress: {challenge.current_value} / {challenge.goal_value}</span>
                                                <span>{progressPercent}%</span>
                                            </div>
                                            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-[#052326] h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${progressPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-black/5 text-[10px] mt-auto">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <Clock size={12} /> Till: {new Date(challenge.end_date).toLocaleDateString()}
                                        </span>

                                        {challenge.status === 'not_started' && (
                                            <button
                                                onClick={() => handleJoin(challenge.id)}
                                                disabled={actionLoading !== null}
                                                className="bg-black text-white hover:bg-neutral-800 px-3.5 py-1.5 rounded-[6px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                                            >
                                                <Play size={10} fill="white" /> Join Quest
                                            </button>
                                        )}

                                        {challenge.status === 'in_progress' && (
                                            <span className="text-amber-600 font-semibold bg-amber-50 border border-amber-150 px-2 py-0.5 rounded uppercase tracking-wider">
                                                In Progress
                                            </span>
                                        )}

                                        {challenge.status === 'completed' && (
                                            <button
                                                onClick={() => handleClaim(challenge.id)}
                                                disabled={actionLoading !== null}
                                                className="bg-[#052326] text-white hover:bg-opacity-95 px-3.5 py-1.5 rounded-[6px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                                            >
                                                <Award size={12} /> Claim Reward
                                            </button>
                                        )}

                                        {challenge.status === 'claimed' && (
                                            <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Claimed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </Slider>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {challenges.map((challenge) => {
                            const progressPercent = Math.min(Math.round((challenge.current_value / challenge.goal_value) * 100), 100);
                            
                            return (
                                <div 
                                    key={challenge.id} 
                                    className="bg-white dark:bg-gray-900 p-5 flex flex-col justify-between space-y-4 premium-dashboard-card"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{challenge.title}</h3>
                                            <span className="bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-green-150 uppercase tracking-wider shrink-0">
                                                +{challenge.reward_points} Points
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-normal">{challenge.description}</p>
                                    </div>

                                    {/* Progress Section */}
                                    {challenge.status !== 'not_started' && (
                                        <div className="space-y-1.5 pt-2">
                                            <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                                                <span>Progress: {challenge.current_value} / {challenge.goal_value}</span>
                                                <span>{progressPercent}%</span>
                                            </div>
                                            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-[#052326] h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${progressPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-black/5 text-[10px]">
                                        <span className="text-gray-400 flex items-center gap-1">
                                            <Clock size={12} /> Till: {new Date(challenge.end_date).toLocaleDateString()}
                                        </span>

                                        {challenge.status === 'not_started' && (
                                            <button
                                                onClick={() => handleJoin(challenge.id)}
                                                disabled={actionLoading !== null}
                                                className="bg-black text-white hover:bg-neutral-800 px-3.5 py-1.5 rounded-[6px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                                            >
                                                <Play size={10} fill="white" /> Join Quest
                                            </button>
                                        )}

                                        {challenge.status === 'in_progress' && (
                                            <span className="text-amber-600 font-semibold bg-amber-50 border border-amber-150 px-2 py-0.5 rounded uppercase tracking-wider">
                                                In Progress
                                            </span>
                                        )}

                                        {challenge.status === 'completed' && (
                                            <button
                                                onClick={() => handleClaim(challenge.id)}
                                                disabled={actionLoading !== null}
                                                className="bg-[#052326] text-white hover:bg-opacity-95 px-3.5 py-1.5 rounded-[6px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                                            >
                                                <Award size={12} /> Claim Reward
                                            </button>
                                        )}

                                        {challenge.status === 'claimed' && (
                                            <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Claimed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
}
