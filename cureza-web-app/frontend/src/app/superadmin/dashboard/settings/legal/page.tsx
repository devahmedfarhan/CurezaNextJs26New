'use client';

import { FileText, Edit, Eye } from 'lucide-react';

export default function AdminLegalSettingsPage() {
    const pages = [
        { id: 1, title: 'Privacy Policy', lastUpdated: '2025-10-15', status: 'Published' },
        { id: 2, title: 'Terms & Conditions', lastUpdated: '2025-10-15', status: 'Published' },
        { id: 3, title: 'Refund Policy', lastUpdated: '2025-11-01', status: 'Published' },
        { id: 4, title: 'Shipping Policy', lastUpdated: '2025-11-01', status: 'Published' },
        { id: 5, title: 'Seller Agreement', lastUpdated: '2025-09-20', status: 'Draft' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
                    <p className="text-gray-500">Manage content for policies and agreements</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {pages.map((page) => (
                    <div key={page.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{page.title}</h3>
                                <p className="text-sm text-gray-500">Last updated: {page.lastUpdated}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${page.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {page.status}
                            </span>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                                    <Eye size={18} />
                                </button>
                                <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
