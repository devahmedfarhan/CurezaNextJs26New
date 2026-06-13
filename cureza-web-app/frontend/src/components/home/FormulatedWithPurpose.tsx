'use client';

import { useState } from 'react';
import { Leaf, TestTube, Microscope, CheckCircle2, ChevronRight } from 'lucide-react';

interface TechStep {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: any;
  metric: string;
  metricLabel: string;
  imageUrl: string;
}

const TECH_STEPS: TechStep[] = [
  {
    id: "extraction",
    title: "Supercritical CO2 Extraction",
    shortDesc: "Low-temperature processing preserving delicate terpenes and cannabinoids.",
    fullDesc: "Unlike harsh chemical solvents, our state-of-the-art Supercritical CO2 extraction uses pressurized carbon dioxide to gently pull therapeutic compounds from raw hemp and botanicals, ensuring absolute purity and zero solvent residues.",
    icon: Leaf,
    metric: "0.0%",
    metricLabel: "Solvent Residue",
    imageUrl: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=800&q=80"
  },
  {
    id: "analysis",
    title: "Double-Blind Lab Analysis",
    shortDesc: "Every batch certified by ISO-accredited third-party laboratories.",
    fullDesc: "We subject our formulations to rigorous double-blind testing. Certified labs inspect for heavy metals, pesticides, microbial contamination, and compound potency, delivering full certificate of analysis (COA) compliance for every single product.",
    icon: Microscope,
    metric: "100%",
    metricLabel: "Traceability",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
  },
  {
    id: "synergy",
    title: "Synergistic Standardization",
    shortDesc: "Standardized herbal actives blended for bio-availability.",
    fullDesc: "To ensure that every dose performs exactly as intended, we standardize active compounds (like Bacosides in Brahmi or Curcumin in Turmeric) to guarantee consistent therapeutic potency across production cycles.",
    icon: TestTube,
    metric: "5x",
    metricLabel: "Absorption Rate",
    imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80"
  }
];

export default function FormulatedWithPurpose() {
  const [activeStep, setActiveStep] = useState<string>("extraction");

  const currentStepData = TECH_STEPS.find(step => step.id === activeStep) || TECH_STEPS[0];

  return (
    <section className="w-full py-16 md:py-24 bg-[#F8F3EF] text-[#052326] border-t border-[#052326]/5">
      <div className="container mx-auto px-6">
        
        {/* Header Block */}
        <div className="max-w-3xl mb-16">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/60 uppercase block mb-3">
            Pure Botanical Science
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight mb-4">
            Formulated With Purpose, Verified By Research.
          </h2>
          <p className="text-base text-[#052326]/85 font-light max-w-xl">
            We bridge the gap between ancient Ayurvedic wisdom and clinical biotechnology to deliver clean, transparently sourced remedies.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: INTERACTIVE NAVIGATION STEPS */}
          <div className="lg:col-span-5 space-y-4">
            {TECH_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left p-5 md:p-6 rounded-[12px] border transition-all duration-300 flex items-start gap-4 ${
                    isActive
                      ? "bg-white border-[#052326] shadow-premium-hover scale-[1.01]"
                      : "bg-transparent border-[#052326]/10 hover:border-[#052326]/30"
                  }`}
                >
                  <div className={`p-3 rounded-[10px] border transition-colors ${
                    isActive 
                      ? "bg-[#052326] border-[#052326] text-[#F8F3EF]" 
                      : "bg-white border-[#052326]/10 text-[#052326]"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold tracking-wide uppercase mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs md:text-sm text-[#052326]/75 font-light leading-relaxed">
                      {step.shortDesc}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 self-center transition-transform ${
                    isActive ? "translate-x-1 text-[#052326]" : "opacity-30"
                  }`} />
                </button>
              );
            })}
          </div>

          {/* RIGHT COLUMN: DETAIL PANEL (with 10-14px border radius images and data tags) */}
          <div className="lg:col-span-7 bg-white rounded-[14px] border border-[#052326]/10 p-6 md:p-8 shadow-premium-light flex flex-col md:flex-row gap-8 min-h-[360px]">
            {/* Visual Panel */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#052326]/50 uppercase">
                  Scientific Specification
                </span>
                <h3 className="text-xl font-semibold mt-2 mb-4">
                  {currentStepData.title}
                </h3>
                <p className="text-xs md:text-sm text-[#052326]/80 font-light leading-relaxed mb-6">
                  {currentStepData.fullDesc}
                </p>
              </div>

              {/* Stat Callout block */}
              <div className="flex items-center gap-4 border-t border-[#052326]/10 pt-6">
                <div>
                  <div className="text-3xl font-bold text-[#052326] tracking-tight">
                    {currentStepData.metric}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/50 mt-0.5">
                    {currentStepData.metricLabel}
                  </div>
                </div>
                <div className="w-[1px] h-8 bg-[#052326]/15" />
                <div className="flex items-center gap-2 text-[#052326]/80">
                  <CheckCircle2 className="w-4 h-4 text-[#F0C417]" />
                  <span className="text-xs font-semibold">COA Certified</span>
                </div>
              </div>
            </div>

            {/* Spec Image */}
            <div className="flex-1 h-[250px] md:h-auto rounded-[12px] overflow-hidden relative border border-[#052326]/10">
              <img
                src={currentStepData.imageUrl}
                alt={currentStepData.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#052326]/40 to-transparent" />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
