import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cureza Circle - Loyalty Rewards, Community & Gamification',
    description: 'Join Cureza Circle and earn XP, unlock tiers, collect badges, and redeem exclusive wellness rewards. Connect with customers, influencers, sellers, and doctors in India\'s wellness community.',
};

/**
 * CurezaCircle.jsx
 * Beautiful Cureza Circle application page — copy/paste into your project
 * Tailwind CSS required (v2+/JIT recommended)
 */

const earnRules = [
    { action: "Purchase", xp: 100, points: "10 pts / ₹100" },
    { action: "Write Review", xp: 50, points: 20 },
    { action: "UGC Photo Upload", xp: 100, points: 40 },
    { action: "Friend Referral", xp: 200, points: 100 },
    { action: "Prescription Upload", xp: 150, points: "—" },
    { action: "Live Event Join", xp: 250, points: 50 },
    { action: "Daily Login Streak", xp: 20, points: "—" },
];

const tiers = [
    { name: "Explorer", range: "0–499 XP", perks: ["Basic access", "Welcome bonus"] },
    { name: "Creator", range: "500–1,999 XP", perks: ["Extra discounts", "Event invites"] },
    { name: "Ambassador", range: "2,000–4,999 XP", perks: ["Higher cashback", "Influencer perks"] },
    { name: "Partner", range: "5,000+ XP", perks: ["Paid collaborations", "Commissions"] },
];

const rewards = [
    { title: "10% Discount", subtitle: "On wellness & supplements", cost: "500 pts" },
    { title: "Free Sample Pack", subtitle: "Mini wellness kit", cost: "300 pts" },
    { title: "Cureza T-shirt", subtitle: "Limited edition merch", cost: "1500 pts" },
    { title: "Event Pass", subtitle: "Local meetup / workshop", cost: "1000 pts" },
    { title: "Doctor Consultation", subtitle: "15-min online", cost: "2000 pts" },
    { title: "Seller Coupon", subtitle: "Extra 5% off (vendor)", cost: "800 pts" },
];

const badges = [
    "Top Influencer",
    "Top Reviewer",
    "Wellness Achiever",
    "7-Day Meditator",
    "UGC Star",
    "Event Champion",
];

