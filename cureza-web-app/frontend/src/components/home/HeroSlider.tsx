'use client';

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const SLIDES = [
    {
        id: 1,
        tag: "AYURVEDA · WELLNESS",
        title: "Healing Evolved.",
        subtitle: "Pure, potent, and trusted products crafted to elevate your everyday wellness",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1920&q=80",
        color: "from-emerald-600/20 to-teal-600/20"
    },
    {
        id: 2,
        tag: "HOLISTIC LIVING",
        title: "Nature Meets Science.",
        subtitle: "Experience the perfect blend of ancient Ayurveda and modern therapy.",
        image: "https://images.unsplash.com/photo-1612158333882-0a433d725a4c?w=1920&q=80",
        color: "from-purple-600/20 to-pink-600/20"
    },
    {
        id: 3,
        tag: "NATURAL WELLNESS",
        title: "Elevate Your Mind & Body.",
        subtitle: "Carefully curated essentials for energy, balance and a vibrant lifestyle.",
        image: "https://images.unsplash.com/photo-1600718370331-3f0cbdc07e8b?w=1920&q=80",
        color: "from-orange-600/20 to-amber-600/20"
    }
];

export default function HeroSliderUltra() {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(timer);
    }, [current]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setDirection(1);
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setTimeout(() => setIsAnimating(false), 1000);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
        setTimeout(() => setIsAnimating(false), 1000);
    };

    const goToSlide = (index: number) => {
        if (isAnimating || index === current) return;
        setIsAnimating(true);
        setDirection(index > current ? 1 : -1);
        setCurrent(index);
        setTimeout(() => setIsAnimating(false), 1000);
    };

    return (
        <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 p-4 md:p-6 lg:p-8 flex items-center overflow-hidden">


            {/* Main Container with Premium Rounded Corners */}
            <div className="relative w-full h-[85vh] md:h-[90vh] rounded-[20px] overflow-hidden">

                {/* Background Images with Ken Burns Effect */}
                {SLIDES.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-1000 ${index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                            }`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className={`w-full h-full object-cover transition-transform duration-[8000ms] ${index === current ? 'scale-110' : 'scale-100'
                                }`}
                        />

                        {/* Dynamic Color Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} mix-blend-overlay`} />

                        {/* Premium Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                    </div>
                ))}

                {/* Animated Grid Pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />

                {/* Content Container */}
                <div className="relative z-10 h-full flex items-center">
                    <div className="container mx-auto px-10 md:px-3 ">
                        {SLIDES.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`max-w-5xl transition-all duration-1000 ease-out ${index === current
                                    ? 'opacity-100 translate-x-0 scale-100'
                                    : `opacity-0 ${direction > 0 ? 'translate-x-20' : '-translate-x-20'} scale-95 absolute`
                                    }`}
                            >
                                {/* Premium Tag with Icon */}
                                <div className={`inline-flex items-center gap-2 mb-4 transition-all duration-700 delay-100 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                    }`}>
                                    {/* <Sparkles className="w-4 h-4 text-white animate-pulse" /> */}
                                    <span className="px-6 py-2.5  text-[10px] font-semibold tracking-[0.35em] text-white uppercase bg-white/20 backdrop-blur-2xl rounded-full border border-white/30 shadow-xl shadow-white/10">
                                        {slide.tag}
                                    </span>
                                </div>

                                {/* Title with Character Animation */}
                                <h1 className={`text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-[0.9] tracking-tighter mb-3 transition-all duration-700 delay-200 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}>
                                    <span className="inline-block bg-gradient-to-r from-white md:from-primary to-white text-transparent bg-clip-text text-transparent animate-pulse">
                                        {slide.title}
                                    </span>
                                </h1>

                                {/* Subtitle */}
                                <p className={`text-l md:text-xl lg:text-xl text-gray-100 leading-relaxed max-w-3xl font-light   mb-6 md:mb-6 transition-all duration-700 delay-300 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}>
                                    {slide.subtitle}
                                </p>

                                {/* CTA Buttons with Advanced Hover */}
                                <div className={`flex flex-wrap gap-5 transition-all duration-700 delay-400 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}>
                                    <button className="group relative px-5 py-2 md:px-8 md:py-3 bg-white text-black font-medium text-[14px] rounded-lg overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-white/20 hover:scale-105 hover:-translate-y-1">
                                        <span className="relative z-10 flex items-center gap-3">
                                            Shop Now
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </button>

                                    <button className="group relative px-5 py-2 md:px-8 md:py-3 bg-white/15 backdrop-blur-2xl border-2 border-white/40 text-white font-medium text-[14px] rounded-lg overflow-hidden transition-all duration-500 shadow-2xl hover:scale-105 hover:-translate-y-1">
                                        <span className="relative z-10">Learn More</span>
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute inset-0 border-2 border-white/60 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500" />
                                    </button>
                                </div>

                                {/* Floating Stats/Features */}
                                <div className={`flex gap-2 mt-10 transition-all duration-700 delay-500 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}>
                                    {['100% Natural', 'Certified', 'Trusted'].map((item, i) => (
                                        <div key={i} className="group cursor-pointer">
                                            <div className="px-3 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300">
                                                <p className="text-white font-semibold text-[10px] md:text-[14px]">{item}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Progress Indicators with Animation */}
                <div className=" relative bottom-10 justify-center left-1/2 -translate-x-1/2 flex gap-4 z-20">
                    {SLIDES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className="relative group"
                            disabled={isAnimating}
                        >
                            <div className={`h-2 rounded-full transition-all duration-700 ${index === current
                                ? "w-16 bg-white shadow-xl shadow-white/60"
                                : "w-10 bg-white/30 group-hover:bg-white/60 group-hover:w-12"
                                }`}>
                                {index === current && (
                                    <div className="h-full bg-gradient-to-r from-white via-gray-200 to-white rounded-full animate-pulse" />
                                )}
                            </div>

                            {/* Hover Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-xl text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                                Slide {index + 1}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Slide Counter */}
                {/* <div className="absolute top-8 right-8 z-20 px-6 py-3 bg-black/40 backdrop-blur-2xl rounded-full border border-white/20">
                    <span className="text-white font-bold text-sm">
                        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
                    </span>
                </div> */}
            </div>
        </div>
    );
}