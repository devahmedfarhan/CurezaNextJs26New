'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
    {
        question: "What is Cureza?",
        answer: "Cureza is India's leading online marketplace for authentic Ayurvedic and wellness products. We connect verified sellers with customers looking for natural health solutions."
    },
    {
        question: "Is free shipping available?",
        answer: "Yes! We offer free shipping on all orders above ₹499. For orders below this amount, a nominal shipping fee of ₹49 applies."
    },
    {
        question: "Are all products authentic?",
        answer: "Absolutely. All products on Cureza are sourced from verified manufacturers and sellers. We ensure 100% authenticity and quality checks before listing."
    },
    {
        question: "Can I consult with a doctor?",
        answer: "Yes, we have certified Ayurvedic doctors available for online consultations. Book a video consultation starting at just ₹299."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 7-day easy return policy for most products. If you're not satisfied with your purchase, you can return it within 7 days for a full refund."
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track your order from your account dashboard."
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-gray-100 mb-8 text-center">
                Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
                {FAQS.map((faq, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
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
