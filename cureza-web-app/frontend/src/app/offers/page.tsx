'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    Ticket, Copy, Check, Clock, Truck, ArrowRight, ChevronLeft, ChevronRight,
    Coins, UserPlus, CreditCard, Sparkles, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

export default function OffersPage() {
    const { summary } = useCart();
    const { showToast } = useToast();
    
    // API States
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [launchProducts, setLaunchProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    // UI States
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'coupons' | 'bank' | 'loyalty'>('all');

    // Slider Ref & States (for active coupons slider when count > 3)
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollButtons = () => {
        if (sliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
            setCanScrollLeft(scrollLeft > 2);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!sliderRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeftState(sliderRef.current.scrollLeft);
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderRef.current.scrollLeft = scrollLeftState - walk;
    };

    const handleScroll = () => {
        updateScrollButtons();
        if (sliderRef.current) {
            const { scrollLeft, clientWidth } = sliderRef.current;
            const itemWidth = sliderRef.current.firstElementChild?.clientWidth || clientWidth;
            const index = Math.round(scrollLeft / (itemWidth + 16));
            setActiveIndex(index);
        }
    };

    const slide = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const { scrollLeft, clientWidth } = sliderRef.current;
            const itemWidth = sliderRef.current.firstElementChild?.clientWidth || clientWidth;
            const scrollTo = direction === 'left' 
                ? scrollLeft - (itemWidth + 16) 
                : scrollLeft + (itemWidth + 16);
            sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    // Fallback Launch Products if API list is empty or fails
    const fallbackLaunchProducts = [
        {
            id: 991,
            title: 'Cureza Organic Triphala Colon Cleanse',
            slug: 'cureza-organic-triphala-colon-cleanse-detox',
            price: 449.00,
            original_price: 599.00,
            image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
            short_description: 'Standardized Ayurvedic extracts of Amla, Haritaki, and Bibhitaki for gentle colon cleanse.',
            category: { name: 'Ayurveda', slug: 'ayurveda' },
            rating: '4.8',
            reviews_count: 34
        },
        {
            id: 992,
            title: 'Cureza Neem Blood Purifier & Skin Detox',
            slug: 'cureza-neem-blood-purifier-skin-detox',
            price: 379.00,
            original_price: 499.00,
            image: 'https://images.unsplash.com/photo-1607619056574-7b8f304f3c6f?auto=format&fit=crop&q=80&w=600',
            short_description: 'Natural neem blood purifying capsules to purge toxins and support clear skin.',
            category: { name: 'Ayurveda', slug: 'ayurveda' },
            rating: '4.7',
            reviews_count: 28
        },
        {
            id: 993,
            title: 'Cureza Liver Care & Kidney Detox Syrup',
            slug: 'cureza-liver-care-kidney-detox-syrup',
            price: 549.00,
            original_price: 699.00,
            image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=600',
            short_description: 'Synergistic herbal syrup designed to support optimal liver and kidney health.',
            category: { name: 'Ayurveda', slug: 'ayurveda' },
            rating: '4.9',
            reviews_count: 42
        }
    ];

    const bankOffers = [
        {
            id: 'bank-1',
            bank: "HDFC Bank Card Offer",
            details: "Get 10% Instant Discount on HDFC Credit & Debit Cards. Min. purchase ₹1,499. Max discount ₹500.",
            code: "HDFCWELNESS",
            tag: "Cards"
        },
        {
            id: 'bank-2',
            bank: "UPI Instant Discount",
            details: "Flat 5% Extra Off up to ₹100 on checkout using any UPI apps (GPay, PhonePe, Paytm). No min limit.",
            code: "UPI5",
            tag: "UPI"
        },
        {
            id: 'bank-3',
            bank: "Paytm Wallet Cashback",
            details: "Get flat ₹100 Cashback on transactions via Paytm Wallet. Min. order value ₹999.",
            code: "PAYTM100",
            tag: "Wallet"
        }
    ];

    const loyaltyOffers = [
        {
            id: 'loy-1',
            title: "Refer a Friend, Get ₹200",
            description: "Share the gift of wellness. Your friend gets ₹200 discount on their first order, and you get ₹200 in Cureza cash after delivery.",
            action: "Get Referral Code",
            link: "/account/referrals",
            icon: UserPlus
        },
        {
            id: 'loy-2',
            title: "Cureza Health Coins Program",
            description: "Earn 1 Health Coin for every ₹10 spent. Redeem coins directly on checkout for cash discount or free botanical samples.",
            action: "My Coin Balance",
            link: "/account/coins",
            icon: Coins
        }
    ];

    const faqs = [
        {
            q: "How do I apply a coupon code?",
            a: "You can apply coupon codes at the final checkout screen. Simply copy the code from this page and paste it into the 'Promo Code' field during checkout, then click 'Apply'."
        },
        {
            q: "Can I combine multiple coupons?",
            a: "Only one coupon code can be applied per order. However, coupon discounts can be combined with site-wide markdown discounts, payment partner discounts, and free shipping."
        },
        {
            q: "Why is my coupon code not working?",
            a: "Coupons may fail if your cart total does not meet the minimum requirement, if the coupon has expired, or if it is restricted to specific categories. Check the terms listed on each card."
        },
        {
            q: "Does the discount apply to shipping charges?",
            a: "Coupon discounts apply to the product subtotal. Standard shipping is free for all orders of ₹999 or more, calculated after coupon discounts are applied."
        }
    ];

    // Fetch active coupons & products
    useEffect(() => {
        // Fetch active coupons
        api.get('/coupons')
            .then((res) => {
                setCoupons(res.data);
            })
            .catch((err) => {
                console.error("Failed to load active coupons:", err);
                showToast("Failed to fetch active coupons", "error");
            })
            .finally(() => setLoading(false));

        // Fetch launch products
        api.get('/products?category=latest-launch')
            .then((res) => {
                if (res.data && res.data.length > 0) {
                    setLaunchProducts(res.data);
                } else {
                    setLaunchProducts(fallbackLaunchProducts);
                }
            })
            .catch((err) => {
                console.error("Failed to load launch products:", err);
                setLaunchProducts(fallbackLaunchProducts);
            })
            .finally(() => setProductsLoading(false));
    }, []);

    // Countdown Timer logic based on the featured coupon's actual expiration
    useEffect(() => {
        if (loading) return;

        const updateTimer = () => {
            let targetDate = new Date();
            targetDate.setHours(24, 0, 0, 0); // Default: end of today

            // Use LAUNCH10 or first coupon's expiration date if available
            const featured = coupons.find(c => c.code === 'LAUNCH10') || coupons[0];
            if (featured && featured.valid_till) {
                const parsedDate = new Date(featured.valid_till);
                if (!isNaN(parsedDate.getTime()) && parsedDate.getTime() > new Date().getTime()) {
                    targetDate = parsedDate;
                }
            }

            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();
            
            const days = Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
            const hours = Math.max(Math.floor((diff / (1000 * 60 * 60)) % 24), 0);
            const minutes = Math.max(Math.floor((diff / 1000 / 60) % 60), 0);
            const seconds = Math.max(Math.floor((diff / 1000) % 60), 0);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [coupons, loading]);

    useEffect(() => {
        updateScrollButtons();
    }, [coupons]);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showToast(`Coupon code "${code}" copied!`, "success");
        setTimeout(() => setCopiedCode(null), 2500);
    };

    // Free shipping variables
    const cartTotal = summary?.subtotal || 0;
    const freeShippingThreshold = 999;
    const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
    const neededAmount = Math.max(freeShippingThreshold - cartTotal, 0);

    // Premium styling config
    const cardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none'
    };

    // Featured Flash Deal Coupon (dynamically loaded from database if available)
    const featuredCoupon = coupons.find(c => c.code === 'LAUNCH10') || coupons[0] || {
        code: 'LAUNCH10',
        title: '10% Off Sitewide',
        description: 'Enjoy flat 10% off on all products sitewide to celebrate our platform launch!',
        min_order_value: 0
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#052326] py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6 space-y-12 md:space-y-16">
                
                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B08900] uppercase block">
                        Cureza Rewards & Savings
                    </span>
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#052326] font-heading">
                        Exclusive Offers & Coupons
                    </h1>
                    <div className="w-16 h-[1.5px] bg-[#B08900] mx-auto my-4" />
                    <p className="text-sm md:text-base text-[#052326]/75 leading-relaxed font-normal">
                        Unlock doctor-certified organic, Ayurvedic, and hemp formulations at unbeatable prices. Copy the codes below and apply them during checkout to claim your benefits.
                    </p>
                </div>

                {/* Navigation Tabs for Filtering */}
                <div className="flex justify-center border-b border-[rgba(85,85,85,0.12)]">
                    <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar py-1">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`text-xs md:text-sm font-medium pb-3 transition-all relative whitespace-nowrap cursor-pointer ${
                                activeTab === 'all' ? 'text-[#052326] font-semibold' : 'text-[#052326]/60 hover:text-[#052326]'
                            }`}
                        >
                            All Offers
                            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#052326]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('coupons')}
                            className={`text-xs md:text-sm font-medium pb-3 transition-all relative whitespace-nowrap cursor-pointer ${
                                activeTab === 'coupons' ? 'text-[#052326] font-semibold' : 'text-[#052326]/60 hover:text-[#052326]'
                            }`}
                        >
                            Coupon Codes
                            {activeTab === 'coupons' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#052326]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('bank')}
                            className={`text-xs md:text-sm font-medium pb-3 transition-all relative whitespace-nowrap cursor-pointer ${
                                activeTab === 'bank' ? 'text-[#052326] font-semibold' : 'text-[#052326]/60 hover:text-[#052326]'
                            }`}
                        >
                            Bank Discounts
                            {activeTab === 'bank' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#052326]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`text-xs md:text-sm font-medium pb-3 transition-all relative whitespace-nowrap cursor-pointer ${
                                activeTab === 'loyalty' ? 'text-[#052326] font-semibold' : 'text-[#052326]/60 hover:text-[#052326]'
                            }`}
                        >
                            Referrals & Coins
                            {activeTab === 'loyalty' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#052326]" />}
                        </button>
                    </div>
                </div>

                {/* Hero Promotion Banner with Countdown */}
                {(activeTab === 'all' || activeTab === 'coupons') && (
                    <div 
                        className="bg-[#052326] text-[#F8F3EF] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group"
                        style={cardStyle}
                    >
                        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#F0C417] opacity-[0.03] rounded-full blur-2xl pointer-events-none transition-all duration-700 group-hover:scale-125" />
                        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="space-y-4 text-center lg:text-left z-10 max-w-xl">
                            <span 
                                className="bg-[#F0C417] text-[#052326] text-[10px] md:text-xs font-semibold px-3 py-1 uppercase tracking-wider inline-block"
                                style={{ borderRadius: '4px' }}
                            >
                                Flash Sale
                            </span>
                            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight leading-tight font-heading">
                                {featuredCoupon.code === 'LAUNCH10' ? 'Platform Launch Flash Sale' : `Featured Offer: ${featuredCoupon.title}`}
                            </h2>
                            <p className="text-xs md:text-sm text-[#F8F3EF]/80 font-normal leading-relaxed">
                                Apply code <span className="font-semibold text-white tracking-wider underline font-mono">{featuredCoupon.code}</span> at checkout and enjoy <span className="text-[#F0C417] font-semibold">{featuredCoupon.title || '10% off'}</span> on all products sitewide to celebrate our platform launch!
                            </p>
                            <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                                <button 
                                    onClick={() => handleCopy(featuredCoupon.code)}
                                    className="bg-[#F0C417] text-[#052326] hover:bg-[#F0C417]/90 text-xs font-semibold px-5 py-2.5 rounded-[4px] flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                                >
                                    {copiedCode === featuredCoupon.code ? (
                                        <>
                                            <Check size={14} className="animate-pulse" /> Copied Code!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} /> Copy Code: {featuredCoupon.code}
                                        </>
                                    )}
                                </button>
                                <Link href="/shop">
                                    <button className="bg-transparent border border-[#F8F3EF]/40 text-[#F8F3EF] hover:border-white hover:bg-white/5 text-xs font-semibold px-5 py-2.5 rounded-[4px] flex items-center gap-2 transition-all cursor-pointer">
                                        Shop The Sale <ArrowRight size={14} />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Live Countdown Timer */}
                        <div className="flex flex-col items-center gap-3 z-10 bg-[#F8F3EF]/5 backdrop-blur border border-[#F8F3EF]/10 p-6 md:p-8 rounded-[8px] min-w-[280px]">
                            <span className="text-[10px] md:text-xs font-semibold tracking-widest text-[#F8F3EF]/70 uppercase flex items-center gap-1.5">
                                <Clock size={12} className="text-[#F0C417]" /> Offer Ends In
                            </span>
                            <div className="flex items-center gap-3 mt-1">
                                {timeLeft.days > 0 && (
                                    <div className="text-center w-14">
                                        <span className="block text-2xl md:text-3xl font-semibold font-mono tracking-tight text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                                        <span className="text-[9px] font-medium tracking-wider text-[#F8F3EF]/60 uppercase">Days</span>
                                    </div>
                                )}
                                <div className="text-center w-14">
                                    <span className="block text-2xl md:text-3xl font-semibold font-mono tracking-tight text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                                    <span className="text-[9px] font-medium tracking-wider text-[#F8F3EF]/60 uppercase">Hrs</span>
                                </div>
                                <div className="text-center w-14">
                                    <span className="block text-2xl md:text-3xl font-semibold font-mono tracking-tight text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                    <span className="text-[9px] font-medium tracking-wider text-[#F8F3EF]/60 uppercase">Mins</span>
                                </div>
                                <div className="text-center w-14">
                                    <span className="block text-2xl md:text-3xl font-semibold font-mono tracking-tight text-[#F0C417]">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                    <span className="text-[9px] font-medium tracking-wider text-[#F8F3EF]/60 uppercase">Secs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Free Shipping Progress Meter */}
                <div 
                    className="bg-white p-6 md:p-8 space-y-4"
                    style={cardStyle}
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-10 h-10 bg-[#052326]/5 flex items-center justify-center border border-[rgba(85,85,85,0.18)]"
                                style={{ borderRadius: '8px' }}
                            >
                                <Truck className="text-[#052326]" size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-[#052326]">Free Shipping Progress</h3>
                                <p className="text-[11px] text-[#052326]/60 mt-0.5">Free standard shipping on all orders over ₹{freeShippingThreshold}</p>
                            </div>
                        </div>
                        {neededAmount > 0 ? (
                            <span 
                                className="text-xs font-medium bg-[#FDFBF7] px-3 py-1.5 border border-[rgba(85,85,85,0.18)] text-[#052326]"
                                style={{ borderRadius: '8px' }}
                            >
                                Add <span className="font-semibold text-[#052326]">₹{neededAmount}</span> more to unlock free shipping
                            </span>
                        ) : (
                            <span 
                                className="text-xs font-semibold text-emerald-800 bg-emerald-50/50 px-3 py-1.5 border border-emerald-200/60 flex items-center gap-1"
                                style={{ borderRadius: '8px' }}
                            >
                                <ShieldCheck size={14} /> Free Shipping Unlocked!
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#FDFBF7] h-2 rounded-full relative overflow-hidden border border-[rgba(85,85,85,0.18)]">
                        <div 
                            className="h-full bg-[#052326] rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* 1. Active Coupons Listing (Slider/Grid) */}
                {(activeTab === 'all' || activeTab === 'coupons') && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[rgba(85,85,85,0.18)] pb-3">
                            <h3 className="text-lg md:text-xl font-medium flex items-center gap-2 text-[#052326] font-heading">
                                <Ticket size={20} className="text-[#B08900]" /> Active Coupons & Codes
                            </h3>
                            {coupons.length > 3 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => slide('left')}
                                        className="p-2 bg-white text-[#052326] hover:bg-[#F8F3EF] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                        disabled={!canScrollLeft}
                                        style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)' }}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => slide('right')}
                                        className="p-2 bg-white text-[#052326] hover:bg-[#F8F3EF] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                        disabled={!canScrollRight}
                                        style={{ borderRadius: '8px', border: '1px solid rgba(85, 85, 85, 0.18)' }}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-xs font-light text-[#052326]/50">Loading active coupons...</div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-16 bg-white border border-[rgba(85, 85, 85, 0.18)]" style={{ borderRadius: '8px' }}>
                                <p className="text-xs text-[#052326]/50">No coupon offers listed at the moment.</p>
                            </div>
                        ) : coupons.length > 3 ? (
                            /* Slider Layout */
                            <div className="relative">
                                <div
                                    ref={sliderRef}
                                    onScroll={handleScroll}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUpOrLeave}
                                    onMouseLeave={handleMouseUpOrLeave}
                                    onMouseMove={handleMouseMove}
                                    className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing py-2 px-1"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {coupons.map((coupon) => (
                                        <div 
                                            key={coupon.code} 
                                            className="w-[85vw] sm:w-[320px] md:w-[350px] flex-shrink-0 bg-white p-6 flex flex-col justify-between snap-start transition-all duration-300 border border-[rgba(85,85,85,0.18)] rounded-[8px] hover:border-[#052326]/40 relative overflow-hidden"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span 
                                                        className="bg-[#052326]/5 text-[#052326] text-[10px] font-medium px-3 py-1 border border-[rgba(85,85,85,0.18)]"
                                                        style={{ borderRadius: '4px' }}
                                                    >
                                                        Active Coupon
                                                    </span>
                                                    {coupon.min_order_value && (
                                                        <span className="text-[10px] text-[#052326]/60 font-medium">Min Order: ₹{coupon.min_order_value}</span>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <h4 className="text-lg font-semibold text-[#052326]">{coupon.title}</h4>
                                                    <p className="text-xs text-[#052326]/70 leading-relaxed font-normal">{coupon.description}</p>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-dashed border-[rgba(85,85,85,0.18)] space-y-3 relative">
                                                {/* Dashed line details (Ticket punch design) */}
                                                <div className="absolute -top-[9px] -left-[30px] w-4 h-4 rounded-full bg-[#FDFBF7] border-r border-[rgba(85,85,85,0.18)]" />
                                                <div className="absolute -top-[9px] -right-[30px] w-4 h-4 rounded-full bg-[#FDFBF7] border-l border-[rgba(85,85,85,0.18)]" />

                                                <div 
                                                    className="bg-[#FDFBF7] border border-[rgba(85,85,85,0.18)] px-3.5 py-2 flex items-center justify-between gap-3 transition-colors hover:bg-[#F8F3EF]/40"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <span className="font-mono font-medium text-sm text-[#052326] tracking-wider uppercase">{coupon.code}</span>
                                                    <button 
                                                        onClick={() => handleCopy(coupon.code)}
                                                        className="text-[#052326]/60 hover:text-[#052326] transition active:scale-95 cursor-pointer"
                                                    >
                                                        {copiedCode === coupon.code ? <Check size={16} className="text-emerald-600 animate-pulse" /> : <Copy size={16} />}
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] text-[#052326]/50">
                                                    <span>{coupon.valid_till ? `Expires: ${coupon.valid_till}` : 'Limited Period Offer'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Slider Progress/Dots Indicator */}
                                <div className="flex justify-center gap-1.5 mt-4">
                                    {coupons.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (sliderRef.current) {
                                                    const itemWidth = sliderRef.current.firstElementChild?.clientWidth || 0;
                                                    sliderRef.current.scrollTo({ left: idx * (itemWidth + 16), behavior: 'smooth' });
                                                }
                                            }}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                activeIndex === idx ? 'w-6 bg-[#052326]' : 'w-1.5 bg-[#052326]/20'
                                            }`}
                                            aria-label={`Go to slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Grid Layout */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {coupons.map((coupon) => (
                                    <div 
                                        key={coupon.code} 
                                        className="bg-white p-6 flex flex-col justify-between transition-all duration-300 border border-[rgba(85,85,85,0.18)] rounded-[8px] hover:border-[#052326]/40 relative overflow-hidden"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span 
                                                    className="bg-[#052326]/5 text-[#052326] text-[10px] font-medium px-3 py-1 border border-[rgba(85,85,85,0.18)]"
                                                    style={{ borderRadius: '4px' }}
                                                >
                                                    Active Coupon
                                                </span>
                                                {coupon.min_order_value && (
                                                    <span className="text-[10px] text-[#052326]/60 font-medium">Min Order: ₹{coupon.min_order_value}</span>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-lg font-semibold text-[#052326]">{coupon.title}</h4>
                                                <p className="text-xs text-[#052326]/70 leading-relaxed font-normal">{coupon.description}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-dashed border-[rgba(85,85,85,0.18)] space-y-3 relative">
                                            {/* Dashed line details (Ticket punch design) */}
                                            <div className="absolute -top-[9px] -left-[30px] w-4 h-4 rounded-full bg-[#FDFBF7] border-r border-[rgba(85,85,85,0.18)]" />
                                            <div className="absolute -top-[9px] -right-[30px] w-4 h-4 rounded-full bg-[#FDFBF7] border-l border-[rgba(85,85,85,0.18)]" />

                                            <div 
                                                className="bg-[#FDFBF7] border border-[rgba(85,85,85,0.18)] px-3.5 py-2 flex items-center justify-between gap-3 transition-colors hover:bg-[#F8F3EF]/40"
                                                style={{ borderRadius: '6px' }}
                                            >
                                                <span className="font-mono font-medium text-sm text-[#052326] tracking-wider uppercase">{coupon.code}</span>
                                                <button 
                                                    onClick={() => handleCopy(coupon.code)}
                                                    className="text-[#052326]/60 hover:text-[#052326] transition active:scale-95 cursor-pointer"
                                                >
                                                    {copiedCode === coupon.code ? <Check size={16} className="text-emerald-600 animate-pulse" /> : <Copy size={16} />}
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-[#052326]/50">
                                                <span>{coupon.valid_till ? `Expires: ${coupon.valid_till}` : 'Limited Period Offer'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Platform Launch Specials Grid Section */}
                {(activeTab === 'all' || activeTab === 'coupons') && (
                    <div className="space-y-6 pt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(85,85,85,0.18)] pb-3">
                            <div className="space-y-1">
                                <h3 className="text-lg md:text-xl font-medium flex items-center gap-2 text-[#052326] font-heading">
                                    <Sparkles size={20} className="text-[#F0C417]" /> Platform Launch Specials
                                </h3>
                                <p className="text-xs text-[#052326]/60 max-w-xl">
                                    Use coupon <span className="font-semibold text-[#052326]">LAUNCH10</span> to get flat 10% off on our newly launched premium botanical remedies.
                                </p>
                            </div>
                            <Link href="/shop?category=latest-launch">
                                <Button 
                                    variant="outline" 
                                    className="border-[rgba(85,85,85,0.18)] hover:bg-[#052326]/5 text-xs text-[#052326] h-9 px-4 rounded-[8px] self-start"
                                >
                                    View All New Arrivals
                                </Button>
                            </Link>
                        </div>

                        {productsLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white p-4 space-y-4 border border-[rgba(85,85,85,0.12)] rounded-[8px] animate-pulse">
                                        <div className="aspect-square bg-gray-100 rounded-[6px]" />
                                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        <div className="h-8 bg-gray-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Side Promo Card */}
                                <div 
                                    className="bg-gradient-to-br from-[#052326] to-[#0d3f44] text-[#F8F3EF] p-6 flex flex-col justify-between rounded-[8px] border border-[rgba(85,85,85,0.18)] min-h-[300px]"
                                >
                                    <div className="space-y-4">
                                        <span className="text-[9px] font-semibold bg-[#F0C417] text-[#052326] px-2.5 py-0.5 rounded-[4px] uppercase tracking-wider inline-block">
                                            Platform Launch
                                        </span>
                                        <h4 className="text-xl font-semibold leading-snug font-heading">
                                            Celebrate Our Platform Launch
                                        </h4>
                                        <p className="text-xs text-[#F8F3EF]/75 leading-relaxed font-light">
                                            Explore our premium doctor-formulated organic wellness remedies, Ayurvedic extracts, and hemp formulations with flat 10% off sitewide.
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-[#F8F3EF]/10">
                                        <div className="bg-[#F8F3EF]/10 border border-[#F8F3EF]/20 rounded-[6px] p-2.5 flex items-center justify-between">
                                            <span className="font-mono font-medium text-xs text-white uppercase tracking-wider">LAUNCH10</span>
                                            <button 
                                                onClick={() => handleCopy('LAUNCH10')}
                                                className="text-[#F8F3EF]/70 hover:text-white transition cursor-pointer"
                                            >
                                                {copiedCode === 'LAUNCH10' ? <Check size={14} className="text-[#F0C417]" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-center text-[#F8F3EF]/50">No minimum order required</p>
                                    </div>
                                </div>

                                {/* Products Cards */}
                                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {launchProducts.slice(0, 3).map((product) => (
                                        <div key={product.id} className="relative group">
                                            <div className="absolute top-2 left-2 z-10">
                                                <span className="bg-[#052326] text-white text-[9px] font-semibold px-2 py-0.5 rounded-[4px] border border-[#F8F3EF]/10 shadow-sm uppercase tracking-wider block">
                                                    10% Off Code
                                                </span>
                                            </div>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Partner Bank Cards & Wallets Offers */}
                {(activeTab === 'all' || activeTab === 'bank') && (
                    <div className="space-y-6 pt-4">
                        <div className="border-b border-[rgba(85,85,85,0.18)] pb-3">
                            <h3 className="text-lg md:text-xl font-medium flex items-center gap-2 text-[#052326] font-heading">
                                <CreditCard size={20} className="text-[#B08900]" /> Bank & Payment Partner Offers
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {bankOffers.map((offer) => (
                                <div 
                                    key={offer.id} 
                                    className="bg-white p-6 flex flex-col justify-between border border-[rgba(85,85,85,0.18)] rounded-[8px] hover:border-[#052326]/40 transition-all duration-300"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span 
                                                className="bg-[#052326]/5 text-[#052326] text-[9px] font-semibold px-2.5 py-0.5 rounded-[4px] uppercase tracking-wider border border-[rgba(85,85,85,0.12)]"
                                            >
                                                {offer.tag}
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-sm text-[#052326]">{offer.bank}</h4>
                                        <p className="text-xs text-[#052326]/70 leading-relaxed">{offer.details}</p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[rgba(85,85,85,0.12)] flex items-center justify-between gap-3">
                                        <span className="font-mono text-xs text-[#052326]/50 uppercase">Code: <span className="font-semibold text-[#052326] tracking-wider">{offer.code}</span></span>
                                        <button 
                                            onClick={() => handleCopy(offer.code)}
                                            className="text-xs text-[#052326] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedCode === offer.code ? (
                                                <span className="text-emerald-700 flex items-center gap-0.5"><Check size={12} /> Copied</span>
                                            ) : (
                                                <span>Copy Code</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Loyalty Program & Referral Incentives */}
                {(activeTab === 'all' || activeTab === 'loyalty') && (
                    <div className="space-y-6 pt-4">
                        <div className="border-b border-[rgba(85,85,85,0.18)] pb-3">
                            <h3 className="text-lg md:text-xl font-medium flex items-center gap-2 text-[#052326] font-heading">
                                <Sparkles size={20} className="text-[#F0C417]" /> Cureza Loyalty & Referrals
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loyaltyOffers.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <div 
                                        key={item.id}
                                        className="bg-[#F8F3EF]/60 p-6 flex flex-col justify-between border border-[rgba(85,85,85,0.18)] rounded-[8px] hover:bg-white transition-all duration-300"
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#052326]/5 border border-[rgba(85,85,85,0.18)] flex items-center justify-center flex-shrink-0">
                                                <IconComponent className="text-[#052326]" size={18} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <h4 className="font-semibold text-sm md:text-base text-[#052326]">{item.title}</h4>
                                                <p className="text-xs text-[#052326]/70 leading-relaxed font-normal">{item.description}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-[rgba(85,85,85,0.12)] flex justify-end">
                                            <Link href={item.link}>
                                                <Button 
                                                    className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 text-[10px] md:text-xs font-medium tracking-wider h-9 px-4 rounded-[4px] flex items-center gap-1.5"
                                                >
                                                    {item.action} <ArrowRight size={12} />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 5. FAQs Accordion */}
                {activeTab === 'all' && (
                    <div className="space-y-6 pt-4 max-w-4xl mx-auto">
                        <div className="border-b border-[rgba(85,85,85,0.18)] pb-3 text-center">
                            <h3 className="text-lg md:text-xl font-medium text-[#052326] font-heading">
                                Frequently Asked Questions
                            </h3>
                            <p className="text-xs text-[#052326]/60 mt-1">Have queries regarding coupon application and limits? Find answers below.</p>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div 
                                    key={idx}
                                    className="bg-white border border-[rgba(85,85,85,0.18)] rounded-[8px] overflow-hidden transition-all duration-300"
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                        className="w-full p-4 flex items-center justify-between gap-4 text-left font-medium text-xs md:text-sm text-[#052326] hover:bg-[#052326]/5 transition-colors cursor-pointer"
                                    >
                                        <span>{faq.q}</span>
                                        {openFaqIndex === idx ? <ChevronUp size={16} className="text-[#052326]/50" /> : <ChevronDown size={16} className="text-[#052326]/50" />}
                                    </button>

                                    {openFaqIndex === idx && (
                                        <div className="p-4 border-t border-[rgba(85,85,85,0.12)] bg-[#FDFBF7] text-xs text-[#052326]/70 leading-relaxed">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom Call To Action */}
                <div className="text-center pt-6">
                    <span className="text-[10px] text-[#052326]/50 uppercase tracking-widest block mb-3">Accelerate Your Wellness Journey</span>
                    <Link href="/shop">
                        <Button 
                            className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 text-xs font-semibold tracking-wider h-11 px-8 rounded-[8px] flex items-center gap-2 mx-auto transition-all active:scale-95"
                        >
                            Apply Coupon & Shop All Products <ArrowRight size={14} />
                        </Button>
                    </Link>
                </div>

            </div>
        </div>
    );
}
