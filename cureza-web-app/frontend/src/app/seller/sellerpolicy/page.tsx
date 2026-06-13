'use client';
import React from 'react';
import { ShieldCheck, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PublicSellerPolicy() {
    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto max-w-5xl px-6">
                
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/seller" className="inline-flex items-center gap-2 text-[#052326]/70 font-semibold hover:text-[#052326] transition text-sm">
                        <ArrowLeft size={16} />
                        Back to Sell on Cureza
                    </Link>
                </div>

                <div className="bg-white rounded-[14px] border border-[#052326]/12 p-8 md:p-12 shadow-premium-light">
                    <header className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#052326] text-[#F8F3EF] rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F0C417] animate-pulse"></span>
                            Regulatory Accord
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-[#052326] tracking-tight">Marketplace Seller Accord</h1>
                        <p className="mt-6 text-[#052326]/60 text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
                            Comprehensive legal framework governing the interaction between vendors, customers, and the Cureza marketplace architecture.
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-[#052326]/40 font-extrabold uppercase tracking-widest">
                            <span>VERSION: v24.06.SYNC</span>
                            <div className="w-1 h-1 rounded-full bg-[#052326]/12"></div>
                            <span>STAMPED: 20 JUN 2026</span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 border-t border-[#052326]/12 pt-12">
                        {/* Registry Navigation */}
                        <nav className="lg:col-span-1 border-r border-[#052326]/12 pr-8 hidden lg:block">
                            <h3 className="text-[10px] font-bold text-[#052326] uppercase tracking-widest mb-6">Logical Registry</h3>
                            <ul className="space-y-4 text-[10px] text-[#052326]/40 font-extrabold uppercase tracking-widest">
                                <li><a href="#overview" className="hover:text-[#052326] transition-all block py-1">01. Overview</a></li>
                                <li><a href="#account-setup" className="hover:text-[#052326] transition-all block py-1">02. Onboarding</a></li>
                                <li><a href="#fees" className="hover:text-[#052326] transition-all block py-1">03. Deductibles</a></li>
                                <li><a href="#shipping" className="hover:text-[#052326] transition-all block py-1">04. Logistics</a></li>
                                <li><a href="#payouts" className="hover:text-[#052326] transition-all block py-1">05. Payouts</a></li>
                                <li><a href="#termination" className="hover:text-[#052326] transition-all block py-1">06. Termination</a></li>
                                <li><a href="#legal" className="hover:text-[#052326] transition-all block py-1">07. Disputes</a></li>
                            </ul>
                        </nav>

                        {/* Article Content */}
                        <article className="lg:col-span-3 space-y-16 text-sm">
                            
                            <p className="text-base font-light text-[#052326]/70 leading-relaxed italic border-l-4 border-[#052326] pl-6 mb-12">
                                This agreement facilitates the interaction between independent verified vendors and the Cureza commerce engine. Engagement implies full synchronization with the protocols defined below.
                            </p>

                            {/* Section 1 */}
                            <section id="overview" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-extrabold text-[#052326]/10 leading-none">01</span>
                                    <h2 className="text-xl font-bold font-heading text-[#052326] tracking-tight">System Overview</h2>
                                </div>
                                <p className="text-[#052326]/70 leading-relaxed font-light">
                                    Cureza operates as a centralized hub for decentralized trade. We provide the logic and infrastructure; vendors maintain ownership of inventory, pricing models, and logistical fulfillment.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section id="account-setup" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-extrabold text-[#052326]/10 leading-none">02</span>
                                    <h2 className="text-xl font-bold font-heading text-[#052326] tracking-tight">Identity & Onboarding</h2>
                                </div>
                                <p className="text-[#052326]/70 leading-relaxed font-light mb-6">
                                    Onboarding requires a multi-stage validation process including GST registry verification, bank authorization, enterprise documentation, and AYUSH/Cosmetic licenses where applicable.
                                </p>
                                <div className="p-6 bg-[#F8F3EF] rounded-[10px] border border-[#052326]/8">
                                    <h4 className="text-[10px] font-bold text-[#052326] uppercase tracking-widest mb-3">Mandatory Inputs for Approval</h4>
                                    <ul className="space-y-2 text-xs font-semibold text-[#052326]/80">
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Fiscal Identity (PAN/GST)</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Verified Banking Channel</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> AYUSH / GMP / FSSAI Certifications</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section id="fees" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-extrabold text-[#052326]/10 leading-none">03</span>
                                    <h2 className="text-xl font-bold font-heading text-[#052326] tracking-tight">Marketplace Deductibles</h2>
                                </div>
                                <p className="text-[#052326]/70 leading-relaxed font-light">
                                    Commissions are programmatically deducted from gross settlement amounts. Referral fees range from 22% to 27% based on category logic and seller performance tiers. Fixed closing fees and gateway charges (2.50% domestic, 4.4% global) are applied transparently.
                                </p>
                            </section>

                            {/* Section 4 */}
                            <section id="shipping" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-extrabold text-[#052326]/10 leading-none">04</span>
                                    <h2 className="text-xl font-bold font-heading text-[#052326] tracking-tight">Logistics & Fulfillment</h2>
                                </div>
                                <p className="text-[#052326]/70 leading-relaxed font-light mb-6">
                                    Vendors must dispatch logistics within 48 hours of order confirmation. Compliance with delivery timelines is critical for maintaining node health and performance ratings.
                                </p>
                                <div className="p-6 bg-white rounded-[10px] border border-[#052326]/12">
                                    <ul className="space-y-2 text-xs font-semibold text-[#052326]/70">
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Precision tracking data is required.</li>
                                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#052326] shrink-0"></div> Vendor retains fulfillment risk until delivery confirmation.</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section id="payouts" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-extrabold text-[#052326]/10 leading-none">05</span>
                                    <h2 className="text-xl font-bold font-heading text-[#052326] tracking-tight">Financial Settlements</h2>
                                </div>
                                <p className="text-[#052326]/70 leading-relaxed font-light mb-6">
                                    Net proceeds are credited to the seller's registered bank account weekly. Transfers proceed according to the cycle parameters defined in the Finance module.
                                </p>
                                <div className="p-6 bg-[#F8F3EF]/60 rounded-[10px] border border-[#052326]/8">
                                    <p className="text-xs font-bold text-[#052326] uppercase tracking-widest mb-2">Payout Protocol</p>
                                    <p className="text-[#052326]/70 text-xs font-light">Refunds, gateway fees, and platform commissions are auto-deducted prior to final settlement authorization.</p>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section id="termination" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-extrabold text-[#052326]/10 leading-none">06</span>
                                    <h2 className="text-xl font-bold font-heading text-[#052326] tracking-tight">System Disconnection</h2>
                                </div>
                                <p className="text-[#052326]/70 leading-relaxed font-light">
                                    Either party may initiate connection termination. Cureza reserves the right to suspend vendor nodes for protocol violations, fraud, or sub-par customer rating metrics.
                                </p>
                            </section>

                            {/* Section 7 */}
                            <section id="legal" className="scroll-mt-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-extrabold text-[#052326]/10 leading-none">07</span>
                                    <h2 className="text-xl font-bold font-heading text-[#052326] tracking-tight">Dispute Resolution</h2>
                                </div>
                                <p className="text-[#052326]/70 leading-relaxed font-light">
                                    Disagreements are subject to binding arbitration via the Jaipur, Rajasthan jurisdiction. The Marketplace Agreement remains the ultimate authority for operational conflict resolution.
                                </p>
                            </section>

                        </article>
                    </div>

                    <footer className="mt-20 pt-8 border-t border-[#052326]/12 flex flex-col sm:flex-row justify-between items-center gap-8">
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-widest">© {new Date().getFullYear()} CUREZA DISTRIBUTED SYSTEMS</p>
                            <p className="text-[9px] font-semibold text-[#052326]/30 uppercase tracking-tight mt-1">JAIPUR HQ / RAJASTHAN NODE</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => window.print()} className="px-6 py-2.5 border border-[#052326]/12 rounded-[10px] text-[10px] font-bold uppercase tracking-widest text-[#052326] hover:bg-[#F8F3EF] transition-all">Print Agreement</button>
                            <Link href="/seller/register" className="px-6 py-2.5 bg-[#052326] text-[#F8F3EF] rounded-[10px] text-[10px] font-bold uppercase tracking-widest hover:bg-[#052326]/90 shadow transition-all">Register Now</Link>
                        </div>
                    </footer>
                </div>

            </div>
        </div>
    );
}
