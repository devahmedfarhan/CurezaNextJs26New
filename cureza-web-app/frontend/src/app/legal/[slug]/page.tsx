import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

async function getPageData(slug: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    try {
        // Try fetching from the backend API first
        const res = await fetch(`${backendUrl}/api/public/legal-pages/${slug}`, {
            cache: 'no-store',
        });
        if (res.ok) {
            return await res.json();
        }
    } catch (error) {
        console.error(`Failed to fetch dynamic page from backend for slug: ${slug}`, error);
    }

    // Fallback: Try loading from the local JSON file on the frontend
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'src/data/legal-pages', `${slug}.json`);
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error(`Failed to read fallback file for slug: ${slug}`, error);
    }

    return null;
}

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const pageData = await getPageData(slug);
    if (!pageData) {
        return {
            title: 'Page Not Found - Cureza',
        };
    }
    return {
        title: `${pageData.title} - Cureza`,
        description: pageData.description || `Read the ${pageData.title} page on Cureza.`,
    };
}

export default async function DynamicLegalPage({ params }: PageProps) {
    const { slug } = await params;
    const pageData = await getPageData(slug);

    if (!pageData) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl border border-gray-100">
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

                    {pageData.updated_at && (
                        <div className="text-xs text-gray-500 mt-3">
                            <span className="font-medium">LAST UPDATED:</span> {new Date(pageData.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    )}

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
