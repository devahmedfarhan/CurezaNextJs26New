'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, ArrowRight, Search, BookOpen, User, Calendar, CheckCircle } from 'lucide-react';

interface BlogListClientProps {
    initialPosts: any[];
}

export default function BlogListClient({ initialPosts }: BlogListClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // 1. Dynamically extract categories from posts
    const categoriesList = useMemo(() => {
        const cats = new Set<string>();
        initialPosts.forEach((post: any) => {
            if (post.category?.name) {
                cats.add(post.category.name);
            }
        });
        return ['all', ...Array.from(cats)];
    }, [initialPosts]);

    // 2. Filter posts by category and search query
    const filteredPosts = useMemo(() => {
        return initialPosts.filter((post: any) => {
            const matchesCategory = selectedCategory === 'all' || 
                post.category?.name?.toLowerCase() === selectedCategory.toLowerCase() ||
                post.category?.slug?.toLowerCase() === selectedCategory.toLowerCase();
            
            const matchesSearch = searchQuery === '' ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content?.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesCategory && matchesSearch;
        });
    }, [initialPosts, selectedCategory, searchQuery]);

    // 3. Extract Featured Hero Post
    const featuredPost = useMemo(() => {
        if (filteredPosts.length === 0) return null;
        const featured = filteredPosts.find((post: any) => post.is_featured);
        return featured || filteredPosts[0];
    }, [filteredPosts]);

    // 4. Extract Regular Grid Posts (excluding the featured one)
    const gridPosts = useMemo(() => {
        if (!featuredPost) return [];
        return filteredPosts.filter((post: any) => post.id !== featuredPost.id);
    }, [filteredPosts, featuredPost]);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    // Casing formatter for categories
    const formatCategoryName = (name: string) => {
        if (!name) return '';
        if (name === 'all') return 'All topics';
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            
            {/* Header / Journal Title */}
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
                <span className="text-xs font-semibold tracking-wider text-cureza-green">
                    Wellness Journal
                </span>
                <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#052326] leading-tight">
                    Cureza Knowledge Hub
                </h2>
                <div className="w-12 h-[3px] bg-[#F0C417] mx-auto rounded-full"></div>
                <p className="text-xs md:text-sm text-gray-500 font-normal leading-relaxed">
                    Explore deeply researched health insights, Ayurveda remedies, and organic nutrition guidelines compiled by our certified medical review board.
                </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-200/60 pb-8 mb-12">
                {/* Category Pills */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {categoriesList.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 border ${
                                selectedCategory === cat
                                    ? "bg-[#052326] border-[#052326] text-[#F8F3EF]"
                                    : "bg-white border-[#555555]/18 text-[#052326]/80 hover:border-[#052326] hover:bg-[#FAF8F5]"
                            }`}
                        >
                            {formatCategoryName(cat)}
                        </button>
                    ))}
                </div>

                {/* Live Search Input */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search journals & research..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#555555]/18 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-cureza-green focus:border-cureza-green text-gray-800"
                    />
                </div>
            </div>

            {/* Empty State */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white border border-[#555555]/18 rounded-[8px] p-8 shadow-none" style={{ boxShadow: 'none', filter: 'none' }}>
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="font-semibold text-[#052326] text-lg mb-1">No articles found</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                        We couldn't find any articles matching your search query or selected topic. Try clearing filters or typing another term.
                    </p>
                </div>
            ) : (
                <div className="space-y-16">
                    
                    {/* Featured Article - Top Spotlight Hero Post */}
                    {featuredPost && (
                        <div 
                            className="bg-white border border-[#555555]/18 rounded-[8px] overflow-hidden transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 group"
                            style={{ boxShadow: 'none', filter: 'none' }}
                        >
                            {/* Image side */}
                            <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto relative overflow-hidden bg-gray-950 border-r border-[#555555]/18">
                                <Link href={`/blog/${featuredPost.category?.slug}/${featuredPost.slug}`}>
                                    <img
                                        src={
                                            featuredPost.featured_image
                                                ? (featuredPost.featured_image.startsWith('http') ? featuredPost.featured_image : `${backendUrl}${featuredPost.featured_image}`)
                                                : '/fallback.png'
                                        }
                                        alt={featuredPost.title}
                                        className="object-cover w-full h-full group-hover:scale-[1.01] transition-transform duration-700"
                                    />
                                </Link>
                                <div className="absolute top-4 left-4">
                                    <span className="bg-[#052326] text-[#F8F3EF] border border-[#F8F3EF]/10 px-3 py-1 rounded-full text-[9px] font-semibold tracking-wider">
                                        {featuredPost.category?.name}
                                    </span>
                                </div>
                            </div>

                            {/* Content side */}
                            <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] tracking-wider font-semibold text-gray-400">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {format(new Date(featuredPost.published_at), 'MMM d, yyyy')}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} className="text-[#F0C417]" />
                                            {Math.max(3, Math.ceil(featuredPost.content?.split(/\s+/).length / 200))} Min read
                                        </span>
                                    </div>
                                    
                                    <Link href={`/blog/${featuredPost.category?.slug}/${featuredPost.slug}`}>
                                        <h3 className="text-xl md:text-2xl font-semibold text-[#052326] hover:text-cureza-green transition-colors leading-tight">
                                            {featuredPost.title}
                                        </h3>
                                    </Link>

                                    <p className="text-gray-500 text-xs leading-relaxed font-normal line-clamp-4">
                                        {featuredPost.excerpt}
                                    </p>

                                    {featuredPost.fact_checked_by && (
                                        <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-100">
                                            <CheckCircle size={10} fill="currentColor" className="text-blue-800" /> Fact checked
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-6 lg:mt-auto">
                                    <span className="text-xs text-gray-600 font-medium flex items-center gap-1.5">
                                        {featuredPost.author?.image ? (
                                            <img src={featuredPost.author.image} alt={featuredPost.author.name} className="w-6 h-6 rounded-full object-cover border" />
                                        ) : (
                                            <User size={12} className="text-gray-400" />
                                        )}
                                        By {featuredPost.author?.name}
                                    </span>
                                    <Link 
                                        href={`/blog/${featuredPost.category?.slug}/${featuredPost.slug}`}
                                        className="text-cureza-green text-xs tracking-wider font-semibold inline-flex items-center gap-1 hover:translate-x-0.5 transition-transform"
                                    >
                                        Read spotlight <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Regular Articles Grid - Carousel on Mobile, Grid on Desktop */}
                    {gridPosts.length > 0 && (
                        <div className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-none pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-x-visible md:pb-0">
                            {gridPosts.map((post: any) => {
                                const imageUrl = post.featured_image
                                    ? (post.featured_image.startsWith('http') ? post.featured_image : `${backendUrl}${post.featured_image}`)
                                    : null;
                                
                                const wordCount = post.content ? post.content.split(/\s+/).length : 200;
                                const readTime = Math.max(3, Math.ceil(wordCount / 200));

                                return (
                                    <div
                                        key={post.id}
                                        className="bg-white border border-[#555555]/18 rounded-[8px] overflow-hidden transition-all duration-300 flex flex-col h-full group w-[85vw] sm:w-[350px] flex-shrink-0 snap-start md:w-auto md:flex-shrink"
                                        style={{ boxShadow: 'none', filter: 'none' }}
                                    >
                                        {/* Image Container */}
                                        <div className="aspect-[16/10] relative overflow-hidden bg-gray-50 border-b border-gray-100">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={post.title}
                                                    className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                                                    No image
                                                </div>
                                            )}
                                            
                                            {/* Category Overlay */}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-[#052326] text-[#F8F3EF] border border-[#F8F3EF]/10 px-2.5 py-0.5 rounded-full text-[8px] font-semibold tracking-wider">
                                                    {post.category?.name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                                            <div className="space-y-3">
                                                {/* Meta */}
                                                <div className="flex items-center justify-between text-[10px] tracking-wider font-semibold text-gray-400">
                                                    <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} className="text-[#F0C417]" />
                                                        {readTime} Min read
                                                    </span>
                                                </div>
                                                
                                                {/* Title */}
                                                <Link href={`/blog/${post.category?.slug}/${post.slug}`}>
                                                    <h3 className="text-base md:text-lg font-semibold text-[#052326] leading-snug line-clamp-2 hover:text-cureza-green transition-colors">
                                                        {post.title}
                                                    </h3>
                                                </Link>

                                                {/* Excerpt */}
                                                <p className="text-gray-500 text-xs font-normal line-clamp-3 leading-relaxed">
                                                    {post.excerpt}
                                                </p>
                                            </div>

                                            {/* Footer line with Author and Link */}
                                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                                <span className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                                                    By {post.author?.name}
                                                </span>
                                                <Link 
                                                    href={`/blog/${post.category?.slug}/${post.slug}`}
                                                    className="text-cureza-green text-[10px] tracking-wider font-semibold inline-flex items-center gap-0.5 hover:translate-x-0.5 transition-transform"
                                                >
                                                    Read article <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
