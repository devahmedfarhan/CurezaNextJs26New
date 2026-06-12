'use client';

import { TrendingUp, Star, Package, AlertCircle } from 'lucide-react';

export default function AdminSellerReportPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Seller Performance</h1>
                    <p className="text-gray-500">Analyze top sellers and identify issues</p>
                </div>
            </div>

            {/* Top Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="text-green-600" size={20} /> Top Performing Sellers
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-200">
                                        {i}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Organic India</p>
                                        <p className="text-xs text-gray-500">₹4.5L Revenue • 120 Orders</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                        4.8 <Star size={12} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="text-red-600" size={20} /> Sellers Needing Attention
                    </h3>
                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-red-400 border border-red-100">
                                        !
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">New Age Herbs</p>
                                        <p className="text-xs text-red-600">High Return Rate (15%)</p>
                                    </div>
                                </div>
                                <button className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1 rounded-full font-medium hover:bg-red-50">
                                    Review
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returns</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Seller {i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹{(50000 * i).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{10 * i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-red-500">{i}%</td>
                                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-1 text-gray-700">
                                    4.{9 - i} <Star size={14} className="text-yellow-400" fill="currentColor" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
