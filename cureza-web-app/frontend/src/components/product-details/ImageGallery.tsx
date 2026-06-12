'use client';

import { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { getImageUrl } from '@/lib/imageHelper';

interface ImageGalleryProps {
    images: string[];
    mainImage: string;
    title: string;
    video_url?: string;
    video_file?: string;
    video_cover?: string;
}

export default function ImageGallery({ images, mainImage, title, video_url, video_file, video_cover }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);

    // Build media list: Main Image -> Video -> Gallery Images
    const mediaItems = [];

    // 1. Main Image
    mediaItems.push({ type: 'image', url: mainImage });

    // 2. Video (if exists)
    if (video_url || video_file) {
        mediaItems.push({
            type: 'video',
            url: video_url || video_file,
            cover: video_cover,
            isVideoFile: !!video_file && !video_url
        });
    }

    // 3. Gallery Images
    if (images && images.length > 0) {
        images.forEach(img => {
            if (img !== mainImage) { // Avoid duplication if main image is also in gallery
                mediaItems.push({ type: 'image', url: img });
            }
        });
    }

    const currentItem = mediaItems[selectedIndex] || { type: 'image', url: '/placeholder.png' };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (currentItem.type !== 'image') return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({ x, y });
    };

    const nextItem = () => setSelectedIndex((prev) => (prev + 1) % mediaItems.length);
    const prevItem = () => setSelectedIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);

    const renderMainContent = (item: any, isModal = false) => {
        if (item.type === 'video') {
            if (item.isVideoFile) {
                return (
                    <video
                        src={getImageUrl(item.url)}
                        controls
                        className="w-full h-full object-contain"
                        poster={item.cover ? getImageUrl(item.cover) : undefined}
                    />
                );
            } else {
                // YouTube embed
                const videoId = item.url.includes('v=') ? item.url.split('v=')[1].split('&')[0] : item.url.split('/').pop();
                return (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                    />
                );
            }
        }

        return (
            <img
                src={getImageUrl(item.url)}
                alt={title}
                className={`w-full h-full object-contain p-4 transition-transform duration-200 ${!isModal && isZooming ? 'scale-150' : 'scale-100'}`}
                style={!isModal && isZooming ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
            />
        );
    };

    return (
        <div className="space-y-6 select-none">
            {/* Main Media Area */}
            <div
                className={`relative aspect-square w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm group ${currentItem.type === 'image' ? 'cursor-zoom-in' : ''}`}
                onMouseEnter={() => currentItem.type === 'image' && setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                onClick={() => currentItem.type === 'image' && setIsModalOpen(true)}
            >
                {renderMainContent(currentItem)}

                {currentItem.type === 'image' && (
                    <>
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0">
                            <Maximize2 size={20} className="text-gray-700 dark:text-gray-200" />
                        </div>

                        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2">
                            <ZoomIn size={14} className="text-gray-700 dark:text-gray-200" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">HOVER TO ZOOM</span>
                        </div>
                    </>
                )}

                {/* Mobile Navigation */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:hidden pointer-events-none">
                    <button onClick={(e) => { e.stopPropagation(); prevItem(); }} className="pointer-events-auto bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md backdrop-blur-sm">
                        <ChevronLeft size={20} className="text-gray-800 dark:text-white" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextItem(); }} className="pointer-events-auto bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-md backdrop-blur-sm">
                        <ChevronRight size={20} className="text-gray-800 dark:text-white" />
                    </button>
                </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-3 md:gap-4">
                {mediaItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedIndex === idx
                            ? 'border-cureza-green ring-2 ring-cureza-green/20 scale-95 opacity-100 shadow-md'
                            : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 opacity-70 hover:opacity-100'
                            }`}
                    >
                        {item.type === 'video' ? (
                            <div className="relative w-full h-full">
                                <img src={item.cover ? getImageUrl(item.cover) : '/video-placeholder.png'} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="bg-white/90 p-1.5 rounded-full">
                                        <ChevronRight size={16} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <img src={getImageUrl(item.url)} alt={`${title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        )}
                    </button>
                ))}
            </div>

            {/* Full Screen Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setIsModalOpen(false)}
                >
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
                    >
                        <X size={24} />
                    </button>

                    <button onClick={(e) => { e.stopPropagation(); prevItem(); }} className="absolute left-4 md:left-8 text-white/80 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all">
                        <ChevronLeft size={40} />
                    </button>

                    <div className="max-h-[85vh] max-w-[85vw] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {renderMainContent(currentItem, true)}
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); nextItem(); }} className="absolute right-4 md:right-8 text-white/80 hover:text-white p-4 hover:bg-white/10 rounded-full transition-all">
                        <ChevronRight size={40} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {mediaItems.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${selectedIndex === idx ? 'bg-white w-8' : 'bg-white/30 w-1.5'}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
