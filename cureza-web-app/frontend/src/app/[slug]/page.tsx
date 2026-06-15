import { notFound } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';

export const dynamic = 'force-dynamic';

async function getCollection(slug: string) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/collections/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch collection for slug: ${slug}`, error);
    return null;
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CollectionSlugPage({ params }: PageProps) {
  const { slug } = await params;
  
  const collection = await getCollection(slug);

  if (!collection) {
    notFound();
  }

  const products = collection.products || [];

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-6 md:px-12 lg:px-20">
      <div className="container mx-auto">
        {/* Collection Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 border-b border-[#052326]/10 pb-8 space-y-4">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/50 uppercase block">
            Featured Collection
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-heading tracking-tight text-[#052326]">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-sm md:text-base text-[#052326]/75 font-light leading-relaxed max-w-2xl mx-auto">
              {collection.description}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: any) => {
              // Standardize product fields for ProductCard
              const formattedProduct = {
                id: product.id,
                title: product.title || product.name,
                brand: product.brand,
                price: Number(product.price),
                originalPrice: product.original_price ? Number(product.original_price) : undefined,
                rating: Number(product.rating || 4.5),
                reviews: product.reviews_count || 0,
                image: product.image,
                images: product.images,
                tags: product.tags,
                slug: product.slug,
                category: product.category,
                is_prescription_required: product.is_prescription_required,
              };

              return (
                <div key={formattedProduct.id} className="h-full">
                  <ProductCard product={formattedProduct} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[14px] border border-dashed border-[#052326]/15 p-8 max-w-md mx-auto">
            <span className="text-3xl mb-4 block">📦</span>
            <p className="text-sm font-semibold text-[#052326]">No products in this collection yet.</p>
            <p className="text-xs text-[#052326]/60 mt-1">Check back soon for curated items.</p>
          </div>
        )}
      </div>
    </div>
  );
}
