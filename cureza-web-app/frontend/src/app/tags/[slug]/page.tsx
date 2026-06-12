'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { Tag } from 'lucide-react';

interface TagData {
    id: number;
    name: string;
    slug: string;
    description: string;
    products: any[];
}

export default function TagPage() {
    const params = useParams();
    const [tagData, setTagData] = useState<TagData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTagData = async () => {
            if (!params.slug) return;

            try {
                const response = await api.get(`/tags/${params.slug}`);
                setTagData(response.data);
            } catch (error) {
                console.error('Failed to fetch tag data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTagData();
    }, [params.slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cureza-green"></div>
            </div>
        );
    }

    if (!tagData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
                <Tag size={48} className="mb-4 text-gray-300" />
                <h1 className="text-2xl font-bold text-gray-900">Tag Not Found</h1>
                <p>The tag you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                        <Tag size={24} className="text-cureza-green" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {tagData.name}
                    </h1>
                    {tagData.description && (
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {tagData.description}
                        </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                        {tagData.products.length} Products Found
                    </p>
                </div>

                {/* Product Grid */}
                {tagData.products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tagData.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-gray-500">No products found with this tag.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
