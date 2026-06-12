'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/imageHelper';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Handle search input
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
                setShowDropdown(false);
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
            setQuery('');
        }
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <div ref={searchRef} className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search for medicines, wellness products, doctors..."
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-full py-2.5 pl-5 pr-24 focus:outline-none focus:border-cureza-green focus:ring-1 focus:ring-cureza-green transition-colors"
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

            {/* Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                        {suggestions.map((product) => (
                            <Link
                                key={product.id}
                                href={`/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`}
                                onClick={() => {
                                    setShowDropdown(false);
                                    setQuery('');
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {product.images && product.images.length > 0 ? (
                                        <img src={getImageUrl(product.images[0])} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl">📦</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-charcoal dark:text-gray-100 truncate">
                                        {product.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        {product.brand && (
                                            <span className="font-semibold text-cureza-green">
                                                {typeof product.brand === 'object' ? product.brand.name : product.brand}
                                            </span>
                                        )}
                                        <span>•</span>
                                        <span>{typeof product.category === 'object' ? product.category?.name : product.category}</span>
                                    </div>
                                </div>
                                <p className="font-bold text-cureza-green">₹{product.price}</p>
                            </Link>
                        ))}
                    </div>

                    {/* View All Results */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                        <Link
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={() => {
                                setShowDropdown(false);
                                setQuery('');
                            }}
                            className="block text-center py-2 text-cureza-green font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            View all results for "{query}" →
                        </Link>
                    </div>
                </div>
            )}

            {/* No results message */}
            {showDropdown && query.length >= 3 && suggestions.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        No products found for "{query}"
                    </p>
                    <Link
                        href="/shop"
                        className="text-cureza-green font-semibold hover:underline mt-2 inline-block"
                    >
                        Browse all products
                    </Link>
                </div>
            )}
        </div>
    );
}
