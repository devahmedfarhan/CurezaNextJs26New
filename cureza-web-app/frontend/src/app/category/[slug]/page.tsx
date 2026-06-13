import ProductCard from '@/components/product/ProductCard';
import { notFound } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

async function getCategory(slug: string) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/categories?type=category`, {
      cache: 'no-store'
    });

    if (!res.ok) return null;

    const categories = await res.json();
    return categories.find((c: any) => c.slug === slug) || null;
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return null;
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-12 px-6 md:px-12 lg:px-20">
      <div className="container mx-auto">
        
        {/* Breadcrumbs */}
        <div className="text-xs text-[#052326]/50 uppercase tracking-widest mb-4 flex items-center gap-1.5 font-bold">
          <a href="/" className="hover:text-[#052326] transition-colors">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-[#052326] transition-colors">Shop</a>
          <span>/</span>
          <span className="text-[#052326]">{category.name}</span>
        </div>

        {/* Editorial Category Header (10-14px radius) */}
        <div className="relative rounded-[14px] overflow-hidden mb-12 bg-[#052326] text-[#F8F3EF] border border-[#052326]/10 shadow-premium-light">
          {category.image ? (
            <>
              <div className="absolute inset-0">
                <img
                  src={category.image.startsWith('http') ? category.image : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}${category.image}`}
                  alt={category.name}
                  className="w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#052326] via-[#052326]/80 to-[#052326]/60" />
              </div>
              
              <div className="relative z-10 p-10 md:p-16 text-left max-w-3xl">
                <span className="text-[10px] font-bold tracking-[0.25em] text-[#F0C417] uppercase block mb-3">
                  Category Directory
                </span>
                <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight mb-4">{category.name}</h1>
                {category.sub_heading && (
                  <p className="text-sm md:text-base font-semibold text-[#F8F3EF]/90 mb-4">{category.sub_heading}</p>
                )}
                {category.description && (
                  <p className="text-xs md:text-sm text-[#F8F3EF]/75 font-light leading-relaxed max-w-xl">
                    {category.description}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="p-10 md:p-16 text-left max-w-3xl relative">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#F0C417] uppercase block mb-3">
                Category Directory
              </span>
              <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight mb-4 text-[#F8F3EF]">{category.name}</h1>
              {category.sub_heading && (
                <p className="text-sm md:text-base font-semibold text-[#F8F3EF]/95 mb-4">{category.sub_heading}</p>
              )}
              {category.description && (
                <p className="text-xs md:text-sm text-[#F8F3EF]/80 font-light leading-relaxed max-w-xl">
                  {category.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white border border-[#052326]/10 rounded-[14px] p-6 shadow-premium-light">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326] border-b border-[#052326]/10 pb-3 mb-3">
              Consultation Type
            </h3>
            <div className="space-y-2 mt-2 text-xs font-medium text-[#052326]/80">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="rx-filter-ssr" defaultChecked className="accent-[#052326]" />
                <span>Show All Products</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="rx-filter-ssr" className="accent-[#052326]" />
                <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-[#D32F2F]" /> Requires Prescription</span>
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <ProductGrid categorySlug={slug} />
          </div>
        </div>

        {/* SEO Bottom Description (Standard clinical markdown details) */}
        {category.bottom_description && (
          <div className="mt-16 bg-white border border-[#052326]/10 rounded-[14px] p-6 md:p-8 shadow-premium-light prose max-w-none text-[#052326]/80 text-xs md:text-sm font-light leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: category.bottom_description }} />
          </div>
        )}
      </div>
    </div>
  );
}

async function ProductGrid({ categorySlug }: { categorySlug: string }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/products?category=${categorySlug}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    const products = await res.json();

    if (products.length === 0) {
      return (
        <div className="text-center py-20 bg-white rounded-[14px] border border-dashed border-[#052326]/15 p-8">
          <span className="text-3xl mb-4 block">🍃</span>
          <p className="text-sm font-semibold text-[#052326]">No products found in this category yet.</p>
          <p className="text-xs text-[#052326]/60 mt-1">Check back soon for curated botanical arrivals.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product: any) => (
          <div key={product.id} className="h-full">
            <ProductCard product={{
              id: product.id,
              title: product.title,
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
              is_prescription_required: product.is_prescription_required
            }} />
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error(error);
    return <div className="text-[#D32F2F] text-sm font-semibold">Failed to load products. Please refresh page.</div>;
  }
}
