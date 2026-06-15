import { MetadataRoute } from 'next';
import axios from 'axios';

// Base URL for the site
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cureza.in';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Pages Definition
    const staticPages = [
        '',
        '/about',
        '/contact',
        '/faq',
        '/shop',
        '/bestsellers',
        '/new-launches',
        '/medical-policy',
        '/returns',
        '/legal/privacy-policy',
        '/legal/terms-of-service',
        '/seller',
        '/doctor',
        '/lab-reports',
        '/affiliate'
    ];

    const staticUrls: MetadataRoute.Sitemap = staticPages.map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
    }));

    // Dynamic Lists
    let productUrls: MetadataRoute.Sitemap = [];
    let brandUrls: MetadataRoute.Sitemap = [];
    let categoryUrls: MetadataRoute.Sitemap = [];
    let blogUrls: MetadataRoute.Sitemap = [];

    // 2. Fetch Dynamic Products
    try {
        const res = await axios.get(`${BACKEND_URL}/api/products`);
        if (res.data && Array.isArray(res.data)) {
            productUrls = res.data.map((product: any) => ({
                url: `${SITE_URL}/product/${product.slug}`,
                lastModified: new Date(product.updated_at || new Date()),
                changeFrequency: 'daily',
                priority: 0.9,
            }));
        }
    } catch (error) {
        console.error("Sitemap: Failed to fetch products:", error.message);
    }

    // 3. Fetch Dynamic Brands
    try {
        const res = await axios.get(`${BACKEND_URL}/api/brands`);
        const brandsData = res.data?.data || res.data;
        if (brandsData && Array.isArray(brandsData)) {
            brandUrls = brandsData.map((brand: any) => ({
                url: `${SITE_URL}/brand/${brand.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            }));
        }
    } catch (error) {
        console.error("Sitemap: Failed to fetch brands:", error.message);
    }

    // 4. Fetch Dynamic Categories
    try {
        const res = await axios.get(`${BACKEND_URL}/api/categories`);
        if (res.data && Array.isArray(res.data)) {
            categoryUrls = res.data.map((category: any) => ({
                url: `${SITE_URL}/category/${category.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error("Sitemap: Failed to fetch categories:", error.message);
    }

    // 5. Fetch Dynamic Blog Posts
    try {
        const res = await axios.get(`${BACKEND_URL}/api/blog/posts`);
        const postsData = res.data?.data || res.data;
        if (postsData && Array.isArray(postsData)) {
            blogUrls = postsData.map((post: any) => ({
                url: `${SITE_URL}/blog/posts/${post.slug}`,
                lastModified: new Date(post.updated_at || new Date()),
                changeFrequency: 'weekly',
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error("Sitemap: Failed to fetch blog posts:", error.message);
    }

    // Combine all URLs
    return [
        ...staticUrls,
        ...productUrls,
        ...brandUrls,
        ...categoryUrls,
        ...blogUrls
    ];
}
