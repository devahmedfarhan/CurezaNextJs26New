'use client';

import { useState, useRef } from 'react';
import { Play, Pause, ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

interface VideoStory {
  id: number;
  title: string;
  category: string;
  videoUrl: string;
  thumbnail: string;
  productName: string;
  productPrice: string;
  productSlug: string;
}

const VIDEOS: VideoStory[] = [
  {
    id: 1,
    title: "Daily Calm & Focus Routine",
    category: "Mental Wellness",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-oil-dripping-from-a-dropper-34509-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80",
    productName: "Cureza Rest Oil",
    productPrice: "₹1,899",
    productSlug: "cureza-rest-sleep-oil"
  },
  {
    id: 2,
    title: "Understanding Broad Spectrum CBD",
    category: "Science & Education",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-pouring-massage-oil-into-hand-42095-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=500&q=80",
    productName: "Active Pain Balm",
    productPrice: "₹849",
    productSlug: "cureza-active-pain-balm"
  },
  {
    id: 3,
    title: "Botanical Extracts for Recovery",
    category: "Physio Therapy",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-on-a-beach-at-sunset-1040-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&q=80",
    productName: "Focus Capsules",
    productPrice: "₹1,249",
    productSlug: "cureza-focus-capsules"
  }
];

export default function WatchAndExplore() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [muted, setMuted] = useState<boolean>(true);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const handlePlayPause = (id: number) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingId === id) {
      video.pause();
      setPlayingId(null);
    } else {
      // Pause current playing
      if (playingId !== null && videoRefs.current[playingId]) {
        videoRefs.current[playingId]?.pause();
      }
      video.play().catch(err => console.log("video play failed:", err));
      setPlayingId(id);
    }
  };

  return (
    <section className="w-full py-16 md:py-24 bg-[#052326] text-[#F8F3EF] overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/10 pb-6 gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#F0C417] uppercase block mb-2">
              Shoppable Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#F8F3EF]">
              Watch, Learn & Explore
            </h2>
            <p className="text-sm text-[#F8F3EF]/70 font-light mt-2 max-w-xl">
              Take a closer look at our formulas, scientific validation, and daily routines recommended by our lead wellness experts.
            </p>
          </div>
          
          <button 
            onClick={() => setMuted(!muted)} 
            className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase border border-white/20 px-4 py-2 rounded-[10px] bg-white/5 hover:bg-white/10 transition-all self-start md:self-end"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {muted ? "Unmute Audio" : "Mute Audio"}
          </button>
        </div>

        {/* Video Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VIDEOS.map((story) => {
            const isPlaying = playingId === story.id;
            return (
              <div 
                key={story.id} 
                className="bg-white/5 border border-white/10 rounded-[14px] overflow-hidden shadow-2xl group flex flex-col h-[520px]"
              >
                {/* Video Container */}
                <div className="relative flex-1 bg-black overflow-hidden select-none">
                  <video
                    ref={el => { videoRefs.current[story.id] = el; }}
                    src={story.videoUrl}
                    poster={story.thumbnail}
                    loop
                    muted={muted}
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    onClick={() => handlePlayPause(story.id)}
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-4 left-4 px-3 py-1 text-[9px] font-bold uppercase bg-[#052326]/80 text-[#F0C417] rounded-md tracking-wider border border-white/10 z-10">
                    {story.category}
                  </span>

                  {/* Play/Pause Button Overlay */}
                  <button
                    onClick={() => handlePlayPause(story.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all z-10"
                    aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#F8F3EF] group-hover:scale-110 transition-transform duration-300">
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                    </div>
                  </button>
                </div>

                {/* Info & Product Tag Overlay (10-14px border radius tags) */}
                <div className="p-5 border-t border-white/10 bg-[#052326]">
                  <h3 className="text-sm font-semibold mb-4 text-[#F8F3EF] line-clamp-1">{story.title}</h3>
                  
                  {/* Shoppable Product Card inside the Story */}
                  <div className="bg-white/5 border border-white/10 p-3 rounded-[12px] flex items-center justify-between hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-white/10 border border-white/10">
                        <img src={story.thumbnail} className="w-full h-full object-cover" alt="Product" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#F8F3EF]">{story.productName}</p>
                        <p className="text-[10px] text-[#F0C417] mt-0.5 font-bold">{story.productPrice}</p>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/product/${story.productSlug}`} 
                      className="p-2.5 rounded-[10px] bg-[#F0C417] hover:bg-[#F0C417]/90 text-[#052326] transition-all"
                      aria-label={`Buy ${story.productName}`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
