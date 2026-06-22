'use client';

import { MessageSquare, Image as ImageIcon, ThumbsUp, Share2 } from 'lucide-react';

export default function AdminUGCReportPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">UGC Impact Report</h1>
                    <p className="text-gray-500">Analyze user-generated content engagement</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                        <MessageSquare size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">1,250</h3>
                    <p className="text-sm text-gray-500">Total Reviews</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none text-center">
                    <div className="mx-auto w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-2">
                        <ImageIcon size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">450</h3>
                    <p className="text-sm text-gray-500">Photo Uploads</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none text-center">
                    <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
                        <ThumbsUp size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">12.5K</h3>
                    <p className="text-sm text-gray-500">Helpful Votes</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-[0.5px] border-black/50 shadow-none text-center">
                    <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-2">
                        <Share2 size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">3.2K</h3>
                    <p className="text-sm text-gray-500">Social Shares</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border-[0.5px] border-black/50 shadow-none">
                <h3 className="font-bold text-gray-900 mb-4">Impact on Sales</h3>
                <p className="text-gray-600 mb-6">Products with 10+ reviews show a <span className="font-bold text-green-600">25% higher conversion rate</span> compared to products with no reviews.</p>

                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                    Chart: Conversion Rate vs Review Count (Placeholder)
                </div>
            </div>
        </div>
    );
}
