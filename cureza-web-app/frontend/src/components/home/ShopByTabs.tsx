"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useCategories } from "@/contexts/CategoryContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ShopByCarousel() {
    const { categories, concerns } = useCategories();

    const clearanceSale = categories.slice(0, 10).map((c) => ({
        ...c,
        name: c.name + " (Sale)",
    }));

    const [activeTab, setActiveTab] = useState<"categories" | "concerns" | "clearance">("categories");
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement | null>(null);

    const getItems = () => {
        if (activeTab === "categories") return categories;
        if (activeTab === "concerns") return concerns;
        if (activeTab === "clearance") return clearanceSale;
        return [];
    };

    const items = getItems();

    const handleNext = () => {
        if (!carouselRef.current) return;
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;

        let newPos = carouselRef.current.scrollLeft + 200;
        if (newPos > maxScroll) newPos = 0;

        setCurrentIndex(Math.floor(newPos / 130));
        carouselRef.current.scrollTo({ left: newPos, behavior: "smooth" });
    };

    const handlePrev = () => {
        if (!carouselRef.current) return;

        let newPos = carouselRef.current.scrollLeft - 200;
        if (newPos < 0) newPos = items.length * 130;

        setCurrentIndex(Math.floor(newPos / 130));
        carouselRef.current.scrollTo({ left: newPos, behavior: "smooth" });
    };

    return (
        <section className="container mx-auto px-4 ">

            {/* ---------- HEADER LEFT (desktop) ---------- */}
            <div className="hidden md:flex items-center justify-between mb-10">

                <div>
                    <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
                        Shop by Health & Wellness
                    </h2>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-2">
                        Explore Ayurvedic remedies, herbal supplements, and trusted wellness products curated to support your daily health needs.
                    </p>
                </div>

                {/* ---------- PREMIUM TABS ---------- */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-2 shadow-inner gap-1">
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`px-6 py-2 rounded-full text-sm font-medium ${activeTab === "categories" ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white" : "text-gray-600"
                            }`}
                    >
                        Categories
                    </button>

                    <button
                        onClick={() => setActiveTab("concerns")}
                        className={`px-6 py-2 rounded-full text-sm font-medium ${activeTab === "concerns" ? "bg-gradient-to-r from-green-400 to-blue-500 text-white" : "text-gray-600"
                            }`}
                    >
                        Health Concerns
                    </button>

                    {/* CLEARANCE SALE tab */}
                    <button
                        onClick={() => setActiveTab("clearance")}
                        className={`relative px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${activeTab === "clearance"
                            ? "bg-red-600 text-white"
                            : "text-gray-600"
                            }`}
                    >
                        Clearance Sale

                        <span
                            className={
                                activeTab === "clearance"
                                    ? "w-2 h-2 rounded-full bg-white"
                                    : "w-2 h-2 rounded-full bg-red-500 animate-pulse"
                            }
                        />
                    </button>

                </div>
            </div>

            {/* ---------- MOBILE HEADER (centered) ---------- */}
            <div className="md:hidden text-center mb-5">
                <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                    Shop by Health & Wellness
                </h2>
                <p className="text-xs text-gray-500 mt-2">
                    Explore Ayurvedic remedies, herbal supplements, and trusted wellness products curated to support your daily health needs.
                </p>

                {/* MOBILE TABS */}
                <div className="mt-6 inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-2 shadow-inner gap-1">
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`px-5 py-2 rounded-full text-xs font-medium ${activeTab === "categories" ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white" : "text-gray-600"
                            }`}
                    >
                        Categories
                    </button>

                    <button
                        onClick={() => setActiveTab("concerns")}
                        className={`px-5 py-2 rounded-full text-xs font-medium ${activeTab === "concerns" ? "bg-gradient-to-r from-green-400 to-blue-500 text-white" : "text-gray-600"
                            }`}
                    >
                        Concerns
                    </button>

                    <button
                        onClick={() => setActiveTab("clearance")}
                        className={`relative px-5 py-2 rounded-full text-xs font-medium flex items-center gap-1 ${activeTab === "clearance"
                            ? "bg-red-600 text-white"
                            : "text-gray-600"
                            }`}>
                        Sale <span className={`       w-2 h-2 rounded-full       ${activeTab === "clearance"
                            ? "bg-white"          // ACTIVE → dot white
                            : "bg-red-500 animate-pulse"   // INACTIVE → red pulsing
                            }   `}
                        />
                    </button>

                </div>
            </div>

            {/* ---------- CAROUSEL ---------- */}
            <div className="relative">

                {/* Arrows on desktop */}
                <button
                    onClick={handlePrev}
                    className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 bg-white/40 dark:bg-gray-700/40 hover:bg-cureza-green/60 hover:text-white transition-all duration-300 p-2 rounded-full"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    onClick={handleNext}
                    className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-white/40 dark:bg-gray-700/40 hover:bg-cureza-green/60 hover:text-white transition-all duration-300 p-2 rounded-full"
                >
                    <ChevronRight size={18} />
                </button>


                {/* Scrollable Carousel */}
                <div
                    ref={carouselRef}
                    className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory py-2"
                >
                    {items.map((item: any) => (
                        <Link key={item.id} href={`/category/${item.slug}`} className="snap-start flex-shrink-0 w-[20%] md:w-[150px]">
                            <div className="flex flex-col items-center group">

                                {/* Instagram Glow Ring */}
                                <div className="
                                    relative w-16 h-16 md:w-28 md:h-28 rounded-full p-[3px]
                                    bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400
                                    group-hover:from-yellow-400 group-hover:to-pink-500
                                    transition-all duration-500
                                ">
                                    <div className="
                                        w-full h-full rounded-full overflow-hidden 
                                        bg-gray-100 dark:bg-gray-700
                                        flex items-center justify-center
                                    ">
                                        <img
                                            src={
                                                item.image
                                                    ? (item.image.startsWith("http")
                                                        ? item.image
                                                        : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}${item.image.startsWith('/') ? '' : '/storage/'}${item.image}`)
                                                    : '/fallback.png'
                                            }
                                            className="w-full h-full object-cover"
                                            alt={item.name}
                                        />
                                    </div>
                                </div>

                                <p className="mt-3 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-cureza-green">
                                    {item.name}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination dots */}
                <div className="flex justify-center mt-6 gap-2">
                    {items.map((_: any, index: number) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all ${index === currentIndex ? "bg-cureza-green w-6" : "bg-gray-300 w-2"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
