'use client';

import { Trash2 } from 'lucide-react';
import CartItem from '@/components/cart/CartItem';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartPage() {
    const { items, summary, isLoading, clearCart, applyCoupon, removeCoupon } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [couponCode, setCouponCode] = useState('');
    // ... existing state ...

    const handleCheckout = () => {
        if (user) {
            router.push('/checkout');
        } else {
            router.push('/login?redirect=/checkout');
        }
    };

    // ... rest of component ...


    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState('');

    // Use backend summary
    const subtotal = summary?.subtotal || 0;
    const shipping = summary?.shipping_cost || 0;
    const total = summary?.final_total || 0;
    const discount = summary?.discount || 0;

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        setCouponMessage('');
        const result = await applyCoupon(couponCode);
        setCouponMessage(result.message);
        setIsApplyingCoupon(false);
        if (result.success) setCouponCode('');
    };

    if (isLoading && (!items || items.length === 0)) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cureza-green"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-charcoal dark:text-gray-100">Shopping Cart</h1>
                {items.length > 0 && (
                    <button
                        onClick={clearCart}
                        className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                        <Trash2 size={18} />
                        Clear Cart
                    </button>
                )}
            </div>

            {items.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                        <div>
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-charcoal dark:text-gray-100 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                {/* Shipping hidden in cart as per requirement */}
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>Discount</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}

                                {/* Coupon Section */}
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                    {summary?.coupon_applied ? (
                                        <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                                            <div>
                                                <p className="text-sm font-bold text-green-700 dark:text-green-400">Coupon applied: {summary.coupon_applied}</p>
                                                <p className="text-xs text-green-600 dark:text-green-500">You saved ₹{discount}</p>
                                            </div>
                                            <button onClick={removeCoupon} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter Coupon Code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-charcoal dark:text-gray-100 focus:outline-none focus:border-cureza-green focus:ring-1 focus:ring-cureza-green uppercase"
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={!couponCode || isApplyingCoupon}
                                                    className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                                                >
                                                    {isApplyingCoupon ? 'Applying...' : 'Apply'}
                                                </button>
                                            </div>
                                            {couponMessage && (
                                                <p className={`text-xs ${couponMessage.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                                                    {couponMessage}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between font-bold text-lg text-charcoal dark:text-gray-100">
                                    <span>Total <span className="text-xs font-normal text-gray-500">(Tax included)</span></span>
                                    {/* Display Total excluding shipping since shipping is hidden */}
                                    <span>₹{summary?.total_tax ? (subtotal - discount + summary.total_tax).toFixed(2) : (subtotal - discount).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="block w-full bg-cureza-green text-white text-center font-bold py-3 rounded-lg hover:bg-green-800 transition shadow-lg shadow-green-100"
                            >
                                Proceed to Checkout
                            </button>

                            <div className="mt-4 text-center">
                                <Link href="/shop" className="text-sm text-gray-500 dark:text-gray-400 hover:text-cureza-green transition">
                                    or Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-12 text-center shadow-sm">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold text-charcoal dark:text-gray-100 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added anything to your cart yet.</p>
                    <Link href="/shop" className="inline-block bg-cureza-green text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition shadow-lg shadow-green-100">
                        Start Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}
