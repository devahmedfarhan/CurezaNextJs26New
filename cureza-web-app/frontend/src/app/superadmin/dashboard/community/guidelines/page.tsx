'use client';

import React from 'react';
import { BookOpen, ShieldCheck, Database, Award, Settings, Users, Terminal, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminCircleGuidelinesPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#052326]/5 text-[#052326] text-xs font-bold uppercase tracking-wider mb-2">
                    <ShieldCheck size={12} /> Superadmin Manual
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cureza Circle Admin Guide</h1>
                <p className="text-gray-500 text-sm md:text-base">
                    Reference manual for configuring XP rules, processing user redemptions, managing achievements, and running CLI tools.
                </p>
            </div>

            {/* Core Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* XP Earning Rules */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Settings size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-base">XP Earning Rules Configuration</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Administrators can dynamically change global earning coefficients directly from the <Link href="/superadmin/dashboard/community" className="text-[#052326] font-bold hover:underline">Community Overview</Link> page. These values are saved to the `system_settings` database table.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl list-disc list-inside">
                        <li><strong>xp_per_100_spent:</strong> XP points awarded per ₹100 cart checkout value.</li>
                        <li><strong>xp_per_review:</strong> Points awarded for basic text reviews.</li>
                        <li><strong>xp_per_photo_upload:</strong> Points awarded for writing reviews with photo uploads.</li>
                        <li><strong>xp_per_referral:</strong> Bonus awarded to the referrer on referee first complete order.</li>
                    </ul>
                </div>

                {/* Referral Tracking */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-base">Referral Pipeline Triggers</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        The referral flow is handled securely on the backend by the `GamificationService` to prevent exploits:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-2 bg-gray-50 p-4 rounded-xl list-decimal list-inside">
                        <li>Referee registers with a referrer's code, creating a `pending` status.</li>
                        <li>Referee places their first order (status starts as `pending`).</li>
                        <li>When order status shifts to `completed`, `GamificationService::completeReferral` is invoked.</li>
                        <li>Referral changes to `completed`, crediting the welcome bonus to referee (200 XP) and referral bonus to referrer (1000 XP).</li>
                    </ul>
                </div>
            </div>

            {/* Database Tables Reference */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                        <Database size={16} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Database Tables Schema</h2>
                        <p className="text-xs text-gray-500">Core database tables tracking Cureza Circle states.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold uppercase">
                                <th className="p-3">Table Name</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Key Columns</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="p-3 font-mono font-bold text-gray-800">badges</td>
                                <td className="p-3">Definitions of unlockable achievements</td>
                                <td className="p-3">`rule_type`, `rule_value`, `is_active`</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-gray-800">user_badges</td>
                                <td className="p-3">Pivot table linking users to unlocked badges</td>
                                <td className="p-3">`user_id`, `badge_id`, `unlocked_at`</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-gray-800">rewards</td>
                                <td className="p-3">Catalog items for the Loyalty Rewards Shop</td>
                                <td className="p-3">`points_cost`, `type` (coupon/physical/digital), `stock`</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-gray-800">reward_redemptions</td>
                                <td className="p-3">Tracks points redemptions and shipping statuses</td>
                                <td className="p-3">`user_id`, `reward_id`, `points_spent`, `status`</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-gray-800">referrals</td>
                                <td className="p-3">Logs referrals chains and rewards payouts</td>
                                <td className="p-3">`referrer_id`, `referred_user_id`, `status` (pending/completed)</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-mono font-bold text-gray-800">wallets</td>
                                <td className="p-3">User reward points balance (stores available XP)</td>
                                <td className="p-3">`points`, `balance` (cash wallet value)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Developer CLI Guide */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Terminal size={16} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Developer CLI & Testing</h2>
                        <p className="text-xs text-gray-500">Run database seeds, rebuild, and check system tests in local env.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">1. Run Seeders</h4>
                        <p className="text-xs text-gray-500">Populate default badges, challenges, rewards catalog, and rules coefficients:</p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto font-mono select-all">
                            php artisan db:seed --class=CommunitySeeder
                        </pre>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">2. Run Backend Feature Tests</h4>
                        <p className="text-xs text-gray-500">Verify Gamification service, API status code rules, and coupon redemptions flow:</p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto font-mono select-all">
                            php artisan test --filter=GamificationTest
                        </pre>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">3. Check Frontend Type Consistency</h4>
                        <p className="text-xs text-gray-500">Run Next.js code checks to ensure code aligns with TS schema validations:</p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto font-mono select-all">
                            npx tsc --noEmit
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
