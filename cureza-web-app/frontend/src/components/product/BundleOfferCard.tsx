'use client';

import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { Plus } from "lucide-react";
import { useState } from "react";
import { getImageUrl } from "@/lib/imageHelper";

export default function BundleOfferCard({ bundle, mainProduct }: { bundle: any, mainProduct: any }) {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [adding, setAdding] = useState(false);

    const bundledProducts = bundle.bundled_products || [];
    const allProducts = [mainProduct, ...bundledProducts];

    const totalPrice = allProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    const discountAmount = (totalPrice * bundle.discount_percentage) / 100;
    const finalPrice = totalPrice - discountAmount;

    const handleAddBundle = async () => {
        setAdding(true);
        try {
            // Add all items
            for (let i = 0; i < allProducts.length; i++) {
                const isLast = i === allProducts.length - 1;
                await addToCart(allProducts[i], 1, undefined, isLast);
            }
            showToast(`Bundle added! Saved ₹${Math.round(discountAmount)}`, "success");
        } catch (err) {
            showToast("Failed to add bundle", "error");
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="border border-cureza-green/30 bg-green-50/30 rounded-2xl p-6 relative overflow-hidden my-8">
            <div className="absolute top-0 left-0 bg-cureza-green text-white text-[10px] font-bold px-3 py-1 rounded-br-xl uppercase tracking-wider">
                Frequently Bought Together
            </div>

            <div className="mt-6 flex flex-col xl:flex-row items-center gap-6">
                {/* Images */}
                <div className="flex items-center overflow-x-auto pb-2 xl:pb-0 max-w-full">
                    {allProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center">
                            <div className="w-24 h-28 bg-white rounded-xl border border-gray-100 p-2 shadow-sm flex-shrink-0">
                                <img
                                    src={getImageUrl(product.image)}
                                    alt={product.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            {index < allProducts.length - 1 && (
                                <Plus size={20} className="text-gray-300 mx-2 flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Info & Price */}
                <div className="flex-1 space-y-2 text-center xl:text-left">
                    <div className="flex flex-col xl:flex-row xl:items-baseline gap-2 justify-center xl:justify-start">
                        <span className="text-sm font-medium text-gray-500 line-through">Total: ₹{totalPrice.toFixed(2)}</span>
                        <span className="text-2xl font-black text-gray-900">₹{finalPrice.toFixed(2)}</span>
                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-lg animate-pulse">
                            SAVE {bundle.discount_percentage}%
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 max-w-md mx-auto xl:mx-0">
                        Get <strong>{mainProduct.title}</strong> + {bundledProducts.map((p: any) => p.title).join(' + ')}
                    </p>
                </div>

                {/* Action */}
                <button
                    onClick={handleAddBundle}
                    disabled={adding}
                    className="whitespace-nowrap bg-gray-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-black hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100"
                >
                    {adding ? 'Adding...' : 'Add Bundle to Cart'}
                </button>
            </div>
        </div>
    );
}
