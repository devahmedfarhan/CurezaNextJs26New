'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, ThumbsDown, Search, ChevronRight } from 'lucide-react';
import { HELP_TOPICS } from '@/data/helpCenterData';
import { useState } from 'react';

export default function FAQArticlePage() {
    const params = useParams();
    const topicId = params.topicId as string;
    const articleId = params.slug as string;
    const [searchQuery, setSearchQuery] = useState('');

    const topic = HELP_TOPICS.find(t => t.id === topicId);

    // Flatten all FAQs from subtopics to find the matching one
    const article = topic?.subTopics?.flatMap(st => st.faqs).find(f => f.id === articleId);

    if (!topic || !article) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
                <Link href="/faq" className="text-cureza-green hover:underline">
                    Return to Help Center
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12 font-sans">
            {/* Header / Search Section */}
            <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-8 flex items-center justify-between gap-4">
                    <Link href="/faq" className="text-xl font-bold text-gray-900">Help Center</Link>
                    <div className="relative flex-1 max-w-xl">
                        <input
                            type="text"
                            placeholder="How can we help you?"
                            className="w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 focus:border-cureza-green focus:ring-1 focus:ring-cureza-green outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}


                {/* Main Content */}
                <main className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                        <Link href="/faq" className="hover:text-gray-900">Help Center</Link>
                        <span>/</span>
                        <Link href={`/faq/${topicId}`} className="hover:text-gray-900">{topic.title}</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{article.q}</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-6">{article.q}</h1>

                    <div className="prose prose-green max-w-none text-gray-700 text-sm leading-relaxed space-y-4">
                        <p>{article.a}</p>
                        {/* Additional generic content to make it look like a full article */}
                        <p>
                            If you need further assistance regarding this issue, please don't hesitate to reach out to our customer support team.
                            We are available 24/7 to help you resolve any problems you might encounter.
                        </p>
                    </div>

                    {/* Feedback Section */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Was this helpful?</span>
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition">
                                    <ThumbsUp size={14} />
                                    <span>Yes</span>
                                </button>
                                <button className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition">
                                    <ThumbsDown size={14} />
                                    <span>No</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
