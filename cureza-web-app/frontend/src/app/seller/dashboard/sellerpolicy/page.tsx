'use client';
import React from 'react';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';

/**
 * PolicyPage
 * - Generic policy / terms page for Cureza
 * - Tailwind CSS based
 */
export function PolicyPage() {
    return (
        <div className="container mx-auto max-w-5xl py-12">
            <div className="premium-card p-12 bg-white/80 backdrop-blur-xl">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-cureza-green animate-pulse"></span>
                        Regulatory Protocol
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Cureza Terms & Policies</h1>
                    <p className="mt-6 text-gray-500 text-base font-medium max-w-2xl mx-auto leading-relaxed">
                        Comprehensive legal framework governing the interaction between vendors, customers, and the Cureza marketplace architecture.
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                        <span>INIT: OCT 2019</span>
                        <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                        <span>SYNCED: JUN 2024</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    <nav className="lg:col-span-1 border-r border-gray-50 pr-8">
                        <h3 className="text-[10px] font-extrabold text-gray-900 uppercase tracking-widest mb-6">Logical Registry</h3>
                        <ul className="space-y-4 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                            <li><a href="#terms-of-use" className="hover:text-cureza-green transition-all block py-1">Terms of Use</a></li>
                            <li><a href="#privacy" className="hover:text-cureza-green transition-all block py-1">Privacy Logic</a></li>
                            <li><a href="#returns" className="hover:text-cureza-green transition-all block py-1">Refund Protocol</a></li>
                            <li><a href="#seller-agreement" className="hover:text-cureza-green transition-all block py-1">Seller Accord</a></li>
                            <li><a href="#shipping" className="hover:text-cureza-green transition-all block py-1">Logistics</a></li>
                        </ul>
                    </nav>

                    <article className="lg:col-span-3 space-y-16">
                        <section id="terms-of-use" className="scroll-mt-24">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">01. Terms of Use</h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                By engaging with the Cureza Interface ("Platform"), you acknowledge and consent to the operational protocols defined herein, including our Privacy encryption and auxiliary usage rules.
                            </p>
                            <div className="mt-8 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Core Principles</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cureza-green mt-1.5"></div>
                                        <p className="text-sm font-bold text-gray-800">Cureza functions as a distributed multi-vendor marketplace.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cureza-green mt-1.5"></div>
                                        <p className="text-sm font-bold text-gray-800">Operational fulfillment rests with individual verified entities.</p>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section id="privacy" className="scroll-mt-24">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">02. Privacy & Data Logic</h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                We implement hardware-grade security for PII (Personally Identifiable Information). Data ingestion is restricted to essential commerce operations and support vectors.
                            </p>
                        </section>

                        <section id="returns" className="scroll-mt-24">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">03. Refund & Recovery</h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                Recovery windows (7–14 days) are programmatically enforced per vendor node. Financial restoration proceeds within 3-7 cycles post-inspection.
                            </p>
                        </section>
                    </article>
                </div>

                <div className="mt-20 pt-8 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} CUREZA CORE</span>
                    <a href="mailto:support@cureza.in" className="text-[10px] font-extrabold text-gray-900 uppercase tracking-widest hover:text-cureza-green transition-all">Registry Contact</a>
                </div>
            </div>
        </div>
    );
}

/**
 * SellerPolicy
 * - Full Marketplace Seller Agreement page for Cureza (adapted from provided draft)
 * - Accessible, sectioned, printable-ready
 *
 * Default export kept to match your earlier file name expectation.
 */
