'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, ShoppingBag, Truck, Ticket, Percent, Check, ArrowRight, ChevronLeft, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import CartItem from '@/components/cart/CartItem';
import Link from 'next/link';
import ShopfloCheckout from '@/components/checkout/ShopfloCheckout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';

export default function CartPage() {
    const { items, summary, isLoading, clearCart, applyCoupon, removeCoupon, toggleCoins, addToCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    // Custom States
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState('');
    const [publicSettings, setPublicSettings] = useState<any>(null);
    const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
    const [showCouponsList, setShowCouponsList] = useState(false);
    const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
    const [isLoadingUpsell, setIsLoadingUpsell] = useState(true);
    const [showBreakdown, setShowBreakdown] = useState(true);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const upsellScrollRef = useRef<HTMLDivElement>(null);

    const scrollUpsell = (direction: 'left' | 'right') => {
        if (upsellScrollRef.current) {
            const scrollAmount = 220;
            upsellScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        // Fetch public settings for toggles
        api.get('/settings/public')
            .then((res) => setPublicSettings(res.data))
            .catch((err) => console.error("Failed to load settings on cart page", err));

        // Fetch coupons
        api.get('/coupons')
            .then((res) => setActiveCoupons(res.data))
            .catch((err) => console.error("Failed to load coupons on cart page", err));

        // Fetch upsell products
        const fetchUpsells = async () => {
            setIsLoadingUpsell(true);
            try {
                const sessionId = localStorage.getItem('session_id') || '';
                const response = await api.get('/cart/upsells', {
                    headers: { 'X-Session-ID': sessionId }
                });
                setUpsellProducts(response.data);
            } catch (err) {
                console.error("Failed to fetch upsells on cart page", err);
            } finally {
                setIsLoadingUpsell(false);
            }
        };
        fetchUpsells();
    }, []);

    const handleCheckout = () => {
        setIsCheckoutModalOpen(true);
    };

    const handleApplyCoupon = async (codeToApply?: string) => {
        const code = codeToApply || couponCode;
        if (!code) return;
        setIsApplyingCoupon(true);
        setCouponMessage('');
        const result = await applyCoupon(code);
        setCouponMessage(result.message);
        setIsApplyingCoupon(false);
        if (result.success) {
            setCouponCode('');
            showToast("Coupon applied successfully!", "success");
        } else {
            showToast(result.message || "Failed to apply coupon", "error");
        }
    };

    const handleAddUpsell = async (product: any) => {
        try {
            await addToCart({
                id: product.id,
                title: product.title,
                brand: product.brand?.name || "Cureza",
                price: product.price,
                image: product.image,
            }, 1);
            showToast(`${product.title} added to cart!`, "success");
        } catch (error) {
            showToast("Failed to add upsell item", "error");
        }
    };

    // Prices from dynamic summary
    const subtotal = summary?.subtotal || 0;
    const total = summary?.final_total || 0;
    const discount = summary?.discount || 0;
    const milestoneDiscount = summary?.milestone_discount || 0;
    const totalSavings = discount + milestoneDiscount;
    const walletDeduction = summary?.wallet_deduction || 0;
    const projectedCoins = summary?.projected_cashback || 0;
    const walletBalance = summary?.wallet_balance || 0;
    const shippingCost = summary?.shipping_cost || 0;
    const totalTax = summary?.total_tax || 0;
    const rewards = summary?.rewards || null;

    // Load admin toggles
    const enableRewards = publicSettings?.cart_drawer_enable_rewards !== false;
    const enableCoupons = publicSettings?.cart_drawer_enable_coupons !== false;
    const enableCoins = publicSettings?.cart_drawer_enable_coins !== false;
    const enableUpsell = publicSettings?.cart_drawer_enable_upsell !== false;

    // Shipping calculations
    const freeShippingThreshold = publicSettings ? Number(publicSettings.cart_free_shipping_threshold) : 500;
    const isFreeShippingEnabled = publicSettings ? publicSettings.cart_free_shipping_enabled : true;
    const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
    const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

    // Helper calculations for milestone reward descriptions
    const nextLockedSlab = rewards?.active_slabs.find((s: any) => !s.unlocked);
    let nextRewardLabel = '';
    if (nextLockedSlab) {
        if (nextLockedSlab.free_shipping) {
            nextRewardLabel = 'Free Shipping 🚚';
        } else if (nextLockedSlab.discount_amount) {
            nextRewardLabel = `₹${nextLockedSlab.discount_amount} Cash Off 💰`;
        } else if (nextLockedSlab.gift_product) {
            nextRewardLabel = `Free ${nextLockedSlab.gift_product.title} 🎁`;
        } else {
            nextRewardLabel = nextLockedSlab.name;
        }
    }

    if (isLoading && (!items || items.length === 0)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F3EF] text-[#052326]">
                <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#052326] mx-auto"></div>
                    <p className="text-xs font-light">Loading shopping cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-4 md:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-[#052326]/12 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold font-heading text-[#052326]">Shopping Cart</h1>
                        <p className="text-xs text-[#052326]/50 mt-1 font-light">Review selected formulations before final clinical check out</p>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-red-50 rounded-[10px] transition"
                        >
                            <Trash2 size={15} /> Clear All
                        </button>
                    )}
                </div>

                {items.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* Cart Items Column */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Free Shipping & Reward progress bar (Controlled by super admin rewards flag) */}
                            {enableRewards && rewards && rewards.active_slabs.length > 0 && (
                                <div className="bg-white rounded-[12px] border border-[#052326]/12 p-6 shadow-premium-light space-y-4">
                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <p className="font-semibold flex items-center gap-1.5">
                                            <Truck size={14} className="text-[#052326] animate-bounce" />
                                            Rewards Milestone
                                        </p>
                                        {nextLockedSlab ? (
                                            <span className="text-[10px] text-[#052326]/60">
                                                Add <span className="font-bold">₹{rewards.amount_to_next_milestone.toFixed(0)}</span> more for <span className="font-bold">{nextRewardLabel}</span>
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-[4px] font-bold">
                                                🎉 All milestones unlocked!
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Milestone Progress Bar */}
                                    <div className="relative pt-1 px-1 mb-6">
                                        <div className="w-full bg-[#F8F3EF] h-2.5 rounded-full relative border border-[#052326]/8">
                                            <div 
                                                className="h-full bg-[#052326] rounded-full transition-all duration-500"
                                                style={{ width: `${rewards.progress_percentage}%` }}
                                            />
                                            
                                            {/* Milestone Node Indicators */}
                                            {rewards.active_slabs.map((slab: any) => {
                                                const maxSlabValue = rewards.active_slabs[rewards.active_slabs.length - 1].threshold;
                                                const percentage = maxSlabValue > 0 ? (slab.threshold / maxSlabValue) * 100 : 100;
                                                
                                                return (
                                                    <div
                                                        key={slab.id}
                                                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-help z-10"
                                                        style={{ left: `${percentage}%` }}
                                                    >
                                                        <div
                                                            className={`w-5 h-5 rounded-full border flex items-center justify-center -translate-x-1/2 transition-all duration-300 shadow-sm ${
                                                                slab.unlocked
                                                                    ? 'border-[#052326] bg-[#052326] text-white shadow-[0_0_6px_rgba(5,35,38,0.3)]'
                                                                    : 'border-[#052326]/20 bg-white'
                                                            }`}
                                                        >
                                                            {slab.unlocked ? (
                                                                <Check size={8} className="text-white" />
                                                            ) : slab.free_shipping ? (
                                                                <Truck size={8} className="text-[#052326]/50" />
                                                            ) : (
                                                                <Gift size={8} className="text-[#052326]/50" />
                                                            )}
                                                        </div>
                                                        <span className="text-[8px] font-extrabold text-[#052326]/50 mt-6 absolute whitespace-nowrap -translate-x-1/2">
                                                            ₹{slab.threshold}
                                                        </span>
                                                        <div className="absolute bottom-6 left-0 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-[#052326] text-white text-[9px] font-bold py-0.5 px-2 rounded shadow-lg whitespace-nowrap z-30">
                                                            {slab.name} {slab.unlocked ? '(Unlocked)' : '(Locked)'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Bottom Slabs Tags */}
                                    <div className="flex gap-2 overflow-x-auto pt-4 border-t border-[#052326]/8">
                                        {rewards.active_slabs.map((slab: any) => (
                                            <span 
                                                key={slab.id}
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-[4px] border uppercase transition-all ${
                                                    slab.unlocked 
                                                        ? 'bg-[#052326]/5 text-[#052326] border-[#052326]/20' 
                                                        : 'bg-gray-50 text-gray-400 border-gray-100'
                                                }`}
                                            >
                                                {slab.free_shipping ? 'Free Shipping' : slab.discount_amount ? `₹${slab.discount_amount} Off` : slab.gift_product ? `Gift: ${slab.gift_product.title}` : slab.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Free Shipping fallback if milestone rewards are disabled */}
                            {!enableRewards && isFreeShippingEnabled && (
                                <div className="bg-white rounded-[12px] border border-[#052326]/12 p-5 shadow-premium-light space-y-3">
                                    <div className="flex items-center justify-between gap-3 text-xs">
                                        <p className="font-semibold flex items-center gap-1.5">
                                            <Truck size={14} className="text-[#052326] animate-bounce" />
                                            Free Shipping Threshold
                                        </p>
                                        {amountToFreeShipping > 0 ? (
                                            <span className="text-[10px] text-[#052326]/60">
                                                Add <span className="font-bold">₹{amountToFreeShipping}</span> more for free shipping
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-[4px] font-bold">
                                                🎉 Free Shipping Unlocked!
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full bg-[#F8F3EF] h-2 rounded-full overflow-hidden border border-[#052326]/8">
                                        <div 
                                            className="h-full bg-[#052326] rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Items Card List */}
                            <div className="bg-white rounded-[12px] border border-[#052326]/12 shadow-premium-light divide-y divide-[#052326]/8 px-6 py-2">
                                {items.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>

                            {/* Pinned/AI Recommended Upsells Carousel */}
                            {enableUpsell && upsellProducts.length > 0 && (
                                <div className="bg-white rounded-[12px] border border-[#052326]/12 p-6 shadow-premium-light space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold font-heading text-[#052326]">
                                                {publicSettings?.cart_drawer_upsell_title || 'Complete Your Care'}
                                            </h3>
                                            <p className="text-[10px] text-[#052326]/50">Recommended formulations for your routine</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => scrollUpsell('left')}
                                                className="p-1.5 border border-[#052326]/12 text-[#052326] hover:bg-[#F8F3EF] rounded-[8px] transition active:scale-90"
                                            >
                                                <ChevronLeft size={14} />
                                            </button>
                                            <button 
                                                onClick={() => scrollUpsell('right')}
                                                className="p-1.5 border border-[#052326]/12 text-[#052326] hover:bg-[#F8F3EF] rounded-[8px] transition active:scale-90"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div 
                                        ref={upsellScrollRef}
                                        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
                                    >
                                        {upsellProducts.map((product) => (
                                            <div 
                                                key={product.id}
                                                className="w-[180px] shrink-0 bg-[#F8F3EF]/30 border border-[#052326]/12 rounded-[12px] p-3 flex flex-col justify-between hover:shadow-sm transition-all"
                                            >
                                                <div className="space-y-2">
                                                    <div className="w-full aspect-square rounded-[8px] bg-white overflow-hidden border border-[#052326]/8">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-[#052326]/40">📦</div>
                                                        )}
                                                    </div>
                                                    <span className="text-[8px] font-bold text-[#052326]/50 uppercase tracking-wider block">{product.brand?.name || 'Cureza'}</span>
                                                    <h4 className="text-[11px] font-bold text-[#052326] line-clamp-2 leading-snug h-[32px]">{product.title}</h4>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between gap-1.5">
                                                    <span className="text-xs font-black text-[#052326]">₹{product.price}</span>
                                                    <button 
                                                        onClick={() => handleAddUpsell(product)}
                                                        className="bg-[#052326] text-white hover:bg-[#052326]/90 px-3 py-1 rounded-[8px] text-[10px] font-bold transition active:scale-95"
                                                    >
                                                        + Add
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Checkout Panel */}
                        <div className="space-y-6 lg:sticky lg:top-24">
                            <div className="bg-white rounded-[14px] border border-[#052326]/12 p-6 shadow-premium-light space-y-6">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-[#052326]/50">Order Summary</h2>

                                <div className="space-y-4">
                                    {/* Loyalty Coins Cashback/Redeem Card (Controlled by super admin enable coins flag) */}
                                    {enableCoins && (
                                        <div className="p-3 border border-amber-200/80 bg-amber-50/15 rounded-[12px] flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">🪙</span>
                                                <div>
                                                    <p className="text-[10px] font-bold text-[#052326] leading-none">
                                                        RUN Coins (Bal: {walletBalance.toFixed(0)})
                                                    </p>
                                                    <p className="text-[9px] text-[#052326]/60 font-semibold mt-1">
                                                        Earn {projectedCoins.toFixed(0)} coins on this order
                                                    </p>
                                                </div>
                                            </div>
                                            {walletBalance > 0 && (
                                                <button
                                                    onClick={toggleCoins}
                                                    className={`text-[9px] font-bold px-2.5 py-1 rounded-[8px] border transition-all ${
                                                        walletDeduction > 0
                                                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                                            : 'border-amber-500 text-amber-600 hover:bg-amber-50'
                                                    }`}
                                                >
                                                    {walletDeduction > 0 ? 'Applied' : 'Redeem'}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2.5 pt-2">
                                        <div className="flex justify-between text-xs text-[#052326]/70">
                                            <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        
                                        {discount > 0 && (
                                            <div className="flex justify-between text-xs text-green-700 bg-green-50/50 p-2.5 rounded-[8px] border border-green-100/30">
                                                <span className="font-medium">Discount Applied</span>
                                                <span className="font-bold">-₹{discount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {milestoneDiscount > 0 && (
                                            <div className="flex justify-between text-xs text-green-700 bg-green-50/50 p-2.5 rounded-[8px] border border-green-100/30">
                                                <span className="font-medium">Milestone Reward Discount</span>
                                                <span className="font-bold">-₹{milestoneDiscount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {walletDeduction > 0 && (
                                            <div className="flex justify-between text-xs text-amber-700 bg-amber-50/50 p-2.5 rounded-[8px] border border-amber-100/30">
                                                <span className="font-medium">Loyalty Coins Applied</span>
                                                <span className="font-bold">-₹{walletDeduction.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-xs text-[#052326]/70">
                                            <span>GST / Taxes</span>
                                            <span>₹{totalTax.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between text-xs text-[#052326]/70">
                                            <span>Delivery fee</span>
                                            <span className="font-semibold">
                                                {summary?.milestone_free_shipping 
                                                    ? 'FREE (Milestone Reward)' 
                                                    : (shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE')}
                                            </span>
                                        </div>

                                        <div className="flex justify-between text-xs text-[#052326]/70">
                                            <span>Convenience Fee</span>
                                            <span>₹{(summary?.platform_fee || 10.00).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Coupon Section (Controlled by super admin enable coupons flag) */}
                                    {enableCoupons && (
                                        <div className="pt-4 border-t border-[#052326]/8 space-y-3">
                                            {summary?.coupon_applied ? (
                                                <div className="flex justify-between items-center bg-[#052326]/5 p-3 rounded-[10px] border border-[#052326]/12">
                                                    <div>
                                                        <p className="text-xs font-bold text-[#052326] leading-none">Coupon: {summary.coupon_applied}</p>
                                                        <p className="text-[10px] text-[#052326]/60 font-semibold mt-1">Saved ₹{discount}</p>
                                                    </div>
                                                    <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 transition duration-150 active:scale-95">
                                                        <Trash2 size={15} />
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
                                                            className="flex-1 border border-[#052326]/12 rounded-[10px] px-3.5 py-2 text-xs bg-white text-[#052326] focus:outline-none focus:ring-2 focus:ring-[#052326]/20 placeholder-[#052326]/40 uppercase tracking-wider font-mono font-bold"
                                                        />
                                                        <button
                                                            onClick={() => handleApplyCoupon()}
                                                            disabled={!couponCode || isApplyingCoupon}
                                                            className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 px-4 py-2 rounded-[10px] text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition active:scale-95"
                                                        >
                                                            {isApplyingCoupon ? '...' : 'Apply'}
                                                        </button>
                                                    </div>
                                                    {couponMessage && (
                                                        <p className={`text-[10px] font-semibold ${couponMessage.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                                                            {couponMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* public coupons helper checklist */}
                                            {activeCoupons.length > 0 && !summary?.coupon_applied && (
                                                <div className="pt-2">
                                                    <button 
                                                        onClick={() => setShowCouponsList(!showCouponsList)}
                                                        className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/50 hover:text-[#052326] flex justify-between w-full"
                                                    >
                                                        <span>Select Available Coupon</span>
                                                        <span>{showCouponsList ? 'Close ▲' : 'View All ▼'}</span>
                                                    </button>

                                                    {showCouponsList && (
                                                        <div className="mt-2.5 space-y-2 max-h-36 overflow-y-auto pr-1">
                                                            {activeCoupons.map((coupon) => (
                                                                <div 
                                                                    key={coupon.code}
                                                                    onClick={() => {
                                                                        handleApplyCoupon(coupon.code);
                                                                        setShowCouponsList(false);
                                                                    }}
                                                                    className="p-2.5 border border-dashed border-[#052326]/12 hover:border-[#052326]/40 rounded-[10px] bg-[#F8F3EF]/30 hover:bg-[#F8F3EF]/60 cursor-pointer flex items-center justify-between transition-all"
                                                                >
                                                                    <div className="text-left">
                                                                        <span className="font-bold text-[10px] uppercase font-mono block tracking-wider">{coupon.code}</span>
                                                                        <span className="text-[9px] text-[#052326]/50 font-light block mt-0.5">{coupon.title} ({coupon.discount} Off)</span>
                                                                    </div>
                                                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">Apply</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {totalSavings > 0 && (
                                        <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold text-center py-2 rounded-[8px] border border-emerald-250/20">
                                            🎉 Total Order Savings: ₹{totalSavings.toFixed(2)}
                                        </div>
                                    )}

                                    <div className="border-t border-[#052326]/8 pt-4 flex justify-between font-bold text-sm text-[#052326]">
                                        <span>Total <span className="text-[10px] font-light text-[#052326]/50 block">(GST & Platform taxes included)</span></span>
                                        <span className="text-base font-extrabold">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCheckout}
                                    className="w-full bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 h-12 text-xs font-bold uppercase tracking-wider rounded-[10px] shadow flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout <Lock size={12} />
                                </Button>

                                <div className="text-center space-y-2">
                                    <p className="text-[9px] text-[#052326]/40 font-semibold flex items-center justify-center gap-1">
                                        <ShieldCheck size={10} /> 100% Safe & Secure Checkout
                                    </p>
                                    <Link href="/shop" className="block text-xs font-semibold uppercase tracking-wider text-[#052326]/50 hover:text-[#052326] transition">
                                        or Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[14px] border border-[#052326]/12 p-12 text-center shadow-premium-light max-w-xl mx-auto space-y-4">
                        <div className="text-5xl animate-bounce">🛒</div>
                        <h2 className="text-lg font-bold text-[#052326]">Your shopping cart is empty</h2>
                        <p className="text-xs text-[#052326]/50 font-light">Explore our organic clinical botanical collections to add products.</p>
                        <Link href="/shop" className="inline-block">
                            <Button className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 font-bold px-8 h-11 rounded-[10px] text-xs uppercase tracking-wider transition-all">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
            {isCheckoutModalOpen && (
                <ShopfloCheckout 
                    isModal 
                    onClose={() => setIsCheckoutModalOpen(false)} 
                    prefetchedData={summary} 
                    prefetchedSettings={publicSettings} 
                />
            )}
        </div>
    );
}
