'use client';

import { useEffect, useState, useRef } from 'react';
import { Award, HeartHandshake, ShieldAlert, Sparkles } from 'lucide-react';

interface StatItem {
  id: number;
  label: string;
  targetNumber: number;
  suffix: string;
  description: string;
  icon: any;
}

const STATS: StatItem[] = [
  {
    id: 1,
    label: "Patients Assisted",
    targetNumber: 100000,
    suffix: "+",
    description: "Trusted medical advice & customized natural prescriptions.",
    icon: HeartHandshake
  },
  {
    id: 2,
    label: "Years in Research",
    targetNumber: 13,
    suffix: "+",
    description: "Rigorous scientific extracts and clinical compliance.",
    icon: Sparkles
  },
  {
    id: 3,
    label: "Legal & Approved",
    targetNumber: 100,
    suffix: "%",
    description: "Licensing and strict manufacturing clearances.",
    icon: ShieldAlert
  },
  {
    id: 4,
    label: "Premium Partners",
    targetNumber: 25,
    suffix: "+",
    description: "Certified wellness brands under one curated directory.",
    icon: Award
  }
];

export default function PioneeringBanner() {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startAnimations();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const startAnimations = () => {
    const duration = 2000; // 2 seconds animation
    const steps = 50;
    const intervalTime = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts(
        STATS.map((stat) => {
          // Easing function (easeOutQuad)
          const easeProgress = progress * (2 - progress);
          return Math.floor(stat.targetNumber * easeProgress);
        })
      );

      if (currentStep >= steps) {
        clearInterval(timer);
        // Ensure exact target numbers are set at the end
        setCounts(STATS.map((stat) => stat.targetNumber));
      }
    }, intervalTime);
  };

  const formatNumber = (val: number, label: string) => {
    if (label.includes("Patients")) {
      if (val >= 1000) {
        return (val / 1000).toFixed(0) + "k";
      }
    }
    return val.toString();
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full py-16 md:py-24 bg-[#052326] text-[#F8F3EF] overflow-hidden"
    >
      {/* Background overlay design details */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#F8F3EF_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Editorial Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#F0C417] uppercase block mb-3">
            Pioneering Botanical Medicine
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight text-[#F8F3EF] tracking-tight">
            Redefining Healing Through Scientific Innovation
          </h2>
          <div className="w-12 h-1 bg-[#F0C417] mx-auto mt-6 rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.id} 
                className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[12px] hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#F8F3EF]/10 border border-[#F8F3EF]/20 rounded-[10px] flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-[#F0C417]" />
                </div>
                
                {/* Big Stat Count */}
                <div className="text-4xl md:text-5xl font-bold text-[#F8F3EF] mb-2 tracking-tight">
                  {formatNumber(counts[index], stat.label)}
                  <span className="text-[#F0C417]">{stat.suffix}</span>
                </div>
                
                <h3 className="text-sm font-semibold tracking-wider text-[#F8F3EF]/90 uppercase mb-2">
                  {stat.label}
                </h3>
                
                <p className="text-xs md:text-sm text-[#F8F3EF]/70 font-light leading-relaxed">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
