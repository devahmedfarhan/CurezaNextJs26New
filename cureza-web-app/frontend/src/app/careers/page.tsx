import React from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers at Cureza - Join India\'s Leading Wellness Marketplace',
    description: 'Explore career opportunities at Cureza. Join our team of innovators building the future of wellness. Full-time roles, internships, and freelance positions available in Jaipur.',
};

/* ============================================================
   TEAM DATA
   ============================================================ */
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

/* ============================================================
   JOBS DATA
   ============================================================ */
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
    },
    {
        title: "Sales & Business Development Intern",
        type: "Internship",
        location: "Jaipur",
    },
    {
        title: "Freelance Graphic Designer",
        type: "Freelance",
        location: "Remote / Hybrid",
    },
    {
        title: "Freelance Photographer",
        type: "Freelance",
        location: "Jaipur / Hybrid",
    },
];

/* ============================================================
   PERKS & CULTURE
   ============================================================ */
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
    },
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

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function CareersCureza() {
    return (
        <div className="bg-gray-50 min-h-screen pt-0 pb-20">

            {/* HERO SECTION */}
            <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className=" container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Careers at Cureza
                    </h1>
                    <p className="text-lg md:text-xl mt-4 text-emerald-100 max-w-3xl mx-auto">
                        Help us build India’s most trusted wellness marketplace.
                        Join the Cureza family and shape the future of holistic health.
                    </p>

                    <a
                        href="https://forms.gle/KpVT9Example"
                        className="inline-block mt-8 px-10 py-4 bg-white text-emerald-900 rounded-lg  font-semibold hover:bg-gray-100 transition"
                    >
                        Apply Now
                    </a>
                </div>
            </section>


            {/* WHO WE ARE */}
            <section className="container mx-auto px-6 mt-16">
                <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">
                    Who We Are
                </h2>

                <p className="text-gray-700 text-lg leading-relaxed text-center max-w-4xl mx-auto">
                    Cureza works to enable a healthier, smarter, and more empowered lifestyle
                    through wellness, Ayurveda, and science-backed products.
                    Our mission is to build a world with <strong>Healthier People, Healthier Ecosystems,
                        and Healthier Technology</strong> — all powered through wellness innovation.
                </p>
            </section>


            {/* OPPORTUNITIES */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-10 text-center">
                    Opportunities at Cureza
                </h2>

                <div className="grid md:grid-cols-3 gap-8">

                    <div className="bg-white p-8 rounded-lg border">
                        <h3 className="text-xl font-bold text-emerald-900 mb-2">Full-time Roles</h3>
                        <p className="text-gray-600">
                            Step into the next big chapter of your professional journey.
                            Build world-class products and inspire millions.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border">
                        <h3 className="text-xl font-bold text-emerald-900 mb-2">Internships</h3>
                        <p className="text-gray-600">
                            Grow your skills, polish your CV, and learn directly from industry experts.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg border">
                        <h3 className="text-xl font-bold text-emerald-900 mb-2">Freelancers</h3>
                        <p className="text-gray-600">
                            Work with flexibility and bring your unique creative ideas to life.
                        </p>
                    </div>
                </div>
            </section>


            {/* TEAM */}
            <section className=" container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 text-center mb-10">
                    Meet the People Behind Cureza
                </h2>

                <p className="text-center text-gray-600 mb-12">
                    A dedicated team of creators, designers, doctors, developers,
                    marketers, and innovators — building the future of wellness.
                </p>

                <div className="grid md:grid-cols-4 gap-6">
                    {TEAM.map((name, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg border text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-200 mx-auto mb-4"></div>
                            <h4 className="font-semibold text-lg">{name}</h4>
                            <p className="text-gray-500 text-sm">Cureza Team Member</p>
                        </div>
                    ))}
                </div>
            </section>


            {/* JOB LISTINGS */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 mb-8">
                    Current Openings
                </h2>

                <div className="space-y-6">
                    {JOBS.map((job, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-emerald-800">
                                        {job.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {job.location} • {job.type}
                                    </p>
                                </div>

                                <a
                                    href="https://forms.gle/KpVT9Example"
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg border font-semibold hover:bg-emerald-700 transition"
                                >
                                    Apply Now
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <button className="px-8 py-4 bg-emerald-700 text-white rounded-lg border hover:bg-emerald-800">
                        Load More
                    </button>
                </div>
            </section>


            {/* NO ROLE MATCH */}



            {/* CULTURE */}
            <section className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold text-emerald-900 text-center mb-10">
                    What Makes Cureza a Special Place to Work?
                </h2>

                <div className="grid md:grid-cols-2 gap-10">
                    {CULTURE.map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-lg border">
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>


            {/* PERKS */}
            <section className="container mx-auto px-6 mt-20 mb-20">
                <h2 className="text-3xl font-bold text-emerald-900 text-center mb-10">
                    Perks @ Cureza
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {PERKS.map((perk, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg border text-center">
                            <p className="font-semibold text-gray-700">{perk}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container mx-auto px-6 mt-20 bg-white p-10 rounded-lg border">
                <div className="px-6 py-8">
                    <h2 className="text-3xl font-bold text-emerald-900 mb-4">
                        Didn’t Find a Role That Matches You?
                    </h2>
                    <p className="text-gray-700 text-lg mb-6">
                        We are always growing! If you think you can bring something valuable to Cureza,
                        share your CV and ideas with us.
                    </p>

                    <p className="text-lg font-semibold text-emerald-700">
                        Email: careers@cureza.in
                    </p>
                    <a
                        href="https://forms.gle/KpVT9Example"
                        className="inline-block mt-8 px-10 py-4 bg-white text-white rounded-lg bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 font-semibold hover:bg-gray-100 transition"
                    >
                        Apply Now
                    </a>

                </div>

            </section>

        </div>
    );
}
