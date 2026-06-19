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
    Activity
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
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="p-2.5 bg-cureza-green/10 rounded-xl text-cureza-green">
                            <Megaphone className="h-7 w-7" />
                        </span>
                        Marketing & Promotions
                    </h1>
                    <p className="text-gray-500 mt-1.5 text-base">
                        Simulate and manage campaigns, discount offers, bundles, notifications, and analytics trackers.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/superadmin/dashboard/marketing/offers"
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm text-sm flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Create Coupon
                    </Link>
                    <Link
                        href="/superadmin/dashboard/marketing/bundles"
                        className="bg-cureza-green text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-sm text-sm flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Create Bundle
                    </Link>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                    const IconComponent = stat.icon;
                    return (
                        <div 
                            key={idx} 
                            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300 -z-0" />
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{stat.name}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            {stat.change}
                                        </span>
                                        <span className="text-xs text-gray-400">vs last month</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-cureza-green/10 group-hover:text-cureza-green transition-colors duration-300">
                                    <IconComponent className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Interactive Charts and Promo Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Campaigns Trend Simulator */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Campaign Conversions (30d)</h3>
                            <p className="text-xs text-gray-500">Visualizing conversions driven by discount campaigns</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <span className="h-3 w-3 bg-cureza-green rounded-full" /> Coupons
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <span className="h-3 w-3 bg-indigo-500 rounded-full" /> Bundles
                            </span>
                        </div>
                    </div>

                    {/* SVG campaigns performance graph */}
                    <div className="h-64 flex flex-col justify-between">
                        <div className="flex-1 flex items-end gap-3 px-2 pt-4 border-b border-gray-100 pb-2">
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
                                            className="w-1/2 bg-cureza-green/85 group-hover:bg-cureza-green rounded-t-sm transition-all duration-300"
                                            style={{ height: `${w.couponVal}%` }}
                                            title={`Coupons: ${w.couponVal} conversions`}
                                        />
                                        <div 
                                            className="w-1/2 bg-indigo-400 group-hover:bg-indigo-500 rounded-t-sm transition-all duration-300"
                                            style={{ height: `${w.bundleVal}%` }}
                                            title={`Bundles: ${w.bundleVal} conversions`}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium mt-1">{w.week}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                            <span>May 15</span>
                            <span>June 19 (Current)</span>
                        </div>
                    </div>
                </div>

                {/* Quick actions & stats summary */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-900">Module Status</h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Active Coupons</h4>
                                    <p className="text-xs text-gray-400">Total active promotional keys</p>
                                </div>
                            </div>
                            <span className="text-lg font-extrabold text-gray-900">{activeCoupons}/{couponCount}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Gift className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Bundle Offers</h4>
                                    <p className="text-xs text-gray-400">Products bought together deals</p>
                                </div>
                            </div>
                            <span className="text-lg font-extrabold text-gray-900">{activeBundles}/{bundleCount}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Automations</h4>
                                    <p className="text-xs text-gray-400">WhatsApp & SMS flows active</p>
                                </div>
                            </div>
                            <span className="text-lg font-extrabold text-gray-900">4/5</span>
                        </div>
                    </div>

                    <div className="bg-cureza-green/5 border border-cureza-green/10 p-4 rounded-2xl flex items-start gap-3">
                        <Activity className="h-5 w-5 text-cureza-green shrink-0 mt-0.5" />
                        <div>
                            <h5 className="font-bold text-cureza-green text-sm">Marketing Simulator</h5>
                            <p className="text-xs text-green-700/80 mt-1">
                                Integrate analytics parameters automatically. Pixel settings and email campaigns are active in simulated mode.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Cards Hub */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Marketing Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Offers & Coupons */}
                    <Link href="/superadmin/dashboard/marketing/offers" className="group">
                        <div className="h-full bg-white border border-gray-100 hover:border-cureza-green/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Tag className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-cureza-green transition-colors flex items-center gap-1.5">
                                        Offers & Coupons <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Configure custom discount keys, discount percentages or fixed rates, min order constraints, and validity timers.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400">
                                <span>{couponCount} Coupons Available</span>
                                <span className="text-cureza-green font-semibold flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* Bundle Offers */}
                    <Link href="/superadmin/dashboard/marketing/bundles" className="group">
                        <div className="h-full bg-white border border-gray-100 hover:border-indigo-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Gift className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                        Bundle Offers <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Configure frequently bought together bundles. Combine multiple products for a custom package discount.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400">
                                <span>{bundleCount} Bundles Configured</span>
                                <span className="text-indigo-600 font-semibold flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* Email Campaigns */}
                    <Link href="/superadmin/dashboard/marketing/email" className="group">
                        <div className="h-full bg-white border border-gray-100 hover:border-blue-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                        Email Campaigns <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Create newsletters, select subscriber segments (e.g. repeat buyers), design templates, and simulator dispatches.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400">
                                <span>Templates Ready</span>
                                <span className="text-blue-600 font-semibold flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* Automation */}
                    <Link href="/superadmin/dashboard/marketing/automation" className="group">
                        <div className="h-full bg-white border border-gray-100 hover:border-violet-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors flex items-center gap-1.5">
                                        Automations (SMS/WA) <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Configure trigger-based WhatsApp and SMS notification flows for order shipping, restocks, or cart abandonments.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400">
                                <span>5 Flows Active</span>
                                <span className="text-violet-600 font-semibold flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>

                    {/* Pixel Settings */}
                    <Link href="/superadmin/dashboard/marketing/pixel" className="group">
                        <div className="h-full bg-white border border-gray-100 hover:border-orange-500/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Code className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                                        Meta Pixel & GA4 <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Manage analytical tags for Google Analytics, Meta Pixel tracking scripts, and simulate tracking events validation.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400">
                                <span>GA4 & Meta Connected</span>
                                <span className="text-orange-600 font-semibold flex items-center gap-1">Manage <ChevronRight className="h-3 w-3" /></span>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
