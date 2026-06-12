'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/api';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';

export default function AllBrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchBrands();
    }, [page, search]);

    const fetchBrands = async () => {
        try {
            const res = await axios.get(`/brands?page=${page}&search=${search}`);
            if (page === 1) {
                setBrands(res.data.data);
            } else {
                setBrands(prev => [...prev, ...res.data.data]);
            }
            setHasMore(res.data.current_page < res.data.last_page);
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
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-4 py-8 md:py-12 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Our Brands
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto mb-8 text-lg">
                        Explore our curated collection of premium wellness brands.
                    </p>

                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full h-12 pl-12 pr-4 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-black/5 focus:border-gray-300 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-4 py-12">
                {loading && page === 1 ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No brands found matching "{search}"
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/brand/${brand.slug}`}
                                className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all group border border-gray-100 hover:border-gray-200 aspect-square"
                            >
                                <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
                                    <img
                                        src={getLogoUrl(brand.logo)}
                                        alt={brand.name}
                                        className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-black transition-colors">{brand.name}</h3>
                                {brand.products_count !== undefined && (
                                    <span className="text-xs text-gray-400 mt-1">{brand.products_count} Products</span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="text-center mt-12">
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
