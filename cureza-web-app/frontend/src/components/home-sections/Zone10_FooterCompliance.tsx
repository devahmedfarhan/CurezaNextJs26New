'use client';

import React from 'react';
import Link from 'next/link';

// S100: White-Label Ayurvedic Formulation Advisory
export function WhiteLabelAdvisory() {
  return (
    <section className="w-full py-12 bg-[#F8F3EF] border-b border-[#052326]/12 text-xs text-[#052326]">
      <div className="container mx-auto px-4 md:px-6 text-center max-w-xl space-y-4">
        <h4 className="text-base font-semibold">White-Label Formulation Consulting</h4>
        <p className="text-gray-500 leading-relaxed font-medium">
          Seeking to formulate FDA-compliant herbals or custom cannabinoid blends? Our advisory provides licensing advice, ingredient standardizations, and export certification services.
        </p>
        <Link href="/consulting/white-label" className="inline-block bg-[#052326] text-white hover:bg-[#0A4347] px-6 py-2.5 rounded font-semibold transition-colors">
          Schedule Advisory Session
        </Link>
      </div>
    </section>
  );
}

// S33: High-Risk Payment Gateway Assurances
export function SecureGatewayLogos() {
  return (
    <div className="w-full bg-[#052326] text-[#F8F3EF]/70 py-6 border-b border-[#F8F3EF]/10">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold">
        <p className="text-white">Verified Compliant High-Risk Settlement Gateway:</p>
        <div className="flex gap-4 opacity-80 text-[#F0C417]">
          <span>💳 UPI Secure Checkout</span>
          <span>🔒 PCI-DSS Compliant</span>
          <span>🛡️ Certified Escrow Dispensing</span>
        </div>
      </div>
    </div>
  );
}
