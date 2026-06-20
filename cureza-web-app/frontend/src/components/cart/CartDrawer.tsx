'use client';

import { X, ShoppingBag, Truck, Tag, ArrowRight, Plus, Minus, Trash2, Lock, ShieldCheck, Gift, Percent, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import ShopfloCheckout from '@/components/checkout/ShopfloCheckout';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import axios from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, summary, updateQuantity, removeFromCart, addToCart, clearCart, applyCoupon, removeCoupon, toggleCoins } = useCart();
    const [mounted, setMounted] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [upsellProducts, setUpsellProducts] = useState<any[]>([]);
    const [isLoadingUpsell, setIsLoadingUpsell] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState('');
    const [publicSettings, setPublicSettings] = useState<any>(null);
    const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [showCouponsList, setShowCouponsList] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [prefetchedCheckoutData, setPrefetchedCheckoutData] = useState<any>(null);
    const drawerRef = useRef<HTMLDivElement>(null);
    const upsellScrollRef = useRef<HTMLDivElement>(null);

    const scrollUpsell = (direction: 'left' | 'right') => {
        if (upsellScrollRef.current) {
            const scrollAmount = 180;
            upsellScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        setMounted(true);
        const fetchSettings = async () => {
            try {
                const response = await axios.get('/settings/public');
                setPublicSettings(response.data);
            } catch (error) {
                console.error("Failed to load settings in CartDrawer", error);
            }
        };
        fetchSettings();
        if (isOpen) {
            fetchUpsellProducts();
            fetchActiveCoupons();
        }
    }, [isOpen]);

    // Prefetch checkout details in the background whenever cart items or open state changes
    useEffect(() => {
        if (isOpen && items.length > 0) {
            const prefetchCheckout = async () => {
                try {
                    const res = await axios.get('/checkout/initiate');
                    setPrefetchedCheckoutData(res.data);
                } catch (e) {
                    // Log as a warning instead of console.error to avoid Next.js overlay errors in dev mode
                    console.warn("Failed to prefetch checkout details (handled):", e);
                }
            };
            prefetchCheckout();
        }
    }, [isOpen, items]);

    const handleApplyCoupon = async (codeToApply?: string) => {
        const code = codeToApply || couponCode;
        if (!code) return;
        setIsApplyingCoupon(true);
        setCouponMessage('');
        const result = await applyCoupon(code);
        setCouponMessage(result.message);
        setIsApplyingCoupon(false);
        if (result.success) setCouponCode('');
    };

    const fetchActiveCoupons = async () => {
        try {
            const response = await axios.get('/coupons');
            setActiveCoupons(response.data);
        } catch (error) {
            console.error("Failed to load active coupons", error);
        }
    };

    const fetchUpsellProducts = async () => {
        setIsLoadingUpsell(true);
        try {
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

    // Prevent body scroll when drawer or checkout modal is open, trap focus, escape close
    useEffect(() => {
        if (isOpen || isCheckoutModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        if (isOpen) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, isCheckoutModalOpen, onClose]);

    // Reset modal state and clear body scroll lock on route change/unmount
    useEffect(() => {
        setIsCheckoutModalOpen(false);
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [pathname]);

    if (!mounted) return null;

    // Load visual settings dynamically with safe fallbacks
    const primaryColor = publicSettings?.cart_drawer_primary_color || '#16A34A';
    const transitionSpeed = publicSettings?.cart_drawer_animation_speed ? Number(publicSettings.cart_drawer_animation_speed) : 300;
    const cartTitle = publicSettings?.cart_drawer_title || 'YOUR CART';
    const urgencyCopy = publicSettings?.cart_drawer_urgency_text || 'Get free items by meeting checkout milestones!';
    const logoUrl = publicSettings?.cart_drawer_logo_url || '';
    const emptyText = publicSettings?.cart_drawer_empty_text || 'Your cart is empty';
    const emptyCtaLabel = publicSettings?.cart_drawer_empty_cta_label || 'Continue Shopping';
    const secureText = publicSettings?.cart_drawer_secure_text || '100% Safe & Secure Checkout';
    const checkoutLabel = publicSettings?.cart_drawer_checkout_cta_label || 'Checkout';
    const reviewsText = publicSettings?.cart_drawer_reviews_text || 'Trustified & Certified wellness products';
    const upsellTitle = publicSettings?.cart_drawer_upsell_title || 'Best offers';
    
    // Toggles
    const enableRewards = publicSettings?.cart_drawer_enable_rewards !== false;
    const enableCoupons = publicSettings?.cart_drawer_enable_coupons !== false;
    const enableCoins = publicSettings?.cart_drawer_enable_coins !== false;
    const enableUpsell = publicSettings?.cart_drawer_enable_upsell !== false;
    const enableDeliveryNote = publicSettings?.cart_drawer_enable_delivery_note !== false;

    // Prices from dynamic summary
    const totalPrice = summary?.subtotal || 0;
    const finalTotal = summary?.final_total || 0;
    const discount = summary?.discount || 0;
    const milestoneDiscount = summary?.milestone_discount || 0;
    const totalSavings = discount + milestoneDiscount;
    const walletDeduction = summary?.wallet_deduction || 0;
    const projectedCoins = summary?.projected_cashback || 0;
    const walletBalance = summary?.wallet_balance || 0;
    const shippingCost = summary?.shipping_cost || 0;
    const rewards = summary?.rewards || null;

    const getTaxLabel = () => {
        const isIgst = Number(summary?.igst || 0) > 0;
        const slabs = Object.values((summary as any)?.items_breakdown || {})
            .map((item: any) => Number(item.gst_slab || 0))
            .filter(slab => slab > 0);
        const uniqueSlabs = Array.from(new Set(slabs));
        const slabStr = uniqueSlabs.length > 0 
            ? uniqueSlabs.map(s => `${s}%`).join(' & ') 
            : '';
        const taxType = isIgst ? 'IGST' : 'CGST + SGST';
        return slabStr ? `Taxes (${taxType} ${slabStr})` : `Taxes (${taxType})`;
    };

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

    // Shipping calculations
    const freeShippingThreshold = publicSettings ? Number(publicSettings.cart_free_shipping_threshold) : 500;
    const isFreeShippingEnabled = publicSettings ? publicSettings.cart_free_shipping_enabled : true;
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
                    className="fixed inset-0 bg-black/60 z-[9999] transition-opacity backdrop-blur-[8px]"
                    onClick={onClose}
                />
            )}

            {/* Drawer Panel */}
            <div
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                className={`fixed top-0 right-0 h-full w-[85%] sm:w-[440px] bg-white dark:bg-gray-950 shadow-2xl z-[10000] transform transition-transform ease-in-out rounded-l-[24px] sm:rounded-l-[32px] overflow-hidden border-l border-gray-100 dark:border-gray-900`}
                style={{
                    transitionDuration: `${transitionSpeed}ms`,
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
                }}
            >
                <div className="flex flex-col h-full select-none">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-900 sticky top-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md z-10">
                        <div className="flex items-center gap-2">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
                            ) : (
                                <ShoppingBag size={16} className="text-gray-600 dark:text-gray-300 transition-transform duration-300 hover:scale-110" style={{ color: primaryColor }} />
                            )}
                            <h2 className="text-[12px] font-bold tracking-wider text-gray-900 dark:text-gray-100 uppercase">
                                {cartTitle}
                            </h2>
                            <span className="bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                {items.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {items.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-[9px] font-extrabold text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition duration-150 active:scale-95"
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                aria-label="Close Cart"
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:rotate-90 duration-300 active:scale-90"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto py-3 space-y-3">
                        {items.length > 0 ? (
                            <>
                                {/* Reward Progress Slabs */}
                                {enableRewards && rewards && rewards.active_slabs.length > 0 && (
                                    <div className="mx-3 p-3.5 rounded-lg border border-green-100/80 dark:border-green-900/30 bg-gradient-to-br from-green-50/10 via-white to-green-50/5 dark:from-green-950/5 dark:to-transparent shadow-sm">
                                        {nextLockedSlab ? (
                                            <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-3.5 text-center leading-relaxed">
                                                Add <span className="font-extrabold" style={{ color: primaryColor }}>₹{rewards.amount_to_next_milestone.toFixed(0)}</span> more to unlock <span className="font-extrabold text-gray-900 dark:text-white underline decoration-dashed decoration-green-500/80">{nextRewardLabel}</span>!
                                            </p>
                                        ) : (
                                            <p className="text-[10px] font-extrabold text-green-600 dark:text-green-400 mb-3.5 text-center flex items-center justify-center gap-1 animate-pulse leading-relaxed">
                                                🎉 All milestones unlocked!
                                            </p>
                                        )}
                                        
                                        {/* Premium Progress Bar Wrapper */}
                                        <div className="relative pt-1 px-1 mb-5">
                                            <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full relative border border-gray-200/50 dark:border-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(22,163,74,0.2)]"
                                                    style={{
                                                        width: `${rewards.progress_percentage}%`,
                                                        backgroundColor: primaryColor
                                                    }}
                                                />
                                                
                                                {/* Milestone circles */}
                                                {rewards.active_slabs.map((slab: any) => {
                                                    const maxSlabValue = rewards.active_slabs[rewards.active_slabs.length - 1].threshold;
                                                    const percentage = maxSlabValue > 0 ? (slab.threshold / maxSlabValue) * 100 : 100;
                                                    
                                                    // Determine node icon
                                                    let iconNode = null;
                                                    if (slab.unlocked) {
                                                        iconNode = <Check size={6} className="text-white" />;
                                                    } else if (slab.free_shipping) {
                                                        iconNode = <Truck size={6} className="text-gray-400 dark:text-gray-550" />;
                                                    } else if (slab.discount_amount) {
                                                        iconNode = <Percent size={6} className="text-gray-400 dark:text-gray-555" />;
                                                    } else {
                                                        iconNode = <Gift size={6} className="text-gray-400 dark:text-gray-555" />;
                                                    }

                                                    return (
                                                        <div
                                                            key={slab.id}
                                                            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group cursor-help z-10"
                                                            style={{ left: `${percentage}%` }}
                                                        >
                                                            <div
                                                                className={`w-4 h-4 rounded-full border flex items-center justify-center -translate-x-1/2 transition-all duration-300 shadow-sm ${
                                                                    slab.unlocked
                                                                        ? 'border-green-600 bg-green-600 text-white shadow-[0_0_6px_rgba(22,163,74,0.4)] animate-pulse'
                                                                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                                                                }`}
                                                                style={{ 
                                                                    borderColor: slab.unlocked ? primaryColor : undefined,
                                                                    backgroundColor: slab.unlocked ? primaryColor : undefined 
                                                                }}
                                                            >
                                                                {iconNode}
                                                            </div>
                                                            
                                                            {/* Tooltip on hover */}
                                                            <div className="absolute bottom-5 left-0 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[8px] font-bold py-0.5 px-1.5 rounded shadow-lg whitespace-nowrap z-30">
                                                                {slab.name} {slab.unlocked ? '(Unlocked)' : '(Locked)'}
                                                            </div>

                                                            <span className="text-[8px] font-extrabold text-gray-400 dark:text-gray-500 mt-5 absolute whitespace-nowrap -translate-x-1/2">
                                                                ₹{slab.threshold}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Bottom milestones summary tags */}
                                        <div className="flex justify-between items-center gap-1.5 overflow-x-auto pb-0.5 text-[8px] font-bold text-gray-400 dark:text-gray-500 mt-2 border-t border-dashed border-gray-200 dark:border-gray-800 pt-2">
                                            {rewards.active_slabs.map((slab: any) => {
                                                let badgeLabel = '';
                                                if (slab.free_shipping) {
                                                    badgeLabel = 'Free Ship';
                                                } else if (slab.discount_amount) {
                                                    badgeLabel = `₹${slab.discount_amount} Off`;
                                                } else if (slab.gift_product) {
                                                    badgeLabel = slab.gift_product.title;
                                                } else {
                                                    badgeLabel = slab.name;
                                                }

                                                return (
                                                    <span 
                                                        key={slab.id} 
                                                        className={`px-1.5 py-0.5 rounded truncate max-w-[85px] border ${
                                                            slab.unlocked 
                                                                ? 'bg-green-50/45 dark:bg-green-950/20 text-green-700 border-green-200 dark:border-green-900/45' 
                                                                : 'bg-gray-50 dark:bg-gray-900 text-gray-405 border-gray-100 dark:border-gray-800'
                                                        }`}
                                                        style={{ 
                                                            color: slab.unlocked ? primaryColor : undefined,
                                                            borderColor: slab.unlocked ? `${primaryColor}20` : undefined,
                                                            backgroundColor: slab.unlocked ? `${primaryColor}08` : undefined
                                                        }}
                                                    >
                                                        {badgeLabel}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Free Shipping Alert */}
                                {isFreeShippingEnabled && (
                                    <div className="mx-3 py-2 px-3 bg-green-50/10 dark:bg-green-950/5 border border-green-150/40 dark:border-green-900/20 rounded-lg flex items-center gap-2">
                                        <Truck size={12} className="text-green-600 animate-bounce" style={{ color: primaryColor }} />
                                        {amountToFreeShipping > 0 ? (
                                            <p className="text-[9.5px] font-medium text-green-800 dark:text-green-300">
                                                Add <span className="font-bold">₹{amountToFreeShipping}</span> more for <span className="font-bold">FREE shipping</span>!
                                            </p>
                                        ) : (
                                            <p className="text-[9.5px] font-bold text-green-705 dark:text-green-300 flex items-center gap-0.5">
                                                🎉 FREE shipping unlocked!
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Cart Items List */}
                                <div className="px-3 space-y-2.5">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`flex gap-3 p-2.5 bg-gray-55/40 dark:bg-gray-900/10 hover:bg-gray-55/80 dark:hover:bg-gray-900/20 border border-gray-100/50 dark:border-gray-900/40 rounded-lg transition-all duration-200 ${item.id < 0 ? 'opacity-60 pointer-events-none animate-pulse' : ''}`}
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200/60 dark:border-gray-800 relative">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transform hover:scale-105 transition duration-300" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[9px] bg-gray-100 text-gray-400">📦</div>
                                                )}
                                                {item.is_gift && (
                                                    <span className="absolute top-0.5 left-0.5 bg-red-500 text-white text-[7px] font-extrabold px-1 py-0.25 rounded uppercase tracking-wider">
                                                        Gift
                                                    </span>
                                                )}
                                            </div>

                                            {/* Details Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-1">
                                                        <h3 className="font-semibold text-[11px] sm:text-[11.5px] text-gray-900 dark:text-gray-100 line-clamp-1 leading-tight">
                                                            {item.title}
                                                        </h3>
                                                        <span className="font-extrabold text-[11.5px] text-gray-900 dark:text-white shrink-0">
                                                            {item.is_gift ? 'FREE' : `₹${(item.price * item.quantity).toFixed(2)}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9.5px] text-gray-400 dark:text-gray-550 font-medium mt-0.5">{item.brand}</p>
                                                    
                                                    {item.patientDetails && (
                                                        <div className="mt-1 text-[8.5px] text-gray-500 bg-gray-100/50 dark:bg-gray-900 p-1.5 rounded-lg border border-gray-200/50 dark:border-gray-800/80 leading-tight">
                                                            <p><span className="font-bold">Patient:</span> {item.patientDetails.patient_name} ({item.patientDetails.patient_gender})</p>
                                                            <p><span className="font-bold">Doctor ID:</span> #{item.patientDetails.doctor_id}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-1">
                                                    {/* Qty selectors */}
                                                    {!item.is_gift ? (
                                                        <div className="flex items-center bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-0.5">
                                                            <button
                                                                onClick={() => {
                                                                    if (item.quantity > 1) {
                                                                        updateQuantity(item.id, item.quantity - 1);
                                                                    }
                                                                }}
                                                                className="w-4.5 h-4.5 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-gray-955 dark:hover:text-white transition shadow-sm active:scale-95"
                                                            >
                                                                <Minus size={8} />
                                                            </button>
                                                            <span className="w-5 text-center text-[10px] font-bold text-gray-800 dark:text-gray-200">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="w-4.5 h-4.5 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-gray-955 dark:hover:text-white transition shadow-sm active:scale-95"
                                                            >
                                                                <Plus size={8} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[7.5px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-1.5 py-0.5 rounded-full border border-green-200/10">
                                                            Auto Applied
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-gray-405 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded-full transition active:scale-90"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Loyalty Coins Cashback Card */}
                                {enableCoins && (
                                    <div className="mx-3 p-3 border border-amber-100 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/5 rounded-lg flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-amber-100/80 dark:bg-amber-900/20 flex items-center justify-center text-xs shadow-sm">
                                                🪙
                                            </div>
                                            <div>
                                                <p className="text-[10.5px] font-bold text-gray-900 dark:text-gray-105 leading-none">
                                                    RUN Coins (Balance: {walletBalance.toFixed(0)})
                                                </p>
                                                <p className="text-[9px] text-gray-400 dark:text-gray-550 font-semibold mt-1">
                                                    Earn {projectedCoins.toFixed(1)} coins with this purchase
                                                </p>
                                            </div>
                                        </div>
                                        {walletBalance > 0 && (
                                            <button
                                                onClick={toggleCoins}
                                                className={`text-[9.5px] font-extrabold px-3 py-1 rounded-lg border transition-all duration-250 shadow-sm active:scale-95 ${
                                                    walletDeduction > 0
                                                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                                        : 'border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/10'
                                                }`}
                                            >
                                                {walletDeduction > 0 ? 'Applied' : 'Redeem'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Coupon Code Block */}
                                {enableCoupons && (
                                    <div className="mx-3 p-3 border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-955 rounded-lg shadow-sm space-y-3">
                                        {summary?.coupon_applied ? (
                                            <div className="flex justify-between items-center bg-green-50/30 dark:bg-green-950/10 p-2.5 rounded-lg border border-green-100/50 dark:border-green-900/30">
                                                <div>
                                                    <p className="text-[10.5px] font-bold text-green-700 dark:text-green-400 leading-none">Coupon: {summary.coupon_applied}</p>
                                                    <p className="text-[9px] text-green-605 dark:text-green-500 font-bold mt-1">Saved ₹{discount.toFixed(2)}!</p>
                                                </div>
                                                <button onClick={removeCoupon} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-full transition active:scale-90">
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    className="flex-1 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 text-[11px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 outline-none"
                                                />
                                                <button
                                                    onClick={() => handleApplyCoupon()}
                                                    disabled={!couponCode || isApplyingCoupon}
                                                    className="bg-gray-900 dark:bg-gray-800 hover:bg-gray-850 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-40 transition active:scale-95"
                                                >
                                                    {isApplyingCoupon ? '...' : 'Apply'}
                                                </button>
                                            </div>
                                        )}
                                        {couponMessage && (
                                            <p className={`text-[9.5px] font-semibold text-center ${couponMessage.toLowerCase().includes('success') ? 'text-green-605' : 'text-red-500'}`}>
                                                {couponMessage}
                                            </p>
                                        )}

                                        {/* Available Recommended Coupons Accordion */}
                                        {activeCoupons.length > 0 && !summary?.coupon_applied && (
                                            <div className="pt-1.5 border-t border-dashed border-gray-100 dark:border-gray-900">
                                                <button
                                                    onClick={() => setShowCouponsList(!showCouponsList)}
                                                    className="w-full flex items-center justify-between text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 transition outline-none"
                                                >
                                                    <span>Available Coupons ({activeCoupons.length})</span>
                                                    <span className="text-[8px]">{showCouponsList ? '▲ Close' : '▼ View All'}</span>
                                                </button>
                                                
                                                {showCouponsList && (
                                                    <div className="mt-2 space-y-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200/80">
                                                        {activeCoupons.map((coupon) => (
                                                            <div
                                                                key={coupon.code}
                                                                onClick={() => {
                                                                    handleApplyCoupon(coupon.code);
                                                                    setShowCouponsList(false);
                                                                }}
                                                                className="flex items-center justify-between p-2 border border-dashed border-gray-200 dark:border-gray-800 hover:border-green-600/50 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition active:scale-[0.99]"
                                                            >
                                                                <div className="flex flex-col text-left">
                                                                    <span className="font-extrabold text-[10px] text-gray-900 dark:text-gray-200 tracking-wide">{coupon.code}</span>
                                                                    <span className="text-[8.5px] text-gray-400 dark:text-gray-500 mt-0.5">{coupon.description || 'Get discount on your purchase'}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[9px] text-green-650 dark:text-green-450 font-extrabold">{coupon.discount} OFF</span>
                                                                    <span className="text-[8.5px] font-extrabold text-green-700 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded border border-green-150/40">Apply</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Upselling Slider Carousel */}
                                {enableUpsell && upsellProducts.length > 0 && (
                                    <div className="mx-3 p-3 border border-gray-100 dark:border-gray-900 bg-gray-50/20 dark:bg-gray-900/10 rounded-lg shadow-sm space-y-2 relative group">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-[8.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                {upsellTitle}
                                            </h3>
                                            
                                            {/* Desktop Scroll Arrows */}
                                            <div className="hidden md:flex items-center gap-1">
                                                <button
                                                    onClick={() => scrollUpsell('left')}
                                                    className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition active:scale-90"
                                                    aria-label="Previous"
                                                >
                                                    <ChevronLeft size={10} />
                                                </button>
                                                <button
                                                    onClick={() => scrollUpsell('right')}
                                                    className="p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition active:scale-90"
                                                    aria-label="Next"
                                                >
                                                    <ChevronRight size={10} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div
                                            ref={upsellScrollRef}
                                            className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory scroll-smooth"
                                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                        >
                                            {upsellProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="w-[96px] flex-shrink-0 bg-white dark:bg-gray-955 rounded-lg p-1.5 border border-gray-200 dark:border-gray-900 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between snap-start"
                                                >
                                                    <div>
                                                        <div className="w-full aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden relative border border-gray-100 dark:border-gray-900">
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.title} className="w-full h-full object-cover transform hover:scale-105 transition duration-300" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[9px] bg-gray-100 text-gray-400">📦</div>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] font-semibold text-gray-805 dark:text-gray-200 line-clamp-1 mt-1.5 leading-tight">
                                                            {product.title}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-900 dark:text-white mt-0.5">₹{product.price}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddUpsell(product)}
                                                        className="w-full mt-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-805 dark:text-gray-200 text-[9px] font-bold py-1 rounded-lg transition active:scale-95"
                                                    >
                                                        + Add
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center select-none">
                                <div className="text-5xl mb-3 animate-bounce">🛒</div>
                                <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    {emptyText}
                                </h3>
                                <p className="text-[10px] text-gray-400 mb-4">
                                    Add items to your cart to get started.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="text-white font-bold py-2 px-5 rounded-lg text-[11px] transition-all shadow-sm active:scale-95"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {emptyCtaLabel}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Section */}
                    {items.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-gray-900 p-4 bg-white dark:bg-gray-955 sticky bottom-0 z-10">
                            <div className="mb-3.5">
                                <div
                                    onClick={() => setShowBreakdown(!showBreakdown)}
                                    className="flex justify-between items-center cursor-pointer select-none py-0.5 group"
                                >
                                    <span className="text-[9.5px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider group-hover:text-gray-600 transition">Estimated Total</span>
                                    <div className="flex items-center gap-1.5">
                                        {totalSavings > 0 && (
                                            <span className="text-[11px] line-through text-gray-400 font-semibold">
                                                ₹{(finalTotal + totalSavings + walletDeduction).toFixed(2)}
                                            </span>
                                        )}
                                        <span className="text-sm font-black text-gray-900 dark:text-gray-105">
                                            ₹{finalTotal.toFixed(2)}
                                        </span>
                                        <span className="text-[9px] text-gray-400 group-hover:text-gray-600 transition">{showBreakdown ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {showBreakdown && (
                                    <div className="mt-2.5 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-850">
                                        <table className="w-full text-left border-collapse text-[10.5px]">
                                            <tbody>
                                                <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950/20">
                                                    <td className="p-2 font-medium text-gray-600 dark:text-gray-400">Taxable Value (Base Price)</td>
                                                    <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">₹{(totalPrice - (summary?.total_tax || 0)).toFixed(2)}</td>
                                                </tr>
                                                {discount > 0 && (
                                                    <tr className="border-b border-gray-150 dark:border-gray-850">
                                                        <td className="p-2 font-medium text-green-600 dark:text-green-400 font-bold">Coupon / Bundle Discounts</td>
                                                        <td className="p-2 text-right font-bold text-green-600 dark:text-green-400">-₹{discount.toFixed(2)}</td>
                                                    </tr>
                                                )}
                                                {milestoneDiscount > 0 && (
                                                    <tr className="border-b border-gray-150 dark:border-gray-850">
                                                        <td className="p-2 font-medium text-green-600 dark:text-green-400 font-bold">Milestone Reward Discount</td>
                                                        <td className="p-2 text-right font-bold text-green-600 dark:text-green-400">-₹{milestoneDiscount.toFixed(2)}</td>
                                                    </tr>
                                                )}
                                                {walletDeduction > 0 && (
                                                    <tr className="border-b border-gray-150 dark:border-gray-850">
                                                        <td className="p-2 font-medium text-orange-600 dark:text-orange-400 font-bold">Loyalty Coins Applied</td>
                                                        <td className="p-2 text-right font-bold text-orange-600 dark:text-orange-400">-₹{walletDeduction.toFixed(2)}</td>
                                                    </tr>
                                                )}
                                                <tr className="border-b border-gray-150 dark:border-gray-850">
                                                    <td className="p-2 font-medium text-gray-600 dark:text-gray-400">
                                                        {getTaxLabel()}
                                                    </td>
                                                    <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">₹{(summary?.total_tax || 0).toFixed(2)}</td>
                                                </tr>
                                                {summary?.platform_fee !== undefined && Number(summary.platform_fee) > 0 && (
                                                    <tr className="border-b border-gray-150 dark:border-gray-850">
                                                        <td className="p-2 font-medium text-gray-600 dark:text-gray-400">Convenience Fee</td>
                                                        <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">₹{Number(summary.platform_fee).toFixed(2)}</td>
                                                    </tr>
                                                )}
                                                <tr className="border-b border-gray-150 dark:border-gray-850">
                                                    <td className="p-2 font-medium text-gray-600 dark:text-gray-400">Delivery Charge</td>
                                                    <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">
                                                        {summary?.milestone_free_shipping 
                                                            ? 'FREE' 
                                                            : (shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE')}
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50/50 dark:bg-gray-950/40">
                                                    <td className="p-2 font-bold text-gray-905 dark:text-white">Total Price (Inclusive of all taxes)</td>
                                                    <td className="p-2 text-right font-black text-gray-905 dark:text-white">₹{finalTotal.toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Savings Highlights */}
                            {totalSavings > 0 && (
                                <div className="mb-3.5 bg-green-50/50 dark:bg-green-950/10 text-green-700 dark:text-green-400 text-[9.5px] font-bold text-center py-1.5 rounded-lg border border-green-100 dark:border-green-900/30 shadow-sm animate-pulse">
                                    🎉 You Saved ₹{totalSavings.toFixed(2)} ({((totalSavings / (finalTotal + totalSavings)) * 100).toFixed(0)}%) so far!
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setIsCheckoutModalOpen(true);
                                        onClose(); // Close the cart drawer!
                                    }}
                                    className="w-full text-white text-center font-black py-4 rounded-lg text-[12px] tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.97] hover:scale-[1.01] hover:shadow-xl hover:brightness-105"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {checkoutLabel} <Lock size={12} className="animate-pulse" />
                                </button>
                                
                                <p className="text-[8.5px] text-gray-400 font-semibold text-center flex items-center justify-center gap-1">
                                    <ShieldCheck size={10} className="text-gray-400" /> {secureText}
                                </p>

                                {reviewsText && (
                                    <p className="text-[7.5px] text-gray-400 text-center uppercase tracking-wider font-semibold">
                                        ⭐ {reviewsText}
                                    </p>
                                )}

                                {/* Payment Gateways Tray */}
                                <div className="mt-3.5 pt-3.5 border-t border-gray-100 dark:border-gray-900 flex flex-col items-center gap-2">
                                    <p className="text-[7.5px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-widest leading-none">Guaranteed Safe & Secure Checkout</p>
                                    <div className="flex items-center justify-center gap-3 opacity-60 hover:opacity-85 transition-opacity duration-200">
                                        {/* UPI */}
                                        <div className="h-4 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-[8px] font-black text-blue-600 tracking-tighter flex items-center justify-center">
                                            UPI
                                        </div>
                                        {/* Visa */}
                                        <svg className="h-3.5 w-auto text-blue-800 dark:text-blue-600" viewBox="0 0 100 32" fill="currentColor">
                                            <path d="M15.2 2.1l-6 19.3h-4L1.7 5.2c-.3-1.1-1-1.5-2.2-1.9L.3 2.1h6.6c.9 0 1.6.6 1.8 1.4L10.3 17 14.1 2.1h4.1v17.2h3.9v-12l3.2 12.1h3.3l4.3-17.2h-3.6z" />
                                            <path d="M42.2 2.1H37c-1.3 0-2.3.7-2.8 1.8l-8 19.6h4.1l.8-2.3h5.1l.5 2.3h3.6L42.2 2.1zm-8.8 15.6l2-5.5.9 2.5 1.1 3H33.4z" />
                                            <path d="M57.6 13c-.2-4.1-5.7-4.3-5.7-6.2 0-.6.6-1.2 1.8-1.4 1.5-.2 2.8.2 3.6.5l.6-2.9c-.8-.3-2.1-.6-3.8-.6-4 0-6.8 2.1-6.8 5.2 0 2.3 2 3.5 3.6 4.3 1.6.8 2.2 1.3 2.2 2-.1 1-1.2 1.4-2.3 1.4-2 0-3.1-.5-4-1l-.6 3c.9.4 2.5.8 4.2.8 4.1.1 6.8-2 6.8-5.1z" />
                                        </svg>
                                        {/* Mastercard */}
                                        <svg className="h-4.5 w-auto" viewBox="0 0 40 32" fill="currentColor">
                                            <circle cx="14" cy="16" r="12" fill="#EB001B" opacity="0.85"/>
                                            <circle cx="26" cy="16" r="12" fill="#F79E1B" opacity="0.85"/>
                                        </svg>
                                        {/* RuPay */}
                                        <div className="h-4 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-[8px] font-black text-amber-600 tracking-tight italic flex items-center justify-center">
                                            RuPay
                                        </div>
                                        {/* GPay */}
                                        <div className="h-4 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 text-[8px] font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center leading-none">
                                            <span className="text-blue-500 font-extrabold">G</span>
                                            <span className="text-red-500 font-extrabold">P</span>
                                            <span className="text-yellow-500 font-extrabold">a</span>
                                            <span className="text-green-500 font-extrabold">y</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isCheckoutModalOpen && (
                <ShopfloCheckout 
                    isModal 
                    onClose={() => setIsCheckoutModalOpen(false)} 
                    prefetchedData={prefetchedCheckoutData} 
                    prefetchedSettings={publicSettings} 
                />
            )}
        </>
    );
}
