'use client';

import { Copy, Share2, Users } from 'lucide-react';

export default function ReferEarnPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Refer & Earn</h1>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="bg-green-50 dark:bg-green-900/20 p-8 text-center">
                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
                        🤝
                    </div>
                    <h2 className="text-2xl font-bold text-charcoal dark:text-gray-100 mb-2">Invite Friends, Get ₹100</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                        Share your unique referral link with friends. They get ₹100 off their first order, and you get ₹100 in your wallet!
                    </p>
                </div>

                <div className="p-8">
                    <div className="max-w-xl mx-auto space-y-6">
                        {/* Referral Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Referral Code</label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 font-mono font-bold text-lg text-center tracking-widest text-charcoal dark:text-gray-100">
                                    CUREZA25
                                </div>
                                <button className="bg-cureza-green text-white px-6 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2">
                                    <Copy size={18} /> Copy
                                </button>
                            </div>
                        </div>

                        {/* Affiliate Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Affiliate Link</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value="https://cureza.in/ref/john-doe"
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-600 dark:text-gray-300"
                                />
                                <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                                    <Share2 size={18} /> Share
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-charcoal dark:text-gray-100 mb-1">12</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Friends Invited</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-charcoal dark:text-gray-100 mb-1">5</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Successful Referrals</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">₹500</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Earned</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
