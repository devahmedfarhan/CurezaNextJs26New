'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import pageData from '@/data/legal-pages/doctor-policy.json';

export default function PublicDoctorPolicy() {
    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto max-w-5xl px-6">
                
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/doctor" className="inline-flex items-center gap-2 text-[#052326]/70 font-semibold hover:text-[#052326] transition text-sm">
                        <ArrowLeft size={16} />
                        Back to Doctor Portal
                    </Link>
                </div>

                <div className="bg-white rounded-[14px] border border-[#052326]/12 p-8 md:p-12 shadow-premium-light">
                    <header className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#052326] text-[#F8F3EF] rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F0C417] animate-pulse"></span>
                            Medical Expert Accord
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold font-heading text-[#052326] tracking-tight">
                            {pageData.title}
                        </h1>
                        <p className="mt-6 text-[#052326]/60 text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
                            {pageData.description}
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-[#052326]/40 font-extrabold uppercase tracking-widest">
                            <span>VERSION: v24.06.SYNC</span>
                            <div className="w-1 h-1 rounded-full bg-[#052326]/12"></div>
                            <span>STAMPED: {new Date(pageData.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 border-t border-[#052326]/12 pt-12">
                        {/* Registry Navigation */}
                        <nav className="lg:col-span-1 border-r border-[#052326]/12 pr-8 hidden lg:block">
                            <h3 className="text-[10px] font-bold text-[#052326] uppercase tracking-widest mb-6">Logical Registry</h3>
                            <ul className="space-y-4 text-[10px] text-[#052326]/40 font-extrabold uppercase tracking-widest">
                                <li><a href="#overview" className="hover:text-[#052326] transition-all block py-1">01. Overview</a></li>
                                <li><a href="#account-setup" className="hover:text-[#052326] transition-all block py-1">02. Verification</a></li>
                                <li><a href="#fees" className="hover:text-[#052326] transition-all block py-1">03. Settlements</a></li>
                                <li><a href="#shipping" className="hover:text-[#052326] transition-all block py-1">04. Prescriptions</a></li>
                                <li><a href="#termination" className="hover:text-[#052326] transition-all block py-1">05. Termination</a></li>
                                <li><a href="#legal" className="hover:text-[#052326] transition-all block py-1">06. Governing Law</a></li>
                            </ul>
                        </nav>

                        {/* Article Content */}
                        <article 
                            className="lg:col-span-3 space-y-16 text-sm dynamic-legal-content"
                            dangerouslySetInnerHTML={{ __html: pageData.content }}
                        />
                    </div>

                    <footer className="mt-20 pt-8 border-t border-[#052326]/12 flex flex-col sm:flex-row justify-between items-center gap-8">
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-bold text-[#052326]/40 uppercase tracking-widest">© {new Date().getFullYear()} CUREZA CLINICAL SYSTEMS</p>
                            <p className="text-[9px] font-semibold text-[#052326]/30 uppercase tracking-tight mt-1">JAIPUR HQ / RAJASTHAN NODE</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => window.print()} className="px-6 py-2.5 border border-[#052326]/12 rounded-[10px] text-[10px] font-bold uppercase tracking-widest text-[#052326] hover:bg-[#F8F3EF] transition-all">Print Protocol</button>
                            <Link href="/doctor/register" className="px-6 py-2.5 bg-[#052326] text-[#F8F3EF] rounded-[10px] text-[10px] font-bold uppercase tracking-widest hover:bg-[#052326]/90 shadow transition-all">Register Now</Link>
                        </div>
                    </footer>
                </div>

            </div>
        </div>
    );
}
