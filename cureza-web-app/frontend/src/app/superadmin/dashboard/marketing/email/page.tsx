'use client';

import { useState } from 'react';
import { Mail, Send, Users, BarChart2, Plus } from 'lucide-react';

export default function AdminEmailPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Email Campaign Builder</h1>
                    <p className="text-gray-500">Design and send newsletters to your customers</p>
                </div>
                <button className="bg-cureza-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Plus size={18} />
                    New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Campaigns */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-bold text-gray-900">Recent Campaigns</h3>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-200">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">November Wellness Newsletter</h4>
                                        <p className="text-sm text-gray-500">Sent on Nov 24, 2025 • 12,500 Recipients</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <Send size={14} /> 98% Delivered
                                        </span>
                                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                                            <Users size={14} /> 24% Open Rate
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Templates */}
                <div className="space-y-6">
                    <h3 className="font-bold text-gray-900">Templates</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {['Product Launch', 'Weekly Newsletter', 'Flash Sale Alert'].map((template) => (
                            <div key={template} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-cureza-green cursor-pointer transition-colors">
                                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                                    Preview
                                </div>
                                <h4 className="font-medium text-gray-900">{template}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
