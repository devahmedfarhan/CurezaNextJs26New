'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  condition: string;
  text: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Aarav Mehta",
    role: "Verified Patient",
    condition: "Chronic Lower Back Pain",
    text: "I was highly skeptical about botanical formulations after trying multiple pain ointments. But the Active Pain Balm combined with the targeted oil completely changed my recovery timeline. The cooling effect is immediate, and the pain relief lasts hours.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Verified Patient",
    condition: "Insomnia & Daily Anxiety",
    text: "The Rest & Sleep oil has been a miracle for my sleep cycle. I take a few drops before bed as prescribed by the Cureza wellness doctor, and I wake up feeling deeply refreshed without any morning grogginess. Highly recommend!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
  },
  {
    id: 3,
    name: "Vikram Malhotra",
    role: "Verified Patient",
    condition: "Stress & General Fatigue",
    text: "The adaptogenic Focus Capsules helped me regain mental clarity during high-stress work weeks. Knowing that everything is third-party tested and doctor-approved gives me complete peace of mind when ordering weekly refills.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80"
  }
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const active = TESTIMONIALS[current];

  return (
    <section className="w-full py-16 md:py-24 bg-white text-[#052326] relative overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/50 uppercase block mb-3">
            Customer Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
            Loved By Patients, Trusted By Doctors
          </h2>
          <p className="text-sm text-[#052326]/75 font-light mt-4">
            Read real feedback from certified consultations and validated customers on Cureza.
          </p>
        </div>

        {/* Testimonial card wrapper */}
        <div className="max-w-4xl mx-auto relative bg-[#F8F3EF] rounded-[14px] border border-[#052326]/10 p-8 md:p-12 shadow-premium-light min-h-[340px] flex flex-col justify-between">
          
          {/* Quote Icon Overlay */}
          <div className="absolute top-6 right-8 text-[#052326]/5 pointer-events-none">
            <Quote className="w-24 h-24 fill-current rotate-180" />
          </div>

          {/* Testimonial Info & Text (transitioning) */}
          <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-30' : 'opacity-100'}`}>
            {/* Rating Stars */}
            <div className="flex text-[#F0C417] mb-6">
              {[...Array(active.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>

            {/* Testimonial Quote */}
            <blockquote className="text-base md:text-lg lg:text-xl font-light text-[#052326]/90 leading-relaxed mb-8 italic">
              "{active.text}"
            </blockquote>
          </div>

          {/* Bottom Row: Profile & Navigation controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-[#052326]/10 pt-6 gap-6">
            
            {/* Customer profile */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#052326]/10 bg-white">
                <img src={active.avatar} alt={active.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#052326] flex items-center gap-1.5">
                  {active.name}
                  <CheckCircle2 className="w-4 h-4 text-[#F0C417] fill-white" />
                </h4>
                <p className="text-xs text-[#052326]/60 font-light mt-0.5">
                  {active.role} · <span className="text-[#052326]/80 font-medium">{active.condition}</span>
                </p>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrev}
                className="w-11 h-11 rounded-[10px] bg-white hover:bg-[#052326] hover:text-[#F8F3EF] text-[#052326] border border-[#052326]/10 flex items-center justify-center transition-all shadow-sm"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNext}
                className="w-11 h-11 rounded-[10px] bg-white hover:bg-[#052326] hover:text-[#F8F3EF] text-[#052326] border border-[#052326]/10 flex items-center justify-center transition-all shadow-sm"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
