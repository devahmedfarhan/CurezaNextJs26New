import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, User, Tag, Share2 } from 'lucide-react';

interface Props {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

async function getPost(slug: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${backendUrl}/api/blog/posts/${slug}`, {
            next: { revalidate: 0 },
        });
        if (!res.ok) {
            console.error(`Failed to fetch post ${slug}:`, res.status);
            return null;
        }
        return res.json();
    } catch (error) {
        console.error(`Error fetching post ${slug}:`, error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: post.meta_title || `${post.title} - Cureza Blog`,
        description: post.meta_description || post.excerpt,
        keywords: post.meta_keywords,
        openGraph: {
            title: post.meta_title || post.title,
            description: post.meta_description || post.excerpt,
            images: post.featured_image ? [post.featured_image] : [],
            type: 'article',
            publishedTime: post.published_at,
            authors: [post.author.name],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug, category } = await params;
    const post = await getPost(slug);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    if (!post) {
        notFound();
    }

    const imageUrl = post.featured_image
        ? (post.featured_image.startsWith('http') ? post.featured_image : `${backendUrl}${post.featured_image}`)
        : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.meta_description || post.excerpt,
        image: imageUrl ? [imageUrl] : [],
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        author: {
            '@type': 'Person',
            name: post.author.name,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/author/${post.author.slug}`
        },
        publisher: {
            '@type': 'Organization',
            name: 'Cureza',
            logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.category.slug}/${post.slug}`
        }
    };

    return (
        <article className="container mx-auto px-4 py-12 max-w-4xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="mb-8 text-center">
                <Link
                    href={`/blog/${post.category.slug}`}
                    className="inline-block bg-green-50 text-cureza-green px-3 py-1 rounded-full text-sm font-medium mb-4 hover:bg-green-100 transition-colors"
                >
                    {post.category.name}
                </Link>
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.title}
                </h1>

                <div className="flex items-center justify-center gap-6 text-gray-500 text-sm border-b border-gray-100 pb-8">
                    <Link href={`/blog/author/${post.author.slug}`} className="flex items-center gap-2 hover:text-cureza-green transition-colors">
                        {post.author.image ? (
                            <img src={post.author.image} alt={post.author.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <User size={18} />
                        )}
                        <span className="font-medium">{post.author.name}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
                    </div>
                </div>
            </div>

            {imageUrl && (
                <div className="mb-10 rounded-2xl overflow-hidden shadow-sm">
                    <img
                        src={imageUrl}
                        alt={post.title}
                        className="w-full h-auto object-cover max-h-[500px]"
                    />
                </div>
            )}

            <div
                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-cureza-green prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <span className="font-medium text-gray-900 flex items-center gap-2">
                        <Tag size={18} /> Tags:
                    </span>
                    {post.tags && post.tags.map((tag: any) => (
                        <Link
                            key={tag.id}
                            href={`/blog/tag/${tag.slug}`}
                            className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                            {tag.name}
                        </Link>
                    ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 flex items-start gap-6">
                    <div className="shrink-0">
                        {post.author.image ? (
                            <img src={post.author.image} alt={post.author.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                <User size={32} />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">About {post.author.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{post.author.bio}</p>
                        <Link href={`/blog/author/${post.author.slug}`} className="text-cureza-green font-medium text-sm hover:underline">
                            View all posts by {post.author.name} →
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
