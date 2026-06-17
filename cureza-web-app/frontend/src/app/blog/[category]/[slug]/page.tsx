import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, User, Tag, CheckCircle, ExternalLink, ArrowRight, Clock } from 'lucide-react';
import { parseBlogContent } from '@/lib/blogParser';
import BlogProductCard from '@/components/blogs/BlogProductCard';
import TableOfContents from '@/components/blogs/TableOfContents';
import SidebarProducts from '@/components/blogs/SidebarProducts';

interface Props {
    params: Promise<{
        category: string;
        slug: string;
    }>;
}

export const dynamic = 'force-dynamic';

async function getPost(slug: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${backendUrl}/api/blog/posts/${slug}`, {
            cache: 'no-store',
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

async function getPopularPosts() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${backendUrl}/api/blog/posts/popular`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error(`Error fetching popular posts:`, error);
        return [];
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
    const { slug } = await params;
    const post = await getPost(slug);
    const popularPosts = await getPopularPosts();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    if (!post) {
        notFound();
    }

    const imageUrl = post.featured_image
        ? (post.featured_image.startsWith('http') ? post.featured_image : `${backendUrl}${post.featured_image}`)
        : null;

    // Parse content for headings (TOC) and product shortcodes [product id="X"]
    const { parts, headings } = parseBlogContent(post.content, post.injected_products || []);

    // Calculate dynamic reading time
    const wordCount = post.content ? post.content.split(/\s+/).length : 200;
    const readTime = Math.max(3, Math.ceil(wordCount / 200));

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
        <div className="bg-[#FAF8F5] min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* Top Hero Header */}
            <div className="bg-[#052326] text-[#F8F3EF] py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0b3830] via-transparent to-transparent opacity-50"></div>
                <div className="container mx-auto px-4 max-w-6xl relative z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest text-[#F0C417]">
                        <Link href="/blog" className="hover:underline">Journal</Link>
                        <span>/</span>
                        <Link href={`/blog/${post.category.slug}`} className="hover:underline">{post.category.name}</Link>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight max-w-4xl mb-8">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-[#F8F3EF]/75">
                        <Link href={`/blog/author/${post.author.slug}`} className="flex items-center gap-2 hover:text-[#F0C417] transition-colors">
                            {post.author.image ? (
                                <img src={post.author.image} alt={post.author.name} className="w-8 h-8 rounded-full object-cover border border-[#F8F3EF]/25" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><User size={12} /></div>
                            )}
                            <span className="font-bold">By {post.author.name}</span>
                        </Link>

                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            <span>{format(new Date(post.published_at), 'MMMM d, yyyy')}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{readTime} Min Read</span>
                        </div>

                        {post.fact_checked_by && (
                            <div className="flex items-center gap-1.5 bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/5">
                                <CheckCircle size={12} className="text-[#F0C417]" />
                                <span className="font-semibold text-[10px] uppercase tracking-wider">Medically Reviewed</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Article Container */}
            <div className="container mx-auto px-4 max-w-6xl py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Content Column */}
                    <article className="lg:col-span-8 bg-white border border-[#052326]/5 rounded-3xl p-6 md:p-10 shadow-sm">
                        
                        {/* Medical Review Badge */}
                        {post.fact_checked_by && (
                            <div className="flex items-start sm:items-center gap-4 bg-[#052326]/5 border border-[#052326]/10 p-5 rounded-2xl mb-8">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#052326]/10 flex-shrink-0">
                                    {post.fact_checker_image ? (
                                        <img src={post.fact_checker_image.startsWith('http') ? post.fact_checker_image : `${backendUrl}${post.fact_checker_image}`} alt={post.fact_checked_by} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#052326] text-white font-bold flex items-center justify-center text-xs">Rx</div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-[#052326]">Medically Reviewed by {post.fact_checked_by}</span>
                                        <span className="bg-[#052326] text-[#F8F3EF] text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                            <CheckCircle size={8} fill="currentColor" className="text-[#F0C417]" /> Verified
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {post.fact_checker_title} • Fact-Checked credentials: <span className="italic">{post.fact_checker_credentials || "Professional clinical review standards apply."}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Featured Image */}
                        {imageUrl && (
                            <div className="mb-10 rounded-2xl overflow-hidden border border-[#052326]/5 shadow-sm aspect-[16/9]">
                                <img
                                    src={imageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Parsed Blog Content (HTML + Products) */}
                        <div className="space-y-8">
                            {parts.map((part, index) => {
                                if (part.type === 'html') {
                                    return (
                                        <div
                                            key={index}
                                            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-[#052326] prose-p:text-[#052326]/85 prose-p:leading-relaxed prose-a:text-cureza-green prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-strong:text-[#052326] prose-ol:list-decimal prose-ul:list-disc pl-0 pr-0 my-0"
                                            dangerouslySetInnerHTML={{ __html: part.content || '' }}
                                        />
                                    );
                                } else {
                                    return (
                                        <BlogProductCard key={index} product={part.product} />
                                    );
                                }
                            })}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#052326]/50 mr-2">Tags:</span>
                                {post.tags.map((tag: any) => (
                                    <Link
                                        key={tag.id}
                                        href={`/blog/tag/${tag.slug}`}
                                        className="bg-[#052326]/5 text-[#052326]/80 text-xs px-3.5 py-1.5 rounded-full border border-gray-100 hover:bg-[#052326] hover:text-[#F8F3EF] hover:border-[#052326] transition-all duration-300 font-semibold uppercase tracking-wider"
                                    >
                                        {tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Citations Reference Board */}
                        {post.citations && post.citations.length > 0 && (
                            <div className="mt-12 p-6 md:p-8 bg-[#FAF8F5] border border-[#052326]/5 rounded-2xl space-y-4">
                                <div className="flex items-center gap-2 border-b border-[#052326]/10 pb-3">
                                    <CheckCircle size={16} className="text-cureza-green" />
                                    <h3 className="font-extrabold text-[#052326] text-base uppercase tracking-wider">Scientific References & Citations</h3>
                                </div>
                                <ol className="list-decimal pl-5 space-y-2.5 text-xs text-[#052326]/80 leading-relaxed font-light">
                                    {post.citations.map((citation: any, idx: number) => (
                                        <li key={idx} className="hover:text-cureza-green transition-colors">
                                            <span className="font-semibold text-gray-800">{citation.title}</span>
                                            {citation.source && <span className="text-gray-400"> - [{citation.source}]</span>}
                                            {citation.url && (
                                                <a 
                                                    href={citation.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center gap-0.5 text-cureza-green ml-1.5 hover:underline font-semibold"
                                                >
                                                    View Source <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </article>

                    {/* Sidebar Column */}
                    <aside className="lg:col-span-4 space-y-8">
                        
                        {/* Sticky sidebar widgets */}
                        <div className="sticky top-24 space-y-8">
                            
                            {/* Recommended Products Sidebar List */}
                            {post.recommended_products_details && post.recommended_products_details.length > 0 && (
                                <SidebarProducts products={post.recommended_products_details} backendUrl={backendUrl} />
                            )}

                            <TableOfContents headings={headings} />

                            {/* Medical Reviewer Profile Card */}
                            {post.fact_checked_by && (
                                <div className="bg-white border border-[#052326]/5 rounded-2xl p-5 shadow-sm space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-[#052326]/10 flex-shrink-0">
                                            {post.fact_checker_image ? (
                                                <img src={post.fact_checker_image.startsWith('http') ? post.fact_checker_image : `${backendUrl}${post.fact_checker_image}`} alt={post.fact_checked_by} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-[#052326] text-white font-bold flex items-center justify-center text-xs">Rx</div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#052326] text-sm leading-tight">{post.fact_checked_by}</h4>
                                            <p className="text-[10px] text-cureza-green font-bold uppercase tracking-wider">{post.fact_checker_title}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed font-light">
                                        {post.fact_checker_credentials || "Certified clinical reviewer confirming therapeutic claims and research standards."}
                                    </p>
                                </div>
                            )}

                            {/* Popular/Trending Posts Widget */}
                            {popularPosts && popularPosts.length > 0 && (
                                <div className="bg-white border border-[#052326]/5 rounded-2xl p-5 shadow-sm space-y-4">
                                    <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/60 uppercase border-b pb-2">
                                        Popular Articles
                                    </h4>
                                    <div className="space-y-4">
                                        {popularPosts.filter((p: any) => p.id !== post.id).slice(0, 4).map((p: any) => {
                                            const pImg = p.featured_image ? (p.featured_image.startsWith('http') ? p.featured_image : `${backendUrl}${p.featured_image}`) : '/fallback.png';
                                            return (
                                                <Link 
                                                    key={p.id}
                                                    href={`/blog/${p.category.slug}/${p.slug}`}
                                                    className="flex gap-3 group"
                                                >
                                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                        <img src={pImg} alt={p.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-0.5">
                                                        <h5 className="font-bold text-xs text-[#052326] leading-snug group-hover:text-cureza-green transition-colors line-clamp-2">{p.title}</h5>
                                                        <p className="text-[10px] text-gray-400">{format(new Date(p.published_at), 'MMM d, yyyy')}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </aside>
                </div>
            </div>
            
            {/* Author Profile Bio Panel bottom */}
            <div className="bg-[#FAF8F5] border-t border-gray-200/50 py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white border border-[#052326]/5 rounded-3xl p-8 md:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-gray-100">
                            {post.author.image ? (
                                <img src={post.author.image.startsWith('http') ? post.author.image : `${backendUrl}${post.author.image}`} alt={post.author.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-[#052326] text-[#F8F3EF] font-bold flex items-center justify-center text-xl">{post.author.name.charAt(0)}</div>
                            )}
                        </div>
                        <div className="text-center sm:text-left space-y-3">
                            <div>
                                <h3 className="text-lg font-extrabold text-[#052326]">About the Author: {post.author.name}</h3>
                                <p className="text-xs text-cureza-green font-bold uppercase tracking-wider mt-0.5">Certified Wellness Creator</p>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed font-light">{post.author.bio || "Staff writer and health journalist covering Ayurveda and evidence-based holistic therapies."}</p>
                            <div className="pt-2">
                                <Link href={`/blog/author/${post.author.slug}`} className="inline-flex items-center gap-1 text-cureza-green font-bold text-xs uppercase tracking-widest hover:underline">
                                    View all articles by {post.author.name} <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
