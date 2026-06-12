'use client';

import { Package, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminInventoryReportPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
                    <p className="text-gray-500">Track stock levels and low inventory alerts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">Healthy Stock</p>
                            <h3 className="text-2xl font-bold text-gray-900">850 SKUs</h3>
                        </div>
                        <Package className="text-green-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-yellow-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">Low Stock (&lt; 10)</p>
                            <h3 className="text-2xl font-bold text-gray-900">45 SKUs</h3>
                        </div>
                        <AlertTriangle className="text-yellow-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">Out of Stock</p>
                            <h3 className="text-2xl font-bold text-gray-900">12 SKUs</h3>
                        </div>
                        <RefreshCw className="text-red-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Low Stock Alert Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-red-50">
                    <h3 className="font-bold text-red-800 flex items-center gap-2">
                        <AlertTriangle size={18} /> Critical Stock Alerts
                    </h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {[1, 2, 3].map((i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">Herbal Supplement {i}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">Seller {i}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">{i * 2} Units</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Critical</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-blue-600 hover:underline text-sm font-medium">Notify Seller</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
