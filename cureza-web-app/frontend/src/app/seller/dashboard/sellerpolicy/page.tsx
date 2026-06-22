'use client';
import React, { useState } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Percent, 
  Truck, 
  Wallet, 
  AlertTriangle, 
  Scale, 
  Printer, 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  CheckCircle,
  FileCheck,
  Ban
} from 'lucide-react';
import Link from 'next/link';

export default function SellerPolicy() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        {
            id: 'overview',
            title: 'System Overview',
            icon: FileText,
            description: 'Core concepts of the Cureza multi-vendor wellness marketplace ecosystem.',
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                        Cureza operates as a centralized hub for decentralized, premium healthcare and wellness trade. We provide the digital transaction infrastructure, brand presence, practitioner alignment, and security protocols, while verified sellers (vendors) maintain full ownership of inventory, product configurations, pricing models, and order execution.
                    </p>
                    <div className="bg-[#f0f9fa] border-[0.5px] border-[#d2f1f5] rounded-2xl p-6 flex gap-4 items-start">
                        <div className="p-2 bg-white rounded-lg shadow-none text-teal-600 shrink-0 border-black/50 border-[0.5px]">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">Our Core Commitment</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                We bridge the gap between conscious wellness consumers, medical practitioners, and authentic brands. To maintain this premium trust, all participants must comply with our service standards.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'account-setup',
            title: 'Identity & KYC Verification',
            icon: ShieldAlert,
            description: 'Mandatory documentation and verification protocols for operating a seller node.',
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                        Before publishing catalog items or receiving order data, sellers must complete our KYC (Know Your Customer) workflow. This maintains registry safety, prevents fraud, and ensures statutory compliance.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none transition">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Enterprise Documents</span>
                            <ul className="space-y-2 text-xs font-semibold text-gray-700">
                                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> GSTIN Certification</li>
                                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> Permanent Account Number (PAN)</li>
                                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> Ayush or Drug License (If selling Medicines)</li>
                                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> FSSAI License (If selling Food/Supplements)</li>
                            </ul>
                        </div>
                        <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none transition">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Financial Ingestion</span>
                            <ul className="space-y-2 text-xs font-semibold text-gray-700">
                                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> Cancelled Cheque / Passbook Copy</li>
                                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> Valid Bank IFSC & Branch Code</li>
                                <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> Authorized Signatory Aadhaar</li>
                            </ul>
                        </div>
                    </div>
                    <div className="bg-amber-50 border-[0.5px] border-black/50 rounded-2xl p-6 flex gap-4 items-start">
                        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-900 mb-1">KYC Timelines</h4>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                Review of submitted details takes between 24-48 business hours. Any mismatch in bank account names or PAN details will trigger an automatic document rejection.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'fees',
            title: 'Commission & Deductibles',
            icon: Percent,
            description: 'Platform commission policies, payment gateway fees, and dynamic deductions.',
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                        Cureza runs a clear, transparent revenue model. In exchange for the store presence, marketing integrations, hosting, and practitioner referral networks, a commission is deducted from the gross transaction value.
                    </p>
                    <div className="bg-white border-[0.5px] border-black/50 rounded-2xl overflow-hidden shadow-none">
                        <div className="overflow-x-auto">
                            <div className="min-w-[600px]">
                                <div className="grid grid-cols-3 bg-gray-50 p-4 text-xs font-extrabold text-gray-500 uppercase border-b-[0.5px] border-black/50">
                                    <div>Fee Category</div>
                                    <div>Standard Charge</div>
                                    <div>Deduction Timing</div>
                                </div>
                                <div className="divide-y divide-gray-150 text-xs font-bold text-gray-700">
                                    <div className="grid grid-cols-3 p-4">
                                        <div className="font-extrabold text-gray-900">Platform Commission</div>
                                        <div>8% - 15% (Depends on Category)</div>
                                        <div className="text-gray-500">Auto-deducted at Settlement</div>
                                    </div>
                                    <div className="grid grid-cols-3 p-4">
                                        <div className="font-extrabold text-gray-900">Payment Gateway Fee</div>
                                        <div>2% (Standard Gateway Cost)</div>
                                        <div className="text-gray-500">Per Successful Transaction</div>
                                    </div>
                                    <div className="grid grid-cols-3 p-4">
                                        <div className="font-extrabold text-gray-900">Referral Incentive</div>
                                        <div>Configurable by Seller (Optional)</div>
                                        <div className="text-gray-500">On Practitioner Recommended Sales</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'shipping',
            title: 'Logistics & Shipping SLA',
            icon: Truck,
            description: 'Fulfillment guidelines, packaging requirements, and service levels (SLAs).',
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                        Sellers must maintain high operational efficiency to satisfy customer expectations. Delays in shipment negatively affect search rankings and platform ratings.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none text-center">
                            <span className="text-2xl block mb-2">⏳</span>
                            <h5 className="text-xs font-extrabold text-gray-900 uppercase mb-1">48-Hour dispatch</h5>
                            <p className="text-[11px] text-gray-500 leading-relaxed">Orders must be handed over to courier partners within 48 hours of approval.</p>
                        </div>
                        <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none text-center">
                            <span className="text-2xl block mb-2">📦</span>
                            <h5 className="text-xs font-extrabold text-gray-900 uppercase mb-1">Secure Packaging</h5>
                            <p className="text-[11px] text-gray-500 leading-relaxed">Use proper protective layers. Product damage due to poor packaging is the seller's liability.</p>
                        </div>
                        <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none text-center">
                            <span className="text-2xl block mb-2">🔗</span>
                            <h5 className="text-xs font-extrabold text-gray-900 uppercase mb-1">Tracking Sync</h5>
                            <p className="text-[11px] text-gray-500 leading-relaxed">Tracking IDs must be synced back instantly to activate the customer dispatch alert.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'payouts',
            title: 'Settlement & Digital Wallet',
            icon: Wallet,
            description: 'Settlement cycles, payout timelines, and wallet mechanics.',
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                        Cureza runs a convenient wallet settlement schedule. Once an order is marked as "Delivered" and the customer's return window (standard 7 days) expires, the payout is calculated and credited to the seller's wallet.
                    </p>
                    <div className="p-6 bg-emerald-50/50 border-[0.5px] border-black/50 rounded-2xl flex gap-4 items-start">
                        <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-emerald-950 mb-1">Payout Cycle: T+3 Days</h4>
                            <p className="text-xs text-emerald-800 leading-relaxed">
                                Wallet balances can be withdrawn directly to the verified bank account. Standard manual withdrawals are processed within T+3 business days of the request.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'termination',
            title: 'Suspension & Dispute Logic',
            icon: Scale,
            description: 'Code of conduct, policy violation penalties, and jurisdiction details.',
            content: (
                <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                        We expect all sellers to run their shops with absolute honesty. Selling counterfeit items, false marketing, or intentionally dispatching expired wellness products will result in immediate suspension.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                            <div className="flex items-center gap-2 mb-3 text-rose-700">
                                <Ban size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Zero Tolerance Offenses</span>
                            </div>
                            <ul className="space-y-2 text-xs font-bold text-gray-600">
                                <li>• Listing fake or misbranded wellness products</li>
                                <li>• Sourcing product outside clean GMP facilities</li>
                                <li>• Bypassing Cureza gateway to complete transactions</li>
                            </ul>
                        </div>
                        <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                            <div className="flex items-center gap-2 mb-3 text-gray-700">
                                <FileCheck size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Dispute Jurisdiction</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                All conflicts, claims, or regulatory disagreements are subject to binding legal arbitration under the Jaipur (Rajasthan, India) court jurisdiction.
                            </p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const filteredSections = sections.filter(sec => 
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full">
            <div className="w-full">
                {/* Header Section */}
                <div className="bg-white rounded-3xl border-[0.5px] border-black/50 p-6 md:p-10 shadow-none mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border-[0.5px] border-black/50 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                                Legal & Operations Core
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                Seller Policy & Accord
                            </h1>
                            <p className="text-gray-500 text-sm mt-2 max-w-2xl">
                                Detailed operating standards, fee structures, and fulfillment guidelines required to sell on the Cureza wellness marketplace.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => window.print()} 
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border-[0.5px] border-black/50 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-none transition flex items-center justify-center gap-1.5"
                            >
                                <Printer size={14} /> Print Rules
                            </button>
                            <Link 
                                href="/seller/dashboard" 
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-none transition flex items-center justify-center gap-1.5 text-center border-black/50 border-[0.5px]"
                            >
                                <ArrowLeft size={14} /> Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t-[0.5px] border-black/50">
                        <div className="p-4 bg-gray-50/50 rounded-2xl border-[0.5px] border-black/50 text-center">
                            <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Standard SLA</span>
                            <span className="text-base font-extrabold text-gray-900">48 Hours</span>
                        </div>
                        <div className="p-4 bg-gray-50/50 rounded-2xl border-[0.5px] border-black/50 text-center">
                            <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Settlement Cycle</span>
                            <span className="text-base font-extrabold text-gray-900">T+3 Days</span>
                        </div>
                        <div className="p-4 bg-gray-50/50 rounded-2xl border-[0.5px] border-black/50 text-center">
                            <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Platform Commission</span>
                            <span className="text-base font-extrabold text-gray-900">8% - 15%</span>
                        </div>
                        <div className="p-4 bg-gray-50/50 rounded-2xl border-[0.5px] border-black/50 text-center">
                            <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Jurisdiction</span>
                            <span className="text-base font-extrabold text-gray-900">Jaipur, IN</span>
                        </div>
                    </div>
                </div>

                {/* Search & Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar Menu */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Search Box */}
                        <div className="bg-white rounded-2xl border-[0.5px] border-black/50 p-4 shadow-none order-1 lg:order-none">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Search Policy</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 bg-gray-50 border-[0.5px] border-black/50 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                                />
                                <Search size={14} className="text-gray-400 absolute left-2.5 top-3" />
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-white rounded-2xl border-[0.5px] border-black/50 p-4 shadow-none order-2 lg:order-none">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Policy Sections</label>
                            <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-0 lg:space-y-1.5 pb-2 lg:pb-0 scrollbar-none">
                                {sections.map((sec) => {
                                    const Icon = sec.icon;
                                    return (
                                        <button
                                            key={sec.id}
                                            onClick={() => {
                                                setActiveSection(sec.id);
                                                const element = document.getElementById(sec.id);
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                }
                                            }}
                                            className={`shrink-0 flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left border-[0.5px] ${
                                                activeSection === sec.id 
                                                ? 'bg-teal-600 border-black/50 text-white shadow-none shadow-teal-100 border-[0.5px]' 
                                                : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span>{sec.title}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Need Help Box */}
                        <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-none relative overflow-hidden order-3 lg:order-none border-black/50 border-[0.5px]">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-400 mb-2">Need Compliance Help?</h4>
                            <p className="text-[11px] text-gray-300 leading-relaxed mb-4">
                                Have questions about drug licenses, tax filing, or custom commissions? Contact our seller onboarding desk.
                            </p>
                            <a 
                                href="mailto:onboarding@cureza.in" 
                                className="block text-center py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-none border-black/50 border-[0.5px]"
                            >
                                Contact Onboarding
                            </a>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-8">
                        {filteredSections.length === 0 ? (
                            <div className="bg-white rounded-3xl border-[0.5px] border-black/50 p-12 text-center text-gray-500">
                                <HelpCircle size={40} className="mx-auto text-gray-300 mb-3" />
                                <h4 className="text-sm font-bold text-gray-800">No policy sections match your search</h4>
                                <p className="text-xs text-gray-400 mt-1">Try searching for generic terms like "KYC", "commission", or "SLA".</p>
                            </div>
                        ) : (
                            filteredSections.map((sec) => {
                                const Icon = sec.icon;
                                return (
                                    <section 
                                        key={sec.id} 
                                        id={sec.id}
                                        className={`bg-white rounded-3xl border-[0.5px] transition-all p-6 md:p-8 shadow-none scroll-mt-6 ${
                                            activeSection === sec.id ? 'border-black/50 ring-2 ring-teal-500/5' : 'border-black/50'
                                        }`}
                                        onMouseEnter={() => setActiveSection(sec.id)}
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`p-3 rounded-2xl shrink-0 ${
                                                activeSection === sec.id ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{sec.title}</h2>
                                                <p className="text-xs text-gray-400 font-medium mt-0.5">{sec.description}</p>
                                            </div>
                                        </div>
                                        <div className="border-t-[0.5px] border-black/50 pt-6 mt-6">
                                            {sec.content}
                                        </div>
                                    </section>
                                );
                            })
                        )}

                        {/* Agreement Footer */}
                        <div className="bg-gray-100/50 rounded-2xl p-6 border-[0.5px] border-black/50 text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                © {new Date().getFullYear()} Cureza Health Marketplace • All Policies Synced Programmatically
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
