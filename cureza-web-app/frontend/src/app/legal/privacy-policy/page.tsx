import React from "react";
import { Metadata } from 'next';
import pageData from '@/data/legal-pages/privacy-policy.json';

export const metadata: Metadata = {
    title: 'Privacy Policy - Cureza | Data Protection & User Privacy',
    description: 'Read Cureza\'s Privacy Policy to understand how we collect, use, and protect your personal information. Learn about cookies, data retention, user rights, and GDPR compliance.',
};

export default function PrivacyPolicy() {
    const cardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none',
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div style={cardStyle} className="mx-auto bg-white overflow-hidden">
                <div className="p-8">
                    {/* Header */}
                    <h1 className="text-3xl md:text-4xl font-semibold text-[#052326]">
                        {pageData.title}
                    </h1>
                    {pageData.description && (
                        <p className="text-sm text-[#052326]/60 mt-2">
                            {pageData.description}
                        </p>
                    )}

                    <div className="text-xs text-[#052326]/50 mt-3">
                        <span className="font-semibold">Last Updated:</span> {new Date(pageData.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>

                    <hr className="my-6 border-[#052326]/10" />

                    {/* Dynamic HTML Content */}
                    <div 
                        className="prose prose-sm sm:prose max-w-none text-[#052326]/75 leading-relaxed dynamic-legal-content"
                        dangerouslySetInnerHTML={{ __html: pageData.content }} 
                    />

                    {/* Footer */}
                    <hr className="my-6 border-[#052326]/10" />
                    <div className="flex justify-between items-center text-xs">
                        <p className="text-[#052326]/50">© {new Date().getFullYear()} Cureza — All rights reserved.</p>
                        <a href="/" className="text-sm text-[#052326] font-semibold hover:underline">Back to Home</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
