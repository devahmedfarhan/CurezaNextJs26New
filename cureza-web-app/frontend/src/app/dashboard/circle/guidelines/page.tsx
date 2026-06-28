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
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Guide & Guidelines</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
                    Learn how to maximize your XP, earn redeemable points, unlock premium tiers, and claim rewards.
                </p>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#052326] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-xl"></div>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                        <Zap className="text-yellow-400" size={20} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">1. Earn XP & Points</h3>
                    <p className="text-gray-300 text-xs leading-relaxed mb-4">
                        Perform actions like daily check-ins, ordering, reviewing, and referring friends to gain points & XP.
                    </p>
                    <Link href="#earn-rules" className="text-yellow-400 font-bold text-xs flex items-center gap-1 hover:underline">
                        View rules <ArrowRight size={12} />
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center mb-4">
                        <Trophy size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">2. Unlock Premium Tiers</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">
                        As your lifetime accumulated XP grows, unlock Gold and Platinum tiers with exclusive multiplier benefits.
                    </p>
                    <Link href="#tiers-benefits" className="text-[#052326] dark:text-emerald-400 font-bold text-xs flex items-center gap-1 hover:underline">
                        View tiers <ArrowRight size={12} />
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
                        <Gift size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">3. Redeem Rewards</h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4">
                        Exchange your redeemable Points for discount coupons and special wellness gift boxes.
                    </p>
                    <Link href="/dashboard/circle/rewards" className="text-[#052326] dark:text-emerald-400 font-bold text-xs flex items-center gap-1 hover:underline">
                        Redeem now <ArrowRight size={12} />
                    </Link>
                </div>
            </div>

            {/* How to Earn Section */}
            <div id="earn-rules" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 scroll-mt-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                        +
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Earning Guidelines</h2>
                        <p className="text-xs text-gray-500">How you build your points bank and lifetime XP</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-white dark:hover:bg-gray-950 transition-colors">
                        <span className="text-2xl mt-0.5">🛒</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Product Purchase</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Earn a boost of <strong className="text-emerald-600 dark:text-emerald-400">100 XP</strong> flat per order plus <strong className="text-emerald-600 dark:text-emerald-400">10 Points per ₹100 spent</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-white dark:hover:bg-gray-950 transition-colors">
                        <span className="text-2xl mt-0.5">✍️</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Write Honest Review</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Get rewarded with <strong className="text-emerald-600 dark:text-emerald-400">50 XP and 20 Points</strong> for every approved text review.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-white dark:hover:bg-gray-950 transition-colors">
                        <span className="text-2xl mt-0.5">📸</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">UGC Photo/Video Upload</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Add a photo/video to your review and get an additional <strong className="text-emerald-600 dark:text-emerald-400">100 XP and 40 Points</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-white dark:hover:bg-gray-950 transition-colors">
                        <span className="text-2xl mt-0.5">🤝</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Refer a Friend</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Invite friends! Earn <strong className="text-[#052326] dark:text-emerald-400">200 XP and 100 Points</strong> when your friend completes their first purchase.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-white dark:hover:bg-gray-950 transition-colors">
                        <span className="text-2xl mt-0.5">📄</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Upload Valid Prescription</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Upload a valid medical prescription for prescription products and earn <strong className="text-emerald-600 dark:text-emerald-400">150 XP</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-white dark:hover:bg-gray-950 transition-colors">
                        <span className="text-2xl mt-0.5">🔥</span>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Daily Check-in Streak</h4>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                Visit the site daily to claim check-in points! Get <strong className="text-emerald-600 dark:text-emerald-400">20 XP</strong> per daily check-in.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tiers Section */}
            <div id="tiers-benefits" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 scroll-mt-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                        <Trophy size={16} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Membership Tiers & Perks</h2>
                        <p className="text-xs text-gray-500">Accumulate lifetime XP to advance to higher tiers. Tiers do not reset upon redeeming points.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Silver */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-850 dark:to-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-5 relative flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-white dark:bg-gray-900 border dark:border-gray-800 px-2 py-0.5 rounded-full inline-block mb-3">
                                0 - 999 XP
                            </span>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-1.5">
                                🥈 Silver Tier
                            </h3>
                            <ul className="text-xs text-gray-500 space-y-2.5 mt-4">
                                <li className="flex items-center gap-2">✓ Standard Earning Rate (10 pts per ₹100)</li>
                                <li className="flex items-center gap-2">✓ Access to standard rewards store</li>
                                <li className="flex items-center gap-2">✓ Daily check-in access</li>
                            </ul>
                        </div>
                        <div className="text-xs font-bold text-gray-400 mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-850">
                            Starting Membership Level
                        </div>
                    </div>

                    {/* Gold */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-yellow-950/10 dark:to-yellow-900/10 border border-yellow-200 dark:border-yellow-950/30 rounded-xl p-5 relative flex flex-col justify-between">
                        <div className="absolute top-3 right-3 text-xs bg-yellow-400 text-white font-extrabold px-2 py-0.5 rounded-full">
                            POPULAR
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-yellow-700 bg-white dark:bg-gray-900 border border-yellow-200 dark:border-yellow-955 px-2 py-0.5 rounded-full inline-block mb-3">
                                1,000 - 4,999 XP
                            </span>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-1.5">
                                🥇 Gold Tier
                            </h3>
                            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2.5 mt-4">
                                <li className="flex items-center gap-2 text-yellow-950 dark:text-yellow-300"><strong className="text-yellow-600 dark:text-yellow-400">✓ 1.1x Points Multiplier</strong></li>
                                <li className="flex items-center gap-2 text-yellow-950 dark:text-yellow-300">✓ Early access to exclusive product launches</li>
                                <li className="flex items-center gap-2 text-yellow-950 dark:text-yellow-300">✓ 1 Free Doctor Consultation per quarter</li>
                                <li className="flex items-center gap-2 text-yellow-950 dark:text-yellow-300">✓ Access to special Gold badges</li>
                            </ul>
                        </div>
                        <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mt-6 pt-4 border-t border-yellow-200/50 dark:border-yellow-950/30">
                            Automatic Upgrade at 1,000 XP
                        </div>
                    </div>

                    {/* Platinum */}
                    <div className="bg-gradient-to-br from-[#052326]/5 to-[#052326]/10 dark:from-[#052326]/10 dark:to-[#052326]/20 border border-[#052326]/20 dark:border-[#052326]/40 rounded-xl p-5 relative flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-[#052326] dark:text-emerald-400 bg-white dark:bg-gray-900 border border-[#052326]/20 dark:border-emerald-950 px-2 py-0.5 rounded-full inline-block mb-3">
                                5,000+ XP
                            </span>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-1.5">
                                💎 Platinum Tier
                            </h3>
                            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2.5 mt-4">
                                <li className="flex items-center gap-2 text-[#052326] dark:text-emerald-400"><strong className="text-[#052326] dark:text-emerald-300 font-bold">✓ 1.25x Points Multiplier</strong></li>
                                <li className="flex items-center gap-2 text-[#052326] dark:text-emerald-400">✓ Free Express Shipping on all orders</li>
                                <li className="flex items-center gap-2 text-[#052326] dark:text-emerald-400">✓ 24/7 Priority Doctor Consultation access</li>
                                <li className="flex items-center gap-2 text-[#052326] dark:text-emerald-400">✓ Exclusive curated wellness hampers</li>
                            </ul>
                        </div>
                        <div className="text-xs font-bold text-[#052326] dark:text-emerald-400 mt-6 pt-4 border-t border-[#052326]/20 dark:border-[#052326]/40">
                            Automatic Upgrade at 5,000 XP
                        </div>
                    </div>
                </div>
            </div>

            {/* Referrals & Check-ins Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referrals */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 rounded-lg">
                            <Users size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">How referrals work</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Referrals are automatically validated upon purchase fulfillment to ensure system integrity.
                    </p>
                    <ol className="text-xs text-gray-600 dark:text-gray-300 space-y-2 bg-gray-50 dark:bg-gray-800/20 p-4 rounded-xl list-decimal list-inside">
                        <li>Share your unique link from the <Link href="/dashboard/circle/referrals" className="text-[#052326] dark:text-emerald-400 font-bold hover:underline">Referrals</Link> page.</li>
                        <li>Your friend registers. The status starts as <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold text-[10px]">PENDING</span>.</li>
                        <li>Your friend places their first purchase, and the order is marked delivered.</li>
                        <li>The system updates status to <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold text-[10px]">COMPLETED</span>, crediting you with Points and XP.</li>
                    </ol>
                </div>

                {/* Check-ins & Badges */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Trophy size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">Streaks & Badges</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Claim rewards dynamically through daily interactions on the website and build profile trust.
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-3">
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-650 text-sm">1.</span>
                            <div>
                                <strong>Daily Check-in:</strong> Click the Check-in button on the Circle dashboard once daily. Missing a check-in day resets your streak back to 1.
                            </div>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold text-purple-650 text-sm">2.</span>
                            <div>
                                <strong>Unlock Badges:</strong> Reaching key XP milestones or completing referrals automatically pins achievements on your <Link href="/dashboard/circle/badges" className="text-[#052326] dark:text-emerald-400 font-bold hover:underline">Badges cabinet</Link>.
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center">
                        <BadgeHelp size={16} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                        <p className="text-xs text-gray-500">Common questions about Cureza Circle's new point mechanics.</p>
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                        {
                            q: "What is the difference between XP and Points?",
                            a: "XP (Experience Points) tracks your lifetime activity and determines your loyalty Tier (Silver, Gold, Platinum) and leaderboard rank. It never decreases. Points are the spendable currency you use to buy discount coupons in the Rewards Store."
                        },
                        {
                            q: "Do my points or XP expire?",
                            a: "Neither expire! Both your accumulated XP and your redeemable points stay valid indefinitely."
                        },
                        {
                            q: "Does redeeming a reward reduce my membership tier?",
                            a: "No! Tiers are calculated using your lifetime XP, which is never spent or reduced. Feel free to redeem rewards as soon as you have enough Points without worrying about losing your tier status."
                        },
                        {
                            q: "How often can I check in?",
                            a: "You can check in exactly once per calendar day. Streaks increment if you check in on consecutive days, and reset to 1 if a day is missed."
                        }
                    ].map((faq, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                <ChevronRight size={14} className="text-[#052326] dark:text-emerald-400 shrink-0" /> {faq.q}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
