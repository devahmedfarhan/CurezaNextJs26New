'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[10px] border-[0.5px] border-[#052326]/12 overflow-hidden flex flex-col h-full animate-pulse shadow-sm">
      {/* IMAGE AREA SKELETON */}
      <div className="relative w-full aspect-[4/5] bg-[#052326]/5 flex items-center justify-center border-b border-[#052326]/5">
        <div className="w-12 h-12 rounded-full bg-[#052326]/5" />
      </div>

      {/* DETAILS SECTION SKELETON */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3 bg-white">
        
        <div className="space-y-2">
          {/* BRAND & CATEGORY HEADER */}
          <div className="flex justify-between items-center">
            <div className="h-3 bg-[#052326]/5 rounded w-1/4" />
            <div className="h-3 bg-[#052326]/5 rounded w-1/4" />
          </div>

          {/* TITLE */}
          <div className="h-4 bg-[#052326]/5 rounded w-3/4" />

          {/* TAGS PILLS */}
          <div className="hidden sm:flex gap-1.5 pt-1">
            <div className="h-4 bg-[#052326]/5 rounded w-12" />
            <div className="h-4 bg-[#052326]/5 rounded w-16" />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5 hidden sm:block pt-1">
            <div className="h-3 bg-[#052326]/5 rounded w-full" />
            <div className="h-3 bg-[#052326]/5 rounded w-5/6" />
          </div>
        </div>

        <div>
          {/* RATING & STATS */}
          <div className="flex items-center justify-between border-t border-[#052326]/5 pt-3 mt-1">
            <div className="h-5 bg-[#052326]/5 rounded w-16" />
            <div className="h-3.5 bg-[#052326]/5 rounded w-24" />
          </div>

          {/* PRICE & ADD TO CART ACTION */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 gap-3">
            <div className="space-y-1 min-w-[70px]">
              <div className="h-3.5 bg-[#052326]/5 rounded w-2/3" />
              <div className="h-4 bg-[#052326]/5 rounded w-full" />
            </div>

            <div className="w-full sm:flex-1 h-9 sm:h-10 bg-[#052326]/5 rounded-[8px] sm:rounded-[10px]" />
          </div>
        </div>

      </div>
    </div>
  );
}
