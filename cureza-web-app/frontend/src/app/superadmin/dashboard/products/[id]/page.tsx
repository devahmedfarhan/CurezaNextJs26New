'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Edit, Trash2, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/lib/imageHelper';
import Link from 'next/link';

export default function AdminProductViewPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/admin/products/${id}`);
            setProduct(res.data);
        } catch (error) {
            console.error('Failed to fetch product', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!product) return <div className="p-8 text-center">Product not found</div>;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
                        <p className="text-sm text-gray-500">ID: PRD-{product.id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/shop/${product.category?.slug || 'general'}/${product.slug}`}
                        target="_blank"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"
                    >
                        <ExternalLink size={18} /> View Live
                    </Link>
                    <Link
                        href={`/superadmin/dashboard/products/${product.id}/edit`}
                        className="px-4 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                    >
                        <Edit size={18} /> Edit Product
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Images & Key Info */}
                <div className="space-y-8">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                            {product.image ? (
                                <img src={getImageUrl(product.image)} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {product.images && product.images.map((img: string, idx: number) => (
                                <div key={idx} className="aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Status & Stock</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${product.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>{product.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Stock Status</span>
                                <span className="font-medium text-gray-900 capitalize">{product.stock_status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Quantity</span>
                                <span className="font-medium text-gray-900">{product.stock} units</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                <span className="bg-gray-100 px-2 py-1 rounded">Category: {product.category?.name}</span>
                                {product.concern && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Concern: {product.concern?.name}</span>
                                )}
                                <span className="bg-gray-100 px-2 py-1 rounded">Brand: {product.brand?.name}</span>
                            </div>
                        </div>

                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                            {product.original_price && (
                                <span className="text-lg text-gray-400 line-through">₹{product.original_price}</span>
                            )}
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Short Description</h3>
                            <p className="text-gray-600 leading-relaxed">{product.short_description || 'No short description.'}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Long Description</h3>
                            <div className="prose max-w-none text-gray-600">
                                {product.long_description || 'No detailed description.'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Specifications</h3>
                        {product.specifications && product.specifications.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.specifications.map((spec: any, idx: number) => (
                                    <div key={idx} className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">{spec.key}</span>
                                        <span className="font-medium text-gray-900">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No specifications added.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
