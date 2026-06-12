'use client';

import { useState, useEffect, use } from 'react';
import ProductForm from '@/components/products/ProductForm';
import api from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function SellerEditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string | null>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then(p => {
            setId(p.id);
        }).catch(err => {
            console.error('Failed to unwrap params:', err);
            setError('Invalid product ID');
            setLoading(false);
        });
    }, [params]);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            // Fetch product using seller endpoint
            console.log('[SellerEdit] Fetching product ID:', productId);
            const res = await api.get(`/seller/products/${productId}`);
            console.log('[SellerEdit] API Response:', res.data);
            setProduct(res.data);
        } catch (err: any) {
            console.error('[SellerEdit] Failed to fetch product', err);
            setError(err.response?.data?.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="animate-spin text-cureza-green" size={48} />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <span className="text-red-700">{error || 'Product not found'}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Edit Notice Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-medium">Changes Require Approval</p>
                        <p className="text-amber-600 dark:text-amber-300 mt-1">
                            Your product changes will be submitted for review. The current version will remain active until your changes are approved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Product Form - Seller Mode with initial data for editing */}
            <ProductForm key={product.id} isSuperAdmin={false} initialData={product} />
        </div>
    );
}
