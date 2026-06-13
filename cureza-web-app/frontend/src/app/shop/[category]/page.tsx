'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';
import { ShieldAlert, X, SlidersHorizontal } from 'lucide-react';

interface APIProduct {
  id: number;
  title: string;
  brand: any;
  price: string;
  original_price: string;
  rating: string;
  reviews: number;
  image: string;
  tag: string;
  description: string;
  slug: string;
  category: any;
  concern?: any;
  is_prescription_required?: boolean;
  images?: string[];
  tags?: any[];
}

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  
  // Filters
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('default');
  const [requireRx, setRequireRx] = useState<boolean | null>(null);

  // Mobile Filters Drawer
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (categorySlug) {
      fetchProducts();
    }
  }, [categorySlug]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?category=${categorySlug}`);
      const mappedProducts = res.data.map((p: APIProduct) => ({
        id: p.id,
        title: p.title,
        brand: p.brand,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        rating: Number(p.rating || 4.5),
        reviews: p.reviews || 0,
        image: p.image,
        images: p.images,
        tag: p.tag,
        tags: p.tags,
        slug: p.slug,
        category: p.category,
        concern: p.concern,
        description: p.description,
        is_prescription_required: p.is_prescription_required
      }));
      setProducts(mappedProducts);
      setFilteredProducts(mappedProducts);

      if (mappedProducts.length > 0 && mappedProducts[0].category) {
        setCategoryName(typeof mappedProducts[0].category === 'object' ? mappedProducts[0].category.name : mappedProducts[0].category);
      } else {
        setCategoryName(categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      }
    } catch (error) {
      console.error('Failed to fetch category products', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and Sort Handler
  useEffect(() => {
    let result = [...products];

    // Rx Prescription Filter
    if (requireRx !== null) {
      result = result.filter(p => !!p.is_prescription_required === requireRx);
    }

    // Price Limit Filter
    result = result.filter(p => p.price <= maxPrice);

    // Sorting Options
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredProducts(result);
  }, [maxPrice, sortBy, requireRx, products]);

  const clearFilters = () => {
    setMaxPrice(5000);
    setRequireRx(null);
    setSortBy('default');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-24 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#052326] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-6 md:px-12 lg:px-20">
      <div className="container mx-auto">
        
        {/* Breadcrumbs & Title */}
        <div className="border-b border-[#052326]/10 pb-8 mb-10">
          <div className="text-xs text-[#052326]/50 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-bold">
            <a href="/" className="hover:text-[#052326] transition-colors">Home</a>
            <span>/</span>
            <a href="/shop" className="hover:text-[#052326] transition-colors">Shop</a>
            <span>/</span>
            <span className="text-[#052326]">{categoryName}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#052326]">
            {categoryName}
          </h1>
          <p className="text-sm text-[#052326]/75 font-light mt-3 max-w-xl">
            Explore premium wellness formulations, organic extracts, and remedies targeting concerns in the {categoryName} catalog.
          </p>
        </div>

        {/* Controllers */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-[#052326]/10 rounded-[10px] text-xs font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            
            {(requireRx !== null || maxPrice < 5000) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#052326]/60 hover:text-[#052326] transition-colors border border-[#052326]/10 px-3 py-1.5 bg-white rounded-[8px]"
              >
                Clear All <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="relative flex items-center gap-2 ml-auto">
            <span className="text-xs font-bold text-[#052326]/50 uppercase tracking-wider">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#052326]/10 text-xs font-semibold px-4 py-2.5 rounded-[10px] outline-none cursor-pointer focus:border-[#052326] transition-colors"
            >
              <option value="default">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Core Layout split: Sidebar + Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* SIDEBAR FILTERS */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white border border-[#052326]/10 rounded-[14px] p-6 shadow-premium-light">
            
            {/* Consultation Requirement Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] border-b border-[#052326]/10 pb-3 mb-3">
                Consultation Type
              </h3>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-3 text-xs font-medium text-[#052326]/80 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="rx-filter"
                    checked={requireRx === null}
                    onChange={() => setRequireRx(null)}
                    className="accent-[#052326]"
                  />
                  <span>Show All Products</span>
                </label>
                <label className="flex items-center gap-3 text-xs font-medium text-[#052326]/80 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="rx-filter"
                    checked={requireRx === true}
                    onChange={() => setRequireRx(true)}
                    className="accent-[#052326]"
                  />
                  <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-[#D32F2F]" /> Requires Prescription</span>
                </label>
                <label className="flex items-center gap-3 text-xs font-medium text-[#052326]/80 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="rx-filter"
                    checked={requireRx === false}
                    onChange={() => setRequireRx(false)}
                    className="accent-[#052326]"
                  />
                  <span>OTC (No Prescription)</span>
                </label>
              </div>
            </div>

            {/* Price Limit Slider */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] border-b border-[#052326]/10 pb-3 mb-3">
                Price Range
              </h3>
              <div className="mt-4 px-2">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#052326] h-1.5 bg-[#052326]/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between items-center text-xs text-[#052326]/60 mt-3 font-semibold">
                  <span>₹0</span>
                  <span className="text-[#052326] bg-[#052326]/5 px-2 py-1 rounded-md border border-[#052326]/5">Up to ₹{maxPrice}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* PRODUCT CATALOG */}
          <main className="lg:col-span-9">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="h-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[14px] border border-dashed border-[#052326]/15 p-8 flex flex-col items-center justify-center">
                <span className="text-3xl mb-4">🍃</span>
                <h3 className="text-lg font-semibold text-[#052326]">No Products Found</h3>
                <p className="text-xs md:text-sm text-[#052326]/60 mt-2 max-w-sm font-light">
                  No products in the {categoryName} collection matched your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-2.5 bg-[#052326] text-[#F8F3EF] text-xs font-bold uppercase tracking-wider rounded-[10px] hover:bg-[#052326]/90 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>

        </div>

      </div>

      {/* MOBILE FILTERS DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/40 backdrop-blur-sm">
          <div className="w-[300px] bg-white h-full p-6 flex flex-col justify-between shadow-2xl relative border-r border-[#052326]/10">
            <button 
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-[#052326]" />
            </button>

            <div className="overflow-y-auto space-y-6 pr-2 mt-8">
              <h2 className="text-lg font-semibold uppercase tracking-wider border-b border-[#052326]/10 pb-4">Filters</h2>

              {/* Consultation type */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-3">Consultation Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-xs font-medium text-[#052326]/80">
                    <input
                      type="radio"
                      name="rx-filter-mobile"
                      checked={requireRx === null}
                      onChange={() => setRequireRx(null)}
                      className="accent-[#052326]"
                    />
                    <span>All Products</span>
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-[#052326]/80">
                    <input
                      type="radio"
                      name="rx-filter-mobile"
                      checked={requireRx === true}
                      onChange={() => setRequireRx(true)}
                      className="accent-[#052326]"
                    />
                    <span>Prescription (Rx) Required</span>
                  </label>
                  <label className="flex items-center gap-3 text-xs font-medium text-[#052326]/80">
                    <input
                      type="radio"
                      name="rx-filter-mobile"
                      checked={requireRx === false}
                      onChange={() => setRequireRx(false)}
                      className="accent-[#052326]"
                    />
                    <span>Over The Counter (OTC)</span>
                  </label>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-3">Price Limit</h3>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#052326]"
                />
                <div className="flex justify-between items-center text-xs text-[#052326]/60 mt-2">
                  <span>₹0</span>
                  <span className="font-bold">Up to ₹{maxPrice}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#052326]/10 pt-4 mt-6 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 text-xs font-semibold border border-[#052326]/20 rounded-[10px] text-center"
              >
                Clear
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 text-xs font-semibold bg-[#052326] text-white rounded-[10px] text-center"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
