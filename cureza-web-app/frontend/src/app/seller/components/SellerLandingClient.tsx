'use client';

import React, { useState, useRef } from "react";
import { 
    ArrowRight, ShieldCheck, Stethoscope, Sparkles, Truck, 
    DollarSign, BarChart3, Star, Percent, MessageSquare, 
    Plus, FileCheck, Layers, Landmark, ShoppingBag, 
    Lock, HelpCircle, Check, Users, ChevronRight, ChevronLeft
} from 'lucide-react';

export default function SellerLandingClient() {
    const commandCenterRef = useRef<HTMLDivElement>(null);
    const launchpadRef = useRef<HTMLDivElement>(null);
    const pricingRef = useRef<HTMLDivElement>(null);

    const dashboardFeatures = [
        {
            id: "catalog",
            title: "Products & Catalog Desk",
            description: "List unlimited products for free. Manage stock levels, write detailed product descriptions, specify Ayush/FSSAI certifications, and view real-time restock warnings.",
            icon: ShoppingBag,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100",
            badge: "Inventory Management"
        },
        {
            id: "orders",
            title: "Fulfillment & Dispatch",
            description: "A streamlined order processing queue. Track new order ingestions, update dispatch statuses, print packing slips, and trace delivery milestones with ease.",
            icon: Truck,
            color: "text-blue-600 bg-blue-50 border-blue-100",
            badge: "Fulfillment Nodes"
        },
        {
            id: "payouts",
            title: "Monthly Payments Ledger",
            description: "Full visibility over your earnings. Monitor net sales, track TCS/tax deductions, and request direct payout disbursements processed to your bank account within 24 hours.",
            icon: Landmark,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
            badge: "Settlements Desk"
        },
        {
            id: "analytics",
            title: "Analytics Growth Matrix",
            description: "Dive deep into traffic parameters. Keep tabs on unique visitor counts, average order values, bounce rates, and traffic sources that lead to sales conversion.",
            icon: BarChart3,
            color: "text-purple-600 bg-purple-50 border-purple-100",
            badge: "Growth Insights"
        },
        {
            id: "reviews",
            title: "Sentiment & Review Desk",
            description: "Direct customer interaction portal. View average ratings, analyze positive sentiment trends, and reply to reviews left by health-conscious customers.",
            icon: MessageSquare,
            color: "text-amber-600 bg-amber-50 border-amber-100",
            badge: "Customer Relations"
        },
        {
            id: "marketing",
            title: "Campaigns & Coupons",
            description: "Boost your sales with customizable coupons. Configure percentage or flat discounts, track total coupon redemptions, and measure overall marketing campaign ROI.",
            icon: Percent,
            color: "text-rose-600 bg-rose-50 border-rose-100",
            badge: "Promotion Desk"
        }
    ];

    const trustStats = [
        { value: "World's First", label: "Doctor-Integrated Hub" },
        { value: "500+", label: "Verified Brands" },
        { value: "10,000+", label: "Registered Doctors" },
        { value: "Monthly", label: "Payout Settlement" }
    ];

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
        const ele = ref.current;
        if (!ele) return;
        const startX = e.pageX - ele.offsetLeft;
        const scrollLeft = ele.scrollLeft;
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const x = moveEvent.pageX - ele.offsetLeft;
            const walk = (x - startX) * 1.5; // scroll-fast multiplier
            ele.scrollLeft = scrollLeft - walk;
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const scrollNext = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
            ref.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    const scrollPrev = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (ref.current) {
            ref.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-[#F8F3EF] min-h-screen pt-0 pb-20 text-[#052326]">
            
            <style dangerouslySetInnerHTML={{ __html: `
                .cureza-card {
                    border-radius: 8px !important;
                    border: 1px solid rgba(85, 85, 85, 0.18) !important;
                    box-shadow: none !important;
                    filter: none !important;
                    transition: all 0.3s ease;
                }
                .cureza-card:hover {
                    border-color: rgba(5, 35, 38, 0.4) !important;
                }
                .cureza-card-dark {
                    border-radius: 8px !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    box-shadow: none !important;
                    filter: none !important;
                    transition: all 0.3s ease;
                }
                .cureza-card-dark:hover {
                    border-color: rgba(212, 175, 55, 0.6) !important;
                }
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes dashboard-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes float-icon-1 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(3deg); }
                }
                @keyframes float-icon-2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(-3deg); }
                }
                @keyframes draw-chart {
                    to { stroke-dashoffset: 0; }
                }
                .animate-dashboard-float {
                    animation: dashboard-float 6s ease-in-out infinite;
                }
                .animate-float-1 {
                    animation: float-icon-1 5s ease-in-out infinite;
                }
                .animate-float-2 {
                    animation: float-icon-2 5.5s ease-in-out infinite;
                }
                .animate-chart-line {
                    stroke-dasharray: 600;
                    stroke-dashoffset: 600;
                    animation: draw-chart 3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}} />

            {/* HERO SECTION */}
            <section 
                className="relative text-white py-28 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #052326 0%, #0A4347 100%)' }}
            >
                {/* Background Details */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#052326]/10 blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#052326]/15 blur-[120px] pointer-events-none"></div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Hero Left Content */}
                        <div className="flex-1 space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-[#D4AF37] tracking-wider capitalize">
                                <Sparkles size={14} className="animate-pulse" />
                                World's First Doctor-Integrated Platform
                            </div>

                            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight font-heading">
                                Grow Your Brand in India's Premier <span className="text-[#D4AF37]">Wellness Ecosystem</span>
                            </h1>

                            <p className="text-lg md:text-xl text-[#F8F3EF]/85 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                                Sell your wellness and health products on a marketplace where medical professionals recommend approved brands directly to health-conscious consumers.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                                <a
                                    href="/seller/register"
                                    className="px-8 py-4 bg-[#D4AF37] text-[#052326] font-semibold rounded-[8px] hover:bg-[#F0C417] transition duration-300 text-xs capitalize tracking-wider flex items-center justify-center gap-2"
                                    style={{ boxShadow: 'none' }}
                                >
                                    Register as Seller
                                    <ChevronRight size={16} />
                                </a>

                                <a
                                    href="/seller/login"
                                    className="px-8 py-4 border border-[#F8F3EF]/30 text-white font-semibold rounded-[8px] hover:bg-white/10 transition duration-300 text-xs capitalize tracking-wider flex items-center justify-center gap-2"
                                >
                                    Seller Sign In
                                </a>
                            </div>

                            {/* Trust Stats banner */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10">
                                {trustStats.map((stat, i) => (
                                    <div key={i} className="text-center lg:text-left">
                                        <div className="text-2xl md:text-3xl font-semibold text-white font-heading">{stat.value}</div>
                                        <div className="text-xs text-[#F8F3EF]/70 font-medium mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero Right Image / Graphic */}
                        <div className="flex-1 flex justify-center relative w-full max-w-[480px]">
                            {/* Glow Effects */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#052326]/20 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
                            
                            {/* Premium Animated Dashboard Vector Mockup */}
                            <div className="relative w-full aspect-[4/3] bg-[#052326]/60 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md p-5 overflow-hidden animate-dashboard-float">
                                {/* Mockup Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[10px] text-white/45 font-mono ml-2">Cureza Seller Portal v2.0</span>
                                    </div>
                                    <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-[#D4AF37] font-semibold tracking-wider capitalize">
                                        Live
                                    </div>
                                </div>

                                {/* Mockup Grid Layout */}
                                <div className="grid grid-cols-12 gap-4 mt-4 h-full">
                                    
                                    {/* Sidebar representation */}
                                    <div className="col-span-3 border-r border-white/5 pr-3 space-y-3">
                                        <div className="h-6 w-full bg-white/5 rounded-md flex items-center px-2 gap-1.5">
                                            <div className="w-3 h-3 rounded-sm bg-[#052326]/20"></div>
                                            <div className="w-10 h-1.5 bg-white/25 rounded"></div>
                                        </div>
                                        <div className="h-4 w-full bg-white/5 rounded flex items-center px-2 gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-white/10"></div>
                                            <div className="w-8 h-1 bg-white/20 rounded"></div>
                                        </div>
                                        <div className="h-4 w-full bg-white/5 rounded flex items-center px-2 gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-white/10"></div>
                                            <div className="w-8 h-1 bg-white/20 rounded"></div>
                                        </div>
                                        <div className="h-4 w-full bg-white/5 rounded flex items-center px-2 gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-white/10"></div>
                                            <div className="w-8 h-1 bg-white/20 rounded"></div>
                                        </div>
                                    </div>

                                    {/* Chart area */}
                                    <div className="col-span-9 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="text-[9px] text-white/50">Monthly Sales</div>
                                                <div className="text-sm font-semibold text-white mt-1">₹42,500.00</div>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="text-[9px] text-white/50">Doctor Referrals</div>
                                                <div className="text-sm font-semibold text-[#D4AF37] mt-1">+180% Growth</div>
                                            </div>
                                        </div>

                                        {/* Chart Plot */}
                                        <div className="relative h-28 w-full bg-white/5 rounded-lg border border-white/5 p-2 flex flex-col justify-end">
                                            <svg className="absolute inset-0 w-full h-full p-2 overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                                                <path
                                                    d="M0,45 Q15,40 30,25 T60,20 T90,5 T100,5"
                                                    fill="none"
                                                    stroke="#D4AF37"
                                                    strokeWidth="2.5"
                                                    className="animate-chart-line"
                                                />
                                                <path
                                                    d="M0,45 Q15,40 30,25 T60,20 T90,5 T100,5 L100,50 L0,50 Z"
                                                    fill="url(#gradient)"
                                                    className="opacity-10"
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#D4AF37" />
                                                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="flex justify-between text-[7px] text-white/30 px-1">
                                                <span>Mon</span>
                                                <span>Wed</span>
                                                <span>Fri</span>
                                                <span>Sun</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Floating Card 1: Doctor Recommendation */}
                            <div className="absolute top-[-20px] left-[-30px] bg-white text-[#052326] p-3 rounded-[8px] border border-[#052326]/10 shadow-none flex items-center gap-3 animate-float-1 z-20">
                                <div className="p-2 bg-emerald-50 text-[#052326] rounded-[8px]">
                                    <Stethoscope size={18} />
                                </div>
                                <div>
                                    <div className="text-[8px] font-semibold text-gray-400 capitalize tracking-wider">Dr. Recommendation</div>
                                    <div className="text-xs font-semibold text-emerald-700">Verified by Medical Panel</div>
                                </div>
                            </div>

                            {/* Floating Card 2: Sales Notification */}
                            <div className="absolute bottom-[-15px] right-[-20px] bg-[#101828] text-white p-3 rounded-[8px] border border-white/10 shadow-none flex items-center gap-3 animate-float-2 z-20">
                                <div className="p-2 bg-[#052326]/10 text-[#D4AF37] rounded-[8px]">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <div className="text-[8px] font-semibold text-[#D4AF37] capitalize tracking-wider">New Order Ingested</div>
                                    <div className="text-xs font-semibold">Payout Settled Monthly</div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* DOCTOR INTEGRATION & TRUST BLOCK */}
            <section className="py-24 bg-white border-b border-[#052326]/5">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <span className="text-[#052326]/60 text-xs font-semibold capitalize tracking-widest block">The Cureza Difference</span>
                        <h2 className="text-3xl md:text-4xl font-semibold text-[#052326] font-heading">
                            How Our Doctor-Integrated Platform Benefits You
                        </h2>
                        <p className="text-gray-500 text-base">
                            Traditional marketplaces rely strictly on ad clicks. Cureza integrates directly with certified wellness doctors who recommend products directly to their patients.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div 
                            className="cureza-card p-8 bg-[#F8F3EF]/50 group"
                        >
                            <div className="w-12 h-12 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] mb-6 group-hover:bg-[#052326] group-hover:text-white transition duration-300">
                                <Stethoscope size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#052326] mb-3 font-heading">Doctor Recommendations</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Once verified, your wellness products appear directly in our doctor prescription panel, allowing doctors to recommend them instantly to patients.
                            </p>
                        </div>

                        <div 
                            className="cureza-card p-8 bg-[#F8F3EF]/50 group"
                        >
                            <div className="w-12 h-12 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] mb-6 group-hover:bg-[#052326] group-hover:text-white transition duration-300">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#052326] mb-3 font-heading">Credibility & Verification</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Products pass validation tests to guarantee authentic ingredients. This builds high-level consumer trust that traditional platforms lack.
                            </p>
                        </div>

                        <div 
                            className="cureza-card p-8 bg-[#F8F3EF]/50 group"
                        >
                            <div className="w-12 h-12 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] mb-6 group-hover:bg-[#052326] group-hover:text-white transition duration-300">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#052326] mb-3 font-heading">Highly Targeted Audience</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Say goodbye to wasted ad spend. Meet buyers who are actively seeking wellness solutions, organic alternatives, and practitioner-approved therapeutics.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* UNIFIED COMMAND CENTER - DASHBOARD FEATURE HIGHLIGHTS */}
            <section className="py-24 bg-[#F8F3EF]">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <span className="text-[#052326]/60 text-xs font-semibold capitalize tracking-widest block">Platform Features</span>
                        <h2 className="text-3xl md:text-4xl font-semibold text-[#052326] font-heading">
                            The Unified Seller Command Center
                        </h2>
                        <p className="text-gray-600 text-base">
                            Take control of your entire wellness business with advanced tools built directly into your seller dashboard.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Mobile/Tablet Slider Controls */}
                        <div className="flex justify-between items-center md:hidden mb-4">
                            <span className="text-xs text-[#052326]/60 font-medium">Swipe to explore features</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => scrollPrev(commandCenterRef)}
                                    className="w-8 h-8 rounded-[8px] bg-white border border-gray-200 flex items-center justify-center text-[#052326] active:bg-[#052326] active:text-[#F8F3EF] transition"
                                    aria-label="Previous Feature"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button 
                                    onClick={() => scrollNext(commandCenterRef)}
                                    className="w-8 h-8 rounded-[8px] bg-white border border-gray-200 flex items-center justify-center text-[#052326] active:bg-[#052326] active:text-[#F8F3EF] transition"
                                    aria-label="Next Feature"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        <div 
                            ref={commandCenterRef}
                            onMouseDown={(e) => handleMouseDown(e, commandCenterRef)}
                            className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none pb-4 md:pb-0"
                        >
                            {dashboardFeatures.map((feat) => {
                                const IconComponent = feat.icon;
                                return (
                                    <div 
                                        key={feat.id}
                                        className="cureza-card bg-white p-8 flex flex-col justify-between snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none"
                                    >
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className={`p-3 rounded-[8px] ${feat.color}`}>
                                                    <IconComponent size={22} />
                                                </div>
                                                <span className="text-[10px] font-semibold text-gray-400 tracking-wide capitalize mt-1">
                                                    {feat.badge}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-[#052326] font-heading">{feat.title}</h3>
                                                <p className="text-gray-500 text-xs leading-relaxed">{feat.description}</p>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#052326]">
                                            <span>Included in Dashboard</span>
                                            <Check size={14} className="text-[#052326]" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* END-TO-END BRAND ENABLEMENT & OPERATIONAL SERVICES */}
            <section className="py-24 bg-white border-t border-[#052326]/5">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <span className="text-[#052326]/60 text-xs font-semibold capitalize tracking-widest block">Launch & Grow With Us</span>
                        <h2 className="text-3xl md:text-4xl font-semibold text-[#052326] font-heading">
                            Cureza Launchpad Services
                        </h2>
                        <p className="text-gray-500 text-base">
                            An overview of the processes and operations we undertake to make your brand a major player in the world of Indian alternative health, CBD, and therapeutic wellness.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Mobile/Tablet Slider Controls */}
                        <div className="flex justify-between items-center md:hidden mb-4">
                            <span className="text-xs text-[#052326]/60 font-medium">Swipe to explore services</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => scrollPrev(launchpadRef)}
                                    className="w-8 h-8 rounded-[8px] bg-white border border-gray-200 flex items-center justify-center text-[#052326] active:bg-[#052326] active:text-[#F8F3EF] transition"
                                    aria-label="Previous Service"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button 
                                    onClick={() => scrollNext(launchpadRef)}
                                    className="w-8 h-8 rounded-[8px] bg-white border border-gray-200 flex items-center justify-center text-[#052326] active:bg-[#052326] active:text-[#F8F3EF] transition"
                                    aria-label="Next Service"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        <div 
                            ref={launchpadRef}
                            onMouseDown={(e) => handleMouseDown(e, launchpadRef)}
                            className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none pb-4 md:pb-0"
                        >
                            {/* 1. 24/6 Sales Team */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">24/6 Sales Team</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    Our highly trained sales team has over 2 years of experience managing customer expectations, legal compliance, doctor coordination, and shipping. We provide seamless 24/6 support (except Sundays).
                                </p>
                            </div>

                            {/* 2. Inhouse SEO Services */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">Inhouse SEO Services</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    We regularly outperform established brands in Google rankings. Our dedicated SEO team handles backlinks, keyword optimization, blogs, and alt tags to place your products at the top.
                                </p>
                            </div>

                            {/* 3. Inhouse Content Writers */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">Inhouse Content Writers</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    Our content writers build a seamless bridge between your product and the end user with engaging blogs, unique descriptions, and product reviews conforming to all search engine requirements.
                                </p>
                            </div>

                            {/* 4. Inhouse Graphics & Photography */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">Inhouse Graphics & Photography</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    With four visual creators and two photographers, we secure talented models and beautiful locations to ensure your visual assets are premium, posting weekly across all social channels.
                                </p>
                            </div>

                            {/* 5. Marketing & Influencer Management */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">Marketing & Influencers</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    Reach hundreds of thousands of buyers. We provide a range of 200+ influencers across YouTube and Instagram for reviews, reels, and posts to build maximum brand authority.
                                </p>
                            </div>

                            {/* 6. Inhouse B2B Operations */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">Inhouse B2B Operations</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    Our dedicated B2B team manages direct database collection and outreach to clinics, wellness centers, and distributors looking to buy your products in bulk or via white-label partnerships.
                                </p>
                            </div>

                            {/* 7. Product Development & White Labelling */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">Product Development</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    We formulate premium, high-quality products sourcing raw materials from Uttarakhand to Auroville. Our team handles complete formulation, R&D, and packaging design at highly affordable rates.
                                </p>
                            </div>

                            {/* 8. Medical Team Integration */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">Medical Team Integration</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    We partner with certified doctors across Ayurveda, Homeopathy, and Allopathy. Vetted products are highlighted and celebrated directly on our medical panel for customer trust.
                                </p>
                            </div>

                            {/* 9. Event & Physical Visibility */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">Physical Locations & Events</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    We drive offline visibility in hotspots like Kasardevi, Auroville, Goa, Pune, and Mumbai. From wall graffiti to pamphlet distribution, we establish your physical presence.
                                </p>
                            </div>

                            {/* 10. International Expansion */}
                            <div className="cureza-card bg-[#F8F3EF]/40 p-8 space-y-4 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto md:col-span-2 lg:col-span-3 cursor-grab active:cursor-grabbing select-none">
                                <h3 className="font-semibold text-lg text-[#052326] font-heading">International Expansion</h3>
                                <p className="text-gray-600 text-xs leading-relaxed font-light">
                                    Our international division, supported by our sister company Featherscale (co-founded by Blake Luvon), manages relationships and compliance to easily import/export products between global markets.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp CTA */}
                    <div className="cureza-card-dark mt-12 bg-[#052326] text-white p-8 text-center space-y-4">
                        <h4 className="text-xl font-semibold text-[#D4AF37] font-heading">Manifest the Brand of Your Dreams</h4>
                        <p className="text-sm text-white/80 max-w-xl mx-auto font-light">
                            Want to discuss product development, white labelling, or launching your brand on Cureza? Speak directly with our partnership desk.
                        </p>
                        <a 
                            href="https://wa.me/919887860015" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#F0C417] text-[#052326] font-semibold rounded-[8px] text-xs capitalize tracking-wider transition-colors"
                        >
                            Connect on WhatsApp (+91 98878 60015)
                        </a>
                    </div>
                </div>
            </section>

            {/* SIMPLE PRICING */}
            <section className="py-24 bg-white border-t border-b border-[#052326]/5">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <span className="text-[#052326]/60 text-xs font-semibold capitalize tracking-widest block">Pricing & Payouts</span>
                        <h2 className="text-3xl md:text-4xl font-semibold text-[#052326] font-heading">
                            Transparent Commission, Zero Setup Fees
                        </h2>
                        <p className="text-gray-500 text-base">
                            List unlimited SKUs for free. We only charge a referral fee on successful orders.
                        </p>
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Mobile/Tablet Slider Controls */}
                        <div className="flex justify-between items-center md:hidden mb-4">
                            <span className="text-xs text-[#052326]/60 font-medium">Swipe to explore pricing</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => scrollPrev(pricingRef)}
                                    className="w-8 h-8 rounded-[8px] bg-white border border-gray-200 flex items-center justify-center text-[#052326] active:bg-[#052326] active:text-[#F8F3EF] transition"
                                    aria-label="Previous Pricing"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button 
                                    onClick={() => scrollNext(pricingRef)}
                                    className="w-8 h-8 rounded-[8px] bg-white border border-gray-200 flex items-center justify-center text-[#052326] active:bg-[#052326] active:text-[#F8F3EF] transition"
                                    aria-label="Next Pricing"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        <div 
                            ref={pricingRef}
                            onMouseDown={(e) => handleMouseDown(e, pricingRef)}
                            className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none scrollbar-none pb-4 md:pb-0"
                        >
                            {/* Referral Fees */}
                            <div className="cureza-card bg-[#F8F3EF]/30 p-8 text-center flex flex-col justify-between space-y-6 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#052326]/10 text-[#052326] flex items-center justify-center">
                                        <Percent size={24} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-[#052326] font-heading">Referral Fees</h3>
                                    <div className="text-3xl font-semibold text-[#052326] tracking-tight">22% – 27%</div>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        Determined by the specific product wellness category and volume tier.
                                    </p>
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold capitalize tracking-wider">No Sales, No Fees</div>
                            </div>

                            {/* Payment Gateway */}
                            <div className="cureza-card bg-[#F8F3EF]/30 p-8 text-center flex flex-col justify-between space-y-6 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#052326]/10 text-[#052326] flex items-center justify-center">
                                        <Landmark size={24} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-[#052326] font-heading">Gateway Charges</h3>
                                    <div className="space-y-1">
                                        <div className="text-xl font-semibold text-[#052326] tracking-tight">India: 2.50%</div>
                                        <div className="text-sm text-gray-500 font-medium">Global: 4.4% + $0.3</div>
                                    </div>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        Standard merchant processing rates. Direct bank wire transfers.
                                    </p>
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold capitalize tracking-wider">Secure Payment Pipes</div>
                            </div>

                            {/* Closing Fee */}
                            <div className="cureza-card bg-[#F8F3EF]/30 p-8 text-center flex flex-col justify-between space-y-6 snap-start flex-shrink-0 w-[85%] sm:w-[48%] md:w-auto cursor-grab active:cursor-grabbing select-none">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#052326]/10 text-[#052326] flex items-center justify-center">
                                        <FileCheck size={24} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-[#052326] font-heading">Fixed Closing Fee</h3>
                                    <div className="text-lg font-semibold text-[#052326] tracking-tight">Minimal Slabs</div>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        A highly transparent closing fee model determined by item price brackets and weight slabs.
                                    </p>
                                </div>
                                <div className="text-[10px] text-gray-400 font-semibold capitalize tracking-wider">Transparent Ledger</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-24 bg-[#F8F3EF]">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <span className="text-[#052326]/60 text-xs font-semibold capitalize tracking-widest block">Simple Onboarding</span>
                        <h2 className="text-3xl md:text-4xl font-semibold text-[#052326] font-heading">
                            How to Launch Your Shop
                        </h2>
                        <p className="text-gray-600 text-base">
                            Follow our simple steps to get certified and start receiving customer and doctor orders.
                        </p>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Stepper Center Line */}
                        <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-[2px] bg-[#052326]/10 -translate-x-1/2 hidden md:block"></div>

                        {/* Steps Stack */}
                        <div className="space-y-12">
                            {/* Step 1 */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative">
                                <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-[#052326] text-white border-4 border-[#F8F3EF] flex items-center justify-center font-semibold text-xs -translate-x-1/2 z-10 shadow-sm">
                                    1
                                </div>
                                <div className="flex-1 md:text-right pl-12 md:pl-0 md:pr-16">
                                    <h4 className="text-xl font-semibold text-[#052326] mb-2 font-heading">Register Your Brand</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-md md:ml-auto">
                                        Fill out the simple registration form with your GST and standard business details. Setup takes less than 10 minutes.
                                    </p>
                                </div>
                                <div className="flex-1 hidden md:block"></div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative">
                                <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-[#052326] text-white border-4 border-[#F8F3EF] flex items-center justify-center font-semibold text-xs -translate-x-1/2 z-10 shadow-sm">
                                    2
                                </div>
                                <div className="flex-1 hidden md:block"></div>
                                <div className="flex-1 pl-12 md:pl-16">
                                    <h4 className="text-xl font-semibold text-[#052326] mb-2 font-heading">Upload Catalog & Licensing</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                                        Upload your product descriptions, pricing, inventory parameters, and Ayush/FSSAI compliance licensing documents.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative">
                                <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-[#052326] text-white border-4 border-[#F8F3EF] flex items-center justify-center font-semibold text-xs -translate-x-1/2 z-10 shadow-sm">
                                    3
                                </div>
                                <div className="flex-1 md:text-right pl-12 md:pl-0 md:pr-16">
                                    <h4 className="text-xl font-semibold text-[#052326] mb-2 font-heading">Get Verified & Doctor Certified</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-md md:ml-auto">
                                        Our internal panel checks verification licensing documents. Once verified, products populate in the doctor prescription tool.
                                    </p>
                                </div>
                                <div className="flex-1 hidden md:block"></div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative">
                                <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-[#052326] text-white border-4 border-[#F8F3EF] flex items-center justify-center font-semibold text-xs -translate-x-1/2 z-10 shadow-sm">
                                    4
                                </div>
                                <div className="flex-1 hidden md:block"></div>
                                <div className="flex-1 pl-12 md:pl-16">
                                    <h4 className="text-xl font-semibold text-[#052326] mb-2 font-heading">Start Selling & Ship</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                                        Fulfill orders immediately via our verified logistics partners. Keep customers notified with real-time status nodes.
                                    </p>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative">
                                <div className="absolute left-6 md:left-1/2 w-8 h-8 rounded-full bg-[#052326] text-white border-4 border-[#F8F3EF] flex items-center justify-center font-semibold text-xs -translate-x-1/2 z-10 shadow-sm">
                                    5
                                </div>
                                <div className="flex-1 md:text-right pl-12 md:pl-0 md:pr-16">
                                    <h4 className="text-xl font-semibold text-[#052326] mb-2 font-heading">Weekly Bank Payouts</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-md md:ml-auto">
                                        Track funds dynamically in your dashboard. Settlements are credited to your active bank account every single week.
                                    </p>
                                </div>
                                <div className="flex-1 hidden md:block"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ELIGIBILITY & DOCUMENT CHECKLIST */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="cureza-card-dark max-w-5xl mx-auto bg-[#052326] text-white p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-[-40%] right-[-20%] w-[350px] h-[350px] rounded-full bg-[#052326]/10 blur-[80px] pointer-events-none"></div>

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <span className="text-[#D4AF37] text-xs font-semibold capitalize tracking-wider block">Compliance Requirements</span>
                                <h3 className="text-3xl font-semibold font-heading">Check Your Selling Eligibility</h3>
                                <p className="text-[#F8F3EF]/75 text-sm leading-relaxed">
                                    To ensure Cureza maintains its status as India's most trusted wellness ecosystem, we mandate that all registering sellers provide authentic documentation.
                                </p>
                            </div>

                            <div className="space-y-4 bg-white/5 p-6 rounded-[8px] border border-white/10 backdrop-blur-md">
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-sm font-semibold text-[#F8F3EF]">
                                        <div className="w-5 h-5 rounded-full bg-white/10 text-[#D4AF37] flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span>Active GST Registration certificate</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-[#F8F3EF]">
                                        <div className="w-5 h-5 rounded-full bg-white/10 text-[#D4AF37] flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span>FSSAI / AYUSH / Cosmetic license</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-[#F8F3EF]">
                                        <div className="w-5 h-5 rounded-full bg-white/10 text-[#D4AF37] flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span>Authentic, clinically verified wellness products</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-[#F8F3EF]">
                                        <div className="w-5 h-5 rounded-full bg-white/10 text-[#D4AF37] flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span>Brand Authorization letter (if reseller)</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-semibold text-[#F8F3EF]">
                                        <div className="w-5 h-5 rounded-full bg-white/10 text-[#D4AF37] flex items-center justify-center shrink-0">
                                            <Check size={12} />
                                        </div>
                                        <span>Active business bank account & IFS code</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CALL TO ACTION */}
            <section className="container mx-auto px-4 md:px-6 mt-12">
                <div className="cureza-card-dark text-center bg-[#052326] text-white py-16 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                    <div className="absolute top-[-50%] left-[-20%] w-[400px] h-[400px] rounded-full bg-[#052326]/10 blur-[90px] pointer-events-none"></div>
                    
                    <h2 className="text-3xl md:text-5xl font-semibold mb-4 font-heading">
                        Ready to Start Selling on Cureza?
                    </h2>
                    <p className="text-[#F8F3EF]/80 mb-8 text-base md:text-lg font-normal max-w-2xl mx-auto leading-relaxed">
                        Scale your business within the world's most trusted doctor-integrated wellness marketplace.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xs sm:max-w-md mx-auto">
                        <a
                            href="/seller/register"
                            className="px-8 py-4 bg-[#D4AF37] text-[#052326] font-semibold rounded-[8px] hover:bg-[#F0C417] transition duration-300 text-xs capitalize tracking-wider flex items-center justify-center gap-2"
                        >
                            Register as Seller
                            <ChevronRight size={16} />
                        </a>

                        <a
                            href="/seller/login"
                            className="px-8 py-4 border border-[#F8F3EF]/30 text-white font-semibold rounded-[8px] hover:bg-white/10 transition duration-300 text-xs capitalize tracking-wider flex items-center justify-center gap-2"
                        >
                            Seller Sign In
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
