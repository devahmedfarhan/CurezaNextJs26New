import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cureza.in';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/dashboard/',
                '/seller/dashboard/',
                '/doctor/dashboard/',
                '/superadmin/',
                '/checkout/',
                '/cart/'
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
