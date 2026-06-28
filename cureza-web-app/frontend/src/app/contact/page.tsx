import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Contact Cureza - Get 24/7 Wellness Support | Help Center',
    description: 'Contact Cureza for customer support, doctor consultations, seller inquiries, and wellness guidance. Available 24/7 via email or contact form. Offices located in Jaipur and Ajmer, Rajasthan.',
};

const CONTACT_INFO = {
    email: "help@cureza.in",
    address: "Jaipur & Ajmer, Rajasthan, India",
};

const LOCATIONS = [
    {
        city: "Jaipur",
        role: "Corporate Head Office",
        address: "3rd Floor, Apex Tower, Lal Kothi, Tonk Road, Jaipur, Rajasthan - 302015",
        email: "jaipur@cureza.in",
        timing: "Mon - Sat: 9:00 AM - 7:00 PM",
        description: "Our primary corporate hub hosting our core management, clinical advisory board, and customer success team."
    },
    {
        city: "Ajmer",
        role: "Regional Operations & Wellness Center",
        address: "1st Floor, Cine Mall, Vaishali Nagar, Ajmer, Rajasthan - 305001",
        email: "ajmer@cureza.in",
        timing: "Mon - Sat: 10:00 AM - 6:00 PM",
        description: "Our regional operations center facilitating logistics, merchant training, and walk-in consultation support."
    }
];

const FAQS = [
    {
        q: "Are Cureza Ayurvedic products clinically tested?",
        a: "Yes. All Ayurvedic & herbal products listed on Cureza are sourced directly from certified brands with proper clinical documentation.",
    },
    {
        q: "Can I talk to an Ayurvedic doctor before buying?",
        a: "Yes. Cureza offers expert doctor consultations for personalized wellness advice. Select ‘Doctor’ in the contact form.",
    },
    {
        q: "Are there any side effects of Ayurvedic medicines?",
        a: "Ayurveda is safe when followed correctly. However, dosage & body-type (Prakriti) matters. Always consult our doctor for guidance.",
    },
    {
        q: "How do I choose the right Ayurvedic product?",
        a: "Our experts can guide you based on your lifestyle, concerns, and wellness goals. You can also read detailed product descriptions and reviews.",
    },
    {
        q: "Is Ayurveda safe during pregnancy or breastfeeding?",
        a: "Not all herbs are suitable during pregnancy. Please consult our certified Ayurveda doctor before using any product.",
    }
];

