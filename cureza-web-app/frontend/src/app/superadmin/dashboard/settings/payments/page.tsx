'use client';

import { CreditCard, ToggleRight, Key, Save } from 'lucide-react';

export default function AdminPaymentSettingsPage() {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
                    <p className="text-gray-500">Configure payment providers and methods</p>
                </div>
                <button className="bg-cureza-green text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Save size={18} />
                    Save Configurations
                </button>
            </div>

            {/* Razorpay */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            R
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Razorpay</h3>
                            <p className="text-sm text-gray-500">Credit Card, Debit Card, UPI, Netbanking</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">Enabled</span>
                        <ToggleRight size={40} className="text-cureza-green cursor-pointer" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" defaultValue="rzp_test_123456789" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green font-mono text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key Secret</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="password" defaultValue="****************" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-cureza-green focus:border-cureza-green font-mono text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stripe */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm opacity-75">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            S
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Stripe</h3>
                            <p className="text-sm text-gray-500">International Payments</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400">Disabled</span>
                        <ToggleRight size={40} className="text-gray-300 cursor-pointer rotate-180" />
                    </div>
                </div>
            </div>

            {/* COD */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Cash on Delivery (COD)</h3>
                            <p className="text-sm text-gray-500">Enable cash payments for orders</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">Enabled</span>
                        <ToggleRight size={40} className="text-cureza-green cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
}
