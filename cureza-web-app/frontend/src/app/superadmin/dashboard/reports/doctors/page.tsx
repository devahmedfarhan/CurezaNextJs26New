'use client';

import { Activity, Star, MessageSquare, Calendar } from 'lucide-react';

export default function AdminDoctorReportPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Performance</h1>
                    <p className="text-gray-500">Consultation metrics and patient feedback</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border-[0.5px] border-black/50 shadow-none">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Total Consultations</p>
                            <h3 className="text-2xl font-bold text-gray-900">850</h3>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">70% Completed successfully</p>
                </div>

                <div className="bg-white p-6 rounded-xl border-[0.5px] border-black/50 shadow-none">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Star size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Avg. Patient Rating</p>
                            <h3 className="text-2xl font-bold text-gray-900">4.8/5.0</h3>
                        </div>
                    </div>
                    <div className="flex gap-1 text-yellow-400 text-xs">
                        <Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Based on 420 reviews</p>
                </div>

                <div className="bg-white p-6 rounded-xl border-[0.5px] border-black/50 shadow-none">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Activity size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500">Total Earnings</p>
                            <h3 className="text-2xl font-bold text-gray-900">₹4.2L</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 font-medium">+15% vs last month</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border-[0.5px] border-black/50 shadow-none overflow-hidden">
                <div className="p-4 border-b-[0.5px] border-black/50">
                    <h3 className="font-bold text-gray-900">Top Doctors</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consultations</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Dr. Name {i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">Ayurveda</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{50 * i}</td>
                                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-1">
                                    4.9 <Star size={14} className="text-yellow-400" fill="currentColor" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₹{(10000 * i).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
