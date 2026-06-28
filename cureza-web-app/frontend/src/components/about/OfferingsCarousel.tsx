'use client';

import React, { useRef, useState } from 'react';
import { 
    Sparkles, Gem, Music, Sprout, Coffee, Activity, 
    Leaf, Shirt, Compass, Heart, CheckCircle2, ChevronLeft, ChevronRight 
} from 'lucide-react';

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

export default function OfferingsCarousel() {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        if (sliderRef.current) {
            setStartX(e.pageX - sliderRef.current.offsetLeft);
            setScrollLeft(sliderRef.current.scrollLeft);
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        if (sliderRef.current) {
            const x = e.pageX - sliderRef.current.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag speed modifier
            sliderRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const { scrollLeft } = sliderRef.current;
            const cardWidth = 320 + 24; // Card width + gap
            const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
            sliderRef.current.scrollTo({
                left: scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const cardStyle: React.CSSProperties = {
        borderRadius: '8px',
        border: '1px solid rgba(85, 85, 85, 0.18)',
        boxShadow: 'none',
        filter: 'none',
    };

    return (
        <div className="relative w-full group">
            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={() => scroll('left')}
                    className="p-2.5 rounded-full bg-[#052326] text-[#F0C417] hover:bg-[#052326]/90 transition shadow border border-[rgba(85,85,85,0.18)]"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>
            
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={() => scroll('right')}
                    className="p-2.5 rounded-full bg-[#052326] text-[#F0C417] hover:bg-[#052326]/90 transition shadow border border-[rgba(85,85,85,0.18)]"
                    aria-label="Next page"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Scrollable Container */}
            <div 
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
            >
                {offerings.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                        <div 
                            key={idx} 
                            style={cardStyle}
                            className="bg-white p-8 space-y-4 shrink-0 w-[300px] md:w-[320px] snap-start hover:border-[#052326]/40 transition duration-300"
                        >
                            <div className="w-10 h-10 rounded-[8px] bg-[#052326]/5 flex items-center justify-center text-[#052326] border border-[rgba(85,85,85,0.08)]">
                                <IconComp size={20} />
                            </div>
                            <h3 className="font-semibold text-lg text-[#052326]">{item.title}</h3>
                            <p className="text-[#052326]/75 text-xs leading-relaxed font-light">
                                {item.desc}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
