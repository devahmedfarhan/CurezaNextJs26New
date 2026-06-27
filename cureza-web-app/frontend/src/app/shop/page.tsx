'use client';

import { useState, useEffect, Suspense } from 'react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';
import { SlidersHorizontal, ChevronDown, Check, X, ShieldAlert, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [concerns, setConcerns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');
  const [requireRx, setRequireRx] = useState<boolean | null>(null);

  // Mobile Filters Drawer
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state from query parameters on mount or when searchParams changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategories([cat]);
    } else {
      setSelectedCategories([]);
    }

    const con = searchParams.get('concern');
    if (con) {
      setSelectedConcerns([con]);
    } else {
      setSelectedConcerns([]);
    }

    const brand = searchParams.get('brand');
    if (brand) {
      setSelectedBrands([brand]);
    } else {
      setSelectedBrands([]);
    }

    const rx = searchParams.get('requireRx');
    if (rx === 'true') {
      setRequireRx(true);
    } else if (rx === 'false') {
      setRequireRx(false);
    } else {
      setRequireRx(null);
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch categories and concerns
    api.get('/categories')
      .then(res => {
        const all = res.data;
        setCategories(all.filter((c: any) => c.type === 'category'));
        setConcerns(all.filter((c: any) => c.type === 'concern'));
      })
      .catch(err => console.error('Failed to load categories/concerns:', err));

    // Fetch all products
    api.get('/products')
      .then(res => {
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
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filter and Sort Handler
  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        const catSlug = typeof p.category === 'object' ? p.category?.slug : p.category?.toLowerCase();
        if (selectedCategories.includes('ungrouped')) {
          const catGroup = p.category?.mega_menu_section;
          if (!catGroup || !['thc', 'cbd', 'herbal', 'supplements'].includes(catGroup)) {
            return true;
          }
        }
        return selectedCategories.includes(catSlug);
      });
    }

    // Concern Filter
    if (selectedConcerns.length > 0) {
      result = result.filter(p => {
        const conSlug = typeof p.concern === 'object' ? p.concern?.slug : p.concern?.toLowerCase();
        if (selectedConcerns.includes('ungrouped')) {
          const conGroup = p.concern?.mega_menu_section;
          if (!conGroup || !['mental', 'physical', 'general'].includes(conGroup)) {
            return true;
          }
        }
        return selectedConcerns.includes(conSlug);
      });
    }

    // Brand Filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => {
        const brandSlug = typeof p.brand === 'object' ? p.brand?.slug : p.brand?.toLowerCase();
        if (selectedBrands.includes('ungrouped')) {
          const brandGroup = p.brand?.mega_menu_section;
          if (!brandGroup || !['cannabis_hemp', 'ayurvedic_herbal', 'wellness_care'].includes(brandGroup)) {
            return true;
          }
        }
        return selectedBrands.includes(brandSlug);
      });
    }

    // Rx Prescription Filter
    if (requireRx !== null) {
      result = result.filter(p => !!p.is_prescription_required === requireRx);
    }

    // Price Limit Filter
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

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
  }, [selectedCategories, selectedConcerns, selectedBrands, maxPrice, minPrice, sortBy, requireRx, products]);

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const handleConcernToggle = (slug: string) => {
    setSelectedConcerns(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedConcerns([]);
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(5000);
    setRequireRx(null);
    setSortBy('default');
  };

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-6 md:px-12 lg:px-20">
      <div className="container mx-auto">
        
        {/* Page Header */}
        <div className="border-b border-[#052326]/10 pb-8 mb-10">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/60 uppercase block mb-3">
            Wellness Collection
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#052326]">
            {selectedCategories.includes('ungrouped') 
              ? 'Other Categories\' Products' 
              : selectedConcerns.includes('ungrouped') 
              ? 'Other Health Concerns\' Products' 
              : selectedBrands.includes('ungrouped') 
              ? 'Other Brands\' Products' 
              : 'Shop All Products'}
          </h1>
          <p className="text-sm md:text-base text-[#052326]/75 font-light mt-3 max-w-2xl leading-relaxed">
            Browse our full catalog of Ayurvedic formulas, organic hemp extracts, and doctor-approved recovery balms designed to target your specific wellness goals.
          </p>
        </div>

        {/* Filters and Search Controllers */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Active Filter Indicators */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-[#052326]/10 rounded-[10px] text-xs font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            
            {(selectedCategories.length > 0 || selectedConcerns.length > 0 || requireRx !== null || maxPrice < 5000) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#052326]/60 hover:text-[#052326] transition-colors border border-[#052326]/10 px-3 py-1.5 bg-white rounded-[8px]"
              >
                Clear All <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sorting Dropdown */}
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
          
          {/* DESKTOP SIDEBAR FILTERS PANEL (10-14px border radius cards) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white border border-[#052326]/10 rounded-[14px] p-6 shadow-premium-light">
            
            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] border-b border-[#052326]/10 pb-3 mb-3">
                Categories
              </h3>
              <div className="space-y-2 mt-2">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 text-xs font-medium text-[#052326]/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(c.slug)}
                      onChange={() => handleCategoryToggle(c.slug)}
                      className="rounded-[4px] border-[#052326]/20 text-[#052326] focus:ring-0 focus:ring-offset-0 accent-[#052326]"
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Concern Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] border-b border-[#052326]/10 pb-3 mb-3">
                Shop By Concern
              </h3>
              <div className="space-y-2 mt-2">
                {concerns.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 text-xs font-medium text-[#052326]/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedConcerns.includes(c.slug)}
                      onChange={() => handleConcernToggle(c.slug)}
                      className="rounded-[4px] border-[#052326]/20 text-[#052326] focus:ring-0 focus:ring-offset-0 accent-[#052326]"
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prescription Filter */}
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

          {/* CATALOG GRID */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="animate-spin text-[#2E7D32]" size={36} />
                <p className="text-xs font-bold uppercase tracking-wider text-[#052326]/50">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
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
                  Try adjusting or clearing your filters to search our full catalog.
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

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center gap-3 text-xs font-medium text-[#052326]/80">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(c.slug)}
                        onChange={() => handleCategoryToggle(c.slug)}
                        className="rounded-[4px] border-[#052326]/20 text-[#052326] accent-[#052326]"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] mb-3">By Concern</h3>
                <div className="space-y-2">
                  {concerns.map((c) => (
                    <label key={c.id} className="flex items-center gap-3 text-xs font-medium text-[#052326]/80">
                      <input
                        type="checkbox"
                        checked={selectedConcerns.includes(c.slug)}
                        onChange={() => handleConcernToggle(c.slug)}
                        className="rounded-[4px] border-[#052326]/20 text-[#052326] accent-[#052326]"
                      />
                      <span>{c.name}</span>
                    </label>
                  ))}
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-6 py-24 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#052326] border-t-transparent"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
