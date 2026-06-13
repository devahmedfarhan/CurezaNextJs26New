import ProductCard from '@/components/product/ProductCard';

async function getBestsellers() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/products`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const products = await res.json();
    
    // Sort by rating descending to show bestsellers
    const sorted = products.sort((a: any, b: any) => Number(b.rating || 0) - Number(a.rating || 0));
    
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
      category: p.category,
      is_prescription_required: p.is_prescription_required
    }));
  } catch (error) {
    console.error('Failed to fetch bestsellers:', error);
    return [];
  }
}

export default async function BestsellersPage() {
  const products = await getBestsellers();

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-6 md:px-12 lg:px-20">
      <div className="container mx-auto">
        
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 border-b border-[#052326]/10 pb-8">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/50 uppercase block mb-3">
            Customer Favorites
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#052326] mt-2">
            Bestsellers
          </h1>
          <p className="text-sm md:text-base text-[#052326]/75 font-light mt-4 leading-relaxed">
            Shop the most loved formulations rated highest by our active community. Verified for safety, dosage consistency, and therapeutic results.
          </p>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[14px] border border-dashed border-[#052326]/15 p-8">
            <span className="text-3xl mb-4 block">🍃</span>
            <p className="text-sm font-semibold text-[#052326]">No bestsellers found.</p>
            <p className="text-xs text-[#052326]/60 mt-1">Please check back soon for active community reviews.</p>
          </div>
        )}

      </div>
    </div>
  );
}
