'use client';

import Link from "next/link";
import { useState } from "react";
import { Heart, Star, Package, Shuffle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import { useCompareStore } from "@/store/useCompareStore";

export default function ProductCard({ product }: any) {
    const [imgSrc, setImgSrc] = useState(product.image);
    const [imageError, setImageError] = useState(false);

    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { showToast } = useToast();
    const { addItem, removeItem, isInCompare } = useCompareStore();

    // Normalize data keys (API snake_case vs Mock camelCase)
    const originalPrice = product.original_price || product.originalPrice;
    const price = product.price;
    const rating = product.rating || "4.5";
    const reviewsCount = product.reviews_count || product.reviews || 0;
    const boughtLastMonth = product.bought_last_month || product.boughtLastMonth || 0;

    // Calculate Discount Percentage
    const discountPercentage = originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const handleCart = (e: any) => {
        e.preventDefault();

        if (product.is_prescription_required) {
            // Redirect to product page if prescription is required
            const link = `/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`;
            window.location.href = link;
            return;
        }

        addToCart(product, 1);
        showToast("Added to cart", "success");
    };

    const handleWishlist = (e: any) => {
        e.preventDefault();
        toggleWishlist(product.id);
    };

    return (
        <div
            className="group bg-white rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100"
        >
            {/* IMAGE AREA */}
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50">
                <Link href={`/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`}>
                    {imageError || !imgSrc ? (
                        <img
                            src="/fallback.png"
                            alt="Product Placeholder"
                            className="w-full h-full object-cover opacity-80"
                        />
                    ) : (
                        <img
                            src={(() => {
                                 if (imgSrc.startsWith('http')) return imgSrc;
                                 const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
                                if (imgSrc.startsWith('/')) return `${backend}${imgSrc}`;
                                return `${backend}/storage/${imgSrc}`;
                            })()}
                            onError={() => setImageError(true)}
                            alt={product.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </Link>

                {/* BADGES - TOP LEFT */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                    {/* Bestseller / Tag Badge */}
                    {boughtLastMonth > 300 && (
                        <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                            Bestseller
                        </span>
                    )}

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                            {discountPercentage}% OFF
                        </span>
                    )}
                </div>

                {/* WISHLIST BUTTON - TOP RIGHT */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                        onClick={handleWishlist}
                        className="bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 group/wishlist"
                        title="Add to Wishlist"
                    >
                        <Heart
                            size={18}
                            className={`transition-colors duration-300 ${isInWishlist(product.id) ? "text-red-500 fill-red-500" : "text-gray-700 group-hover/wishlist:text-red-500"}`}
                        />
                    </button>

                    {/* COMPARE BUTTON */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (isInCompare(product.id)) {
                                removeItem(product.id);
                            } else {
                                addItem(product);
                            }
                        }}
                        className={`bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 group/compare ${isInCompare(product.id) ? 'bg-cureza-green/10 text-cureza-green' : 'text-gray-700'}`}
                        title="Compare Product"
                    >
                        <Shuffle
                            size={18}
                            className={`transition-colors duration-300 ${isInCompare(product.id) ? "text-cureza-green" : "group-hover/compare:text-cureza-green"}`}
                        />
                    </button>
                </div>
            </div>

            {/* DETAILS SECTION */}
            <div className="p-5 flex flex-col gap-3">

                {/* BRAND & CATEGORY */}
                <div className="flex justify-between items-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <span>{typeof product.brand === 'object' ? product.brand?.name : (product.brand || "Brand")}</span>
                    <span>{typeof product.category === 'object' ? product.category?.name : (product.category || "Category")}</span>
                </div>

                {/* TITLE & VERIFIED BADGE */}
                <Link
                    href={`/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`}
                    className="group/title"
                >
                    <h3 className="font-bold text-[17px] text-gray-900 leading-snug flex items-start gap-1 group-hover/title:text-cureza-green transition-colors">
                        {product.title}
                        {product.isVerified && (
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                        )}
                    </h3>
                </Link>

                {/* TAGS PILLS */}
                {Array.isArray(product.tags) && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {product.tags.slice(0, 3).map((tag: any, index: number) => (
                            <span key={index} className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                                {typeof tag === 'string' ? tag : tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* DESCRIPTION */}
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                    {product.description || product.shortDescription || "Premium wellness product crafted for daily balance & results."}
                </p>

                {/* RATING & BOUGHT STATS */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star size={14} fill="currentColor" className="text-yellow-500" />
                        <span className="font-bold text-xs text-gray-800">{rating}</span>
                        <span className="text-[10px] text-gray-500">({reviewsCount})</span>
                    </div>

                    {boughtLastMonth > 0 && (
                        <div className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            {boughtLastMonth}+ bought last month
                        </div>
                    )}
                </div>

                {/* PRICE & ACTION */}
                <div className="flex items-end justify-between pt-2 gap-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through decoration-red-400">
                            ₹{originalPrice || price + 200}
                        </span>
                        <span className="text-xl font-extrabold text-gray-900">
                            ₹{price}
                        </span>
                    </div>

                    <button
                        onClick={handleCart}
                        className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
                    >
                        Add To Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
