'use client';

import { Star, Lock, Gift, Crown } from 'lucide-react';

export default function CurezaCirclePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Cureza Circle</h1>

            {/* Current Tier */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>

                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
                    👑
                </div>
                <h2 className="text-2xl font-bold text-charcoal dark:text-gray-100 mb-2">Gold Member</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">You are 500 XP away from Platinum Tier</p>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                        <span>Gold</span>
                        <span>Platinum</span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 w-3/4 rounded-full"></div>
                    </div>
                    <p className="text-sm font-bold text-charcoal dark:text-gray-100 mt-2">1500 / 2000 XP</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="font-bold text-2xl text-cureza-green mb-1">2.5%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Cashback on Orders</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="font-bold text-2xl text-cureza-green mb-1">Free</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Doctor Consultations</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="font-bold text-2xl text-cureza-green mb-1">Early</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Access to Sales</div>
                    </div>
                </div>
            </div>

            {/* Rewards */}
            <h2 className="text-xl font-bold text-charcoal dark:text-gray-100 mt-8">Redeem Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((reward) => (
                    <div key={reward} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden group">
                        <div className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-5xl">
                            🎁
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-charcoal dark:text-gray-100 mb-2">₹500 Gift Voucher</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Redeem for 1000 XP</p>
                            <button className="w-full py-2 rounded-lg border border-cureza-green text-cureza-green font-bold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                Redeem
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
