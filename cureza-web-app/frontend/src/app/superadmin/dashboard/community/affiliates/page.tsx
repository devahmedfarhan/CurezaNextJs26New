'use client';

import { useState } from 'react';
import { Users, DollarSign, Link as LinkIcon, TrendingUp } from 'lucide-react';

export default function AdminAffiliatesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Affiliates & Influencers</h1>
                    <p className="text-gray-500">Track partner performance and payouts</p>
                </div>
                <button className="bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Add New Influencer
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Affiliates</p>
                    <h3 className="text-2xl font-bold text-gray-900">124</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Active Campaigns</p>
                    <h3 className="text-2xl font-bold text-gray-900">8</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Clicks (Nov)</p>
                    <h3 className="text-2xl font-bold text-gray-900">45.2K</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Commission Paid</p>
                    <h3 className="text-2xl font-bold text-cureza-green">₹1.2L</h3>
                </div>
            </div>

            {/* Influencer List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-700">Top Performing Influencers</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Influencer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3].map((i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                        <div>
                                            <p className="font-medium text-gray-900">Priya Yoga</p>
                                            <p className="text-xs text-gray-500">@priyayoga</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">Gold</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">12,450</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">850 (6.8%)</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹42,500</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
