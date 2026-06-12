'use client';

import { Save, Upload, Globe, DollarSign, Percent } from 'lucide-react';

export default function AdminGeneralSettingsPage() {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
                    <p className="text-gray-500">Configure basic platform details and branding</p>
                </div>
                <button className="bg-cureza-green text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Save size={18} />
                    Save Changes
                </button>
            </div>

            {/* Branding */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Branding & Identity</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                        <input type="text" defaultValue="Cureza" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                        <input type="email" defaultValue="support@cureza.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400">
                            Logo
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                            <Upload size={16} /> Upload New
                        </button>
                    </div>
                </div>
            </div>

            {/* Localization */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Localization & Tax</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green bg-white">
                                <option>INR (₹)</option>
                                <option>USD ($)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Country</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green bg-white">
                                <option>India</option>
                                <option>USA</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default GST %</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="number" defaultValue="18" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
