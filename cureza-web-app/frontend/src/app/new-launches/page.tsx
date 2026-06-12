import ProductCard from '@/components/product/ProductCard';

async function getNewLaunches() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    try {
        const res = await fetch(`${backendUrl}/api/products`, {
            cache: 'no-store'
        });
        if (!res.ok) return [];
        const products = await res.json();
        
        // Sort by ID descending to get the newest products
        const sorted = products.sort((a: any, b: any) => b.id - a.id);
        
        return sorted.slice(0, 12).map((p: any) => ({
            id: p.id,
            title: p.title,
            brand: p.brand,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            rating: Number(p.rating || 4.5),
            reviews: p.reviews_count || 0,
            image: p.image,
            images: p.images,
            tags: p.tags,
            slug: p.slug,
            category: p.category
        }));
    } catch (error) {
        console.error('Failed to fetch new launches:', error);
        return [];
    }
}

export default async function NewLaunchesPage() {
    const products = await getNewLaunches();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <span className="text-cureza-green font-bold tracking-wider uppercase text-sm">Just Arrived</span>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal mt-2">New Launches</h1>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Discover the latest additions to our curated wellness collection. Be the first to try these premium products.</p>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    No new launches found. Please check back later.
                </div>
            )}
        </div>
    );
}
