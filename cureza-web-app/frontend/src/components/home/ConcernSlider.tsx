'use client';

import { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useCategories } from '@/contexts/CategoryContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ConcernSlider() {
  const { concerns: allConcerns, isLoading } = useCategories();

  const concerns = useMemo(() => {
    return allConcerns.filter((c) => (c.concern_products_count ?? 0) > 0);
  }, [allConcerns]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const handleNext = () => {
    if (!carouselRef.current) return;
    const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
    let newPos = carouselRef.current.scrollLeft + 240;
    if (newPos > maxScroll) newPos = 0;
    setCurrentIndex(Math.floor(newPos / 160));
    carouselRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (!carouselRef.current) return;
    let newPos = carouselRef.current.scrollLeft - 240;
    if (newPos < 0) newPos = concerns.length * 160;
    setCurrentIndex(Math.floor(newPos / 160));
    carouselRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16 bg-[#F8F3EF]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#052326]/10 pb-6">
          <div className="animate-pulse space-y-3 flex-1">
            <div className="h-3 bg-[#052326]/5 rounded w-1/4" />
            <div className="h-8 bg-[#052326]/5 rounded w-1/2" />
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto py-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center animate-pulse gap-3 flex-shrink-0 w-[42%] sm:w-[25%] md:w-[18%] lg:w-[15%]">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#052326]/5" />
              <div className="h-4 bg-[#052326]/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (concerns.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16 bg-[#F8F3EF]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#052326]/10 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/80 uppercase block mb-2">
            Targeted Healing
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#052326] tracking-tight">
            Shop by Health Concern
          </h2>
          <p className="text-sm text-[#052326]/80 mt-2 max-w-xl font-light">
            Address specific wellness goals with custom botanical remedies formulated by certified clinicians.
          </p>
        </div>

        {/* NAVIGATION CONTROLS */}
        <div className="flex gap-2 self-start md:self-end">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-[8px] bg-white hover:bg-[#052326] hover:text-[#F8F3EF] text-[#052326] border border-gray-200 flex items-center justify-center transition-all shadow-sm"
            aria-label="Previous Concern"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-[8px] bg-white hover:bg-[#052326] hover:text-[#F8F3EF] text-[#052326] border border-gray-200 flex items-center justify-center transition-all shadow-sm"
            aria-label="Next Concern"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* CAROUSEL WRAPPER */}
      <div className="relative">
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory py-4"
        >
          {concerns.map((concern: any) => (
            <Link
              key={concern.id}
              href={`/concern/${concern.slug}`}
              className="snap-start flex-shrink-0 w-[42%] sm:w-[25%] md:w-[18%] lg:w-[15%] group"
            >
              <div className="flex flex-col items-center text-center">
                {/* Circular Badge with Gold Ring Hover */}
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#052326]/5 to-[#052326]/10 group-hover:from-[#052326] group-hover:to-[#F0C417] shadow-sm transition-all duration-500 ease-out transform group-hover:-translate-y-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-1.5 border border-gray-100">
                    <img
                      src={
                        concern.image
                          ? (concern.image.startsWith('http')
                            ? concern.image
                            : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${concern.image.startsWith('/') ? '' : '/storage/'}${concern.image}`)
                          : '/fallback.png'
                      }
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700 ease-out"
                      alt={concern.name}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs md:text-sm font-bold tracking-wide text-[#052326]/90 group-hover:text-[#052326] transition-colors duration-300 line-clamp-1">
                  {concern.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
