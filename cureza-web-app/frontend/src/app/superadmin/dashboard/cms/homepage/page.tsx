'use client';

import { useState } from 'react';
import { GripVertical, Plus, Trash2, Eye, Save } from 'lucide-react';

export default function AdminHomepageEditorPage() {
    const [sections, setSections] = useState([
        { id: 1, type: 'Hero Slider', title: 'Main Hero Slider', enabled: true },
        { id: 2, type: 'Features', title: 'Key Features (USP)', enabled: true },
        { id: 3, type: 'Product Carousel', title: 'New Launches', enabled: true },
        { id: 4, type: 'Banner Grid', title: 'Promotional Banners', enabled: true },
        { id: 5, type: 'Product Carousel', title: 'Best Sellers', enabled: true },
        { id: 6, type: 'Blog Grid', title: 'Latest from Health Hub', enabled: true },
    ]);

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
                    <p className="text-gray-500">Drag and drop to reorder homepage sections</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
                        <Eye size={18} />
                        Preview
                    </button>
                    <button className="bg-cureza-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Active Sections</h3>
                    <button className="text-sm text-cureza-green font-medium flex items-center gap-1 hover:underline">
                        <Plus size={16} /> Add Section
                    </button>
                </div>
                <div className="divide-y divide-gray-200">
                    {sections.map((section, index) => (
                        <div key={section.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 group transition-colors">
                            <div className="cursor-move text-gray-400 hover:text-gray-600">
                                <GripVertical size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{section.title}</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{section.type}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={section.enabled} className="sr-only peer" readOnly />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cureza-green"></div>
                                </label>
                                <button className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
