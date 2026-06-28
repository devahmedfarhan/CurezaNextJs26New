'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Ticket, Copy, Check, TrendingUp, Sparkles, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/imageHelper';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    // Fetch categories and coupons for suggestions
    useEffect(() => {
        api.get('/categories')
            .then(res => setCategories(res.data.slice(0, 5)))
            .catch(err => console.error("Error fetching search categories", err));

        api.get('/coupons')
            .then(res => setCoupons(res.data.slice(0, 3)))
            .catch(err => console.error("Error fetching search coupons", err));
    }, []);

    // Handle search suggestions fetch
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length >= 3) {
                try {
                    const response = await api.get(`/products?search=${encodeURIComponent(query)}`);
                    setSuggestions(response.data.slice(0, 5));
                    setShowDropdown(true);
                } catch (error) {
                    console.error('Search failed', error);
                }
            } else {
                setSuggestions([]);
                if (query.length === 0) {
                    setShowDropdown(true);
                }
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setShowDropdown(false);
            setIsFocused(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setShowDropdown(false);
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showToast(`Promo code "${code}" copied!`, "success");
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleQuickAdd = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.is_prescription_required) {
            const categorySlug = typeof product.category === 'object'
                ? product.category?.slug
                : (product.category?.toLowerCase() || 'general');
            router.push(`/shop/${categorySlug}/${product.slug || product.id}`);
            setShowDropdown(false);
            setIsFocused(false);
            setQuery('');
            return;
        }

        addToCart(product, 1);
        showToast("Added to cart", "success");
    };

    const fallbackCoupons = [
        { code: 'LAUNCH10', title: '10% Off Sitewide', description: 'Flat 10% off for launch' },
        { code: 'UPI5', title: '5% Extra UPI Off', description: 'Get extra 5% off via UPI transactions' },
        { code: 'HDFCWELNESS', title: '10% HDFC Card Off', description: 'Min. purchase ₹1,499. Max ₹500' }
    ];

    const fallbackCategories = [
        { id: 1, name: 'Ayurveda', slug: 'ayurveda' },
        { id: 2, name: 'Hemp Care', slug: 'hemp-care' },
        { id: 3, name: 'Supplements', slug: 'supplements' }
    ];

    const activeCoupons = coupons.length > 0 ? coupons : fallbackCoupons;
    const popularCategories = categories.length > 0 ? categories : fallbackCategories;
    const isDropdownVisible = (isFocused || showDropdown) && (query.length > 0 || isFocused);

    return (
        <div ref={searchRef} className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowDropdown(true);
                    }}
                    placeholder="Search for medicines, wellness products, doctors..."
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-full py-2.5 pl-5 pr-24 focus:outline-none focus:border-cureza-green focus:ring-1 focus:ring-cureza-green transition-colors text-sm"
                />

                {/* Clear button */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={18} />
                    </button>
                )}

                {/* Search button */}
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-cureza-green text-white p-1.5 rounded-full hover:bg-green-800 transition"
                >
                    <Search size={18} />
                </button>
            </form>

            {/* Rich Double-Column Dropdown */}
            {isDropdownVisible && (
                <div className="absolute top-full mt-2 w-full lg:w-[130%] lg:-left-[15%] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    {query.length < 3 ? (
                        /* Zero-State Layout */
                        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
                            {/* Column 1: Popular Categories & Trending Searches */}
                            <div className="col-span-6 p-5">
                                <h4 className="font-semibold text-xs text-[#052326]/60 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <TrendingUp size={12} className="text-cureza-green animate-pulse" /> Popular Categories
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {popularCategories.map((cat: any) => (
                                        <Link
                                            key={cat.id || cat.slug}
                                            href={`/search?category=${cat.slug}`}
                                            onClick={() => {
                                                setIsFocused(false);
                                                setShowDropdown(false);
                                                setQuery('');
                                            }}
                                            className="bg-[#F8F3EF]/60 hover:bg-[#F8F3EF] dark:bg-gray-700 dark:hover:bg-gray-600 text-xs px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-600 text-[#052326] dark:text-gray-200 transition-colors font-medium"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>

                                <h4 className="font-semibold text-xs text-[#052326]/60 dark:text-gray-400 uppercase tracking-wider mb-2">Trending Searches</h4>
                                <ul className="space-y-1.5 text-xs text-charcoal dark:text-gray-300">
                                    {['Organic Ashwagandha', 'Triphala Cleanse', 'Hemp Massage Oil', 'Liver Detox'].map((term) => (
                                        <li key={term}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setQuery(term);
                                                    router.push(`/search?q=${encodeURIComponent(term)}`);
                                                    setIsFocused(false);
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full text-left py-1 hover:text-cureza-green transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <span className="text-[#052326]/40 dark:text-gray-500">🔍</span>
                                                <span>{term}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 2: Coupon Codes / Offers */}
                            <div className="col-span-6 p-5 bg-[#FDFBF7] dark:bg-gray-800/40">
                                <h4 className="font-semibold text-xs text-[#B08900] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Sparkles size={12} className="animate-spin duration-1000" /> Active Platform Offers
                                </h4>
                                <div className="space-y-3">
                                    {activeCoupons.map((coupon: any) => (
                                        <div
                                            key={coupon.code}
                                            className="bg-white dark:bg-gray-800 border border-dashed border-[#B08900]/40 p-3 flex items-center justify-between gap-3 shadow-sm hover:border-[#B08900]/70 transition-colors"
                                            style={{ borderRadius: '8px' }}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <span className="font-bold text-[10px] bg-[#B08900]/10 text-[#B08900] px-2 py-0.5 rounded font-mono tracking-wider uppercase inline-block mb-1">
                                                    {coupon.code}
                                                </span>
                                                <p className="font-semibold text-xs text-[#052326] dark:text-gray-100 truncate">
                                                    {coupon.title}
                                                </p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                    {coupon.description}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(coupon.code)}
                                                className="flex-shrink-0 bg-[#052326] text-white p-2 rounded-[6px] hover:bg-[#052326]/90 transition-all active:scale-95"
                                            >
                                                {copiedCode === coupon.code ? (
                                                    <Check size={12} className="text-green-400" />
                                                ) : (
                                                    <Copy size={12} />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Active Typing Search State */
                        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
                            {/* Left Column: Quick Filter Matches & Coupons */}
                            <div className="col-span-4 p-4 bg-[#FDFBF7] dark:bg-gray-800/40">
                                <div className="mb-4">
                                    <h4 className="font-semibold text-xs text-[#052326]/60 dark:text-gray-400 uppercase tracking-wider mb-2">Category Matches</h4>
                                    <div className="space-y-1">
                                        {popularCategories
                                            .filter((c: any) => c.name.toLowerCase().includes(query.toLowerCase()))
                                            .slice(0, 3)
                                            .map((cat: any) => (
                                                <Link
                                                    key={cat.id || cat.slug}
                                                    href={`/search?category=${cat.slug}`}
                                                    onClick={() => {
                                                        setIsFocused(false);
                                                        setShowDropdown(false);
                                                        setQuery('');
                                                    }}
                                                    className="block text-xs font-semibold text-charcoal hover:text-cureza-green py-1 dark:text-gray-300 dark:hover:text-cureza-green"
                                                >
                                                    In <span className="underline">{cat.name}</span>
                                                </Link>
                                            ))}
                                        {popularCategories.filter((c: any) => c.name.toLowerCase().includes(query.toLowerCase())).length === 0 && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 italic">No categories match</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-xs text-[#B08900] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Ticket size={12} /> Coupons
                                    </h4>
                                    <div className="space-y-2">
                                        {activeCoupons.slice(0, 2).map((coupon: any) => (
                                            <div
                                                key={coupon.code}
                                                className="bg-white dark:bg-gray-800 border border-dashed border-[#B08900]/30 p-2 flex items-center justify-between"
                                                style={{ borderRadius: '8px' }}
                                            >
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <span className="font-mono font-bold text-[9px] text-[#B08900] uppercase tracking-wider block">
                                                        {coupon.code}
                                                    </span>
                                                    <span className="text-[9px] text-gray-500 dark:text-gray-400 block truncate">
                                                        {coupon.title}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(coupon.code)}
                                                    className="text-gray-400 hover:text-[#B08900] transition"
                                                >
                                                    {copiedCode === coupon.code ? (
                                                        <Check size={11} className="text-green-500" />
                                                    ) : (
                                                        <Copy size={11} />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Search Results */}
                            <div className="col-span-8 p-4">
                                <h4 className="font-semibold text-xs text-[#052326]/60 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">Matching Products</h4>
                                {suggestions.length > 0 ? (
                                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                        {suggestions.map((product) => {
                                            const productUrl = `/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`;
                                            return (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-lg transition"
                                                >
                                                    <Link
                                                        href={productUrl}
                                                        onClick={() => {
                                                            setIsFocused(false);
                                                            setShowDropdown(false);
                                                            setQuery('');
                                                        }}
                                                        className="flex items-center gap-3 flex-1 min-w-0"
                                                    >
                                                        <div className="w-11 h-11 bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img src={getImageUrl(product.images[0])} alt={product.title} className="w-full h-full object-cover" />
                                                            ) : product.image ? (
                                                                <img src={getImageUrl(product.image)} alt={product.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-lg">📦</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-xs text-charcoal dark:text-gray-100 truncate hover:text-cureza-green transition-colors">
                                                                {product.title}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                                {product.brand && (
                                                                    <span className="font-semibold text-cureza-green">
                                                                        {typeof product.brand === 'object' ? product.brand.name : product.brand}
                                                                    </span>
                                                                )}
                                                                <span>•</span>
                                                                <span>{typeof product.category === 'object' ? product.category?.name : product.category}</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        <p className="font-bold text-xs text-[#052326] dark:text-white">₹{product.price}</p>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleQuickAdd(e, product)}
                                                            className={`text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-[6px] transition flex items-center gap-1.5 ${
                                                                product.is_prescription_required
                                                                    ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
                                                                    : "bg-[#052326] text-white hover:bg-[#052326]/90 shadow-sm"
                                                            }`}
                                                        >
                                                            <ShoppingBag size={10} />
                                                            {product.is_prescription_required ? 'Rx Consult' : 'Buy Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center bg-gray-50/50 dark:bg-gray-900/20 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">No products found matching "{query}"</p>
                                        <Link
                                            href="/shop"
                                            onClick={() => {
                                                setIsFocused(false);
                                                setShowDropdown(false);
                                                setQuery('');
                                            }}
                                            className="text-xs text-cureza-green font-semibold mt-1 inline-block hover:underline"
                                        >
                                            Browse all products
                                        </Link>
                                    </div>
                                )}

                                {/* View All Results Footer */}
                                <div className="border-t border-gray-100 dark:border-gray-700 mt-3 pt-2 px-1">
                                    <Link
                                        href={`/search?q=${encodeURIComponent(query)}`}
                                        onClick={() => {
                                            setIsFocused(false);
                                            setShowDropdown(false);
                                            setQuery('');
                                        }}
                                        className="block text-center py-2 text-xs text-cureza-green font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                                    >
                                        View all results for "{query}" →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

