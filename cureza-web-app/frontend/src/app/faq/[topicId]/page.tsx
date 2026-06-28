'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, FileText, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import HELP_TOPICS from '@/data/help-faqs.json';

export default function FAQTopicPage() {
    const params = useParams();
    const topicId = params.topicId as string;

    const topic = HELP_TOPICS.find(t => t.id === topicId);

    if (!topic) {
        return (
            <div className="container mx-auto px-4 md:px-6 py-12 text-center text-[#052326]">
                <h1 className="text-xl font-semibold font-heading mb-4">Topic Not Found</h1>
                <Link href="/faq" className="text-[#052326] underline font-semibold text-xs tracking-wider">
                    Return to Help Center
                </Link>
            </div>
        );
    }

    const IconComponent = (Icons as any)[topic.icon] || HelpCircle;

    return (
        <div className="bg-[#F8F3EF] min-h-screen pb-16 text-[#052326]">
            {/* Header section with light/subtle styling */}
            <div className="bg-white border-b border-[#052326]/12 py-8 px-4 md:px-6">
                <div className="container mx-auto px-4 md:px-6">
                    <Link href="/faq" className="inline-flex items-center text-xs font-semibold text-[#052326]/60 hover:text-[#052326] mb-6 transition">
                        <ArrowLeft size={14} className="mr-1.5" />
                        Back to Help Center
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#052326]/5 text-[#052326] rounded-[8px] flex items-center justify-center">
                            <IconComponent size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold font-heading text-[#052326] leading-tight">{topic.title}</h1>
                            <p className="text-xs text-[#052326]/50 mt-1 font-light">{topic.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of subtopics */}
            <div className="container mx-auto px-4 md:px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {topic.subTopics?.map((subTopic) => (
                    <div
                        key={subTopic.id}
                        className="bg-white overflow-hidden transition hover:border-[#052326]/40"
                        style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(85, 85, 85, 0.18)',
                            boxShadow: 'none',
                            filter: 'none'
                        }}
                    >
                        {/* Header */}
                        <div className="bg-[#F8F3EF]/30 px-6 py-4 border-b border-[#052326]/8">
                            <h2 className="font-semibold text-[#052326] text-sm font-heading">
                                {subTopic.title}
                            </h2>
                        </div>

                        {/* FAQ List */}
                        <div className="divide-y divide-[#052326]/8">
                            {subTopic.faqs.map((faq) => (
                                <Link
                                    key={faq.id}
                                    href={`/faq/${topicId}/${faq.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-[#F8F3EF]/30 transition group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                        <FileText
                                            className="text-[#052326]/30 group-hover:text-[#D4AF37] shrink-0 transition"
                                            size={16}
                                        />
                                        <span className="font-medium text-xs text-[#052326]/80 group-hover:text-[#052326] truncate transition">
                                            {faq.q}
                                        </span>
                                    </div>

                                    <ChevronRight
                                        className="text-[#052326]/30 group-hover:text-[#052326] shrink-0 transition"
                                        size={14}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                {/* No Subtopics */}
                {(!topic.subTopics || topic.subTopics.length === 0) && (
                    <div 
                        className="text-center py-12 text-[#052326]/40 text-xs font-medium col-span-2 bg-white"
                        style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(85, 85, 85, 0.18)',
                            boxShadow: 'none',
                            filter: 'none'
                        }}
                    >
                        No articles found for this topic.
                    </div>
                )}
            </div>
        </div>
    );
}
