'use client';

import Link from "next/link";

const BANNERS = {
    big: {
        image: "https://i.pinimg.com/1200x/dc/3a/c6/dc3ac6f432fd26441aeb67d0ae0c5f02.jpg",
        link: "/brand/big-brand"
    },
    small: [
        {
            image: "https://r2.adspo.co/creatives/images/original/f95fe48a81960f7dde91716ed48ba9e4.jpg",
            link: "/brand/small-1"
        },
        {
            image: "https://i.pinimg.com/1200x/01/f4/1c/01f41cf2caaac783af3728a993a191dd.jpg",
            link: "/brand/small-2"
        }
    ],
    bottom: [
        { image: "https://i.pinimg.com/1200x/2e/ad/8f/2ead8f9fd0f4bb6f0996ea18e4f57e84.jpg", link: "/brand/b1" },
        { image: "https://i.pinimg.com/1200x/39/80/32/398032d84fae2084c19bcba6afc96790.jpg", link: "/brand/b2" },
        { image: "https://i.pinimg.com/1200x/44/ee/74/44ee74af9f3bde1eb978a7cdbcb92c2d.jpg", link: "/brand/b3" },
        { image: "https://i.pinimg.com/1200x/08/a5/ea/08a5eab7ff1d79be50a217565ded662c.jpg", link: "/brand/b4" },
        { image: "https://i.pinimg.com/1200x/75/be/b0/75beb00be33d7da61524634c2b965907.jpg", link: "/brand/b5" },
        { image: "https://i.pinimg.com/1200x/a4/4d/1d/a44d1dadf40967e85d4f4db48d5a7655.jpg", link: "/brand/b6" },
    ]
};

export default function BrandBannerLayout() {
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
                    href={BANNERS.big.link}
                    className="col-span-2 row-span-2 w-full h-[700px] rounded-lg overflow-hidden"
                >
                    <img
                        src={BANNERS.big.image}
                        className="w-full h-full object-cover"
                        alt="main banner"
                    />
                </Link>

                {BANNERS.small.map((b, i) => (
                    <Link
                        key={i}
                        href={b.link}
                        className="col-span-1 w-full h-[700px] rounded-lg overflow-hidden"
                    >
                        <img src={b.image} className="w-full h-full object-cover" alt="small banner" />
                    </Link>
                ))}
            </div>

            {/* MOBILE VERSION */}
            <div className="md:hidden space-y-4">
                <Link href={BANNERS.big.link} className="block rounded-lg overflow-hidden">
                    <img src={BANNERS.big.image} className="w-full h-auto object-cover" />
                </Link>

                <div className="grid grid-cols-2 gap-2">
                    {BANNERS.small.map((b, i) => (
                        <Link key={i} href={b.link} className="rounded-lg overflow-hidden">
                            <img src={b.image} className="w-full h-full object-cover" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* BOTTOM 6 BANNERS */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                {BANNERS.bottom.map((b, i) => (
                    <Link key={i} href={b.link} className="rounded-lg overflow-hidden aspect-square">
                        <img src={b.image} className="w-full h-full object-cover" />
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
