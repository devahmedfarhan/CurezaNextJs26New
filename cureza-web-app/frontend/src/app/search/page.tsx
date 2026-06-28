'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import ProductCard from '@/components/product/ProductCard';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import api from '@/lib/api';
import { 
    Filter, X, Search as SearchIcon, ChevronLeft, ChevronRight, 
    Copy, Check, Ticket, Sparkles, ArrowRight, ShoppingBag 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const categoryFilter = searchParams.get('category') || '';

    const { toggleFilter } = useSearchFilters();
    const { summary } = useCart();
    const { showToast } = useToast();

    // Products & Categories state
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Dynamic brand filter states
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

    // Price filter states
    const [minPriceInput, setMinPriceInput] = useState('');
    const [maxPriceInput, setMaxPriceInput] = useState('');
    const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
    const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

    // Sorting state
    const [sortBy, setSortBy] = useState('relevance');

    // Coupons state
    const [coupons, setCoupons] = useState<any[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Recommendations state
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [recsLoading, setRecsLoading] = useState(true);

    // Horizontal Carousel drag/scroll references
    const recSliderRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const fallbackCoupons = [
        { code: 'LAUNCH10', title: '10% Off Sitewide', description: 'Flat 10% off for platform launch' },
        { code: 'UPI5', title: '5% Extra UPI Off', description: 'Get extra 5% off via UPI checkout' },
        { code: 'HDFCWELNESS', title: '10% HDFC Card Off', description: 'Min. purchase ₹1,499. Max ₹500' }
    ];

    const fallbackProducts = [
        {
            id: 991,
            title: 'Cureza Organic Triphala Colon Cleanse',
            slug: 'cureza-organic-triphala-colon-cleanse-detox',
            price: 449.00,
            original_price: 599.00,
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
            short_description: 'Standardized Ayurvedic extracts of Amla, Haritaki, and Bibhitaki for gentle colon cleanse.',
            category: { name: 'Ayurveda', slug: 'ayurveda' },
            rating: '4.8',
            reviews_count: 34
        },
        {
            id: 992,
            title: 'Cureza Neem Blood Purifier & Skin Detox',
            slug: 'cureza-neem-blood-purifier-skin-detox',
            price: 379.00,
            original_price: 499.00,
            image: 'https://images.unsplash.com/photo-1607619056574-7b8f304f3c6f?auto=format&fit=crop&q=80&w=600',
            short_description: 'Natural neem blood purifying capsules to purge toxins and support clear skin.',
            category: { name: 'Ayurveda', slug: 'ayurveda' },
            rating: '4.7',
            reviews_count: 28
        },
        {
            id: 993,
            title: 'Cureza Liver Care & Kidney Detox Syrup',
            slug: 'cureza-liver-care-kidney-detox-syrup',
            price: 549.00,
            original_price: 699.00,
            image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600',
            short_description: 'Synergistic herbal syrup designed to support optimal liver and kidney health.',
            category: { name: 'Ayurveda', slug: 'ayurveda' },
            rating: '4.9',
            reviews_count: 42
        }
    ];

    // Fetch static categories & coupons & recommendations on mount
    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
        api.get('/coupons').then(res => setCoupons(res.data)).catch(console.error);

        api.get('/products?limit=6')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setRecommendations(res.data);
                } else {
                    setRecommendations(fallbackProducts);
                }
            })
            .catch(() => setRecommendations(fallbackProducts))
            .finally(() => setRecsLoading(false));
    }, []);

    // Fetch search products based on category slug & search query
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

        if (query || categoryFilter) {
            fetchProducts();
        } else {
            api.get('/products').then(res => {
                setProducts(res.data);
                setLoading(false);
            });
        }
    }, [query, categoryFilter]);

    // Handle horizontal scroll update for recommended items
    const updateScrollButtons = () => {
        if (recSliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = recSliderRef.current;
            setCanScrollLeft(scrollLeft > 2);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
        }
    };

    useEffect(() => {
        updateScrollButtons();
    }, [recommendations]);

    const handleScroll = () => {
        updateScrollButtons();
    };

    const slide = (direction: 'left' | 'right') => {
        if (recSliderRef.current) {
            const { scrollLeft, clientWidth } = recSliderRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth * 0.75
                : scrollLeft + clientWidth * 0.75;
            recSliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    // Extract unique brands dynamically from products matching category/query
    const availableBrands = Array.from(
        new Set(
            products.map(p => typeof p.brand === 'object' ? p.brand?.name : p.brand).filter(Boolean)
        )
    ) as string[];

    // Handle Brand Filter Toggles
    const toggleBrand = (brandName: string) => {
        if (selectedBrands.includes(brandName)) {
            setSelectedBrands(selectedBrands.filter(b => b !== brandName));
        } else {
            setSelectedBrands([...selectedBrands, brandName]);
        }
    };

    // Apply Price Filters
    const handlePriceApply = (e: React.FormEvent) => {
        e.preventDefault();
        const minVal = minPriceInput ? parseFloat(minPriceInput) : null;
        const maxVal = maxPriceInput ? parseFloat(maxPriceInput) : null;
        setMinPriceFilter(minVal);
        setMaxPriceFilter(maxVal);
    };

    // Clear Price Filters
    const clearPriceFilter = () => {
        setMinPriceInput('');
        setMaxPriceInput('');
        setMinPriceFilter(null);
        setMaxPriceFilter(null);
    };

    // Clear All Filters
    const clearAllFilters = () => {
        setSelectedBrands([]);
        clearPriceFilter();
        if (categoryFilter) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    // Copy Promo Codes
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showToast(`Promo code "${code}" copied!`, "success");
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Filter & Sort Products client-side
    let displayedProducts = [...products];

    if (selectedBrands.length > 0) {
        displayedProducts = displayedProducts.filter(p => {
            const b = typeof p.brand === 'object' ? p.brand?.name : p.brand;
            return selectedBrands.includes(b);
        });
    }

    if (minPriceFilter !== null) {
        displayedProducts = displayedProducts.filter(p => p.price >= minPriceFilter);
    }
    if (maxPriceFilter !== null) {
        displayedProducts = displayedProducts.filter(p => p.price <= maxPriceFilter);
    }

    if (sortBy === 'price-low') {
        displayedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        displayedProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        displayedProducts.sort((a, b) => parseFloat(b.rating || '4.5') - parseFloat(a.rating || '4.5'));
    } else if (sortBy === 'bestseller') {
        displayedProducts.sort((a, b) => (b.bought_last_month || 0) - (a.bought_last_month || 0));
    }

    const activeCoupons = coupons.length > 0 ? coupons : fallbackCoupons;
    const cartSubtotal = summary?.subtotal || 0;
    const freeShippingThreshold = 999;
    const progressPercent = Math.min((cartSubtotal / freeShippingThreshold) * 100, 100);
    const amountToFreeShipping = Math.max(freeShippingThreshold - cartSubtotal, 0);

    const premiumCardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none'
    };

    return (
        <div className="min-h-screen bg-[#F8F3EF] text-[#052326] flex flex-col font-sans">
            
            {/* Top Promo & Dynamic Free Shipping Banner */}
            <div className="bg-[#052326] text-[#F8F3EF] py-3.5 border-b border-[#052326]/20">
                <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                        <Sparkles size={14} className="text-[#F0C417] animate-pulse" />
                        <span>Platform Launch Deal: Use code <strong className="text-[#F0C417] font-bold">LAUNCH10</strong> for flat 10% off sitewide!</span>
                    </div>
                    {cartSubtotal > 0 ? (
                        <div className="flex items-center gap-3 text-xs w-full md:w-auto justify-center md:justify-end">
                            <span className="font-medium">
                                {cartSubtotal >= freeShippingThreshold ? (
                                    <span className="text-green-400 font-semibold flex items-center gap-1">🚚 Free shipping unlocked!</span>
                                ) : (
                                    <span>Add <strong className="text-[#F0C417]">₹{amountToFreeShipping.toFixed(0)}</strong> more for free shipping</span>
                                )}
                            </span>
                            <div className="w-24 h-2 bg-[#F8F3EF]/20 rounded-full overflow-hidden">
                                <div 
                                    className="bg-[#F0C417] h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${progressPercent}%` }} 
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-300">
                            Free standard delivery on orders of ₹999 or more
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
                
                {/* Search Stats Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <span className="text-[10px] font-bold tracking-[0.15em] text-[#B08900] uppercase block mb-1">
                            Search Results
                        </span>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#052326] font-serif">
                            {query ? `Results for "${query}"` : categoryFilter ? `Category: ${categoryFilter}` : 'All Wellness Products'}
                        </h1>
                        <p className="text-[#052326]/60 text-xs mt-1 font-medium">
                            {loading ? 'Searching catalog...' : `${displayedProducts.length} items available`}
                        </p>
                    </div>

                    {/* Sorting & Filter buttons */}
                    <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-[8px] border border-[#052326]/12 text-xs font-semibold text-[#052326] hover:bg-gray-50 transition"
                        >
                            <Filter size={14} /> Filters
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#052326]/60 whitespace-nowrap">Sort By</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white border border-[#052326]/12 text-xs font-semibold py-2 px-3 rounded-[8px] outline-none text-[#052326] focus:ring-1 focus:ring-[#052326]/30 cursor-pointer"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="bestseller">Bestsellers</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="rating">Top Rated</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 items-start">
                    
                    {/* Sidebar Filters Widget (Desktop) */}
                    <aside className="w-64 bg-white p-6 rounded-lg border border-gray-100 hidden lg:flex flex-col gap-6" style={premiumCardStyle}>
                        
                        {/* Clear All Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <h3 className="font-semibold text-sm text-[#052326] flex items-center gap-2">
                                <Filter size={16} /> Filters
                            </h3>
                            {(selectedBrands.length > 0 || minPriceFilter !== null || maxPriceFilter !== null || categoryFilter) && (
                                <button 
                                    onClick={clearAllFilters}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div>
                            <h4 className="font-bold text-[10px] uppercase text-[#052326]/40 tracking-wider mb-3">Categories</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {categories.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer text-[#052326]/80 hover:text-[#052326] transition-colors">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#052326] focus:ring-[#052326]/40 w-4 h-4 cursor-pointer"
                                            checked={categoryFilter === cat.slug}
                                            onChange={() => toggleFilter('category', cat.slug)}
                                        />
                                        <span className="text-xs font-semibold">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Brand Filter */}
                        {availableBrands.length > 0 && (
                            <div>
                                <h4 className="font-bold text-[10px] uppercase text-[#052326]/40 tracking-wider mb-3">Brands</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {availableBrands.map(brand => (
                                        <label key={brand} className="flex items-center gap-2.5 cursor-pointer text-[#052326]/80 hover:text-[#052326] transition-colors">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#052326] focus:ring-[#052326]/40 w-4 h-4 cursor-pointer"
                                                checked={selectedBrands.includes(brand)}
                                                onChange={() => toggleBrand(brand)}
                                            />
                                            <span className="text-xs font-semibold">{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Range Filter */}
                        <div>
                            <h4 className="font-bold text-[10px] uppercase text-[#052326]/40 tracking-wider mb-3">Price Range</h4>
                            <form onSubmit={handlePriceApply} className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Min" 
                                        value={minPriceInput}
                                        onChange={(e) => setMinPriceInput(e.target.value)}
                                        className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none bg-white text-[#052326] focus:ring-1 focus:ring-[#052326]/30 text-center" 
                                    />
                                    <span className="text-gray-400 text-xs">-</span>
                                    <input 
                                        type="number" 
                                        placeholder="Max" 
                                        value={maxPriceInput}
                                        onChange={(e) => setMaxPriceInput(e.target.value)}
                                        className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none bg-white text-[#052326] focus:ring-1 focus:ring-[#052326]/30 text-center" 
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="submit"
                                        className="w-full bg-[#052326] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md hover:bg-[#052326]/90 transition"
                                    >
                                        Apply
                                    </button>
                                    {(minPriceFilter !== null || maxPriceFilter !== null) && (
                                        <button 
                                            type="button"
                                            onClick={clearPriceFilter}
                                            className="px-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition text-[10px]"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Coupons / Offers Side Widget */}
                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="font-bold text-[10px] uppercase text-[#B08900] tracking-wider mb-3 flex items-center gap-1">
                                <Ticket size={12} /> Active Coupons
                            </h4>
                            <div className="space-y-3">
                                {activeCoupons.map((coupon: any) => (
                                    <div 
                                        key={coupon.code}
                                        className="bg-[#FDFBF7] border border-dashed border-[#B08900]/40 p-2.5 flex flex-col gap-1.5"
                                        style={{ borderRadius: '6px' }}
                                    >
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="font-bold text-[9px] bg-[#B08900]/10 text-[#B08900] px-1.5 py-0.5 rounded font-mono tracking-wider uppercase">
                                                {coupon.code}
                                            </span>
                                            <button 
                                                onClick={() => handleCopy(coupon.code)}
                                                className="text-[#052326] hover:text-[#B08900] transition"
                                            >
                                                {copiedCode === coupon.code ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                                            </button>
                                        </div>
                                        <p className="font-semibold text-[10px] text-[#052326] line-clamp-1">{coupon.title}</p>
                                        <p className="text-[9px] text-gray-500 line-clamp-2">{coupon.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </aside>

                    {/* Mobile Filters Drawer Overlay */}
                    {showFilters && (
                        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden flex justify-end animate-in fade-in duration-300" onClick={() => setShowFilters(false)}>
                            <div 
                                className="w-80 bg-white h-full p-6 overflow-y-auto flex flex-col gap-6 animate-in slide-in-from-right duration-300" 
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <h3 className="font-bold text-lg text-[#052326]">Filters</h3>
                                    <div className="flex items-center gap-3">
                                        {(selectedBrands.length > 0 || minPriceFilter !== null || maxPriceFilter !== null || categoryFilter) && (
                                            <button 
                                                onClick={clearAllFilters}
                                                className="text-[10px] font-bold text-red-500 uppercase tracking-wider"
                                            >
                                                Clear
                                            </button>
                                        )}
                                        <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-black">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Category mobile */}
                                <div>
                                    <h4 className="font-bold text-[10px] uppercase text-[#052326]/40 tracking-wider mb-3">Categories</h4>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={categoryFilter === cat.slug}
                                                    onChange={() => {
                                                        toggleFilter('category', cat.slug);
                                                    }}
                                                    className="rounded border-gray-300 text-[#052326] focus:ring-[#052326]/40 w-4 h-4"
                                                />
                                                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Brands mobile */}
                                {availableBrands.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-[10px] uppercase text-[#052326]/40 tracking-wider mb-3">Brands</h4>
                                        <div className="space-y-2">
                                            {availableBrands.map(brand => (
                                                <label key={brand} className="flex items-center gap-2.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBrands.includes(brand)}
                                                        onChange={() => toggleBrand(brand)}
                                                        className="rounded border-gray-300 text-[#052326] focus:ring-[#052326]/40 w-4 h-4"
                                                    />
                                                    <span className="text-xs font-medium text-gray-700">{brand}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price mobile */}
                                <div>
                                    <h4 className="font-bold text-[10px] uppercase text-[#052326]/40 tracking-wider mb-3">Price Range</h4>
                                    <form onSubmit={(e) => { handlePriceApply(e); setShowFilters(false); }} className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                placeholder="Min" 
                                                value={minPriceInput}
                                                onChange={(e) => setMinPriceInput(e.target.value)}
                                                className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-[#052326]" 
                                            />
                                            <span className="text-gray-400 text-xs">-</span>
                                            <input 
                                                type="number" 
                                                placeholder="Max" 
                                                value={maxPriceInput}
                                                onChange={(e) => setMaxPriceInput(e.target.value)}
                                                className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-[#052326]" 
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            className="w-full bg-[#052326] text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-md"
                                        >
                                            Apply Filters
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Grid Content area */}
                    <div className="flex-1">
                        
                        {/* Active Filter Chips */}
                        {(selectedBrands.length > 0 || minPriceFilter !== null || maxPriceFilter !== null) && (
                            <div className="flex flex-wrap gap-2 mb-4 items-center">
                                <span className="text-[10px] font-bold text-[#052326]/50 uppercase tracking-wider">Active:</span>
                                {selectedBrands.map(brand => (
                                    <button 
                                        key={brand}
                                        onClick={() => toggleBrand(brand)}
                                        className="bg-white border border-[#052326]/12 px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#052326] flex items-center gap-1 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                                    >
                                        <span>{brand}</span> <X size={10} />
                                    </button>
                                ))}
                                {(minPriceFilter !== null || maxPriceFilter !== null) && (
                                    <button 
                                        onClick={clearPriceFilter}
                                        className="bg-white border border-[#052326]/12 px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#052326] flex items-center gap-1 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                                    >
                                        <span>
                                            ₹{minPriceFilter || 0} - {maxPriceFilter ? `₹${maxPriceFilter}` : 'Any'}
                                        </span> 
                                        <X size={10} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex flex-col space-y-3">
                                        <Skeleton className="h-[250px] w-full rounded-[8px]" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : displayedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            /* Enriched Zero Results State */
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#052326]/12 rounded-[12px] p-8" style={premiumCardStyle}>
                                <div className="w-16 h-16 bg-[#F8F3EF] rounded-full flex items-center justify-center mb-4 text-[#052326]/60">
                                    <SearchIcon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-[#052326] mb-2 font-serif">No products found</h3>
                                <p className="text-gray-500 text-xs max-w-sm mx-auto mb-4">
                                    We couldn't find any products matching your active search and filter criteria. Try clearing some filters.
                                </p>
                                <button 
                                    onClick={clearAllFilters}
                                    className="bg-[#052326] text-white text-xs font-semibold px-4 py-2 rounded-[8px] hover:bg-[#052326]/90 transition"
                                >
                                    Clear All Filters & Reset
                                </button>
                            </div>
                        )}

                    </div>
                </div>

                {/* Recommendations Section with Swipeable Carousel */}
                <div className="mt-16 pt-12 border-t border-[#052326]/10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-[10px] font-bold tracking-[0.15em] text-[#B08900] uppercase block mb-1">
                                Personalized Deals
                            </span>
                            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#052326] font-serif">
                                Trending Wellness Formulations
                            </h2>
                        </div>
                        
                        {/* Carousel Arrows */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => slide('left')}
                                disabled={!canScrollLeft}
                                className={`w-8 h-8 rounded-full border border-[#052326]/12 flex items-center justify-center transition bg-white ${
                                    canScrollLeft 
                                        ? "text-[#052326] hover:bg-[#052326] hover:text-white" 
                                        : "text-gray-300 cursor-not-allowed opacity-50"
                                }`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => slide('right')}
                                disabled={!canScrollRight}
                                className={`w-8 h-8 rounded-full border border-[#052326]/12 flex items-center justify-center transition bg-white ${
                                    canScrollRight 
                                        ? "text-[#052326] hover:bg-[#052326] hover:text-white" 
                                        : "text-gray-300 cursor-not-allowed opacity-50"
                                }`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Slider viewport */}
                    {recsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-[320px] w-full rounded-[8px]" />
                            ))}
                        </div>
                    ) : (
                        <div 
                            ref={recSliderRef}
                            onScroll={handleScroll}
                            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {recommendations.map((product) => (
                                <div 
                                    key={product.id}
                                    className="snap-start flex-shrink-0 w-[280px] sm:w-[300px]"
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8F3EF] flex items-center justify-center text-xs">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}

