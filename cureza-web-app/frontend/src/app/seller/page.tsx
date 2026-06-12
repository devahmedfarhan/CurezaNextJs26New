import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sell on Cureza - Join India\'s Fastest Growing Wellness Marketplace',
    description: 'Become a seller on Cureza and reach millions of health-conscious customers. Zero listing fees, pan-India logistics, verified doctor network. Start selling wellness products today.',
};

export default function SellOnCureza() {
    return (
        <div className="bg-gray-50 min-h-screen pt-0 pb-20">

            {/* ========================================= */}
            {/* PREMIUM HERO BANNER */}
            {/* ========================================= */}
            <section className="relative  bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">

                        {/* LEFT CONTENT */}
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                                Sell on Cureza
                            </h1>
                            <p className="text-lg md:text-xl mt-4 text-emerald-100 leading-relaxed">
                                Join India’s fastest-growing wellness marketplace and reach millions of
                                health-conscious customers across the country.
                            </p>

                            <div className="flex gap-4 mt-8">
                                <a
                                    href="/seller/register"
                                    className="px-8 py-4 bg-white text-emerald-900 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
                                >
                                    Register as Seller
                                </a>

                                <a
                                    href="/seller/login"
                                    className="px-8 py-4 border border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition"
                                >
                                    Seller Login
                                </a>
                            </div>
                        </div>

                        {/* RIGHT IMAGE */}
                        <div className="flex-1 flex justify-center">
                            <img
                                src="https://cdn3d.iconscout.com/3d/premium/thumb/online-shop-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--online-shopping-e-commerce-cart-pack-business-illustrations-6584054.png"
                                className="w-80 md:w-96 drop-shadow-xl"
                                alt="Dashboard"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT */}
            <div className="container mx-auto px-6 mt-16">

                {/* WHY SELL WITH US */}
                <section className="mb-16 ">
                    <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">
                        Why Sell with Cureza?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-white rounded-lg p-4 border rounded-lg transition">
                            <div className="text-4xl mb-3">🆓</div>
                            <h3 className="font-semibold text-xl">Zero Listing Fees</h3>
                            <p className="text-gray-600 mt-2">
                                List unlimited products for free. Pay only a commission on successful sales.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-lg p-4 border rounded-lg transition">
                            <div className="text-4xl mb-3">👨‍⚕️</div>
                            <h3 className="font-semibold text-xl">Access to Verified Doctors</h3>
                            <p className="text-gray-600 mt-2">
                                Wellness doctors recommend Cureza-approved brands directly to customers.
                            </p>
                        </div>

                        <div className="p-6 bg-white rounded-lg p-4 border rounded-lg transition">
                            <div className="text-4xl mb-3">🚚</div>
                            <h3 className="font-semibold text-xl">Pan-India Logistics</h3>
                            <p className="text-gray-600 mt-2">
                                Cureza's logistic partners ensure faster, safer deliveries across India.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ELIGIBILITY */}
                <section className="mb-16 bg-white rounded-lg p-10 shadow">
                    <h2 className="text-3xl font-bold text-emerald-900 mb-4">Eligibility</h2>

                    <ul className="space-y-4 text-gray-700 text-lg">
                        <li>✔ GST Registration</li>
                        <li>✔ FSSAI / AYUSH / Cosmetic License</li>
                        <li>✔ Only Original, Authentic, Verified Products</li>
                        <li>✔ Brand authorization (if acting as reseller)</li>
                        <li>✔ Active Bank Account for Payouts</li>
                    </ul>
                </section>

                {/* ========================================= */}
                {/* PRICING STRUCTURE (NEW ADDED SECTION) */}
                {/* ========================================= */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">
                        Simple Pricing Structure
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Referral Fees */}
                        <div className="bg-white p-7 rounded-lg p-4 border rounded-lg transition text-center">
                            <div className="text-4xl mb-3">💰</div>
                            <h3 className="font-semibold text-xl">Referral Fees</h3>
                            <p className="text-gray-700 mt-2 font-bold text-2xl">22% – 27%</p>
                            <p className="text-gray-600 text-sm mt-2">Based on category & performance</p>
                        </div>

                        {/* Payment Gateway */}
                        <div className="bg-white p-7 rounded-lg p-4 border rounded-lg transition text-center">
                            <div className="text-4xl mb-3">💳</div>
                            <h3 className="font-semibold text-xl">Payment Gateway Charges</h3>
                            <p className="text-gray-700 mt-2 font-bold">
                                India: 2.50% / 0+0
                                <br />
                                Global: 4.4% + $0.3
                            </p>
                        </div>

                        {/* Closing Fee */}
                        <div className="bg-white p-7 rounded-lg transition text-center">
                            <div className="text-4xl mb-3">🧾</div>
                            <h3 className="font-semibold text-xl">Fixed Closing Fee</h3>
                            <p className="text-gray-700 mt-2 font-bold text-xl">Minimal • Transparent • Fair</p>
                            <p className="text-gray-600 text-sm">(Depends on product & weight slabs)</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    {/* <div className="mt-10 text-center">
                        <a
                            href="/seller/register"
                            className="px-8 py-4 bg-emerald-700 text-white font-semibold rounded-xl shadow hover:bg-emerald-800 transition"
                        >
                            Start Selling Today
                        </a>

                        <a
                            href="#how"
                            className="ml-5 px-8 py-4 border border-emerald-300 rounded-xl text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                        >
                            Learn More
                        </a>
                    </div> */}
                </section>

                {/* HOW TO SELL */}
                <section id="how" className="mb-20">
                    <h2 className="text-3xl font-bold text-emerald-900 text-center mb-10">
                        How to Sell on Cureza?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-12">

                        <div className="bg-white p-8 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-2">1️⃣ Register as Seller</h3>
                            <p className="text-gray-600">
                                Upload your GST & business details.
                                Account manager assistance included.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-2">2️⃣ Create Product Listings</h3>
                            <p className="text-gray-600">
                                Upload images, descriptions, pricing & compliance documents.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-2">3️⃣ Customers Start Buying</h3>
                            <p className="text-gray-600">
                                Cureza promotes your products to wellness-focused customers.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-2">4️⃣ Ship Orders</h3>
                            <p className="text-gray-600">
                                Use your courier or Cureza logistics partners.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow md:col-span-2">
                            <h3 className="text-xl font-bold mb-2">5️⃣ Get Paid Weekly</h3>
                            <p className="text-gray-600">
                                Settlements directly to your bank account every week.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="text-center bg-emerald-900 text-white py-14 rounded-lg shadow-lg mt-16">
                    <h2 className="text-3xl font-extrabold mb-4">
                        Ready to Start Selling on Cureza?
                    </h2>
                    <p className="text-emerald-100 mb-8 text-lg">
                        Grow your wellness brand with India's #1 wellness ecosystem.
                    </p>

                    <div className="flex justify-center gap-5">
                        <a
                            href="/seller/register"
                            className="px-8 py-4 bg-white text-emerald-800 rounded-xl font-semibold shadow hover:bg-gray-100"
                        >
                            Register as Seller
                        </a>

                        <a
                            href="/seller/login"
                            className="px-8 py-4 border border-white rounded-xl text-white font-semibold hover:bg-emerald-800"
                        >
                            Seller Login
                        </a>
                    </div>
                </section>

            </div>
        </div>
    );
}
