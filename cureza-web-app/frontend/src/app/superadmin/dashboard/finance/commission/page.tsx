'use client';

import { useState } from 'react';
import { Save, Percent, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminCommissionPage() {
    const [globalCommission, setGlobalCommission] = useState(10);
    const [categoryCommissions, setCategoryCommissions] = useState([
        { id: 1, category: 'Ayurveda', rate: 12 },
        { id: 2, category: 'Personal Care', rate: 15 },
        { id: 3, category: 'Wellness', rate: 8 },
        { id: 4, category: 'Supplements', rate: 10 },
    ]);

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Commission Configuration</h1>
                <p className="text-gray-500">Set platform fees and commission rates for sellers</p>
            </div>

            {/* Global Settings */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Percent size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Global Default Commission</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            This rate applies to all categories unless a specific override is set below.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="relative w-32">
                                <input
                                    type="number"
                                    value={globalCommission}
                                    onChange={(e) => setGlobalCommission(Number(e.target.value))}
                                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green font-bold text-lg"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                            </div>
                            <button className="px-4 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
                                <Save size={18} />
                                Update Global Rate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Overrides */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h3 className="font-bold text-gray-900">Category-Specific Rates</h3>
                    <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        <RefreshCw size={14} />
                        Reset All to Default
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryCommissions.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="font-medium text-gray-700">{item.category}</span>
                            <div className="flex items-center gap-2">
                                <div className="relative w-24">
                                    <input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => {
                                            const newRates = categoryCommissions.map(c =>
                                                c.id === item.id ? { ...c, rate: Number(e.target.value) } : c
                                            );
                                            setCategoryCommissions(newRates);
                                        }}
                                        className="w-full pl-3 pr-8 py-1.5 border border-gray-300 rounded-md focus:ring-cureza-green focus:border-cureza-green text-sm font-medium"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2">
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Warning Note */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="font-bold text-yellow-800 text-sm">Important Note</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                        Changes to commission rates will only apply to new orders placed after the update. Existing orders will retain their original commission structure.
                    </p>
                </div>
            </div>
        </div>
    );
}
