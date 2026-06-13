'use client';

export default function PressMarquee() {
  const PRESS_LOGOS = [
    { name: "Vogue", logo: "VOGUE" },
    { name: "GQ India", logo: "GQ" },
    { name: "Forbes", logo: "Forbes" },
    { name: "Financial Times", logo: "FINANCIAL TIMES" },
    { name: "The Economic Times", logo: "The Economic Times" },
    { name: "YourStory", logo: "YOURSTORY" },
    { name: "LiveMint", logo: "mint" }
  ];

  // Duplicate to ensure seamless marquee loops
  const marqueeItems = [...PRESS_LOGOS, ...PRESS_LOGOS, ...PRESS_LOGOS];

  return (
    <section className="w-full py-12 bg-[#F8F3EF] border-y border-[#052326]/10 overflow-hidden">
      <div className="container mx-auto px-6 mb-6 text-center">
        <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/50 uppercase block">
          Recognized. Rewarded.
        </span>
      </div>
      
      <div className="relative w-full flex items-center overflow-hidden">
        {/* Gradients to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F8F3EF] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F8F3EF] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-16 items-center whitespace-nowrap animate-marquee">
          {marqueeItems.map((item, index) => (
            <div 
              key={index} 
              className="inline-flex items-center justify-center text-xl md:text-2xl font-bold font-serif tracking-widest text-[#052326]/30 uppercase hover:text-[#052326]/75 transition-colors cursor-default select-none"
            >
              {item.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
