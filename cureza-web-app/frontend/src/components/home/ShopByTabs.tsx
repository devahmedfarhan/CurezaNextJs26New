"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCategories } from "@/contexts/CategoryContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ShopByTabs() {
  const { categories: allCategories, concerns: allConcerns, collections = [], isLoading } = useCategories();

  const categories = useMemo(() => allCategories.filter(c => (c.products_count ?? 0) > 0), [allCategories]);
  const concerns = useMemo(() => allConcerns.filter(c => (c.concern_products_count ?? 0) > 0), [allConcerns]);

  const [activeTab, setActiveTab] = useState<"categories" | "concerns" | "clearance">("categories");
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Set the default tab once when categories/concerns finish loading
  useEffect(() => {
    if (!isLoading) {
      if (categories.length > 0) {
        setActiveTab("categories");
      } else if (concerns.length > 0) {
        setActiveTab("concerns");
      } else if (collections.length > 0) {
        setActiveTab("clearance");
      }
    }
  }, [isLoading, categories.length, concerns.length, collections.length]);

  if (isLoading) {
    return (
      <section className="container mx-auto px-6 py-12 md:py-16 bg-[#F8F3EF]">
        {/* HEADER SKELETON */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#052326]/10 pb-6">
          <div className="animate-pulse space-y-3 flex-1">
            <div className="h-3.5 bg-[#052326]/5 rounded w-1/4" />
            <div className="h-8 bg-[#052326]/5 rounded w-1/2" />
            <div className="h-4 bg-[#052326]/5 rounded w-3/4" />
          </div>
          <div className="h-10 bg-[#052326]/5 rounded-[12px] w-48 animate-pulse" />
        </div>
        
        {/* CIRCULAR BADGES SKELETON */}
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

  if (categories.length === 0 && concerns.length === 0 && collections.length === 0) {
    return null;
  }

  const getItems = () => {
    if (activeTab === "categories") return categories;
    if (activeTab === "concerns") return concerns;
    if (activeTab === "clearance") return collections;
    return [];
  };

  const items = getItems();

  const handleNext = () => {
    if (!carouselRef.current) return;
    const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
    let newPos = carouselRef.current.scrollLeft + 240;
    if (newPos > maxScroll) newPos = 0;
    setCurrentIndex(Math.floor(newPos / 160));
    carouselRef.current.scrollTo({ left: newPos, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (!carouselRef.current) return;
    let newPos = carouselRef.current.scrollLeft - 240;
    if (newPos < 0) newPos = items.length * 160;
    setCurrentIndex(Math.floor(newPos / 160));
    carouselRef.current.scrollTo({ left: newPos, behavior: "smooth" });
  };

  return (
    <section className="container mx-auto px-6 py-12 md:py-16 bg-[#F8F3EF]">
      {/* HEADER & TABS CONTROLLER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#052326]/10 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/60 uppercase block mb-2">
            Care for your concern
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#052326] tracking-tight">
            Shop by Health & Wellness
          </h2>
          <p className="text-sm text-[#052326]/80 mt-2 max-w-xl font-light">
            Explore premium Ayurvedic remedies, organic extracts, and doctor-approved formulations.
          </p>
        </div>

        {/* TABS CONTAINER */}
        <div className="flex bg-[#052326]/5 p-1.5 rounded-[12px] gap-1 self-start md:self-end">
          {categories.length > 0 && (
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-5 py-2.5 rounded-[10px] text-xs font-semibold tracking-wide transition-all ${
                activeTab === "categories"
                  ? "bg-[#052326] text-[#F8F3EF] shadow-md"
                  : "text-[#052326]/75 hover:bg-[#052326]/5"
              }`}
            >
              Categories
            </button>
          )}

          {concerns.length > 0 && (
            <button
              onClick={() => setActiveTab("concerns")}
              className={`px-5 py-2.5 rounded-[10px] text-xs font-semibold tracking-wide transition-all ${
                activeTab === "concerns"
                  ? "bg-[#052326] text-[#F8F3EF] shadow-md"
                  : "text-[#052326]/75 hover:bg-[#052326]/5"
              }`}
            >
              Health Concerns
            </button>
          )}

          {collections.length > 0 && (
            <button
              onClick={() => setActiveTab("clearance")}
              className={`px-5 py-2.5 rounded-[10px] text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                activeTab === "clearance"
                  ? "bg-[#D32F2F] text-white shadow-md"
                  : "text-[#D32F2F]/80 hover:bg-[#D32F2F]/5"
              }`}
            >
              Clearance Sale
              <span className={`w-1.5 h-1.5 rounded-full ${
                activeTab === "clearance" ? "bg-white" : "bg-[#D32F2F] animate-pulse"
              }`} />
            </button>
          )}
        </div>
      </div>

      {/* CAROUSEL GRID */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-[#052326] hover:text-white text-[#052326] border border-[#052326]/8 p-3 rounded-full shadow-[0_4px_12px_rgba(5,35,38,0.08)] hover:shadow-[0_6px_18px_rgba(5,35,38,0.15)] transition-all duration-300 hover:scale-105 z-20 cursor-pointer"
          aria-label="Previous Concerns"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={handleNext}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-[#052326] hover:text-white text-[#052326] border border-[#052326]/8 p-3 rounded-full shadow-[0_4px_12px_rgba(5,35,38,0.08)] hover:shadow-[0_6px_18px_rgba(5,35,38,0.15)] transition-all duration-300 hover:scale-105 z-20 cursor-pointer"
          aria-label="Next Concerns"
        >
          <ChevronRight size={16} />
        </button>

        {/* Scrollable container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory py-4"
        >
          {items.map((item: any) => (
            <Link
              key={item.id}
              href={
                activeTab === 'concerns'
                  ? `/concern/${item.slug}`
                  : activeTab === 'clearance'
                  ? `/${item.slug}`
                  : `/category/${item.slug}`
              }
              className="snap-start flex-shrink-0 w-[42%] sm:w-[25%] md:w-[18%] lg:w-[15%]"
            >
              <div className="flex flex-col items-center text-center group">
                {/* Circular image badge with gold hover scale ring */}
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#052326]/5 to-[#052326]/10 group-hover:from-[#052326] group-hover:to-[#F0C417] shadow-[0_8px_20px_rgba(5,35,38,0.03)] group-hover:shadow-[0_12px_28px_rgba(46,125,50,0.15)] transition-all duration-500 ease-out transform group-hover:-translate-y-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center p-1.5">
                    <img
                      src={
                        item.image
                          ? (item.image.startsWith("http")
                            ? item.image
                            : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${item.image.startsWith('/') ? '' : '/storage/'}${item.image}`)
                          : '/fallback.png'
                      }
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700 ease-out"
                      alt={item.name}
                    />
                  </div>
                </div>

                <p className="mt-4 text-xs md:text-sm font-bold tracking-wide text-[#052326]/90 group-hover:text-[#052326] transition-colors duration-300 line-clamp-1">
                  {item.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {items.slice(0, Math.ceil(items.length / 4)).map((_: any, index: number) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "bg-[#052326] w-6" : "bg-[#052326]/20 w-1.5"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
