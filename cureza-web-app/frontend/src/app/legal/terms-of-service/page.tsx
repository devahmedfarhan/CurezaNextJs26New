import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms & Conditions - Cureza | User Agreement & Legal Terms',
    description: 'Review Cureza\'s Terms of Service including user agreements, product policies, acceptable use, warranties, liability limitations, and governing law. Updated November 2025.',
};

export default function TermsAndConditions() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-8">
                    {/* Header */}
                    <header className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            Terms & Conditions
                        </h1>
                        <p className="text-sm text-gray-600 mt-2">Home / Terms & Conditions</p>
                        <div className="text-xs text-gray-500 mt-3">
                            <span className="font-medium">LAST REVISION:</span> November 2025
                        </div>
                    </header>

                    <hr className="mb-6 border-gray-200" />

                    {/* Intro */}
                    <section className="mb-6">
                        <p className="text-gray-700 leading-relaxed">
                            PLEASE READ THESE TERMS OF SERVICE CAREFULLY. BY USING THIS WEBSITE OR ORDERING PRODUCTS FROM THIS WEBSITE, YOU AGREE TO BE BOUND BY ALL TERMS AND CONDITIONS OF THIS AGREEMENT.
                        </p>

                        <p className="text-gray-700 mt-3">
                            This Terms of Service Agreement (“Agreement”) governs your use of the website <a href="https://cureza.in" className="text-indigo-600">https://cureza.in</a> (the “Website”), operated by <strong>Cureza</strong> (“Cureza”, “we”, “our”). This Agreement includes and incorporates by reference the policies and guidelines referenced herein. Cureza reserves the right to change or revise the terms and conditions of this Agreement at any time by posting any changes on the Website. Changes will be effective immediately upon posting. Your continued use of the Website after such changes constitutes acceptance of the revised Agreement.
                        </p>

                        <p className="text-gray-600 mt-2 text-sm">
                            If you do not agree to this Agreement (including any referenced policies), please stop using the Website immediately.
                        </p>
                    </section>

                    {/* Table of contents */}
                    <nav className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Contents</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-indigo-600">
                            <li><a href="#products">Products & Offers</a></li>
                            <li><a href="#solicitations">Customer Solicitation & Opt-out</a></li>
                            <li><a href="#proprietary">Proprietary Rights</a></li>
                            <li><a href="#sales-tax">Sales Tax</a></li>
                            <li><a href="#website-content">Website Content & Links</a></li>
                            <li><a href="#acceptable-use">Acceptable Use</a></li>
                            <li><a href="#license-posting">License & Posting</a></li>
                            <li><a href="#disclaimer">Disclaimer of Warranties</a></li>
                            <li><a href="#liability">Limitation of Liability</a></li>
                            <li><a href="#indemnity">Indemnification</a></li>
                            <li><a href="#privacy">Privacy</a></li>
                            <li><a href="#force-majeure">Force Majeure</a></li>
                            <li><a href="#termination">Termination</a></li>
                            <li><a href="#governing-law">Governing Law & Jurisdiction</a></li>
                            <li><a href="#misc">Miscellaneous</a></li>
                        </ul>
                    </nav>

                    {/* PRODUCTS */}
                    <section id="products" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Products</h2>
                        <p className="text-gray-700">
                            This Website offers for sale certain products and services (the “Products”). By placing an order for Products through this Website, you agree to the terms set forth in this Agreement and any policies referenced on the Website.
                        </p>
                    </section>

                    {/* Customer Solicitation */}
                    <section id="solicitations" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Customer Solicitation & Opt-Out</h2>
                        <p className="text-gray-700 mb-3">
                            By providing your contact information, you consent to receive communications from Cureza or its authorised representatives regarding orders, promotions, or service-related matters. If you wish to opt-out of marketing or solicitation calls/emails, you can:
                        </p>
                        <ol className="list-decimal ml-5 text-gray-700 space-y-2">
                            <li>Use the opt-out link in any marketing email.</li>
                            <li>Email: <a href="mailto:unsubscribe@cureza.in" className="text-indigo-600">unsubscribe@cureza.in</a>.</li>
                            <li>Send a written request to our office: Cureza, Jaipur, Rajasthan, India.</li>
                        </ol>
                    </section>

                    {/* Proprietary Rights */}
                    <section id="proprietary" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Proprietary Rights</h2>
                        <p className="text-gray-700">
                            Cureza and its licensors retain all proprietary rights, title and interest in the Website and Products. You may not copy, reproduce, resell, redistribute, or create derivative works from Products or Website content without express written permission.
                        </p>
                        <p className="text-gray-600 mt-2 text-sm">
                            Trademarks, trade dress, page layouts, images, and calls to action are protected by intellectual property laws.
                        </p>
                    </section>

                    {/* Sales tax */}
                    <section id="sales-tax" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Sales Tax</h2>
                        <p className="text-gray-700">
                            You are responsible for paying any applicable taxes, duties or levies associated with your purchases on this Website. Cureza may collect or remit taxes where required by law.
                        </p>
                    </section>

                    {/* Website Content */}
                    <section id="website-content" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Website Content; Third-Party Links</h2>
                        <p className="text-gray-700">
                            The Website provides content and may link to third-party websites. Cureza does not necessarily create or endorse all third-party content and is not responsible for the content or practices of external sites. Links are provided for convenience only.
                        </p>
                        <p className="text-gray-600 mt-2 text-sm">
                            Unauthorized use of Website material may violate intellectual property laws.
                        </p>
                    </section>

                    {/* Acceptable Use */}
                    <section id="acceptable-use" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Acceptable Use</h2>
                        <p className="text-gray-700">
                            You agree not to use the Website for illegal purposes. You will abide by all applicable laws, not interfere with other users’ enjoyment, not resell materials, not send spam or unsolicited communications, and not post defamatory or abusive content.
                        </p>
                    </section>

                    {/* License & Posting */}
                    <section id="license-posting" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">License & Posting</h2>
                        <p className="text-gray-700 mb-3">
                            Cureza grants you a limited, non-exclusive, non-transferable license to use Website content for personal, non-commercial purposes. You may not copy or distribute content without permission.
                        </p>

                        <p className="text-gray-700">
                            By posting content (reviews, comments, images), you grant Cureza a perpetual, worldwide, non-exclusive, royalty-free, sublicensable license to use, display, modify and distribute that content in connection with operating the Website and Cureza's business.
                        </p>

                        <p className="text-gray-600 mt-2 text-sm">
                            Cureza does not control user-generated content and is not liable for interactions between users. Cureza reserves the right to remove content deemed objectionable.
                        </p>
                    </section>

                    {/* Disclaimer of Warranties */}
                    <section id="disclaimer" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Disclaimer of Warranties</h2>
                        <p className="text-gray-700">
                            YOUR USE OF THE WEBSITE AND PRODUCTS IS AT YOUR SOLE RISK. THE WEBSITE AND PRODUCTS ARE PROVIDED "AS IS" AND "AS AVAILABLE". CUREZA DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                        </p>

                        <p className="text-gray-700 mt-3">
                            Cureza does not warrant that Website content is accurate, complete, reliable, or timely, nor that the Website will be uninterrupted or error-free. Some jurisdictions may not permit certain disclaimers; they may not apply to you.
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section id="liability" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Limitation of Liability</h2>
                        <p className="text-gray-700 mb-3">
                            CUREZA'S TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE WEBSITE OR PRODUCTS IS LIMITED TO THE AMOUNT YOU PAID FOR THE SPECIFIC PRODUCT(S), LESS SHIPPING AND HANDLING.
                        </p>

                        <p className="text-gray-700">
                            IN NO EVENT WILL CUREZA BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, ARISING FROM OR RELATED TO THE WEBSITE OR PRODUCTS.
                        </p>

                        <p className="text-gray-600 mt-2 text-sm">
                            Certain limitations may not apply in jurisdictions that prohibit such exclusions.
                        </p>
                    </section>

                    {/* Indemnity */}
                    <section id="indemnity" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Indemnification</h2>
                        <p className="text-gray-700">
                            You agree to indemnify and hold harmless Cureza, its affiliates, officers, directors, employees and agents from any claims, damages, losses, liabilities and expenses (including reasonable legal fees) arising from your breach of this Agreement, your use of the Website, or your violation of any law or third-party rights.
                        </p>

                        <p className="text-gray-600 mt-2 text-sm">
                            Cureza may seek written assurances from you regarding indemnity obligations and may participate in the defence of any claim.
                        </p>
                    </section>

                    {/* Privacy */}
                    <section id="privacy" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Privacy</h2>
                        <p className="text-gray-700">
                            Cureza is committed to protecting user privacy. Our Privacy Policy (posted separately at <a href="https://cureza.in/privacy-policy" className="text-indigo-600">https://cureza.in/privacy-policy</a>) is incorporated by reference and forms part of this Agreement.
                        </p>
                    </section>

                    {/* Agreement to be bound */}
                    <section id="agreement" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Agreement to be Bound</h2>
                        <p className="text-gray-700">
                            By using the Website or ordering Products, you acknowledge that you have read and agree to be bound by this Agreement and all terms and conditions on the Website.
                        </p>
                    </section>

                    {/* General */}
                    <section id="force-majeure" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">General Provisions</h2>

                        <details className="mb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800">Force Majeure</summary>
                            <div className="mt-2 text-gray-700">
                                Cureza will not be liable for delays or failures due to events beyond its reasonable control, including natural disasters, war, terrorism, labour disputes, strikes, government actions, or other force majeure events.
                            </div>
                        </details>

                        <details className="mb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800">Cessation of Operation</summary>
                            <div className="mt-2 text-gray-700">
                                Cureza may cease operation of the Website or distribution of Products at any time without prior notice.
                            </div>
                        </details>

                        <details className="mb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800">Entire Agreement</summary>
                            <div className="mt-2 text-gray-700">
                                This Agreement constitutes the entire agreement between you and Cureza regarding the use of the Website and supersedes prior agreements.
                            </div>
                        </details>

                        <details className="mb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800">Effect of Waiver & Severability</summary>
                            <div className="mt-2 text-gray-700">
                                Failure to enforce any provision of this Agreement does not constitute a waiver. If any term is held invalid, the remainder will remain effective to the fullest extent permitted by law.
                            </div>
                        </details>
                    </section>

                    {/* Governing law */}
                    <section id="governing-law" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Governing Law & Jurisdiction</h2>
                        <p className="text-gray-700 mb-3">
                            This Website originates from Jaipur, Rajasthan, India. This Agreement will be governed by the laws of India. The courts of Jaipur, Rajasthan shall have exclusive jurisdiction over any disputes arising under or in connection with this Agreement.
                        </p>

                        <p className="text-gray-600 text-sm">
                            You waive any right to trial by jury and agree that any disputes will be brought individually and not as a class or collective action.
                        </p>
                    </section>

                    {/* Statute of limitation & waiver of class actions */}
                    <section id="misc" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Additional Terms</h2>
                        <p className="text-gray-700 mb-3">
                            Any claim or cause of action arising out of or related to use of the Website must be filed within one (1) year after such claim arose or be forever barred.
                        </p>

                        <p className="text-gray-700 mb-3">
                            BY ENTERING THIS AGREEMENT, YOU WAIVE ANY RIGHT TO BRING A CLASS ACTION OR JOIN CLAIMS WITH OTHERS.
                        </p>

                        <p className="text-gray-700">
                            Cureza reserves the right to terminate your access to the Website if it reasonably believes you have breached this Agreement. Upon termination, Cureza may cancel outstanding orders and prevent further access.
                        </p>
                    </section>

                    {/* Footer */}
                    <footer className="pt-6 border-t border-gray-200">

                        <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Cureza — All rights reserved.</p>
                            <a href="/" className="text-sm text-indigo-600">Back to Home</a>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
