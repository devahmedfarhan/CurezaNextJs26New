import React from "react";
import { Metadata } from 'next';
import { 
    Briefcase, 
    MapPin, 
    Compass, 
    Smile, 
    Users, 
    Target, 
    Sparkles, 
    Mail, 
    Heart, 
    Award, 
    Clock, 
    TrendingUp, 
    Coffee
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Careers at Cureza - Join India\'s Leading Wellness Marketplace',
    description: 'Explore career opportunities at Cureza. Join our team of innovators building the future of wellness. Full-time roles, internships, and freelance positions available in Jaipur.',
};

const JOBS = [
    {
        title: "Senior Frontend Developer",
        type: "Full Time",
        location: "Remote / Jaipur",
        department: "Engineering"
    },
    {
        title: "Product & Wellness Content Writer",
        type: "Full Time",
        location: "Jaipur Office",
        department: "Marketing"
    },
    {
        title: "Customer Success Associate",
        type: "Full Time",
        location: "Remote",
        department: "Operations"
    },
    {
        title: "Technology & Web Development Intern",
        type: "Internship",
        location: "Jaipur Office",
        department: "Engineering"
    }
];

const CULTURE = [
    {
        title: "Radical Transparency",
        desc: "No inner circles. We practice open logs, direct feedback, and inclusive communication where every voice shapes our roadmap.",
        icon: Users
    },
    {
        title: "True Ownership",
        desc: "We don't micromanage. You own your scope, experiment, make mistakes, learn, and claim full credit for your wins.",
        icon: Target
    },
    {
        title: "Life Comes First",
        desc: "Work-life balance is not a buzzword here. Flexible timing, proactive mental health days, and zero weekend check-ins.",
        icon: Smile
    },
    {
        title: "Diversity & Respect",
        desc: "Everyone belongs. We bring together developers, healers, designers, and creators from all walks of life.",
        icon: Compass
    }
];

const PERKS = [
    { name: "Continuous Learning", desc: "Paid courses & book allowances", icon: Award },
    { name: "Wellness Allowance", desc: "Free consultations & checkups", icon: Heart },
    { name: "Flexible Schedule", desc: "Work from home / office", icon: Clock },
    { name: "Exclusive Discounts", desc: "Up to 30% off Cureza products", icon: Sparkles },
    { name: "Growth Ecosystem", desc: "Direct mentorship from leaders", icon: TrendingUp },
    { name: "Vibrant Workspaces", desc: "Snacks, coffee & creative hubs", icon: Coffee }
];

