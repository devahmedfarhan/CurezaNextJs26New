'use client';
import React from "react";
import Link from "next/link";
import { ArrowRight, RotateCw, ShieldCheck } from "lucide-react";

export default function ReturnsPage() {
    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white rounded-[14px] border border-[#052326]/12 p-8 md:p-12 shadow-premium-light space-y-8">
                    
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#052326]/5 flex items-center justify-center mx-auto text-[#052326]">
                            <RotateCw size={24} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-[#052326]">Cancellation & Returns</h1>
                        <p className="text-xs text-[#052326]/50 max-w-md mx-auto">Quick summary of marketplace returns policies. For complete terms, consult our official legal guidelines.</p>
                    </div>

                    <div className="divide-y divide-[#052326]/8 text-sm">
                        <div className="py-5 first:pt-0 space-y-2">
                            <h3 className="font-bold text-[#052326]">01. Cancellation Policy</h3>
                            <p className="text-[#052326]/70 leading-relaxed font-light">You can cancel your order anytime before it has been shipped. Once shipped, the order cannot be cancelled but can be returned if eligible.</p>
                        </div>

                        <div className="py-5 space-y-2">
                            <h3 className="font-bold text-[#052326]">02. Return Policy</h3>
                            <p className="text-[#052326]/70 leading-relaxed font-light">We accept returns within 7 days of delivery for damaged, defective, or incorrect items. Personal care and consumable items are non-returnable due to hygiene reasons.</p>
                        </div>

                        <div className="py-5 last:pb-0 space-y-2">
                            <h3 className="font-bold text-[#052326]">03. Refund Process</h3>
                            <p className="text-[#052326]/70 leading-relaxed font-light">Refunds are processed within 5-7 business days after the returned item is received and verified by the respective vendor.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[#052326]/12 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] text-[#052326]/50 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-[#052326]" /> Safe & Certified Buyer Protection
                        </p>
                        <Link href="/legal/cancellation-returns" className="w-full sm:w-auto bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 px-6 py-2.5 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
                            View Full Policy <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
