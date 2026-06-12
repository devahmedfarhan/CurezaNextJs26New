'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface ProductFAQProps {
    faqs: { question: string; answer: string }[];
}

export default function ProductFAQ({ faqs }: ProductFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-12 bg-gray-50 rounded-[32px] my-12">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm mb-4 text-cureza-green">
                        <HelpCircle size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    <p className="text-gray-500 mt-2">Common questions about this product</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left"
                            >
                                <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-cureza-green" />
                                ) : (
                                    <ChevronDown className="text-gray-400" />
                                )}
                            </button>
                            <div
                                className={`px-5 text-gray-600 leading-relaxed overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
