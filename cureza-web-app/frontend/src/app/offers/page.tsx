'use client';

import { useState, useEffect } from 'react';
import { Ticket, Copy, Check, Clock, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Link from 'next/link';

export default function OffersPage() {
    const { summary, items } = useCart();
    const { showToast } = useToast();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Countdown Timer State
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

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

        // Expiring deal countdown (set to end of today)
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0); // End of today
            const diff = tomorrow.getTime() - now.getTime();
            
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({ hours, minutes, seconds });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showToast(`Coupon code ${code} copied!`, "success");
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Free shipping variables
    const cartTotal = summary?.subtotal || 0;
    const freeShippingThreshold = 999; // Default threshold, or we can fetch dynamically
    const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
    const neededAmount = Math.max(freeShippingThreshold - cartTotal, 0);

    return (
        <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-4 md:px-8 lg:px-12">
            <div className="max-w-5xl mx-auto space-y-10">
                
                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto space-y-4">
                    <span className="text-[10px] font-bold tracking-[0.25em] text-[#F0C417] uppercase block">
                        Cureza Wellness Perks
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold font-heading tracking-tight">
                        Exclusive Offers & Coupons
                    </h1>
                    <p className="text-sm text-[#052326]/60 leading-relaxed font-light">
                        Accelerate your wellness journey with premium doctor-recommended botanical formulations. Use the codes below during checkout to activate your rewards.
                    </p>
                </div>

                {/* EXPIRING SEASONAL DEAL BANNER */}
                <div className="bg-[#052326] text-[#F8F3EF] rounded-[14px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-premium-deep border border-[#F8F3EF]/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Clock size={120} />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <span className="bg-[#F0C417] text-[#052326] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                            Flash Deal
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold font-heading">Expiring Seasonal Offer!</h2>
                        <p className="text-xs text-[#F8F3EF]/70 font-light max-w-md">
                            Use coupon code <span className="font-semibold text-[#F8F3EF]">FLASH10</span> at checkout for an extra 10% off sitewide. Minimum purchase ₹1,499.
                        </p>
                    </div>

                    {/* Live Countdown Timer */}
                    <div className="flex items-center gap-3">
                        <div className="text-center bg-[#F8F3EF]/10 backdrop-blur border border-[#F8F3EF]/20 w-16 py-2 rounded-[10px]">
                            <span className="block text-xl font-bold font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#F8F3EF]/60">Hrs</span>
                        </div>
                        <div className="text-center bg-[#F8F3EF]/10 backdrop-blur border border-[#F8F3EF]/20 w-16 py-2 rounded-[10px]">
                            <span className="block text-xl font-bold font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#F8F3EF]/60">Mins</span>
                        </div>
                        <div className="text-center bg-[#F8F3EF]/10 backdrop-blur border border-[#F8F3EF]/20 w-16 py-2 rounded-[10px]">
                            <span className="block text-xl font-bold font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#F8F3EF]/60">Secs</span>
                        </div>
                    </div>
                </div>

                {/* FREE SHIPPING PROGRESS METER */}
                <div className="bg-white rounded-[14px] border border-[#052326]/12 shadow-premium-light p-6 md:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-[#052326]/5 rounded-[10px] flex items-center justify-center border border-[#052326]/12">
                                <Truck className="text-[#052326] animate-bounce" size={18} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Free Shipping Threshold Progress</h3>
                                <p className="text-[11px] text-[#052326]/50 mt-0.5">Free standard shipping on all orders over ₹{freeShippingThreshold}</p>
                            </div>
                        </div>
                        {neededAmount > 0 ? (
                            <span className="text-xs font-semibold bg-[#F8F3EF] px-3 py-1.5 rounded-[8px] border border-[#052326]/8">
                                Add <span className="font-bold text-[#052326]">₹{neededAmount}</span> more to unlock
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-[8px] border border-emerald-100 animate-pulse">
                                🎉 Free Shipping Active!
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#F8F3EF] h-3 rounded-full relative overflow-hidden border border-[#052326]/8">
                        <div 
                            className="h-full bg-[#052326] rounded-full transition-all duration-500 shadow"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* ACTIVE COUPON LISTING */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold font-heading text-left border-b border-[#052326]/12 pb-3 flex items-center gap-2">
                        <Ticket size={20} className="text-[#F0C417]" /> Active Coupon Codes
                    </h3>

                    {loading ? (
                        <div className="text-center py-20 text-xs font-light text-[#052326]/50">Loading active coupons...</div>
                    ) : coupons.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-[#052326]/12 rounded-[14px]">
                            <p className="text-xs text-[#052326]/50">No coupon offers listed at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {coupons.map((coupon) => (
                                <div 
                                    key={coupon.code} 
                                    className="bg-white rounded-[12px] border-2 border-dashed border-[#052326]/16 p-6 flex flex-col justify-between shadow-premium-light hover:shadow-premium-hover transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="bg-[#052326]/5 text-[#052326] text-[10px] font-extrabold px-3 py-1 rounded-[6px] tracking-wider uppercase border border-[#052326]/8">
                                                Active Offer
                                            </span>
                                            {coupon.min_order_value && (
                                                <span className="text-[10px] text-[#052326]/50 font-semibold">Min: ₹{coupon.min_order_value}</span>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-2xl font-bold font-heading text-[#052326]">{coupon.title}</h4>
                                            <p className="text-xs text-[#052326]/75 mt-1 font-light leading-relaxed">{coupon.description}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[#052326]/8 space-y-3">
                                        <div className="bg-[#F8F3EF] border border-[#052326]/10 rounded-[10px] px-3.5 py-2 flex items-center justify-between gap-3">
                                            <span className="font-mono font-bold text-sm text-[#052326] tracking-wider uppercase">{coupon.code}</span>
                                            <button 
                                                onClick={() => handleCopy(coupon.code)}
                                                className="text-[#052326]/60 hover:text-[#052326] transition active:scale-90"
                                            >
                                                {copiedCode === coupon.code ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between text-[10px] text-[#052326]/40">
                                            <span>{coupon.valid_till ? `Expires: ${coupon.valid_till}` : 'Limited period offer'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Call To Action */}
                <div className="text-center pt-6">
                    <Link href="/shop">
                        <Button className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-[10px] text-xs font-bold uppercase tracking-wider h-12 px-8 flex items-center gap-2 mx-auto">
                            Apply Coupon & Shop <ArrowRight size={14} />
                        </Button>
                    </Link>
                </div>

            </div>
        </div>
    );
}
