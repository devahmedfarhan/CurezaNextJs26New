'use client';

import ProductForm from '@/components/products/ProductForm';
import { AlertCircle } from 'lucide-react';

export default function SellerAddProductPage() {
    return (
        <div className="w-full py-6 space-y-6">
            {/* Approval Notice Banner */}
            <div className="rounded-2xl border-[0.5px] border-black/50 bg-blue-50 p-4 shadow-none dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium">Products Require Approval</p>
                        <p className="text-blue-600 dark:text-blue-300 mt-1">
                            Your product will be submitted for review. Once approved by our team, it will be published on the marketplace.
                        </p>
                    </div>
                </div>
            </div>

            {/* Product Form - Seller Mode (brand auto-assigned) */}
            <ProductForm isSuperAdmin={false} />
        </div>
    );
}
