import React from 'react';
import { Metadata } from 'next';
import SitemapContent from '@/components/common/SitemapContent';

export const metadata: Metadata = {
    title: 'Sitemap - Explore Cureza Wellness Products & Brands',
    description: 'Find your way around Cureza. Browse our collection of premium ayurvedic products, verified medical leaf brands (Vijaya), wellness blogs, and customer policies.',
    keywords: ['sitemap', 'cureza directory', 'wellness products', 'ayurvedic brands', 'vijaya medicine'],
};

export default function VisualSitemapPage() {
    return <SitemapContent />;
}
