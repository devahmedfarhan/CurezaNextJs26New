'use client';

import { useState } from 'react';
import { Save, Award, Star, Shield, Zap } from 'lucide-react';

export default function AdminXPTiersPage() {
    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">XP & Tier Configuration</h1>
                <p className="text-gray-500">Set rules for earning XP and tier progression</p>
            </div>

            {/* XP Rules */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Zap size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900">Earning Rules</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">XP per ₹100 Spent</label>
                        <input type="number" defaultValue={10} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">XP for Product Review</label>
                        <input type="number" defaultValue={50} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">XP for Photo Upload</label>
                        <input type="number" defaultValue={100} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">XP for Referral</label>
                        <input type="number" defaultValue={500} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                    </div>
                </div>
            </div>

            {/* Tier Thresholds */}
            <div className="space-y-6">
                <h3 className="font-bold text-gray-900">Tier Thresholds</h3>

                {/* Explorer */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-gray-100 text-gray-600 rounded-full">
                        <Shield size={32} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">Explorer</h4>
                        <p className="text-sm text-gray-500">Entry level tier for all new members.</p>
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Min XP</label>
                        <input type="number" defaultValue={0} disabled className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
                    </div>
                </div>

                {/* Creator */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                        <Star size={32} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">Creator</h4>
                        <p className="text-sm text-gray-500">Unlocks content creation tools and early access.</p>
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Min XP</label>
                        <input type="number" defaultValue={5000} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                    </div>
                </div>

                {/* Ambassador */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-6">
                    <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
                        <Award size={32} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">Ambassador</h4>
                        <p className="text-sm text-gray-500">Exclusive events, highest earning rates, and badges.</p>
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Min XP</label>
                        <input type="number" defaultValue={15000} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="bg-gray-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors font-medium shadow-lg shadow-gray-900/20">
                    <Save size={20} />
                    Save Configuration
                </button>
            </div>
        </div>
    );
}
