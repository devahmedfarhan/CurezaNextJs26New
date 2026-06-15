'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import axios from 'axios';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  categorySlug?: string;
  concernSlug?: string;
  tagSlug?: string;
  brandSlug?: string;
  collectionSlug?: string;
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
  collectionSlug,
  limit = 8,
  viewAllLink,
  layout = 'grid',
  columns = 4,
  showBrand = true,
  showRating = true,
  showTagBadge = true,
  products: initialProducts,
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
        if (collectionSlug) params.collection = collectionSlug;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
        const url = `${backendUrl}/api/products`;
        
        const response = await axios.get(url, { params });
        const data = response.data;
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
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
  }, [categorySlug, concernSlug, tagSlug, brandSlug, collectionSlug, limit, initialProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const getGridCols = () => {
    switch (columns) {
      case 3: return 'lg:grid-cols-3';
      case 4: return 'lg:grid-cols-4';
      case 5: return 'lg:grid-cols-5';
      default: return 'lg:grid-cols-4';
    }
  };

  if (!loading && products.length === 0) {
    return null; // Don't render empty sections
  }

  return (
    <section className="py-16 bg-transparent text-[#052326]">
      <div className="container mx-auto px-6">
        
        {/* Premium Header Layout */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-[#052326]/10 gap-6">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/50 uppercase block mb-2">
              Curated Catalog
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-[#052326]/75 font-light mt-2 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Controls / View All */}
          {layout === 'grid' && viewAllLink && (
            <Link
              href={viewAllLink}
              className="group inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#052326] border border-[#052326]/20 px-5 py-2.5 rounded-[10px] bg-white hover:bg-[#052326] hover:text-[#F8F3EF] transition-all self-start sm:self-end shadow-sm"
            >
              View All Products
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {layout === 'carousel' && (
            <div className="flex gap-2 self-start sm:self-end">
              <button
                onClick={() => scroll('left')}
                className="w-11 h-11 rounded-[10px] bg-white hover:bg-[#052326] hover:text-[#F8F3EF] text-[#052326] border border-[#052326]/10 flex items-center justify-center transition-all shadow-sm"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-11 h-11 rounded-[10px] bg-white hover:bg-[#052326] hover:text-[#F8F3EF] text-[#052326] border border-[#052326]/10 flex items-center justify-center transition-all shadow-sm"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Product Cards Layout */}
        {loading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${getGridCols()} gap-8`}>
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-[#052326]/10 rounded-[14px] p-4 flex flex-col justify-between h-[420px]">
                <div className="rounded-[10px] bg-[#052326]/5 aspect-[4/5] w-full" />
                <div className="space-y-3 mt-4 flex-1">
                  <div className="h-3.5 bg-[#052326]/5 rounded w-1/3" />
                  <div className="h-4 bg-[#052326]/5 rounded w-3/4" />
                  <div className="h-3 bg-[#052326]/5 rounded w-full" />
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#052326]/5">
                  <div className="h-6 bg-[#052326]/5 rounded w-1/4" />
                  <div className="h-10 bg-[#052326]/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : layout === 'grid' ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${getGridCols()} gap-8`}>
            {products.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-none -mx-4 px-4 md:mx-0 md:px-0"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[260px] md:min-w-[300px] snap-start h-[450px]"
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
