import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cancellation & Refund Policy - Cureza | Returns & Exchanges',
    description: 'Review Cureza\'s cancellation and refund policy. Learn about return windows, eligibility requirements, refund process, and exchange policies. Updated November 2025.',
};

export default function CancellationRefundPolicy() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-8">
                    {/* Header */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        Cancellation & Refund Policy
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Home / Policies / Cancellation & Refund Policy
                    </p>

                    <div className="text-xs text-gray-500 mt-3">
                        <span className="font-medium">LAST UPDATED:</span> November 2025
                    </div>

                    <hr className="my-6 border-gray-200" />

                    <p className="text-gray-700 leading-relaxed mb-6">
                        This Cancellation & Refund Policy applies to all orders placed on
                        Cureza. Cureza is a multi-vendor marketplace, and therefore, certain
                        return and refund rules vary per seller. However, the following
                        policy is applicable platform-wide and must be followed for all
                        cancellations, returns, and refund requests.
                    </p>

                    {/* Contents */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Contents</h3>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-indigo-600">
                            <li><a href="#cancellations">Cancellations</a></li>
                            <li><a href="#return-window">Return Window</a></li>
                            <li><a href="#eligible">Return Eligibility</a></li>
                            <li><a href="#non-returnable">Non-Returnable Items</a></li>
                            <li><a href="#video-proof">Mandatory Video Proof</a></li>
                            <li><a href="#partial-refund">Partial Refund Cases</a></li>
                            <li><a href="#refund-process">Refund Process</a></li>
                            <li><a href="#refund-delay">Missing or Delayed Refunds</a></li>
                            <li><a href="#sale-items">Sale Items</a></li>
                            <li><a href="#exchange">Exchange Policy</a></li>
                            <li><a href="#gifts">Gifts</a></li>
                            <li><a href="#return-shipping">Return Shipping</a></li>
                            <li><a href="#contact">Contact Information</a></li>
                        </ul>
                    </div>

                    {/* CANCELLATIONS */}
                    <section id="cancellations" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Cancellations</h2>

                        <p className="text-gray-700 leading-relaxed">
                            You can cancel your order by contacting us at{" "}
                            <a href="mailto:help@cureza.in" className="text-indigo-600">
                                help@cureza.in
                            </a>{" "}
                            within **72 hours** of placing your order, as long as the product
                            has not yet been shipped.
                        </p>

                        <details className="mt-3">
                            <summary className="font-semibold text-gray-700 cursor-pointer">
                                Key Points
                            </summary>
                            <ul className="list-disc ml-5 mt-2 text-gray-600 space-y-2">
                                <li>Orders can be cancelled only before the seller dispatches the item.</li>
                                <li>Once shipped, the order cannot be cancelled.</li>
                                <li>International/overseas sellers: Cancellation is allowed **only** before shipment.</li>
                                <li>Prepaid order refunds are processed within 5–7 working days.</li>
                                <li>COD orders can be refused at delivery if cancellation period has passed.</li>
                            </ul>
                        </details>
                    </section>

                    {/* RETURNS WINDOW */}
                    <section id="return-window" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Return Window</h2>

                        <p className="text-gray-700">
                            Cureza offers a **14-day return window**, depending on seller
                            policy. If 14 days have passed since your purchase, unfortunately
                            we cannot offer a refund or exchange.
                        </p>
                    </section>

                    {/* ELIGIBILITY */}
                    <section id="eligible" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Return Eligibility Requirements
                        </h2>

                        <p className="text-gray-700 mb-3">
                            To be eligible for a return, the item must meet ALL the following
                            conditions:
                        </p>

                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>Item must be **unused** and in original condition.</li>
                            <li>Item must be in the **same packaging** you received it.</li>
                            <li>Box must **not be torn, crushed, broken or tampered**.</li>
                            <li>No scratches, dents, stains, usage marks or smells.</li>
                            <li>All original accessories, freebies, manuals, & outer box must be included.</li>
                            <li>Batch number & barcode must be intact.</li>
                            <li>Must include invoice/receipt or order proof.</li>
                        </ul>

                        <p className="mt-4 text-gray-600 text-sm">
                            *Returns without original packaging or damaged boxes will be
                            rejected.*
                        </p>
                    </section>

                    {/* NON RETURNABLE */}
                    <section id="non-returnable" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Non-Returnable Items
                        </h2>

                        <p className="text-gray-700 mb-3">
                            Several types of goods cannot be returned due to hygiene,
                            regulatory, or safety reasons:
                        </p>

                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>Perishable/edible goods</li>
                            <li>Health & personal care items</li>
                            <li>Wellness products</li>
                            <li>Ayurvedic medicines</li>
                            <li>Opened supplements or food items</li>
                            <li>Cosmetics & grooming products</li>
                            <li>Intimate or sanitary items</li>
                            <li>Hazardous materials</li>
                            <li>Flammable liquids or gases</li>
                            <li>Gift cards</li>
                            <li>Downloadable digital products</li>
                            <li>Opened CDs/DVDs/Software/Media</li>
                        </ul>
                    </section>

                    {/* VIDEO PROOF */}
                    <section id="video-proof" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Mandatory Unboxing Video Proof
                        </h2>

                        <p className="text-gray-700 leading-relaxed">
                            To ensure a fair process for both customers and sellers, all
                            return requests for **damage, leakage, missing items, or wrong
                            product** MUST include a clear **continuous unboxing video**.
                        </p>

                        <details className="mt-3">
                            <summary className="font-semibold cursor-pointer text-gray-700">
                                Video Proof Requirements
                            </summary>
                            <ul className="list-disc ml-5 mt-2 text-gray-600 space-y-2">
                                <li>Video must start BEFORE opening the package.</li>
                                <li>Shipping label, seal, and entire box must be visible.</li>
                                <li>No cuts, trims, or edits in the video.</li>
                                <li>Show the product clearly from all sides.</li>
                                <li>Show the issue (damage/defect/leakage) clearly in the same clip.</li>
                            </ul>
                        </details>

                        <p className="mt-4 text-red-600 text-sm font-medium">
                            Return requests without video proof will be automatically rejected.
                        </p>
                    </section>

                    {/* PARTIAL REFUND */}
                    <section id="partial-refund" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Partial Refunds (If Applicable)
                        </h2>

                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>Books with obvious signs of use.</li>
                            <li>Opened CDs, DVDs, software, games, tapes, or records.</li>
                            <li>Items not in original condition or damaged by customer.</li>
                            <li>Items missing parts or accessories.</li>
                            <li>Items returned after **30 days** from delivery.</li>
                        </ul>
                    </section>

                    {/* REFUND PROCESS */}
                    <section id="refund-process" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Refund Process</h2>

                        <p className="text-gray-700 mb-2">
                            Once your return is received and inspected by the seller, you will
                            receive an email notification regarding approval or rejection.
                        </p>

                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>Approved refunds are processed within **3–7 business days**.</li>
                            <li>
                                Refunds can be issued to:
                                <ul className="list-disc ml-6 text-gray-600">
                                    <li>Original payment method</li>
                                    <li>Bank account / UPI</li>
                                    <li>Cureza Wallet (store credit)</li>
                                </ul>
                            </li>
                            <li>
                                Return shipping charges (if applicable) may be deducted from refund amount.
                            </li>
                        </ul>
                    </section>

                    {/* MISSING REFUNDS */}
                    <section id="refund-delay" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Missing or Delayed Refunds
                        </h2>

                        <p className="text-gray-700 mb-2">If you haven't received a refund:</p>

                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>Check your bank account again.</li>
                            <li>Contact your credit card company (posting delays may occur).</li>
                            <li>Contact your bank (processing times may vary).</li>
                        </ul>

                        <p className="mt-4 text-gray-700">
                            If you have completed all steps and still have not received your
                            refund, contact us at{" "}
                            <a href="mailto:help@cureza.in" className="text-indigo-600">
                                help@cureza.in
                            </a>.
                        </p>
                    </section>

                    {/* SALE ITEMS */}
                    <section id="sale-items" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Sale Items</h2>

                        <p className="text-gray-700">
                            Only full-priced items may be refunded. Sale/discounted items
                            cannot be refunded unless damaged or defective.
                        </p>
                    </section>

                    {/* EXCHANGE */}
                    <section id="exchange" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Exchanges</h2>

                        <p className="text-gray-700 mb-3">
                            We only replace items if they are defective or damaged. To
                            request an exchange, email:
                        </p>

                        <p className="text-indigo-600 font-semibold">
                            help@cureza.in
                        </p>

                        <p className="text-gray-600 mt-2 text-sm">
                            *Exchange is only for the same product (same variant).*
                        </p>
                    </section>

                    {/* GIFTS */}
                    <section id="gifts" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Gifts</h2>

                        <p className="text-gray-700 leading-relaxed">
                            If an item was marked as a gift when purchased, you will receive a
                            gift credit once the return is processed. Otherwise, the refund
                            will be sent to the original purchaser.
                        </p>
                    </section>

                    {/* RETURN SHIPPING */}
                    <section id="return-shipping" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Return Shipping</h2>

                        <p className="text-gray-700 mb-2">
                            To return your product, you must send it directly to the
                            respective seller.
                        </p>

                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>You must pay for your own shipping costs.</li>
                            <li>Shipping costs are non-refundable.</li>
                            <li>
                                If your refund is approved, return shipping cost may be deducted.
                            </li>
                            <li>
                                For items over ₹5000, use a trackable shipping service or
                                insurance. Cureza does not guarantee receipt of returned items.
                            </li>
                        </ul>
                    </section>

                    {/* CONTACT */}
                    <section id="contact" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            Contact Information
                        </h2>

                        <p className="text-gray-700 leading-relaxed">
                            For cancellation, returns, or refund issues, contact Cureza
                            Support — available 24/7.
                            <br />
                            <strong>Email:</strong>{" "}
                            <a href="mailto:help@cureza.in" className="text-indigo-600">
                                help@cureza.in
                            </a>
                            <br />
                            <strong>Office:</strong> Jaipur, Rajasthan, India
                        </p>
                    </section>

                    <hr className="my-6 border-gray-200" />

                    <div className="flex">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} Cureza — All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
