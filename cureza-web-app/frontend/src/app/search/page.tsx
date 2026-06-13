'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import ProductCard from '@/components/product/ProductCard';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import api from '@/lib/api';
import FloatingCompareBar from '@/components/FloatingCompareBar';
import { Filter, X, Search as SearchIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('category');

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const { toggleFilter } = useSearchFilters();

    useEffect(() => {
        // Fetch categories for sidebar
        api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `/products/search?search=${encodeURIComponent(query)}`;
                if (categoryFilter) {
                    url += `&category=${categoryFilter}`;
                }
                const response = await api.get(url);
                setProducts(response.data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchProducts();
        } else {
            api.get('/products').then(res => {
                setProducts(res.data);
                setLoading(false);
            });
        }
    }, [query, categoryFilter]);

    return (
        <div className="min-h-screen bg-[#F8F3EF] text-[#052326] flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-[#052326]">
                            {query ? `Results for "${query}"` : 'All Products'}
                        </h1>
                        <p className="text-[#052326]/60 text-xs mt-1">
                            {loading ? 'Searching...' : `${products.length} products found`}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-[10px] border border-[#052326]/12 shadow-sm text-xs font-semibold uppercase tracking-wider text-[#052326]"
                    >
                        <Filter size={14} /> Filters
                    </button>
                </div>

                <div className="flex gap-8 items-start">
                    {/* Sidebar Filters */}
                    <aside className="w-64 bg-white p-6 rounded-[12px] shadow-sm border border-[#052326]/12 hidden lg:block">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-[#052326]">
                            <Filter size={18} /> Filters
                        </h3>

                        <div className="mb-6">
                            <h4 className="font-bold mb-3 text-[10px] uppercase text-[#052326]/40 tracking-wider">Categories</h4>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:text-[#052326] transition-colors">
                                        <input
                                            type="checkbox"
                                            className="rounded border-[#052326]/20 text-[#052326] focus:ring-[#052326]/50"
                                            checked={categoryFilter === cat.id.toString()}
                                            onChange={() => toggleFilter('category', cat.id.toString())}
                                        />
                                        <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <h4 className="font-bold mb-3 text-[10px] uppercase text-[#052326]/40 tracking-wider">Price Range</h4>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="Min" className="w-20 border border-[#052326]/12 rounded-[8px] px-2 py-1 text-xs outline-none bg-white text-[#052326] focus:ring-2 focus:ring-[#052326]/20" />
                                <span className="text-gray-400 text-xs">-</span>
                                <input type="number" placeholder="Max" className="w-20 border border-[#052326]/12 rounded-[8px] px-2 py-1 text-xs outline-none bg-white text-[#052326] focus:ring-2 focus:ring-[#052326]/20" />
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Filters Overlay */}
                    {showFilters && (
                        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowFilters(false)}>
                            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-[#052326]">Filters</h3>
                                    <button onClick={() => setShowFilters(false)}><X /></button>
                                </div>
                                <div className="mb-6">
                                    <h4 className="font-bold mb-3 text-[10px] uppercase text-[#052326]/40 tracking-wider">Categories</h4>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={categoryFilter === cat.id.toString()}
                                                    onChange={() => toggleFilter('category', cat.id.toString())}
                                                    className="rounded border-[#052326]/20 text-[#052326] focus:ring-[#052326]/50"
                                                />
                                                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="flex-1">
                        {query.toLowerCase().includes('protein') && (
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                {['Muscle Gain', 'Weight Loss', 'Vegan', 'Whey'].map(chip => (
                                    <button key={chip} className="bg-white border border-[#052326]/12 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#052326] hover:bg-[#052326] hover:text-white transition-all whitespace-nowrap">
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex flex-col space-y-3">
                                        <Skeleton className="h-[250px] w-full rounded-[12px]" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#052326]/12 rounded-[12px] p-8">
                                <div className="w-16 h-16 bg-[#F8F3EF] rounded-full flex items-center justify-center mb-4 text-[#052326]/60">
                                    <SearchIcon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-[#052326] mb-2 font-serif">No results found</h3>
                                <p className="text-gray-500 text-xs max-w-sm mx-auto">
                                    We couldn't find any products matching "{query}". Try checking your spelling or use different keywords.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <FloatingCompareBar />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}
