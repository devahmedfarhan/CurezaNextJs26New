'use client';

import { useEffect, useState } from 'react';

const TEXT_SETS = [
    {
        text: "Wellness • Ayurveda • Holistic Care • Heal Better • ",
        gradient: "from-emerald-600 via-teal-600 to-emerald-700"
    },
    {
        text: "Clearance Sale • 50% Off • Mega Discounts • Limited Time Offer • ",
        gradient: "from-red-600 via-red-500 to-red-700"
    }
];

export default function SmoothMarquee() {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            setFade(true);

            setTimeout(() => {
                setIndex((prev) => (prev + 1) % TEXT_SETS.length);
                setFade(false); // Fade in
            }, 600);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const current = TEXT_SETS[index];

    return (
        <div
            className={`relative overflow-hidden py-3 transition-all duration-[1200ms] bg-gradient-to-r ${current.gradient}`}
        >
            {/* Texture */}
            <div className="absolute inset-0 rotate-[-2deg] opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagonal-noise.png')]" />

            <div
                className={`
                    transition-all duration-[600ms] 
                    ${fade ? "opacity-0 scale-[1.03]" : "opacity-100 scale-100"}
                `}
            >
                <div className="whitespace-nowrap overflow-hidden flex items-center relative">

                    {/* Track 1 */}
                    <div className="marquee inline-flex items-center gap-10 text-white text-sm font-light">
                        {Array(10).fill(current.text).map((t, i) => (
                            <span key={i} className="tracking-widest">{t}</span>
                        ))}
                    </div>

                    {/* Track 2 */}
                    <div className="marquee2 inline-flex items-center gap-10 text-white text-sm font-light absolute left-full">
                        {Array(10).fill(current.text).map((t, i) => (
                            <span key={i} className="tracking-widest">{t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
