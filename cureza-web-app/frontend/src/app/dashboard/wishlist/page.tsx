'use client';

import { useState, useEffect } from 'react';

import ProductCard from '@/components/product/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Heart, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Slider from '@/components/common/Slider';

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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#052326] dark:text-gray-100 tracking-tight flex items-center gap-3">
                    <Heart className="text-red-500 fill-red-500" size={24} /> My Wishlist
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                    {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[250px] w-full rounded-[8px]" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                products.length > 4 ? (
                    <Slider>
                        {products.map((product) => (
                            <div key={product.id} className="w-[260px]">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[8px] border border-[#555555]/18 max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-[8px] flex items-center justify-center mx-auto mb-6 text-red-400">
                        <Heart size={28} fill="currentColor" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">Your wishlist is empty</h2>
                    <p className="text-xs text-gray-500 mb-8 max-w-xs mx-auto">
                        Save items you love to view them later.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 bg-[#052326] text-white px-6 py-2.5 rounded-[8px] font-semibold text-xs hover:bg-[#0b4435] transition"
                    >
                        <ShoppingBag size={14} /> Start Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}
