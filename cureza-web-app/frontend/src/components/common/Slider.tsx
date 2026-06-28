'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderProps {
    children: React.ReactNode;
    className?: string;
    gap?: number;
}

export default function Slider({ children, className = '', gap = 24 }: SliderProps) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dragMoved, setDragMoved] = useState(false);

    // Scroll state for buttons
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [dots, setDots] = useState<number[]>([]);
    const [activeDot, setActiveDot] = useState(0);

    const updateScrollState = () => {
        const slider = sliderRef.current;
        if (!slider) return;

        const { scrollLeft, scrollWidth, clientWidth } = slider;

        setShowLeftArrow(scrollLeft > 5);
        // Show right arrow if there is more content to scroll (with a 5px buffer)
        setShowRightArrow(scrollWidth - scrollLeft - clientWidth > 5);

        // Update active dot and dots count
        if (clientWidth > 0) {
            const totalDots = Math.max(1, Math.ceil(scrollWidth / clientWidth));
            const newDots = Array.from({ length: totalDots }, (_, i) => i);
            setDots(newDots);
            
            const currentActive = Math.round(scrollLeft / clientWidth);
            setActiveDot(Math.min(currentActive, totalDots - 1));
        }
    };

    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        updateScrollState();
        
        // Listen to resize and scroll
        slider.addEventListener('scroll', updateScrollState);
        window.addEventListener('resize', updateScrollState);

        return () => {
            slider.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [children]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const slider = sliderRef.current;
        if (!slider) return;
        
        setIsDragging(true);
        setDragMoved(false);
        setStartX(e.pageX - slider.offsetLeft);
        setScrollLeft(slider.scrollLeft);
        
        // Prevent default text selection during drag
        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const slider = sliderRef.current;
        if (!slider) return;

        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.5; // Drag sensitivity multiplier
        if (Math.abs(walk) > 5) {
            setDragMoved(true);
        }
        slider.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Touch events for mobile
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchStartScrollLeft, setTouchStartScrollLeft] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        const slider = sliderRef.current;
        if (!slider) return;
        setTouchStartX(e.touches[0].pageX - slider.offsetLeft);
        setTouchStartScrollLeft(slider.scrollLeft);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const slider = sliderRef.current;
        if (!slider) return;
        const x = e.touches[0].pageX - slider.offsetLeft;
        const walk = (x - touchStartX) * 1.5;
        slider.scrollLeft = touchStartScrollLeft - walk;
    };

    const scroll = (direction: 'left' | 'right') => {
        const slider = sliderRef.current;
        if (!slider) return;

        const scrollAmount = slider.clientWidth * 0.75;
        slider.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const scrollToDot = (index: number) => {
        const slider = sliderRef.current;
        if (!slider) return;

        slider.scrollTo({
            left: slider.clientWidth * index,
            behavior: 'smooth'
        });
    };

    return (
        <div className={`relative group/slider w-full ${className}`}>
            {/* Left Navigation Arrow */}
            {showLeftArrow && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-800 hover:scale-105 transition-all"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={16} />
                </button>
            )}

            {/* Slider track wrapper */}
            <div
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                className={`flex overflow-x-auto select-none scroll-smooth scrollbar-none gap-6 pb-2 cursor-grab ${
                    isDragging ? 'cursor-grabbing' : ''
                }`}
                style={{
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {React.Children.map(children, (child) => {
                    if (!child) return null;
                    return (
                        <div 
                            className="shrink-0 select-none"
                            style={{ 
                                pointerEvents: isDragging && dragMoved ? 'none' : 'auto' 
                            }}
                        >
                            {child}
                        </div>
                    );
                })}
            </div>

            {/* Right Navigation Arrow */}
            {showRightArrow && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-800 hover:scale-105 transition-all"
                    aria-label="Next slide"
                >
                    <ChevronRight size={16} />
                </button>
            )}

            {/* Pagination Dots */}
            {dots.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {dots.map((dot) => (
                        <button
                            key={dot}
                            onClick={() => scrollToDot(dot)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                activeDot === dot 
                                    ? 'bg-[#052326] w-3 dark:bg-white' 
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${dot + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
