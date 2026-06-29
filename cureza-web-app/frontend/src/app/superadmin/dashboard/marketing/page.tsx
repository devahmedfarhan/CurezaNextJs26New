'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { 
    Megaphone, 
    Tag, 
    Gift, 
    Mail, 
    Zap, 
    Code, 
    ChevronRight, 
    ArrowUpRight, 
    Percent, 
    ShoppingBag, 
    Users, 
    MousePointerClick,
    Plus,
    Activity,
    HelpCircle
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function MarketingDashboardPage() {
    const [couponCount, setCouponCount] = useState(0);
    const [activeCoupons, setActiveCoupons] = useState(0);
    const [bundleCount, setBundleCount] = useState(0);
    const [activeBundles, setActiveBundles] = useState(0);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Mock analytics metrics
    const stats = [
        { name: 'Total Revenue Driven', value: '₹1,24,500', change: '+18.2%', changeType: 'increase', icon: ShoppingBag },
        { name: 'Campaign Conversion Rate', value: '3.42%', change: '+0.8%', changeType: 'increase', icon: Percent },
        { name: 'Total Campaign Recipients', value: '14,820', change: '+24.5%', changeType: 'increase', icon: Users },
        { name: 'Avg. Order Value (AOV)', value: '₹1,840', change: '+12.4%', changeType: 'increase', icon: MousePointerClick },
    ];

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(false);
            // Fetch Coupons
            try {
                const couponsRes = await api.get('/admin/coupons');
                if (Array.isArray(couponsRes.data)) {
                    setCouponCount(couponsRes.data.length);
                    setActiveCoupons(couponsRes.data.filter((c: any) => c.is_active).length);
                }
            } catch (err) {
                console.error("Failed to load coupons in marketing summary", err);
            }

            // Fetch Bundles
            try {
                const bundlesRes = await api.get('/admin/bundles');
                const bundlesData = bundlesRes.data.data || bundlesRes.data || [];
                if (Array.isArray(bundlesData)) {
                    setBundleCount(bundlesData.length);
                    setActiveBundles(bundlesData.filter((b: any) => b.is_active).length);
                }
            } catch (err) {
                console.error("Failed to load bundles in marketing summary", err);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[10px] border-[0.35px] border-black/50">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-neutral-100 text-black rounded-[10px] border-[0.35px] border-black/50">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                            Marketing & Promotions
                        </h1>
                    </div>
                    <p className="text-gray-500 text-xs font-normal">
                        Simulate and manage campaigns, discount offers, bundles, notifications, and analytics trackers.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/superadmin/dashboard/marketing/offers"
                        className="bg-white border-[0.35px] border-black/50 text-gray-700 px-4 py-2.5 rounded-[10px] font-medium hover:bg-neutral-50 transition-colors text-xs flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Create Coupon
                    </Link>
                    <Link
                        href="/superadmin/dashboard/marketing/bundles"
                        className="bg-black text-white px-4 py-2.5 rounded-[10px] font-medium hover:bg-neutral-900 transition-colors text-xs flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Create Bundle
                    </Link>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                    const IconComponent = stat.icon;
                    return (
                        <div 
                            key={idx} 
                            className="bg-white border-[0.35px] border-black/50 rounded-[10px] p-5 relative overflow-hidden group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 tracking-normal">{stat.name}</p>
                                    <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[10px] border-[0.35px] border-black/50">
                                            {stat.change}
                                        </span>
                                        <span className="text-xs text-gray-400 font-normal">vs last month</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-neutral-50 text-gray-600 rounded-[10px] border-[0.35px] border-black/50 group-hover:bg-neutral-100 group-hover:text-black transition-colors duration-300">
                                    <IconComponent className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Interactive Charts and Promo Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Campaigns Trend Simulator */}
                <div className="lg:col-span-2 bg-white rounded-[10px] border-[0.35px] border-black/50 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-gray-900">Campaign Conversions (30d)</h3>
                            <p className="text-xs text-gray-500 font-normal">Visualizing conversions driven by discount campaigns</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-normal">
                            <span className="flex items-center gap-1.5 text-gray-650">
                                <span className="h-2 w-2 bg-black rounded-full" /> Coupons
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-650">
                                <span className="h-2 w-2 bg-gray-450 rounded-full" /> Bundles
                            </span>
                        </div>
                    </div>

                    {/* SVG campaigns performance graph */}
                    <div className="h-64 flex flex-col justify-between">
                        <div className="flex-1 flex items-end gap-3 px-2 pt-4 border-b-[0.5px] border-black/50 pb-2">
                            {/* Render columns representing weekly conversions */}
                            {[
                                { week: 'W1', couponVal: 45, bundleVal: 30 },
                                { week: 'W2', couponVal: 65, bundleVal: 42 },
                                { week: 'W3', couponVal: 85, bundleVal: 55 },
                                { week: 'W4', couponVal: 70, bundleVal: 48 },
                                { week: 'W5', couponVal: 95, bundleVal: 62 },
                                { week: 'W6', couponVal: 110, bundleVal: 75 }
                            ].map((w, index) => (
                                <div key={index} className="flex-1 flex flex-col justify-end items-center h-full gap-1 group cursor-pointer">
                                    <div className="w-full flex items-end gap-1 px-1 h-full">
                                        <div 
                                            className="w-1/2 bg-black/80 group-hover:bg-black rounded-t-sm transition-all duration-300"
                                            style={{ height: `${w.couponVal}%` }}
                                            title={`Coupons: ${w.couponVal} conversions`}
                                        />
                                        <div 
                                            className="w-1/2 bg-gray-300 group-hover:bg-gray-400 rounded-t-sm transition-all duration-300"
                                            style={{ height: `${w.bundleVal}%` }}
                                            title={`Bundles: ${w.bundleVal} conversions`}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-450 font-normal mt-1">{w.week}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-450 mt-2">
                            <span>May 15</span>
                            <span>June 19 (Current)</span>
                        </div>
                    </div>
                </div>

                {/* Quick actions & stats summary */}
                <div className="bg-white rounded-[10px] border-[0.35px] border-black/50 p-6 space-y-6">
                    <h3 className="text-sm font-semibold text-gray-900">Module Status</h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-[10px] border-[0.35px] border-black/50 hover:bg-neutral-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white border-[0.35px] border-black/50 text-black rounded-[10px]">
                                    <Tag className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-semibold text-gray-950 text-xs">Active Coupons</h4>
                                    <p className="text-[10px] text-gray-500 font-normal">Total active promotional keys</p>
                                </div>
                            </div>
                            <span className="text-base font-semibold text-gray-900">{activeCoupons}/{couponCount}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-[10px] border-[0.35px] border-black/50 hover:bg-neutral-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white border-[0.35px] border-black/50 text-black rounded-[10px]">
                                    <Gift className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-semibold text-gray-950 text-xs">Bundle Offers</h4>
                                    <p className="text-[10px] text-gray-500 font-normal">Products bought together deals</p>
                                </div>
                            </div>
                            <span className="text-base font-semibold text-gray-900">{activeBundles}/{bundleCount}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-[10px] border-[0.35px] border-black/50 hover:bg-neutral-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white border-[0.35px] border-black/50 text-black rounded-[10px]">
                                    <Zap className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-semibold text-gray-955 text-xs">Automations</h4>
                                    <p className="text-[10px] text-gray-500 font-normal">WhatsApp & SMS flows active</p>
                                </div>
                            </div>
                            <span className="text-base font-semibold text-gray-900">4/5</span>
                        </div>
                    </div>

                    <div className="bg-neutral-50 border-[0.35px] border-black/50 p-4 rounded-[10px] flex items-start gap-3">
                        <Activity className="h-4 w-4 text-black shrink-0 mt-0.5" />
                        <div>
                            <h5 className="font-medium text-black text-xs">Marketing Simulator</h5>
                            <p className="text-[10px] text-gray-500 font-normal mt-1 leading-normal">
                                Integrate analytics parameters automatically. Pixel settings and email campaigns are active in simulated mode.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Cards Hub */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Marketing Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Offers & Coupons */}
                    <Link href="/superadmin/dashboard/marketing/offers" className="group">
                        <div className="h-full bg-white border-[0.35px] border-black/50 hover:border-neutral-950 rounded-[10px] p-6 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-10 h-10 bg-neutral-50 border-[0.35px] border-black/50 text-black rounded-[10px] flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-black transition-colors flex items-center gap-1.5 text-sm">
                                        Offers & Coupons <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1.5 font-normal leading-relaxed">
                                        Configure custom discount keys, discount percentages or fixed rates, min order constraints, and validity timers.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t-[0.5px] border-black/50 text-xs text-gray-400 font-normal">
                                <span>{couponCount} Coupons Available</span>
                                <span className="text-black font-medium flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* Bundle Offers */}
                    <Link href="/superadmin/dashboard/marketing/bundles" className="group">
                        <div className="h-full bg-white border-[0.35px] border-black/50 hover:border-neutral-950 rounded-[10px] p-6 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-10 h-10 bg-neutral-50 border-[0.35px] border-black/50 text-black rounded-[10px] flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Gift className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-black transition-colors flex items-center gap-1.5 text-sm">
                                        Bundle Offers <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1.5 font-normal leading-relaxed">
                                        Configure frequently bought together bundles. Combine multiple products for a custom package discount.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t-[0.5px] border-black/50 text-xs text-gray-400 font-normal">
                                <span>{bundleCount} Bundles Configured</span>
                                <span className="text-black font-medium flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* Broadcast Center */}
                    <Link href="/superadmin/dashboard/marketing/broadcast" className="group">
                        <div className="h-full bg-white border-[0.35px] border-black/50 hover:border-neutral-950 rounded-[10px] p-6 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-10 h-10 bg-neutral-50 border-[0.35px] border-black/50 text-black rounded-[10px] flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-black transition-colors flex items-center gap-1.5 text-sm">
                                        Broadcast Center <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1.5 font-normal leading-relaxed">
                                        Create newsletters, select subscriber segments (e.g. repeat buyers), design layouts, and run scheduled dispatches.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t-[0.5px] border-black/50 text-xs text-gray-400 font-normal">
                                <span>Email Dispatch</span>
                                <span className="text-black font-medium flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* Automation */}
                    <Link href="/superadmin/dashboard/marketing/automation" className="group">
                        <div className="h-full bg-white border-[0.35px] border-black/50 hover:border-neutral-950 rounded-[10px] p-6 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-10 h-10 bg-neutral-50 border-[0.35px] border-black/50 text-black rounded-[10px] flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-black transition-colors flex items-center gap-1.5 text-sm">
                                        Automations (SMS/WA) <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1.5 font-normal leading-relaxed">
                                        Configure trigger-based WhatsApp and SMS notification flows for order shipping, restocks, or cart abandonments.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t-[0.5px] border-black/50 text-xs text-gray-400 font-normal">
                                <span>5 Flows Active</span>
                                <span className="text-black font-medium flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* Pixel Settings */}
                    <Link href="/superadmin/dashboard/marketing/pixel" className="group">
                        <div className="h-full bg-white border-[0.35px] border-black/50 hover:border-neutral-950 rounded-[10px] p-6 transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-10 h-10 bg-neutral-50 border-[0.35px] border-black/50 text-black rounded-[10px] flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Code className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-black transition-colors flex items-center gap-1.5 text-sm">
                                        Meta Pixel & GA4 <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1.5 font-normal leading-relaxed">
                                        Manage analytical tags for Google Analytics, Meta Pixel tracking scripts, and simulate tracking events validation.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t-[0.5px] border-black/50 text-xs text-gray-400 font-normal">
                                <span>GA4 & Meta Connected</span>
                                <span className="text-black font-medium flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Tutorial / Guideline Section */}
            <div className="bg-neutral-50 border-[0.35px] border-black/50 rounded-[10px] p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-black" />
                    <h3 className="text-sm font-semibold text-gray-900">How It Works & Guidelines | Marketing Suite Guide</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600 leading-relaxed font-normal">
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">1. Offers & Coupons</h4>
                        <p>
                            Ye module aapko custom discount codes generate karne ki sahulat deta hai. Aap fixed cash discount ya percentage discount set kar sakte hain. Minimum order threshold aur expiry date set karke checkout par validation automate ki ja sakti hai.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">2. Bundle Offers</h4>
                        <p>
                            Aap multi-product kits bana sakte hain (jaise face wash + moisturizer) jahan add-on items par automatically discount apply hota hai. Is se average order value (AOV) barhti hai aur bundles product detail page par display hote hain.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">3. Email Campaigns & Automations</h4>
                        <p>
                            Customer segments (jaise repeat buyers ya inactive users) select karke directly newsletters send karein. Cart abandonment, signups aur delivery details par automated SMS aur WhatsApp trigger flows set up kiye ja sakte hain.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
