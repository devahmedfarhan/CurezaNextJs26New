'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/api';
import { 
    Map, 
    Link2, 
    BookOpen, 
    ShieldCheck, 
    ShoppingBag, 
    ChevronRight, 
    Loader2, 
    Compass, 
    Tag, 
    ExternalLink 
} from 'lucide-react';

export default function SitemapContent() {
    const [products, setProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSitemapData = async () => {
            try {
                const [productsRes, brandsRes, categoriesRes, blogsRes] = await Promise.allSettled([
                    axios.get('/products'),
                    axios.get('/brands'),
                    axios.get('/categories'),
                    axios.get('/blog/posts')
                ]);

                if (productsRes.status === 'fulfilled') {
                    setProducts(productsRes.value.data || []);
                }
                if (brandsRes.status === 'fulfilled') {
                    const data = brandsRes.value.data;
                    setBrands(data.data || data || []);
                }
                if (categoriesRes.status === 'fulfilled') {
                    setCategories(categoriesRes.value.data || []);
                }
                if (blogsRes.status === 'fulfilled') {
                    const data = blogsRes.value.data;
                    setBlogs(data.data || data || []);
                }
            } catch (error) {
                console.error("Failed to load sitemap data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSitemapData();
    }, []);

    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-semibold text-[#052326]/60 mb-6 uppercase tracking-wider">
                    <Link href="/" className="hover:text-[#052326] transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#052326]">Visual Sitemap</span>
                </div>

                {/* Hero section */}
                <div className="bg-gradient-to-br from-[#052326] to-[#0e444b] text-white p-8 md:p-12 rounded-[24px] mb-12 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
                        <Compass size={320} />
                    </div>
                    <div className="relative z-10 space-y-4 max-w-3xl">
                        <span className="inline-flex items-center gap-1.5 bg-[#F0C417] text-[#052326] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                            <Map size={12} className="animate-pulse" />
                            Navigation Directory
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                            Explore Cureza
                        </h1>
                        <p className="text-sm md:text-base text-white/80 leading-relaxed font-light">
                            Welcome to our visual sitemap directory. Browse our entire collection of premium products, certified ayurvedic brands, wellness articles, policies, and service endpoints.
                        </p>
                    </div>
                </div>

                {/* Visual Grid of Sitemap Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    {/* Section 1: Core Pages */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#052326]/8 shadow-sm space-y-5 hover:shadow-md transition-shadow">
                        <h2 className="text-lg font-extrabold flex items-center gap-2.5 text-[#052326] pb-3 border-b border-[#052326]/8">
                            <span className="p-2 rounded-lg bg-[#052326]/5 text-[#052326]">
                                <Compass size={18} />
                            </span>
                            Core Pages
                        </h2>
                        <ul className="space-y-3.5 text-sm font-semibold text-[#052326]/80">
                            <li><Link href="/" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Home Page</Link></li>
                            <li><Link href="/about" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Our Story & About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Contact Support</Link></li>
                            <li><Link href="/faq" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Help & FAQ Center</Link></li>
                            <li><Link href="/doctor" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Become a Cureza Prescriber</Link></li>
                            <li><Link href="/seller" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Sell on Cureza</Link></li>
                        </ul>
                    </div>

                    {/* Section 2: Shop & Categories */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#052326]/8 shadow-sm space-y-5 hover:shadow-md transition-shadow">
                        <h2 className="text-lg font-extrabold flex items-center gap-2.5 text-[#052326] pb-3 border-b border-[#052326]/8">
                            <span className="p-2 rounded-lg bg-[#052326]/5 text-[#052326]">
                                <ShoppingBag size={18} />
                            </span>
                            Shop & Catalog
                        </h2>
                        <ul className="space-y-3.5 text-sm font-semibold text-[#052326]/80">
                            <li><Link href="/shop" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">All Products Catalog</Link></li>
                            <li><Link href="/bestsellers" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Bestsellers</Link></li>
                            <li><Link href="/new-launches" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">New Launches</Link></li>
                            
                            {/* Dynamically List Categories */}
                            {loading ? (
                                <li className="text-xs text-[#052326]/50 flex items-center gap-2 font-normal py-1">
                                    <Loader2 className="animate-spin" size={12} /> Loading categories...
                                </li>
                            ) : categories.length > 0 ? (
                                <div className="pt-2 border-t border-[#052326]/6 space-y-2.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/40 block mb-1">Product Categories</span>
                                    {categories.slice(0, 5).map((category) => (
                                        <li key={category.id}>
                                            <Link href={`/category/${category.slug}`} className="hover:text-[#F0C417] flex items-center gap-1.5 text-xs text-[#052326]/70 transition-colors font-medium">
                                                {category.name}
                                            </Link>
                                        </li>
                                    ))}
                                </div>
                            ) : null}
                        </ul>
                    </div>

                    {/* Section 3: Registered Brands */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#052326]/8 shadow-sm space-y-5 hover:shadow-md transition-shadow">
                        <h2 className="text-lg font-extrabold flex items-center gap-2.5 text-[#052326] pb-3 border-b border-[#052326]/8">
                            <span className="p-2 rounded-lg bg-[#052326]/5 text-[#052326]">
                                <Tag size={18} />
                            </span>
                            Our Brands
                        </h2>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-[#052326]/50 font-normal">
                                <Loader2 className="animate-spin" size={14} /> Fetching active brands...
                            </div>
                        ) : brands.length > 0 ? (
                            <ul className="grid grid-cols-2 gap-3 text-xs font-semibold text-[#052326]/80">
                                {brands.map((brand) => (
                                    <li key={brand.id}>
                                        <Link href={`/brand/${brand.slug}`} className="hover:text-[#F0C417] flex items-center gap-1 transition-colors border border-[#052326]/8 px-2.5 py-1.5 rounded-lg bg-[#F8F3EF]/50 hover:bg-[#052326]/5 font-medium">
                                            {brand.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-[#052326]/50 italic">No brands listed yet.</p>
                        )}
                    </div>

                    {/* Section 4: Legal & Policies */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#052326]/8 shadow-sm space-y-5 hover:shadow-md transition-shadow">
                        <h2 className="text-lg font-extrabold flex items-center gap-2.5 text-[#052326] pb-3 border-b border-[#052326]/8">
                            <span className="p-2 rounded-lg bg-[#052326]/5 text-[#052326]">
                                <ShieldCheck size={18} />
                            </span>
                            Policies & Legal
                        </h2>
                        <ul className="space-y-3.5 text-sm font-semibold text-[#052326]/80">
                            <li><Link href="/medical-policy" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Medical Product Policy (Rx)</Link></li>
                            <li><Link href="/returns" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Cancellation & Returns</Link></li>
                            <li><Link href="/legal/privacy-policy" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms-of-service" className="hover:text-[#F0C417] flex items-center gap-1.5 transition-colors">Terms of Service</Link></li>
                            <li>
                                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-[#F0C417] flex items-center gap-1 text-xs text-[#052326]/60 transition-colors font-medium">
                                    XML Sitemap <ExternalLink size={12} />
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Section 5: Blogs & Reading */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#052326]/8 shadow-sm space-y-5 hover:shadow-md transition-shadow md:col-span-2">
                        <h2 className="text-lg font-extrabold flex items-center gap-2.5 text-[#052326] pb-3 border-b border-[#052326]/8">
                            <span className="p-2 rounded-lg bg-[#052326]/5 text-[#052326]">
                                <BookOpen size={18} />
                            </span>
                            Wellness Library & Articles
                        </h2>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-[#052326]/50 font-normal">
                                <Loader2 className="animate-spin" size={14} /> Fetching health library articles...
                            </div>
                        ) : blogs.length > 0 ? (
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-sm font-semibold text-[#052326]/80">
                                {blogs.slice(0, 8).map((post) => (
                                    <li key={post.id}>
                                        <Link href={`/blog/posts/${post.slug}`} className="hover:text-[#F0C417] flex items-center gap-1.5 text-xs transition-colors font-medium leading-relaxed">
                                            <Link2 size={12} className="text-[#052326]/40 shrink-0" />
                                            <span className="truncate">{post.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-[#052326]/50 italic">No health library articles available.</p>
                        )}
                    </div>

                </div>

                {/* Footer anchor */}
                <div className="mt-16 pt-8 border-t border-[#052326]/12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#052326]/60">
                    <p>© {new Date().getFullYear()} Cureza Wellness Pvt Ltd. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/" className="hover:underline font-semibold text-[#052326]">Back to Home</Link>
                        <span className="text-[#052326]/30">|</span>
                        <Link href="/sitemap.xml" className="hover:underline font-semibold text-[#052326]">XML Crawler Sitemap</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
