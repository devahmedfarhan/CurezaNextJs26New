'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { BadgeCheck, Filter, Grid, LayoutGrid, MapPin, Search, Star, Award, ShieldCheck, Heart, Sparkles, ChevronDown, ChevronUp, ThumbsUp, CheckCircle, Info, Store } from 'lucide-react';
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
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    faqs: { question: string; answer: string }[] | null;
    categories: any[] | null;
    concerns: any[] | null;
    purity_standards: string[] | null;
    genuine_badge_text: string | null;
    brand_vision?: string | null;
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
    category?: any;
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
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshReviews, setRefreshReviews] = useState(0);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    // Dynamic SEO update based on brand settings
    useEffect(() => {
        if (brand) {
            document.title = `${brand.name} | Cureza - The Store Of Wellness`;
            
            // Meta Description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', brand.meta_description || brand.short_description || '');

            // Meta Keywords
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywords);
            }
            const kwStr = brand.meta_keywords || (Array.isArray(brand.keywords) ? brand.keywords.join(', ') : '');
            metaKeywords.setAttribute('content', kwStr);
        }
    }, [brand]);

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

    const uniqueCategories = [
        'all',
        ...Array.from(
            new Set(
                products
                    .map((p) => (typeof p.category === 'object' ? p.category?.name : p.category))
                    .filter(Boolean)
            )
        )
    ];

    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const prodCat = typeof p.category === 'object' ? p.category?.name : p.category;
        const matchesCategory = selectedCategory === 'all' || prodCat === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const renderBrandSpecs = () => {
        return (
            <div className="bg-white rounded-[10px] p-3 md:p-4 border-[0.5px] border-[#052326]/12 space-y-3.5 md:space-y-5">
                <div>
                    <h3 className="font-heading font-extrabold text-[#052326] text-sm md:text-lg mb-1 md:mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 md:w-5 md:h-5 text-emerald-700" />
                        Brand Profile
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium hidden md:block">
                        Learn more about our health orientations and cure categories.
                    </p>
                </div>

                {/* Categories & Concerns display */}
                {((brand?.categories && brand.categories.length > 0) || (brand?.concerns && brand.concerns.length > 0)) ? (
                    <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-100">
                        {brand.categories && brand.categories.length > 0 && (
                            <div>
                                <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-wider text-gray-400 block mb-1.5 md:mb-2">Categories</span>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {brand.categories.map((cat: any) => (
                                        <span key={cat.id} className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {brand.concerns && brand.concerns.length > 0 && (
                            <div>
                                <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-wider text-gray-400 block mb-1.5 md:mb-2">Health Concerns</span>
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {brand.concerns.map((concern: any) => (
                                        <span key={concern.id} className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100 hover:bg-blue-100 transition-colors">
                                            {concern.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pt-3 md:pt-4 border-t border-gray-100 text-[11px] md:text-xs text-gray-400 font-medium italic">
                        No categories or health concerns specified.
                    </div>
                )}

                {/* Brand DNA certifications checklist */}
                <div className="pt-3 md:pt-4 border-t border-gray-100">
                    <span className="text-[10px] md:text-xs uppercase font-extrabold tracking-wider text-gray-400 block mb-1.5 md:mb-2">Purity & Trust Standards</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 md:flex-col md:gap-0 md:space-y-2 text-[10.5px] md:text-xs font-bold text-gray-700">
                        {Array.isArray(brand?.purity_standards) && brand.purity_standards.filter(Boolean).length > 0 ? (
                            brand.purity_standards.filter(Boolean).map((standard, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                    <span>{standard}</span>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                    <span>100% Organic & Ayurvedic</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                    <span>Toxin & Heavy Metal Free</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                    <span>Cruelty Free & Vegan Friendly</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

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
        <div className="bg-[#F8F3EF] min-h-screen pb-24 text-[#052326]">
            {/* HERO SECTION */}
            <div className="relative bg-white overflow-hidden group">
                {/* Banner Image / Background Gradient */}
                <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden">
                    {brand.banner_path ? (
                        <img
                            src={getImageUrl(brand.banner_path)}
                            alt={`${brand.name} Banner`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#052326] via-[#0b403a] to-[#124d45] flex items-center justify-center relative">
                            {/* Abstract Ambient Circles for Premium feel */}
                            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#f0c417]/10 blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse delay-1000"></div>
                            <div className="text-center px-4 z-10">
                                <span className="text-[#f0c417] text-xs font-extrabold uppercase tracking-widest block mb-2">Cureza Premium Partner</span>
                                <span className="text-white text-3xl md:text-5xl font-extrabold tracking-tight block drop-shadow-sm font-heading">{brand.name}</span>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Brand Info Glass Container */}
                <div className="container mx-auto px-4 relative -mt-20 md:-mt-24 z-10 mb-6">
                    <div className="bg-gradient-to-r from-[#052326]/95 via-[#0b403a]/90 to-[#124d45]/95 backdrop-blur-md border-[0.5px] border-emerald-500/20 rounded-[10px] p-5 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-lg shadow-[#052326]/10">
                        {/* Logo */}
                        <div className="relative flex-shrink-0 mx-auto md:mx-0">
                            <div className="w-32 h-32 md:w-36 md:h-36 rounded-[10px] bg-white border-[0.5px] border-white/10 overflow-hidden flex items-center justify-center hover:scale-103 transition-transform duration-300">
                                {brand.logo ? (
                                    <img
                                        src={getLogoUrl(brand.logo)}
                                        alt={`${brand.name} Logo`}
                                        className="w-full h-full object-contain p-3"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-emerald-700 text-white flex items-center justify-center font-extrabold text-4xl uppercase">
                                        {brand.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1.5 rounded-full border-2 border-white shadow-md" title="Verified Brand">
                                <BadgeCheck size={18} fill="currentColor" className="text-white" />
                            </div>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2 font-heading">
                                        {brand.name}
                                    </h1>

                                    {/* Stats and Badges Row */}
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                                        {stats && stats.total_reviews > 0 && (
                                            <>
                                                <div className="flex items-center px-3 py-1 bg-[#f0c417] text-[#052326] rounded-lg font-extrabold text-sm border border-[#f0c417]">
                                                    <span className="mr-1">{stats.average_rating}</span>
                                                    <Star className="w-3.5 h-3.5 fill-[#052326] text-[#052326]" />
                                                </div>
                                                <div className="h-4 w-[1px] bg-white/20"></div>
                                                <span className="text-sm font-bold text-emerald-100/90">
                                                    {stats.total_reviews} Verified Ratings
                                                </span>
                                                <div className="h-4 w-[1px] bg-white/20"></div>
                                            </>
                                        )}
                                        
                                        <div className="flex items-center px-3 py-1 bg-white/10 text-emerald-100 rounded-lg font-bold text-xs border border-white/10">
                                            <Store className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                                            <span>{stats?.total_sold || 0} Units Sold</span>
                                        </div>
                                        <div className="flex items-center px-3 py-1 bg-white/10 text-emerald-100 rounded-lg font-bold text-xs border border-white/10">
                                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                                            <span>{brand.genuine_badge_text || "100% Genuine"}</span>
                                        </div>
                                    </div>

                                    <p className="text-emerald-50/80 font-medium max-w-3xl text-sm md:text-base leading-relaxed">
                                        {brand.short_description || "Welcome to our official store on Cureza. Discover our latest products and deals."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="container mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left/Main Content Column (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Mobile Brand Specs (displays 2nd on mobile) */}
                        <div className="block lg:hidden">
                            {renderBrandSpecs()}
                        </div>
                        
                        {/* About Brand Story - Redesigned Editorial Style */}
                        {brand.description && (
                            <div className="bg-white rounded-[10px] p-5 md:p-6 border-[0.5px] border-[#052326]/12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-700/5 to-transparent rounded-bl-full"></div>
                                <h2 className="text-xl md:text-2xl font-bold text-[#052326] mb-6 flex items-center gap-3 font-heading">
                                    <Sparkles className="w-5 h-5 text-emerald-700" />
                                    Our Story
                                </h2>

                                {/* Editorial Brand Slogan Quote */}
                                <div className="border-l-4 border-emerald-700 pl-4 py-1.5 mb-6 bg-emerald-50/20 rounded-r-lg">
                                    <p className="text-xs md:text-sm font-semibold text-[#052326]/90 italic leading-relaxed">
                                        "{brand.brand_vision || "Healing from the roots. We bring you pure formulations compiled with ancient Ayurvedic wisdom, modern standards, and absolute transparency."}"
                                    </p>
                                </div>

                                <div
                                    className="prose prose-slate max-w-none text-gray-655 leading-relaxed text-sm md:text-base font-medium space-y-4"
                                    dangerouslySetInnerHTML={{ __html: brand.description || '' }}
                                />
                            </div>
                        )}

                        {/* Store Catalog (Search & Filters) */}
                        <div className="space-y-6">
                            {/* Search & Filter Bar */}
                            <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-[#052326]/12 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                    <LayoutGrid size={18} className="text-emerald-700" />
                                    <span className="font-heading text-base">Store Catalog</span>
                                    <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-emerald-100">
                                        {filteredProducts.length} Products
                                    </span>
                                </div>

                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search brand products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-[#F8F3EF] border border-gray-205 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>

                            {/* Category Filter Pills (Instant client-side filter) */}
                            {uniqueCategories.length > 2 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                                    {uniqueCategories.map((cat: any) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all border snap-start flex-shrink-0 ${
                                                selectedCategory === cat
                                                    ? 'bg-[#052326] text-white border-[#052326] shadow-sm'
                                                    : 'bg-white text-[#052326] border-[#052326]/10 hover:border-[#052326]/25 hover:bg-gray-50'
                                            }`}
                                        >
                                            {cat === 'all' ? 'All Formulations' : cat}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Products display: Grid on Desktop, 2-Row Horizontal Swipe Carousel on Mobile */}
                            <div>
                                {filteredProducts.length > 0 ? (
                                    <>
                                        {/* Mobile/Tablet Carousel Layout (Single row) */}
                                        <div className="lg:hidden relative w-full overflow-hidden">
                                            {/* Horizontal Scroll Box */}
                                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth pr-1">
                                                {filteredProducts.map((product) => (
                                                    <div key={product.id} className="w-[190px] sm:w-[220px] snap-start flex-shrink-0">
                                                        <ProductCard product={product} />
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Swipe indicators */}
                                            <div className="flex items-center justify-between text-xs text-gray-400 font-bold px-1 mt-1 uppercase tracking-wider">
                                                <span>← Swipe horizontally to view more products →</span>
                                                <span>{filteredProducts.length} Available</span>
                                            </div>
                                        </div>

                                        {/* Desktop Grid Layout (4-columns grid, no carousel) */}
                                        <div className="hidden lg:grid lg:grid-cols-4 gap-4">
                                            {filteredProducts.map((product) => (
                                                <div key={product.id} className="w-full">
                                                    <ProductCard product={product} />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-[10px] border border-dashed border-gray-200">
                                        <div className="mx-auto w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Search className="text-gray-400" size={22} />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-1">No products found</h3>
                                        <p className="text-gray-500 text-xs">Try using different keywords or clear your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FAQs Section - Redesigned Accordions */}
                        {brand.faqs && brand.faqs.length > 0 && (
                            <div className="bg-white rounded-[10px] p-5 md:p-6 border-[0.5px] border-[#052326]/12">
                                <h2 className="text-xl md:text-2xl font-bold text-[#052326] mb-6 flex items-center gap-3 font-heading">
                                    <Info className="w-5 h-5 text-emerald-700" />
                                    Frequently Asked Questions
                                </h2>
                                <div className="space-y-3">
                                    {brand.faqs.map((faq, i) => {
                                        const isOpen = openFaqIndex === i;
                                        return (
                                            <div
                                                key={i}
                                                className={`border-[0.5px] rounded-[8px] transition-all duration-300 overflow-hidden ${
                                                    isOpen
                                                        ? 'border-emerald-700/30 bg-emerald-50/10 border-l-4 border-l-emerald-700'
                                                        : 'border-[#052326]/12 bg-white hover:border-[#052326]/25 border-l-[0.5px]'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                                                    className="w-full flex justify-between items-center text-left px-4 py-3 font-bold text-[#052326] transition-colors focus:outline-none"
                                                >
                                                    <span className="text-sm md:text-base">{faq.question}</span>
                                                    <span className={`ml-4 text-emerald-700 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                                        <ChevronDown size={18} />
                                                    </span>
                                                </button>
                                                <div
                                                    className={`transition-all duration-300 overflow-hidden ${
                                                        isOpen ? 'max-h-96 opacity-100 pb-4 px-4' : 'max-h-0 opacity-0'
                                                    }`}
                                                >
                                                    <p className="text-xs md:text-sm text-gray-655 leading-relaxed font-medium pt-2 border-t border-dashed border-gray-200">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Structured JSON-LD SEO Data */}
                        {brand && (
                            <script
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify({
                                        "@context": "https://schema.org",
                                        "@type": "Brand",
                                        "name": brand.name,
                                        "url": typeof window !== 'undefined' ? window.location.href : '',
                                        "logo": brand.logo ? getLogoUrl(brand.logo) : '',
                                        "image": brand.banner_path ? getImageUrl(brand.banner_path) : '',
                                        "description": brand.short_description || '',
                                        "aggregateRating": stats && stats.total_reviews > 0 ? {
                                            "@type": "AggregateRating",
                                            "ratingValue": stats.average_rating,
                                            "reviewCount": stats.total_reviews
                                        } : undefined
                                    })
                                }}
                            />
                        )}

                        {/* Reviews Section - Main Testimonials List */}
                        <div className="bg-white rounded-[10px] p-5 md:p-6 border-[0.5px] border-[#052326]/12">
                            <h2 className="text-xl md:text-2xl font-bold text-[#052326] mb-6 flex items-center gap-3 font-heading">
                                <ThumbsUp className="w-5 h-5 text-emerald-700" />
                                Customer Testimonials
                            </h2>
                            <SellerReviewList sellerId={brand.user_id} refreshTrigger={refreshReviews} />
                        </div>

                    </div>

                    {/* Right/Sidebar Column (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Brand Specs Widget (Desktop only, mobile shows it 2nd in main grid) */}
                        <div className="hidden lg:block">
                            {renderBrandSpecs()}
                        </div>

                        {/* Ratings Breakdown Widget */}
                        {stats && (
                            <div className="bg-white rounded-[10px] p-4 border-[0.5px] border-[#052326]/12 space-y-4">
                                <div>
                                    <h3 className="font-heading font-extrabold text-[#052326] text-lg mb-1">Rating Distribution</h3>
                                    <p className="text-xs text-gray-500 font-medium">Based on customer ratings on Cureza.</p>
                                </div>

                                <div className="flex items-center gap-4 py-3 border-y border-gray-100">
                                    <div className="text-center pl-2">
                                        <div className="text-3xl font-extrabold text-[#052326] flex items-center justify-center gap-1 font-heading">
                                            {stats.average_rating}
                                        </div>
                                        <div className="flex justify-center text-amber-400 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < Math.round(stats.average_rating) ? "currentColor" : "none"} className={i < Math.round(stats.average_rating) ? "" : "text-gray-300"} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold block mt-1.5 uppercase">Avg Rating</span>
                                    </div>
                                    
                                    <div className="h-10 w-[1px] bg-gray-100"></div>

                                    <div className="flex-1 text-center">
                                        <div className="text-2xl font-extrabold text-[#052326] font-heading">
                                            {stats.total_reviews}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold block mt-2.5 uppercase">Reviews Count</span>
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-2">
                                    {[5, 4, 3, 2, 1].map((stars) => {
                                        const count = stats.rating_breakdown?.[stars] || 0;
                                        const total = stats.total_reviews || 1;
                                        const percentage = Math.round((count / total) * 100);
                                        return (
                                            <div key={stars} className="flex items-center gap-3 text-xs">
                                                <span className="w-8 font-extrabold text-gray-650 flex items-center gap-1">
                                                    {stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                </span>
                                                <div className="flex-1 h-2 bg-gray-50 border border-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="w-8 text-right font-bold text-gray-500">
                                                    {percentage}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Write Review Form Card */}
                        <SellerReviewForm sellerId={brand.user_id} onSuccess={() => setRefreshReviews(prev => prev + 1)} />

                    </div>

                </div>
            </div>
        </div>
    );
}
