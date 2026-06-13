// components/blogs/BlogList.tsx
import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, ArrowUpRight } from 'lucide-react';

interface BlogListProps {
    categories?: string[]; // ['ayurveda', 'wellness']
    limit?: number;        // limit posts
    grid?: 1 | 2 | 3 | 4;  // dynamic grid
    tag?: string;
    title?: string;
    subtitle?: string;
    isDarkBg?: boolean;
}

async function getPosts() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    try {
        const res = await fetch(`${backendUrl}/api/blog/posts`, {
            next: { revalidate: 0 },
        });

        if (!res.ok) return { data: [] };

        return await res.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return { data: [] };
    }
}

// STATIC SAFE GRID CLASSES (TAILWIND FRIENDLY)
const gridClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export default async function BlogList({
    categories,
    limit,
    grid = 3,
    tag = "Knowledge Hub",
    title = "Cureza Wellness Journal",
    subtitle = "Expert insights on Ayurveda, holistic health, and modern wellness.",
    isDarkBg = false
}: BlogListProps) {
    const { data: posts } = await getPosts();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    // FILTER by category
    let filtered = posts;
    if (categories?.length) {
        filtered = posts.filter((post: any) =>
            categories.includes(post.category.slug)
        );
    }

    // LIMIT posts
    if (limit) {
        filtered = filtered.slice(0, limit);
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-16">
            
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className={`text-[10px] font-bold tracking-[0.25em] uppercase block mb-3 ${
                    isDarkBg ? 'text-[#F0C417]' : 'text-[#052326]/60'
                }`}>
                    {tag}
                </span>
                <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight leading-tight ${
                    isDarkBg ? 'text-[#F8F3EF]' : 'text-[#052326]'
                }`}>
                    {title}
                </h2>
                <div className="w-12 h-[3px] bg-[#F0C417] mx-auto my-5 rounded-full"></div>
                <p className={`text-xs md:text-sm mt-3 max-w-xl font-light mx-auto leading-relaxed ${
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
                    <div className={`grid gap-8 ${gridClasses[grid]}`}>
                        {filtered.map((post: any) => {
                            const imageUrl = post.featured_image
                                ? (post.featured_image.startsWith('http') ? post.featured_image : `${backendUrl}${post.featured_image}`)
                                : null;

                            // Dynamic Reading Time calculation (based on excerpt word count)
                            const wordCount = post.excerpt ? post.excerpt.split(/\s+/).length : 50;
                            const readTime = Math.max(2, Math.ceil(wordCount / 20) + 1);

                            return (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.category.slug}/${post.slug}`}
                                    className="bg-gradient-to-b from-[#0b3830] to-[#052326] rounded-2xl overflow-hidden border border-[#F8F3EF]/10 shadow-[0_15px_40px_rgba(5,35,38,0.06)] flex flex-col h-full group"
                                >
                                    {/* Image Container */}
                                    <div className="aspect-[16/10] relative overflow-hidden bg-gray-950">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={post.title}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#F8F3EF]/30 text-xs font-semibold">
                                                No Image Available
                                            </div>
                                        )}
                                        {/* Category Badge overlay */}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-[#052326] text-[#F8F3EF] border border-[#F8F3EF]/10 px-2.5 py-1 rounded-[6px] text-[9px] font-bold tracking-widest uppercase shadow-md">
                                                {post.category.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-7 flex flex-col flex-grow justify-between">
                                        <div>
                                            {/* Meta data row */}
                                            <div className="flex items-center justify-between text-[9px] tracking-widest uppercase font-semibold text-[#F8F3EF]/50 mb-3.5">
                                                <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} className="text-[#F0C417]" />
                                                    {readTime} Min Read
                                                </span>
                                            </div>
                                            
                                            {/* Title */}
                                            <h3 className="text-base md:text-lg font-bold text-[#F8F3EF] mb-3 line-clamp-2 leading-snug group-hover:text-[#F0C417] transition-colors duration-200">
                                                {post.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-[#F8F3EF]/75 text-xs font-light line-clamp-3 mb-6 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        </div>

                                        {/* Footer line with Author and Link */}
                                        <div className="pt-4 border-t border-[#F8F3EF]/5 flex items-center justify-between mt-auto">
                                            <span className="text-[10px] text-[#F8F3EF]/60 font-medium">By {post.author.name}</span>
                                            <span className="text-[#F0C417] text-[10px] tracking-widest font-extrabold uppercase inline-flex items-center gap-1 group-hover:underline">
                                                Read Article <ArrowUpRight size={12} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom CTA Button for Premium feel */}
                    <div className="text-center pt-4">
                        <Link 
                            href="/blog" 
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#052326]/15 hover:border-[#052326] text-[#052326] rounded-full text-xs font-bold tracking-widest uppercase hover:bg-[#052326] hover:text-[#F8F3EF] transition-all shadow-sm"
                        >
                            Explore All Journal Entries
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
