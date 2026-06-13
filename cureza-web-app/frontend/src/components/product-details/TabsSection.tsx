'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, ClipboardList, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface Ingredient {
  name: string;
  scientific: string;
  source: string;
  potency: string;
  description: string;
  image: string;
}

const INGREDIENTS_DATA: Ingredient[] = [
  {
    name: "Hemp Leaf Extract",
    scientific: "Cannabis Sativa L.",
    source: "Himalayan Foothills",
    potency: "Broad Spectrum",
    description: "Rich in cannabinoids and natural terpenes, providing powerful anti-inflammatory and pain-relieving effects.",
    image: "https://images.unsplash.com/photo-1536640712247-c57f669e2307?w=300&q=80"
  },
  {
    name: "Ashwagandha Extract",
    scientific: "Withania Somnifera",
    source: "Central India",
    potency: "10:1 Standardized",
    description: "Premium adaptogenic herb that lowers cortisol levels, reduces anxiety, and enhances sleep quality.",
    image: "https://images.unsplash.com/photo-1628359355624-855775b5c9c8?w=300&q=80"
  },
  {
    name: "Valerian Root",
    scientific: "Valeriana Officinalis",
    source: "Kashmir Valley",
    potency: "0.8% Valerenic Acids",
    description: "Acts as a natural sedative to calm the central nervous system, helping to induce deep and restful sleep.",
    image: "https://images.unsplash.com/photo-1594900711590-b1836c0a0c49?w=300&q=80"
  }
];