export default function SellerPolicy() {
    return (
        <div className="container mx-auto max-w-6xl py-12">
            <div className="premium-card p-12 lg:p-20 bg-white">
                <header className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
                                MARKETPLACE <br />
                                <span className="text-cureza-green">SELLER ACCORD</span>
                            </h1>
                            <nav className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
                                <Link href="/seller/dashboard" className="hover:text-gray-900 transition-colors">OS</Link>
                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                <span className="text-gray-900">LEGAL_CORE</span>
                            </nav>
                        </div>
                        <div className="text-right">
                            <div className="inline-block p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
                                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">VERSION_TAG</span>
                                <span className="block text-sm font-black text-gray-900">v24.06.SYNC</span>
                            </div>
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">STAMPED: 20 JUN 2024</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Sticky TOC */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-24 space-y-10">
                            <div>
                                <h3 className="text-[10px] font-extrabold text-gray-900 uppercase tracking-widest mb-6 px-1">Logical Clusters</h3>
                                <ul className="space-y-3">
                                    {['overview', 'account-setup', 'fees', 'shipping', 'payouts', 'termination'].map(id => (
                                        <li key={id}>
                                            <a
                                                href={`#${id}`}
                                                className="block py-2 px-4 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                                            >
                                                {id.replace('-', ' ')}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6 bg-gray-900 text-white rounded-3xl shadow-2xl">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Support Liaison</p>
                                <p className="text-xs font-bold leading-relaxed">Questions regarding compliance?</p>
                                <a href="mailto:help@cureza.in" className="mt-4 block text-center py-3 bg-cureza-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Contact Intelligence</a>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-9 space-y-24">
                        <p className="text-xl font-medium text-gray-500 leading-relaxed italic border-l-4 border-cureza-green pl-8">
                            This agreement facilitates the interaction between independent verified vendors and the Cureza commerce engine. Engagement implies full synchronization with the protocols defined below.
                        </p>

                        <section id="overview" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-6xl font-black text-gray-100 leading-none">01</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed font-medium text-lg">
                                Cureza operates as a centralized hub for decentralized trade. We provide the logic and infrastructure; vendors maintain ownership of inventory, pricing models, and logistical fulfillment.
                            </p>
                        </section>

                        <section id="account-setup" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-6xl font-black text-gray-100 leading-none">02</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Identity Verification</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed font-medium text-lg mb-8">
                                Onboarding requires a multi-stage validation process including Aadhaar registry, bank authentication, and enterprise documentation.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="text-[10px] font-extrabold text-gray-900 uppercase tracking-widest mb-4">Mandatory Inputs</h4>
                                    <ul className="space-y-3 text-sm font-bold text-gray-600">
                                        <li className="flex gap-3"><div className="w-1 h-1 rounded-full bg-cureza-green mt-2"></div> Fiscal Identity (PAN/GST)</li>
                                        <li className="flex gap-3"><div className="w-1 h-1 rounded-full bg-cureza-green mt-2"></div> Verified Banking Channel</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section id="fees" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-6xl font-black text-gray-100 leading-none">03</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Marketplace Deductibles</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed font-medium text-lg">
                                Commissions are programmatically deducted from gross settlement amounts. Rates are dynamic and determined by category logic and seller performance tiers.
                            </p>
                        </section>

                        <section id="shipping" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-6xl font-black text-gray-100 leading-none">04</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Logistics & Fullfilment</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed font-medium text-lg mb-8">
                                Vendors must initiate logistics within 48 hours of order confirmation. Compliance with delivery timelines is critical for maintaining node health and performance ratings.
                            </p>
                            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                                <ul className="space-y-3 text-sm font-bold text-gray-600">
                                    <li className="flex gap-3"><div className="w-1 h-1 rounded-full bg-cureza-green mt-2"></div> Precision tracking data required.</li>
                                    <li className="flex gap-3"><div className="w-1 h-1 rounded-full bg-cureza-green mt-2"></div> Vendor retains risk until delivery confirmation.</li>
                                </ul>
                            </div>
                        </section>

                        <section id="payouts" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-6xl font-black text-gray-100 leading-none">05</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financial Settlements</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed font-medium text-lg mb-8">
                                Net proceeds are credited to the digital wallet post-verification. Transfers proceed according to the cycle parameters defined in the Finance module.
                            </p>
                            <div className="p-8 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-4">Payout Protocol</p>
                                <p className="text-gray-700 font-medium">Refunds, gateway fees, and platform commissions are auto-deducted prior to final settlement authorization.</p>
                            </div>
                        </section>

                        <section id="termination" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-6xl font-black text-gray-100 leading-none">06</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Disconnection</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed font-medium text-lg mb-8">
                                Either party may initiate connection termination. Cureza reserves the right to suspend nodes for protocol violations, fraud, or sub-par performance metrics.
                            </p>
                        </section>

                        <section id="legal" className="scroll-mt-24">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-6xl font-black text-gray-100 leading-none">07</span>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Dispute Logic</h2>
                            </div>
                            <p className="text-gray-600 leading-relaxed font-medium text-lg">
                                Disagreements are subject to binding arbitration via the Jaipur, Rajasthan jurisdiction. The Marketplace Agreement remains the ultimate authority for operational conflict resolution.
                            </p>
                        </section>

                        <footer className="pt-20 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-8">
                            <div>
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} CUREZA DISTRIBUTED SYSTEMS</p>
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tight mt-1">JAIPUR HQ / RAJASTHAN NODE</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => window.print()} className="px-6 py-3 border border-gray-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-all">Print Record</button>
                                <Link href="/seller/dashboard" className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all">Back to Dashboard</Link>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
