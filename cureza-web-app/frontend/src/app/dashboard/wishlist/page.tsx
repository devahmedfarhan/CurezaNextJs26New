'use client';

import { useState, useEffect } from 'react';

import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Heart, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function WishlistPage() {
    const { items } = useWishlist();
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            setLoading(true);
            try {
                let fetchedProducts: any[] = [];

                if (user) {
                    // If logged in, API is source of truth
                    const response = await api.get('/wishlist');
                    console.log("Wishlist API Response:", response.data);
                    fetchedProducts = response.data
                        .map((item: any) => item.product)
                        .filter((p: any) => !!p);
                } else {
                    // Guest: items is array of IDs from localStorage
                    if (items.length > 0) {
                        const response = await api.get(`/products/compare`, {
                            params: { ids: items }
                        });
                        fetchedProducts = response.data.products;
                    }
                }
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Failed to fetch wishlist products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, [user, items]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <Heart className="text-red-500 fill-red-500" /> My Wishlist
                </h1>
                <p className="text-gray-500 mb-8">
                    {products.length} items saved for later
                </p>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Loading State Debug */}
                        <div className="col-span-full text-center text-xs text-gray-400">Loading wishlist...</div>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[250px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-200">
                            <Heart size={40} fill="currentColor" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Save items you love to verify them later.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-cureza-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <ShoppingBag size={20} /> Start Shopping
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
