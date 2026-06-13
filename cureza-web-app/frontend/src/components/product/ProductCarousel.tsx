'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface ProductCarouselProps {
  title: string;
  products: any[];
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!products || products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const newScrollLeft = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  return (
    <section className="py-12 bg-[#F8F3EF] text-[#052326] border-t border-[#052326]/5 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#052326]/10">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/50 uppercase block mb-1">Recommendations</span>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!showLeftArrow}
              className={`w-10 h-10 rounded-[10px] bg-white border border-[#052326]/10 flex items-center justify-center transition-all shadow-sm ${
                showLeftArrow ? 'hover:bg-[#052326] hover:text-[#F8F3EF] text-[#052326]' : 'opacity-30 cursor-not-allowed text-[#052326]/40'
              }`}
              aria-label="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!showRightArrow}
              className={`w-10 h-10 rounded-[10px] bg-white border border-[#052326]/10 flex items-center justify-center transition-all shadow-sm ${
                showRightArrow ? 'hover:bg-[#052326] hover:text-[#F8F3EF] text-[#052326]' : 'opacity-30 cursor-not-allowed text-[#052326]/40'
              }`}
              aria-label="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[260px] w-[260px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
