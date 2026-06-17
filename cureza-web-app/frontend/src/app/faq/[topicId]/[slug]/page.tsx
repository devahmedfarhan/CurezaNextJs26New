'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, ThumbsDown, Search, ChevronRight } from 'lucide-react';
import HELP_TOPICS from '@/data/help-faqs.json';
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
            <div className="container mx-auto px-4 py-12 text-center text-[#052326]">
                <h1 className="text-xl font-bold font-heading mb-4">Article not found</h1>
                <Link href="/faq" className="text-[#052326] underline font-bold text-xs uppercase tracking-wider">
                    Return to Help Center
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F3EF] min-h-screen pb-16 text-[#052326]">
            {/* Header / Search Section */}
            <div className="bg-white border-b border-[#052326]/12 py-4 px-6 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto max-w-6xl flex items-center justify-between gap-6">
                    <Link href="/faq" className="text-lg font-bold font-heading text-[#052326] shrink-0">Help Center</Link>
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="How can we help you?"
                            className="w-full pl-4 pr-10 py-2 rounded-[10px] border border-[#052326]/12 bg-[#F8F3EF]/40 text-xs outline-none transition focus:border-[#052326] focus:ring-1 focus:ring-[#052326] focus:bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-3.5 top-2.5 text-[#052326]/30" size={14} />
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-6 py-8">
                {/* Main Content */}
                <main className="bg-white rounded-[14px] border border-[#052326]/12 p-6 md:p-10 shadow-premium-light space-y-6">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#052326]/40 mb-2">
                        <Link href="/faq" className="hover:text-[#052326]">Help Center</Link>
                        <span>/</span>
                        <Link href={`/faq/${topicId}`} className="hover:text-[#052326]">{topic.title}</Link>
                        <span>/</span>
                        <span className="text-[#052326]/80 truncate max-w-[200px]">{article.q}</span>
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold font-heading text-[#052326] leading-tight">{article.q}</h1>

                    <div className="text-xs md:text-sm text-[#052326]/75 leading-relaxed font-light space-y-4">
                        <p>{article.a}</p>
                        <p>
                            If you need further assistance regarding this issue, please don't hesitate to reach out to our customer support team.
                            We are available 24/7 to help you resolve any problems you might encounter.
                        </p>
                    </div>

                    {/* Feedback Section */}
                    <div className="mt-10 pt-6 border-t border-[#052326]/8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <span className="text-xs font-bold text-[#052326]/60">Was this helpful?</span>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1.5 px-4 py-1.5 border border-[#052326]/12 rounded-full text-xs font-bold text-[#052326]/70 hover:bg-[#052326] hover:text-[#F8F3EF] hover:border-[#052326] transition">
                                <ThumbsUp size={12} />
                                <span>Yes</span>
                            </button>
                            <button className="flex items-center gap-1.5 px-4 py-1.5 border border-[#052326]/12 rounded-full text-xs font-bold text-[#052326]/70 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition">
                                <ThumbsDown size={12} />
                                <span>No</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
