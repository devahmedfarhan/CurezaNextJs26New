'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import BundleOfferCard from './BundleOfferCard';
import ProductCarousel from './ProductCarousel';
import { getRelatedProducts, getUpsellProducts, getRecentlyViewedProducts, getProductBundles } from '@/lib/api/products';

interface ProductRecommendationsProps {
    product: any;
}

export default function ProductRecommendations({ product }: ProductRecommendationsProps) {
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
    const [bundles, setBundles] = useState<any[]>([]);

    useEffect(() => {
        if (!product?.id) return;

        // Record view
        api.post(`/user/products/${product.id}/view`).catch(() => { });

        // Fetch recommendations
        const fetchAll = async () => {
            try {
                const [related, upsell, recent, productBundles] = await Promise.all([
                    getRelatedProducts(product.id).catch(() => []),
                    getUpsellProducts(product.id).catch(() => []),
                    getRecentlyViewedProducts().catch(() => []),
                    getProductBundles(product.id).catch(() => [])
                ]);
                setRelatedProducts(related);
                setUpsellProducts(upsell);
                setRecentlyViewed(recent);
                setBundles(productBundles);
            } catch (err) {
                console.error('Failed to fetch recommendations:', err);
            }
        };

        fetchAll();
    }, [product?.id]);

    return (
        <div className="space-y-4">
            {bundles.map(bundle => (
                <BundleOfferCard key={bundle.id} bundle={bundle} mainProduct={product} />
            ))}
            <ProductCarousel title="Related Products" products={relatedProducts} />
            <ProductCarousel title="You May Also Like" products={upsellProducts} />
            <ProductCarousel title="Recently Viewed" products={recentlyViewed} />
        </div>
    );
}
