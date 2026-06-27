import { Metadata } from 'next';
import { Sparkles, Users, Award, ShieldCheck, Mail, Send, Check } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Affiliate & Brand Ambassador Program - Cureza',
    description: 'Join Cureza as an affiliate or brand ambassador. Promote premium Ayurveda, CBD, and holistic wellness products and earn rewards. Connect with us to get started.',
};

export default function AffiliatePage() {
    return (
        <div className="w-full bg-[#F8F3EF] pb-24 text-[#052326]">
            
            {/* HERO SECTION */}
            <section className="w-full bg-[#052326] text-white py-32 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#052326]/10 blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    <span className="text-[#052326] text-xs font-bold uppercase tracking-widest block">Collaborate & Grow</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-heading leading-tight">
                        Cureza <span className="text-[#052326]">Affiliate & Ambassador</span> Program
                    </h1>
                    <p className="text-lg md:text-xl text-[#F8F3EF]/85 leading-relaxed max-w-2xl mx-auto font-light">
                        Join India's leading modern wellness and Ayurveda platform. Share the benefits of conscious living and earn rewarding incentives while promoting premium products.
                    </p>
                </div>
            </section>

            {/* TWO TRACKS SECTION */}
            <section className="container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    
                    {/* AFFILIATES TRACK */}
                    <div className="bg-white p-10 rounded-3xl border border-[#052326]/5 shadow-sm space-y-8 flex flex-col justify-between hover:border-[#052326]/30 transition-all duration-300">
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#052326]/10 text-[#052326] flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-[#052326] font-heading">Affiliate Program</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Are you a creator, blogger, or wellness practitioner? Partner with us to promote verified alternative health and wellness products to your audience.
                                </p>
                            </div>
                            <div className="border-t border-gray-100 pt-6 space-y-4 text-sm text-gray-600">
                                <p>
                                    We are actively accepting applications for affiliates who are passionate about the wellness industry.
                                </p>
                                <p>
                                    To apply, please email us with a brief idea about how you plan to promote our CBD, Vijaya, Ayurvedic, and Hemp products.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <a 
                                href="mailto:info@cureza.com?subject=Affiliate Program Application" 
                                className="w-full py-4 px-6 bg-[#052326] text-white hover:bg-[#052326] hover:text-[#101828] font-bold rounded-xl text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-2"
                            >
                                <Mail size={16} />
                                Email info@cureza.com
                            </a>
                        </div>
                    </div>

                    {/* BRAND AMBASSADORS TRACK */}
                    <div className="bg-white p-10 rounded-3xl border border-[#052326]/5 shadow-sm space-y-8 flex flex-col justify-between hover:border-[#052326]/30 transition-all duration-300">
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#052326]/10 text-[#052326] flex items-center justify-center">
                                <Award size={24} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-[#052326] font-heading">Brand Ambassador</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Become a shining light for the wellness industry. Get free products, early access, and sponsorships in return for sharing your genuine wellness journey.
                                </p>
                            </div>
                            <div className="border-t border-gray-100 pt-6 space-y-4 text-sm text-gray-600">
                                <p>
                                    We provide ambassadors with regular supplies of our wellness elixirs, organic superfoods, and premium health products.
                                </p>
                                <p>
                                    Let us know how you can help inspire and positively influence our community across your social channels.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 space-y-3">
                            <a 
                                href="https://wa.me/919887860015" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 px-6 bg-[#052326] text-[#101828] hover:bg-[#052326] hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-2 shadow-md"
                            >
                                <Send size={16} />
                                WhatsApp +91 98878 60015
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            {/* BENEFITS / HOW IT WORKS */}
            <section className="bg-white py-20 border-t border-b border-[#052326]/5">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-3xl font-bold text-center text-[#052326] mb-12 font-heading">Why Partner with Cureza?</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#052326]">
                                <Check size={18} />
                                <h3 className="font-bold text-[#052326]">High Quality Products</h3>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Access a catalog of strictly vetted, doctor-certified wellness, CBD, and Ayurvedic products.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#052326]">
                                <Check size={18} />
                                <h3 className="font-bold text-[#052326]">Conscious Community</h3>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Align your personal brand with a platform dedicated to longevity, holistic healing, and natural health.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#052326]">
                                <Check size={18} />
                                <h3 className="font-bold text-[#052326]">Premium Support</h3>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Get priority support, marketing assets, and a direct line to our product development team.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* VISION CALLOUT */}
            <section className="container mx-auto px-6 mt-20 text-center max-w-3xl space-y-6">
                <h3 className="text-2xl font-bold text-[#052326] font-heading">Help Re-Imagine Holistic Wellness</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-light">
                    At Cureza, we believe the ultimate objective of medicine is the harmonious synthesis of longevity and quality of life. By collaborating with us, you are helping to establish a paragon of Natural Health and Alternative Lifestyle across India.
                </p>
            </section>

        </div>
    );
}
