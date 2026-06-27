import { Metadata } from 'next';
import { 
    Sparkles, Gem, Music, Sprout, Coffee, Activity, 
    Leaf, Shirt, Compass, Heart, HelpCircle, ArrowRight, CheckCircle2 
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Cureza - India\'s First 360° Wellness & Ayurveda Marketplace',
    description: 'Discover Cureza, India\'s leading wellness ecosystem founded by Dr. Farhan Ahmed Khan. Empowering small brands with Ayurveda, CBD wellness, and doctor-led care. Join 8,000+ happy customers.',
};

export default function AboutCureza() {
    const offerings = [
        { title: "Herbal Teas", desc: "Savor the natural goodness and therapeutic benefits of our carefully selected herbal blends.", icon: Coffee },
        { title: "Yoga Tools & Mats", desc: "Enhance your practice with our high-quality, eco-friendly yoga accessories.", icon: Activity },
        { title: "Yoga Retreats", desc: "Immerse yourself in tranquility and rejuvenation at our serene yoga retreats.", icon: Heart },
        { title: "Shamanic Retreats", desc: "Experience profound healing and spiritual growth through our shamanic retreats.", icon: Compass },
        { title: "Medicinal Mushrooms", desc: "Discover the health benefits of our non-psychotropic medicinal mushrooms.", icon: Sparkles },
        { title: "Herbal Blends", desc: "Enjoy the potent benefits of our expertly crafted herbal blends.", icon: Sprout },
        { title: "Multivitamins", desc: "Support your daily health with our comprehensive range of organic multivitamins.", icon: CheckCircle2 },
        { title: "Herbal & Ayurvedic Elixirs", desc: "Revitalize your body with our traditional wellness elixirs.", icon: Leaf },
        { title: "Crystals", desc: "Harness the natural energy of our carefully sourced, authentic crystals.", icon: Gem },
        { title: "Sound Instruments", desc: "Explore the healing power of sound with our curated wellness instruments.", icon: Music },
        { title: "Wellness Retreats", desc: "Find peace and balance at our holistic, nature-immersed wellness retreats.", icon: Compass },
        { title: "Hemp & Superfood Nutrition", desc: "Nourish your body with our organic, sustainably sourced superfoods.", icon: Sprout },
        { title: "Sustainable Clothing", desc: "Embrace eco-friendly fashion with our stylish clothing and accessories.", icon: Shirt }
    ];

    return (
        <div className="w-full bg-[#F8F3EF] pb-24 text-[#052326]">

            {/* HERO SECTION */}
            <section className="w-full bg-[#052326] text-white py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#052326]/10 blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-heading leading-tight">
                        About <span className="text-[#052326]">Cureza</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#F8F3EF]/85 leading-relaxed max-w-3xl mx-auto">
                        Introducing Cureza, an embodiment of a profound vision reborn—an Odyssey that encapsulates the aspirations of our forebears. This endeavor seamlessly resurrects ancient dreams and wisdom, fusing them with contemporary innovation.
                    </p>
                    <p className="pt-4 text-[#F8F3EF]/70 font-medium text-sm">
                        Founded by Dr. Farhan Ahmed Khan — CEO & Chief Technologist, Cureza
                    </p>
                </div>
            </section>

            {/* THE ODYSSEY & VISION */}
            <section className="container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="border-l-4 border-[#052326] pl-6 py-2">
                        <p className="text-xl md:text-2xl font-semibold italic text-[#052326] leading-relaxed">
                            "While the nomenclature 'Cureza' may suggest its nature as a simple wellness marketplace, it goes far beyond the surface. Uncover a realm of limitless dimensions, an intricate fusion of Medical Cannabis, CBD, Fungi, Hemp, Herbal, and other avant-garde Supplements."
                        </p>
                    </div>

                    <p className="text-gray-700 text-lg leading-relaxed">
                        At the core of our mission lies a fundamental query: <strong>"What is the ultimate objective of medicine?"</strong> We believe it's the harmonious synthesis of longevity and quality of life. With this pursuit in mind, we are steadfastly evolving into a paragon of Natural Health and Alternative Lifestyle—a manifestation of the finest products, services, and educational resources about Hemp, Ayurveda, and medical cannabis on behalf of several esteemed brands in India.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 pt-8">
                        <div className="bg-white p-8 rounded-2xl border border-[#052326]/5 shadow-sm space-y-4">
                            <h3 className="text-xl font-bold text-[#052326]">Heritage & Progress</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Contemplate the era when our ancestors first harnessed the potency of herbs, concocting potent elixirs within exquisitely engraved vessels. This fusion catalyzed a transformation of the human experience, giving rise to yoga, the Kamasutra, the Vedas, sitars, and mandalas.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-[#052326]/5 shadow-sm space-y-4">
                            <h3 className="text-xl font-bold text-[#052326]">Holistic Reimagination</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Cureza endeavors to rekindle and reimagine a culture devoted to holistic transformation of mind, body, and soul. It serves as a hub for hemp, fungi, CBD, Medical Cannabis, Herbal products, and an array of services including healing centers, classes, and artistic offerings.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CURATED OFFERINGS MARKETPLACE */}
            <section className="bg-white py-20 border-t border-b border-[#052326]/5">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                        <span className="text-[#052326] text-xs font-bold uppercase tracking-widest block">Explore Our Offerings</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#052326] font-heading">
                            Our Curated Modern Wellness Marketplace
                        </h2>
                        <p className="text-gray-500 text-base leading-relaxed">
                            Welcome to our curated modern wellness marketplace, where ancient wisdom meets contemporary living. We are dedicated to providing a holistic approach to well-being, offering a diverse range of products and services designed to bring relief and positive transformation to your life.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offerings.map((item, idx) => {
                            const IconComp = item.icon;
                            return (
                                <div key={idx} className="bg-[#F8F3EF]/40 p-8 rounded-2xl border border-[#052326]/5 space-y-4 hover:border-[#052326]/40 transition duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-[#052326]/10 flex items-center justify-center text-[#052326]">
                                        <IconComp size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg text-[#052326]">{item.title}</h3>
                                    <p className="text-gray-600 text-xs leading-relaxed font-light">
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="max-w-3xl mx-auto text-center mt-12 text-gray-700 text-sm leading-relaxed">
                        We serve as a singular point for you to immerse yourself in the lifestyle of the conscious wellness community. Our vision is deeply rooted in using ancient methods to improve the quality of life in all aspects—mind, body, and soul. We believe in finding bliss through holistic practices and aim to guide you on your journey to well-being and harmony.
                    </div>
                </div>
            </section>

            {/* INTEGRATED CLINICAL CARE & COLLABORATION */}
            <section className="container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#052326] mb-6">
                            Estemed Medical Consortium
                        </h2>
                        <p className="text-gray-700 text-base leading-relaxed mb-6">
                            Our offerings extend beyond mere products; we boast an esteemed team of cross-disciplinary Doctors in Homeopathic, Ayurvedic, and Allopathic practices. They proffer consultations, prescriptions, and comprehensive treatment plans.
                        </p>
                        <p className="text-gray-700 text-base leading-relaxed mb-6">
                            This medical consortium is complemented by a cadre of gifted healers and experts—from yoga mentors and karlakattai masters to Crystal and sound therapists, alongside certified counselors.
                        </p>
                        <p className="text-gray-700 text-base leading-relaxed">
                            For those desiring to participate in the hemp and wellness industry, we extend avenues for collaboration. Whether you're a Doctor, healer, artist, influencer, or brand, opportunities abound to join forces with us.
                        </p>
                    </div>
                    <div className="bg-[#052326] text-white p-8 rounded-2xl space-y-6">
                        <h3 className="text-xl font-bold text-[#052326]">Join Our Conscious Movement</h3>
                        <p className="text-sm text-white/80 leading-relaxed font-light">
                            Stepping into Cureza is an immersive venture, a passage into a realm far beyond the ordinary—a testament to the convergence of heritage and progress, redefining wellness and holistic living.
                        </p>
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <div className="flex items-center gap-3 text-xs text-white/90">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#052326]"></span>
                                Certified Ayurvedic & Homeopathic Panel
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/90">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#052326]"></span>
                                Shamanic & Yoga Retreat Programs
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/90">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#052326]"></span>
                                Influencer & Brand Collaborations
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOUNDER STORY SECTION */}
            <section className="container mx-auto px-6 py-12 border-t border-[#052326]/5">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* LEFT SIDE — TEXT */}
                    <div>
                        <h2 className="text-3xl font-extrabold text-[#052326] mb-6">
                            The Founder Story
                        </h2>

                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                            Cureza was founded by <span className="font-semibold text-[#052326]">Dr. Farhan Ahmed Khan</span> — a technologist, creator, and wellness advocate who believes that every Indian deserves access to genuine, affordable, and doctor-backed wellness solutions.
                        </p>

                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                            Growing up, Farhan experienced how small brands struggled to reach customers, while big platforms favored only big companies. He envisioned a digital ecosystem where <strong>Ayurveda, CBD, natural herbs, and wellness products</strong> could live together — supported by verified doctors, real reviews, and fair exposure.
                        </p>

                        <p className="text-gray-700 text-sm leading-relaxed">
                            Cureza is more than a marketplace — it is a movement to uplift small wellness brands, support the Indian herbal ecosystem, and bring a 360° digital revolution to health and wellness.
                        </p>

                        <div className="mt-8">
                            <p className="text-[#052326] font-semibold text-lg italic">
                                “Wellness should not be a luxury. It should reach every home in India.”
                            </p>
                            <p className="mt-2 text-gray-500 font-medium text-xs">— Dr. Farhan Ahmed Khan</p>
                        </div>
                    </div>

                    {/* RIGHT SIDE — IMAGE PLACEHOLDER */}
                    <div className="w-full h-full">
                        <div className="w-full h-80 rounded-[12px] bg-[#052326]/10 border border-[#052326]/10 flex items-center justify-center">
                            <span className="text-[#052326]/40 font-medium text-sm">Dr. Farhan Ahmed Khan</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* MILESTONES SECTION */}
            <section className="container mx-auto px-6 mt-20">
                <div className="grid md:grid-cols-4 gap-10 text-center">
                    {[
                        { num: "1000+", label: "Products Listed" },
                        { num: "120+", label: "Verified Brands" },
                        { num: "50+", label: "Expert Doctors" },
                        { num: "8,000+", label: "Customers Served" },
                    ].map((m, i) => (
                        <div key={i} className="bg-white border border-[#052326]/10 rounded-[12px] p-8 shadow-sm">
                            <h3 className="text-3xl font-bold text-[#052326]">{m.num}</h3>
                            <p className="text-gray-600 mt-2 text-sm">{m.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* BRAND CAROUSEL */}
            <section className="container mx-auto px-6 mt-28">
                <h2 className="text-3xl font-bold text-[#052326] mb-10 text-center">
                    Brands That Trust Cureza
                </h2>

                <div className="overflow-hidden relative">
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
                                className="px-10 py-5 bg-white rounded-[12px] border border-[#052326]/10 text-[#052326] font-semibold text-lg min-w-[200px] text-center shadow-sm"
                            >
                                {brand}
                            </div>
                        ))}

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
                                className="px-10 py-5 bg-white rounded-[12px] border border-[#052326]/10 text-[#052326] font-semibold text-lg min-w-[200px] text-center shadow-sm"
                            >
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>

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

            {/* CUREZA HELP/CONTACT CTA */}
            <section className="container mx-auto px-6 mt-28 mb-20">
                <div className="bg-[#052326] text-white rounded-[12px] py-12 px-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
                            Have Questions or Need Help?
                        </h2>

                        <p className="text-[#F8F3EF]/80 text-lg max-w-2xl mx-auto mb-10">
                            Our customer care, doctor support, and partner success teams are here
                            to guide you on your wellness journey.
                        </p>

                        <a
                            href="/contact"
                            className="inline-block px-12 py-4 rounded-[10px] bg-[#052326] text-[#101828] font-bold text-sm transition hover:bg-[#052326]/90"
                        >
                            Contact Cureza
                        </a>
                    </div>
                </div>
            </section>

        </div>
    );
}
