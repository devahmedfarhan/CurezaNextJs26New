'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, Loader2, ArrowRight, Sparkles, HeartPulse } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    type: 'category' | 'concern';
    image?: string;
    description?: string;
    is_active: boolean;
    concern_products_count?: number;
}

export default function AllConcernsPage() {
    const [concerns, setConcerns] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.get('/categories?all=true')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setConcerns(res.data.filter((c: Category) => c.type === 'concern'));
                }
            })
            .catch(err => console.error('Failed to load concerns:', err))
            .finally(() => setLoading(false));
    }, []);

    const getImageUrl = (path?: string) => {
        if (!path) return '/fallback.png';
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    const filteredConcerns = concerns.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-[#F8F3EF] min-h-screen pb-24 text-[#052326]">
            {/* Header section with warm tone and ambient shapes */}
            <div className="relative bg-white border-b border-[#052326]/5 overflow-hidden py-12 md:py-16">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#2E7D32]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f0c417]/5 rounded-full blur-3xl" />
                
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/25 text-[10px] tracking-wider font-extrabold text-emerald-700 uppercase mb-4">
                        <HeartPulse size={12} className="animate-pulse text-emerald-600" /> Shop By Concern
                    </span>
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#052326] mb-4">
                        Targeted Wellness Concerns
                    </h1>
                    <p className="text-sm md:text-base text-[#052326]/70 max-w-xl mx-auto mb-8 font-light leading-relaxed">
                        Find organic formulations, ancient Ayurvedic solutions, and safety-validated options matching your specific health requirements.
                    </p>

                    {/* Premium Search Input */}
                    <div className="max-w-md mx-auto relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#052326]/40 group-focus-within:text-[#2E7D32] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search health concerns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#052326]/10 bg-[#F8F3EF]/50 backdrop-blur-md shadow-sm focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D32] outline-none font-medium text-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Grid display of concern cards */}
            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="animate-spin text-[#2E7D32]" size={36} />
                        <p className="text-xs font-bold uppercase tracking-wider text-[#052326]/50">Loading concerns...</p>
                    </div>
                ) : filteredConcerns.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#052326]/15 p-8 max-w-md mx-auto">
                        <span className="text-3xl mb-4 block">🍃</span>
                        <h3 className="text-base font-semibold text-[#052326]">No Concerns Found</h3>
                        <p className="text-xs text-[#052326]/60 mt-1 max-w-xs mx-auto">
                            Try searching with another term or explore our full catalog.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredConcerns.map((c) => (
                            <Link
                                key={c.id}
                                href={`/concern/${c.slug}`}
                                className="group bg-white rounded-2xl p-6 flex flex-col justify-between border border-[#052326]/8 hover:border-[#2E7D32]/20 hover:shadow-[0_12px_30px_rgba(5,35,38,0.05)] transition-all duration-300 transform hover:-translate-y-1 min-h-[220px]"
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

                                    {/* Concern Title */}
                                    <h3 className="text-base font-bold text-[#052326] group-hover:text-[#2E7D32] transition-colors leading-tight mb-2">
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
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                        {c.concern_products_count ?? 0} Products
                                    </span>
                                    <span className="text-xs font-bold text-[#052326]/50 group-hover:text-[#2E7D32] flex items-center gap-1 transition-colors">
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
