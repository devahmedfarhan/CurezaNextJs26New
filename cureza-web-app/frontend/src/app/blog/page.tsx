import BlogList from '@/components/blogs/BlogList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Journal - Cureza | Wellness, Ayurveda & Holistic Health Insights',
    description: 'Explore our deeply researched wellness articles on Ayurveda, herbal nutrition, mental focus, and organic lifestyles.',
};

async function getPosts() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    try {
        const res = await fetch(`${backendUrl}/api/blog/posts`, {
            next: { revalidate: 10 }, // revalidate every 10 seconds for updates
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching blog posts in page:', error);
        return [];
    }
}

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <div className="bg-[#FAF8F5] min-h-screen">
            <BlogList initialPosts={posts} />
        </div>
    );
}
