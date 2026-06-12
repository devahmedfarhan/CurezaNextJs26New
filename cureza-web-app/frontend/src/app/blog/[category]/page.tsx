import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

interface Props {
    params: Promise<{
        category: string;
    }>;
}

async function getCategoryPosts(slug: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${backendUrl}/api/blog/categories/${slug}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const data = await getCategoryPosts(category);
    if (!data) return { title: 'Category Not Found' };

    return {
        title: `${data.category.name} - Cureza Blog`,
        description: data.category.description || `Read articles about ${data.category.name} on Cureza.`,
    };
}

export default async function CategoryPage({ params }: Props) {
    const { category: slug } = await params;
    const data = await getCategoryPosts(slug);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    if (!data) {
        notFound();
    }

    const { category, posts } = data;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-cureza-green font-medium uppercase tracking-wider text-sm mb-2 block">Category</span>
                <h1 className="text-4xl font-bold mb-4 text-gray-900">{category.name}</h1>
                {category.description && (
                    <p className="text-lg text-gray-600">
                        {category.description}
                    </p>
                )}
            </div>

            {posts.data.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">No articles found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.data.map((post: any) => {
                        const imageUrl = post.featured_image
                            ? (post.featured_image.startsWith('http') ? post.featured_image : `${backendUrl}${post.featured_image}`)
                            : null;

                        return (
                            <Link
                                key={post.id}
                                href={`/blog/${category.slug}/${post.slug}`}
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
