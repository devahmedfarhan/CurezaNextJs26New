'use client';

import { HelpCircle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function CircleSupportPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { id: 1, q: 'How do I earn XP points?', a: 'You earn XP by shopping, writing reviews, referring friends, and completing daily challenges. Every ₹100 spent gives you 10 XP.' },
        { id: 2, q: 'When do my points expire?', a: 'Points are valid for 12 months from the date they are earned. We will notify you before they expire.' },
        { id: 3, q: 'How do I reach the next tier?', a: 'Tiers are based on your total lifetime XP. Reach 5,000 XP for Silver, 15,000 XP for Gold, and 50,000 XP for Platinum.' },
        { id: 4, q: 'Can I transfer my points?', a: 'No, points are non-transferable and can only be redeemed by the account holder.' },
    ];

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Support & FAQs</h1>
                <p className="text-gray-500">Get help with Cureza Circle rewards</p>
            </div>

            {/* Contact Card */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white text-blue-600 rounded-full shadow-sm">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Need personalized help?</h3>
                        <p className="text-sm text-gray-600">Our support team is available 24/7.</p>
                    </div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Chat with Us
                </button>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">Frequently Asked Questions</h3>
                <div className="space-y-2">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50"
                            >
                                {faq.q}
                                {openFaq === faq.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            {openFaq === faq.id && (
                                <div className="p-4 pt-0 text-gray-600 text-sm bg-gray-50 border-t border-gray-100">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
