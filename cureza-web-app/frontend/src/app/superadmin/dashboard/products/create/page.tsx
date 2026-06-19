'use client';

import ProductForm from '@/components/products/ProductForm';

export default function AdminCreateProductPage() {
    return (
        <div className="w-full space-y-6">
            <ProductForm isSuperAdmin={true} />
        </div>
    );
}
