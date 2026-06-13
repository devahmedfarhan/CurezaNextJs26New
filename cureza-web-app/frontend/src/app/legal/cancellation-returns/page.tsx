import React from "react";
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Cancellation & Refund Policy - Cureza | Returns & Exchanges',
    description: 'Review Cureza\'s cancellation and refund policy. Learn about return windows, eligibility requirements, refund process, and exchange policies. Updated November 2025.',
};

export default function CancellationRefundPolicy() {
    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto max-w-4xl px-6">
                
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-[#052326]/70 font-semibold hover:text-[#052326] transition text-sm">
                        ← Back to Shop
                    </Link>
                </div>

                <div className="bg-white rounded-[14px] border border-[#052326]/12 p-8 md:p-12 shadow-premium-light">
                    {/* Header */}
                    <header className="mb-10 pb-6 border-b border-[#052326]/12">
                        <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-[#052326]">
                            Cancellation & Refund Policy
                        </h1>
                        <p className="text-xs text-[#052326]/50 mt-2 font-light">
                            Home / Policies / Cancellation & Refund Policy
                        </p>
                        <div className="text-[10px] text-[#052326]/60 font-semibold uppercase tracking-wider mt-3">
                            <span>LAST UPDATED:</span> November 2025
                        </div>
                    </header>

                    <p className="text-[#052326]/80 text-sm leading-relaxed mb-8 font-light">
                        This Cancellation & Refund Policy applies to all orders placed on
                        Cureza. Cureza is a multi-vendor marketplace, and therefore, certain
                        return and refund rules vary per seller. However, the following
                        policy is applicable platform-wide and must be followed for all
                        cancellations, returns, and refund requests.
                    </p>

                    {/* Contents */}
                    <div className="mb-10 p-5 bg-[#F8F3EF]/60 rounded-[10px] border border-[#052326]/8">
                        <h3 className="text-xs font-bold text-[#052326] uppercase tracking-wider mb-3">Contents</h3>
                        <ul className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#052326]/70">
                            <li><a href="#cancellations" className="hover:underline">01. Cancellations</a></li>
                            <li><a href="#return-window" className="hover:underline">02. Return Window</a></li>
                            <li><a href="#eligible" className="hover:underline">03. Return Eligibility</a></li>
                            <li><a href="#non-returnable" className="hover:underline">04. Non-Returnable Items</a></li>
                            <li><a href="#video-proof" className="hover:underline">05. Mandatory Video Proof</a></li>
                            <li><a href="#partial-refund" className="hover:underline">06. Partial Refund Cases</a></li>
                            <li><a href="#refund-process" className="hover:underline">07. Refund Process</a></li>
                            <li><a href="#refund-delay" className="hover:underline">08. Missing or Delayed Refunds</a></li>
                            <li><a href="#sale-items" className="hover:underline">09. Sale Items</a></li>
                            <li><a href="#exchange" className="hover:underline">10. Exchange Policy</a></li>
                            <li><a href="#gifts" className="hover:underline">11. Gifts</a></li>
                            <li><a href="#return-shipping" className="hover:underline">12. Return Shipping</a></li>
                            <li><a href="#contact" className="hover:underline">13. Contact Information</a></li>
                        </ul>
                    </div>

                    <div className="space-y-10 text-sm text-[#052326]/80 leading-relaxed font-light">
                        {/* CANCELLATIONS */}
                        <section id="cancellations" className="scroll-mt-24">
                            <h2 className="text-lg font-bold font-heading text-[#052326] mb-3">01. Cancellations</h2>
                            <p>
                                You can cancel your order by contacting us at{" "}
                                <a href="mailto:help@cureza.in" className="text-[#052326] font-bold underline">
                                    help@cureza.in
                                </a>{" "}
                                within <span className="font-semibold">72 hours</span> of placing your order, as long as the product
                                has not yet been shipped.
                            </p>
                        </section>

                        {/* RETURNS WINDOW */}
                        <section id="return-window" className="scroll-mt-24">
                            <h2 className="text-lg font-bold font-heading text-[#052326] mb-3">02. Return Window</h2>
                            <p>
                                Cureza offers a <span className="font-semibold text-[#052326]">14-day return window</span>, depending on seller
                                policy. If 14 days have passed since your purchase, unfortunately
                                we cannot offer a refund or exchange.
                            </p>
                        </section>

                        {/* ELIGIBILITY */}
                        <section id="eligible" className="scroll-mt-24">
                            <h2 className="text-lg font-bold font-heading text-[#052326] mb-3">03. Return Eligibility Requirements</h2>
                            <p className="mb-3">To be eligible for a return, the item must meet ALL the following conditions:</p>
                            <ul className="list-disc ml-5 space-y-2 text-[#052326]/70">
                                <li>Item must be <span className="font-semibold text-[#052326]">unused</span> and in original condition.</li>
                                <li>Item must be in the <span className="font-semibold text-[#052326]">same packaging</span> you received it.</li>
                                <li>Box must <span className="font-semibold text-[#052326]">not be torn, crushed, broken or tampered</span>.</li>
                                <li>No scratches, dents, stains, usage marks or smells.</li>
                                <li>All original accessories, freebies, manuals, & outer box must be included.</li>
                                <li>Batch number & barcode must be intact.</li>
                                <li>Must include invoice/receipt or order proof.</li>
                            </ul>
                        </section>

                        {/* NON RETURNABLE */}
                        <section id="non-returnable" className="scroll-mt-24">
                            <h2 className="text-lg font-bold font-heading text-[#052326] mb-3">04. Non-Returnable Items</h2>
                            <p className="mb-3">Several types of goods cannot be returned due to hygiene, regulatory, or safety reasons:</p>
                            <ul className="list-disc ml-5 space-y-2 text-[#052326]/70">
                                <li>Perishable/edible goods</li>
                                <li>Health & personal care items</li>
                                <li>Wellness products</li>
                                <li>Ayurvedic medicines</li>
                                <li>Opened supplements or food items</li>
                                <li>Cosmetics & grooming products</li>
                                <li>Intimate or sanitary items</li>
                                <li>Gift cards</li>
                                <li>Downloadable digital products</li>
                            </ul>
                        </section>

                        {/* VIDEO PROOF */}
                        <section id="video-proof" className="scroll-mt-24">
                            <h2 className="text-lg font-bold font-heading text-[#052326] mb-3">05. Mandatory Unboxing Video Proof</h2>
                            <p className="mb-3">
                                To ensure a fair process for both customers and sellers, all
                                return requests for <span className="font-semibold text-[#052326]">damage, leakage, missing items, or wrong
                                product</span> MUST include a clear <span className="font-semibold text-[#052326]">continuous unboxing video</span>.
                            </p>
                            <p className="text-red-500 font-semibold bg-red-50 border border-red-100 rounded-[8px] p-3 text-xs">
                                ⚠️ Return requests without video proof starting before package opening will be automatically rejected.
                            </p>
                        </section>

                        {/* REFUND PROCESS */}
                        <section id="refund-process" className="scroll-mt-24">
                            <h2 className="text-lg font-bold font-heading text-[#052326] mb-3">07. Refund Process</h2>
                            <p className="mb-2">Once your return is received and inspected by the seller, you will receive an email notification regarding approval or rejection.</p>
                            <ul className="list-disc ml-5 space-y-1.5 text-[#052326]/70">
                                <li>Approved refunds are processed within <span className="font-semibold text-[#052326]">3–7 business days</span>.</li>
                                <li>Refunds are returned to original payment source, bank/UPI, or Cureza Wallet store credit.</li>
                            </ul>
                        </section>

                        {/* CONTACT */}
                        <section id="contact" className="scroll-mt-24 pt-6 border-t border-[#052326]/12">
                            <h2 className="text-lg font-bold font-heading text-[#052326] mb-3">13. Contact Information</h2>
                            <p className="text-[#052326]/70">
                                For cancellations, returns, or refund issues, contact Cureza Support — available 24/7.
                                <br />
                                <strong>Email:</strong> <a href="mailto:help@cureza.in" className="text-[#052326] font-bold underline">help@cureza.in</a>
                                <br />
                                <strong>Office:</strong> Jaipur, Rajasthan, India
                            </p>
                        </section>
                    </div>

                    <footer className="mt-12 pt-6 border-t border-[#052326]/12 text-center text-xs text-[#052326]/50">
                        © {new Date().getFullYear()} Cureza — All Rights Reserved.
                    </footer>
                </div>
            </div>
        </div>
    );
}
