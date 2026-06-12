import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { User, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

async function getAuthor(slug: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${backendUrl}/api/blog/authors/${slug}`, {
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
    const data = await getAuthor(slug);
    if (!data) return { title: 'Author Not Found' };

    return {
        title: `${data.author.name} - Cureza Blog Author`,
        description: data.author.bio || `Read articles by ${data.author.name} on Cureza.`,
    };
}

export default async function AuthorPage({ params }: Props) {
    const { slug } = await params;
    const data = await getAuthor(slug);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    if (!data) {
        notFound();
    }

    const { author, posts: postsData } = data;
    const posts = postsData.data || [];

    const authorImageUrl = author.image
        ? (author.image.startsWith('http') ? author.image : `${backendUrl}${author.image}`)
        : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name,
        description: author.bio,
        image: authorImageUrl,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/author/${author.slug}`,
        sameAs: [
            author.social_links?.twitter,
            author.social_links?.linkedin,
            author.social_links?.facebook,
            author.social_links?.instagram
        ].filter(Boolean)
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-4xl mx-auto mb-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                <div className="shrink-0">
                    {authorImageUrl ? (
                        <img src={authorImageUrl} alt={author.name} className="w-32 h-32 rounded-full object-cover border-4 border-gray-50" />
                    ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-4 border-gray-50">
                            <User size={64} />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h1>
                    <p className="text-gray-600 mb-6 text-lg">{author.bio}</p>

                    {author.social_links && (
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            {author.social_links.twitter && (
                                <a href={author.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors">
                                    <Twitter size={20} />
                                </a>
                            )}
                            {author.social_links.linkedin && (
                                <a href={author.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0A66C2] transition-colors">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {author.social_links.facebook && (
                                <a href={author.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors">
                                    <Facebook size={20} />
                                </a>
                            )}
                            {author.social_links.instagram && (
                                <a href={author.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors">
                                    <Instagram size={20} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-8">Articles by {author.name}</h2>

            {posts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">No articles found by this author.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post: any) => {
                        const postImageUrl = post.featured_image
                            ? (post.featured_image.startsWith('http') ? post.featured_image : `${backendUrl}${post.featured_image}`)
                            : null;

                        return (
                            <Link
                                key={post.id}
                                href={`/blog/${post.category.slug}/${post.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                            >
                                <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                                    {postImageUrl ? (
                                        <img
                                            src={postImageUrl}
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
