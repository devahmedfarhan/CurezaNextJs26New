'use client';

import { useState } from 'react';
import { Tag, Copy, Check, Gift, Percent, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Coupon {
  id: number;
  code: string;
  discount: string;
  title: string;
  description: string;
  type: string;
  bgGrad: string;
}

const COUPONS: Coupon[] = [
  {
    id: 1,
    code: 'CUREZA10',
    discount: '10% OFF',
    title: 'Welcome Discount',
    description: 'Get 10% off on your first order above ₹999. Code applicable sitewide.',
    type: 'First Order',
    bgGrad: 'from-emerald-800 via-teal-900 to-[#052326]',
  },
  {
    id: 2,
    code: 'CBDREST',
    discount: '₹250 OFF',
    title: 'Hemp Rest & Sleep',
    description: 'Save flat ₹250 on premium VCCBD oils and sleep tinctures.',
    type: 'CBD Exclusive',
    bgGrad: 'from-amber-600 via-yellow-600 to-[#D4AF37]',
  },
  {
    id: 3,
    code: 'AYUSH300',
    discount: '₹300 OFF',
    title: 'Ayurvedic Formulations',
    description: 'Get extra ₹300 off on ordering Ayurvedic and herbal capsules above ₹2499.',
    type: 'Ayurveda Deal',
    bgGrad: 'from-teal-800 via-cyan-900 to-emerald-950',
  },
];

export default function OffersSection() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16 bg-white text-[#052326]">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-[#052326]/10 gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/60 uppercase block mb-2">
            Deals & Privileges
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Exclusive Offers & Coupons
          </h2>
          <p className="text-sm text-[#052326]/80 mt-2 max-w-xl font-light">
            Claim certified botanical benefits at special marketplace rates. Click any code to copy.
          </p>
        </div>

        <Link
          href="/offers"
          className="group inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#052326] border border-[#052326]/20 px-5 py-2.5 rounded-[10px] bg-[#F8F3EF] hover:bg-[#052326] hover:text-[#F8F3EF] transition-all self-start sm:self-end shadow-sm"
        >
          View All Offers
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* OFFERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {COUPONS.map((coupon) => (
          <div
            key={coupon.id}
            className="flex flex-col justify-between p-6 text-white transition-all duration-300 relative overflow-hidden"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(85, 85, 85, 0.18)',
              backgroundImage: `linear-gradient(135deg, ${coupon.bgGrad.split(' ')[1]} 0%, ${coupon.bgGrad.split(' ')[coupon.bgGrad.split(' ').length - 1]} 100%)`,
            }}
          >
            {/* Pattern Overlays */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />

            <div>
              {/* Card Type Badge */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-[6px] backdrop-blur-md">
                  {coupon.type}
                </span>
                <Gift className="w-4 h-4 text-white/70" />
              </div>

              {/* Discount / Offer Title */}
              <h3 className="text-2xl font-bold tracking-tight mb-1">
                {coupon.discount}
              </h3>
              <h4 className="text-sm font-semibold mb-2 text-white/90">
                {coupon.title}
              </h4>
              <p className="text-xs text-white/80 font-light leading-relaxed mb-6">
                {coupon.description}
              </p>
            </div>

            {/* Coupon Code Copy Strip */}
            <button
              onClick={() => handleCopy(coupon.code, coupon.id)}
              className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-[6px] backdrop-blur-sm transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#F0C417]" />
                <span className="font-mono text-sm font-bold tracking-wider text-white">
                  {coupon.code}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
                {copiedId === coupon.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* QUICK BANK STRIP */}
      <div
        className="mt-8 p-5 bg-[#F8F3EF] flex flex-col md:flex-row items-center justify-between gap-4"
        style={{
          borderRadius: '8px',
          border: '1px solid rgba(85, 85, 85, 0.18)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[6px] bg-[#052326]/5 flex items-center justify-center text-[#052326]">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">10% Instant Credit Card Discount</h4>
            <p className="text-xs text-[#052326]/70 font-light mt-0.5">
              Available on Axis, HDFC, ICICI bank cards. Minimum purchase value of ₹1,499 applies.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-bold text-xs tracking-wider uppercase text-[#052326] bg-white border border-[#052326]/10 px-4 py-2 rounded-[8px]">
          <Zap className="w-3.5 h-3.5 text-[#F0C417] fill-[#F0C417]" />
          Instant Apply
        </div>
      </div>
    </section>
  );
}
