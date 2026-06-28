'use client';
import React from 'react';
import Link from 'next/link';

export default function PressPage() {
    const pressItems = [
        {
            outlet: 'Vogue',
            quote: 'Cureza is revolutionizing the way India shops for Ayurvedic medicines by bringing doctors and authentic sellers on one platform.',
            link: '#'
        },
        {
            outlet: 'Forbes',
            quote: 'A clinical yet highly curated approach to modern wellness. Cureza sets a new benchmark in marketplace authenticity.',
            link: '#'
        },
        {
            outlet: 'YourStory',
            quote: 'Building trust in the AYUSH ecosystem: Cureza’s unique doctor onboarding timeline makes onboarding seamless and safe.',
            link: '#'
        }
    ];

    const cardStyle = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none',
    };

    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto px-4 md:px-6 space-y-10">
                <div className="text-center space-y-3">
                    <span className="text-[#052326] font-semibold tracking-wider text-[10px] px-3.5 py-1 bg-[#052326]/5 rounded-full border border-[#052326]/10">
                        Press & Media Kit
                    </span>
                    <h1 className="text-3xl font-semibold font-heading text-[#052326]">In the News</h1>
                    <p className="text-xs text-[#052326]/50 max-w-md mx-auto font-light">Explore recent features, media coverages, and download our official visual brand elements.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pressItems.map((item, i) => (
                        <div key={i} style={cardStyle} className="bg-white p-6 flex flex-col justify-between h-52 transition">
                            <div className="space-y-3">
                                <span className="text-xs font-semibold tracking-widest text-[#052326]/40 block">{item.outlet}</span>
                                <p className="text-xs text-[#052326]/75 font-light leading-relaxed italic">"{item.quote}"</p>
                            </div>
                            <a href={item.link} className="text-xs font-semibold tracking-wider text-[#052326]/70 hover:text-[#052326] mt-4 flex items-center gap-1">
                                Read Full Story &rarr;
                            </a>
                        </div>
                    ))}
                </div>

                {/* Media assets download box */}
                <div style={cardStyle} className="bg-white p-8 md:p-10 text-center space-y-4">
                    <h2 className="text-lg font-semibold font-heading text-[#052326]">Brand Assets Kit</h2>
                    <p className="text-xs text-[#052326]/60 font-light max-w-md mx-auto leading-relaxed">
                        Need official high-resolution logos, brand guidelines, or founder bios? Download the complete media kit below.
                    </p>
                    <button className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 px-6 py-2.5 rounded-[8px] text-xs font-semibold tracking-wider transition">
                        Download Press Kit (.Zip)
                    </button>
                </div>
            </div>
        </div>
    );
}
