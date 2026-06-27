import { Suspense } from 'react';
import CategoryContent from '@/components/shop/CategoryContent';

async function getInitialCategoryProducts(categorySlug: string) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/products?category=${categorySlug}`, {
      next: { revalidate: 60 } // Cache category products for 60 seconds
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
    }
  } catch (err) {
    console.error(`Failed to pre-fetch category products for ${categorySlug} on server:`, err);
  }
  return [];
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  
  const initialProducts = await getInitialCategoryProducts(categorySlug);

  return (
    <Suspense fallback={
      <div className="container mx-auto px-6 py-24 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#052326] border-t-transparent"></div>
      </div>
    }>
      <CategoryContent initialProducts={initialProducts} categorySlug={categorySlug} />
    </Suspense>
  );
}
