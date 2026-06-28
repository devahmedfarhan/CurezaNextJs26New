'use client';

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Star, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";

interface SidebarProductsProps {
    products: any[];
    backendUrl: string;
}

export default function SidebarProducts({ products, backendUrl }: SidebarProductsProps) {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [addingId, setAddingId] = useState<number | null>(null);

    const handleQuickAdd = async (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();

        const productUrl = `/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`;

        if (product.is_prescription_required) {
            // Redirect to product page if prescription is required
            window.location.href = productUrl;
            return;
        }

        setAddingId(product.id);
        addToCart(product, 1);
        showToast(`Added ${product.title} to cart`, "success");

        setTimeout(() => {
            setAddingId(null);
        }, 1500);
    };

    return (
        <div className="bg-white border border-[#555555]/18 rounded-[8px] p-5 shadow-none space-y-4" style={{ boxShadow: 'none', filter: 'none' }}>
            <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-[10px] font-semibold tracking-[0.2em] text-[#052326]/60">
                    Recommended products
                </h4>
                <span className="bg-cureza-green/10 text-cureza-green text-[8px] font-semibold px-2 py-0.5 rounded-full tracking-wider">
                    Expert choice
                </span>
            </div>
            
            <div className="space-y-3">
                {products.map((product) => {
                    const originalPrice = product.original_price || product.originalPrice;
                    const rating = product.rating || "4.5";
                    const prodUrl = `/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`;
                    const pImg = product.image 
                        ? (product.image.startsWith('http') 
                            ? product.image 
                            : `${backendUrl}${product.image.startsWith('/') ? '' : '/'}${product.image}`) 
                        : '/fallback.png';

                    const isAdding = addingId === product.id;

                    return (
                        <div 
                            key={product.id}
                            className="relative flex items-center gap-3 p-2 rounded-[8px] border border-[#555555]/18 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 group"
                        >
                            <Link href={prodUrl} className="w-14 h-14 rounded-[8px] overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 block">
                                <img src={pImg} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </Link>

                            <div className="flex-1 min-w-0 pr-8">
                                <Link href={prodUrl}>
                                    <h5 className="font-semibold text-xs text-[#052326] hover:text-cureza-green transition-colors truncate">
                                        {product.title}
                                    </h5>
                                </Link>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star size={8} fill="currentColor" className="text-[#F0C417]" />
                                    <span className="text-[9px] font-semibold text-[#052326]/70">{rating}</span>
                                </div>

                                {/* Pricing */}
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-xs font-semibold text-[#052326]">₹{product.price}</span>
                                    {originalPrice && originalPrice > product.price && (
                                        <span className="text-[10px] text-gray-400 line-through">₹{originalPrice}</span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Add Button */}
                            <button
                                onClick={(e) => handleQuickAdd(e, product)}
                                disabled={isAdding}
                                className={`absolute right-2.5 p-2 rounded-[8px] transition-all duration-300 ${
                                    isAdding
                                        ? "bg-cureza-green text-white"
                                        : "bg-[#052326]/5 text-[#052326] hover:bg-cureza-green hover:text-white"
                                }`}
                                title={product.is_prescription_required ? "Prescription Required" : "Quick Add to Cart"}
                            >
                                {isAdding ? <Check size={12} /> : <ShoppingBag size={12} />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
