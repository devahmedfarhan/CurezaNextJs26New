import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sell on Cureza - Join India\'s Fastest Growing Wellness Marketplace',
    description: 'Become a seller on Cureza and reach millions of health-conscious customers. Zero listing fees, pan-India logistics, verified doctor network. Start selling wellness products today.',
};

export default function SellOnCureza() {
    return (
        <div className="bg-[#F8F3EF] min-h-screen pt-0 pb-20 text-[#052326]">

            {/* ========================================= */}
            {/* PREMIUM HERO BANNER */}
            {/* ========================================= */}
            <section className="relative bg-[#052326] text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">

                        {/* LEFT CONTENT */}
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-6xl font-semibold leading-tight font-serif">
                                Sell on Cureza
                            </h1>
                            <p className="text-lg md:text-xl mt-4 text-[#F8F3EF]/85 leading-relaxed font-light">
                                Join India’s fastest-growing wellness marketplace and reach millions of
                                health-conscious customers across the country.
                            </p>

                            <div className="flex gap-4 mt-8">
                                <a
                                    href="/seller/register"
                                    className="px-8 py-4 bg-white text-[#052326] font-semibold rounded-[10px] shadow-sm hover:bg-[#F8F3EF] transition"
                                >
                                    Register as Seller
                                </a>

                                <a
                                    href="/seller/login"
                                    className="px-8 py-4 border border-[#F8F3EF]/30 text-white font-semibold rounded-[10px] hover:bg-[#F8F3EF]/10 transition"
                                >
                                    Seller Login
                                </a>
                            </div>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="flex-1 flex justify-center">
                            <img
                                src="https://cdn3d.iconscout.com/3d/premium/thumb/online-shop-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--online-shopping-e-commerce-cart-pack-business-illustrations-6584054.png"
                                className="w-80 md:w-96 drop-shadow-sm"
                                alt="Dashboard"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <div className="container mx-auto px-6 mt-16">

                {/* WHY SELL WITH US */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-[#052326] mb-6 text-center">
                        Why Sell with Cureza?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-white border border-[#052326]/12 rounded-[12px] shadow-sm transition">
                            <div className="text-4xl mb-3">🆓</div>
                            <h3 className="font-semibold text-xl text-[#052326]">Zero Listing Fees</h3>
                            <p className="text-gray-600 mt-2 text-sm">
                                List unlimited products for free. Pay only a commission on successful sales.
                            </p>
                        </div>

                        <div className="p-6 bg-white border border-[#052326]/12 rounded-[12px] shadow-sm transition">
                            <div className="text-4xl mb-3">👨‍⚕️</div>
                            <h3 className="font-semibold text-xl text-[#052326]">Access to Verified Doctors</h3>
                            <p className="text-gray-600 mt-2 text-sm">
                                Wellness doctors recommend Cureza-approved brands directly to customers.
                            </p>
                        </div>

                        <div className="p-6 bg-white border border-[#052326]/12 rounded-[12px] shadow-sm transition">
                            <div className="text-4xl mb-3">🚚</div>
                            <h3 className="font-semibold text-xl text-[#052326]">Pan-India Logistics</h3>
                            <p className="text-gray-600 mt-2 text-sm">
                                Cureza's logistic partners ensure faster, safer deliveries across India.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ELIGIBILITY */}
                <section className="mb-16 bg-white border border-[#052326]/12 rounded-[12px] p-10 shadow-sm">
                    <h2 className="text-3xl font-bold text-[#052326] mb-4">Eligibility</h2>

                    <ul className="space-y-4 text-gray-700 text-lg">
                        <li className="flex items-center gap-2">✔ <span className="font-medium">GST Registration</span></li>
                        <li className="flex items-center gap-2">✔ <span className="font-medium">FSSAI / AYUSH / Cosmetic License</span></li>
                        <li className="flex items-center gap-2">✔ <span className="font-medium">Only Original, Authentic, Verified Products</span></li>
                        <li className="flex items-center gap-2">✔ <span className="font-medium">Brand authorization (if acting as reseller)</span></li>
                        <li className="flex items-center gap-2">✔ <span className="font-medium">Active Bank Account for Payouts</span></li>
                    </ul>
                </section>

                {/* PRICING STRUCTURE */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-[#052326] mb-6 text-center">
                        Simple Pricing Structure
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Referral Fees */}
                        <div className="bg-white p-7 border border-[#052326]/12 rounded-[12px] shadow-sm transition text-center">
                            <div className="text-4xl mb-3">💰</div>
                            <h3 className="font-semibold text-xl text-[#052326]">Referral Fees</h3>
                            <p className="text-[#052326] mt-2 font-bold text-2xl">22% – 27%</p>
                            <p className="text-gray-500 text-xs mt-2">Based on category & performance</p>
                        </div>

                        {/* Payment Gateway */}
                        <div className="bg-white p-7 border border-[#052326]/12 rounded-[12px] shadow-sm transition text-center">
                            <div className="text-4xl mb-3">💳</div>
                            <h3 className="font-semibold text-xl text-[#052326]">Payment Gateway Charges</h3>
                            <p className="text-[#052326] mt-2 text-sm font-semibold leading-relaxed">
                                India: 2.50% / 0+0
                                <br />
                                Global: 4.4% + $0.3
                            </p>
                        </div>

                        {/* Closing Fee */}
                        <div className="bg-white p-7 border border-[#052326]/12 rounded-[12px] shadow-sm transition text-center">
                            <div className="text-4xl mb-3">🧾</div>
                            <h3 className="font-semibold text-xl text-[#052326]">Fixed Closing Fee</h3>
                            <p className="text-[#052326] mt-2 font-bold text-lg">Minimal • Transparent • Fair</p>
                            <p className="text-gray-500 text-xs mt-2">(Depends on product & weight slabs)</p>
                        </div>
                    </div>
                </section>

                {/* HOW TO SELL */}
                <section id="how" className="mb-20">
                    <h2 className="text-3xl font-bold text-[#052326] text-center mb-10">
                        How to Sell on Cureza?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">

                        <div className="bg-white p-8 border border-[#052326]/12 rounded-[12px] shadow-sm">
                            <h3 className="text-xl font-bold mb-2 text-[#052326]">1️⃣ Register as Seller</h3>
                            <p className="text-gray-600 text-sm">
                                Upload your GST & business details. Account manager assistance included.
                            </p>
                        </div>

                        <div className="bg-white p-8 border border-[#052326]/12 rounded-[12px] shadow-sm">
                            <h3 className="text-xl font-bold mb-2 text-[#052326]">2️⃣ Create Product Listings</h3>
                            <p className="text-gray-600 text-sm">
                                Upload images, descriptions, pricing & compliance documents.
                            </p>
                        </div>

                        <div className="bg-white p-8 border border-[#052326]/12 rounded-[12px] shadow-sm">
                            <h3 className="text-xl font-bold mb-2 text-[#052326]">3️⃣ Customers Start Buying</h3>
                            <p className="text-gray-600 text-sm">
                                Cureza promotes your products to wellness-focused customers.
                            </p>
                        </div>

                        <div className="bg-white p-8 border border-[#052326]/12 rounded-[12px] shadow-sm">
                            <h3 className="text-xl font-bold mb-2 text-[#052326]">4️⃣ Ship Orders</h3>
                            <p className="text-gray-600 text-sm">
                                Use your courier or Cureza logistics partners.
                            </p>
                        </div>

                        <div className="bg-white p-8 border border-[#052326]/12 rounded-[12px] shadow-sm md:col-span-2">
                            <h3 className="text-xl font-bold mb-2 text-[#052326]">5️⃣ Get Paid Weekly</h3>
                            <p className="text-gray-600 text-sm">
                                Settlements directly to your bank account every week.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="text-center bg-[#052326] text-white py-14 rounded-[12px] shadow-sm mt-16">
                    <h2 className="text-3xl font-bold mb-4 font-serif">
                        Ready to Start Selling on Cureza?
                    </h2>
                    <p className="text-[#F8F3EF]/80 mb-8 text-lg font-light">
                        Grow your wellness brand with India's #1 wellness ecosystem.
                    </p>

                    <div className="flex justify-center gap-5">
                        <a
                            href="/seller/register"
                            className="px-8 py-4 bg-white text-[#052326] rounded-[10px] font-semibold shadow-sm hover:bg-[#F8F3EF]"
                        >
                            Register as Seller
                        </a>

                        <a
                            href="/seller/login"
                            className="px-8 py-4 border border-[#F8F3EF]/30 rounded-[10px] text-white font-semibold hover:bg-white/10"
                        >
                            Seller Login
                        </a>
                    </div>
                </section>

            </div>
        </div>
    );
}
