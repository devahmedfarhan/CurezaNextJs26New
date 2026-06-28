'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// S27: The Interactive Ingredient Glossary
export function IngredientGlossary() {
  const glossary = [
    { name: "Cannabidiol (CBD)", source: "Cannabis Sativa L. (Hemp)", purpose: "Neuro-pain, insomnia, systemic anti-inflammatory, homeostasis support." },
    { name: "Ashwagandha (KSM-66)", source: "Withania Somnifera Root", purpose: "Cortisol balancing, nervous system grounding, adaptogenic vitality." },
    { name: "Curcumin C3 Complex", source: "Curcuma Longa Extract", purpose: "95% active curcuminoids offering clinical-grade joint inflammatory protection." },
    { name: "Melatonin", source: "Bio-Identical Hormone", purpose: "Short-term circadian rhythm corrections, initiating rapid sleep cycles." }
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  const nextSlide = () => {
    setActiveIdx((prev) => (prev + 1) % glossary.length);
  };

  const prevSlide = () => {
    setActiveIdx((prev) => (prev - 1 + glossary.length) % glossary.length);
  };

  return (
    <section className="w-full py-16 bg-[#F8F3EF] border-b border-[#052326]/12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-widest">Molecular Glossary</span>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#052326] mt-1">
            The Interactive Ingredient Glossary
          </h3>
          <p className="text-xs md:text-sm text-[#052326]/75 mt-2 font-medium">
            Examine the pharmacology, sources, and therapeutic applications of our primary ingredients.
          </p>
        </div>

        <div
          className="max-w-2xl mx-auto relative bg-white p-6 md:p-8 text-xs text-[#052326]"
          style={{
            borderRadius: '8px',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(85, 85, 85, 0.18)',
            borderTopWidth: '4px',
            borderTopColor: '#F0C417',
            boxShadow: 'none',
            filter: 'none'
          }}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-wider">Active Compound</span>
            <h4 className="text-lg font-bold mt-1 text-[#052326]">{glossary[activeIdx].name}</h4>
            <p className="text-[#052326]/60 font-semibold mt-0.5">Source: {glossary[activeIdx].source}</p>
            
            <p className="text-xs text-[#052326]/80 mt-4 leading-relaxed font-medium">
              <strong>Therapeutic Action:</strong> {glossary[activeIdx].purpose}
            </p>
          </div>

          <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#052326]/12">
            <div className="flex gap-2">
              <button onClick={prevSlide} className="p-2 border border-[#052326]/18 rounded-lg hover:bg-[#052326]/5 transition-colors cursor-pointer" aria-label="Previous compound">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextSlide} className="p-2 border border-[#052326]/18 rounded-lg hover:bg-[#052326]/5 transition-colors cursor-pointer" aria-label="Next compound">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <Link href={`/shop?q=${encodeURIComponent(glossary[activeIdx].name)}`} className="underline font-bold hover:text-[#B8860B] flex items-center gap-1">
              Shop Formulations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
