'use client';

import { Gift, ShoppingBag } from 'lucide-react';

export default function CircleRewardsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rewards Shop</h1>
                    <p className="text-gray-500">Redeem your hard-earned XP for exclusive perks</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-bold">
                    Balance: 12,450 XP
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: '₹500 Off Coupon', cost: 5000, desc: 'Valid on orders above ₹1500', color: 'bg-green-500' },
                    { title: 'Free Shipping', cost: 2000, desc: 'Valid on your next order', color: 'bg-blue-500' },
                    { title: 'Wellness E-Book', cost: 1500, desc: 'Exclusive guide to Ayurveda', color: 'bg-purple-500' },
                    { title: 'Mystery Gift Box', cost: 10000, desc: 'Curated wellness products', color: 'bg-orange-500' },
                    { title: 'Doctor Consultation', cost: 8000, desc: 'One free session', color: 'bg-teal-500' },
                ].map((reward, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className={`${reward.color} h-32 flex items-center justify-center text-white`}>
                            <Gift size={48} />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{reward.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 flex-1">{reward.desc}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="font-bold text-yellow-600">{reward.cost} XP</span>
                                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                    Redeem
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