export default function CareersCureza() {
    const cardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none',
    };

    return (
        <div className="bg-[#F8F3EF] min-h-screen text-[#052326] pt-8">
            
            {/* HERO SECTION */}
            <div className="container mx-auto px-4 md:px-6">
                <section style={{ ...cardStyle, border: 'none' }} className="relative bg-[#052326] text-[#F8F3EF] py-24 md:py-32 overflow-hidden text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(240,196,23,0.08),transparent_70%)]" />
                    <div className="container mx-auto px-4 md:px-6 relative z-10 space-y-6">
                        <span className="text-[#F0C417] font-semibold tracking-widest text-[10px] px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                            Join Cureza Circle & Grow
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-none font-serif text-white">
                            Build the Future of <br className="hidden md:block" />
                            <span className="text-[#F0C417]">Holistic Wellness</span>
                        </h1>
                        <p className="text-sm md:text-base text-[#F8F3EF]/75 max-w-2xl mx-auto font-light leading-relaxed">
                            Cureza is building India’s premium wellness marketplace. Join an ambitious team of builders, doctors, and designers working to empower healthy living.
                        </p>
                        <div className="pt-4">
                            <a
                                href="#openings"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F0C417] text-[#052326] hover:bg-[#F0C417]/90 rounded-[8px] text-xs font-semibold tracking-wider transition-transform duration-200"
                            >
                                Explore Open Roles
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* PURPOSE & MISSION */}
            <section className="container mx-auto px-4 md:px-6 py-20">
                <div className="grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 space-y-2">
                        <span className="text-xs font-semibold text-[#052326]/40">Who We Are</span>
                        <h2 className="text-3xl font-semibold font-serif leading-tight">Our Mission & Purpose</h2>
                    </div>
                    <div className="md:col-span-7">
                        <p className="text-[#052326]/80 text-sm md:text-base leading-relaxed font-light">
                            We are on a mission to build a world with <strong className="font-semibold text-[#052326]">Healthier People, Sustainable Ecosystems, and Transparent Technology</strong>. Cureza connects authentic Ayurvedic brands, certified practitioners, and health-conscious customers into a single premium ecosystem.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-16">
                    <div style={cardStyle} className="bg-white p-8 space-y-3">
                        <span className="text-xs font-semibold text-[#F0C417] bg-[#052326] px-2.5 py-0.5 rounded-[4px]">01</span>
                        <h3 className="text-lg font-semibold">Full-time Positions</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Step into the next big chapter of your career. Lead departments, design features, and inspire change.
                        </p>
                    </div>

                    <div style={cardStyle} className="bg-white p-8 space-y-3">
                        <span className="text-xs font-semibold text-[#F0C417] bg-[#052326] px-2.5 py-0.5 rounded-[4px]">02</span>
                        <h3 className="text-lg font-semibold">Structured Internships</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Gain hands-on industry experience, receive direct 1-on-1 mentorship, and work on production code bases.
                        </p>
                    </div>

                    <div style={cardStyle} className="bg-white p-8 space-y-3">
                        <span className="text-xs font-semibold text-[#F0C417] bg-[#052326] px-2.5 py-0.5 rounded-[4px]">03</span>
                        <h3 className="text-lg font-semibold">Creative Freelance</h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Bring your specialized designer, copywriter, or creator talents to our seasonal wellness campaigns.
                        </p>
                    </div>
                </div>
            </section>

            {/* CULTURE */}
            <section className="bg-white border-y border-[#052326]/6 py-20">
                <div className="container mx-auto px-4 md:px-6 space-y-12">
                    <div className="text-center max-w-xl mx-auto space-y-2">
                        <h2 className="text-3xl font-semibold font-serif">What Makes Cureza Special?</h2>
                        <p className="text-gray-500 text-sm">We believe that brilliant products are built by happy, empowered, and well-rested teams.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {CULTURE.map((item, i) => {
                            const IconComponent = item.icon;
                            return (
                                <div key={i} style={cardStyle} className="p-6 bg-[#F8F3EF]/40 flex items-start gap-4">
                                    <div className="p-3 bg-[#052326] text-[#F0C417] rounded-[8px] shrink-0">
                                        <IconComponent size={20} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="font-semibold text-[#052326] text-base">{item.title}</h3>
                                        <p className="text-xs text-[#052326]/70 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* PERKS */}
            <section className="container mx-auto px-4 md:px-6 py-20 space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                    <h2 className="text-3xl font-semibold font-serif">Cureza Perks & Benefits</h2>
                    <p className="text-gray-500 text-sm">Beyond standard compensations, we provide a wellness environment designed for your comfort.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PERKS.map((perk, i) => {
                        const IconComponent = perk.icon;
                        return (
                            <div key={i} style={cardStyle} className="bg-white p-6 flex items-center gap-4 hover:border-[#052326]/20 transition-all">
                                <div className="p-2.5 bg-[#F8F3EF] text-[#052326] rounded-[8px]">
                                    <IconComponent size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#052326]">{perk.name}</p>
                                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{perk.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* JOB LISTINGS */}
            <section id="openings" className="bg-white border-y border-[#052326]/6 py-20">
                <div className="container mx-auto px-4 md:px-6 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold text-[#052326]/40">Active Vacancies</span>
                            <h2 className="text-3xl font-semibold font-serif mt-1">Current Openings</h2>
                        </div>
                        <p className="text-xs text-gray-500 font-semibold max-w-xs md:text-right">
                            If you fit any of these roles, hit apply and attach your CV or GitHub portfolio.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {JOBS.map((job, index) => (
                            <div key={index} style={cardStyle} className="bg-white p-6 hover:border-[#052326]/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-semibold tracking-wider bg-[#052326]/5 text-[#052326] px-2.5 py-1 rounded-full">
                                        {job.department}
                                    </span>
                                    <h3 className="text-lg font-semibold text-[#052326] pt-1">
                                        {job.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold">
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                                    </div>
                                </div>
                                <a
                                    href={`mailto:careers@cureza.in?subject=Application for ${encodeURIComponent(job.title)}`}
                                    className="w-full sm:w-auto text-center bg-[#052326] hover:bg-[#F0C417] hover:text-[#052326] text-white px-6 py-3 rounded-[8px] text-xs font-semibold tracking-wider transition-colors"
                                >
                                    Apply Now
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NO ROLE MATCH */}
            <section className="container mx-auto px-4 md:px-6 py-20 text-center">
                <div style={{ ...cardStyle, border: 'none', backgroundColor: '#052326' }} className="rounded-[8px] p-8 md:p-12 text-white space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(240,196,23,0.05),transparent_60%)]" />
                    <div style={{ ...cardStyle, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }} className="p-3 text-[#F0C417] w-fit mx-auto">
                        <Mail size={28} />
                    </div>
                    <div className="space-y-2 relative z-10">
                        <h2 className="text-2xl font-semibold font-serif">Didn’t Find a Role That Matches You?</h2>
                        <p className="text-xs md:text-sm text-white/70 max-w-md mx-auto leading-relaxed font-light">
                            We are constantly scaling! If you want to contribute in another department (e.g. Design, Supply Chain, Doctor Network), email us.
                        </p>
                    </div>
                    <div className="relative z-10 pt-2">
                        <p className="text-xs font-semibold text-white/40 tracking-wider">Send Pitch & Resume to</p>
                        <p className="text-lg font-semibold text-[#F0C417] mt-0.5">careers@cureza.in</p>
                    </div>
                </div>
            </section>

        </div>
    );
}
