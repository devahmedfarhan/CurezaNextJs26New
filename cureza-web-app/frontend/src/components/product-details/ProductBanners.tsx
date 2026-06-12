'use client';

import { getImageUrl } from '@/lib/imageHelper';

interface Banner {
    desktop: string | null;
    mobile: string | null;
}

interface ProductBannersProps {
    banners: Banner[] | null;
}

export default function ProductBanners({ banners }: ProductBannersProps) {
    if (!banners || !Array.isArray(banners) || banners.length === 0) {
        return null;
    }

    // Filter out empty banners and ensure they are objects
    const validBanners = (banners || []).filter(b => b && (b.desktop || b.mobile));

    if (validBanners.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6 md:space-y-8 mt-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white px-4 md:px-0">From the Brand</h3>
            {validBanners.map((banner, index) => (
                <div key={index} className="w-full rounded-2xl overflow-hidden shadow-sm">
                    {/* Desktop Image */}
                    {banner?.desktop && (
                        <img
                            src={getImageUrl(banner.desktop)}
                            alt={`Banner ${index + 1}`}
                            className={`w-full h-auto object-cover ${banner.mobile ? 'hidden md:block' : 'block'}`}
                        />
                    )}

                    {/* Mobile Image */}
                    {banner?.mobile && (
                        <img
                            src={getImageUrl(banner.mobile)}
                            alt={`Banner ${index + 1}`}
                            className={`w-full h-auto object-cover ${banner.desktop ? 'md:hidden' : 'block'}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
