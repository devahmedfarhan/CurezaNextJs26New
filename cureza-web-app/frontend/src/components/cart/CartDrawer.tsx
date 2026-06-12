'use client';

import { X, ShoppingBag, Truck, Tag, ArrowRight, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, summary, updateQuantity, removeFromCart, addToCart, clearCart, applyCoupon, removeCoupon } = useCart();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
    const [isLoadingUpsell, setIsLoadingUpsell] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState('');

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            fetchUpsellProducts();
        }
    }, [isOpen]);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        setCouponMessage('');
        const result = await applyCoupon(couponCode);
        setCouponMessage(result.message);
        setIsApplyingCoupon(false);
        if (result.success) setCouponCode('');
    };

    const fetchUpsellProducts = async () => {
        setIsLoadingUpsell(true);
        try {
            // Using new Upsell Endpoint
            const sessionId = localStorage.getItem('session_id') || '';
            const response = await axios.get('/cart/upsells', {
                headers: { 'X-Session-ID': sessionId }
            });
            setUpsellProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch upsell products", error);
        } finally {
            setIsLoadingUpsell(false);
        }
    };

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    // Backend driven values
    const totalPrice = summary?.subtotal || 0;
    const finalTotal = summary?.final_total || 0;
    const discount = summary?.discount || 0;

    // Shipping threshold - Logic from backend is > 500 free.
    // We can just check shipping_cost from summary?
    // Or keep progress bar?
    // Backend says: Free shipping if > 500.
    const freeShippingThreshold = 500;
    const shippingProgress = Math.min((totalPrice / freeShippingThreshold) * 100, 100);
    const amountToFreeShipping = Math.max(freeShippingThreshold - totalPrice, 0);

    const handleAddUpsell = (product: any) => {
        addToCart({
            id: product.id,
            title: product.title,
            brand: product.brand?.name || "Cureza",
            price: product.price,
            image: product.image,
        }, 1);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={24} className="text-cureza-green" />
                            <h2 className="text-xl font-bold text-charcoal dark:text-gray-100">
                                Shopping Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {items.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                >
                                    Clear Cart
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {items.length > 0 ? (
                            <>
                                {/* Shipping Progress */}
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Truck size={18} className="text-green-600" />
                                        {amountToFreeShipping > 0 ? (
                                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                Add <span className="font-bold">₹{amountToFreeShipping}</span> more for FREE shipping!
                                            </p>
                                        ) : (
                                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                🎉 You've unlocked FREE shipping!
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${shippingProgress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Cart Items */}
                                <div className="p-4 space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                            {/* Image */}
                                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 relative overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>📦</span>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm text-charcoal dark:text-gray-100 line-clamp-2 mb-1">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.brand}</p>

                                                {/* Patient Details */}
                                                {item.patientDetails && (
                                                    <div className="mb-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                                                        <p><span className="font-semibold">Patient:</span> {item.patientDetails.patient_name} ({item.patientDetails.patient_age}, {item.patientDetails.patient_gender})</p>
                                                        <p><span className="font-semibold">Concern:</span> {item.patientDetails.health_concern}</p>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md">
                                                        <button
                                                            onClick={() => {
                                                                if (item.quantity > 1) {
                                                                    updateQuantity(item.id, item.quantity - 1);
                                                                }
                                                            }}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Price & Remove */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-charcoal dark:text-gray-100">
                                                            ₹{item.price * item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-500 hover:text-red-700 transition"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Upselling Carousel */}
                                {upsellProducts.length > 0 && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-bold text-charcoal dark:text-gray-100 mb-3">
                                            You might also like
                                        </h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {upsellProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
                                                    onClick={() => handleAddUpsell(product)}
                                                >
                                                    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center text-2xl mb-2 overflow-hidden">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>📦</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-medium text-charcoal dark:text-gray-100 line-clamp-2 mb-1">
                                                        {product.title}
                                                    </p>
                                                    <p className="text-xs font-bold text-cureza-green">₹{product.price}</p>
                                                    <button className="w-full mt-2 bg-cureza-green/10 text-cureza-green text-xs font-medium py-1 rounded hover:bg-cureza-green/20 transition">
                                                        + Add
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="text-6xl mb-4">🛒</div>
                                <h3 className="text-xl font-bold text-charcoal dark:text-gray-100 mb-2">
                                    Your cart is empty
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Add some products to get started!
                                </p>
                                <button
                                    onClick={onClose}
                                    className="bg-cureza-green text-white font-bold py-2 px-6 rounded-lg hover:bg-green-800 transition"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-900">
                            {/* Price Breakdown */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span>Discount</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                                {summary?.total_tax ? (
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Tax (Estimated)</span>
                                        <span>₹{summary.total_tax}</span>
                                    </div>
                                ) : null}

                                {/* Coupon Section */}
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                    {summary?.coupon_applied ? (
                                        <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800">
                                            <div>
                                                <p className="text-xs font-bold text-green-700 dark:text-green-400">Coupon applied: {summary.coupon_applied}</p>
                                                <p className="text-xs text-green-600 dark:text-green-500">You saved ₹{discount}</p>
                                            </div>
                                            <button onClick={removeCoupon} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Coupon Code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-charcoal dark:text-gray-100 focus:outline-none focus:border-cureza-green"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode || isApplyingCoupon}
                                                className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                                            >
                                                {isApplyingCoupon ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                    )}
                                    {couponMessage && (
                                        <p className={`text-xs mt-1 ${couponMessage.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                                            {couponMessage}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-between text-lg font-bold text-charcoal dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span>Total</span>
                                    <span>₹{finalTotal}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        onClose();
                                        if (user) {
                                            router.push('/checkout');
                                        } else {
                                            router.push('/login?redirect=/checkout');
                                        }
                                    }}
                                    className="block w-full bg-cureza-green text-white text-center font-bold py-3 rounded-lg hover:bg-green-800 transition shadow-lg"
                                >
                                    Checkout Now
                                </button>
                                <Link
                                    href="/cart"
                                    onClick={onClose}
                                    className="block w-full bg-gray-100 dark:bg-gray-800 text-charcoal dark:text-gray-100 text-center font-medium py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                                >
                                    View Cart <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
