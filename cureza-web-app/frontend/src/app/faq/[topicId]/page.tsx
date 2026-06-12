'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, FileText } from 'lucide-react';
import { HELP_TOPICS } from '@/data/helpCenterData';

export default function FAQTopicPage() {
    const params = useParams();
    const topicId = params.topicId as string;

    const topic = HELP_TOPICS.find(t => t.id === topicId);

    if (!topic) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic not found</h1>
                <Link href="/faq" className="text-cureza-green hover:underline">
                    Return to Help Center
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white border-b border-gray-200 py-4 px-4">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/faq" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Help Center
                    </Link>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-50 rounded-md text-cureza-green">
                            <topic.icon size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
                            <p className="text-gray-500">{topic.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row md:gap-8 gap-6">
                {topic.subTopics?.map((subTopic) => (
                    <div
                        key={subTopic.id}
                        className="bg-white rounded-md border border-gray-200 shadow-sm 
                       overflow-hidden w-full md:w-1/2 transition hover:shadow-md"
                    >
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900 text-lg">
                                {subTopic.title}
                            </h2>
                        </div>

                        {/* FAQ List */}
                        <div className="divide-y divide-gray-100">
                            {subTopic.faqs.map((faq) => (
                                <Link
                                    key={faq.id}
                                    href={`/faq/${topicId}/${faq.id}`}
                                    className="flex items-center justify-between p-5 hover:bg-gray-50 
                                   transition group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <FileText
                                            className="text-gray-400 group-hover:text-cureza-green"
                                            size={20}
                                        />
                                        <span className="font-medium text-gray-900 group-hover:text-cureza-green">
                                            {faq.q}
                                        </span>
                                    </div>

                                    <ChevronRight
                                        className="text-gray-300 group-hover:text-cureza-green"
                                        size={18}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                {/* No Subtopics */}
                {(!topic.subTopics || topic.subTopics.length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                        No articles found for this topic.
                    </div>
                )}
            </div>

        </div>
    );
}
