'use client';

import { Bell, Gift, Star, MessageSquare } from 'lucide-react';

export default function CircleNotificationsPage() {
    const notifications = [
        { id: 1, title: 'You earned 500 XP!', desc: 'For your recent purchase of Organic Tea.', time: '2 hours ago', icon: <Star size={20} />, color: 'bg-yellow-100 text-yellow-600' },
        { id: 2, title: 'New Reward Unlocked', desc: 'You can now redeem the Free Shipping coupon.', time: '5 hours ago', icon: <Gift size={20} />, color: 'bg-purple-100 text-purple-600' },
        { id: 3, title: 'Challenge Update', desc: 'You are halfway through the November Challenge!', time: '1 day ago', icon: <Bell size={20} />, color: 'bg-blue-100 text-blue-600' },
        { id: 4, title: 'Reply to your review', desc: 'Dr. Sharma replied to your question.', time: '2 days ago', icon: <MessageSquare size={20} />, color: 'bg-green-100 text-green-600' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Updates on your rewards and community activity</p>
                </div>
                <button className="text-sm text-cureza-green font-medium hover:underline">Mark all as read</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {notifications.map((item) => (
                        <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                            <div className={`p-3 rounded-full flex-shrink-0 ${item.color}`}>
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                                <p className="text-xs text-gray-400 mt-2">{item.time}</p>
                            </div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
