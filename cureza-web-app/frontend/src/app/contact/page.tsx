import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Contact Cureza - Get 24/7 Wellness Support | Help Center',
    description: 'Contact Cureza for customer support, doctor consultations, seller inquiries, and wellness guidance. Available 24/7 via email, phone, or contact form. Based in Jaipur, Rajasthan.',
};

const CONTACT_INFO = {
    email: "help@cureza.in",
    phone: "+91 98765 43210",
    address: "Jaipur, Rajasthan, India",
};

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
    return (
        <div className="w-full bg-[#F8F3EF] min-h-screen pb-24 text-[#052326]">

            {/* ================= HEADER ================= */}
            <section className="text-center px-6 py-20 bg-[#052326] text-[#F8F3EF]">
                <span className="text-[#F8F3EF]/60 font-bold tracking-wider uppercase text-[10px] px-3.5 py-1 bg-white/10 rounded-full border border-white/10">
                    Connect With Us
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold font-heading mt-4">
                    We’re Here to Help You
                </h1>
                <p className="text-xs md:text-sm text-[#F8F3EF]/70 mt-3 max-w-xl mx-auto font-light leading-relaxed">
                    Reach Cureza’s wellness team anytime—customers, sellers, doctors & partners.
                    We're always available to support you.
                </p>
            </section>

            {/* =============== CONTACT FORM + INFO =============== */}
            <section className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8 px-6 -mt-10">

                {/* LEFT SIDE: CONTACT INFO CARD */}
                <div className="bg-white border border-[#052326]/12 rounded-[14px] p-8 md:p-10 shadow-premium-light flex flex-col justify-between space-y-8">
                    <div>
                        <h2 className="text-xl font-bold font-heading text-[#052326] mb-8">
                            Contact Information
                        </h2>

                        <div className="space-y-6">
                            {/* EMAIL */}
                            <div className="flex items-start gap-4 p-4 rounded-[10px] bg-[#F8F3EF]/40 border border-[#052326]/8">
                                <div className="w-10 h-10 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-1.086 1.922l-7.5 4.286a2.25 2.25 0 01-2.328 0l-7.5-4.286a2.25 2.25 0 01-1.086-1.922V6.75" />
                                    </svg>
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-[#052326]/40 uppercase tracking-wider">Email</p>
                                    <p className="font-bold text-[#052326] mt-0.5">{CONTACT_INFO.email}</p>
                                </div>
                            </div>

                            {/* PHONE */}
                            <div className="flex items-start gap-4 p-4 rounded-[10px] bg-[#F8F3EF]/40 border border-[#052326]/8">
                                <div className="w-10 h-10 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 4.5l2.955-.591a2.25 2.25 0 012.373 1.147l1.267 2.308a2.25 2.25 0 01-.287 2.622L6.53 12.47a17.94 17.94 0 008.999 8.999l2.484-2.029a2.25 2.25 0 012.622-.287l2.308 1.267a2.25 2.25 0 011.147 2.373L21 21.75" />
                                    </svg>
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-[#052326]/40 uppercase tracking-wider">Phone</p>
                                    <p className="font-bold text-[#052326] mt-0.5">{CONTACT_INFO.phone}</p>
                                </div>
                            </div>

                            {/* ADDRESS */}
                            <div className="flex items-start gap-4 p-4 rounded-[10px] bg-[#F8F3EF]/40 border border-[#052326]/8">
                                <div className="w-10 h-10 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-2.813 0-5.25 2.029-5.25 4.875 0 3.938 5.25 10.125 5.25 10.125s5.25-6.187 5.25-10.125C17.25 5.03 14.813 3 12 3z" />
                                    </svg>
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-[#052326]/40 uppercase tracking-wider">Address</p>
                                    <p className="font-bold text-[#052326] mt-0.5">{CONTACT_INFO.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/faq"
                        className="inline-block text-xs font-bold uppercase tracking-wider text-[#052326]/50 hover:text-[#052326] border-b border-[#052326]/20 pb-0.5 transition w-fit"
                    >
                        Visit Help Center &rarr;
                    </Link>
                </div>

                {/* RIGHT SIDE: FORM */}
                <div className="bg-white border border-[#052326]/12 rounded-[14px] p-8 md:p-10 shadow-premium-light">
                    <h2 className="text-xl font-bold font-heading text-[#052326] mb-6">
                        Send Us a Message
                    </h2>

                    <form className="space-y-4 text-xs font-semibold">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#052326]/50 uppercase tracking-wider block">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-2.5 rounded-[10px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#052326]/50 uppercase tracking-wider block">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-2.5 rounded-[10px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#052326]/50 uppercase tracking-wider block">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+91 00000 00000"
                                    className="w-full px-4 py-2.5 rounded-[10px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-[#052326]/50 uppercase tracking-wider block">You Are</label>
                                <select className="w-full px-4 py-2.5 rounded-[10px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326] cursor-pointer">
                                    <option>Customer</option>
                                    <option>Seller</option>
                                    <option>Doctor</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-[#052326]/50 uppercase tracking-wider block">Your Query</label>
                            <textarea
                                rows={4}
                                placeholder="Write your message..."
                                className="w-full px-4 py-2.5 rounded-[10px] border border-[#052326]/12 bg-white text-xs outline-none focus:border-[#052326]"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 py-3 rounded-[10px] text-xs font-bold uppercase tracking-wider transition shadow"
                        >
                            Submit Message
                        </button>
                    </form>
                </div>
            </section>

            {/* ================= MAP ================= */}
            <section className="container mx-auto max-w-5xl px-6 mt-16">
                <h2 className="text-lg font-bold font-heading text-[#052326] mb-4">Find Us on Map</h2>
                <div className="rounded-[12px] border border-[#052326]/12 overflow-hidden shadow-premium-light">
                    <iframe
                        src="https://maps.google.com/maps?q=jaipur&t=&z=13&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-72 border-0 filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                    ></iframe>
                </div>
            </section>

            {/* ================= FAQ ================= */}
            <section className="container mx-auto max-w-4xl px-6 mt-16">
                <h2 className="text-xl font-bold font-heading text-center text-[#052326] mb-10">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-3.5">
                    {FAQS.map((f, i) => (
                        <details
                            key={i}
                            className="bg-white border border-[#052326]/12 rounded-[12px] p-5 cursor-pointer shadow-premium-light group"
                        >
                            <summary className="font-bold text-xs md:text-sm text-[#052326] list-none flex justify-between items-center outline-none">
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
