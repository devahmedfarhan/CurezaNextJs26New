import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Cureza - Get 24/7 Wellness Support | Help Center',
    description: 'Contact Cureza for customer support, doctor consultations, seller inquiries, and wellness guidance. Available 24/7 via email, phone, or contact form. Based in Jaipur, Rajasthan.',
};

/* ============================================================
   DATA VARIABLES
   ============================================================ */

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
    },
    {
        q: "Do Ayurvedic products take longer to show results?",
        a: "Ayurveda focuses on long-term healing, not instant relief. Most users notice improvement within 7–21 days depending on the condition.",
    },
    {
        q: "Are Cureza’s herbal products 100% authentic?",
        a: "Yes. We strictly verify AYUSH, GMP, ISO, FSSAI certifications before allowing any product on our marketplace.",
    },
    {
        q: "Can I combine Ayurveda with modern supplements?",
        a: "Yes, in most cases. But depending on your condition, our doctors can tell you the safest combination.",
    },
    {
        q: "Are wellness oils and extracts suitable for sensitive skin?",
        a: "We recommend patch-testing herbal oils. For sensitive skin concerns, use hypoallergenic or dermat-approved products.",
    },
    {
        q: "Do you provide personalized Ayurvedic treatment plans?",
        a: "Yes! Cureza doctors offer tailored healing plans based on Dosha analysis, diet, lifestyle, and symptoms.",
    }
];


/* ============================================================
   MAIN UI COMPONENT
   ============================================================ */

export default function ContactCureza() {
    return (
        <div className="w-full bg-gradient-to-b from-emerald-50 to-white min-h-screen pb-24">

            {/* ================= HEADER ================= */}
            <section className="text-center px-6 py-24 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white">
                <h1 className="text-3xl md:text-4xl font-bold">
                    We’re Here to Help You
                </h1>
                <p className="text-lg md:text-md text-emerald-100 mt-4 max-w-2xl mx-auto">
                    Reach Cureza’s wellness team anytime—customers, sellers, doctors & partners.
                    We're always available to support you.
                </p>
            </section>

            {/* =============== CONTACT FORM + INFO =============== */}
            <section className="container mx-auto grid md:grid-cols-2 gap-12 px-6 -mt-16">

                {/* LEFT SIDE: CONTACT INFO CARD */}
                {/* LEFT SIDE: CONTACT INFO GRID BLOCK */}
                <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-lg border p-12">

                    <h2 className="text-3xl font-bold text-emerald-900 mb-10">
                        Contact Information
                    </h2>

                    {/* GRID BOX */}
                    <div className="grid md:grid-cols-1 gap-10">

                        {/* EMAIL */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-emerald-800"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-1.086 1.922l-7.5 4.286a2.25 2.25 0 01-2.328 0l-7.5-4.286a2.25 2.25 0 01-1.086-1.922V6.75"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-wide text-gray-500">Email</p>
                                <p className="text-lg font-semibold text-emerald-800">
                                    help@cureza.in
                                </p>
                            </div>
                        </div>

                        {/* PHONE */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-emerald-800"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M2.25 4.5l2.955-.591a2.25 2.25 0 012.373 1.147l1.267 2.308a2.25 2.25 0 01-.287 2.622L6.53 12.47a17.94 17.94 0 008.999 8.999l2.484-2.029a2.25 2.25 0 012.622-.287l2.308 1.267a2.25 2.25 0 011.147 2.373L21 21.75"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-wide text-gray-500">Phone</p>
                                <p className="text-lg font-semibold text-emerald-800">
                                    +91 98765 43210
                                </p>
                            </div>
                        </div>

                        {/* ADDRESS */}
                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-emerald-800"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 3c-2.813 0-5.25 2.029-5.25 4.875 0 3.938 5.25 10.125 5.25 10.125s5.25-6.187 5.25-10.125C17.25 5.03 14.813 3 12 3z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm uppercase tracking-wide text-gray-500">Address</p>
                                <p className="text-lg font-semibold text-emerald-800">
                                    Jaipur, Rajasthan, India
                                </p>
                            </div>
                        </div>

                    </div>

                    <a
                        href="/help-center"
                        className="inline-block mt-10 text-emerald-700 font-semibold border-b border-emerald-600 pb-1 hover:text-emerald-800 transition"
                    >
                        Visit Help Center →
                    </a>
                </div>


                {/* RIGHT SIDE: FORM */}
                <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-lg border p-12">
                    <h2 className="text-3xl font-bold text-emerald-900 mb-8">
                        Send Us a Message
                    </h2>

                    <form className="space-y-6">

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 rounded-lg border border border-gray-300 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 rounded-lg border border border-gray-300 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+91 00000 00000"
                                className="w-full px-4 py-3 rounded-lg border border border-gray-300 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">You Are</label>
                            <select className="w-full px-4 py-3 rounded-sm border border border-gray-300 focus:outline-none">
                                <option>Customer</option>
                                <option>Seller</option>
                                <option>Doctor</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Your Query</label>
                            <textarea
                                rows={4}
                                placeholder="Write your message..."
                                className="w-full px-4 py-3 rounded-lg border border border-gray-300 focus:outline-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-emerald-700 text-white py-3 rounded-lg border text-lg font-semibold hover:bg-emerald-800 transition"
                        >
                            Submit Message
                        </button>
                    </form>
                </div>
            </section>


            {/* ================= MAP ================= */}
            <section className="container mx-auto  px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-4">Find Us on Map</h2>

                <div className="rounded-lg border overflow-hidden border border-emerald-100">
                    <iframe
                        src="https://maps.google.com/maps?q=jaipur&t=&z=13&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-80"
                    ></iframe>
                </div>
            </section>


            {/* ================= FAQ ================= */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 text-center mb-10">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                    {FAQS.map((f, i) => (
                        <details
                            key={i}
                            className="bg-white border border-emerald-100 rounded-2xl p-6 cursor-pointer"
                        >
                            <summary className="font-semibold text-lg text-emerald-900">
                                {f.q}
                            </summary>
                            <p className="mt-3 text-gray-600">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>


            {/* ================= FINAL CTA ================= */}
            <div className="text-center mt-20">
                <a
                    href="/help-center"
                    className="px-10 py-4 bg-emerald-700 text-white rounded-lg border text-lg font-semibold hover:bg-emerald-800"
                >
                    Visit Help Center
                </a>
            </div>
        </div>
    );
}
