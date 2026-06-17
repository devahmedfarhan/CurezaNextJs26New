'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '@/lib/api';

export default function CircleActivityPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/user/wallet')
            .then((res) => {
                setActivities(res.data.transactions || []);
            })
            .catch((err) => console.error("Error loading activities:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                <div className="space-y-4">
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
                <p className="text-gray-500">Track your XP earnings and redemptions</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {activities.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No transactions found. Earn points by placing orders, writing reviews, or referring friends!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {activities.map((item) => {
                            const isEarn = item.type === 'credit';
                            const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${isEarn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {isEarn ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{isEarn ? 'Points Earned' : 'Points Spent'}</h4>
                                            <p className="text-sm text-gray-500">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`block font-bold text-lg ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                                            {isEarn ? '+' : '-'}{item.points} XP
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                                            <Clock size={12} /> {formattedDate}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
