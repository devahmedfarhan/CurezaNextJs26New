'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Eye, Image as ImageIcon, MessageSquare } from 'lucide-react';

export default function AdminUGCPage() {
    const [activeTab, setActiveTab] = useState('Pending');

    const items = [
        { id: 1, user: 'Ishita Sharma', type: 'Review', content: 'Amazing product! Really helped with my joint pain.', product: 'Orthofit Oil', date: '2 hrs ago', status: 'Pending' },
        { id: 2, user: 'Rohan Mehta', type: 'Photo', content: 'https://placehold.co/100', product: 'Chyawanprash', date: '5 hrs ago', status: 'Pending' },
        { id: 3, user: 'Aarav Gupta', type: 'Review', content: 'Delivery was late but product is good.', product: 'Herbal Tea', date: '1 day ago', status: 'Approved' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">UGC Approvals</h1>
                    <p className="text-gray-500">Moderate user reviews, photos, and community posts</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {['Pending', 'Approved', 'Rejected'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-cureza-green text-cureza-green'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="grid grid-cols-1 gap-4">
                {items.filter(i => i.status === activeTab).map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            {item.type === 'Photo' ? (
                                <img src={item.content} alt="UGC" className="w-24 h-24 object-cover rounded-lg border border-gray-100" />
                            ) : (
                                <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    <MessageSquare size={32} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.product}</h4>
                                    <p className="text-sm text-gray-500">by <span className="font-medium text-gray-700">{item.user}</span> • {item.date}</p>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium uppercase">{item.type}</span>
                            </div>
                            {item.type === 'Review' && (
                                <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">"{item.content}"</p>
                            )}
                        </div>
                        <div className="flex flex-col justify-center gap-2 border-l border-gray-100 pl-6">
                            {item.status === 'Pending' ? (
                                <>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium w-full justify-center">
                                        <CheckCircle size={16} /> Approve
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium w-full justify-center">
                                        <XCircle size={16} /> Reject
                                    </button>
                                </>
                            ) : (
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium w-full justify-center">
                                    <Eye size={16} /> View
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {items.filter(i => i.status === activeTab).length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                        <p>No items found in {activeTab}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
