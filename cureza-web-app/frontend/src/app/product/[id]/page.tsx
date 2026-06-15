'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/api';
// Components
import ProductDetail from '@/components/product/ProductDetail';
import ImageGallery from '@/components/product-details/ImageGallery';
import ProductInfo from '@/components/product-details/ProductInfo';
import TabsSection from '@/components/product-details/TabsSection';
import SellerInfoCard from '@/components/product-details/SellerInfoCard';
import ProductBanners from '@/components/product-details/ProductBanners';
import ProductFAQ from '@/components/product-details/ProductFAQ';
import ProductReviews from '@/components/product/ProductReviews';
import ProductCarousel from '@/components/product/ProductCarousel';
import ProductRecommendations from '@/components/product/ProductRecommendations';
import { getRelatedProducts, getUpsellProducts, getRecentlyViewedProducts } from '@/lib/api/products';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchProduct(params.id as string);
        }
    }, [params.id]);

    const fetchProduct = async (id: string) => {
        try {
            const response = await axios.get(`/products/${id}`);
            const prod = response.data;
            if (prod && prod.category && prod.slug) {
                const categorySlug = typeof prod.category === 'object' ? prod.category.slug : (prod.category.toLowerCase() || 'general');
                router.replace(`/shop/${categorySlug}/${prod.slug}`);
            } else {
                setProduct(prod);
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Failed to fetch product:', err);
            setError('Product not found');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-32 flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cureza-green"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
                <p className="text-gray-600 mb-8">The product you are looking for does not exist or has been removed.</p>
                <a href="/shop" className="px-6 py-3 bg-cureza-green text-white rounded-lg font-bold hover:bg-green-700 transition">Back to Shop</a>
            </div>
        );
    }

    // MAIN PDP LAYOUT
    return (
        <div className="bg-white dark:bg-gray-950 min-h-screen">
            {/* Breadcrumb could go here */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                    {/* LEFT COLUMN: Gallery */}
                    <div className="lg:col-span-7 space-y-8">
                        <ImageGallery
                            images={product.images || [product.image]}
                            mainImage={product.image}
                            title={product.title}
                        />
                    </div>

                    {/* RIGHT COLUMN: Info & Seller */}
                    <div className="lg:col-span-5 space-y-8">
                        <ProductInfo product={product} />
                        <SellerInfoCard seller={product.seller} />
                    </div>
                </div>

                {/* Banners (A+ Content) */}
                <ProductBanners banners={product.banners} />

                {/* FULL WIDTH: Tabs */}
                <TabsSection product={product} />

                {/* FULL WIDTH: FAQ */}
                <ProductFAQ faqs={product.faqs} />

                {/* FULL WIDTH: Reviews */}
                <ProductReviews
                    productId={product.id}
                    productName={product.title || product.name}
                />

                {/* Recommendations Section */}
                <ProductRecommendations product={product} />
            </div>
        </div>
    );
}
