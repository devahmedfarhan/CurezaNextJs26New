'use client';

import { Package, TrendingUp, Eye, ShoppingCart } from 'lucide-react';

export default function AdminProductReportPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Analytics</h1>
                    <p className="text-gray-500">Insights into product views, sales, and conversion rates</p>
                </div>
            </div>

            {/* Top Products */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg">
                            #{i} Bestseller
                        </div>
                        <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0"></div>
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-2">Organic Ashwagandha Powder 100g</h3>
                                <p className="text-sm text-gray-500 mt-1">Organic India</p>
                                <p className="font-bold text-cureza-green mt-2">₹450</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-center">
                            <div>
                                <p className="text-xs text-gray-500 flex justify-center items-center gap-1"><Eye size={12} /> Views</p>
                                <p className="font-bold text-gray-900">12.5K</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 flex justify-center items-center gap-1"><ShoppingCart size={12} /> Sales</p>
                                <p className="font-bold text-gray-900">1,240</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 flex justify-center items-center gap-1"><TrendingUp size={12} /> Conv.</p>
                                <p className="font-bold text-green-600">9.8%</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-6">Category Performance</h3>
                <div className="space-y-4">
                    {[
                        { name: 'Ayurveda', value: 75, color: 'bg-green-500' },
                        { name: 'Personal Care', value: 60, color: 'bg-blue-500' },
                        { name: 'Supplements', value: 45, color: 'bg-purple-500' },
                        { name: 'Wellness Devices', value: 30, color: 'bg-orange-500' },
                    ].map((cat) => (
                        <div key={cat.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{cat.name}</span>
                                <span className="text-gray-500">{cat.value}% Share</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${cat.color}`} style={{ width: `${cat.value}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
