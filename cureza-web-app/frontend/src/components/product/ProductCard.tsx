'use client';

import Link from "next/link";
import { useState } from "react";
import { Heart, Star, Shuffle, ShoppingBag, ShieldAlert } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/contexts/ToastContext";
import { useCompareStore } from "@/store/useCompareStore";
import { useAuth } from "@/context/AuthContext";

export default function ProductCard({ product }: any) {
  const [imgSrc, setImgSrc] = useState(product.image);
  const [imageError, setImageError] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { addItem, removeItem, isInCompare } = useCompareStore();
  const { user } = useAuth();

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
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    toggleWishlist(product.id);
  };

  const productUrl = `/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`;

  return (
    <div className="group bg-white rounded-[10px] border-[0.5px] border-[#052326]/12 hover:border-[#052326]/20 transition-all duration-500 overflow-hidden flex flex-col h-full">
      
      {/* IMAGE AREA */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#F8F3EF]/50 border-b border-[#052326]/5">
        <Link href={productUrl}>
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
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
        </Link>

        {/* BADGES - TOP LEFT */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 items-start z-10">
          {/* Bestseller Badge */}
          {boughtLastMonth > 300 && (
            <span className="bg-[#052326] text-[#F8F3EF] text-[8px] sm:text-[9px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[4px] sm:rounded-[6px] shadow-sm uppercase tracking-wider">
              Bestseller
            </span>
          )}

          {/* Prescription Required Badge */}
          {product.is_prescription_required && (
            <span className="bg-[#D32F2F] text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[4px] sm:rounded-[6px] shadow-sm uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Rx Required
            </span>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <span className="bg-[#F0C417] text-[#052326] text-[8px] sm:text-[9px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[4px] sm:rounded-[6px] shadow-sm">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* UTILITY BUTTONS - TOP RIGHT */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className="bg-white/95 backdrop-blur-md text-[#052326] rounded-[6px] sm:rounded-[8px] p-1.5 sm:p-2 border border-[#052326]/10 shadow-sm hover:bg-[#052326] hover:text-[#F8F3EF] hover:scale-105 transition-all duration-300 group/wishlist"
            title="Add to Wishlist"
          >
            <Heart
              size={13}
              className={`transition-colors duration-300 ${isInWishlist(product.id) ? "text-[#D32F2F] fill-[#D32F2F]" : "text-[#052326] group-hover/wishlist:text-[#F8F3EF]"}`}
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
            className={`bg-white/95 backdrop-blur-md rounded-[6px] sm:rounded-[8px] p-1.5 sm:p-2 border border-[#052326]/10 shadow-sm hover:bg-[#052326] hover:text-[#F8F3EF] hover:scale-105 transition-all duration-300 group/compare ${isInCompare(product.id) ? 'bg-[#052326] text-[#F8F3EF]' : 'text-[#052326]'}`}
            title="Compare Product"
          >
            <Shuffle
              size={13}
              className={`transition-colors duration-300 ${isInCompare(product.id) ? "text-[#F8F3EF]" : "group-hover/compare:text-[#F8F3EF]"}`}
            />
          </button>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3 bg-white">
        
        <div className="space-y-1.5 sm:space-y-2">
          {/* BRAND & CATEGORY HEADER */}
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-[#052326]/50 uppercase tracking-wider">
            <span>{typeof product.brand === 'object' ? product.brand?.name : (product.brand || "Brand")}</span>
            <span>{typeof product.category === 'object' ? product.category?.name : (product.category || "Category")}</span>
          </div>

          {/* TITLE & VERIFIED SIGNATURE */}
          <Link href={productUrl} className="group/title block">
            <h3 className="font-semibold text-sm sm:text-base text-[#052326] leading-snug flex items-start gap-1 group-hover/title:text-[#F0C417] transition-colors line-clamp-1">
              {product.title}
              {product.isVerified && (
                <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </h3>
          </Link>

          {/* TAGS PILLS */}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag: any, index: number) => (
                <span key={index} className="bg-[#052326]/5 text-[#052326]/80 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] border border-[#052326]/5">
                  {typeof tag === 'string' ? tag : tag.name}
                </span>
              ))}
            </div>
          )}

          {/* DESCRIPTION */}
          <p className="text-[#052326]/70 text-[11px] sm:text-xs leading-relaxed line-clamp-2 font-light hidden sm:block">
            {product.description || product.shortDescription || "Premium wellness formulation compounded for optimal therapeutic absorption."}
          </p>
        </div>

        <div>
          {/* RATING & STATS */}
          <div className="flex items-center justify-between border-t border-[#052326]/5 pt-2.5 sm:pt-3 mt-0.5 sm:mt-1 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1 bg-[#052326]/5 px-2 py-0.5 rounded-[4px] sm:rounded-[6px]">
              <Star size={11} fill="currentColor" className="text-[#F0C417]" />
              <span className="font-bold text-[#052326]">{rating}</span>
              <span className="text-[#052326]/50">({reviewsCount})</span>
            </div>

            {boughtLastMonth > 0 && (
              <div className="text-[9px] sm:text-[10px] font-semibold text-[#052326]/70">
                {boughtLastMonth}+ ordered recently
              </div>
            )}
          </div>

          {/* PRICE & ADD TO CART ACTION */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2.5 sm:pt-3 gap-2.5 sm:gap-3">
            <div className="flex flex-row items-baseline gap-2 sm:flex-col sm:gap-0 min-w-[65px] sm:min-w-[70px]">
              {discountPercentage > 0 && (
                <span className="text-[9px] sm:text-[10px] text-[#052326]/40 line-through">
                  ₹{originalPrice}
                </span>
              )}
              <span className="text-sm sm:text-base font-bold text-[#052326]">
                ₹{price}
              </span>
            </div>

            <button
              onClick={handleCart}
              className={`w-full sm:flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-[8px] sm:rounded-[10px] text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm ${
                product.is_prescription_required
                  ? "bg-[#052326]/10 text-[#052326] hover:bg-[#052326]/20"
                  : "bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 hover:scale-[1.01]"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {product.is_prescription_required ? "Rx Consult" : "Buy Now"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