export default function ContactCureza() {
    const cardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none',
    };

    return (
        <div className="w-full bg-[#F8F3EF] min-h-screen pb-24 text-[#052326]">

            {/* ================= HEADER ================= */}
            <section className="text-center px-6 py-20 bg-[#052326] text-[#F8F3EF]">
                <span className="text-[#F8F3EF]/60 font-semibold tracking-wider text-[10px] px-3.5 py-1 bg-white/10 rounded-full border border-white/10">
                    Connect With Us
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold font-heading mt-4">
                    We’re Here to Help You
                </h1>
                <p className="text-xs md:text-sm text-[#F8F3EF]/70 mt-3 max-w-xl mx-auto font-light leading-relaxed">
                    Reach Cureza’s wellness team anytime—customers, sellers, doctors & partners.
                    We're always available to support you.
                </p>
            </section>

            {/* =============== CONTACT FORM + INFO =============== */}
            <section className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8 -mt-10">

                {/* LEFT SIDE: CONTACT INFO CARD */}
                <div style={cardStyle} className="bg-white p-8 md:p-10 flex flex-col justify-between space-y-8">
                    <div>
                        <h2 className="text-xl font-semibold font-heading text-[#052326] mb-8">
                            Contact Information
                        </h2>

                        <div className="space-y-6">
                            {/* EMAIL */}
                            <div style={cardStyle} className="flex items-start gap-4 p-4 bg-[#F8F3EF]/45">
                                <div className="w-10 h-10 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-1.086 1.922l-7.5 4.286a2.25 2.25 0 01-2.328 0l-7.5-4.286a2.25 2.25 0 01-1.086-1.922V6.75" />
                                    </svg>
                                </div>
                                <div className="text-xs">
                                    <p className="font-semibold text-[#052326]/40 tracking-wider">Email Support</p>
                                    <p className="font-semibold text-[#052326] mt-0.5">{CONTACT_INFO.email}</p>
                                </div>
                            </div>

                            {/* ADDRESS */}
                            <div style={cardStyle} className="flex items-start gap-4 p-4 bg-[#F8F3EF]/45">
                                <div className="w-10 h-10 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-2.813 0-5.25 2.029-5.25 4.875 0 3.938 5.25 10.125 5.25 10.125s5.25-6.187 5.25-10.125C17.25 5.03 14.813 3 12 3z" />
                                    </svg>
                                </div>
                                <div className="text-xs">
                                    <p className="font-semibold text-[#052326]/40 tracking-wider">Presence</p>
                                    <p className="font-semibold text-[#052326] mt-0.5">{CONTACT_INFO.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/faq"
                        className="inline-block text-xs font-semibold tracking-wider text-[#052326]/50 hover:text-[#052326] border-b border-[#052326]/20 pb-0.5 transition w-fit"
                    >
                        Visit Help Center &rarr;
                    </Link>
                </div>

                {/* RIGHT SIDE: FORM */}
                <div style={cardStyle} className="bg-white p-8 md:p-10">
                    <h2 className="text-xl font-semibold font-heading text-[#052326] mb-6">
                        Send Us a Message
                    </h2>

                    <form className="space-y-4 text-xs font-semibold">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#052326]/50 tracking-wider block">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-2.5 rounded-[8px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326]"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#052326]/50 tracking-wider block">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-2.5 rounded-[8px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-[#052326]/50 tracking-wider block">You Are</label>
                            <select className="w-full px-4 py-2.5 rounded-[8px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326] cursor-pointer">
                                <option>Customer</option>
                                <option>Seller</option>
                                <option>Doctor</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-[#052326]/50 tracking-wider block">Your Query</label>
                            <textarea
                                rows={4}
                                placeholder="Write your message..."
                                className="w-full px-4 py-2.5 rounded-[8px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326]"
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 py-3 rounded-[8px] text-xs font-semibold tracking-wider transition"
                        >
                            Submit Message
                        </button>
                    </form>
                </div>
            </section>

            {/* ================= OFFICES / CENTERS (JAIPUR & AJMER) ================= */}
            <section className="container mx-auto px-4 md:px-6 mt-20">
                <div className="text-center mb-12">
                    <span className="text-[#052326]/60 font-semibold tracking-wider text-[10px] px-3.5 py-1 bg-[#052326]/5 rounded-full border border-[#052326]/10">
                        Our Locations
                    </span>
                    <h2 className="text-2xl md:text-3xl font-semibold font-heading text-[#052326] mt-4">
                        Visit Our Wellness Centers
                    </h2>
                    <p className="text-xs md:text-sm text-[#052326]/70 mt-2 max-w-lg mx-auto font-light">
                        Explore our physical presence across Rajasthan. Drop by or reach out directly to our regional offices.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {LOCATIONS.map((loc, idx) => (
                        <div key={idx} style={cardStyle} className="bg-white p-8 transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-semibold font-heading text-[#052326] tracking-tight">
                                        {loc.city} Center
                                    </h3>
                                    <span className="text-[9px] font-semibold tracking-wider bg-[#052326]/5 text-[#052326]/80 px-2.5 py-1 rounded-full border border-[#052326]/10">
                                        {loc.city === "Jaipur" ? "HQ" : "Branch"}
                                    </span>
                                </div>
                                <p className="text-[11px] text-[#052326]/60 font-medium tracking-wider mb-3">
                                    {loc.role}
                                </p>
                                <p className="text-xs text-[#052326]/70 font-light leading-relaxed mb-6">
                                    {loc.description}
                                </p>

                                <div className="space-y-4 border-t border-[#052326]/8 pt-5">
                                    {/* ADDRESS */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-semibold text-[#052326]/40 tracking-wider text-[9px]">Address</p>
                                            <p className="text-[#052326] font-medium mt-0.5 leading-relaxed">{loc.address}</p>
                                        </div>
                                    </div>

                                    {/* EMAIL */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-semibold text-[#052326]/40 tracking-wider text-[9px]">Email</p>
                                            <p className="text-[#052326] font-semibold mt-0.5 hover:underline transition">
                                                <a href={`mailto:${loc.email}`}>{loc.email}</a>
                                            </p>
                                        </div>
                                    </div>

                                    {/* TIMING */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] shrink-0 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-semibold text-[#052326]/40 tracking-wider text-[9px]">Working Hours</p>
                                            <p className="text-[#052326] font-medium mt-0.5">{loc.timing}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-[#052326]/6 flex gap-4">
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center py-2.5 rounded-[8px] bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 text-[11px] font-semibold tracking-wider transition-all duration-300"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ================= FAQ ================= */}
            <section className="container mx-auto px-4 md:px-6 mt-20">
                <h2 className="text-xl font-semibold font-heading text-center text-[#052326] mb-10">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-3.5">
                    {FAQS.map((f, i) => (
                        <details
                            key={i}
                            style={cardStyle}
                            className="bg-white p-5 cursor-pointer group"
                        >
                            <summary className="font-semibold text-xs md:text-sm text-[#052326] list-none flex justify-between items-center outline-none">
                                <span>{f.q}</span>
                                <span className="text-xs text-[#052326]/40 group-open:rotate-180 transition-transform duration-250">▼</span>
                            </summary>
                            <p className="mt-3 text-xs text-[#052326]/75 font-light leading-relaxed border-t border-[#052326]/8 pt-3">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    );
}
