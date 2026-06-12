'use client';

import { Users, DollarSign, MousePointer, Link as LinkIcon } from 'lucide-react';

export default function AdminAffiliateReportPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Affiliate Reports</h1>
                    <p className="text-gray-500">Track influencer campaigns and referral earnings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
                        <span className="text-sm text-gray-500">Active Affiliates</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">124</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MousePointer size={20} /></div>
                        <span className="text-sm text-gray-500">Total Clicks</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">45.2K</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                        <span className="text-sm text-gray-500">Revenue Generated</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">₹12.5L</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><DollarSign size={20} /></div>
                        <span className="text-sm text-gray-500">Commission Paid</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">₹1.2L</h3>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Top Affiliates</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Influencer {i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{1000 * i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{50 * i}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₹{(5000 * i).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">₹{(500 * i).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
