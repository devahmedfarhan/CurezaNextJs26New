'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface ProductFAQProps {
  faqs: { question: string; answer: string }[];
}

export default function ProductFAQ({ faqs }: ProductFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-12 bg-white rounded-[14px] border border-[#052326]/10 my-12 shadow-premium-light text-[#052326]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F8F3EF] rounded-[10px] border border-[#052326]/10 mb-4 text-[#052326]">
            <HelpCircle size={20} />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-[#052326]/50 uppercase tracking-widest font-bold mt-1">Common product questions & answers</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#F8F3EF]/10 rounded-[10px] border border-[#052326]/10 overflow-hidden transition-all duration-300 hover:border-[#052326]/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4.5 text-left outline-none"
              >
                <span className="font-semibold text-sm md:text-base">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-[#052326] w-4 h-4" />
                ) : (
                  <ChevronDown className="text-[#052326]/40 w-4 h-4" />
                )}
              </button>
              <div
                className={`px-4.5 text-xs md:text-sm text-[#052326]/80 leading-relaxed font-light overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 pb-4.5 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
