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
            // If no query, maybe fetch all or show empty state?
            // Let's default to fetching latest if empty query
            api.get('/products').then(res => {
                setProducts(res.data);
                setLoading(false);
            });
        }
    }, [query, categoryFilter]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">


            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {query ? `Results for "${query}"` : 'All Products'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {loading ? 'Searching...' : `${products.length} products found`}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm"
                    >
                        <Filter size={18} /> Filters
                    </button>
                </div>

                <div className="flex gap-8 items-start">
                    {/* Sidebar Filters */}
                    <aside className={`fined w-64 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hidden lg:block`}>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Filter size={20} /> Filters
                        </h3>

                        <div className="mb-6">
                            <h4 className="font-semibold mb-3 text-sm uppercase text-gray-400 tracking-wider">Categories</h4>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:text-cureza-green transition-colors">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green"
                                            checked={categoryFilter === cat.id.toString()}
                                            onChange={() => toggleFilter('category', cat.id.toString())}
                                        />
                                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range - Placeholder UI */}
                        <div className="mb-6">
                            <h4 className="font-semibold mb-3 text-sm uppercase text-gray-400 tracking-wider">Price Range</h4>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="Min" className="w-20 border rounded px-2 py-1 text-sm" />
                                <span>-</span>
                                <input type="number" placeholder="Max" className="w-20 border rounded px-2 py-1 text-sm" />
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Filters Overlay */}
                    {showFilters && (
                        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowFilters(false)}>
                            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg">Filters</h3>
                                    <button onClick={() => setShowFilters(false)}><X /></button>
                                </div>
                                {/* Mobile Sidebar Content same as above */}
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3 text-sm uppercase text-gray-400 tracking-wider">Categories</h4>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={categoryFilter === cat.id.toString()}
                                                    onChange={() => toggleFilter('category', cat.id.toString())}
                                                />
                                                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Related 'Chips' Logic Placeholder */}
                        {query.toLowerCase().includes('protein') && (
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                {['Muscle Gain', 'Weight Loss', 'Vegan', 'Whey'].map(chip => (
                                    <button key={chip} className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-cureza-green hover:text-white transition-colors whitespace-nowrap">
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex flex-col space-y-3">
                                        <Skeleton className="h-[250px] w-full rounded-xl" />
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
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                    <SearchIcon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
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
