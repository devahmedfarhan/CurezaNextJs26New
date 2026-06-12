'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, MessageCircle } from 'lucide-react';
import { HELP_TOPICS } from '@/data/helpCenterData';

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="bg-white min-h-screen pb-12 font-sans">
            {/* Header Section */}
            <div className="bg-gray-50 border-b border-gray-100 pb-8 pt-6 px-4">
                <div className="container mx-auto max-w-3xl px-4 py-2">
                    {/* Title + Subtitle */}
                    <div className="text-center mb-8 space-y-2">
                        <h1 className=" text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            How can we help you today?
                        </h1>
                        <p className="text-gray-600 text-base">
                            Search for answers, browse categories, or connect with our support team instantly.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search help articles..."
                            className="w-full pl-5 pr-16 py-4 rounded-md border border-gray-200 
                       shadow-md focus:border-cureza-green focus:ring-2 
                       focus:ring-cureza-green/30 outline-none text-gray-800 
                       placeholder-gray-500 text-lg transition"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <button
                            className="absolute right-0 top-0 h-full w-14 flex items-center 
                       justify-center bg-cureza-green hover:bg-cureza-green/90 
                       transition rounded-r-md shadow-md"
                        >
                            <Search className="text-white" size={24} />
                        </button>
                    </div>

                    {/* Suggestion Chips */}
                    <div className="flex flex-wrap gap-3 mt-5 text-sm justify-center">
                        <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer transition">
                            Track Order
                        </span>
                        <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer transition">
                            Return / Refund
                        </span>
                        <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer transition">
                            Payment Issues
                        </span>
                        <span className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 cursor-pointer transition">
                            Account Support
                        </span>
                    </div>
                </div>

            </div>

            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Login Prompt Banner */}
                <div className="bg-green-50 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-green-100">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">Getting help is easy.</h3>
                        <p className="text-gray-600 text-sm">Log in to get help with your recent orders and account.</p>
                    </div>
                    <Link href="/login" className="bg-white text-cureza-green border border-green-200 px-8 py-2.5 rounded-md font-bold hover:bg-green-50 transition whitespace-nowrap shadow-sm">
                        Log In
                    </Link>
                </div>

                {/* Topics Grid */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 capitalize tracking-wide text-sm text-gray-500">Browse Topics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {HELP_TOPICS.map((topic) => (
                            <Link key={topic.id} href={`/faq/${topic.id}`} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg hover:border-green-200 transition group flex flex-col h-40 justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-cureza-green transition-colors">{topic.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{topic.description}</p>
                                </div>
                                <div className="flex justify-end">
                                    <topic.icon className="text-gray-300 group-hover:text-cureza-green transition-colors" size={32} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer / Contact */}
                <div className="pt-12 border-t border-gray-100 mt-12">
                    <div className="max-w-xl mx-auto flex flex-col items-center text-center space-y-6">

                        <div className="space-y-2">
                            <h3 className="font-bold text-2xl text-gray-900">Need More Help?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Our support team is here to assist you with orders, returns, product issues,
                                and anything else you need. Connect with us anytime.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">

                            {/* Chat Button */}
                            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition shadow-md w-full sm:w-auto">
                                <MessageCircle size={20} />
                                <span>Chat with Us</span>
                            </button>

                            {/* Email Button */}
                            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition w-full sm:w-auto">
                                {/* <Mail size={20} /> */}
                                <span>Email Support</span>
                            </button>
                        </div>

                        {/* Trust Text */}
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            {/* <ShieldCheck size={18} 
                            className="text-cureza-green" /> */}
                            <span>24/7 Support • Safe & Secure Assistance</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
