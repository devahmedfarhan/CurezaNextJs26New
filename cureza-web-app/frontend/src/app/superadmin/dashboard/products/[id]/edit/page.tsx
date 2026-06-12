'use client';

import { useState, useEffect, use } from 'react';
import ProductForm from '@/components/products/ProductForm';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string | null>(null);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(p => {
            setId(p.id);
        }).catch(err => {
            console.error('Failed to unwrap params:', err);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            // Fetch product details (using public slug endpoint or admin specific endpoint if needed)
            const res = await api.get(`/admin/products/${productId}`);
            setProduct(res.data);
        } catch (error) {
            console.error('Failed to fetch product', error);
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

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
            <ProductForm key={product.id} isSuperAdmin={true} initialData={product} />
        </div>
    );
}
