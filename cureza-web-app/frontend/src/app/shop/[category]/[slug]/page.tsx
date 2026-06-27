import ImageGallery from '@/components/product-details/ImageGallery';
import ProductInfo from '@/components/product-details/ProductInfo';
import TabsSection from '@/components/product-details/TabsSection';
import ProductBanners from '@/components/product-details/ProductBanners';
import ProductFAQ from '@/components/product-details/ProductFAQ';
import ProductReviews from '@/components/product/ProductReviews';
import ProductRecommendations from '@/components/product/ProductRecommendations';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
    const { category, slug } = await params;

    let product = null;

    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${backendUrl}/api/products/${slug}`, {
            next: { revalidate: 300 }
        });
        if (res.ok) {
            const apiData = await res.json();

            // Map API data to frontend structure (Comprehensive Mapping)
            product = {
                ...apiData, // Spread original data to preserve all snake_case fields
                id: apiData.id,
                title: apiData.title,
                slug: apiData.slug,
                price: parseFloat(apiData.price),
                originalPrice: parseFloat(apiData.original_price),
                original_price: parseFloat(apiData.original_price),
                rating: parseFloat(apiData.rating) || 0,
                reviews_count: apiData.reviews_count || 0,
                // Preserve both camelCase (legacy) and snake_case (standard)
                shortDescription: apiData.short_description,
                short_description: apiData.short_description,
                long_description: apiData.long_description,
                longDescription: apiData.long_description,
                description: apiData.long_description,
                stockStatus: apiData.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock',
                boughtLastMonth: apiData.bought_last_month || 0,
                // Relations
                category: apiData.category || { name: 'General' },
                brand: apiData.brand || { name: 'Generic' },
                concern: apiData.concern || null,
                // Default rich fields if not present
                benefits: apiData.additional_info?.benefits || '<ul><li>Premium Quality</li><li>Authentic Sourcing</li></ul>',
                ingredients: apiData.additional_info?.ingredients || 'Natural Ingredients',
                howToUse: apiData.additional_info?.how_to_use || 'Follow instructions on package.',
                precautions: apiData.additional_info?.precautions || 'Keep away from children.',
                labReport: apiData.additional_info?.lab_report || null,
                // Variants
                variants: apiData.variants || [],
            };
        } else {
            console.warn(`Product not found in API (Status: ${res.status} for slug: ${slug})`);
        }
    } catch (error) {
        console.error('Failed to fetch product:', error);
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
                <p className="text-gray-600 mb-8">The product you are looking for does not exist or has been removed.</p>
                <a href="/shop" className="px-6 py-3 bg-cureza-green text-white rounded-lg font-bold hover:bg-green-700 transition">Back to Shop</a>
            </div>
        );
    }

    return (
        <main className="bg-gray-50 min-h-screen pb-20">
            {/* Breadcrumbs */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-cureza-green"><Home size={14} /></Link>
                    <ChevronRight size={14} />
                    <Link href="/shop" className="hover:text-cureza-green">Shop</Link>
                    <ChevronRight size={14} />
                    <Link href={`/shop/${category}`} className="capitalize hover:text-cureza-green">{category.replace(/-/g, ' ')}</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.title}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 space-y-8">
                {/* Top Section: Gallery & Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <ImageGallery
                        images={product.images || []}
                        mainImage={product.image}
                        video_url={product.video_url}
                        video_file={product.video_file}
                        video_cover={product.video_cover}
                        title={product.title}
                    />
                    <ProductInfo product={product} />
                </div>

                {/* Tabs Section (Reviews, Ingredients, etc.) */}
                <TabsSection product={product} />

                {/* A+ Content Banners */}
                <ProductBanners banners={product.banners} />

                {/* Product FAQ */}
                <ProductFAQ faqs={product.faqs} />

                {/* Reviews Section */}
                <div id="reviews-section" className="scroll-mt-24">
                    <ProductReviews productId={product.id} productName={product.title} />
                </div>

                {/* Recommendations Section */}
                <ProductRecommendations product={product} />
            </div>
        </main>
    );
}
