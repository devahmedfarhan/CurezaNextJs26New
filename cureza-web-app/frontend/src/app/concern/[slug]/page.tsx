import ProductCard from '@/components/product/ProductCard';
import { notFound } from 'next/navigation';

async function getConcern(slug: string) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    try {
        const res = await fetch(`${backendUrl}/api/categories?type=concern`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`getConcern API Error: ${res.status} ${res.statusText}`);
            return null;
        }

        const concerns = await res.json();
        // Ensure concerns is an array
        if (!Array.isArray(concerns)) {
            console.error('getConcern: API response is not an array', concerns);
            return null;
        }
        return concerns.find((c: any) => c.slug === slug) || null;
    } catch (error) {
        console.error('Failed to fetch concern:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Stack:', error.stack);
        }
        return null;
    }
}

export default async function ConcernPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const concern = await getConcern(slug);

    if (!concern) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section with Cover Image */}
            <div className="relative rounded-2xl overflow-hidden mb-12 bg-gray-900">
                {concern.image ? (
                    <>
                        <div className="absolute inset-0">
                            <img
                                src={concern.image.startsWith('http') ? concern.image : `${process.env.NEXT_PUBLIC_BACKEND_URL}${concern.image}`}
                                alt={concern.name}
                                className="w-full h-full object-cover opacity-60"
                            />
                        </div>
                        <div className="relative z-10 p-12 md:p-20 text-center text-white">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4">{concern.name}</h1>
                            {concern.sub_heading && (
                                <p className="text-xl md:text-2xl font-medium text-green-100 mb-4">{concern.sub_heading}</p>
                            )}
                            {concern.description && (
                                <p className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
                                    {concern.description}
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 p-12 md:p-20 text-center">
                        <h1 className="text-3xl md:text-5xl font-bold text-charcoal dark:text-gray-100 mb-4">{concern.name}</h1>
                        {concern.sub_heading && (
                            <p className="text-lg text-cureza-green mb-4">{concern.sub_heading}</p>
                        )}
                        {concern.description && (
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                {concern.description}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters (Mock) */}
                <aside className="w-full md:w-64 space-y-8 hidden md:block">
                    <div>
                        <h3 className="font-bold mb-4">Brands</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <li><label className="flex items-center gap-2"><input type="checkbox" /> Dabur</label></li>
                            <li><label className="flex items-center gap-2"><input type="checkbox" /> Kapiva</label></li>
                            <li><label className="flex items-center gap-2"><input type="checkbox" /> Himalaya</label></li>
                        </ul>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <ProductGrid concernSlug={slug} />
                </div>
            </div>

            {/* SEO Bottom Description */}
            {concern.bottom_description && (
                <div className="mt-16 prose max-w-none text-gray-600 dark:text-gray-400">
                    <div dangerouslySetInnerHTML={{ __html: concern.bottom_description }} />
                </div>
            )}
        </div>
    );
}

async function ProductGrid({ concernSlug }: { concernSlug: string }) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    try {
        const res = await fetch(`${backendUrl}/api/products?concern=${concernSlug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch products');
        const products = await res.json();

        if (products.length === 0) {
            return (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No products found for this concern yet.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product: any) => (
                    <ProductCard key={product.id} product={{
                        id: product.id,
                        title: product.title,
                        brand: product.brand,
                        price: Number(product.price),
                        originalPrice: product.original_price ? Number(product.original_price) : undefined,
                        rating: Number(product.rating),
                        reviews: product.reviews,
                        image: product.image,
                        images: product.images,
                        tags: product.tags,
                        slug: product.slug,
                        category: product.category
                    }} />
                ))}
            </div>
        );
    } catch (error) {
        console.error(error);
        return <div className="text-red-500">Failed to load products.</div>;
    }
}
