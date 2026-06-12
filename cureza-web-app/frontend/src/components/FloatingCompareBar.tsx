'use client';

import { useCompareStore } from '@/store/useCompareStore';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/imageHelper';

export default function FloatingCompareBar() {
    const { items, removeItem, clearCompare } = useCompareStore();

    if (items.length === 0) return null;

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-4 border border-gray-200 dark:border-gray-700 z-50 w-[95%] max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                    <span className="font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap hidden md:block">
                        Compare ({items.length}/4)
                    </span>

                    <div className="flex gap-2">
                        {items.map((product) => (
                            <div key={product.id} className="relative group w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
                                <img
                                    src={getImageUrl(product.image)}
                                    alt={product.title}
                                    className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                />
                                <button
                                    onClick={() => removeItem(product.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}

                        {/* Placeholders */}
                        {Array.from({ length: 4 - items.length }).map((_, i) => (
                            <div key={i} className="w-12 h-12 md:w-16 md:h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400">
                                <span className="text-xs">{i + 1 + items.length}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                    <button
                        onClick={clearCompare}
                        className="text-sm text-gray-500 hover:text-red-500 underline hidden sm:block"
                    >
                        Clear
                    </button>
                    <Link
                        href={`/compare?ids=${items.map(i => i.id).join(',')}`}
                        className={`flex items-center gap-2 bg-cureza-green text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition ${items.length < 2 ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        Compare <span className="hidden sm:inline">Now</span> <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
