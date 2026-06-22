'use client';

import React from 'react';
import { Database, Settings, Users, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function AdminCircleGuidelinesPage() {
    return (
        <div className="space-y-6 max-w-5xl">
            {/* Core Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* XP Earning Rules */}
                <div className="bg-white border-[0.5px] border-black/50 rounded-[10px] p-5 space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[8px]">
                                <Settings size={16} />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm">XP Earning Rules Configuration</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-normal">
                            Administrators can dynamically change global earning coefficients directly from the <Link href="/superadmin/dashboard/community" className="text-black font-semibold hover:underline">Circle Home</Link> page. These values are saved to the `system_settings` database table.
                        </p>
                        <ul className="text-xs text-gray-600 space-y-2 bg-neutral-50/50 p-3 rounded-[10px] border-[0.5px] border-black/50 list-disc list-inside font-normal">
                            <li><strong>xp_per_100_spent:</strong> XP points awarded per ₹100 cart checkout value.</li>
                            <li><strong>xp_per_review:</strong> Points awarded for basic text reviews.</li>
                            <li><strong>xp_per_photo_upload:</strong> Points awarded for reviews with photo uploads.</li>
                            <li><strong>xp_per_referral:</strong> Bonus awarded to referrer on referee first complete order.</li>
                        </ul>
                    </div>
                </div>

                {/* Referral Tracking */}
                <div className="bg-white border-[0.5px] border-black/50 rounded-[10px] p-5 space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[8px]">
                                <Users size={16} />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm">Referral Pipeline Triggers</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-normal">
                            The referral flow is handled securely on the backend by the `GamificationService` to prevent exploits:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-2 bg-neutral-50/50 p-3 rounded-[10px] border-[0.5px] border-black/50 list-decimal list-inside font-normal">
                            <li>Referee registers with a referrer's code, creating a pending status.</li>
                            <li>Referee places their first order (status starts as pending).</li>
                            <li>When order status shifts to completed, the referral service triggers a points credit.</li>
                            <li>Referral changes to completed, crediting the welcome bonus to referee (200 XP) and referral bonus to referrer (1000 XP).</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Database Tables Reference */}
            <div className="bg-white border-[0.5px] border-black/50 rounded-[10px] p-5 space-y-4">
                <div className="flex items-center gap-3 border-b-[0.5px] border-black/50 pb-3">
                    <div className="w-8 h-8 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[8px] flex items-center justify-center">
                        <Database size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Database Tables Schema</h2>
                        <p className="text-xs text-gray-400 font-normal mt-0.5">Core database tables tracking Cureza Circle states.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 border-collapse">
                        <thead>
                            <tr className="border-b-[0.5px] border-black/50 bg-neutral-50 text-gray-500 font-medium">
                                <th className="p-3">Table Name</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Key Columns</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-[0.5px] divide-neutral-950/10">
                            <tr className="hover:bg-neutral-50/30 transition-colors">
                                <td className="p-3 font-mono font-semibold text-gray-800">badges</td>
                                <td className="p-3 font-normal">Definitions of unlockable achievements</td>
                                <td className="p-3 font-mono text-gray-400">`rule_type`, `rule_value`, `is_active`</td>
                            </tr>
                            <tr className="hover:bg-neutral-50/30 transition-colors">
                                <td className="p-3 font-mono font-semibold text-gray-800">user_badges</td>
                                <td className="p-3 font-normal">Pivot table linking users to unlocked badges</td>
                                <td className="p-3 font-mono text-gray-400">`user_id`, `badge_id`, `unlocked_at`</td>
                            </tr>
                            <tr className="hover:bg-neutral-50/30 transition-colors">
                                <td className="p-3 font-mono font-semibold text-gray-800">rewards</td>
                                <td className="p-3 font-normal">Catalog items for the Loyalty Rewards Shop</td>
                                <td className="p-3 font-mono text-gray-400">`points_cost`, `type` (coupon/physical/digital), `stock`</td>
                            </tr>
                            <tr className="hover:bg-neutral-50/30 transition-colors">
                                <td className="p-3 font-mono font-semibold text-gray-800">reward_redemptions</td>
                                <td className="p-3 font-normal">Tracks points redemptions and shipping statuses</td>
                                <td className="p-3 font-mono text-gray-400">`user_id`, `reward_id`, `points_spent`, `status`</td>
                            </tr>
                            <tr className="hover:bg-neutral-50/30 transition-colors">
                                <td className="p-3 font-mono font-semibold text-gray-800">referrals</td>
                                <td className="p-3 font-normal">Logs referrals chains and rewards payouts</td>
                                <td className="p-3 font-mono text-gray-400">`referrer_id`, `referred_user_id`, `status` (pending/completed)</td>
                            </tr>
                            <tr className="hover:bg-neutral-50/30 transition-colors">
                                <td className="p-3 font-mono font-semibold text-gray-800">wallets</td>
                                <td className="p-3 font-normal">User reward points balance (stores available XP)</td>
                                <td className="p-3 font-mono text-gray-400">`points`, `balance` (cash wallet value)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Developer CLI Guide */}
            <div className="bg-white border-[0.5px] border-black/50 rounded-[10px] p-5 space-y-4">
                <div className="flex items-center gap-3 border-b-[0.5px] border-black/50 pb-3">
                    <div className="w-8 h-8 bg-neutral-50 text-neutral-900 border-[0.5px] border-black/50 rounded-[8px] flex items-center justify-center">
                        <Terminal size={14} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Developer CLI & Testing</h2>
                        <p className="text-xs text-gray-400 font-normal mt-0.5">Run database seeds, rebuild, and check system tests in local env.</p>
                    </div>
                </div>

                <div className="space-y-3.5">
                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-gray-700">1. Run Seeders</h4>
                        <p className="text-[10px] text-gray-450 font-normal">Populate default badges, challenges, rewards catalog, and rules coefficients:</p>
                        <pre className="bg-neutral-950 text-neutral-100 p-3 rounded-[10px] text-xs overflow-x-auto font-mono select-all border-[0.5px] border-black/50">
                            php artisan db:seed --class=CommunitySeeder
                        </pre>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-gray-700">2. Run Backend Feature Tests</h4>
                        <p className="text-[10px] text-gray-450 font-normal">Verify Gamification service, API status code rules, and coupon redemptions flow:</p>
                        <pre className="bg-neutral-950 text-neutral-100 p-3 rounded-[10px] text-xs overflow-x-auto font-mono select-all border-[0.5px] border-black/50">
                            php artisan test --filter=GamificationTest
                        </pre>
                    </div>

                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-gray-700">3. Check Frontend Type Consistency</h4>
                        <p className="text-[10px] text-gray-450 font-normal">Run Next.js code checks to ensure code aligns with TS schema validations:</p>
                        <pre className="bg-neutral-950 text-neutral-100 p-3 rounded-[10px] text-xs overflow-x-auto font-mono select-all border-[0.5px] border-black/50">
                            npx tsc --noEmit
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
