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
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-550">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-[0.5px] border-black/50 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 rounded-[10px]">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer">
                        <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white">Product Details</h1>
                        <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">Id: Prd-{product.id}</p>
                    </div>
                </div>
                <div className="flex gap-3 text-xs font-bold">
                    <Link
                        href={`/shop/${product.category?.slug || 'general'}/${product.slug}`}
                        target="_blank"
                        className="px-4 py-2 border-[0.5px] border-black/50 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-neutral-50 font-medium flex items-center gap-2"
                    >
                        <ExternalLink size={14} /> View Live
                    </Link>
                    <Link
                        href={`/superadmin/dashboard/products/${product.id}/edit`}
                        className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-100 font-medium flex items-center gap-2"
                    >
                        <Edit size={14} /> Edit Product
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Images & Key Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-[10px] border-[0.5px] border-black/50 dark:border-gray-800">
                        <div className="aspect-square rounded-lg overflow-hidden bg-neutral-50 dark:bg-gray-850 mb-4 border-[0.5px] border-black/50">
                            {product.image ? (
                                <img src={getImageUrl(product.image)} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {product.images && product.images.map((img: string, idx: number) => (
                                <div key={idx} className="aspect-square rounded-md overflow-hidden bg-neutral-50 dark:bg-gray-850 border-[0.5px] border-black/50">
                                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-5 rounded-[10px] border-[0.5px] border-black/50 dark:border-gray-800 text-xs font-semibold">
                        <h3 className="font-extrabold text-sm text-gray-950 dark:text-white border-b-[0.5px] border-black/50 dark:border-gray-800 pb-2.5 mb-4">Status & Stock</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-0.5 rounded border-[0.5px] text-[10px] font-bold uppercase ${
                                    product.status === 'published' || product.status === 'approved' 
                                        ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-black/50' 
                                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-black/50'
                                }`}>{product.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Stock Status</span>
                                <span className="font-bold text-gray-900 dark:text-white capitalize">{product.stock_status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Quantity</span>
                                <span className="font-bold text-gray-900 dark:text-white">{product.stock} units</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-gray-800 space-y-6">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">{product.title}</h2>
                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold flex-wrap">
                                <span className="bg-neutral-50 dark:bg-gray-800 border-[0.5px] border-black/50 dark:border-gray-700 px-2 py-0.5 rounded">Category: {product.category?.name}</span>
                                {product.concern && (
                                    <span className="bg-neutral-50 dark:bg-gray-800 border-[0.5px] border-black/50 dark:border-gray-700 px-2 py-0.5 rounded">Concern: {product.concern?.name}</span>
                                )}
                                <span className="bg-neutral-50 dark:bg-gray-800 border-[0.5px] border-black/50 dark:border-gray-700 px-2 py-0.5 rounded">Brand: {product.brand?.name}</span>
                            </div>
                        </div>

                        <div className="flex items-end gap-3">
                            <span className="text-2xl font-black text-gray-950 dark:text-white">₹{product.price}</span>
                            {product.original_price && (
                                <span className="text-sm text-gray-400 line-through">₹{product.original_price}</span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Short Description</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{product.short_description || 'No short description.'}</p>
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Long Description</h3>
                            <div className="prose max-w-none text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                {product.long_description || 'No detailed description.'}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-gray-800">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white border-b-[0.5px] border-black/50 dark:border-gray-800 pb-2.5 mb-4">Specifications</h3>
                        {product.specifications && product.specifications.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                {product.specifications.map((spec: any, idx: number) => (
                                    <div key={idx} className="flex justify-between border-b-[0.5px] border-black/50 pb-2">
                                        <span className="text-gray-500">{spec.key}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-450 italic font-medium">No specifications added.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
