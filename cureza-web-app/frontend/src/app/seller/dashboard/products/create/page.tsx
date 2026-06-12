'use client';

import ProductForm from '@/components/products/ProductForm';

export default function SellerCreateProductPage() {
    return (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
            <ProductForm isSuperAdmin={false} />
        </div>
    );
}
