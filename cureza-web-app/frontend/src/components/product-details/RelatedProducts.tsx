'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/api';
import { getImageUrl } from '@/lib/imageHelper';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface RelatedProductsProps {
    categoryId?: number;
    currentProductId: number;
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!categoryId) return;
            try {
                // Fetch products from same category (simple logic)
                // In real app, this should be a dedicated 'related' endpoint
                const response = await axios.get(`/products?category_id=${categoryId}&limit=6`);
                const productData = Array.isArray(response.data) ? response.data : response.data.data || [];
                // Filter out current product
                const related = productData.filter((p: any) => p.id !== currentProductId).slice(0, 4);
                setProducts(related);
            } catch (error) {
                console.error("Failed to load related products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [categoryId, currentProductId]);

    if (loading || products.length === 0) return null;

    return (
        <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Similar Products</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        <div className="aspect-[4/5] bg-gray-50 dark:bg-gray-900 relative">
                            <img
                                src={getImageUrl(product.image)}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Badge */}
                            {product.stock_status !== 'in_stock' && (
                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                                    OUT OF STOCK
                                </span>
                            )}
                        </div>

                        <div className="p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.brand?.name}</p>
                            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-cureza-green transition-colors">
                                {product.title}
                            </h3>

                            <div className="flex items-center gap-1 mb-3">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {product.rating || 0}
                                </span>
                                <span className="text-xs text-gray-400">({product.reviews_count})</span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    ₹{product.price}
                                </span>
                                {product.original_price > product.price && (
                                    <>
                                        <span className="text-sm text-gray-400 line-through">₹{product.original_price}</span>
                                        <span className="text-xs font-bold text-green-600">
                                            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
