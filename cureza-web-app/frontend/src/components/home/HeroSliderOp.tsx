'use client';

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        tag: "AYURVEDA · WELLNESS",
        title: "Healing Evolved.",
        subtitle: "Pure, potent, and trusted products crafted to elevate your everyday wellness.",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1920&q=80",
    },
    {
        id: 2,
        tag: "HOLISTIC LIVING",
        title: "Nature Meets Science.",
        subtitle: "Experience the perfect blend of ancient Ayurveda and modern therapy.",
        image: "https://images.unsplash.com/photo-1612158333882-0a433d725a4c?w=1920&q=80",
    },
    {
        id: 3,
        tag: "NATURAL WELLNESS",
        title: "Elevate Your Mind & Body.",
        subtitle: "Carefully curated essentials for energy, balance and a vibrant lifestyle.",
        image: "https://images.unsplash.com/photo-1600718370331-3f0cbdc07e8b?w=1920&q=80",
    }
];

export default function HeroSliderUltra() {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(timer);
    }, [current]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const goToSlide = (index: number) => {
        if (isAnimating || index === current) return;
        setIsAnimating(true);
        setCurrent(index);
        setTimeout(() => setIsAnimating(false), 800);
    };

    return (
        <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8 flex items-center">

            {/* Main Container with Premium Rounded Corners */}
            <div className="relative w-full h-[85vh] rounded-[20px] overflow-hidden shadow-2xl">

                {/* Background Images */}
                {SLIDES.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Premium Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    </div>
                ))}

                {/* Content Container */}
                <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-6 md:px-12 lg:px-16">
                        {SLIDES.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`max-w-4xl transition-all duration-700 ${index === current
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-8 absolute'
                                    }`}
                            >
                                {/* Premium Tag */}
                                <div className="inline-block mb-6">
                                    <span className="px-5 py-2 text-xs font-medium tracking-[0.3em] text-white uppercase bg-white/15 backdrop-blur-xl rounded-full border border-white/20 shadow-lg">
                                        {slide.tag}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-6">
                                    {slide.title}
                                </h1>

                                {/* Subtitle */}
                                <p className="text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-2xl font-light mb-10">
                                    {slide.subtitle}
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <button className="group px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2">
                                        Shop Now
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>

                                    <button className="px-8 py-4 bg-white/15 backdrop-blur-xl border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-all duration-300 shadow-xl hover:scale-105">
                                        Learn More
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <button
                    onClick={handlePrev}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-xl border border-white/20 text-white p-3 md:p-4 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-xl"
                >
                    <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
                </button>

                <button
                    onClick={handleNext}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-xl border border-white/20 text-white p-3 md:p-4 rounded-full hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-xl"
                >
                    <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
                </button>

                {/* Progress Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {SLIDES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="relative group"
                        >
                            <div className={`h-1.5 rounded-full transition-all duration-500 ${index === current
                                ? "w-12 bg-white shadow-lg shadow-white/50"
                                : "w-8 bg-white/40 hover:bg-white/60 group-hover:w-10"
                                }`} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


