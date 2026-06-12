'use client';

import { useState } from 'react';
import { getImageUrl } from '@/lib/imageHelper';
import ProductInfo from '@/components/product-details/ProductInfo';
import ProductReviews from '@/components/product/ProductReviews';

interface ProductDetailProps {
    product: any;
}

export default function ProductDetail({ product }: ProductDetailProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden relative border border-gray-100 dark:border-gray-700">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={getImageUrl(product.images[selectedImage])}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                                📦
                            </div>
                        )}

                        {product.tags && product.tags.includes('Prescription Required') && (
                            <span className="absolute top-4 left-4 bg-alert-red text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                Prescription Required
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {product.images && product.images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImage(idx)}
                                className={`aspect-square rounded-lg border-2 overflow-hidden relative ${selectedImage === idx ? 'border-cureza-green' : 'border-transparent'
                                    }`}
                            >
                                <img src={getImageUrl(img)} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <ProductInfo product={product} />
                </div>
            </div>

            {/* Reviews Section */}
            <ProductReviews
                productId={product.id}
                productName={product.title || product.name}
            />
        </>
    );
}

