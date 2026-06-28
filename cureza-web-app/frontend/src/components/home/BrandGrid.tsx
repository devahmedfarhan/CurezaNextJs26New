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
        <section className="container mx-auto px-4 md:px-6 py-12 md:py-16 bg-white text-[#052326]">

            {/* MOBILE — Heading + Subtitle (NO BUTTON) */}
            <div className="md:hidden text-center mb-6">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/60 uppercase block mb-2">
                    Curated Partners
                </span>
                <h2 className="text-2xl font-semibold tracking-tight">
                    Offers & Explore Brands
                </h2>
                <p className="text-sm text-[#052326]/80 mt-2 font-light">
                    Discover top wellness brands with exclusive deals curated just for you.
                </p>
            </div>

            {/* DESKTOP — Heading + Subtitle + Button */}
            <div className="hidden md:flex flex-row justify-between items-end mb-8 pb-6 border-b border-[#052326]/10">
                <div>
                    <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/60 uppercase block mb-2">
                        Curated Partners
                    </span>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                        Offers & Explore Brands
                    </h2>
                    <p className="text-sm text-[#052326]/80 mt-2 font-light">
                        Discover top wellness brands with exclusive deals curated just for you.
                    </p>
                </div>

                <Link
                    href="/brands"
                    className="group inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#052326] border border-[#052326]/20 px-5 py-2.5 rounded-[10px] bg-[#F8F3EF] hover:bg-[#052326] hover:text-[#F8F3EF] transition-all self-start sm:self-end shadow-sm"
                >
                    Explore All Brands
                </Link>
            </div>

            {/* TOP SECTION (Desktop Grid) */}
            <div className="hidden md:grid grid-cols-4 gap-4">
                <Link
                    href={layout.big.link}
                    className="col-span-2 row-span-2 w-full h-[700px] overflow-hidden relative group"
                    style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(85, 85, 85, 0.18)',
                    }}
                >
                    <img
                        src={layout.big.image}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={layout.big.name}
                    />
                    <div className="absolute inset-0 bg-[#052326]/20 group-hover:bg-[#052326]/30 transition-colors flex items-end p-6">
                        <span className="text-white text-xl font-bold bg-[#052326]/85 px-4 py-2 rounded-[6px] backdrop-blur-sm border border-white/15">{layout.big.name}</span>
                    </div>
                </Link>

                {layout.small.map((b, i) => (
                    <Link
                        key={i}
                        href={b.link}
                        className="col-span-1 w-full h-[700px] overflow-hidden relative group"
                        style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(85, 85, 85, 0.18)',
                        }}
                    >
                        <img 
                            src={b.image} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt={b.name} 
                        />
                        <div className="absolute inset-0 bg-[#052326]/20 group-hover:bg-[#052326]/30 transition-colors flex items-end p-4">
                            <span className="text-white text-base font-bold bg-[#052326]/85 px-3 py-1.5 rounded-[6px] backdrop-blur-sm border border-white/15 truncate w-full max-w-[90%] text-center">{b.name}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* MOBILE VERSION */}
            <div className="md:hidden space-y-4">
                <Link 
                    href={layout.big.link} 
                    className="block overflow-hidden relative group"
                    style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(85, 85, 85, 0.18)',
                    }}
                >
                    <img src={layout.big.image} className="w-full h-auto object-cover" alt={layout.big.name} />
                    <div className="absolute inset-0 bg-[#052326]/20 flex items-end p-4">
                        <span className="text-white text-lg font-bold bg-[#052326]/80 px-3 py-1 rounded-[6px]">{layout.big.name}</span>
                    </div>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                    {layout.small.map((b, i) => (
                        <Link 
                            key={i} 
                            href={b.link} 
                            className="overflow-hidden relative group"
                            style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(85, 85, 85, 0.18)',
                            }}
                        >
                            <img src={b.image} className="w-full h-full object-cover" alt={b.name} />
                            <div className="absolute inset-0 bg-[#052326]/20 flex items-end p-3">
                                <span className="text-white text-xs font-bold truncate w-full bg-[#052326]/80 px-2 py-0.5 rounded-[4px] text-center">{b.name}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* BOTTOM 6 BANNERS */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                {layout.bottom.map((b, i) => (
                    <Link 
                        key={i} 
                        href={b.link} 
                        className="overflow-hidden aspect-square relative group"
                        style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(85, 85, 85, 0.18)',
                        }}
                    >
                        <img src={b.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={b.name} />
                        <div className="absolute inset-0 bg-[#052326]/10 group-hover:bg-[#052326]/20 transition-colors flex items-end p-2">
                            <span className="text-white text-[10px] font-semibold truncate w-full bg-[#052326]/85 px-1.5 py-0.5 rounded-[4px] text-center">{b.name}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* MOBILE — BUTTON AT BOTTOM */}
            <div className="md:hidden flex justify-center mt-5">
                <Link
                    href="/brands"
                    className="px-5 py-3 rounded-[10px] text-xs font-bold uppercase tracking-wider text-[#052326] border border-[#052326]/20 bg-[#F8F3EF] hover:bg-[#052326] hover:text-[#F8F3EF] transition-all"
                >
                    Explore All Brands
                </Link>
            </div>

        </section>
    );
}
