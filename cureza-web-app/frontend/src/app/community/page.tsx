'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Trophy, 
    Sparkles, 
    TrendingUp, 
    Gift, 
    Medal, 
    Users, 
    CheckCircle2, 
    Calendar, 
    ChevronLeft,
    ChevronRight, 
    UserPlus, 
    ArrowRight, 
    Coins, 
    Activity, 
    HelpCircle,
    UserCheck,
    MessageSquare,
    Store
} from 'lucide-react';
import api from '@/lib/api';

export default function CurezaCircle() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [communityData, setCommunityData] = useState<any>(null);
    const [storeRewards, setStoreRewards] = useState<any[]>([
        { title: "Flat 10% Discount", subtitle: "Wellness & Supplements", cost: "500 pts", category: "Discounts" },
        { title: "Free Mini Sample Pack", subtitle: "Curated wellness kit", cost: "300 pts", category: "Products" },
        { title: "Exclusive Merch T-shirt", subtitle: "Limited edition print", cost: "1500 pts", category: "Merchandise" },
        { title: "Live Event Pass", subtitle: "Local healing workshops", cost: "1000 pts", category: "Events" },
        { title: "Doctor Video Consultation", subtitle: "15-min live session", cost: "2000 pts", category: "Consultation" },
        { title: "Exclusive Vendor Coupon", subtitle: "Extra 5% discount", cost: "800 pts", category: "Discounts" },
    ]);
    const [userBadgesCount, setUserBadgesCount] = useState(0);

    const [earnRules, setEarnRules] = useState([
        { action: "Product Purchase", xp: 100, points: "10 pts / ₹100 Spent", icon: Coins },
        { action: "Write Honest Review", xp: 50, points: "20 pts", icon: MessageSquare },
        { action: "UGC Photo/Video Upload", xp: 100, points: "40 pts", icon: Sparkles },
        { action: "Refer a Friend", xp: 200, points: "100 pts", icon: UserPlus },
        { action: "Upload Valid Prescription", xp: 150, points: "—", icon: UserCheck },
        { action: "Daily Check-in Streak", xp: 20, points: "—", icon: Activity },
    ]);

    const tiers = [
        { name: "Silver Member", range: "0–999 XP", perks: ["Standard earning rate", "Access to rewards shop", "Daily check-in access"], badgeColor: "from-slate-400 to-slate-500" },
        { name: "Gold Member", range: "1,000–4,999 XP", perks: ["1.1x Points Multiplier", "Early access to launches", "1 Free Doctor Consultation per quarter"], badgeColor: "from-amber-400 to-amber-600" },
        { name: "Platinum Member", range: "5,000+ XP", perks: ["1.25x Points Multiplier", "Free Express Shipping on orders", "24/7 Priority Doctor Consultation"], badgeColor: "from-yellow-400 to-amber-500" },
    ];

    const badgesList = [
        { name: "Top Influencer", desc: "Shared 5+ UGC reviews with photos" },
        { name: "Top Reviewer", desc: "Provided detailed feedback for products" },
        { name: "Wellness Achiever", desc: "Completed 3 consecutive check-ins" },
        { name: "7-Day Streak Maker", desc: "Tracked daily streak for a week" },
    ];

    // Carousel Ref and Dragging States
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const slide = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const { scrollLeft, clientWidth } = sliderRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleScroll = () => {
        if (sliderRef.current) {
            const { scrollLeft, clientWidth } = sliderRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setActiveIndex(index);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!sliderRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };

    useEffect(() => {
        const loadCommunityData = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (!token) {
                    setIsLoggedIn(false);
                    return;
                }

                const [commRes, rewardsRes, badgesRes] = await Promise.all([
                    api.get('/user/community'),
                    api.get('/user/rewards'),
                    api.get('/user/badges')
                ]);

                setIsLoggedIn(true);
                setCommunityData(commRes.data);
                
                if (rewardsRes.data) {
                    const formatted = rewardsRes.data.map((r: any) => ({
                        title: r.name,
                        subtitle: r.description,
                        cost: `${r.points_cost} pts`,
                        category: r.type,
                        id: r.id
                    }));
                    setStoreRewards(formatted.slice(0, 6));
                }
                
                if (badgesRes.data) {
                    setUserBadgesCount(badgesRes.data.filter((b: any) => b.unlocked).length || 0);
                }

                if (commRes.data?.rules) {
                    const r = commRes.data.rules;
                    setEarnRules([
                        { action: "Product Purchase", xp: r.xp_product_purchase ?? 100, points: `${r.points_per_100_spent ?? 10} pts / ₹100`, icon: Coins },
                        { action: "Write Honest Review", xp: r.xp_write_review ?? 50, points: `${r.points_write_review ?? 20} pts`, icon: MessageSquare },
                        { action: "UGC Photo/Video Upload", xp: r.xp_ugc_upload ?? 100, points: `${r.points_ugc_upload ?? 40} pts`, icon: Sparkles },
                        { action: "Refer a Friend", xp: r.xp_refer_friend ?? 200, points: `${r.points_refer_friend ?? 100} pts`, icon: UserPlus },
                        { action: "Upload Valid Prescription", xp: r.xp_upload_prescription ?? 150, points: "—", icon: UserCheck },
                        { action: "Daily Check-in Streak", xp: r.xp_daily_checkin ?? 20, points: r.points_daily_checkin > 0 ? `${r.points_daily_checkin} pts` : "—", icon: Activity }
                    ]);
                }
            } catch (err) {
                console.log("Guest mode active.");
                setIsLoggedIn(false);
            }
        };

        loadCommunityData();
    }, []);

    const currentTierName = communityData?.current_tier?.name || 'Silver';
    const nextTierName = communityData?.next_tier?.name || 'Gold';
    const points = communityData?.points || 0; // spendable points
    const xp = communityData?.xp || 0;         // lifetime accumulated XP
    const pointsNeeded = communityData?.points_needed || 0;
    
    const minPointsCurrent = communityData?.current_tier?.min_points || 0;
    const minPointsNext = communityData?.next_tier?.min_points || 1000;
    const progressRange = minPointsNext - minPointsCurrent;
    const progressCurrent = xp - minPointsCurrent;
    const progressPercent = progressRange > 0 ? Math.min(Math.max((progressCurrent / progressRange) * 100, 0), 100) : 100;

    return (
        <div className="community-page min-h-screen bg-[#F8F3EF] text-[#052326] py-12">
            
            <div className="max-w-5xl mx-auto px-6 space-y-16">
                
                {/* HERO SECTION */}
                <header className="relative overflow-hidden bg-gradient-to-br from-[#052326] via-[#093539] to-[#0e444b] text-white py-16 px-8 rounded-lg">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(240,196,23,0.1),transparent_50%)]" />
                    <div className="relative z-10">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                            
                            {/* Hero Intro */}
                            <div className="lg:col-span-7 space-y-6">
                                <span className="inline-flex items-center gap-1.5 bg-[#F0C417] text-[#052326] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                    <Trophy size={12} className="animate-bounce" />
                                    Cureza Circle Loyalty Hub
                                </span>
                                <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.15]">
                                    Connect. Engage. <br />
                                    <span className="text-[#F0C417]">Earn Real Rewards.</span>
                                </h1>
                                <p className="text-sm md:text-base text-white/85 max-w-xl leading-relaxed font-normal">
                                    Join a reward-driven wellness community that connects health enthusiasts, creators, trusted sellers, and certified doctors. Earn XP, rank up, and claim exclusive perks.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    {isLoggedIn ? (
                                        <Link
                                            href="/dashboard/circle"
                                            className="px-5 py-3 bg-[#F0C417] text-[#052326] rounded-lg hover:bg-[#F0C417]/90 transition-all font-semibold flex items-center gap-2 group text-xs uppercase tracking-wider"
                                        >
                                            Open Circle Dashboard
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/register"
                                            className="px-5 py-3 bg-[#F0C417] text-[#052326] rounded-lg hover:bg-[#F0C417]/90 transition-all font-semibold flex items-center gap-2 group text-xs uppercase tracking-wider"
                                        >
                                            Start Earning Today
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                    <a
                                        href="#rewards"
                                        className="px-5 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all font-semibold text-xs uppercase tracking-wider"
                                    >
                                        Explore Rewards
                                    </a>
                                </div>
                            </div>

                            {/* Interactive Circle Snapshot */}
                            <div className="lg:col-span-5">
                                <div className="bg-white/10 border border-white/10 rounded-lg p-8 text-white relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#F0C417]/10 rounded-full blur-xl pointer-events-none" />
                                    
                                    <div className="flex justify-between items-center pb-6 border-b border-white/10">
                                        <div>
                                            <p className="text-[10px] font-medium tracking-wider text-white/50">Your Status</p>
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mt-0.5">
                                                <Medal className="text-[#F0C417]" size={18} /> {isLoggedIn ? `${currentTierName}` : 'Guest Account'}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-medium tracking-wider text-white/50">XP Earned</p>
                                            <p className="text-lg font-semibold text-[#F0C417]">{isLoggedIn ? `${xp} XP` : '0 XP'}</p>
                                        </div>
                                    </div>

                                    {isLoggedIn ? (
                                        <div className="py-6">
                                            <div className="flex justify-between text-xs text-white/75 mb-2 font-medium">
                                                <span>{currentTierName}</span>
                                                <span>{nextTierName} ({minPointsNext} XP)</span>
                                            </div>
                                            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                                                <div className="bg-[#F0C417] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                            </div>
                                            {pointsNeeded > 0 ? (
                                                <p className="text-[11px] text-white/60 mt-2 text-right">{pointsNeeded} XP needed to unlock next tier</p>
                                            ) : (
                                                <p className="text-[11px] mt-2 text-right font-semibold text-yellow-300">Platinum Tier Unlocked!</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-6 space-y-2">
                                            <p className="text-xs text-white/80 leading-relaxed font-normal">Login or create an account to view your check-in streak, lifetime tiers, and available points.</p>
                                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                                <div className="bg-white/20 h-2 w-0" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-[10px] font-medium text-white/40 block uppercase tracking-wider">Redeemable Points</span>
                                            <span className="text-xl font-semibold text-[#F0C417] block mt-1">{isLoggedIn ? `${points} pts` : '0 pts'}</span>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-[10px] font-medium text-white/40 block uppercase tracking-wider">Unlocked Badges</span>
                                            <span className="text-xl font-semibold text-[#F0C417] block mt-1">{isLoggedIn ? `${userBadgesCount} Badges` : '0 Badges'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </header>

                {/* PURPOSE & VALUE-PROPS */}
                <main className="space-y-16">
                    
                    <section className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 border border-[#052326]/8 rounded-lg transition-colors space-y-4">
                            <div className="p-3 bg-[#052326]/5 rounded-lg w-fit text-[#052326]">
                                <TrendingUp size={22} />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900">Retention & Streaks</h3>
                            <p className="text-gray-600 text-xs leading-relaxed font-normal">
                                Stay active and build consistency. Earn compounding XP multipliers and point boosts by checking in daily or taking daily streaks.
                            </p>
                        </div>

                        <div className="bg-white p-6 border border-[#052326]/8 rounded-lg transition-colors space-y-4">
                            <div className="p-3 bg-[#052326]/5 rounded-lg w-fit text-[#052326]">
                                <Users size={22} />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900">Interactive Community</h3>
                            <p className="text-gray-600 text-xs leading-relaxed font-normal">
                                Share user-generated content (UGC), participate in AMA discussions, ask questions to panel doctors, and unlock collaborative rewards.
                            </p>
                        </div>

                        <div className="bg-white p-6 border border-[#052326]/8 rounded-lg transition-colors space-y-4">
                            <div className="p-3 bg-[#052326]/5 rounded-lg w-fit text-[#052326]">
                                <Gift size={22} />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900">Premium Rewards</h3>
                            <p className="text-gray-650 text-xs leading-relaxed font-normal">
                                Redeem points for real store credits, custom consultations, premium products, merchandise, or exclusive brand coupon codes.
                            </p>
                        </div>
                    </section>

                    {/* EARNING & TIERS TABBED/GRID SECTION */}
                    <section className="grid lg:grid-cols-12 gap-12">
                        
                        {/* Earn Rules Table */}
                        <div className="lg:col-span-6 bg-white p-8 border border-[#052326]/8 rounded-lg space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">How to Earn Points & XP</h2>
                                <p className="text-xs text-gray-500 mt-1">Every positive contribution is recognized. Start doing simple tasks to grow your points bank.</p>
                            </div>
                            
                            <div className="divide-y divide-[#052326]/5">
                                {earnRules.map((rule) => {
                                    const IconComponent = rule.icon;
                                    return (
                                        <div key={rule.action} className="py-4 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#F8F3EF] rounded-lg text-[#052326]/75">
                                                    <IconComponent size={16} />
                                                </div>
                                                <span className="font-medium text-xs text-gray-800">{rule.action}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-right">
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block font-medium">XP</span>
                                                    <span className="font-semibold text-xs text-[#052326]">+{rule.xp}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-gray-400 block font-medium">Points</span>
                                                    <span className="font-semibold text-[10px] text-[#F0C417] bg-[#052326] px-2 py-0.5 rounded">{rule.points}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tier Benefits */}
                        <div className="lg:col-span-6 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Circle Tiers & Exclusive Benefits</h2>
                                <p className="text-xs text-gray-500 mt-1">Unlock new Tiers as you gather XP. Higher tiers give compounding shopping advantages.</p>
                            </div>

                            <div className="grid gap-4">
                                {tiers.map((tier) => (
                                    <div key={tier.name} className="bg-white p-6 border border-[#052326]/8 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#052326]/20 transition-all">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${tier.badgeColor}`} />
                                                <span className="font-semibold text-gray-900 text-base">{tier.name}</span>
                                            </div>
                                            <span className="text-[10px] font-semibold text-[#F0C417] bg-[#052326] px-2 py-0.5 rounded">{tier.range}</span>
                                        </div>
                                        <ul className="text-[11px] text-gray-600 space-y-1 md:max-w-xs font-normal list-disc pl-4 md:pl-0 list-inside md:list-none">
                                            {tier.perks.map((perk) => (
                                                <li key={perk} className="flex items-center gap-1.5">
                                                    <CheckCircle2 size={12} className="text-[#052326]/60 shrink-0" />
                                                    <span>{perk}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </section>

                    {/* REWARDS CENTER CAROUSEL */}
                    <section id="rewards" className="space-y-6 pt-6">
                        <div className="text-center max-w-xl mx-auto space-y-2">
                            <h2 className="text-2xl font-semibold text-gray-900">Points Redemption Store</h2>
                            <p className="text-gray-500 text-xs font-normal">Exchange your earned points balance for premium rewards, exclusive discount coupons, or consultation vouchers.</p>
                        </div>

                        {/* Interactive Responsive Carousel */}
                        <div className="relative group/carousel px-4">
                            
                            {/* Left Navigation Arrow */}
                            <button
                                onClick={() => slide('left')}
                                className="absolute left-[-8px] top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-[#052326]/10 text-[#052326] hover:bg-[#F8F3EF] transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                                disabled={activeIndex === 0}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {/* Carousel Scroller Container */}
                            <div
                                ref={sliderRef}
                                onScroll={handleScroll}
                                onMouseDown={handleMouseDown}
                                onMouseUp={handleMouseUpOrLeave}
                                onMouseLeave={handleMouseUpOrLeave}
                                onMouseMove={handleMouseMove}
                                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none cursor-grab active:cursor-grabbing py-2 px-1"
                            >
                                {storeRewards.map((reward, index) => (
                                    <div 
                                        key={index} 
                                        className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] flex-shrink-0 bg-white border border-[#052326]/8 rounded-lg p-6 flex flex-col justify-between hover:border-[#052326]/20 transition-all snap-start"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-[#F0C417] font-semibold uppercase tracking-wide">{reward.subtitle}</p>
                                                <h4 className="font-semibold text-base text-[#052326]">{reward.title}</h4>
                                            </div>
                                            <span className="bg-[#052326]/5 text-[#052326] font-medium text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {reward.category}
                                            </span>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-[#052326]/5 flex items-center justify-between gap-4">
                                            <div>
                                                <span className="text-[9px] text-gray-400 block uppercase font-medium tracking-wider">Required Points</span>
                                                <span className="font-semibold text-base text-[#052326]">{reward.cost}</span>
                                            </div>
                                            <button
                                                onClick={() => router.push(isLoggedIn ? '/dashboard/circle/rewards' : '/login')}
                                                className="px-4 py-2 bg-[#052326] hover:bg-[#F0C417] hover:text-[#052326] text-white font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors"
                                            >
                                                Redeem
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Navigation Arrow */}
                            <button
                                onClick={() => slide('right')}
                                className="absolute right-[-8px] top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-[#052326]/10 text-[#052326] hover:bg-[#F8F3EF] transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                                disabled={activeIndex >= storeRewards.length - (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1)}
                            >
                                <ChevronRight size={18} />
                            </button>

                            {/* Pagination Dots */}
                            <div className="flex justify-center gap-1.5 mt-4">
                                {storeRewards.map((_, idx) => {
                                    const isDotActive = idx === activeIndex;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (sliderRef.current) {
                                                    const width = sliderRef.current.clientWidth;
                                                    const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
                                                    sliderRef.current.scrollTo({ left: idx * (width / cols), behavior: 'smooth' });
                                                }
                                            }}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isDotActive ? 'bg-[#052326] w-3' : 'bg-gray-300'}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* BADGES */}
                    <section className="max-w-3xl mx-auto">
                        
                        {/* Badge System */}
                        <div className="bg-white border border-[#052326]/8 rounded-lg p-8 space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                                    <Medal className="text-[#F0C417]" size={20} /> Circle Achievement Badges
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Unlock badges by achieving milestones. Badges showcase credibility and trust on your profile.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {badgesList.map((badge) => (
                                    <div key={badge.name} className="p-4 rounded-lg bg-[#F8F3EF]/60 border border-[#052326]/5 space-y-1">
                                        <span className="font-semibold text-xs text-[#052326] block">{badge.name}</span>
                                        <span className="text-[11px] text-gray-500 font-medium block leading-relaxed">{badge.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </section>

                    {/* CHALLENGES & AMAs */}
                    <section className="bg-gradient-to-r from-[#052326] to-[#0d454a] text-white rounded-lg p-8 md:p-10 grid md:grid-cols-12 gap-8 items-center">
                        <div className="md:col-span-7 space-y-4">
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#F0C417] bg-white/10 px-2.5 py-0.5 rounded-full">Active Campaigns</span>
                            <h3 className="text-2xl font-semibold">Circle Engagement Zone</h3>
                            <p className="text-xs text-white/80 leading-relaxed font-normal">
                                Participate in daily check-in streaks, write product reviews, or contribute UGC media to multiply your points rewards.
                            </p>
                        </div>
                        <div className="md:col-span-5 grid gap-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                <span className="font-semibold text-xs text-[#F0C417]">Write Product Reviews</span>
                                <p className="text-[11px] text-white/75 mt-1">Submit product reviews with photos to get extra points and XP bonus on approval.</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                <span className="font-semibold text-xs text-[#F0C417]">Daily Check-ins</span>
                                <p className="text-[11px] text-white/75 mt-1">Check in daily on the dashboard to build your streak and earn check-in points.</p>
                            </div>
                        </div>
                    </section>

                    {/* DOCTORS, SELLERS & AFFILIATES TRIPLE GRID */}
                    <section className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 border border-[#052326]/8 rounded-lg space-y-4">
                            <div className="p-3 bg-[#052326]/5 rounded-lg w-fit text-[#052326]">
                                <Store size={20} />
                            </div>
                            <h4 className="font-semibold text-base text-gray-900">Seller / Brand Perks</h4>
                            <p className="text-gray-600 text-xs leading-relaxed font-normal">
                                Sellers with high review ratings and fast order dispatch times earn circle XP, unlocking reduced platform commissions and banner promotions.
                            </p>
                        </div>

                        <div className="bg-white p-6 border border-[#052326]/8 rounded-lg space-y-4">
                            <div className="p-3 bg-[#052326]/5 rounded-lg w-fit text-[#052326]">
                                <UserCheck size={20} />
                            </div>
                            <h4 className="font-semibold text-base text-gray-900">Prescriber Benefits</h4>
                            <p className="text-gray-600 text-xs leading-relaxed font-normal">
                                Certified practitioners who actively reply to community Q&A forums earn spotlight badges, boosting their booking volumes and dashboard visibility.
                            </p>
                        </div>

                        <div className="bg-white p-6 border border-[#052326]/8 rounded-lg space-y-4">
                            <div className="p-3 bg-[#052326]/5 rounded-lg w-fit text-[#052326]">
                                <UserPlus size={20} />
                            </div>
                            <h4 className="font-semibold text-base text-gray-900">Affiliate Bonuses</h4>
                            <p className="text-gray-600 text-xs leading-relaxed font-normal">
                                Generate custom referral links from your circle profile. Get cash-convertible commissions as friends purchase through your links.
                            </p>
                        </div>
                    </section>

                    {/* FAQ DETAIL TABS */}
                    <section className="space-y-6">
                        <div className="text-center max-w-xl mx-auto space-y-2">
                            <h3 className="text-xl font-semibold flex items-center justify-center gap-2 text-gray-900">
                                <HelpCircle size={20} /> Frequently Asked Questions
                            </h3>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            <details className="bg-white border border-[#052326]/8 rounded-lg p-5 group [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-[#052326]">
                                    <span>How do I join Cureza Circle?</span>
                                    <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                                </summary>
                                <p className="mt-3 text-xs text-gray-500 leading-relaxed pl-1">
                                    Simply create a customer, seller, or prescriber account on Cureza. You are automatically enrolled under the Explorer tier with immediate access to points accumulation.
                                </p>
                            </details>

                            <details className="bg-white border border-[#052326]/8 rounded-lg p-5 group [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-[#052326]">
                                    <span>How can I redeem my accumulated points?</span>
                                    <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                                </summary>
                                <p className="mt-3 text-xs text-gray-500 leading-relaxed pl-1">
                                    Navigate to the Points Redemption Store section above or your Account Dashboard, choose any active reward, and click Redeem. A unique discount code or voucher will be issued immediately.
                                </p>
                            </details>

                            <details className="bg-white border border-[#052326]/8 rounded-lg p-5 group [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex items-center justify-between cursor-pointer font-semibold text-xs text-[#052326]">
                                    <span>Do points or XP rank expire?</span>
                                    <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                                </summary>
                                <p className="mt-3 text-xs text-gray-500 leading-relaxed pl-1">
                                    Points and XP do not expire.
                                </p>
                            </details>
                        </div>
                    </section>

                    {/* BOTTOM CALL TO ACTION */}
                    <section id="join" className="pt-8">
                        <div className="bg-[#052326] rounded-lg p-8 md:p-12 text-white relative overflow-hidden">
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold">Ready to unlock Cureza Circle?</h3>
                                    <p className="text-xs text-white/80 font-normal max-w-xl">
                                        Become part of our loyalty community today. Collect badges, claim rewards, and buy certified wellness products with premium member discounts.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4 shrink-0">
                                    {isLoggedIn ? (
                                        <Link 
                                            href="/dashboard/circle" 
                                            className="px-5 py-3 bg-white text-[#052326] font-semibold rounded-lg text-xs uppercase tracking-wider hover:bg-[#F8F3EF] transition-all"
                                        >
                                            Open Circle Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link 
                                                href="/register" 
                                                className="px-5 py-3 bg-white text-[#052326] font-semibold rounded-lg text-xs uppercase tracking-wider hover:bg-[#F8F3EF] transition-all"
                                            >
                                                Create Account
                                            </Link>
                                            <Link 
                                                href="/login" 
                                                className="px-5 py-3 border border-white/30 rounded-lg text-white hover:bg-white/10 transition-all text-xs uppercase tracking-wider font-semibold"
                                            >
                                                Login
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                </main>

                {/* Subfooter */}
                <footer className="border-t border-[#052326]/5 py-8 text-center text-xs text-gray-400">
                    <div>
                        © {new Date().getFullYear()} Cureza Wellness Pvt Ltd. All rights reserved. • Built for community-driven growth
                    </div>
                </footer>
                
            </div>

        </div>
    );
}
