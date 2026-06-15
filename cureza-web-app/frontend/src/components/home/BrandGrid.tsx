'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    banner_path?: string;
}

const FALLBACK_BANNERS = {
    big: {
        image: "https://i.pinimg.com/1200x/dc/3a/c6/dc3ac6f432fd26441aeb67d0ae0c5f02.jpg",
        link: "/brand/aura-wellness"
    },
    small: [
        {
            image: "https://r2.adspo.co/creatives/images/original/f95fe48a81960f7dde91716ed48ba9e4.jpg",
            link: "/brand/hemp-horizon"
        },
        {
            image: "https://i.pinimg.com/1200x/01/f4/1c/01f41cf2caaac783af3728a993a191dd.jpg",
            link: "/brand/ayurlife-organics"
        }
    ],
    bottom: [
        { image: "https://i.pinimg.com/1200x/2e/ad/8f/2ead8f9fd0f4bb6f0996ea18e4f57e84.jpg", link: "/brand/vedic-pure" },
        { image: "https://i.pinimg.com/1200x/39/80/32/398032d84fae2084c19bcba6afc96790.jpg", link: "/brand/green-earth" },
        { image: "https://i.pinimg.com/1200x/44/ee/74/44ee74af9f3bde1eb978a7cdbcb92c2d.jpg", link: "/brand/somya-herbals" },
        { image: "https://i.pinimg.com/1200x/08/a5/ea/08a5eab7ff1d79be50a217565ded662c.jpg", link: "/brand/pure-ayur" },
        { image: "https://i.pinimg.com/1200x/75/be/b0/75beb00be33d7da61524634c2b965907.jpg", link: "/brand/sattva-remedies" },
        { image: "https://i.pinimg.com/1200x/a4/4d/1d/a44d1dadf40967e85d4f4db48d5a7655.jpg", link: "/brand/amrit-life" },
    ]
};

export default function BrandBannerLayout() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedBrands = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                const response = await axios.get(`${backendUrl}/api/brands?featured=true&limit=9`);
                if (response.data && Array.isArray(response.data)) {
                    setBrands(response.data);
                }
            } catch (error) {
                console.error("Error fetching featured brands:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedBrands();
    }, []);

    const getImageUrl = (brand: Brand, isBig: boolean = false) => {
        const path = brand.banner_path || brand.logo;
        if (!path) {
            return isBig 
                ? "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=1200"
                : "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=600";
        }
        if (path.startsWith("http")) return path;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return `${backendUrl}${path.startsWith('/') ? '' : '/storage/'}${path}`;
    };

    // Construct layout banners based on fetched brands or fallback
    const layout = {
        big: brands.length > 0 
            ? { image: getImageUrl(brands[0], true), link: `/brand/${brands[0].slug}`, name: brands[0].name }
            : { image: FALLBACK_BANNERS.big.image, link: FALLBACK_BANNERS.big.link, name: "Featured Brand" },
            
        small: brands.length > 1
            ? brands.slice(1, 3).map(b => ({ image: getImageUrl(b), link: `/brand/${b.slug}`, name: b.name }))
            : FALLBACK_BANNERS.small.map(b => ({ image: b.image, link: b.link, name: "Popular Brand" })),
            
        bottom: brands.length > 3
            ? brands.slice(3, 9).map(b => ({ image: getImageUrl(b), link: `/brand/${b.slug}`, name: b.name }))
            : FALLBACK_BANNERS.bottom.map(b => ({ image: b.image, link: b.link, name: "Brand Partner" }))
    };

    return (
        <section className="container mx-auto px-4 pt-5 pb-0">

            {/* MOBILE — Heading + Subtitle (NO BUTTON) */}
            <div className="md:hidden text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Offers & Explore Brands
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-base">
                    Discover top wellness brands with exclusive deals curated just for you.
                </p>
            </div>

            {/* DESKTOP — Heading + Subtitle + Button */}
            <div className="hidden md:flex flex-row justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Offers & Explore Brands
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                        Discover top wellness brands with exclusive deals curated just for you.
                    </p>
                </div>

                <Link
                    href="/brands"
                    className="px-5 py-3 rounded-full text-xs font-medium inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white transition-all duration-300"
                >
                    Explore All Brands
                </Link>
            </div>

            {/* TOP SECTION (Desktop Grid) */}
            <div className="hidden md:grid grid-cols-4 gap-2 ">
                <Link
                    href={layout.big.link}
                    className="col-span-2 row-span-2 w-full h-[700px] rounded-lg overflow-hidden relative group"
                >
                    <img
                        src={layout.big.image}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={layout.big.name}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-end p-6">
                        <span className="text-white text-xl font-bold">{layout.big.name}</span>
                    </div>
                </Link>

                {layout.small.map((b, i) => (
                    <Link
                        key={i}
                        href={b.link}
                        className="col-span-1 w-full h-[700px] rounded-lg overflow-hidden relative group"
                    >
                        <img 
                            src={b.image} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt={b.name} 
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-end p-4">
                            <span className="text-white text-base font-bold">{b.name}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* MOBILE VERSION */}
            <div className="md:hidden space-y-4">
                <Link href={layout.big.link} className="block rounded-lg overflow-hidden relative group">
                    <img src={layout.big.image} className="w-full h-auto object-cover" alt={layout.big.name} />
                    <div className="absolute inset-0 bg-black/10 flex items-end p-4">
                        <span className="text-white text-lg font-bold">{layout.big.name}</span>
                    </div>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                    {layout.small.map((b, i) => (
                        <Link key={i} href={b.link} className="rounded-lg overflow-hidden relative group">
                            <img src={b.image} className="w-full h-full object-cover" alt={b.name} />
                            <div className="absolute inset-0 bg-black/15 flex items-end p-3">
                                <span className="text-white text-sm font-bold truncate w-full">{b.name}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* BOTTOM 6 BANNERS */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                {layout.bottom.map((b, i) => (
                    <Link key={i} href={b.link} className="rounded-lg overflow-hidden aspect-square relative group">
                        <img src={b.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={b.name} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-end p-2">
                            <span className="text-white text-xs font-semibold truncate w-full">{b.name}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* MOBILE — BUTTON AT BOTTOM */}
            <div className="md:hidden flex justify-center mt-5">
                <Link
                    href="/brands"
                    className="px-5 py-3 rounded-full text-xs font-medium inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white transition-all duration-300"
                >
                    Explore All Brands
                </Link>
            </div>

        </section>
    );
}
