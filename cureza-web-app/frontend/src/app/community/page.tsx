import React from "react";
import { Metadata } from 'next';
import Link from 'next/link';
import { 
    Trophy, 
    Sparkles, 
    TrendingUp, 
    Gift, 
    Medal, 
    Users, 
    CheckCircle2, 
    Calendar, 
    ChevronRight, 
    UserPlus, 
    ArrowRight, 
    Coins, 
    Heart, 
    Activity, 
    HelpCircle,
    UserCheck,
    MessageSquare,
    Store
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Cureza Circle - Loyalty Rewards, Community & Gamification',
    description: 'Join Cureza Circle and earn XP, unlock tiers, collect badges, and redeem exclusive wellness rewards. Connect with customers, influencers, sellers, and doctors in India\'s wellness community.',
};

const earnRules = [
    { action: "Product Purchase", xp: 100, points: "10 pts / ₹100", icon: Coins },
    { action: "Write Honest Review", xp: 50, points: "20 pts", icon: MessageSquare },
    { action: "UGC Photo/Video Upload", xp: 100, points: "40 pts", icon: Sparkles },
    { action: "Refer a Friend", xp: 200, points: "100 pts", icon: UserPlus },
    { action: "Upload Valid Prescription", xp: 150, points: "—", icon: UserCheck },
    { action: "Join Live Wellness Event", xp: 250, points: "50 pts", icon: Calendar },
    { action: "Daily Check-in Streak", xp: 20, points: "—", icon: Activity },
];

const tiers = [
    { name: "Explorer", range: "0–499 XP", perks: ["Basic platform access", "Welcome bonus points", "Community general chats"], badgeColor: "from-slate-400 to-slate-500" },
    { name: "Creator", range: "500–1,999 XP", perks: ["Extra 5% off sitewide", "Exclusive webinar invites", "Priority customer support"], badgeColor: "from-emerald-400 to-emerald-600" },
    { name: "Ambassador", range: "2,000–4,999 XP", perks: ["10% cashback coupons", "Early product launches", "Creator program sponsorship"], badgeColor: "from-amber-400 to-amber-600" },
    { name: "Partner", range: "5,000+ XP", perks: ["Paid collaborations", "Custom referral commissions", "VIP retreat invitations"], badgeColor: "from-yellow-400 to-amber-500" },
];

const rewards = [
    { title: "Flat 10% Discount", subtitle: "Wellness & Supplements", cost: "500 pts", category: "Discounts" },
    { title: "Free Mini Sample Pack", subtitle: "Curated wellness kit", cost: "300 pts", category: "Products" },
    { title: "Exclusive Merch T-shirt", subtitle: "Limited edition print", cost: "1500 pts", category: "Merchandise" },
    { title: "Live Event Pass", subtitle: "Local healing workshops", cost: "1000 pts", category: "Events" },
    { title: "Doctor Video Consultation", subtitle: "15-min live session", cost: "2000 pts", category: "Consultation" },
    { title: "Exclusive Vendor Coupon", subtitle: "Extra 5% discount", cost: "800 pts", category: "Discounts" },
];

const badges = [
    { name: "Top Influencer", desc: "Shared 5+ helpful UGC reviews" },
    { name: "Top Reviewer", desc: "Had 10 helpful review upvotes" },
    { name: "Wellness Achiever", desc: "Completed 3 consecutive challenges" },
    { name: "7-Day Meditator", desc: "Tracked daily streak for a week" },
    { name: "UGC Star", desc: "Video review selected by editors" },
    { name: "Event Champion", desc: "Attended 3 live wellness webinars" },
];

