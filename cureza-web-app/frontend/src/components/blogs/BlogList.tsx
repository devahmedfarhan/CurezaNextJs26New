import { format } from 'date-fns';
import { Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import BlogListClient from './BlogListClient';

interface BlogListProps {
    initialPosts?: any[];
    categories?: string[]; // ['ayurveda', 'wellness']
    limit?: number;        // limit posts
    grid?: number;         // dynamic grid
    tag?: string;
    title?: string;
    subtitle?: string;
    isDarkBg?: boolean;
}

async function getPosts() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${backendUrl}/api/blog/posts`, {
            next: { revalidate: 10 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching posts in BlogList server:', error);
        return [];
    }
}

const gridClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export default async function BlogList({
    initialPosts,
    categories,
    limit,
    grid = 3,
    tag = "Knowledge Hub",
    title = "Cureza Wellness Journal",
    subtitle = "Expert insights on Ayurveda, holistic health, and modern wellness.",
    isDarkBg = false
}: BlogListProps) {
    // If initialPosts is not passed, fetch them on the server
    const posts = initialPosts || await getPosts();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    // If it's a specific widget call (e.g. from the homepage with categories/limit constraints),
    // render the simple static grid (the homepage widget design)
    if (categories?.length || limit) {
        let filtered = posts;
        if (categories?.length) {
            filtered = posts.filter((post: any) =>
                post.category?.slug && categories.includes(post.category.slug)
            );
        }
        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        const gridVal = gridClasses[grid] || gridClasses[3];

        return (
            <div className="container mx-auto px-4 md:px-6 py-16">
                
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className={`text-[10px] font-semibold tracking-wider block mb-3 ${
                        isDarkBg ? 'text-[#F0C417]' : 'text-cureza-green'
                    }`}>
                        {tag}
                    </span>
                    <h2 className={`text-3xl md:text-5xl font-semibold tracking-tight leading-tight ${
                        isDarkBg ? 'text-[#F8F3EF]' : 'text-[#052326]'
                    }`}>
                        {title}
                    </h2>
                    <div className="w-12 h-[3px] bg-[#F0C417] mx-auto my-5 rounded-full"></div>
                    <p className={`text-xs md:text-sm mt-3 max-w-xl font-normal mx-auto leading-relaxed ${
                        isDarkBg ? 'text-[#F8F3EF]/85' : 'text-[#052326]/80'
                    }`}>
                        {subtitle}
                    </p>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No articles found. Check back soon!</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        <div className={`grid gap-8 ${gridVal}`}>
                            {filtered.map((post: any) => {
                                const imageUrl = post.featured_image
                                    ? (post.featured_image.startsWith('http') ? post.featured_image : `${backendUrl}${post.featured_image}`)
                                    : null;

                                const wordCount = post.content ? post.content.split(/\s+/).length : 200;
                                const readTime = Math.max(3, Math.ceil(wordCount / 200));

                                return (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.category?.slug}/${post.slug}`}
                                        className="bg-white border border-[#555555]/18 rounded-[8px] overflow-hidden transition-all duration-300 flex flex-col h-full group"
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
                                            {/* Category Badge */}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-[#052326] text-[#F8F3EF] border border-[#F8F3EF]/10 px-2.5 py-0.5 rounded-full text-[8px] font-semibold tracking-wider">
                                                    {post.category?.name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[10px] tracking-wider font-semibold text-gray-400">
                                                    <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} className="text-[#F0C417]" />
                                                        {readTime} Min read
                                                    </span>
                                                </div>
                                                
                                                <h3 className="text-base md:text-lg font-semibold text-[#052326] leading-snug line-clamp-2 hover:text-cureza-green transition-colors">
                                                    {post.title}
                                                </h3>

                                                <p className="text-gray-500 text-xs font-normal line-clamp-3 leading-relaxed">
                                                    {post.excerpt}
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                                <span className="text-[10px] text-gray-600 font-medium">
                                                    By {post.author?.name}
                                                </span>
                                                <span className="text-cureza-green text-[10px] tracking-wider font-semibold inline-flex items-center gap-0.5 hover:translate-x-0.5 transition-transform">
                                                    Read article <ArrowUpRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Bottom CTA */}
                        <div className="text-center pt-4">
                            <Link 
                                href="/blog" 
                                className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#052326]/15 hover:border-[#052326] text-[#052326] rounded-full text-xs font-semibold tracking-wider hover:bg-[#052326] hover:text-[#F8F3EF] transition-all"
                            >
                                Explore all journal entries
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Otherwise, render the full interactive catalog client side
    return <BlogListClient initialPosts={posts} />;
}
