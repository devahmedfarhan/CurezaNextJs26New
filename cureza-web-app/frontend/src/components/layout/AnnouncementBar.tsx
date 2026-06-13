'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<string[]>([
    "Trusted by 100,000+ Patients",
    "Flat 10% OFF on your first purchase - Use Code: CUREZA10",
    "Free Online Doctor Consultation for Rx Products",
    "Sustainably Sourced Ayurvedic Wellness Remedies"
  ]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await api.get('/settings/public');
        if (res.data && res.data.announcement_bar_items) {
          try {
            const items = JSON.parse(res.data.announcement_bar_items);
            if (Array.isArray(items) && items.length > 0) {
              setAnnouncements(items);
            }
          } catch (jsonErr) {
            // Handle cases where it is stored directly as a comma-separated list or raw string
            if (typeof res.data.announcement_bar_items === 'string') {
              setAnnouncements([res.data.announcement_bar_items]);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to load announcements from backend, using defaults:", e);
      }
    }
    loadAnnouncements();
  }, []);

  // Repeat items to fill marquee width seamlessly
  const repeatedAnnouncements = [...announcements, ...announcements, ...announcements, ...announcements];

  return (
    <div className="bg-[#052326] text-[#F8F3EF] h-9 overflow-hidden relative flex items-center border-b border-white/10 z-50">
      <div className="w-full relative flex overflow-x-hidden">
        {/* First track */}
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-[10px] md:text-xs font-semibold tracking-wider uppercase">
          {repeatedAnnouncements.map((text, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span>✦</span>
              <span>{text}</span>
            </span>
          ))}
        </div>

        {/* Second identical track for seamless infinite scroll */}
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-12 text-[10px] md:text-xs font-semibold tracking-wider uppercase">
          {repeatedAnnouncements.map((text, idx) => (
            <span key={`dup-${idx}`} className="flex items-center gap-2">
              <span>✦</span>
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
