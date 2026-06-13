'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, DollarSign, Truck, Users } from 'lucide-react';
import Link from 'next/link';

export default function PartnerShowcase() {
  const [activeTab, setActiveTab] = useState<'benefits' | 'pricing' | 'eligibility'>('benefits');

  return (
    <section className="w-full py-16 md:py-24 bg-[#F8F3EF] text-[#052326] border-t border-[#052326]/5">
      <div className="container mx-auto px-6">
        
        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT COLUMN: EDITORIAL OVERVIEW */}
          <div className="lg:col-span-5 text-left">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/60 uppercase block mb-3">
              Marketplace Partnership
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
              Grow Your Wellness Brand on Cureza.
            </h2>
            <p className="text-sm md:text-base text-[#052326]/85 font-light mb-8 leading-relaxed">
              Become a verified vendor in India's leading medical wellness ecosystem. List your products under our strict standards, connect with certified healthcare practitioners, and reach conscious consumers.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/seller" 
                className="group w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-[#052326] text-[#F8F3EF] font-semibold text-sm rounded-[12px] hover:bg-[#052326]/90 transition-all shadow-md"
              >
                Learn More
                <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/seller/register" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-transparent border border-[#052326]/20 text-[#052326] hover:bg-[#052326]/5 font-semibold text-sm rounded-[12px] transition-all"
              >
                Register as Seller
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: SHOWCASE CARDS CONTAINER */}
          <div className="lg:col-span-7 bg-white rounded-[14px] border border-[#052326]/10 p-6 md:p-8 shadow-premium-light">
            
            {/* TAB CONTROLS (10-14px border radius buttons) */}
            <div className="flex bg-[#052326]/5 p-1 rounded-[12px] mb-8">
              <button
                onClick={() => setActiveTab('benefits')}
                className={`flex-1 py-2.5 rounded-[10px] text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'benefits' ? 'bg-[#052326] text-[#F8F3EF] shadow' : 'text-[#052326]/75 hover:bg-[#052326]/5'
                }`}
              >
                Seller Benefits
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex-1 py-2.5 rounded-[10px] text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'pricing' ? 'bg-[#052326] text-[#F8F3EF] shadow' : 'text-[#052326]/75 hover:bg-[#052326]/5'
                }`}
              >
                Pricing Structure
              </button>
              <button
                onClick={() => setActiveTab('eligibility')}
                className={`flex-1 py-2.5 rounded-[10px] text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'eligibility' ? 'bg-[#052326] text-[#F8F3EF] shadow' : 'text-[#052326]/75 hover:bg-[#052326]/5'
                }`}
              >
                Eligibility
              </button>
            </div>

            {/* TAB CONTENT: BENEFITS */}
            {activeTab === 'benefits' && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 h-fit rounded-[10px] bg-[#052326]/5 text-[#052326] border border-[#052326]/5">
                    <ShieldCheck className="w-5 h-5 text-[#F0C417]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-1">Zero Listing Fees</h3>
                    <p className="text-xs md:text-sm text-[#052326]/70 font-light leading-relaxed">
                      List unlimited products in our directory without upfront charges. Pay commissions only on actual successful transactions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 h-fit rounded-[10px] bg-[#052326]/5 text-[#052326] border border-[#052326]/5">
                    <Users className="w-5 h-5 text-[#F0C417]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-1">Verified Doctor Referrals</h3>
                    <p className="text-xs md:text-sm text-[#052326]/70 font-light leading-relaxed">
                      Our network of registered wellness doctors recommend certified and approved formulations directly to consultation patients.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="p-3 h-fit rounded-[10px] bg-[#052326]/5 text-[#052326] border border-[#052326]/5">
                    <Truck className="w-5 h-5 text-[#F0C417]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-1">Pan-India Logistics</h3>
                    <p className="text-xs md:text-sm text-[#052326]/70 font-light leading-relaxed">
                      Utilize our fast shipping partner networks covering 26,000+ PIN codes with integrated cash on delivery (COD) handling.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PRICING */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-[#052326]/10 p-5 rounded-[12px] bg-[#F8F3EF]/30 text-center">
                    <span className="text-[9px] font-bold tracking-widest text-[#052326]/50 uppercase block mb-1">Referral Commission</span>
                    <div className="text-3xl font-bold text-[#052326]">22% – 27%</div>
                    <span className="text-[10px] text-[#052326]/60 mt-1 block">Based on category & volume</span>
                  </div>

                  <div className="border border-[#052326]/10 p-5 rounded-[12px] bg-[#F8F3EF]/30 text-center">
                    <span className="text-[9px] font-bold tracking-widest text-[#052326]/50 uppercase block mb-1">Payment Gateway Fee</span>
                    <div className="text-xl font-bold text-[#052326] mt-1.5">2.5% <span className="text-xs text-[#052326]/60 font-medium">Domestic</span></div>
                    <div className="text-sm font-bold text-[#052326]/80">4.4% + $0.3 <span className="text-[10px] text-[#052326]/60 font-medium">Global</span></div>
                  </div>
                </div>

                <div className="border border-[#052326]/10 p-4 rounded-[12px] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F0C417]/10 rounded-md">
                      <DollarSign className="w-4 h-4 text-[#F0C417]" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#052326]">Fixed Closing Fee</span>
                      <p className="text-[10px] text-[#052326]/60 font-light mt-0.5">Calculated by weight & price slabs</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#052326]">Minimal & Fair</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ELIGIBILITY */}
            {activeTab === 'eligibility' && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#052326]/50 uppercase block mb-2">Requirements checklist</span>
                
                {[
                  "Valid GST registration details",
                  "AYUSH, FSSAI, or Cosmetic production license",
                  "Only certified, authentic wellness items (no counterfeits)",
                  "Brand authorization letter (for resellers)",
                  "Active bank account for weekly settlements"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 py-1 border-b border-[#052326]/5 last:border-b-0">
                    <CheckCircle2 className="w-4 h-4 text-[#F0C417] flex-shrink-0" />
                    <span className="text-xs md:text-sm text-[#052326]/80 font-light">{item}</span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
