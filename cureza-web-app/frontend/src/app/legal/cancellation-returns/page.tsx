import React from "react";
import { Metadata } from 'next';
import Link from 'next/link';
import pageData from '@/data/legal-pages/cancellation-returns.json';

export const metadata: Metadata = {
    title: 'Cancellation & Refund Policy - Cureza | Returns & Exchanges',
    description: 'Review Cureza\'s cancellation and refund policy. Learn about return windows, eligibility requirements, refund process, and exchange policies. Updated November 2025.',
};

export default function CancellationRefundPolicy() {
    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto max-w-4xl px-6">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-[#052326]/70 font-semibold hover:text-[#052326] transition text-sm">
                        ← Back to Shop
                    </Link>
                </div>

                <div className="bg-white rounded-[14px] border border-[#052326]/12 p-8 md:p-12 shadow-premium-light">
                    {/* Header */}
                    <header className="mb-10 pb-6 border-b border-[#052326]/12">
                        <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[#052326]">
                            {pageData.title}
                        </h1>
                        {pageData.description && (
                            <p className="text-xs text-[#052326]/65 mt-2 font-medium">
                                {pageData.description}
                            </p>
                        )}
                        <div className="text-[10px] text-[#052326]/60 font-semibold uppercase tracking-wider mt-3">
                            <span>LAST UPDATED:</span> {new Date(pageData.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </header>

                    {/* Dynamic HTML Content */}
                    <div 
                        className="prose prose-sm sm:prose max-w-none text-[#052326]/80 leading-relaxed dynamic-legal-content"
                        dangerouslySetInnerHTML={{ __html: pageData.content }} 
                    />

                    <footer className="mt-12 pt-6 border-t border-[#052326]/12 text-center text-xs text-[#052326]/50">
                        © {new Date().getFullYear()} Cureza — All Rights Reserved.
                    </footer>
                </div>
            </div>
        </div>
    );
}
