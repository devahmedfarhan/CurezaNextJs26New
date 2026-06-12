'use client';
import React from 'react';
import { ShieldCheck, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PublicSellerPolicy() {
    return (
        <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen py-16 font-sans">
            <div className="container mx-auto max-w-5xl px-6">
                
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/seller" className="inline-flex items-center gap-2 text-emerald-800 font-semibold hover:text-emerald-950 transition">
                        <ArrowLeft size={16} />
                        Back to Sell on Cureza
                    </Link>
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-emerald-100/50 p-10 lg:p-16">
                    <header className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-900 text-white rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-cureza-green animate-pulse"></span>
                            Regulatory Accord
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Marketplace Seller Accord</h1>
                        <p className="mt-6 text-gray-500 text-base font-medium max-w-2xl mx-auto leading-relaxed">
                            Comprehensive legal framework governing the interaction between vendors, customers, and the Cureza marketplace architecture.
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                            <span>VERSION: v24.06.SYNC</span>
                            <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                            <span>STAMPED: 20 JUN 2024</span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 border-t border-gray-100 pt-12">
                        {/* Registry Navigation */}
                        <nav className="lg:col-span-1 border-r border-gray-100 pr-8 hidden lg:block">
                            <h3 className="text-[10px] font-extrabold text-gray-900 uppercase tracking-widest mb-6">Logical Registry</h3>
                            <ul className="space-y-4 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                                <li><a href="#overview" className="hover:text-cureza-green transition-all block py-1">01. Overview</a></li>
                                <li><a href="#account-setup" className="hover:text-cureza-green transition-all block py-1">02. Onboarding</a></li>
                                <li><a href="#fees" className="hover:text-cureza-green transition-all block py-1">03. Deductibles</a></li>
                                <li><a href="#shipping" className="hover:text-cureza-green transition-all block py-1">04. Logistics</a></li>
                                <li><a href="#payouts" className="hover:text-cureza-green transition-all block py-1">05. Payouts</a></li>
                                <li><a href="#termination" className="hover:text-cureza-green transition-all block py-1">06. Termination</a></li>
                                <li><a href="#legal" className="hover:text-cureza-green transition-all block py-1">07. Disputes</a></li>
                            </ul>
                        </nav>

                        {/* Article Content */}
                        <article className="lg:col-span-3 space-y-16">
                            
                            <p className="text-lg font-medium text-gray-600 leading-relaxed italic border-l-4 border-cureza-green pl-6 mb-12">
                                This agreement facilitates the interaction between independent verified vendors and the Cureza commerce engine. Engagement implies full synchronization with the protocols defined below.
                            </p>

                            {/* Section 1 */}
                            <section id="overview" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-black text-emerald-100 leading-none">01</span>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Overview</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Cureza operates as a centralized hub for decentralized trade. We provide the logic and infrastructure; vendors maintain ownership of inventory, pricing models, and logistical fulfillment.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section id="account-setup" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-black text-emerald-100 leading-none">02</span>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Identity & Onboarding</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium mb-6">
                                    Onboarding requires a multi-stage validation process including GST registry verification, bank authorization, enterprise documentation, and AYUSH/Cosmetic licenses where applicable.
                                </p>
                                <div className="p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                                    <h4 className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest mb-3">Mandatory Inputs for Approval</h4>
                                    <ul className="space-y-2 text-sm font-bold text-gray-700">
                                        <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-cureza-green mt-2"></div> Fiscal Identity (PAN/GST)</li>
                                        <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-cureza-green mt-2"></div> Verified Banking Channel</li>
                                        <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-cureza-green mt-2"></div> AYUSH / GMP / FSSAI Certifications</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section id="fees" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-black text-emerald-100 leading-none">03</span>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Marketplace Deductibles</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Commissions are programmatically deducted from gross settlement amounts. Referral fees range from 22% to 27% based on category logic and seller performance tiers. fixed closing fees and gateway charges (2.50% domestic, 4.4% global) are applied transparently.
                                </p>
                            </section>

                            {/* Section 4 */}
                            <section id="shipping" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-black text-emerald-100 leading-none">04</span>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Logistics & Fulfillment</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium mb-6">
                                    Vendors must dispatch logistics within 48 hours of order confirmation. Compliance with delivery timelines is critical for maintaining node health and performance ratings.
                                </p>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                    <ul className="space-y-2 text-sm font-bold text-gray-600">
                                        <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-cureza-green mt-2"></div> Precision tracking data is required.</li>
                                        <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-cureza-green mt-2"></div> Vendor retains fulfillment risk until delivery confirmation.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section id="payouts" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-black text-emerald-100 leading-none">05</span>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Financial Settlements</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium mb-6">
                                    Net proceeds are credited to the seller's registered bank account weekly. Transfers proceed according to the cycle parameters defined in the Finance module.
                                </p>
                                <div className="p-6 bg-emerald-50/40 rounded-2xl border border-emerald-100/50">
                                    <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest mb-2">Payout Protocol</p>
                                    <p className="text-gray-700 text-sm font-medium">Refunds, gateway fees, and platform commissions are auto-deducted prior to final settlement authorization.</p>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section id="termination" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-black text-emerald-100 leading-none">06</span>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Disconnection</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Either party may initiate connection termination. Cureza reserves the right to suspend vendor nodes for protocol violations, fraud, or sub-par customer rating metrics.
                                </p>
                            </section>

                            {/* Section 7 */}
                            <section id="legal" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-black text-emerald-100 leading-none">07</span>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Dispute Resolution</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Disagreements are subject to binding arbitration via the Jaipur, Rajasthan jurisdiction. The Marketplace Agreement remains the ultimate authority for operational conflict resolution.
                                </p>
                            </section>

                        </article>
                    </div>

                    <footer className="mt-20 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-8">
                        <div>
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} CUREZA DISTRIBUTED SYSTEMS</p>
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight mt-1">JAIPUR HQ / RAJASTHAN NODE</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => window.print()} className="px-6 py-3 border border-gray-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-all">Print Agreement</button>
                            <Link href="/seller/register" className="px-8 py-3 bg-emerald-800 text-white rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-950 transition-all">Register Now</Link>
                        </div>
                    </footer>
                </div>

            </div>
        </div>
    );
}
