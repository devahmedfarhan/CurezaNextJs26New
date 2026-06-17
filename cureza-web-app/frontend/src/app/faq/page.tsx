'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, MessageCircle, Mail } from 'lucide-react';
import * as Icons from 'lucide-react';
import HELP_TOPICS from '@/data/help-faqs.json';

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTopics = HELP_TOPICS.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-[#F8F3EF] min-h-screen pb-16 text-[#052326]">
            {/* Header Section */}
            <div className="bg-white border-b border-[#052326]/12 pb-12 pt-10 px-6">
                <div className="container mx-auto max-w-3xl text-center space-y-6">
                    <div className="space-y-2">
                        <span className="text-[#052326] font-bold tracking-wider uppercase text-[10px] px-3.5 py-1 bg-[#052326]/5 rounded-full border border-[#052326]/10">
                            Cureza Help Center
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[#052326] tracking-tight">
                            How can we help you today?
                        </h1>
                        <p className="text-[#052326]/60 text-xs font-light max-w-md mx-auto">
                            Search for answers, browse categories, or connect with our support team instantly.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search help articles..."
                            className="w-full pl-5 pr-16 py-3.5 rounded-[10px] border border-[#052326]/12 bg-[#F8F3EF]/50 text-sm outline-none transition focus:border-[#052326] focus:ring-1 focus:ring-[#052326] focus:bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="absolute right-0 top-0 h-full w-14 flex items-center justify-center bg-[#052326] text-[#F8F3EF] rounded-r-[10px] hover:bg-[#052326]/90 transition">
                            <Search size={18} />
                        </button>
                    </div>

                    {/* Suggestion Chips */}
                    <div className="flex flex-wrap gap-2.5 justify-center text-[10px] font-bold uppercase tracking-wider">
                        <Link href="/track-order" className="px-3.5 py-1.5 bg-[#F8F3EF] border border-[#052326]/8 rounded-full text-[#052326]/75 hover:bg-[#052326] hover:text-[#F8F3EF] transition">
                            Track Order
                        </Link>
                        <Link href="/legal/cancellation-returns" className="px-3.5 py-1.5 bg-[#F8F3EF] border border-[#052326]/8 rounded-full text-[#052326]/75 hover:bg-[#052326] hover:text-[#F8F3EF] transition">
                            Return / Refund
                        </Link>
                        <Link href="/contact" className="px-3.5 py-1.5 bg-[#F8F3EF] border border-[#052326]/8 rounded-full text-[#052326]/75 hover:bg-[#052326] hover:text-[#F8F3EF] transition">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-10 max-w-6xl space-y-10">
                {/* Login Prompt Banner */}
                <div className="bg-white p-6 rounded-[12px] border border-[#052326]/12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-premium-light">
                    <div>
                        <h3 className="font-bold text-sm text-[#052326]">Getting personalized help?</h3>
                        <p className="text-[#052326]/60 text-xs font-light mt-0.5">Log in to view orders, check prescription status, and contact your doctor.</p>
                    </div>
                    <Link href="/login" className="bg-[#052326] text-[#F8F3EF] px-6 py-2.5 rounded-[10px] text-xs font-bold uppercase tracking-wider hover:bg-[#052326]/90 transition whitespace-nowrap shadow">
                        Log In
                    </Link>
                </div>

                {/* Topics Grid */}
                <div className="space-y-6">
                    <h2 className="text-xs font-bold text-[#052326]/40 uppercase tracking-widest">Browse Topics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTopics.map((topic) => {
                            const IconComponent = (Icons as any)[topic.icon] || Icons.HelpCircle;
                            return (
                                <Link 
                                    key={topic.id} 
                                    href={`/faq/${topic.id}`} 
                                    className="bg-white p-6 rounded-[12px] border border-[#052326]/12 hover:shadow-md hover:border-[#052326]/30 transition group flex flex-col h-44 justify-between"
                                >
                                    <div className="space-y-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#052326]/5 flex items-center justify-center text-[#052326] group-hover:bg-[#052326] group-hover:text-white transition">
                                            <IconComponent size={16} />
                                        </div>
                                        <h3 className="font-bold text-sm text-[#052326] tracking-tight">{topic.title}</h3>
                                        <p className="text-xs text-[#052326]/50 line-clamp-2 font-light leading-relaxed">{topic.description}</p>
                                    </div>
                                    <div className="flex justify-end items-center text-[10px] font-bold uppercase tracking-wider text-[#052326]/40 group-hover:text-[#052326] transition">
                                        <span>Explore</span>
                                        <ChevronRight size={12} className="ml-1" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / Contact */}
                <div className="pt-12 border-t border-[#052326]/12 text-center max-w-xl mx-auto space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-extrabold font-heading text-xl text-[#052326]">Need More Help?</h3>
                        <p className="text-[#052326]/60 text-xs font-light leading-relaxed">
                            Our support team is here to assist you with orders, returns, product issues,
                            and anything else you need. Connect with us anytime.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* Chat Button */}
                        <Link href="/contact" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-[10px] text-xs font-bold uppercase tracking-wider transition shadow w-full sm:w-auto">
                            <MessageCircle size={16} />
                            <span>Contact Us Form</span>
                        </Link>

                        {/* Email Button */}
                        <a href="mailto:help@cureza.in" className="flex items-center justify-center gap-2 px-6 py-2.5 border border-[#052326]/12 text-[#052326] hover:bg-white rounded-[10px] text-xs font-bold uppercase tracking-wider transition w-full sm:w-auto">
                            <Mail size={16} />
                            <span>Email help@cureza.in</span>
                        </a>
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/40">
                        24/7 Support • Safe & Secure Assistance
                    </div>
                </div>

            </div>
        </div>
    );
}
