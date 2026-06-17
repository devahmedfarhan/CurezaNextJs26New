'use client';

import React from 'react';
import { BookOpen, Star, Trophy, Users, Gift, ShieldCheck, ArrowRight, Zap, BadgeHelp, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function CircleGuidelinesPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center py-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#052326]/5 text-[#052326] text-xs font-bold uppercase tracking-wider mb-2">
                    <BookOpen size={12} /> Cureza Circle Tutorial
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Guide & Guidelines</h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
                    Learn how to maximize your XP points, unlock premium tiers, collect badges, and redeem wellness rewards.
                </p>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#052326] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-xl"></div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                        <Zap className="text-yellow-400" size={20} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">1. Earn XP Points</h3>
                    <p className="text-gray-300 text-xs leading-relaxed mb-4">
                        Perform simple actions like ordering, writing reviews, uploading photos, and referring friends.
                    </p>
                    <Link href="#earn-rules" className="text-yellow-400 font-bold text-xs flex items-center gap-1 hover:underline">
                        View rules <ArrowRight size={12} />
                    </Link>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
                        <Trophy size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">2. Unlock Premium Tiers</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">
                        As your lifetime points grow, unlock Gold and Platinum tiers with exclusive multiplier benefits.
                    </p>
                    <Link href="#tiers-benefits" className="text-[#052326] font-bold text-xs flex items-center gap-1 hover:underline">
                        View tiers <ArrowRight size={12} />
                    </Link>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <Gift size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">3. Redeem Rewards</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">
                        Exchange your points for discount coupons, free consultations, and special wellness gift boxes.
                    </p>
                    <Link href="/dashboard/circle/rewards" className="text-[#052326] font-bold text-xs flex items-center gap-1 hover:underline">
                        Redeem now <ArrowRight size={12} />
                    </Link>
                </div>
            </div>

            {/* How to Earn Section */}
            <div id="earn-rules" className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 scroll-mt-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                        +
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Earning XP (Experience Points)</h2>
                        <p className="text-xs text-gray-500">Every wellness choice you make helps you collect reward points.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-colors">
                        <span className="text-2xl mt-0.5">🛒</span>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Order Purchases</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Earn <strong className="text-emerald-600">10 XP points for every ₹100 spent</strong> on medicines, wellness packs, and medical devices.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-colors">
                        <span className="text-2xl mt-0.5">✍️</span>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Product Reviews</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Share your honest feedback on products and earn <strong className="text-emerald-600">50 XP points</strong> per approved text review.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-colors">
                        <span className="text-2xl mt-0.5">📸</span>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Upload Photo with Review</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Add an authentic product photo with your review and earn <strong className="text-emerald-600">100 XP points</strong> instead of 50.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-colors">
                        <span className="text-2xl mt-0.5">🤝</span>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Successful Referral</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Invite friends! Earn <strong className="text-[#052326]">1,000 XP points</strong> when your friend completes their first purchase.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tiers Section */}
            <div id="tiers-benefits" className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 scroll-mt-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Trophy size={16} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Membership Tiers & Perks</h2>
                        <p className="text-xs text-gray-500">Earn lifetime points to advance to next tiers and unlock rewards modifiers.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Silver */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 relative flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-white border px-2 py-0.5 rounded-full inline-block mb-3">
                                0 - 999 XP
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
                                🥈 Silver Tier
                            </h3>
                            <ul className="text-xs text-gray-500 space-y-2.5 mt-4">
                                <li className="flex items-center gap-2">✓ Standard Earning Rate (10 XP per ₹100)</li>
                                <li className="flex items-center gap-2">✓ Access to standard rewards store</li>
                                <li className="flex items-center gap-2">✓ Join active community challenges</li>
                            </ul>
                        </div>
                        <div className="text-xs font-bold text-gray-400 mt-6 pt-4 border-t border-gray-200/50">
                            Starting Membership Level
                        </div>
                    </div>

                    {/* Gold */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 border border-yellow-200 rounded-xl p-5 relative flex flex-col justify-between">
                        <div className="absolute top-3 right-3 text-xs bg-yellow-400 text-white font-extrabold px-2 py-0.5 rounded-full">
                            POPULAR
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-yellow-700 bg-white border border-yellow-200 px-2 py-0.5 rounded-full inline-block mb-3">
                                1,000 - 4,999 XP
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
                                🥇 Gold Tier
                            </h3>
                            <ul className="text-xs text-gray-600 space-y-2.5 mt-4">
                                <li className="flex items-center gap-2 text-yellow-950"><strong className="text-yellow-600">✓ 1.1x Points Multiplier</strong></li>
                                <li className="flex items-center gap-2 text-yellow-950">✓ Early access to exclusive product launches</li>
                                <li className="flex items-center gap-2 text-yellow-950">✓ 1 Free Doctor Consultation per quarter</li>
                                <li className="flex items-center gap-2 text-yellow-950">✓ Access to special Gold badges</li>
                            </ul>
                        </div>
                        <div className="text-xs font-bold text-yellow-600 mt-6 pt-4 border-t border-yellow-200/50">
                            Automatic Upgrade at 1,000 XP
                        </div>
                    </div>

                    {/* Platinum */}
                    <div className="bg-gradient-to-br from-[#052326]/5 to-[#052326]/10 border border-[#052326]/20 rounded-xl p-5 relative flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-[#052326] bg-white border border-[#052326]/20 px-2 py-0.5 rounded-full inline-block mb-3">
                                5,000+ XP
                            </span>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
                                💎 Platinum Tier
                            </h3>
                            <ul className="text-xs text-gray-600 space-y-2.5 mt-4">
                                <li className="flex items-center gap-2 text-[#052326]"><strong className="text-[#052326] font-bold">✓ 1.25x Points Multiplier</strong></li>
                                <li className="flex items-center gap-2 text-[#052326]">✓ Free Express Shipping on all orders</li>
                                <li className="flex items-center gap-2 text-[#052326]">✓ 24/7 Priority Doctor Consultation access</li>
                                <li className="flex items-center gap-2 text-[#052326]">✓ Exclusive curated wellness hampers</li>
                                <li className="flex items-center gap-2 text-[#052326]">✓ Direct VIP customer support line</li>
                            </ul>
                        </div>
                        <div className="text-xs font-bold text-[#052326] mt-6 pt-4 border-t border-[#052326]/20">
                            Automatic Upgrade at 5,000 XP
                        </div>
                    </div>
                </div>
            </div>

            {/* Referrals & Welcome Bonus Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referrals */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-base">How referrals work</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Referral rewards are activated after verifying orders to prevent fraudulent accounts.
                    </p>
                    <ol className="text-xs text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl list-decimal list-inside">
                        <li>Share your unique link from the <Link href="/dashboard/circle/referrals" className="text-[#052326] font-bold hover:underline">Referrals</Link> section.</li>
                        <li>Your friend registers passing your referral code. The status starts as <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold text-[10px]">PENDING</span>.</li>
                        <li>Your friend places and completes their first successful purchase.</li>
                        <li>The system automatically updates status to <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold text-[10px]">COMPLETED</span>, and credits **1,000 XP** to your account and **200 XP** to your friend.</li>
                    </ol>
                </div>

                {/* Challenges & Badges */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Trophy size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-base">Completing Challenges & Badges</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Challenges are timed quests that award huge bonus XP, while Badges highlight your loyalty.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-3">
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600 text-sm">1.</span>
                            <div>
                                <strong>Join active quests:</strong> Go to the <Link href="/dashboard/circle/challenges" className="text-[#052326] font-bold hover:underline">Challenges</Link> screen and click "Join" to start logging progress.
                            </div>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600 text-sm">2.</span>
                            <div>
                                <strong>Claim points manually:</strong> Once your challenge progress hits 100%, click the "Claim Points" button. Claiming points automatically increments your wallet XP.
                            </div>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-600 text-sm">3.</span>
                            <div>
                                <strong>Automated Badge Unlocking:</strong> Reaching specific point thresholds (e.g. 1000 points) or finishing referrals automatically unlocks achievements in your <Link href="/dashboard/circle/badges" className="text-[#052326] font-bold hover:underline">Badges cabinet</Link>.
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center">
                        <BadgeHelp size={16} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        <p className="text-xs text-gray-500">Common questions about Cureza Circle gamification rules.</p>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {[
                        {
                            q: "Do my XP points expire?",
                            a: "No! XP points earned inside the Cureza Circle ecosystem never expire. You can hold onto them or spend them whenever you see a reward you like in the Shop."
                        },
                        {
                            q: "Can I redeem points for raw cash payouts?",
                            a: "Points are used as loyalty coins and cannot be withdrawn directly to a bank account as cash. However, you can redeem them for Coupon Codes that deduct cash value directly from your checkout cart total."
                        },
                        {
                            q: "Why is my friend's referral still showing as 'Pending'?",
                            a: "A referral stays pending until the person you referred makes their first purchase and the order is fully delivered/completed. Once their order status is marked as 'completed' in our system, the reward will automatically be credited to both accounts."
                        },
                        {
                            q: "How are tiers calculated?",
                            a: "Tiers are calculated dynamically in real-time based on your total earned points. If you redeem points, it does not downgrade your tier. Your tier is evaluated against your lifetime earned points so you never lose your benefits."
                        }
                    ].map((faq, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <ChevronRight size={14} className="text-[#052326] shrink-0" /> {faq.q}
                            </h4>
                            <p className="text-xs text-gray-500 pl-6 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
