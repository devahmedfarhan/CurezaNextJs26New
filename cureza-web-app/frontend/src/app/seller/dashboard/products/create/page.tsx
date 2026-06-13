'use client';

import ProductForm from '@/components/products/ProductForm';

export default function SellerCreateProductPage() {
    return (
        <div className="w-full py-6">
            <ProductForm isSuperAdmin={false} />
        </div>
    );
}
