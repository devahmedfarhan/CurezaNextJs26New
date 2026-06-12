'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { BadgeCheck, Filter, Grid, LayoutGrid, MapPin, Search, Star } from 'lucide-react';
import Image from 'next/image';
import SellerReviewForm from '@/components/brand/SellerReviewForm';
import SellerReviewList from '@/components/brand/SellerReviewList';

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    banner_path: string | null;
    short_description: string | null;
    description: string | null;
    keywords: string[] | null;
    is_active: boolean;
    user_id: number;
}

interface Product {
    id: number;
    title: string;
    slug: string;
    image: string;
    price: number;
    original_price?: number;
    rating?: number;
    reviews_count?: number;
    is_verified?: boolean;
}

export default function BrandPage({ params }: { params: { slug: string } }) {
    // In Next 15, params is a Promise, but in Client Components with standard router, useParams is safer for dynamic updates
    const hookParams = useParams();
    const slug = (hookParams?.slug as string) || params?.slug;

    const [brand, setBrand] = useState<Brand | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // States for simple client-side features
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshReviews, setRefreshReviews] = useState(0);

    useEffect(() => {
        if (slug) {
            fetchBrandData(slug);
        }
    }, [slug]);

    const fetchBrandData = async (slug: string) => {
        try {
            const response = await axios.get(`/brand/${slug}`);
            setBrand(response.data.brand);
            setStats(response.data.stats);
            // Handle pagination data if needed, for now assuming .data or .products.data
            setProducts(response.data.products.data || response.data.products);
        } catch (err) {
            console.error('Failed to fetch brand:', err);
            setError('Brand not found');
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return '/fallback-banner.jpg'; // Need a fallback
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    const getLogoUrl = (path: string | null) => {
        if (!path) return '/fallback.png';
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
            </div>
        );
    }

    if (error || !brand) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
                <p className="text-gray-600">The brand you are looking for does not exist or is no longer active.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* HERO SECTION */}
            <div className="relative bg-white shadow-sm overflow-hidden group">
                {/* Banner Image */}
                <div className="relative h-[250px] md:h-[350px] w-full bg-gray-200 overflow-hidden">
                    {brand.banner_path ? (
                        <img
                            src={getImageUrl(brand.banner_path)}
                            alt={`${brand.name} Banner`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 font-medium">No Cover Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Brand Info Overlay / Container */}
                <div className="container mx-auto px-4 relative -mt-16 md:-mt-20 z-10 mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        {/* Logo */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
                                <img
                                    src={getLogoUrl(brand.logo)}
                                    alt={`${brand.name} Logo`}
                                    className="w-full h-full object-contain p-2"
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified Brand">
                                <BadgeCheck size={16} fill="currentColor" className="text-white" />
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 pb-2">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                                        {brand.name}
                                    </h1>

                                    {/* Rating Stats - NEW */}
                                    {stats && stats.total_reviews > 0 && (
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center px-2 py-1 bg-yellow-400 text-white rounded-md font-bold text-sm shadow-sm">
                                                <span className="mr-1">{stats.average_rating}</span>
                                                <Star className="w-3.5 h-3.5 fill-white" />
                                            </div>
                                            <div className="h-4 w-[1px] bg-gray-300"></div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {stats.total_reviews} Ratings
                                            </span>
                                            <div className="h-4 w-[1px] bg-gray-300"></div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                {stats.product_reviews_count} Product Reviews
                                            </span>
                                        </div>
                                    )}

                                    <p className="text-gray-600 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
                                        {brand.short_description || "Welcome to our official store on Cureza. Discover our latest products and deals."}
                                    </p>

                                    {/* Keywords / Tags */}
                                    {brand.keywords && brand.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {brand.keywords.map((keyword, i) => (
                                                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                                    #{keyword}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons (Follow/Share placeholder) */}
                                <div className="flex gap-3 mt-4 md:mt-0">
                                    {/* <button className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-black transition-colors shadow-lg shadow-gray-200">
                                        Follow Brand
                                     </button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="container mx-auto px-4 mt-8">

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <LayoutGrid size={18} className="text-gray-400" />
                        <span>All Products</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs">{products.length}</span>
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search in this store..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all outline-none"
                            />
                        </div>
                        {/* <button className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                             <Filter size={18} className="text-gray-600" />
                         </button> */}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                        <p className="text-gray-500 text-sm">Try using different keywords or clear your search.</p>
                    </div>
                )}

                {/* Long Description Section - SEO & Story */}
                {brand.description && (
                    <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                            About {brand.name}
                        </h2>
                        <div
                            className="prose prose-lg max-w-none text-gray-600 leading-loose"
                            dangerouslySetInnerHTML={{ __html: brand.description || '' }}
                        />
                    </div>
                )}

                {/* Reviews Section */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                            Seller Reviews
                        </h2>
                        <SellerReviewList sellerId={brand.user_id} refreshTrigger={refreshReviews} />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <SellerReviewForm sellerId={brand.user_id} onSuccess={() => setRefreshReviews(prev => prev + 1)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
