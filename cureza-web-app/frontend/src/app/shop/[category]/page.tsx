'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface APIProduct {
    id: number;
    title: string;
    brand: any;
    price: string;
    original_price: string;
    rating: string;
    reviews: number;
    image: string;
    tag: string;
    description: string;
    slug: string;
    category: any;
    images?: string[];
}

export default function CategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState<string>('');

    useEffect(() => {
        if (categorySlug) {
            fetchProducts();
        }
    }, [categorySlug]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/products?category=${categorySlug}`);
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

            // Set category name from the first product if available, or capitalize slug
            if (mappedProducts.length > 0 && mappedProducts[0].category) {
                setCategoryName(typeof mappedProducts[0].category === 'object' ? mappedProducts[0].category.name : mappedProducts[0].category);
            } else {
                setCategoryName(categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
            }
        } catch (error) {
            console.error('Failed to fetch category products', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
                <Loader2 className="animate-spin text-cureza-green" size={48} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="text-sm text-gray-500 mb-2">
                    <a href="/" className="hover:text-cureza-green">Home</a> / <a href="/shop" className="hover:text-cureza-green">Shop</a> / <span className="text-gray-900 capitalize">{categoryName}</span>
                </div>
                <h1 className="text-3xl font-bold text-charcoal capitalize">{categoryName}</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters (Simplified for now) */}
                <aside className="w-full md:w-64 space-y-8 hidden md:block">
                    <div>
                        <h3 className="font-bold mb-4">Filters</h3>
                        <p className="text-sm text-gray-500">Additional filters coming soon.</p>
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
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500">We couldn't find any products in the <span className="font-bold capitalize">{categoryName}</span> category.</p>
                            <a href="/shop" className="inline-block mt-4 text-cureza-green hover:underline font-medium">Browse all products</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