export default function TabsSection({ product }: { product: any }) {
  const [activeTab, setActiveTab] = useState('description');
  const [isMounted, setIsMounted] = useState(false);

  // Before-After Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const position = ((e.clientX - left) / width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const position = ((touch.clientX - left) / width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const baseTabs = [
    {
      id: 'description',
      label: 'Description',
      icon: FileText,
      content: product.long_description || product.description || product.longDescription,
      type: 'html'
    },
    {
      id: 'specifications',
      label: 'Specifications',
      icon: ClipboardList,
      content: product.specifications || [
        { key: "Dosage Format", value: "Tincture / Oral drops" },
        { key: "Net Weight", value: "30 ml" },
        { key: "Extraction Ratio", value: "Broad Spectrum 1:1" },
        { key: "Lab Certified", value: "Yes (COA Available)" },
        { key: "License No", value: "AYUSH-DL-262/A" }
      ],
      type: 'table'
    },
    {
      id: 'ingredients',
      label: 'Key Actives',
      icon: Sparkles,
      content: INGREDIENTS_DATA,
      type: 'ingredients'
    },
    {
      id: 'beforeafter',
      label: 'Clinical Progress',
      icon: ShieldAlert,
      content: true,
      type: 'before-after'
    }
  ];

  const dynamicTabs = product.additional_info?.tabs?.map((tab: any) => ({
    id: tab.id || tab.title.toLowerCase().replace(/\s+/g, '-'),
    label: tab.title,
    icon: FileText,
    content: tab.content,
    type: 'html'
  })) || [];

  const tabs = [
    ...baseTabs,
    ...dynamicTabs,
  ].filter(tab => tab.content);

  return (
    <div className="bg-white rounded-[14px] border border-[#052326]/10 overflow-hidden shadow-premium-light mt-12">
      
      {/* Tab Headers */}
      <div className="flex overflow-x-auto border-b border-[#052326]/10 scrollbar-none bg-[#F8F3EF]/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 outline-none ${
                activeTab === tab.id
                  ? 'border-[#052326] text-[#052326] bg-[#052326]/5'
                  : 'border-transparent text-[#052326]/60 hover:text-[#052326] hover:bg-[#052326]/5'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-8 min-h-[300px]">
        
        {/* DESCRIPTION TAB */}
        {activeTab === 'description' && isMounted && (
          <div className="animate-in fade-in duration-300 font-sans">
            <div
              className="max-w-none text-[#052326]/90 text-xs md:text-sm leading-relaxed font-light
                [&_p]:mb-6 [&_ul]:!list-disc [&_ul]:!pl-6 [&_ol]:!list-decimal [&_ol]:!pl-6 
                [&_li]:mb-1 [&_strong]:font-semibold [&_a]:text-[#052326] [&_a]:underline"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(tabs.find(t => t.id === 'description')?.content || '') 
              }}
            />
          </div>
        )}

        {/* SPECIFICATIONS TAB */}
        {activeTab === 'specifications' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-[#F8F3EF]/30 rounded-[12px] border border-[#052326]/10 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                {Array.isArray(tabs.find(t => t.id === 'specifications')?.content)
                  ? (tabs.find(t => t.id === 'specifications')?.content as any[]).map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[#052326]/5 pb-2.5 last:border-0">
                        <span className="text-xs font-semibold text-[#052326]/50 uppercase tracking-wider">{item.key || Object.keys(item)[0]}</span>
                        <span className="text-xs font-bold text-[#052326] text-right">{item.value || Object.values(item)[0]}</span>
                      </div>
                    ))
                  : Object.entries(tabs.find(t => t.id === 'specifications')?.content || {}).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between border-b border-[#052326]/5 pb-2.5 last:border-0">
                        <span className="text-xs font-semibold text-[#052326]/50 uppercase tracking-wider">{key}</span>
                        <span className="text-xs font-bold text-[#052326] text-right">{value}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
        )}

        {/* BOTANICAL INGREDIENTS TAB (Task 58) */}
        {activeTab === 'ingredients' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {INGREDIENTS_DATA.map((ing, idx) => (
                <div key={idx} className="border border-[#052326]/10 rounded-[12px] bg-[#F8F3EF]/10 overflow-hidden shadow-sm hover:border-[#052326]/20 transition-all duration-300 flex flex-col justify-between">
                  <div className="w-full h-32 relative bg-[#F8F3EF]">
                    <img src={ing.image} alt={ing.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-[#052326] text-[#F8F3EF] rounded-[4px]">
                      {ing.potency}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold">{ing.name}</h4>
                      <span className="text-[10px] italic text-[#052326]/50 block mt-0.5">{ing.scientific}</span>
                      <p className="text-xs text-[#052326]/75 font-light leading-relaxed mt-2.5">{ing.description}</p>
                    </div>
                    <div className="border-t border-[#052326]/5 pt-2.5 mt-1">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#052326]/40 block">Sourced Region</span>
                      <span className="text-[10px] font-bold text-[#052326]/80">{ing.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BEFORE-AFTER CLINICAL PROGRESS TAB (Task 60) */}
        {activeTab === 'beforeafter' && (
          <div className="animate-in fade-in duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Editorial column */}
            <div className="lg:col-span-5 text-left">
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#052326]/50 uppercase block mb-1">Clinical Trials</span>
              <h4 className="text-xl font-semibold mb-3">Visible Irritation Relief & Recovery</h4>
              <p className="text-xs md:text-sm text-[#052326]/80 font-light leading-relaxed mb-4">
                Clinical test parameters track significant reduction in irritation, redness, and muscular swelling over 14 days of standardized applications.
              </p>
              <ul className="space-y-2 text-xs font-semibold">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#F0C417]" /> 84% Reduction in cellular redness</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#F0C417]" /> 92% Certified muscular recovery rates</li>
              </ul>
            </div>

            {/* Slider container */}
            <div className="lg:col-span-7 flex justify-center">
              <div 
                ref={containerRef}
                className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] rounded-[12px] overflow-hidden select-none cursor-ew-resize border border-[#052326]/10 shadow"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
              >
                {/* Before Image */}
                <div className="absolute inset-0 z-0 bg-red-100">
                  <img 
                    src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80" 
                    alt="Before state" 
                    className="w-full h-full object-cover grayscale brightness-75"
                  />
                  <span className="absolute bottom-4 left-4 z-20 bg-[#052326]/80 text-[#F8F3EF] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-[6px]">
                    Before
                  </span>
                </div>

                {/* After Image (clipped) */}
                <div 
                  className="absolute inset-y-0 left-0 right-0 z-10 overflow-hidden bg-green-100"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80" 
                    alt="After state" 
                    className="absolute inset-y-0 left-0 w-[340px] h-[340px] md:w-[400px] md:h-[400px] max-w-none object-cover"
                  />
                  <span className="absolute bottom-4 left-4 z-20 bg-[#F0C417] text-[#052326] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-[6px] whitespace-nowrap">
                    After 14 Days
                  </span>
                </div>

                {/* Slider Handle */}
                <div 
                  className="absolute inset-y-0 z-20 w-[2px] bg-white cursor-ew-resize flex items-center justify-center"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-[#052326]/10 flex items-center justify-center shadow-lg -translate-x-1/2">
                    <ChevronRight className="w-4 h-4 text-[#052326] rotate-180" />
                    <ChevronRight className="w-4 h-4 text-[#052326] -ml-2" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
