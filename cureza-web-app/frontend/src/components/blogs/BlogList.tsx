// components/blog/BlogList.tsx
import Link from 'next/link';
import { format } from 'date-fns';

interface BlogListProps {
    categories?: string[]; // ['ayurveda', 'wellness']
    limit?: number;        // limit posts
    grid?: 1 | 2 | 3 | 4;  // dynamic grid
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
        <div className="container mx-auto px-4 py-12">

            {/* <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Cureza Wellness Journal</h1>
                <p className="text-lg text-gray-600">
                    Expert insights on Ayurveda, holistic health, and modern wellness.
                </p>
            </div> */}

            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">No articles found. Check back soon!</p>
                </div>
            ) : (
                <div className={`grid gap-8 ${gridClasses[grid]}`}>
                    {filtered.map((post: any) => {
                        const imageUrl = post.featured_image
                            ? (post.featured_image.startsWith('http') ? post.featured_image : `${backendUrl}${post.featured_image}`)
                            : null;

                        return (
                            <Link
                                key={post.id}
                                href={`/blog/${post.category.slug}/${post.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                            >
                                <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={post.title}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-cureza-green">
                                            {post.category.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                        <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                                        <span>•</span>
                                        <span>{post.author.name}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-cureza-green transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <span className="text-cureza-green text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Read Article →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
