'use client';

import Link from 'next/link';

export default function AuthFooter() {
    return (
        <footer className="w-full bg-[#F8F3EF] border-t border-[#052326]/10 py-8 px-4 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                {/* Copyright info */}
                <div className="text-xs text-gray-500 font-semibold">
                    © 2026 Cureza Wellness Pvt Ltd. All rights reserved.
                </div>

                {/* Policies Link Grid */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-bold text-[#052326]">
                    <Link href="/legal/shipping-policy" className="hover:text-[#F0C417] transition-colors">
                        Shipping Policy
                    </Link>
                    <Link href="/legal/cancellation-returns" className="hover:text-[#F0C417] transition-colors">
                        Return & Exchange Policy
                    </Link>
                    <Link href="/legal/medical-product-policy" className="hover:text-[#F0C417] transition-colors">
                        Medical Product Policy
                    </Link>
                    <Link href="/legal/privacy-policy" className="hover:text-[#F0C417] transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/legal/terms-of-service" className="hover:text-[#F0C417] transition-colors">
                        Terms & Conditions
                    </Link>
                    <Link href="/legal/consultancy-policy" className="hover:text-[#F0C417] transition-colors">
                        Online Consultancy
                    </Link>
                    <Link href="/legal/refund-policy" className="hover:text-[#F0C417] transition-colors">
                        Refund Policy
                    </Link>
                    <Link href="/track-order" className="hover:text-[#F0C417] transition-colors">
                        Track Your Order
                    </Link>
                    <Link href="/faq" className="hover:text-[#F0C417] transition-colors">
                        Help Center / FAQs
                    </Link>
                </div>
            </div>
        </footer>
    );
}
