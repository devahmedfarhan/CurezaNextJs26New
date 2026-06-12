'use client';

import { Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function CircleActivityPage() {
    const activities = [
        { id: 1, action: 'Product Purchase', detail: 'Order #ORD-2025-001', points: '+500', type: 'earn', date: 'Today, 10:30 AM' },
        { id: 2, action: 'Referral Bonus', detail: 'Referred friend: Rahul K.', points: '+1000', type: 'earn', date: 'Yesterday' },
        { id: 3, action: 'Reward Redeemed', detail: '₹500 Discount Coupon', points: '-2500', type: 'spend', date: 'Nov 24, 2025' },
        { id: 4, action: 'Daily Login', detail: 'Streak: 5 Days', points: '+50', type: 'earn', date: 'Nov 23, 2025' },
        { id: 5, action: 'Product Review', detail: 'Review for Ashwagandha', points: '+100', type: 'earn', date: 'Nov 22, 2025' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
                <p className="text-gray-500">Track your XP earnings and redemptions</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {activities.map((item) => (
                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${item.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {item.type === 'earn' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.action}</h4>
                                    <p className="text-sm text-gray-500">{item.detail}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`block font-bold text-lg ${item.type === 'earn' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {item.points} XP
                                </span>
                                <span className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                                    <Clock size={12} /> {item.date}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
