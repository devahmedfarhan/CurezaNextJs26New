import React from "react";
import { Metadata } from 'next';
import pageData from '@/data/legal-pages/privacy-policy.json';

export const metadata: Metadata = {
    title: 'Privacy Policy - Cureza | Data Protection & User Privacy',
    description: 'Read Cureza\'s Privacy Policy to understand how we collect, use, and protect your personal information. Learn about cookies, data retention, user rights, and GDPR compliance.',
};

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-8">
                    {/* Header */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        {pageData.title}
                    </h1>
                    {pageData.description && (
                        <p className="text-sm text-gray-600 mt-2">
                            {pageData.description}
                        </p>
                    )}

                    <div className="text-xs text-gray-500 mt-3">
                        <span className="font-medium">LAST UPDATED:</span> {new Date(pageData.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>

                    <hr className="my-6 border-gray-200" />

                    {/* Dynamic HTML Content */}
                    <div 
                        className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed dynamic-legal-content"
                        dangerouslySetInnerHTML={{ __html: pageData.content }} 
                    />

                    {/* Footer */}
                    <hr className="my-6 border-gray-200" />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Cureza — All rights reserved.</p>
                        <a href="/" className="text-sm text-indigo-600 hover:underline">Back to Home</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
