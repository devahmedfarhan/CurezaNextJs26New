'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { getRecentlyViewedProducts } from '@/lib/api/products';
import { Eye, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Slider from '@/components/common/Slider';

export default function RecentlyViewedPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentProducts = async () => {
            setLoading(true);
            try {
                const data = await getRecentlyViewedProducts();
                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (data && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Failed to fetch recently viewed products", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentProducts();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#052326] dark:text-gray-100 tracking-tight flex items-center gap-2">
                        <Eye className="text-[#052326] dark:text-gray-100" size={20} />
                        Recently Viewed
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Browse the products you have recently viewed on Cureza.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[250px] w-full rounded-[8px]" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4 rounded" />
                                <Skeleton className="h-4 w-1/2 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <>
                    {/* Mobile/Tablet view */}
                    <div className="block lg:hidden">
                        {products.length > 4 ? (
                            <Slider>
                                {products.map((product) => (
                                    <div key={product.id} className="w-[260px]">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </Slider>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop view (always standard grid) */}
                    <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[8px] border border-[#555555]/18 shadow-none max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-[#052326]/5 rounded-[8px] flex items-center justify-center mx-auto mb-6 text-[#052326]">
                        <Eye size={28} />
                    </div>
                    <h2 className="text-sm font-semibold text-[#052326] dark:text-gray-200 mb-2">No recently viewed products</h2>
                    <p className="text-xs text-gray-500 mb-8 max-w-sm mx-auto">
                        Explore our store and check out our health and wellness products.
                    </p>
                    <Link
                        href="/shop"
                        className="px-6 py-2.5 rounded-[8px] bg-[#052326] text-white hover:bg-[#0b4435] transition-all text-xs font-semibold shadow-none inline-flex items-center gap-2"
                    >
                        <ShoppingBag size={14} /> Start Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}
