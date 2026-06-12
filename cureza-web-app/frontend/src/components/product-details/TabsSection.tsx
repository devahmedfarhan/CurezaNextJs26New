'use client';

import { useState, useEffect } from 'react';
import { Star, Info, FileText, ClipboardList } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

export default function TabsSection({ product }: { product: any }) {
    const [activeTab, setActiveTab] = useState('description');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const baseTabs = [
        {
            id: 'description',
            label: 'Description',
            icon: FileText,
            content: product.long_description || product.description || product.longDescription,
            type: 'html'
        },
        {
            id: 'specifications',
            label: 'Specifications',
            icon: ClipboardList,
            content: product.specifications,
            type: 'table'
        },
    ];

    // Build dynamic tabs from additional_info.tabs if present
    const dynamicTabs = product.additional_info?.tabs?.map((tab: any) => ({
        id: tab.id || tab.title.toLowerCase().replace(/\s+/g, '-'),
        label: tab.title,
        icon: Info,
        content: tab.content,
        type: 'html'
    })) || [];

    const tabs = [
        ...baseTabs,
        ...dynamicTabs,
    ].filter(tab => (tab.content && (typeof tab.content === 'string' || (Array.isArray(tab.content) && tab.content.length > 0))));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-12">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto border-b border-gray-100 dark:border-gray-700 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-8 py-6 text-sm font-bold whitespace-nowrap transition-all border-b-2 outline-none ${activeTab === tab.id
                            ? 'border-cureza-green text-cureza-green bg-green-50/50 dark:bg-green-900/10'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-8 md:p-12 min-h-[400px]">
                <div className="animate-in fade-in duration-300">
                    {tabs.find(t => t.id === activeTab)?.type === 'html' && isMounted ? (
                        <div className="ql-container ql-snow border-none!">
                            <div
                                className="ql-editor !p-0 max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-sans
                                    [&_p]:mb-6 [&_ul]:!list-disc [&_ul]:!pl-8 [&_ol]:!list-decimal [&_ol]:!pl-8 
                                    [&_li]:mb-2 [&_li]:marker:text-cureza-green [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:mb-8
                                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-4
                                    [&_strong]:font-bold [&_em]:italic [&_a]:text-cureza-green [&_a]:underline
                                    dark:[&_h1]:text-white dark:[&_h2]:text-white dark:[&_h3]:text-white"
                                dangerouslySetInnerHTML={{ __html: tabs.find(t => t.id === activeTab)?.content }}
                            />
                        </div>
                    ) : tabs.find(t => t.id === activeTab)?.type === 'html' && (
                        <div className="animate-pulse flex flex-col gap-4">
                            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                        </div>
                    )}

                    {tabs.find(t => t.id === activeTab)?.type === 'table' && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                {Array.isArray(tabs.find(t => t.id === activeTab)?.content)
                                    ? (tabs.find(t => t.id === activeTab)?.content as any[]).map((item, idx) => (
                                        <div key={idx} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                                            <span className="font-medium text-gray-500 dark:text-gray-400">{item.key || Object.keys(item)[0]}</span>
                                            <span className="font-bold text-gray-900 dark:text-white text-right">{item.value || Object.values(item)[0]}</span>
                                        </div>
                                    ))
                                    : Object.entries(tabs.find(t => t.id === activeTab)?.content || {}).map(([key, value]: [string, any]) => (
                                        <div key={key} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                                            <span className="font-medium text-gray-500 dark:text-gray-400">{key}</span>
                                            <span className="font-bold text-gray-900 dark:text-white text-right">{value}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
