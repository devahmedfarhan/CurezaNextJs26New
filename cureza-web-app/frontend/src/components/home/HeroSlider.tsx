'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Star, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

interface Slide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  productName: string;
  productCategory: string;
  productPrice: string;
  productImage: string;
  rating: number;
  badge: string;
  ingredients: string[];
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: "AYURVEDA · WELLNESS",
    title: "Healing Evolved through Science & Nature.",
    subtitle: "Pure, clinical-grade wellness extracts crafted to restore balance, soothe discomfort, and elevate your everyday lifestyle.",
    productName: "Cureza Rest & Sleep Oil",
    productCategory: "Sleep & Anxiety Relief",
    productPrice: "₹1,899",
    productImage: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
    rating: 4.9,
    badge: "Doctor Recommended",
    ingredients: ["Hemp Seed Extract", "Valerian Root", "Chamomile"]
  },
  {
    id: 2,
    tag: "CLINICAL THERAPY",
    title: "Advanced Relief. Targeted Recovery.",
    subtitle: "Say goodbye to chronic pain and inflammation with our fast-acting, botanical formulations approved by certified doctors.",
    productName: "Cureza Active Pain Balm",
    productCategory: "Joint & Muscle Recovery",
    productPrice: "₹849",
    productImage: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    rating: 4.8,
    badge: "100% Ayurvedic",
    ingredients: ["CBD Extract", "Eucalyptus", "Menthol"]
  },
  {
    id: 3,
    tag: "HOLISTIC NUTRITION",
    title: "Nourish from Within. Live Unbounded.",
    subtitle: "Harness the power of adaptogenic herbs and premium superfoods to supercharge your immunity, energy, and cognitive focus.",
    productName: "Cureza Focus Capsules",
    productCategory: "Brain Health & Energy",
    productPrice: "₹1,249",
    productImage: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80",
    rating: 4.7,
    badge: "Lab Certified",
    ingredients: ["Ashwagandha", "Brahmi", "Ginkgo Biloba"]
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
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

  const currentSlide = SLIDES[current];

  return (
    <section className="relative w-full min-h-[85vh] bg-[#052326] flex items-center overflow-hidden py-16 text-[#F8F3EF]">
      {/* Decorative background vectors */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F0C417] to-transparent blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-500 to-transparent blur-[150px]" />
        {/* Subtle grid layout */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(248, 243, 239, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* EDITORIAL LEFT COLUMN */}
        <div className="lg:col-span-6 flex flex-col justify-center text-left">
          {/* Animated Slide Tag */}
          <div className="overflow-hidden mb-4 h-8">
            <span className="inline-block px-4 py-1.5 text-[10px] font-bold tracking-[0.25em] text-[#F0C417] bg-[#F8F3EF]/10 border border-[#F8F3EF]/20 rounded-md">
              {currentSlide.tag}
            </span>
          </div>

          {/* Hero Title */}
          <div className="overflow-hidden mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.15] text-[#F8F3EF] tracking-tight transition-transform duration-700">
              {currentSlide.title}
            </h1>
          </div>

          {/* Hero Subtitle */}
          <p className="text-base md:text-lg text-[#F8F3EF]/80 max-w-xl font-light mb-8 leading-relaxed">
            {currentSlide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link 
              href="/shop" 
              className="group inline-flex items-center justify-center px-7 py-3.5 bg-[#F0C417] text-[#052326] font-semibold text-sm rounded-[12px] shadow-lg shadow-[#F0C417]/10 hover:shadow-[#F0C417]/20 hover:scale-[1.02] transition-all duration-300"
            >
              Shop Curated Products
              <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/consultation" 
              className="inline-flex items-center justify-center px-7 py-3.5 bg-transparent border border-[#F8F3EF]/30 text-[#F8F3EF] hover:bg-[#F8F3EF]/10 font-semibold text-sm rounded-[12px] transition-all duration-300"
            >
              Book Consultation
            </Link>
          </div>

          {/* Bottom Trust Info */}
          <div className="flex items-center gap-6 border-t border-[#F8F3EF]/10 pt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F0C417]" />
              <span className="text-xs tracking-wider text-[#F8F3EF]/80 font-medium">AYUSH CERTIFIED</span>
            </div>
            <div className="h-4 w-[1px] bg-[#F8F3EF]/20" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F0C417] fill-[#F0C417]" />
              <span className="text-xs tracking-wider text-[#F8F3EF]/80 font-medium">4.9/5 RATED DIRECTORY</span>
            </div>
          </div>
        </div>

        {/* FLOATING GLASS MOCKUPS COLUMN */}
        <div className="lg:col-span-6 relative flex items-center justify-center h-[450px] md:h-[500px]">
          {/* Central Glow Background behind cards */}
          <div className="absolute w-[350px] h-[350px] rounded-full bg-[#F0C417]/10 blur-[80px] z-0" />

          {/* Card 1: Main Product Card */}
          <div className="absolute z-10 w-[280px] md:w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[14px] p-4 shadow-2xl transition-all duration-700 hover:border-white/20 transform -translate-x-6 md:-translate-x-12 translate-y-4 hover:-translate-y-2">
            <div className="relative w-full aspect-square rounded-[10px] overflow-hidden mb-4 bg-white/5">
              <img 
                src={currentSlide.productImage} 
                alt={currentSlide.productName}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              />
              <span className="absolute top-2 left-2 px-2.5 py-1 text-[9px] font-bold bg-[#052326] text-[#F8F3EF] rounded-md tracking-wider">
                {currentSlide.badge}
              </span>
              <button 
                aria-label="Add to Wishlist"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#F8F3EF] hover:bg-white/20 transition-all"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#F0C417] font-semibold">{currentSlide.productCategory}</span>
                <h3 className="text-sm font-semibold text-[#F8F3EF] mt-0.5">{currentSlide.productName}</h3>
              </div>
              <span className="text-sm font-bold text-[#F8F3EF]">{currentSlide.productPrice}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <div className="flex text-[#F0C417]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#F0C417]" />
                ))}
              </div>
              <span className="text-[11px] text-[#F8F3EF]/70 ml-1 font-medium">{currentSlide.rating} Rating</span>
            </div>
          </div>

          {/* Card 2: Floating Active Ingredients Card */}
          <div className="absolute z-20 top-8 right-4 md:right-8 w-[160px] md:w-[190px] bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[12px] p-3 shadow-xl transform translate-x-2 md:translate-x-6 -translate-y-8 hover:scale-[1.05] transition-transform duration-300">
            <span className="text-[9px] text-[#F8F3EF]/60 tracking-widest uppercase block mb-1">Key Actives</span>
            <div className="space-y-1.5 mt-2">
              {currentSlide.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F0C417]" />
                  <span className="text-xs text-[#F8F3EF]/90 font-medium">{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Doctor Endorsement / Certified Stamp */}
          <div className="absolute z-20 bottom-12 right-2 md:right-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[12px] p-3 shadow-xl flex items-center gap-3 transform translate-y-8 hover:translate-y-6 transition-all duration-300">
            <div className="w-10 h-10 rounded-[10px] bg-[#052326] flex items-center justify-center border border-[#F8F3EF]/20">
              <span className="text-xs font-bold text-[#F0C417]">Rx</span>
            </div>
            <div>
              <p className="text-[10px] text-[#F8F3EF]/60 tracking-wider uppercase">Consult Clinic</p>
              <p className="text-[11px] font-bold text-[#F8F3EF]">Free Consultation</p>
            </div>
          </div>
        </div>

      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              index === current ? "w-10 bg-[#F0C417]" : "w-2.5 bg-[#F8F3EF]/20 hover:bg-[#F8F3EF]/40"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}