export default function CurezaCircle() {
    return (
        <div className="min-h-screen bg-slate-50 ">
            <header className="bg-gradient-to-r from-emerald-50 to-white px-4 py-10 mb-8 ">
                <div className="flex flex-col md:flex-row items-start gap-8 md:py-12 md:px-4 w-full container mx-auto  ">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-2xl font-bold text-emerald-800 leading-tight">
                            Cureza Circle — Loyalty • Community • Gamification • Rewards
                        </h1>
                        <p className="mt-4 text-gray-700 text-md max-w-2xl">
                            Cureza Circle is the heart of the Cureza Marketplace — a reward-driven community that connects customers,
                            influencers, sellers and doctors. Earn XP, collect points, unlock tiers, join events and redeem rewards.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href="#join"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg "
                            >
                                Join Cureza Circle
                            </a>
                            <a
                                href="#rewards"
                                className="inline-flex items-center gap-2 px-5 py-3 border border-emerald-200 rounded-lg text-emerald-700 hover:bg-emerald-50"
                            >
                                View Rewards
                            </a>
                        </div>
                    </div>

                    <div className="w-full md:w-96 bg-white rounded-lg p-6 p-4 border rounded-lg">
                        <div className="text-sm text-gray-500">Your Circle Snapshot</div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-500">Tier</div>
                                    <div className="text-lg font-semibold">Explorer</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">XP</div>
                                    <div className="text-lg font-semibold">120 XP</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-emerald-500 h-3 rounded-full" style={{ width: "24%" }} />
                                </div>
                                <div className="mt-2 text-xs text-gray-500">24% to Creator</div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <div className="bg-emerald-50 p-3 rounded">
                                    <div className="text-sm text-gray-500">Points</div>
                                    <div className="font-semibold">320</div>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded">
                                    <div className="text-sm text-gray-500">Badges</div>
                                    <div className="font-semibold">1</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mx-auto py-2 px-4">
                {/* HERO */}


                {/* PURPOSE & BENEFITS */}
                <section className="grid md:grid-cols-3 gap-6 mb-10 ">
                    <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Purpose</h3>
                        <p className="text-gray-600 mt-2">Create retention, community, and a powerful referral engine with gamification at its core.</p>
                        <ul className="mt-3 text-sm text-gray-600 space-y-1">
                            <li>• Retention via XP & tiers</li>
                            <li>• Community for UGC & events</li>
                            <li>• Organic marketing via referrals</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">How it helps Cureza</h3>
                        <ul className="mt-2 text-gray-600 space-y-1">
                            <li>✔ Increases retention</li>
                            <li>✔ Lowers CAC via referrals</li>
                            <li>✔ Boosts repeat purchases</li>
                            <li>✔ Creates brand love</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Who joins</h3>
                        <p className="text-gray-600 mt-2">Customers, influencers, sellers, doctors — everyone becomes Cureza Family.</p>
                        <div className="mt-3 text-sm text-gray-600">Badges, leaderboards, events and real rewards keep them engaged.</div>
                    </div>
                </section>

                {/* SYSTEM FLOW */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-emerald-900 mb-4">Cureza Circle — Full System Flow</h2>

                    <ol className="space-y-6">
                        <li className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-700">1</div>
                                <div>
                                    <h4 className="font-semibold">Step 1 — User Joins</h4>
                                    <p className="text-gray-600 mt-1">New accounts start as <strong>Explorer</strong> automatically. Verification or onboarding tasks can grant starter bonuses.</p>
                                </div>
                            </div>
                        </li>

                        <li className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-700">2</div>
                                <div>
                                    <h4 className="font-semibold">Step 2 — Earn XP & Points</h4>
                                    <p className="text-gray-600 mt-1">Every meaningful action in Cureza (purchase, review, UGC, referral) earns XP and/or points.</p>
                                </div>
                            </div>
                        </li>

                        <li className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-700">3</div>
                                <div>
                                    <h4 className="font-semibold">Step 3 — Tier & Perks</h4>
                                    <p className="text-gray-600 mt-1">XP unlocks tiers — each tier unlocks benefits like discounts, priority access and paid collaborations.</p>
                                </div>
                            </div>
                        </li>

                        <li className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-700">4</div>
                                <div>
                                    <h4 className="font-semibold">Step 4 — Rewards & Community</h4>
                                    <p className="text-gray-600 mt-1">Points are redeemed in Rewards Center. Community activities and events keep members active.</p>
                                </div>
                            </div>
                        </li>
                    </ol>
                </section>

                {/* EARN RULES & TIERS */}
                <section className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Earn Rules — XP & Points</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-sm text-gray-600 border-b">
                                        <th className="py-2">Action</th>
                                        <th className="py-2">XP</th>
                                        <th className="py-2">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {earnRules.map((r) => (
                                        <tr key={r.action} className="text-sm text-gray-700">
                                            <td className="py-3">{r.action}</td>
                                            <td className="py-3">{r.xp}</td>
                                            <td className="py-3">{r.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-xs text-gray-500">Note: Points & XP rules are configurable per vendor/product and during promotions.</div>
                    </div>

                    <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Tiers & Benefits</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {tiers.map((t) => (
                                <div key={t.name} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-gray-500">{t.range}</div>
                                            <div className="font-semibold text-emerald-700">{t.name}</div>
                                        </div>
                                        <div className="text-sm text-gray-600">Unlocks perks</div>
                                    </div>
                                    <ul className="mt-3 text-gray-600 list-disc ml-5">
                                        {t.perks.map((p) => (
                                            <li key={p}>{p}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-gray-500">Higher tier = more exclusive events, visibility and monetisation options.</div>
                    </div>
                </section>

                {/* REWARDS CENTER */}
                <section id="rewards" className="mb-10">
                    <h2 className="text-2xl font-bold text-emerald-900 mb-4">Rewards Center — Redeem Your Points</h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rewards.map((r) => (
                            <div key={r.title} className="bg-white rounded-lg p-5 p-4 border rounded-lg flex flex-col justify-between">
                                <div>
                                    <div className="text-sm text-gray-500">{r.subtitle}</div>
                                    <div className="font-semibold text-lg mt-2">{r.title}</div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-xs text-gray-500">Cost</div>
                                    <div className="font-medium">{r.cost}</div>
                                </div>

                                <div className="mt-4">
                                    <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Redeem</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LEADERBOARD & BADGES */}
                <section className="mb-10">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Leaderboard — Top Circle Members</h3>
                            <ol className="mt-4 space-y-3">
                                <li className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-semibold text-emerald-700">A</div>
                                        <div>
                                            <div className="font-medium">Aisha</div>
                                            <div className="text-xs text-gray-500">Ambassador — 4,120 XP</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold">4120 XP</div>
                                </li>

                                <li className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-semibold text-emerald-700">R</div>
                                        <div>
                                            <div className="font-medium">Rahul</div>
                                            <div className="text-xs text-gray-500">Creator — 1,840 XP</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold">1840 XP</div>
                                </li>
                            </ol>

                            <div className="mt-4 text-xs text-gray-500">Leaderboards reset monthly or for special campaigns.</div>
                        </div>

                        <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg">Badges — Earn & Collect</h3>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {badges.map((b) => (
                                    <div key={b} className="p-3 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-sm text-center">
                                        {b}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-sm text-gray-600">Badges are shareable to social and boost discoverability & trust.</div>
                        </div>
                    </div>
                </section>

                {/* COMMUNITY ZONE */}
                <section className="mb-10 bg-white p-6 rounded-lg p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">Community Engagement Zone</h3>
                    <p className="text-gray-600 mt-2">
                        Monthly wellness challenges, UGC campaigns, Doctor AMAs, influencer sessions and city meetups — all discoverable inside Circle.
                    </p>

                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <div className="font-semibold">Monthly Challenge</div>
                            <div className="text-sm text-gray-600 mt-1">Complete 10 wellness tasks — earn bonus 500 XP + badge.</div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <div className="font-semibold">Doctor AMA</div>
                            <div className="text-sm text-gray-600 mt-1">Join live Q&A — earn XP and get discounted consultation vouchers.</div>
                        </div>
                    </div>
                </section>

                {/* REFERRAL & AFFILIATE */}
                <section className="mb-10 grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Referral & Affiliate</h3>
                        <p className="text-gray-600 mt-2">
                            Invite friends — get points when they order. Influencers and Ambassadors can activate affiliate links and earn commissions.
                        </p>

                        <ul className="mt-3 text-sm text-gray-600 list-disc ml-5">
                            <li>Share referral link → friend places order → both earn points</li>
                            <li>Influencers in Ambassador/Partner tier get commission tracking</li>
                            <li>Referral campaigns can have bonus multipliers during launches</li>
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-lg p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Seller & Doctor Benefits</h3>
                        <p className="text-gray-600 mt-2">
                            Doctors earn XP for consultations and high engagement. Sellers earn XP for strong performance metrics (on-time delivery, low cancellations).
                        </p>

                        <ul className="mt-3 text-sm text-gray-600 list-disc ml-5">
                            <li>Top sellers get featured & lower commission windows</li>
                            <li>Top doctors get higher visibility and booking priority</li>
                            <li>Performance gamification encourages quality & reliability</li>
                        </ul>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-emerald-900 mb-4">FAQ</h2>

                    <div className="space-y-3">
                        <details className="bg-white p-4 rounded-lg p-4 border rounded-lg">
                            <summary className="font-medium cursor-pointer">How do I join Cureza Circle?</summary>
                            <div className="mt-2 text-gray-600">Create a Cureza account — you will automatically join as an Explorer. Complete profile tasks for bonuses.</div>
                        </details>

                        <details className="bg-white p-4 rounded-lg p-4 border rounded-lg">
                            <summary className="font-medium cursor-pointer">How do I redeem points?</summary>
                            <div className="mt-2 text-gray-600">Open Rewards Center, choose a reward and click Redeem. Some rewards may require extra verification.</div>
                        </details>

                        <details className="bg-white p-4 rounded-lg p-4 border rounded-lg">
                            <summary className="font-medium cursor-pointer">Do points expire?</summary>
                            <div className="mt-2 text-gray-600">Points can have expiry depending on campaign rules. We notify you before expiry and via the Circle inbox.</div>
                        </details>
                    </div>
                </section>

                {/* CTA FOOTER */}
                <section id="join" className="mb-12">
                    <div className="bg-emerald-800 rounded-2xl p-8 text-white shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold">Ready to join Cureza Circle?</h3>
                                <p className="mt-1 text-emerald-100">Earn XP, climb tiers, collect badges & get real rewards.</p>
                            </div>

                            <div className="flex gap-3">
                                <a href="/signup" className="px-6 py-3 bg-white text-emerald-800 font-semibold rounded-lg">Create Account</a>
                                <a href="/circle" className="px-6 py-3 border border-white rounded-lg text-white">Open Circle Dashboard</a>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Cureza • Built for community-driven growth
                </footer>
            </div>
        </div>
    );
}
