'use client';

import React from "react";
import Link from "next/link";
import { ArrowRight, RotateCw, ShieldCheck } from "lucide-react";
import pageData from '@/data/legal-pages/cancellation-returns.json';

export default function ReturnsPage() {
    const cardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none',
    };

    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto px-4 md:px-6">
                <div style={cardStyle} className="bg-white p-8 md:p-12 space-y-8">
                    
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#052326]/5 flex items-center justify-center mx-auto text-[#052326]">
                            <RotateCw size={24} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-semibold font-heading text-[#052326]">
                            {pageData.title}
                        </h1>
                        <p className="text-xs text-[#052326]/50 max-w-md mx-auto">
                            {pageData.description || 'Quick summary of marketplace returns policies. For complete terms, consult our official legal guidelines.'}
                        </p>
                    </div>

                    <div 
                        className="prose prose-sm max-w-none text-[#052326]/80 leading-relaxed dynamic-legal-content"
                        dangerouslySetInnerHTML={{ __html: pageData.content }} 
                    />

                    <div className="pt-6 border-t border-[#052326]/12 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] text-[#052326]/50 font-semibold tracking-wider flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-[#052326]" /> Safe & Certified Buyer Protection
                        </p>
                        <Link href="/legal/cancellation-returns" className="w-full sm:w-auto bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 px-6 py-2.5 rounded-[8px] text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5">
                            View Full Policy <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
