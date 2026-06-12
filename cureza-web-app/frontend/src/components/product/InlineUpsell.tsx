'use client';

import { useEffect, useState } from 'react';
import { getUpsellProducts } from '@/lib/api/products';
import ProductCard from '@/components/product/ProductCard';

interface InlineUpsellProps {
    productId: number | string;
    categoryId?: number | string;
}

export default function InlineUpsell({ productId }: InlineUpsellProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;

        const fetchUpsells = async () => {
            try {
                // Fetch recommended products
                const data = await getUpsellProducts(productId);
                // Take only 3 or 4 products
                setProducts(data.slice(0, 4));
            } catch (error) {
                console.error("Failed to load upsells", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpsells();
    }, [productId]);

    if (!loading && products.length === 0) return null;

    if (loading) {
        return (
            <div className="pt-6 animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[4/5] bg-gray-100 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-8 border-t border-dashed border-gray-200 dark:border-gray-800 mt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                You May Also Like
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {products.map((product) => (
                    <div key={product.id} className="min-w-0">
                        {/* We use a wrapper to force smaller sizing if needed, 
                            but ProductCard is responsive. We might want to pass a 'compact' prop 
                            if ProductCard supported it, but for now relying on grid sizing. 
                            We simply scale it down slightly to look "small" as requested. */}
                        <div className="transform scale-95 origin-top-left w-[105%]">
                            <ProductCard product={product} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
