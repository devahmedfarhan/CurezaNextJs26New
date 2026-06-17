'use client';

import { useState, useEffect } from 'react';

interface Heading {
    text: string;
    id: string;
    level: number;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const headingElements = headings.map(h => document.getElementById(h.id));
            let currentActiveId = '';

            // Find the heading that is closest to the top of the screen (but past a threshold)
            for (const el of headingElements) {
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 140) {
                        currentActiveId = el.id;
                    }
                }
            }

            if (currentActiveId) {
                setActiveId(currentActiveId);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // initial call

        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    if (!headings || headings.length === 0) return null;

    return (
        <div className="bg-white border border-[#052326]/5 rounded-2xl p-5 shadow-sm">
            <h4 className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/60 uppercase mb-4">
                On This Page
            </h4>
            <div className="space-y-3 border-l border-gray-100 pl-3">
                {headings.map((heading) => (
                    <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-xs leading-relaxed transition-all duration-200 hover:text-cureza-green ${
                            heading.level === 3 
                                ? 'pl-4 text-gray-500 hover:translate-x-0.5' 
                                : 'font-semibold text-gray-800 hover:translate-x-0.5'
                        } ${
                            activeId === heading.id 
                                ? 'text-cureza-green font-bold border-l-2 border-cureza-green -ml-[14px] pl-[13px]' 
                                : ''
                        }`}
                        onClick={(e) => {
                            e.preventDefault();
                            const target = document.getElementById(heading.id);
                            if (target) {
                                const offset = 100;
                                const bodyRect = document.body.getBoundingClientRect().top;
                                const elementRect = target.getBoundingClientRect().top;
                                const elementPosition = elementRect - bodyRect;
                                const offsetPosition = elementPosition - offset;
                                
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }}
                    >
                        {heading.text}
                    </a>
                ))}
            </div>
        </div>
    );
}