export default function CurezaCircle() {
    return (
        <div className="min-h-screen bg-[#F8F3EF] text-[#052326] pt-8">
            
            {/* HERO SECTION */}
            <div className="container mx-auto px-4 md:px-6">
                <header className="relative overflow-hidden bg-gradient-to-br from-[#052326] via-[#093539] to-[#0e444b] text-white py-20 px-6 rounded-3xl shadow-md">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(240,196,23,0.1),transparent_50%)]" />
                    <div className="relative z-10">
                        <div className="container mx-auto max-w-5xl">
                        <div className="grid lg:grid-cols-12 gap-12 items-center">
                            
                            {/* Hero Intro */}
                            <div className="lg:col-span-7 space-y-6">
                                <span className="inline-flex items-center gap-1.5 bg-[#F0C417] text-[#052326] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    <Trophy size={12} className="animate-bounce" />
                                    Cureza Circle Loyalty Hub
                                </span>
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.15]">
                                    Connect. Engage. <br />
                                    <span className="text-[#F0C417]">Earn Real Rewards.</span>
                                </h1>
                                <p className="text-sm md:text-base text-white/80 max-w-xl leading-relaxed font-light">
                                    Join a reward-driven wellness community that connects health enthusiasts, creators, trusted sellers, and certified doctors. Earn XP, rank up, and claim exclusive perks.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <Link
                                        href="/register"
                                        className="px-6 py-3 bg-[#F0C417] text-[#052326] rounded-xl hover:bg-[#F0C417]/90 transition-all font-bold shadow-md hover:shadow-lg flex items-center gap-2 group text-sm"
                                    >
                                        Start Earning Today
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <a
                                        href="#rewards"
                                        className="px-6 py-3 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all font-bold text-sm"
                                    >
                                        Explore Rewards
                                    </a>
                                </div>
                            </div>

                            {/* Interactive Circle Snapshot */}
                            <div className="lg:col-span-5">
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-[#F0C417]/10 rounded-full blur-xl pointer-events-none" />
                                    
                                    <div className="flex justify-between items-center pb-6 border-b border-white/10">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-white/50">Your Status</p>
                                            <h3 className="text-xl font-bold flex items-center gap-2 mt-0.5">
                                                <Medal className="text-[#F0C417]" size={20} /> Explorer Tier
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-white/50">XP Earned</p>
                                            <p className="text-xl font-black text-[#F0C417]">120 XP</p>
                                        </div>
                                    </div>

                                    <div className="py-6">
                                        <div className="flex justify-between text-xs text-white/75 mb-2 font-medium">
                                            <span>Explorer</span>
                                            <span>Creator (500 XP)</span>
                                        </div>
                                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                                            <div className="bg-[#F0C417] h-3 rounded-full transition-all duration-500" style={{ width: "24%" }} />
                                        </div>
                                        <p className="text-[11px] text-white/60 mt-2 text-right">380 XP needed to unlock next tier</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider">Redeemable Points</span>
                                            <span className="text-2xl font-black text-[#F0C417] block mt-1">320 pts</span>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-[10px] font-bold text-white/40 block uppercase tracking-wider">Unlocked Badges</span>
                                            <span className="text-2xl font-black text-[#F0C417] block mt-1">1 Badge</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* PURPOSE & VALUE-PROPS */}
            <main className="container mx-auto px-6 py-16 space-y-20">
                
                <section className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 border border-[#052326]/8 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
                        <div className="p-3 bg-[#052326]/5 rounded-xl w-fit text-[#052326]">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="font-extrabold text-xl">Retention & Streaks</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Stay active and build consistency. Earn compounding XP multipliers and point boosts by checking in daily or taking daily streaks.
                        </p>
                    </div>

                    <div className="bg-white p-8 border border-[#052326]/8 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
                        <div className="p-3 bg-[#052326]/5 rounded-xl w-fit text-[#052326]">
                            <Users size={24} />
                        </div>
                        <h3 className="font-extrabold text-xl">Interactive Community</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Share user-generated content (UGC), participate in AMA discussions, ask questions to panel doctors, and unlock collaborative rewards.
                        </p>
                    </div>

                    <div className="bg-white p-8 border border-[#052326]/8 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
                        <div className="p-3 bg-[#052326]/5 rounded-xl w-fit text-[#052326]">
                            <Gift size={24} />
                        </div>
                        <h3 className="font-extrabold text-xl">Premium Rewards</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Redeem points for real store credits, custom consultations, premium products, merchandise, or exclusive brand coupon codes.
                        </p>
                    </div>
                </section>

                {/* EARNING & TIERS TABBED/GRID SECTION */}
                <section className="grid lg:grid-cols-12 gap-12">
                    
                    {/* Earn Rules Table */}
                    <div className="lg:col-span-6 bg-white p-8 border border-[#052326]/8 rounded-3xl shadow-sm space-y-6">
                        <div>
                            <h2 className="text-2xl font-black">How to Earn Points & XP</h2>
                            <p className="text-sm text-gray-500 mt-1">Every positive contribution is recognized. Start doing simple tasks to grow your points bank.</p>
                        </div>
                        
                        <div className="divide-y divide-[#052326]/5">
                            {earnRules.map((rule) => {
                                const IconComponent = rule.icon;
                                return (
                                    <div key={rule.action} className="py-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#F8F3EF] rounded-lg text-[#052326]/75">
                                                <IconComponent size={18} />
                                            </div>
                                            <span className="font-bold text-sm">{rule.action}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <div>
                                                <span className="text-xs text-gray-400 block">XP</span>
                                                <span className="font-extrabold text-sm text-[#052326]">+{rule.xp}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-400 block">Points</span>
                                                <span className="font-extrabold text-sm text-[#F0C417] bg-[#052326] px-2 py-0.5 rounded text-[11px]">{rule.points}</span>
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
                            <h2 className="text-2xl font-black">Circle Tiers & Exclusive Benefits</h2>
                            <p className="text-sm text-gray-500 mt-1">Unlock new tiers as you gather XP. Higher tiers give compounding shopping advantages.</p>
                        </div>

                        <div className="grid gap-4">
                            {tiers.map((tier) => (
                                <div key={tier.name} className="bg-white p-6 border border-[#052326]/8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#052326]/20 transition-all">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${tier.badgeColor}`} />
                                            <span className="font-black text-[#052326] text-lg">{tier.name}</span>
                                        </div>
                                        <span className="text-xs font-bold text-[#F0C417] bg-[#052326] px-2 py-0.5 rounded">{tier.range}</span>
                                    </div>
                                    <ul className="text-xs text-gray-600 space-y-1 md:max-w-xs font-medium list-disc pl-4 md:pl-0 list-inside md:list-none">
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

                {/* REWARDS CENTER GRID */}
                <section id="rewards" className="space-y-8 pt-8">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                        <h2 className="text-3xl font-black">Points Redemption Store</h2>
                        <p className="text-gray-500 text-sm">Exchange your earned points balance for premium rewards, exclusive discount coupons, or consultation vouchers.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rewards.map((reward) => (
                            <div key={reward.title} className="bg-white border border-[#052326]/8 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute right-0 top-0 bg-[#052326]/5 text-[#052326] font-bold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                                    {reward.category}
                                </div>
                                <div className="space-y-2 pt-2">
                                    <p className="text-xs text-[#F0C417] font-extrabold uppercase tracking-wide">{reward.subtitle}</p>
                                    <h4 className="font-black text-xl text-[#052326]">{reward.title}</h4>
                                </div>

                                <div className="mt-8 pt-4 border-t border-[#052326]/5 flex items-center justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Required Points</span>
                                        <span className="font-black text-lg text-[#052326]">{reward.cost}</span>
                                    </div>
                                    <button className="px-5 py-2.5 bg-[#052326] hover:bg-[#F0C417] hover:text-[#052326] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm">
                                        Redeem
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BADGES & LEADERBOARD */}
                <section className="grid md:grid-cols-2 gap-12">
                    
                    {/* Badge System */}
                    <div className="bg-white border border-[#052326]/8 rounded-3xl p-8 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-2xl font-black flex items-center gap-2">
                                <Medal className="text-[#F0C417]" /> Circle Achievement Badges
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Unlock badges by achieving milestones. Badges showcase credibility and trust on your profile.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {badges.map((badge) => (
                                <div key={badge.name} className="p-4 rounded-xl bg-[#F8F3EF]/60 border border-[#052326]/5 space-y-1">
                                    <span className="font-extrabold text-sm text-[#052326] block">{badge.name}</span>
                                    <span className="text-xs text-gray-500 font-medium block leading-relaxed">{badge.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Leaderboard */}
                    <div className="bg-white border border-[#052326]/8 rounded-3xl p-8 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-2xl font-black flex items-center gap-2">
                                <Trophy className="text-[#F0C417]" /> Monthly Top Members
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Climb the community leaderboards. Top monthly members receive bonus boxes and shopping credits.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F3EF]/40 border border-[#052326]/5 hover:bg-[#F8F3EF] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#052326] text-white flex items-center justify-center font-black text-sm">A</div>
                                    <div>
                                        <div className="font-extrabold text-sm">Aisha Sharma</div>
                                        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Ambassador Tier</div>
                                    </div>
                                </div>
                                <span className="font-black text-sm text-[#052326] bg-[#F0C417] px-3 py-1 rounded-lg">4,120 XP</span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F3EF]/40 border border-[#052326]/5 hover:bg-[#F8F3EF] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#052326] text-white flex items-center justify-center font-black text-sm">R</div>
                                    <div>
                                        <div className="font-extrabold text-sm">Rahul Verma</div>
                                        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Creator Tier</div>
                                    </div>
                                </div>
                                <span className="font-black text-sm text-[#052326] bg-[#F0C417] px-3 py-1 rounded-lg">1,840 XP</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 italic">Leaderboards reset at midnight on the 1st of every month.</p>
                    </div>

                </section>

                {/* CHALLENGES & AMAs */}
                <section className="bg-gradient-to-r from-[#052326] to-[#0d454a] text-white rounded-3xl p-8 md:p-12 shadow-xl grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#F0C417] bg-white/10 px-3 py-1 rounded-full">Active Campaigns</span>
                        <h3 className="text-3xl font-black">Circle Engagement Zone</h3>
                        <p className="text-sm text-white/80 leading-relaxed font-light">
                            Participate in ongoing monthly challenges, take part in Doctor AMAs, or contribute UGC content to double your current earning multipliers.
                        </p>
                    </div>
                    <div className="md:col-span-5 grid gap-4">
                        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                            <span className="font-bold text-sm text-[#F0C417]">Monthly Earning Challenge</span>
                            <p className="text-xs text-white/75 mt-1">Submit 3 product reviews with photos to get an extra 200 points bonus.</p>
                        </div>
                        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                            <span className="font-bold text-sm text-[#F0C417]">Doctor Live Q&A Sessions</span>
                            <p className="text-xs text-white/75 mt-1">Submit questions for our Ayurveda panel AMA and earn 50 XP automatically.</p>
                        </div>
                    </div>
                </section>

                {/* DOCTORS, SELLERS & AFFILIATES TRIPLE GRID */}
                <section className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 border border-[#052326]/8 rounded-2xl shadow-sm space-y-4">
                        <div className="p-3 bg-[#052326]/5 rounded-xl w-fit text-[#052326]">
                            <Store size={24} />
                        </div>
                        <h4 className="font-extrabold text-lg">Seller / Brand Perks</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            Sellers with high review ratings and fast order dispatch times earn circle XP, unlocking reduced platform commissions and banner promotions.
                        </p>
                    </div>

                    <div className="bg-white p-8 border border-[#052326]/8 rounded-2xl shadow-sm space-y-4">
                        <div className="p-3 bg-[#052326]/5 rounded-xl w-fit text-[#052326]">
                            <UserCheck size={24} />
                        </div>
                        <h4 className="font-extrabold text-lg">Prescriber Benefits</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            Certified practitioners who actively reply to community Q&A forums earn spotlight badges, boosting their booking volumes and dashboard visibility.
                        </p>
                    </div>

                    <div className="bg-white p-8 border border-[#052326]/8 rounded-2xl shadow-sm space-y-4">
                        <div className="p-3 bg-[#052326]/5 rounded-xl w-fit text-[#052326]">
                            <UserPlus size={24} />
                        </div>
                        <h4 className="font-extrabold text-lg">Affiliate Bonuses</h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            Generate custom referral links from your circle profile. Get cash-convertible commissions as friends purchase through your links.
                        </p>
                    </div>
                </section>

                {/* FAQ DETAIL TABS */}
                <section className="space-y-6">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                        <h3 className="text-2xl font-black flex items-center justify-center gap-2">
                            <HelpCircle /> Frequently Asked Questions
                        </h3>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        <details className="bg-white border border-[#052326]/8 rounded-xl p-5 group [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#052326]">
                                <span>How do I join Cureza Circle?</span>
                                <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
                            </summary>
                            <p className="mt-3 text-xs text-gray-500 leading-relaxed pl-1">
                                Simply create a customer, seller, or prescriber account on Cureza. You are automatically enrolled under the Explorer tier with immediate access to points accumulation.
                            </p>
                        </details>

                        <details className="bg-white border border-[#052326]/8 rounded-xl p-5 group [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#052326]">
                                <span>How can I redeem my accumulated points?</span>
                                <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
                            </summary>
                            <p className="mt-3 text-xs text-gray-500 leading-relaxed pl-1">
                                Navigate to the Points Redemption Store section above or your Account Dashboard, choose any active reward, and click Redeem. A unique discount code or voucher will be issued immediately.
                            </p>
                        </details>

                        <details className="bg-white border border-[#052326]/8 rounded-xl p-5 group [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#052326]">
                                <span>Do points or XP rank expire?</span>
                                <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
                            </summary>
                            <p className="mt-3 text-xs text-gray-500 leading-relaxed pl-1">
                                Points expire after 12 months of account inactivity. Your XP rank (Explorer, Creator, etc.) is permanent and does not decay, ensuring you always enjoy your unlocked tier status.
                            </p>
                        </details>
                    </div>
                </section>

                {/* BOTTOM CALL TO ACTION */}
                <section id="join" className="pt-8">
                    <div className="bg-[#052326] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-64 h-64 bg-[#F0C417]/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black">Ready to unlock Cureza Circle?</h3>
                                <p className="text-sm text-white/80 font-light max-w-xl">
                                    Become part of our loyalty community today. Collect badges, claim rewards, and buy certified wellness products with premium member discounts.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 shrink-0">
                                <Link 
                                    href="/register" 
                                    className="px-6 py-3 bg-white text-[#052326] font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#F8F3EF] transition-all shadow-md"
                                >
                                    Create Account
                                </Link>
                                <Link 
                                    href="/dashboard" 
                                    className="px-6 py-3 border border-white/30 rounded-xl text-white hover:bg-white/10 transition-all text-xs uppercase tracking-wider font-semibold"
                                >
                                    Open Circle Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Subfooter */}
            <footer className="border-t border-[#052326]/5 py-8 text-center text-xs text-gray-400">
                <div className="container mx-auto px-4">
                    © {new Date().getFullYear()} Cureza Wellness Pvt Ltd. All rights reserved. • Built for community-driven growth
                </div>
            </footer>

        </div>
    );
}

