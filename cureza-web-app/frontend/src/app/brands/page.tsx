'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/api';
import Link from 'next/link';
import { Search, Loader2, ArrowRight, Sparkles, Award } from 'lucide-react';

export default function AllBrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        fetchBrands();
    }, [page, search]);

    const fetchBrands = async () => {
        try {
            const res = await axios.get(`/brands?page=${page}&search=${search}&all=true`);
            const fetchedData = res.data.data || res.data;
            if (page === 1) {
                setBrands(fetchedData);
            } else {
                setBrands(prev => [...prev, ...fetchedData]);
            }
            if (res.data.current_page && res.data.last_page) {
                setHasMore(res.data.current_page < res.data.last_page);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: any) => {
        setSearch(e.target.value);
        setPage(1);
        setLoading(true);
    };

    const getLogoUrl = (path: string | null) => {
        if (!path) return '/fallback.png';
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    return (
        <div className="bg-[#F8F3EF] min-h-screen pb-24 text-[#052326]">
            {/* Header section with warm tone and ambient shapes */}
            <div className="relative bg-white border-b border-[#052326]/5 overflow-hidden py-12 md:py-16">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#052326]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f0c417]/5 rounded-full blur-3xl" />
                
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0c417]/10 border border-[#f0c417]/25 text-[10px] tracking-wider font-extrabold text-[#9A7D0A] uppercase mb-4">
                        <Award size={12} className="animate-pulse" /> Verified Partners
                    </span>
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#052326] mb-4">
                        Our Premium Brands
                    </h1>
                    <p className="text-sm md:text-base text-[#052326]/70 max-w-xl mx-auto mb-8 font-light leading-relaxed">
                        Discover safety-validated cultivators and laboratories practicing organic, sustainable farming and safety standards.
                    </p>

                    {/* Premium Search Input */}
                    <div className="max-w-md mx-auto relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#052326]/40 group-focus-within:text-[#052326] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#052326]/10 bg-[#F8F3EF]/50 backdrop-blur-md shadow-sm focus:border-[#052326] focus:ring-1 focus:ring-[#052326] outline-none font-medium text-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Grid display of brand cards */}
            <div className="container mx-auto px-6 py-12">
                {loading && page === 1 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="animate-spin text-[#052326]" size={36} />
                        <p className="text-xs font-bold uppercase tracking-wider text-[#052326]/50">Loading brands...</p>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#052326]/15 p-8 max-w-md mx-auto">
                        <span className="text-3xl mb-4 block">🍃</span>
                        <h3 className="text-base font-semibold text-[#052326]">No Brands Found</h3>
                        <p className="text-xs text-[#052326]/60 mt-1 max-w-xs mx-auto">
                            Try searching with another term or explore our full catalog.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/brand/${brand.slug}`}
                                className="group bg-white rounded-2xl p-6 flex flex-col justify-between border border-[#052326]/8 hover:border-[#052326]/20 hover:shadow-[0_12px_30px_rgba(5,35,38,0.05)] transition-all duration-300 transform hover:-translate-y-1 min-h-[220px]"
                            >
                                <div>
                                    {/* Icon / Logo circle */}
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#052326]/8 overflow-hidden flex items-center justify-center p-2.5 mb-5 group-hover:scale-105 transition-all duration-500 shadow-sm">
                                        <img
                                            src={getLogoUrl(brand.logo)}
                                            alt={brand.name}
                                            className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                                        />
                                    </div>

                                    {/* Brand Title */}
                                    <h3 className="text-base font-bold text-[#052326] group-hover:text-[#052326] transition-colors leading-tight mb-2">
                                        {brand.name}
                                    </h3>

                                    {/* Short Description */}
                                    {brand.short_description && (
                                        <p className="text-xs text-[#052326]/60 line-clamp-2 leading-relaxed mb-4">
                                            {brand.short_description}
                                        </p>
                                    )}
                                </div>

                                {/* Footer link row */}
                                <div className="flex justify-between items-center border-t border-[#052326]/5 pt-4 mt-auto">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#052326] bg-[#052326]/5 px-2.5 py-1 rounded-full">
                                        {brand.products_count !== undefined ? `${brand.products_count} Products` : 'Explore Store'}
                                    </span>
                                    <span className="text-xs font-bold text-[#052326]/50 group-hover:text-[#052326] flex items-center gap-1 transition-colors">
                                        Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="text-center mt-12">
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-2.5 bg-white border border-[#052326]/10 text-xs font-extrabold uppercase tracking-wider rounded-full hover:bg-gray-50 transition-all shadow-sm text-[#052326] hover:border-[#052326]"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
