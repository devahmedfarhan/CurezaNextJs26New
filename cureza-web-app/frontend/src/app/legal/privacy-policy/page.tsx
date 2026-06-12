import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - Cureza | Data Protection & User Privacy',
    description: 'Read Cureza\'s Privacy Policy to understand how we collect, use, and protect your personal information. Learn about cookies, data retention, user rights, and GDPR compliance.',
};

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-8">
                    {/* Header */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Our website address is: <a href="https://cureza.in" className="text-indigo-600">https://cureza.in</a>
                    </p>

                    <div className="text-xs text-gray-500 mt-3">
                        <span className="font-medium">LAST UPDATED:</span> November 2025
                    </div>

                    <hr className="my-6 border-gray-200" />

                    <p className="text-gray-700 leading-relaxed mb-6">
                        This Privacy Policy explains how Cureza (“Cureza”, “we”, “our”, “us”) collects, uses, shares, and protects your personal information.
                        This policy applies to visitors, customers, sellers, and users of Cureza.in. By using our website you agree to this policy.
                    </p>

                    {/* Table of contents */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Contents</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-indigo-600">
                            <li><a href="#who-we-are">Who we are</a></li>
                            <li><a href="#what-we-collect">What we collect</a></li>
                            <li><a href="#comments-media">Comments & Media</a></li>
                            <li><a href="#contact-forms">Contact forms</a></li>
                            <li><a href="#cookies">Cookies</a></li>
                            <li><a href="#embedded">Embedded content</a></li>
                            <li><a href="#analytics">Analytics</a></li>
                            <li><a href="#sharing">Who we share with</a></li>
                            <li><a href="#retention">How long we retain</a></li>
                            <li><a href="#rights">Your rights</a></li>
                            <li><a href="#where-send">Where we send data</a></li>
                            <li><a href="#additional">Additional info</a></li>
                            <li><a href="#grievance">Grievance Officer</a></li>
                            <li><a href="#jurisdiction">Jurisdiction</a></li>
                        </ul>
                    </div>

                    {/* Sections */}
                    <section id="who-we-are" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Who we are</h2>
                        <p className="text-gray-700">
                            Our website address: <a href="https://cureza.in" className="text-indigo-600">https://cureza.in</a>.
                            Cureza operates as a multi-vendor marketplace and design studio based in Jaipur, Rajasthan, India.
                        </p>
                    </section>

                    <section id="what-we-collect" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">What personal data do we collect and why</h2>
                        <p className="text-gray-700 mb-3">We collect different types of information depending on how you use our site:</p>

                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li><strong>Contact information:</strong> name, email, phone, postal address, IP — to process orders and communicate.</li>
                            <li><strong>Payment & billing:</strong> billing name and address. We do NOT store full card data on our servers — payment partners handle card processing.</li>
                            <li><strong>Profile data:</strong> details you provide when registering (editable in your profile).</li>
                            <li><strong>Usage & device data:</strong> pages visited, referrer, device type, browser, and approximate location — for analytics and security.</li>
                            <li><strong>Demographics & preferences:</strong> optional survey or preference data to personalise experience.</li>
                        </ul>
                    </section>

                    <section id="comments-media" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Comments</h2>
                        <p className="text-gray-700">
                            When visitors leave comments we collect the data shown in the comment form, plus IP address and browser user-agent for spam detection.
                            An anonymized hash of your email may be sent to <a href="https://automattic.com/privacy/" className="text-indigo-600">Gravatar</a> to check for an avatar.
                        </p>

                        <h3 className="mt-4 font-semibold text-gray-800">Media</h3>
                        <p className="text-gray-700">
                            If you upload images, avoid embedding EXIF GPS location data. Other visitors may download images and extract that data.
                        </p>
                    </section>

                    <section id="contact-forms" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Contact forms</h2>
                        <p className="text-gray-700">
                            Contact forms may collect name, email, phone, message and IP address — used for support and follow-up.
                        </p>
                    </section>

                    <section id="cookies" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Cookies</h2>
                        <p className="text-gray-700 mb-3">
                            We use cookies to improve your experience, remember input (comment form), maintain login sessions, and store display preferences.
                        </p>

                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>Comment convenience cookie — lasts 1 year.</li>
                            <li>Login temporary cookie — discarded on browser close (or 2 days / 2 weeks if “Remember Me”).</li>
                            <li>Screen options cookie — lasts 1 year.</li>
                            <li>Post-editing cookie (when editing content) — 1 day.</li>
                        </ul>
                    </section>

                    <section id="embedded" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Embedded content from other websites</h2>
                        <p className="text-gray-700">
                            Embedded content (videos, widgets) behaves like visiting the external site — those sites may collect data, set cookies, and track interactions.
                        </p>
                    </section>

                    <section id="analytics" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Analytics</h2>
                        <p className="text-gray-700">
                            We use services like Google Analytics and Search Console to measure site performance and usage trends. These services collect usage data and set their own cookies.
                        </p>
                    </section>

                    <section id="sharing" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Who do we share your data with</h2>
                        <p className="text-gray-700 mb-3">
                            We share data with third parties who perform services on our behalf:
                        </p>
                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>Payment gateways and processors</li>
                            <li>Hosting and infrastructure providers</li>
                            <li>Courier and logistics partners (for order fulfilment)</li>
                            <li>Customer support and email/SMS providers</li>
                            <li>Analytics and anti-spam services</li>
                            <li>Event organisers or vendors when necessary to fulfil orders</li>
                        </ul>
                        <p className="text-gray-600 mt-2">All partners are required to follow privacy/security practices and use data only to provide the contracted service.</p>
                    </section>

                    <section id="retention" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">How long we retain your data</h2>
                        <p className="text-gray-700">
                            Comments and metadata are retained indefinitely to help with moderation and to recognize returning commenters.
                            Registered users’ profile data is retained until the account is deleted. We may retain certain data longer when required for legal, tax or fraud-prevention purposes.
                        </p>
                    </section>

                    <section id="rights" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">What rights you have over your data</h2>
                        <p className="text-gray-700">
                            If you have an account or have left comments you may request:
                        </p>
                        <ul className="list-disc ml-5 text-gray-700 space-y-2">
                            <li>An exported copy of your personal data in a common format.</li>
                            <li>Deletion of personal data we hold about you (subject to legal/administrative exceptions).</li>
                        </ul>
                        <p className="text-gray-600 mt-2">To make a request, contact: <a href="mailto:help@cureza.in" className="text-indigo-600">help@cureza.in</a>.</p>
                    </section>

                    <section id="where-send" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Where do we send your data</h2>
                        <p className="text-gray-700">
                            Visitor comments may be checked through automated spam detection services. Payment data is processed by payment partners. Data may occasionally be transferred to vendors located outside India for the services described above.
                        </p>
                    </section>

                    <section id="additional" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Additional information</h2>
                        <p className="text-gray-700 mb-3">
                            Cureza values your privacy. This policy applies to current and former visitors, customers, and sellers. By using the site you agree to the terms.
                        </p>

                        <h3 className="font-semibold text-gray-800 mt-4">Information we collect — summary</h3>
                        <ul className="list-disc ml-5 text-gray-700 space-y-2 mt-2">
                            <li>Contact information (name, email, addresses, phone).</li>
                            <li>Payment & billing information (billing name/address; card data handled by partners).</li>
                            <li>Content you post publicly (comments/reviews).</li>
                            <li>Demographics & preferences (surveys, choices).</li>
                            <li>Technical information (IP, browser, device, referrer, pages visited).</li>
                        </ul>

                        <h3 className="font-semibold text-gray-800 mt-4">How we collect</h3>
                        <p className="text-gray-700">Directly from you (forms, orders), passively (cookies & analytics), and from third parties (social logins, partners).</p>

                        <h3 className="font-semibold text-gray-800 mt-4">How we use information</h3>
                        <ul className="list-disc ml-5 text-gray-700 space-y-2 mt-2">
                            <li>Contact & transactional communications</li>
                            <li>Customer support</li>
                            <li>Service improvement and personalization</li>
                            <li>Security, fraud prevention</li>
                            <li>Marketing (with opt-out option)</li>
                        </ul>
                    </section>

                    <section id="email-optout" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Email Opt-Out</h2>
                        <p className="text-gray-700">
                            To stop receiving promotional emails contact <a href="mailto:unsubscribe@cureza.in" className="text-indigo-600">unsubscribe@cureza.in</a>.
                            Transactional emails (orders, refunds) will still be sent.
                        </p>
                    </section>

                    <section id="third-party" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Third-party sites</h2>
                        <p className="text-gray-700">
                            Links to third-party websites are not covered by this policy. Review their privacy policies before interacting.
                        </p>
                    </section>

                    <section id="grievance" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Grievance Officer</h2>
                        <p className="text-gray-700">
                            In accordance with applicable IT laws, contact our Grievance Officer:
                        </p>

                        <div className="mt-3 text-gray-700">
                            <p><strong>Name:</strong> Compliance Department — Cureza</p>
                            <p><strong>Office:</strong> Jaipur, Rajasthan, India</p>
                            <p><strong>Email:</strong> <a href="mailto:grievance@cureza.in" className="text-indigo-600">grievance@cureza.in</a></p>
                        </div>
                    </section>

                    <section id="updates" className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Updates to this policy</h2>
                        <p className="text-gray-700">
                            This Privacy Policy was last updated in November 2025. We may change our practices and will post updates on this page.
                        </p>
                    </section>

                    <section id="jurisdiction" className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Jurisdiction</h2>
                        <p className="text-gray-700">
                            By visiting Cureza.in you agree that disputes related to privacy are governed by the laws of India and courts in Jaipur, Rajasthan shall have exclusive jurisdiction.
                        </p>
                    </section>

                    {/* Footer */}
                    <hr className="my-6 border-gray-200" />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Cureza — All rights reserved.</p>
                        <a href="/" className="text-sm text-indigo-600">Back to Home</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
