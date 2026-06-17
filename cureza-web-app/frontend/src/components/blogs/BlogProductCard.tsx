'use client';

import Link from "next/link";
import { useState } from "react";
import { Star, ShoppingBag, ShieldAlert, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface BlogProductCardProps {
    product: any;
}

export default function BlogProductCard({ product }: BlogProductCardProps) {
    const [imgSrc, setImgSrc] = useState(product.image);
    const [imageError, setImageError] = useState(false);
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();

    const originalPrice = product.original_price || product.originalPrice;
    const price = product.price;
    const rating = product.rating || "4.5";
    const reviewsCount = product.reviews_count || 0;

    const discountPercentage = originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const productUrl = `/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`;

    const handleCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (product.is_prescription_required) {
            window.location.href = productUrl;
            return;
        }
        addToCart(product, 1);
        showToast("Added to cart", "success");
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            return;
        }
        toggleWishlist(product.id);
    };

    const imageUrl = imgSrc && !imageError
        ? (imgSrc.startsWith('http') ? imgSrc : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${imgSrc.startsWith('/') ? '' : '/'}${imgSrc}`)
        : '/fallback.png';

    return (
        <div className="my-8 mx-auto max-w-2xl bg-gradient-to-r from-[#F8F3EF] to-white border border-[#052326]/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group">
            
            {/* Image section */}
            <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-gray-50 flex-shrink-0 border-r border-[#052326]/5">
                <Link href={productUrl}>
                    <img
                        src={imageUrl}
                        alt={product.title}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {product.is_prescription_required && (
                        <span className="bg-[#D32F2F] text-white text-[8px] font-bold px-2 py-0.5 rounded-[4px] shadow-sm tracking-wider flex items-center gap-0.5">
                            <ShieldAlert className="w-2.5 h-2.5" /> Rx Required
                        </span>
                    )}
                    {discountPercentage > 0 && (
                        <span className="bg-[#F0C417] text-[#052326] text-[8px] font-bold px-2 py-0.5 rounded-[4px] shadow-sm">
                            {discountPercentage}% OFF
                        </span>
                    )}
                </div>
            </div>

            {/* Content info section */}
            <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-[#052326]/50 uppercase tracking-widest mb-1.5">
                        <span>{typeof product.brand === 'object' ? product.brand?.name : (product.brand || "Brand")}</span>
                        <span>{typeof product.category === 'object' ? product.category?.name : (product.category || "Category")}</span>
                    </div>

                    <Link href={productUrl}>
                        <h4 className="font-bold text-[#052326] text-base leading-snug group-hover:text-cureza-green transition-colors mb-2">
                            {product.title}
                        </h4>
                    </Link>

                    <p className="text-[#052326]/75 text-xs font-light leading-relaxed line-clamp-2 mb-3">
                        {product.short_description || product.shortDescription || "Premium formulation compounded for optimal therapeutic wellness."}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-4">
                        <div className="flex items-center gap-0.5 bg-[#F0C417]/10 text-[#052326] px-2 py-0.5 rounded text-xs font-bold">
                            <Star size={10} fill="currentColor" className="text-[#F0C417]" />
                            <span>{rating}</span>
                        </div>
                        <span className="text-xs text-[#052326]/50">({reviewsCount} verified reviews)</span>
                    </div>
                </div>

                {/* Price and Cart Action */}
                <div className="flex items-center justify-between pt-3 border-t border-[#052326]/5">
                    <div className="flex flex-col">
                        {discountPercentage > 0 && (
                            <span className="text-[10px] text-[#052326]/40 line-through">₹{originalPrice}</span>
                        )}
                        <span className="text-base font-bold text-[#052326]">₹{price}</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleWishlist}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2 transition-all hover:scale-102"
                            title="Add to Wishlist"
                        >
                            <Heart size={14} className={isInWishlist(product.id) ? "text-[#D32F2F] fill-[#D32F2F]" : ""} />
                        </button>
                        
                        <button
                            onClick={handleCart}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cureza-green hover:bg-[#0b3830] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all hover:scale-102 shadow-sm"
                        >
                            <ShoppingBag size={12} />
                            {product.is_prescription_required ? "Rx Consult" : "Buy Now"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
