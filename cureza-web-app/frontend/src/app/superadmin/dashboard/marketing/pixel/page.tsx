'use client';

import { useState } from 'react';
import { Code, Save, CheckCircle } from 'lucide-react';

export default function AdminPixelPage() {
    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Meta Pixel & Google Tags</h1>
                <p className="text-gray-500">Manage tracking codes and analytics integration</p>
            </div>

            {/* Meta Pixel */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Code size={24} />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-gray-900">Meta Pixel (Facebook)</h3>
                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <CheckCircle size={16} /> Connected
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pixel ID</label>
                            <input
                                type="text"
                                defaultValue="123456789012345"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Google Analytics */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <Code size={24} />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-gray-900">Google Analytics 4 (GA4)</h3>
                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <CheckCircle size={16} /> Connected
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Measurement ID (G-XXXXXXXXXX)</label>
                            <input
                                type="text"
                                defaultValue="G-ABC123XYZ"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                    <Save size={18} />
                    Save Configurations
                </button>
            </div>
        </div>
    );
}
