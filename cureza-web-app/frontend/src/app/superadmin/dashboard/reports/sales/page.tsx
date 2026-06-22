'use client';

import { useState } from 'react';
import { BarChart2, Calendar, TrendingUp, Download } from 'lucide-react';

export default function AdminSalesReportPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
                    <p className="text-gray-500">Daily and monthly sales performance analysis</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border-[0.5px] border-black/50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Calendar size={18} />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900">₹45.2L</h3>
                    <span className="text-green-600 text-xs font-medium flex items-center gap-1 mt-1">
                        <TrendingUp size={12} /> +12.5%
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-900">1,250</h3>
                    <span className="text-green-600 text-xs font-medium flex items-center gap-1 mt-1">
                        <TrendingUp size={12} /> +8.2%
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none">
                    <p className="text-sm text-gray-500">Avg. Order Value</p>
                    <h3 className="text-2xl font-bold text-gray-900">₹3,616</h3>
                    <span className="text-red-600 text-xs font-medium flex items-center gap-1 mt-1">
                        <TrendingUp size={12} className="rotate-180" /> -2.1%
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none">
                    <p className="text-sm text-gray-500">Refund Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900">2.4%</h3>
                    <span className="text-green-600 text-xs font-medium flex items-center gap-1 mt-1">
                        <TrendingUp size={12} className="rotate-180" /> -0.5%
                    </span>
                </div>
            </div>

            {/* Sales Chart Placeholder */}
            <div className="bg-white p-6 rounded-xl border-[0.5px] border-black/50 shadow-none">
                <h3 className="font-bold text-gray-900 mb-6">Revenue Overview</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {[35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 95].map((h, i) => (
                        <div key={i} className="w-full bg-blue-50 hover:bg-blue-100 rounded-t-lg relative group transition-colors">
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-cureza-green rounded-t-lg transition-all duration-500"
                                style={{ height: `${h}%` }}
                            ></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                ₹{(h * 1000).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500 font-medium uppercase tracking-wider">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-xl border-[0.5px] border-black/50 shadow-none overflow-hidden">
                <div className="p-4 border-b-[0.5px] border-black/50">
                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Nov {26 - i}, 2025</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ORD-2025-0{100 + i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Customer {i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{1200 + (i * 150)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Completed</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
