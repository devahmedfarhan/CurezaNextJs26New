import { Suspense } from 'react';
import ShopContent from '@/components/shop/ShopContent';

async function getInitialProducts() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/products`, {
      next: { revalidate: 60 } // Cache products catalog for 60 seconds
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
    }
  } catch (err) {
    console.error('Failed to pre-fetch shop products on server:', err);
  }
  return [];
}

async function getInitialCategories() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/categories`, {
      next: { revalidate: 300 } // Cache categories list for 5 minutes
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to pre-fetch shop categories on server:', err);
  }
  return [];
}

export default async function ShopPage() {
  // Parallel pre-fetching of initial products and categories
  const [initialProducts, initialCategories] = await Promise.all([
    getInitialProducts(),
    getInitialCategories()
  ]);

  return (
    <Suspense fallback={
      <div className="container mx-auto px-6 py-24 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#052326] border-t-transparent"></div>
      </div>
    }>
      <ShopContent initialProducts={initialProducts} initialCategories={initialCategories} />
    </Suspense>
  );
}
