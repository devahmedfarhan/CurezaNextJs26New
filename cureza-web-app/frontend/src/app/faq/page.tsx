'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, MessageCircle, Mail, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import HELP_TOPICS from '@/data/help-faqs.json';

interface SearchResult {
    topicId: string;
    topicTitle: string;
    faqId: string;
    q: string;
    a: string;
}

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            if (q) {
                setSearchQuery(q);
            }
        }
    }, []);

    const filteredTopics = HELP_TOPICS.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Deep search helper
    const getSearchResults = (): SearchResult[] => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        HELP_TOPICS.forEach(topic => {
            topic.subTopics?.forEach(subTopic => {
                subTopic.faqs.forEach(faq => {
                    if (
                        faq.q.toLowerCase().includes(query) ||
                        faq.a.toLowerCase().includes(query) ||
                        topic.title.toLowerCase().includes(query) ||
                        subTopic.title.toLowerCase().includes(query)
                    ) {
                        results.push({
                            topicId: topic.id,
                            topicTitle: topic.title,
                            faqId: faq.id,
                            q: faq.q,
                            a: faq.a
                        });
                    }
                });
            });
        });
        return results;
    };

    const searchResults = getSearchResults();
    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="bg-[#F8F3EF] min-h-screen pb-16 text-[#052326]">
            {/* Header Section with Botanical Green Gradient */}
            <div 
                className="pb-12 pt-12 px-4 md:px-6 border-b border-[#052326]/12"
                style={{
                    background: 'linear-gradient(135deg, #052326 0%, #0A4347 100%)'
                }}
            >
                <div className="container mx-auto px-4 md:px-6 text-center space-y-6">
                    <div className="space-y-3">
                        <span className="inline-block text-[#D4AF37] font-medium tracking-wide text-xs px-3.5 py-1 bg-white/10 rounded-full border border-white/20">
                            Cureza Help Center
                        </span>
                        <h1 className="text-3xl md:text-4xl font-semibold font-heading text-white tracking-tight">
                            How can we help you today?
                        </h1>
                        <p className="text-[#F8F3EF]/75 text-xs font-light max-w-md mx-auto leading-relaxed">
                            Search for answers, browse categories, or connect with our support team instantly.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search help articles..."
                            className="w-full pl-5 pr-16 py-3.5 rounded-[8px] border border-white/20 bg-white/10 text-white placeholder-white/50 text-sm outline-none transition focus:border-white focus:ring-1 focus:ring-white focus:bg-white focus:text-[#052326] focus:placeholder-[#052326]/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="absolute right-0 top-0 h-full w-14 flex items-center justify-center bg-[#D4AF37] text-[#052326] rounded-r-[8px] hover:bg-[#F0C417] transition">
                            <Search size={18} />
                        </button>
                    </div>

                    {/* Suggestion Chips */}
                    <div className="flex flex-wrap gap-2.5 justify-center text-xs font-medium tracking-normal">
                        <Link 
                            href="/track-order" 
                            className="px-4 py-2 bg-white/10 border border-white/15 rounded-full text-[#F8F3EF] hover:bg-white hover:text-[#052326] transition"
                        >
                            Track Order
                        </Link>
                        <Link 
                            href="/legal/cancellation-returns" 
                            className="px-4 py-2 bg-white/10 border border-white/15 rounded-full text-[#F8F3EF] hover:bg-white hover:text-[#052326] transition"
                        >
                            Return / Refund
                        </Link>
                        <Link 
                            href="/contact" 
                            className="px-4 py-2 bg-white/10 border border-white/15 rounded-full text-[#F8F3EF] hover:bg-white hover:text-[#052326] transition"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-10 space-y-10">
                {/* Search Results vs Browse Topics */}
                {isSearching ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xs font-semibold text-[#052326]/60 tracking-wider">
                                Search Results for "{searchQuery}"
                            </h2>
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="text-xs text-[#D4AF37] hover:underline font-medium"
                            >
                                Clear Search
                            </button>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {searchResults.map((result, idx) => (
                                    <Link 
                                        key={idx}
                                        href={`/faq/${result.topicId}/${result.faqId}`}
                                        className="bg-white p-6 transition group flex flex-col justify-between hover:border-[#052326]/40"
                                        style={{
                                            borderRadius: '8px',
                                            border: '1px solid rgba(85, 85, 85, 0.18)',
                                            boxShadow: 'none',
                                            filter: 'none'
                                        }}
                                    >
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-semibold text-[#D4AF37] tracking-wider">
                                                {result.topicTitle}
                                            </span>
                                            <h3 className="font-semibold text-sm text-[#052326] tracking-tight group-hover:text-[#D4AF37] transition">
                                                {result.q}
                                            </h3>
                                            <p className="text-xs text-[#052326]/60 font-light leading-relaxed line-clamp-2">
                                                {result.a}
                                            </p>
                                        </div>
                                        <div className="flex justify-end items-center text-xs font-semibold text-[#052326]/40 group-hover:text-[#052326] transition mt-4">
                                            <span>Read Article</span>
                                            <ChevronRight size={14} className="ml-1" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div 
                                className="bg-white p-8 text-center text-[#052326]/60 text-xs font-light"
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid rgba(85, 85, 85, 0.18)',
                                    boxShadow: 'none',
                                    filter: 'none'
                                }}
                            >
                                No matching articles found. Try searching for other keywords or browse categories below.
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Login Prompt Banner */}
                <div 
                    className="bg-white p-6 flex flex-col md:flex-row items-center justify-between gap-4"
                    style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(85, 85, 85, 0.18)',
                        boxShadow: 'none',
                        filter: 'none'
                    }}
                >
                    <div>
                        <h3 className="font-semibold text-sm text-[#052326]">Getting personalized help?</h3>
                        <p className="text-[#052326]/60 text-xs font-light mt-0.5">Log in to view orders, check prescription status, and contact your doctor.</p>
                    </div>
                    <Link 
                        href="/login" 
                        className="bg-[#052326] text-[#F8F3EF] px-6 py-2.5 rounded-[8px] text-xs font-semibold tracking-wide hover:bg-[#052326]/90 transition whitespace-nowrap"
                    >
                        Log In
                    </Link>
                </div>

                {/* Topics Grid */}
                <div className="space-y-6">
                    <h2 className="text-xs font-semibold text-[#052326]/40 tracking-wider">
                        {isSearching ? 'Browse All Topics' : 'Browse Topics'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTopics.map((topic) => {
                            const IconComponent = (Icons as any)[topic.icon] || HelpCircle;
                            return (
                                <Link 
                                    key={topic.id} 
                                    href={`/faq/${topic.id}`} 
                                    className="bg-white p-6 transition group flex flex-col h-44 justify-between hover:border-[#052326]/40"
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid rgba(85, 85, 85, 0.18)',
                                        boxShadow: 'none',
                                        filter: 'none'
                                    }}
                                >
                                    <div className="space-y-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#052326]/5 flex items-center justify-center text-[#052326] group-hover:bg-[#D4AF37] group-hover:text-[#052326] transition">
                                            <IconComponent size={16} />
                                        </div>
                                        <h3 className="font-semibold text-sm text-[#052326] tracking-tight group-hover:text-[#D4AF37] transition">
                                            {topic.title}
                                        </h3>
                                        <p className="text-xs text-[#052326]/50 line-clamp-2 font-light leading-relaxed">
                                            {topic.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-end items-center text-xs font-semibold text-[#052326]/40 group-hover:text-[#052326] transition">
                                        <span>Explore</span>
                                        <ChevronRight size={14} className="ml-1" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / Contact */}
                <div className="pt-12 border-t border-[#052326]/12 text-center max-w-xl mx-auto space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold font-heading text-xl text-[#052326]">Need More Help?</h3>
                        <p className="text-[#052326]/60 text-xs font-light leading-relaxed">
                            Our support team is here to assist you with orders, returns, product issues,
                            and anything else you need. Connect with us anytime.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* Chat Button */}
                        <Link 
                            href="/contact" 
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-[8px] text-xs font-semibold tracking-wide transition w-full sm:w-auto"
                        >
                            <MessageCircle size={16} />
                            <span>Contact Us Form</span>
                        </Link>

                        {/* Email Button */}
                        <a 
                            href="mailto:help@cureza.in" 
                            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-[#052326]/12 text-[#052326] hover:bg-white rounded-[8px] text-xs font-semibold tracking-wide transition w-full sm:w-auto"
                        >
                            <Mail size={16} />
                            <span>Email help@cureza.in</span>
                        </a>
                    </div>

                    <div className="text-xs font-semibold tracking-wide text-[#052326]/40">
                        24/7 Support • Safe & Secure Assistance
                    </div>
                </div>
            </div>
        </div>
    );
}
