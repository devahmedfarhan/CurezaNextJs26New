'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit, Eye, Image as ImageIcon } from 'lucide-react';

export default function AdminBannersPage() {
    // Mock Data
    const banners = [
        { id: 1, title: 'Diwali Sale Main Banner', location: 'Home - Hero Slider', status: 'Active', image: 'https://placehold.co/600x200' },
        { id: 2, title: 'Ayurveda Category Header', location: 'Category - Ayurveda', status: 'Active', image: 'https://placehold.co/600x200' },
        { id: 3, title: 'New Year Promo', location: 'Home - Hero Slider', status: 'Scheduled', image: 'https://placehold.co/600x200' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
                    <p className="text-gray-500">Manage website banners and sliders</p>
                </div>
                <button className="bg-cureza-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Plus size={18} />
                    Add New Banner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
                        <div className="h-40 bg-gray-100 relative">
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100"><Eye size={18} /></button>
                                <button className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50"><Edit size={18} /></button>
                                <button className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 line-clamp-1">{banner.title}</h3>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${banner.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {banner.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <ImageIcon size={14} />
                                {banner.location}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
