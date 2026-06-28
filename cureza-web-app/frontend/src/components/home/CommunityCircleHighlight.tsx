'use client';

import { MessageSquare, Users, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Discussion {
  id: number;
  title: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  time: string;
  tag: string;
}

const DISCUSSIONS: Discussion[] = [
  {
    id: 1,
    title: 'How to dose broad-spectrum CBD Oil for sleep and anxiety?',
    author: 'Aman K.',
    category: 'VCCBD Therapy',
    replies: 18,
    views: 245,
    time: '2 hours ago',
    tag: 'Sleep & Anxiety',
  },
  {
    id: 2,
    title: 'Can Ashwagandha be taken continuously or should we cycle it?',
    author: 'Dr. Ramesh N.',
    category: 'Ayurvedic Science',
    replies: 12,
    views: 188,
    time: '5 hours ago',
    tag: 'Adaptogens',
  },
  {
    id: 3,
    title: 'My 4-week experience with Hemp Seed Oil for skin acne & eczema',
    author: 'Sneha R.',
    category: 'Botanical Skincare',
    replies: 31,
    views: 412,
    time: '1 day ago',
    tag: 'Skin & Hair',
  },
];

export default function CommunityCircleHighlight() {
  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-16 bg-[#F8F3EF] text-[#052326]">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-[#052326]/10 gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/60 uppercase block mb-2">
            Cureza Circle Forum
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Join Our Wellness Community
          </h2>
          <p className="text-sm text-[#052326]/80 mt-2 max-w-xl font-light">
            Share experiences, read patient journeys, and ask questions to verified Ayurvedic doctors and herbalists.
          </p>
        </div>

        <Link
          href="/community"
          className="group inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#052326] border border-[#052326]/20 px-5 py-2.5 rounded-[10px] bg-white hover:bg-[#052326] hover:text-[#F8F3EF] transition-all self-start sm:self-end shadow-sm"
        >
          Enter Cureza Circle
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* DISCUSSIONS LISTING */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DISCUSSIONS.map((disc) => (
          <div
            key={disc.id}
            className="bg-white p-5 flex flex-col justify-between h-[220px] transition-all duration-300 hover:scale-[1.01]"
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(85, 85, 85, 0.18)',
            }}
          >
            <div>
              {/* Category & Tag */}
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#052326]/50 mb-3">
                <span>{disc.category}</span>
                <span className="bg-[#052326]/5 text-[#052326] px-2 py-0.5 rounded-[4px] border border-[#052326]/5">
                  {disc.tag}
                </span>
              </div>

              {/* Title */}
              <Link href="/community" className="group/link block">
                <h3 className="text-sm font-semibold text-[#052326] leading-snug line-clamp-3 group-hover/link:text-[#F0C417] transition-colors">
                  "{disc.title}"
                </h3>
              </Link>
            </div>

            {/* Author details & stats */}
            <div className="border-t border-[#052326]/5 pt-3 mt-4 flex justify-between items-center text-xs text-[#052326]/60">
              <div className="flex items-center gap-1.5">
                <Users size={12} className="text-[#052326]/40" />
                <span>
                  By <span className="font-semibold text-[#052326]">{disc.author}</span>
                </span>
                <span className="text-[10px] text-gray-400">• {disc.time}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium">
                  <MessageSquare size={12} />
                  {disc.replies}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Eye size={12} />
                  {disc.views}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
