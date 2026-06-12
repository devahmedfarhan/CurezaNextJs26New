'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';

interface ProductGridProps {
    title: string;
    subtitle?: string;
    categorySlug?: string;
    concernSlug?: string;
    tagSlug?: string;
    brandSlug?: string;
    limit?: number;
    viewAllLink?: string;
    layout?: 'grid' | 'carousel';
    columns?: number;
    showBrand?: boolean;
    showRating?: boolean;
    showTagBadge?: boolean;
    products?: any[]; // Allow passing products directly
}

export default function ProductGrid({
    title,
    subtitle,
    categorySlug,
    concernSlug,
    tagSlug,
    brandSlug,
    limit = 8,
    viewAllLink,
    layout = 'grid',
    columns = 4,
    showBrand = true,
    showRating = true,
    showTagBadge = true,
    products: initialProducts, // Destructure
}: ProductGridProps) {
    const [products, setProducts] = useState<any[]>(initialProducts || []);
    const [loading, setLoading] = useState(!initialProducts);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialProducts) {
            setProducts(initialProducts);
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {

            setLoading(true);
            try {
                const params: any = { limit };
                if (categorySlug) params.category = categorySlug;
                if (concernSlug) params.concern = concernSlug;
                if (tagSlug) params.tag = tagSlug;
                if (brandSlug) params.brand = brandSlug;

                // Construct URL manually to ensure correct endpoint
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
                const url = `${backendUrl}/api/products`;
                console.log('Fetching products from:', url, 'Params:', params);

                const response = await axios.get(url, { params });
                console.log('API Response:', response.data);

                // Handle different response structures (pagination vs array)
                const data = response.data;
                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (data.data && Array.isArray(data.data)) {
                    setProducts(data.data);
                } else {
                    console.warn('Unexpected API response structure:', data);
                    setProducts([]);
                }
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug, concernSlug, tagSlug, brandSlug, limit, initialProducts]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = current.clientWidth * 0.8; // Scroll 80% of container width
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    // Determine grid columns class
    const getGridCols = () => {
        switch (columns) {
            case 3: return 'lg:grid-cols-3';
            case 4: return 'lg:grid-cols-4';
            case 5: return 'lg:grid-cols-5';
            default: return 'lg:grid-cols-4';
        }
    };

    if (!loading && products.length === 0) {
        console.log('No products found for:', title);
        return null; // Don't render empty sections
    }

    return (
        <section className="py-14">
            <div className="container mx-auto px-4">

                {/* Premium Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-gray-900 dark:text-white">
                            {title}
                        </h2>

                        {subtitle && (
                            <p className="mt-1 text-[15px] md:text-[16px] text-gray-500 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {layout === "grid" && viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="group flex items-center text-cureza-green font-semibold text-[15px]"
                        >
                            View All
                            <ArrowRight className="w-4 h-4 ml-1 transition-all group-hover:translate-x-1" />
                        </Link>
                    )}

                    {layout === "carousel" && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll("left")}
                                className="p-2 rounded-full backdrop-blur bg-white/70 border shadow-sm hover:bg-white transition-all"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                className="p-2 rounded-full backdrop-blur bg-white/70 border shadow-sm hover:bg-white transition-all"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                {loading ? (
                    // Premium Skeleton
                    <div className={`grid grid-cols-2 md:grid-cols-3 ${getGridCols()} gap-7`}>
                        {Array.from({ length: limit }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="rounded-2xl bg-gray-200 dark:bg-gray-700 aspect-[4/5]" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 mt-3 w-3/4 rounded" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 mt-2 w-1/2 rounded" />
                            </div>
                        ))}
                    </div>
                ) : layout === "grid" ? (
                    // Premium Grid Layout
                    <div className={`grid grid-cols-2 md:grid-cols-3 ${getGridCols()} gap-7`}>
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Premium Carousel
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                    >
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="min-w-[240px] md:min-w-[280px] snap-start rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>

    );
}
