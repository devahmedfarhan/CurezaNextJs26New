'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import FAQS from '@/data/home-faqs.json';

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-gray-100 mb-8 text-center">
                Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
                {FAQS.map((faq, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-900 overflow-hidden"
                        style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                            borderColor: 'rgba(85, 85, 85, 0.18)',
                            boxShadow: 'none',
                            filter: 'none'
                        }}
                    >
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            <span className="font-semibold text-charcoal dark:text-gray-100 pr-4">
                                {faq.question}
                            </span>
                            <ChevronDown
                                size={20}
                                className={`flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                }`}
                        >
                            <p className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                                {faq.answer}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
