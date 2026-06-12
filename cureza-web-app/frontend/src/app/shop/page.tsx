'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

interface APIProduct {
    id: number;
    title: string;
    brand: string;
    price: string;
    original_price: string;
    rating: string;
    reviews: number;
    image: string;
    tag: string;
    description: string;
    slug: string;
    category: string;
    images?: string[];
}

export default function ShopPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/products')
            .then(res => {
                const mappedProducts = res.data.map((p: APIProduct) => ({
                    id: p.id,
                    title: p.title,
                    brand: p.brand,
                    price: Number(p.price),
                    originalPrice: p.original_price ? Number(p.original_price) : undefined,
                    rating: Number(p.rating),
                    reviews: p.reviews,
                    image: p.image,
                    images: p.images,
                    tag: p.tag,
                    slug: p.slug,
                    category: p.category
                }));
                setProducts(mappedProducts);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cureza-green"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-charcoal mb-8">Shop All Products</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters (Mock) */}
                <aside className="w-full md:w-64 space-y-8 hidden md:block">
                    <div>
                        <h3 className="font-bold mb-4">Categories</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><label className="flex items-center gap-2"><input type="checkbox" /> Ayurveda</label></li>
                            <li><label className="flex items-center gap-2"><input type="checkbox" /> Herbal Supplements</label></li>
                            <li><label className="flex items-center gap-2"><input type="checkbox" /> Personal Care</label></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">Price Range</h3>
                        <input type="range" className="w-full accent-cureza-green" />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>₹0</span>
                            <span>₹5000+</span>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No products found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
