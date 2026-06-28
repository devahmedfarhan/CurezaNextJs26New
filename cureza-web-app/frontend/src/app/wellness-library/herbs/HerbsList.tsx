"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface HerbListItem {
  name: string;
  slug: string;
  title: string;
  featured_image: string;
  botanical_name?: string;
}

interface HerbsListProps {
  herbs: HerbListItem[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ITEMS_PER_PAGE = 24;

export default function HerbsList({ herbs }: HerbsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  // Parse botanical name from herb title/name if possible
  const processedHerbs = useMemo(() => {
    return herbs.map(herb => {
      let botanical = "";
      const match = herb.name.match(/\(([^)]+)\)/) || herb.title.match(/\(([^)]+)\)/);
      if (match) {
        botanical = match[1];
      } else {
        const parts = herb.name.split('/');
        if (parts.length >= 3) {
          botanical = parts[2].trim();
        }
      }
      return {
        ...herb,
        botanical_name: botanical
      };
    });
  }, [herbs]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLetter]);

  const filteredHerbs = useMemo(() => {
    return processedHerbs.filter(herb => {
      const matchesSearch = 
        herb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        herb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        herb.botanical_name.toLowerCase().includes(searchQuery.toLowerCase());

      const firstChar = herb.name.trim().charAt(0).toUpperCase();
      const matchesLetter = !selectedLetter || firstChar === selectedLetter;

      return matchesSearch && matchesLetter;
    });
  }, [processedHerbs, searchQuery, selectedLetter]);

  const totalPages = Math.ceil(filteredHerbs.length / ITEMS_PER_PAGE);

  const paginatedHerbs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHerbs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredHerbs, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div ref={topRef} className="scroll-mt-6">
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search herbs by name or botanical classification..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-charcoal font-sans transition-all shadow-sm"
        />
      </div>

      {/* A-Z Alphabet Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedLetter(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selectedLetter === null
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-stone-50 dark:bg-gray-850 hover:bg-stone-100 text-gray-700 dark:text-gray-300'
          }`}
        >
          All
        </button>
        {ALPHABET.map(letter => {
          const hasHerbs = processedHerbs.some(h => h.name.trim().charAt(0).toUpperCase() === letter);
          
          return (
            <button
              key={letter}
              onClick={() => hasHerbs && setSelectedLetter(letter === selectedLetter ? null : letter)}
              disabled={!hasHerbs}
              className={`w-9 h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-all duration-200 ${
                selectedLetter === letter
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : hasHerbs
                    ? 'bg-stone-50 dark:bg-gray-850 hover:bg-stone-100 text-gray-700 dark:text-gray-300 cursor-pointer'
                    : 'bg-stone-100/50 dark:bg-gray-900/30 text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Grid List */}
      {paginatedHerbs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedHerbs.map((herb) => (
              <Link 
                key={herb.slug} 
                href={`/wellness-library/herbs/${herb.slug}`}
                className="group bg-white dark:bg-gray-900 border border-stone-100 dark:border-gray-800 rounded-xl overflow-hidden hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-sm"
              >
                {/* Image Container */}
                <div className="relative h-48 bg-stone-50 dark:bg-gray-850 overflow-hidden flex-shrink-0">
                  <img
                    src={herb.featured_image || "/fallback.png"}
                    alt={herb.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/fallback.png";
                    }}
                  />
                </div>

                {/* Info Container */}
                <div className="p-4 flex-grow flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Herb profile</span>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {herb.name.split('/')[0].trim()}
                  </h3>
                  
                  {herb.botanical_name && (
                    <p className="text-xs italic text-gray-500 mt-1 line-clamp-1 font-serif">
                      {herb.botanical_name}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {herb.title}
                  </p>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs font-semibold text-emerald-600">
                    <span>Explore details</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-stone-100 dark:border-gray-850">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg border border-stone-200 dark:border-gray-800 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-stone-200 dark:border-gray-800 hover:bg-stone-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg border border-stone-200 dark:border-gray-800 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-stone-50 dark:bg-gray-950 rounded-2xl border border-dashed border-stone-200 dark:border-gray-850">
          <p className="text-gray-500 font-sans">No herbs found matching your search filters.</p>
          <button 
            onClick={() => { setSearchQuery(""); setSelectedLetter(null); }}
            className="mt-4 text-emerald-600 font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
