import BlogList from '@/components/blogs/BlogList';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - Cureza | Wellness & Ayurveda Insights',
    description: 'Explore the latest articles on Ayurveda, wellness, nutrition, and holistic health.',
};

export default function BlogPage() {
    // return <BlogList categories={['ayurveda']} />;
    // return <BlogList categories={['wellness', 'nutrition']} />;
    // return <BlogList limit={3} />;
    // return <BlogList grid={4} />;

    return <BlogList
        categories={['ayurveda', 'wellness']}
        limit={4}
        grid={3}
    />





}
