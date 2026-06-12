import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Cureza - India\'s First 360° Wellness & Ayurveda Marketplace',
    description: 'Discover Cureza, India\'s leading wellness ecosystem founded by Dr. Farhan Ahmed Khan. Empowering small brands with Ayurveda, CBD wellness, and doctor-led care. Join 8,000+ happy customers.',
};

/* ============================
    ABOUT PAGE – PART 1
=============================== */

export default function AboutCureza() {
    return (
        <div className="w-full bg-gradient-to-b from-emerald-50 to-white pb-24">

            {/* HERO SECTION */}
            <section className="w-full bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white py-28 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-light leading-tight">
                    About Cureza
                </h1>
                <p className="text-lg md:text-xl mt-4 text-emerald-100 max-w-3xl mx-auto">
                    India’s First 360° Wellness, Ayurveda & CBD Marketplace — built to empower small brands, support authentic healthcare, and make wellness accessible for everyone.
                </p>

                <p className="mt-8 text-emerald-200 font-semibold">
                    Founded by Dr. Farhan Ahmed Khan — CEO & Chief Technologist, Cureza
                </p>
            </section>


            {/* ============================
    FOUNDER STORY SECTION
=============================== */}

            <section className="container mx-auto px-6 mt-28">

                <div className="grid md:grid-cols-2 gap-16 items-center">

                    {/* LEFT SIDE — TEXT */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-6">
                            The Story of Cureza
                        </h2>

                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                            Cureza was founded by <span className="font-semibold text-emerald-800">
                                Dr. Farhan Ahmed Khan</span> — a technologist, creator, and wellness advocate
                            who believes that every Indian deserves access to genuine, affordable, and
                            doctor-backed wellness solutions.
                        </p>

                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                            Growing up, Farhan experienced how small brands struggled to reach customers,
                            while big platforms favored only big companies.
                            He envisioned a digital ecosystem where <strong>Ayurveda, CBD, natural herbs,
                                and wellness products</strong> could live together — supported by verified doctors,
                            real reviews, and fair exposure.
                        </p>

                        <p className="text-gray-700 text-lg leading-relaxed">
                            Cureza is more than a marketplace —
                            it is a movement to uplift small wellness brands, support the Indian herbal ecosystem,
                            and bring a 360° digital revolution to health and wellness.
                        </p>

                        <div className="mt-10">
                            <p className="text-emerald-800 font-semibold text-xl">
                                “Wellness should not be a luxury.
                                It should reach every home in India.”
                            </p>
                            <p className="mt-2 text-gray-600 font-medium">— Dr. Farhan Ahmed Khan</p>
                        </div>
                    </div>

                    {/* RIGHT SIDE — IMAGE */}
                    <div className="w-full h-full">
                        <div className="w-full h-96 rounded-3xl bg-emerald-200 border border-emerald-100"></div>
                        {/* Replace above div with your real founder image */}
                    </div>

                </div>
            </section>


            {/* ABOUT INTRO */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-6">
                    Who We Are
                </h2>

                <p className="text-gray-700 text-lg leading-relaxed max-w-4xl">
                    Cureza is India’s modern wellness ecosystem — a unified digital platform where Ayurveda,
                    CBD wellness, natural health products, and doctor-led care come together.
                    Humara mission hai ek aisa platform create karna jahan chote brands ko bhi woh exposure mile
                    jo aaj tak sirf bade companies ke paas tha.
                    <br /><br />
                    Cureza brings every authentic wellness product under one roof, with verified doctors,
                    transparent information, a powerful support team, and a marketplace engine that helps
                    brands grow faster than ever.
                </p>
            </section>

            {/* ============================
    VIDEO INTRO BLOCK
=============================== */}

            <section className="w-full mt-24 px-6">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-6">
                        Cureza — A Wellness Revolution
                    </h2>

                    <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-10">
                        Discover how Cureza is transforming Ayurveda, CBD wellness, and digital healthcare
                        into one unified experience for every Indian.
                    </p>

                    <div className="rounded-3xl overflow-hidden border border-emerald-100">
                        <iframe
                            src="https://www.youtube.com/embed/VIDEO_ID"
                            className="w-full h-[350px] md:h-[480px]"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </section>



            {/* ============================
    MILESTONES SECTION
=============================== */}

            <section className="container mx-auto px-6 mt-28">
                <h2 className="text-3xl font-bold text-emerald-900 mb-12 text-center">
                    Our Milestones
                </h2>

                <div className="grid md:grid-cols-4 gap-10 text-center">
                    {[
                        { num: "1000+", label: "Products Listed" },
                        { num: "120+", label: "Verified Brands" },
                        { num: "50+", label: "Expert Doctors" },
                        { num: "8,000+", label: "Customers Served" },
                    ].map((m, i) => (
                        <div key={i} className="bg-white border border-emerald-100 rounded-3xl p-10">
                            <h3 className="text-4xl font-bold text-emerald-800">{m.num}</h3>
                            <p className="text-gray-600 mt-2">{m.label}</p>
                        </div>
                    ))}
                </div>
            </section>




            {/* VISION + MISSION (2-Column Grid on Desktop, Single on Mobile) */}
            <section className="container mx-auto px-6 mt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14">

                    {/* VISION */}
                    <div>
                        <h2 className="text-3xl font-bold text-emerald-900 mb-4">Our Vision</h2>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            To build India’s largest and most trusted wellness platform —
                            a place where Ayurveda, CBD, herbal therapy, and modern wellness
                            coexist under one unified ecosystem.
                            <br /><br />
                            Cureza envisions becoming a national wellness engine that empowers
                            every Indian with authentic products, transparent information,
                            24/7 support, and doctor-led guidance.
                            <br /><br />
                            Our bigger vision is to uplift small brands so that even the smallest
                            manufacturer can reach the entire nation without limitations.
                        </p>
                    </div>

                    {/* MISSION */}
                    <div>
                        <h2 className="text-3xl font-bold text-emerald-900 mb-4">Our Mission</h2>
                        <p className="text-gray-700 text-lg leading-relaxed">
                            To democratize wellness by creating a 360° digital marketplace where:
                            <br /><br />
                            • Small and emerging brands get fair exposure
                            • Consumers receive real wellness support from verified doctors
                            • Ayurvedic & CBD treatments become accessible across India
                            • Everyone — customers, sellers, and doctors — grows together
                            <br /><br />
                            We aim to contribute toward a healthier Digital India where wellness
                            is affordable, inclusive, and discoverable for all.
                        </p>
                    </div>

                </div>
            </section>


            {/* CORE VALUES */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-10">Our Core Values</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Authenticity First", desc: "Every product is vetted, verified, and sourced directly from trusted brands." },
                        { title: "Empowering Small Brands", desc: "We help growing brands reach millions through technology & fair exposure." },
                        { title: "Doctor-Led Wellness", desc: "Certified doctors, Ayurveda experts & professionals ensure safe experiences." },
                        { title: "Transparency Always", desc: "Pricing, ingredients, brand info — everything is open & honest." },
                        { title: "Community & Care", desc: "We build meaningful relationships through support & wellness education." },
                        { title: "Innovation in Wellness", desc: "Technology meets Ayurveda, CBD, and holistic health at Cureza." },
                    ].map((c, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-emerald-100">
                            <h3 className="text-xl font-bold text-emerald-900 mb-2">{c.title}</h3>
                            <p className="text-gray-700">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
            {/* ============================
    BRAND CAROUSEL — AUTOPLAY
=============================== */}

            <section className="container mx-auto px-6 mt-28">
                <h2 className="text-3xl font-bold text-emerald-900 mb-10 text-center">
                    Brands That Trust Cureza
                </h2>

                <div className="overflow-hidden relative">

                    {/* Scrolling Strip */}
                    <div className="flex gap-6 animate-scroll whitespace-nowrap">

                        {[
                            "TROST",
                            "Cannazo",
                            "Wellbeing Nutrition",
                            "Ananta Hempworks",
                            "India Hemp Organics",
                            "Satliva",
                            "Ayushakti",
                            "Zizira",
                            "Cureveda",
                            "Kapiva"
                        ].map((brand, i) => (
                            <div
                                key={i}
                                className="px-10 py-5 bg-white rounded-2xl border border-emerald-100 text-emerald-700 font-semibold text-lg min-w-[200px] text-center"
                            >
                                {brand}
                            </div>
                        ))}

                        {/* Duplicate for infinite loop */}
                        {[
                            "TROST",
                            "Cannazo",
                            "Wellbeing Nutrition",
                            "Ananta Hempworks",
                            "India Hemp Organics",
                            "Satliva",
                            "Ayushakti",
                            "Zizira",
                            "Cureveda",
                            "Kapiva"
                        ].map((brand, i) => (
                            <div
                                key={"dup-" + i}
                                className="px-10 py-5 bg-white rounded-2xl border border-emerald-100 text-emerald-700 font-semibold text-lg min-w-[200px] text-center"
                            >
                                {brand}
                            </div>
                        ))}

                    </div>
                </div>

                {/* Animation Style */}
                <style>
                    {`
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-scroll {
        animation: scroll 25s linear infinite;
      }
    `}
                </style>
            </section>
            {/* ============================
    AWARDS & MEDIA MENTIONS
=============================== */}

            <section className="container mx-auto px-6 mt-28">
                <h2 className="text-3xl font-bold text-emerald-900 mb-12 text-center">
                    Awards & Media Mentions
                </h2>

                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {[
                        "Featured in India's Emerging Wellness Startups 2024",
                        "Recognized for innovation in Ayurveda Technology",
                        "Top 10 Fastest Growing Health Marketplaces 2025",
                    ].map((award, i) => (
                        <div key={i} className="bg-white border border-emerald-100 rounded-3xl p-8">
                            <p className="text-emerald-800 font-semibold text-lg">{award}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============================
    APP DOWNLOAD CTA BLOCK
=============================== */}

            <section className="container mx-auto px-6 mt-28">
                <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-3xl p-12 text-center">

                    <h2 className="text-3xl font-bold mb-4">Download the Cureza App</h2>
                    <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
                        Explore wellness, order products, track your health, consult doctors,
                        and experience India’s most complete Ayurvedic platform.
                    </p>

                    <div className="flex justify-center gap-6">
                        <a
                            href="#"
                            className="px-8 py-3 bg-white text-emerald-800 rounded-xl font-semibold"
                        >
                            Google Play
                        </a>

                        <a
                            href="#"
                            className="px-8 py-3 bg-white text-emerald-800 rounded-xl font-semibold"
                        >
                            App Store
                        </a>
                    </div>
                </div>
            </section>


            {/* ============================
    DOCTOR PANEL SHOWCASE
=============================== */}

            <section className="container mx-auto px-6 mt-28">
                <h2 className="text-3xl font-bold text-emerald-900 mb-12 text-center">
                    Meet Our Doctor Panel
                </h2>

                <div className="grid md:grid-cols-4 gap-10 text-center">
                    {[
                        { name: "Dr. Aarti Sharma", type: "Ayurvedic Physician" },
                        { name: "Dr. Manish Rao", type: "Integrative Wellness Expert" },
                        { name: "Dr. Neha Kapoor", type: "CBD Specialist" },
                        { name: "Dr. Karan Singh", type: "Holistic Nutritionist" },
                    ].map((d, i) => (
                        <div key={i} className="bg-white border border-emerald-100 rounded-3xl p-8">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto mb-4"></div>
                            <h3 className="font-bold text-emerald-900 text-lg">{d.name}</h3>
                            <p className="text-gray-500 text-sm">{d.type}</p>
                        </div>
                    ))}
                </div>
            </section>




            {/* QUICK FACTS */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-10">Cureza in Numbers</h2>

                <div className="grid md:grid-cols-4 gap-10 text-center">
                    {[
                        { num: "1000+", label: "Total Wellness Products" },
                        { num: "120+", label: "Verified Wellness Brands" },
                        { num: "50+", label: "Active Doctors" },
                        { num: "8,000+", label: "Happy Customers" },
                    ].map((f, i) => (
                        <div key={i} className="bg-white p-10 rounded-3xl border border-emerald-100">
                            <h3 className="text-4xl font-bold text-emerald-800">{f.num}</h3>
                            <p className="text-gray-600 mt-2">{f.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* BRANDS SECTION */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-6">Brands on Cureza</h2>
                <p className="text-gray-700 mb-10">We proudly support upcoming & established brands in Ayurveda, CBD, wellness, and natural products.</p>

                <div className="grid md:grid-cols-5 gap-6">
                    {["Trost", "Cannazo", "HempKart", "Wellbeing Nutrition", "Dhootapapeshwar"].map((b, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-emerald-100 py-6 text-center font-semibold text-emerald-700">
                            {b}
                        </div>
                    ))}
                </div>
            </section>

            {/* TRUST BADGES */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-10">Why Trust Cureza?</h2>

                <div className="grid md:grid-cols-4 gap-8 text-center">
                    {[
                        "100% Authentic Products",
                        "Doctor Verified",
                        "Fast Support",
                        "Secure Payments",
                    ].map((t, i) => (
                        <div key={i} className="bg-white border border-emerald-100 rounded-3xl p-8 font-semibold text-emerald-700">
                            {t}
                        </div>
                    ))}
                </div>
            </section>



            {/* INSTAGRAM REVIEWS */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-10">What People Say</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        "Cureza helped me find CBD products easily & safely.",
                        "Doctor consultation made Ayurveda super simple!",
                        "Small brands finally getting a platform — love it!",
                    ].map((r, i) => (
                        <div key={i} className="bg-white border border-emerald-100 rounded-3xl p-8 text-gray-700">
                            ★★★★★ <br /><br />{r}
                        </div>
                    ))}
                </div>
            </section>

            {/* TEAM */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 text-center mb-10">
                    Meet Our Team
                </h2>

                <div className="grid md:grid-cols-4 gap-8 text-center">
                    {[
                        "Dr. Farhan Ahmed Khan",
                        "Aditi Sharma",
                        "Rahul Meena",
                        "Komal Jain",
                    ].map((name, i) => (
                        <div key={i} className="bg-white border border-emerald-100 p-8 rounded-3xl">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-4"></div>
                            <h4 className="font-bold text-emerald-900">{name}</h4>
                            <p className="text-gray-500 text-sm">Cureza Team</p>
                        </div>
                    ))}
                </div>
            </section>



            {/* CTA */}
            {/* ============================
    CUREZA CTA (Premium)
=============================== */}

            <section className="container mx-auto px-6 mt-28 mb-20">
                <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 text-white rounded-3xl py-12 px-8 text-center relative overflow-hidden">

                    {/* Soft Pattern BG */}
                    <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Have Questions or Need Help?
                        </h2>

                        <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-10">
                            Our customer care, doctor support, and seller success teams are here 24/7
                            to guide you on your wellness journey.
                        </p>

                        <a
                            href="/contact"
                            className="inline-block px-12 py-4 rounded-xl bg-white text-emerald-800 font-bold text-lg transition hover:bg-emerald-50"
                        >
                            Contact Cureza
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}

