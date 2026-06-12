import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Tag, Calendar, User } from 'lucide-react';

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

async function getTag(slug: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${backendUrl}/api/blog/tags/${slug}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await getTag(slug);
    if (!data) return { title: 'Tag Not Found' };

    return {
        title: `${data.tag.name} - Cureza Blog`,
        description: `Read articles tagged with ${data.tag.name} on Cureza.`,
    };
}

export default async function TagPage({ params }: Props) {
    const { slug } = await params;
    const data = await getTag(slug);

    if (!data) {
        notFound();
    }

    const { tag, posts } = data;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-cureza-green font-medium uppercase tracking-wider text-sm mb-2 block">Tag</span>
                <h1 className="text-4xl font-bold mb-4 text-gray-900 flex items-center justify-center gap-3">
                    <Tag className="w-8 h-8" />
                    {tag.name}
                </h1>
            </div>

            {posts.data.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">No articles found with this tag.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.data.map((post: any) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.category.slug}/${post.slug}`}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                        >
                            <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                                {post.featured_image ? (
                                    <img
                                        src={post.featured_image}
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
                    ))}
                </div>
            )}
        </div>
    );
}
