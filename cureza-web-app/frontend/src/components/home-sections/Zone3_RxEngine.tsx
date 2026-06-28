'use client';

import React from 'react';
import Link from 'next/link';

export function SubscriptionRefillBanner() {
  return (
    <section className="w-full py-8 bg-[#052326]/5 border-y border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Adherence Support Program</span>
            <h3 className="text-xl md:text-2xl font-semibold text-[#052326] mt-1">
              Automated Monthly Refill Subscriptions
            </h3>
            <p className="text-xs md:text-sm text-[#052326]/80 mt-1 font-medium leading-relaxed">
              Never miss your diabetes or hypertension dosage. Save <strong className="text-[#052326]">15% flat</strong> on all recurring chronic orders. Fully managed pharmacist approvals and cold-chain logistics.
            </p>
          </div>
          <div className="shrink-0 flex gap-4">
            <Link
              href="/account/subscriptions"
              className="bg-[#052326] text-white hover:bg-[#0A4347] transition-all px-6 py-3 rounded-lg text-xs font-semibold"
            >
              Enroll Refill Plan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
