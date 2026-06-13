import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers at Cureza - Join India\'s Leading Wellness Marketplace',
    description: 'Explore career opportunities at Cureza. Join our team of innovators building the future of wellness. Full-time roles, internships, and freelance positions available in Jaipur.',
};

const TEAM = [
    "Dr. Farhan Ahmed Khan",
    "Aditi Sharma",
    "Rahul Meena",
    "Sakshi Rajput",
    "Adarsh Singh",
    "Komal Jain",
    "Mohit Chauhan",
    "Riya Sharma",
];

const JOBS = [
    {
        title: "Senior Frontend Developer",
        type: "Full Time",
        location: "Remote / Jaipur",
    },
    {
        title: "Product & Wellness Content Writer",
        type: "Full Time",
        location: "Jaipur",
    },
    {
        title: "Customer Success Associate",
        type: "Full Time",
        location: "Remote",
    },
    {
        title: "Technology & Web Development Intern",
        type: "Internship",
        location: "Jaipur",
    }
];

const CULTURE = [
    {
        title: "You Are Included",
        desc: "No inner circles — radical transparency, open communication, and a supportive culture where every voice matters.",
    },
    {
        title: "You Are In Charge",
        desc: "Experiment, create, and innovate. We believe in ownership-driven work culture.",
    },
    {
        title: "You Have a Life",
        desc: "Flexible work culture, mental health space, and work-life balance at the core.",
    },
    {
        title: "You Always Belong",
        desc: "Diversity makes us stronger. Cureza is a place where everyone feels welcome.",
    }
];

const PERKS = [
    "Personal & Professional Growth",
    "Experience-based Learning",
    "Modern Wellness Culture",
    "Employee Discounts",
    "Free Skill-building Courses",
    "Paid Time Off & Wellness Leave",
    "Performance Bonus",
    "Hybrid Work Options",
    "Creative Freedom",
];

export default function CareersCureza() {
    return (
        <div className="bg-[#F8F3EF] min-h-screen pt-0 pb-20 text-[#052326]">

            {/* HERO SECTION */}
            <section className="relative bg-[#052326] text-[#F8F3EF] py-20 overflow-hidden text-center">
                <div className="container mx-auto px-6 relative z-10 space-y-4">
                    <span className="text-[#F8F3EF]/60 font-bold tracking-wider uppercase text-[10px] px-3.5 py-1 bg-white/10 rounded-full border border-white/10">
                        Join Our Team
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold font-heading leading-tight">
                        Careers at Cureza
                    </h1>
                    <p className="text-xs md:text-sm text-[#F8F3EF]/70 max-w-2xl mx-auto font-light leading-relaxed">
                        Help us build India’s most trusted wellness marketplace.
                        Join the Cureza family and shape the future of holistic health.
                    </p>
                    <a
                        href="mailto:careers@cureza.in"
                        className="inline-block mt-4 px-8 py-3 bg-[#F8F3EF] text-[#052326] hover:bg-[#F8F3EF]/90 rounded-[10px] text-xs font-bold uppercase tracking-wider shadow transition"
                    >
                        Apply Now
                    </a>
                </div>
            </section>

            {/* WHO WE ARE */}
            <section className="container mx-auto px-6 mt-16 max-w-4xl text-center space-y-4">
                <h2 className="text-xl font-bold font-heading text-[#052326]">Who We Are</h2>
                <p className="text-[#052326]/75 text-sm leading-relaxed font-light">
                    Cureza works to enable a healthier, smarter, and more empowered lifestyle
                    through wellness, Ayurveda, and science-backed products.
                    Our mission is to build a world with <strong className="font-semibold text-[#052326]">Healthier People, Healthier Ecosystems,
                    and Healthier Technology</strong> — all powered through wellness innovation.
                </p>
            </section>

            {/* OPPORTUNITIES */}
            <section className="container mx-auto px-6 mt-16 max-w-5xl">
                <h2 className="text-xs font-bold text-[#052326]/40 uppercase tracking-widest text-center mb-8">Opportunities at Cureza</h2>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[12px] border border-[#052326]/12 shadow-premium-light space-y-2">
                        <h3 className="text-sm font-bold text-[#052326] font-heading">Full-time Roles</h3>
                        <p className="text-xs text-[#052326]/60 font-light leading-relaxed">
                            Step into the next big chapter of your professional journey.
                            Build world-class products and inspire millions.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-[12px] border border-[#052326]/12 shadow-premium-light space-y-2">
                        <h3 className="text-sm font-bold text-[#052326] font-heading">Internships</h3>
                        <p className="text-xs text-[#052326]/60 font-light leading-relaxed">
                            Grow your skills, polish your CV, and learn directly from industry experts.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-[12px] border border-[#052326]/12 shadow-premium-light space-y-2">
                        <h3 className="text-sm font-bold text-[#052326] font-heading">Freelancers</h3>
                        <p className="text-xs text-[#052326]/60 font-light leading-relaxed">
                            Work with flexibility and bring your unique creative ideas to life.
                        </p>
                    </div>
                </div>
            </section>

            {/* JOB LISTINGS */}
            <section className="container mx-auto px-6 mt-16 max-w-4xl space-y-6">
                <h2 className="text-xl font-bold font-heading text-[#052326]">
                    Current Openings
                </h2>

                <div className="space-y-4">
                    {JOBS.map((job, index) => (
                        <div key={index} className="bg-white p-5 rounded-[12px] border border-[#052326]/12 shadow-premium-light">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-[#052326] font-heading">
                                        {job.title}
                                    </h3>
                                    <p className="text-xs text-[#052326]/50 font-light">
                                        {job.location} • {job.type}
                                    </p>
                                </div>
                                <a
                                    href="mailto:careers@cureza.in"
                                    className="w-full sm:w-auto text-center bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 px-5 py-2 rounded-[10px] text-xs font-bold uppercase tracking-wider transition"
                                >
                                    Apply
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CULTURE */}
            <section className="container mx-auto px-6 mt-16 max-w-4xl space-y-6">
                <h2 className="text-xl font-bold font-heading text-center text-[#052326]">
                    What Makes Cureza Special?
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {CULTURE.map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-[12px] border border-[#052326]/12 shadow-premium-light space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]">{item.title}</h3>
                            <p className="text-xs text-[#052326]/60 font-light leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* PERKS */}
            <section className="container mx-auto px-6 mt-16 max-w-4xl space-y-6">
                <h2 className="text-xl font-bold font-heading text-center text-[#052326]">
                    Perks & Benefits
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {PERKS.map((perk, i) => (
                        <div key={i} className="bg-white p-4 rounded-[10px] border border-[#052326]/8 text-center shadow-premium-light">
                            <p className="text-xs font-semibold text-[#052326]/80">{perk}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* NO ROLE MATCH */}
            <section className="container mx-auto px-6 mt-16 max-w-4xl bg-white p-8 md:p-10 rounded-[14px] border border-[#052326]/12 shadow-premium-light text-center space-y-4">
                <h2 className="text-lg font-bold font-heading text-[#052326]">
                    Didn’t Find a Role That Matches You?
                </h2>
                <p className="text-xs text-[#052326]/60 font-light max-w-md mx-auto leading-relaxed">
                    We are always growing! If you think you can bring something valuable to Cureza,
                    share your CV and ideas with us.
                </p>
                <p className="text-sm font-extrabold text-[#052326]">
                    Email: careers@cureza.in
                </p>
            </section>

        </div>
    );
}
