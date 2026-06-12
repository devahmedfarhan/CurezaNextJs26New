'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import api from '@/lib/api';
import { getImageUrl } from '@/lib/imageHelper';
import { X, Star, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useCompareStore } from '@/store/useCompareStore';

function CompareContent() {
    const searchParams = useSearchParams();
    const idsParam = searchParams.get('ids');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { removeItem } = useCompareStore();

    useEffect(() => {
        const fetchComparison = async () => {
            if (!idsParam) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                // Convert comma-separated string to array for Laravel's 'ids' array validation
                const idsArray = idsParam.split(',');

                // Use params object so axios serializes it correctly (ids[]=1&ids[]=2)
                const response = await api.get('/products/compare', {
                    params: { ids: idsArray }
                });
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch comparison", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, [idsParam]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">

                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-48 bg-gray-200 rounded mb-4"></div>
                        <div className="h-64 w-full max-w-4xl bg-gray-100 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || !data.products || data.products.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col">

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <AlertCircle size={48} className="text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No products to compare</h2>
                    <p className="text-gray-500 mb-6">Select products from the search page to compare them.</p>
                    <Link href="/search" className="bg-cureza-green text-white px-6 py-2 rounded-full font-bold">
                        Go to Search
                    </Link>
                </div>

            </div>
        );
    }

    const { products, attributes_map } = data;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">


            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Compare Products</h1>

                <div className="overflow-x-auto pb-8">
                    <table className="w-full min-w-[800px] bg-white rounded-2xl shadow-sm border-separate border-spacing-0 overflow-hidden">
                        <thead>
                            <tr>
                                <th className="p-4 bg-gray-50 border-b border-gray-100 w-48 sticky left-0 z-10 text-left font-semibold text-gray-500">Feature</th>
                                {products.map((product: any) => (
                                    <th key={product.id} className="p-4 border-b border-gray-100 min-w-[200px] relative group">
                                        <button
                                            onClick={() => removeItem(product.id)}
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 bg-white rounded-full p-1 opacity-100"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="flex flex-col items-center text-center gap-3">
                                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                                                <img src={getImageUrl(product.image)} alt={product.title} className="w-full h-full object-cover" />
                                            </div>
                                            <Link href={`/shop/product/${product.slug}`} className="font-bold text-gray-900 hover:text-cureza-green line-clamp-2 h-10">
                                                {product.title}
                                            </Link>
                                            <div className="text-lg font-bold text-cureza-green">₹{product.price}</div>
                                            <Link
                                                href={`/shop/product/${product.slug}`}
                                                className="w-full bg-black text-white py-2 rounded-full text-xs font-bold hover:bg-gray-800"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Brand */}
                            <tr>
                                <td className="p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-700 sticky left-0 z-10">Brand</td>
                                {products.map((product: any) => (
                                    <td key={product.id} className="p-4 border-b border-gray-100 text-center text-sm font-semibold text-gray-600">
                                        {typeof product.brand === 'object' ? product.brand?.name : product.brand}
                                    </td>
                                ))}
                            </tr>

                            {/* Rating */}
                            <tr>
                                <td className="p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-700 sticky left-0 z-10">Rating</td>
                                {products.map((product: any) => (
                                    <td key={product.id} className="p-4 border-b border-gray-100 text-center">
                                        <div className="flex items-center justify-center gap-1 text-yellow-500 text-sm font-bold">
                                            <Star size={14} fill="currentColor" /> {product.rating || 'N/A'}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Dynamic Attributes */}
                            {attributes_map && attributes_map.map((attr: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-700 sticky left-0 z-10">{attr.name}</td>
                                    {products.map((product: any) => (
                                        <td key={product.id} className="p-4 border-b border-gray-100 text-center text-sm text-gray-600">
                                            {attr.values[product.id]}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            {/* Description - Brief */}
                            <tr>
                                <td className="p-4 bg-gray-50 font-medium text-gray-700 sticky left-0 z-10">Summary</td>
                                {products.map((product: any) => (
                                    <td key={product.id} className="p-4 text-center text-xs text-gray-500 leading-relaxed min-w-[200px]">
                                        {product.short_description || product.description?.substring(0, 100) + '...'}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>

        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompareContent />
        </Suspense>
    );
}
