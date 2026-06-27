'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, ArrowRight, Sparkles, Grid } from 'lucide-react';
import { useCategories } from '@/contexts/CategoryContext';

interface Category {
    id: number;
    name: string;
    slug: string;
    type: 'category' | 'concern';
    image?: string;
    description?: string;
    is_active: boolean;
    products_count?: number;
}

export default function AllCategoriesPage() {
    const { categories, isLoading: loading } = useCategories();
    const [searchTerm, setSearchTerm] = useState('');

    const getImageUrl = (path?: string) => {
        if (!path) return '/fallback.png';
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-[#F8F3EF] min-h-screen pb-24 text-[#052326]">
            {/* Header section with warm tone and ambient shapes */}
            <div className="relative bg-white border-b border-[#052326]/5 overflow-hidden py-12 md:py-16">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#052326]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f0c417]/5 rounded-full blur-3xl" />
                
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052326]/10 border border-[#052326]/25 text-[10px] tracking-wider font-extrabold text-[#052326] uppercase mb-4">
                        <Sparkles size={12} className="animate-pulse" /> Explore Categories
                    </span>
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#052326] mb-4">
                        All Healing Formulations
                    </h1>
                    <p className="text-sm md:text-base text-[#052326]/70 max-w-xl mx-auto mb-8 font-light leading-relaxed">
                        Browse our complete selection of wellness formulations, clinically-assessed adaptogens, and pure organic supplements.
                    </p>

                    {/* Premium Search Input */}
                    <div className="max-w-md mx-auto relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#052326]/40 group-focus-within:text-[#052326] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#052326]/10 bg-[#F8F3EF]/50 backdrop-blur-md shadow-sm focus:border-[#052326] focus:ring-1 focus:ring-[#052326] outline-none font-medium text-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Grid display of category cards */}
            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-[#052326]/8 animate-pulse min-h-[220px]">
                                <div>
                                    {/* Icon / Image circle skeleton */}
                                    <div className="w-16 h-16 rounded-2xl bg-[#052326]/5 mb-5" />
                                    {/* Category Title skeleton */}
                                    <div className="h-5 bg-[#052326]/5 rounded w-1/2 mb-3" />
                                    {/* Description skeleton */}
                                    <div className="space-y-2 mb-4">
                                        <div className="h-3 bg-[#052326]/5 rounded w-full" />
                                        <div className="h-3 bg-[#052326]/5 rounded w-3/4" />
                                    </div>
                                </div>
                                {/* Footer row skeleton */}
                                <div className="flex justify-between items-center border-t border-[#052326]/5 pt-4 mt-auto">
                                    <div className="h-5 bg-[#052326]/5 rounded-full w-20" />
                                    <div className="h-4 bg-[#052326]/5 rounded w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#052326]/15 p-8 max-w-md mx-auto">
                        <span className="text-3xl mb-4 block">🍃</span>
                        <h3 className="text-base font-semibold text-[#052326]">No Categories Found</h3>
                        <p className="text-xs text-[#052326]/60 mt-1 max-w-xs mx-auto">
                            Try search with another term or view our full catalog.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCategories.map((c) => (
                            <Link
                                key={c.id}
                                href={`/category/${c.slug}`}
                                className="group bg-white rounded-2xl p-6 flex flex-col justify-between border border-[#052326]/8 hover:border-[#052326]/20 hover:shadow-[0_12px_30px_rgba(5,35,38,0.05)] transition-all duration-300 transform hover:-translate-y-1 min-h-[220px]"
                            >
                                <div>
                                    {/* Icon / Image circle */}
                                    <div className="w-16 h-16 rounded-2xl bg-[#F8F3EF] border border-[#052326]/5 overflow-hidden flex items-center justify-center p-1.5 mb-5 group-hover:scale-105 transition-all duration-500">
                                        <img
                                            src={getImageUrl(c.image)}
                                            alt={c.name}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    </div>

                                    {/* Category Title */}
                                    <h3 className="text-base font-bold text-[#052326] group-hover:text-[#052326] transition-colors leading-tight mb-2">
                                        {c.name}
                                    </h3>

                                    {/* Short Description */}
                                    {c.description && (
                                        <p className="text-xs text-[#052326]/60 line-clamp-2 leading-relaxed mb-4">
                                            {c.description}
                                        </p>
                                    )}
                                </div>

                                {/* Footer link row */}
                                <div className="flex justify-between items-center border-t border-[#052326]/5 pt-4 mt-auto">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#052326] bg-[#052326]/5 px-2.5 py-1 rounded-full">
                                        {c.products_count ?? 0} Products
                                    </span>
                                    <span className="text-xs font-bold text-[#052326]/50 group-hover:text-[#052326] flex items-center gap-1 transition-colors">
                                        Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
