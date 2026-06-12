'use client';

import { useState, useEffect } from 'react';
import { Star, Heart, Share2, ShieldCheck, Truck, RotateCcw, AlertCircle, CheckCircle2, IndianRupee, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import InlineUpsell from '@/components/product/InlineUpsell';
import axios from '@/lib/api';

interface ProductInfoProps {
    product: any;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const { addToCart, isLoading } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { showToast } = useToast();
    // We should show all variants so user can select them and see "Out of Stock" status
    // But we filter out "DISABLED" ones if they are truly meant to be hidden.
    // However, user usually wants to see the option even if out of stock, so they know it exists.
    // Based on previous request, we filtered 'out_of_stock' but now we need to show status.
    // Let's keep them selectable to show the "Out of Stock" label.
    const activeVariants = product.variants || [];

    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(() => {
        if (activeVariants.length > 0) {
            return activeVariants.find((v: any) => v.is_default) || activeVariants[0];
        }
        return null;
    });

    const [patientDetails, setPatientDetails] = useState({
        patient_name: '',
        patient_age: 0,
        patient_gender: '',
        health_concern: '',
        prescription_path: '',
        doctor_id: undefined as number | undefined
    });
    const [doctors, setDoctors] = useState<any[]>([]);

    useEffect(() => {
        if (product.is_prescription_required) {
            axios.get('/public/doctors')
                .then((res: any) => {
                    setDoctors(res.data);
                    if (res.data.length > 0) {
                        setPatientDetails(prev => ({ ...prev, doctor_id: res.data[0].id }));
                    }
                })
                .catch((err: any) => console.error('Failed to load doctors', err));
        }
    }, [product.is_prescription_required]);

    const discountPercentage = product.original_price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0;

    const validatePrescription = () => {
        if (product.is_prescription_required) {
            if (!patientDetails.patient_name || !patientDetails.patient_age || !patientDetails.patient_gender || !patientDetails.health_concern || !patientDetails.doctor_id) {
                showToast("Please fill in all patient details and select a doctor", "error");
                return false;
            }
        }
        return true;
    };

    const handleAddToCart = async () => {
        if (!validatePrescription()) return;

        try {
            const productToBag = {
                ...product,
                price: selectedVariant ? parseFloat(selectedVariant.price) : product.price,
                original_price: selectedVariant ? parseFloat(selectedVariant.original_price) : product.original_price,
                sku: selectedVariant ? selectedVariant.sku : product.sku,
                variant_id: selectedVariant ? selectedVariant.id : null
            };
            await addToCart(productToBag, quantity, product.is_prescription_required ? patientDetails : undefined);
            showToast("Added to cart successfully", "success");
        } catch (error) {
            showToast("Failed to add to cart", "error");
        }
    };

    const handleBuyNow = async () => {
        if (!validatePrescription()) return;

        try {
            const productToBag = {
                ...product,
                price: selectedVariant ? parseFloat(selectedVariant.price) : product.price,
                original_price: selectedVariant ? parseFloat(selectedVariant.original_price) : product.original_price,
                sku: selectedVariant ? selectedVariant.sku : product.sku,
                variant_id: selectedVariant ? selectedVariant.id : null
            };
            await addToCart(productToBag, quantity, product.is_prescription_required ? patientDetails : undefined);
            window.location.href = '/checkout';
        } catch (error) {
            showToast("Failed to process buy now", "error");
        }
    };

    // Helper to get unique attribute types and their values
    const attributeTypes = selectedVariant ? Object.keys(selectedVariant.attributes).filter(k => !k.endsWith('_name')) : [];

    const displayPrice = selectedVariant ? parseFloat(selectedVariant.price) : product.price;
    const displayOriginalPrice = selectedVariant ? parseFloat(selectedVariant.original_price) : product.original_price;
    const displaySku = selectedVariant ? selectedVariant.sku : product.sku;

    const currentDiscount = displayOriginalPrice > displayPrice
        ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
        : 0;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    {product.brand && (
                        <span className="text-sm font-bold text-cureza-green bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full uppercase tracking-wider">
                            {typeof product.brand === 'object' ? product.brand.name : product.brand}
                        </span>
                    )}
                    {(() => {
                        const status = selectedVariant ? selectedVariant.stock_status : product.stock_status;
                        if (status === 'low_stock') {
                            return (
                                <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                    <AlertCircle size={14} /> HURRY UP! LOW STOCK
                                </span>
                            );
                        }
                        if (status === 'out_of_stock') {
                            return (
                                <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full flex items-center gap-1">
                                    <X size={14} /> OUT OF STOCK
                                </span>
                            );
                        }
                        return (
                            <span className="text-xs font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={14} /> IN STOCK
                            </span>
                        );
                    })()}
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                    {product.title}
                </h1>

                {/* Basic Information Meta: Category & Concern */}
                <div className="flex flex-wrap gap-3 text-xs font-bold uppercase tracking-widest">
                    {product.category && (
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <span className="text-gray-400 mr-2 border-r border-gray-300 dark:border-gray-600 pr-2">Category</span>
                            <span className="text-cureza-green">{typeof product.category === 'object' ? product.category.name : product.category}</span>
                        </div>
                    )}
                    {product.concern && (
                        <div className="flex items-center bg-green-50 dark:bg-green-900/10 rounded-lg px-3 py-1.5 border border-green-100 dark:border-green-800/30 shadow-sm">
                            <span className="text-gray-400 mr-2 border-r border-green-200 dark:border-green-800/30 pr-2">Concern</span>
                            <span className="text-gray-900 dark:text-gray-100">{typeof product.concern === 'object' ? product.concern.name : product.concern}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center flex-wrap gap-4 text-sm border-b border-gray-100 dark:border-gray-700 pb-6">
                    <div className="flex items-center gap-1">
                        <Star size={18} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-gray-900 dark:text-white text-lg">{product.rating || '0.0'}</span>
                        <span className="text-gray-500 dark:text-gray-400 underline decoration-gray-300 ml-1">
                            {product.reviews_count || 0} Reviews
                        </span>
                    </div>

                    {(product.bought_last_month > 0 || product.boughtLastMonth > 0) && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/20 rounded-lg">
                            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-orange-700 dark:text-orange-400 font-bold text-xs uppercase tracking-tight">
                                {product.bought_last_month || product.boughtLastMonth}+ Bought Last Month
                            </span>
                        </div>
                    )}

                    {displaySku && (
                        <span className="text-gray-400 font-medium">SKU: {displaySku}</span>
                    )}
                </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-5xl font-black text-gray-900 dark:text-white">₹{displayPrice}</span>
                    {displayOriginalPrice > displayPrice && (
                        <>
                            <span className="text-2xl text-gray-400 line-through font-medium">₹{displayOriginalPrice}</span>
                            <span className="text-lg font-bold text-white bg-red-500 px-3 py-1 rounded-lg">
                                {currentDiscount}% OFF
                            </span>
                        </>
                    )}
                </div>
                <p className="text-sm text-gray-500 font-medium">Inclusive of all taxes</p>
            </div>

            {/* Variant Picker */}
            {activeVariants.length > 0 && (
                <div className="space-y-6 pt-2">
                    {attributeTypes.map(attrKey => {
                        const availableOptions = Array.from(new Set(activeVariants.map((v: any) => v.attributes[attrKey])));

                        return (
                            <div key={attrKey} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-cureza-green rounded-full" />
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                            Select {attrKey}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Selected: {selectedVariant.attributes[`${attrKey}_name`] || selectedVariant.attributes[attrKey]}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {availableOptions.map((opt: any) => {
                                        const isSelected = selectedVariant.attributes[attrKey] === opt;
                                        const matchingVariant = activeVariants.find((v: any) => v.attributes[attrKey] === opt);
                                        const optionName = matchingVariant?.attributes[`${attrKey}_name`] || opt;

                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    // Find a variant that matches this new option PLUS as many other currently selected attributes as possible
                                                    const currentAttributes = { ...selectedVariant.attributes };
                                                    currentAttributes[attrKey] = opt;

                                                    // Try to find an exact match first
                                                    let nextVariant = activeVariants.find((v: any) => {
                                                        const vAttrs = v.attributes;
                                                        return Object.keys(currentAttributes)
                                                            .filter(k => !k.endsWith('_name'))
                                                            .every(k => vAttrs[k] === currentAttributes[k]);
                                                    });

                                                    // If no exact match (shouldn't happen with valid combinations), just find any with this option
                                                    if (!nextVariant) {
                                                        nextVariant = activeVariants.find((v: any) => v.attributes[attrKey] === opt);
                                                    }

                                                    if (nextVariant) setSelectedVariant(nextVariant);
                                                }}
                                                className={`px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-300 ${isSelected
                                                    ? 'border-cureza-green bg-green-50 text-cureza-green shadow-lg shadow-green-100 dark:shadow-none'
                                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                {optionName}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Descriptions & Highlights */}
            <div className="space-y-6">
                {(product.short_description || product.shortDescription) && (
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cureza-green rounded-full opacity-50" />
                        <div
                            className="pl-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-normal font-sans
                                [&_ul]:!list-disc [&_ul]:!pl-5 [&_ol]:!list-decimal [&_ol]:!pl-5 [&_li]:mb-1"
                            dangerouslySetInnerHTML={{ __html: product.short_description || product.shortDescription }}
                        />
                    </div>
                )}

                {product.highlights && product.highlights.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider opacity-60">Key Highlights</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.highlights.map((highlight: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                        <CheckCircle2 size={12} className="text-cureza-green" />
                                    </div>
                                    {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {product.tags && product.tags.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider opacity-60">Product Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag: any, idx: number) => {
                                const tagName = typeof tag === 'object' ? tag.name : tag;
                                return (
                                    <span key={idx} className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black uppercase text-gray-500 hover:border-cureza-green hover:text-cureza-green transition-all cursor-pointer">
                                        #{tagName}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Prescription Form */}
            {product.is_prescription_required && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6 space-y-4 animate-pulse-slow">
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                        <AlertCircle size={24} />
                        <span>Prescription Required</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        This medicine requires a valid prescription. Please provide details below.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Patient Name</label>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:border-cureza-green focus:ring-cureza-green"
                                placeholder="Full Name"
                                value={patientDetails.patient_name}
                                onChange={(e) => setPatientDetails({ ...patientDetails, patient_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Age</label>
                            <input
                                type="number"
                                className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:border-cureza-green focus:ring-cureza-green"
                                placeholder="Age"
                                value={patientDetails.patient_age || ''}
                                onChange={(e) => setPatientDetails({ ...patientDetails, patient_age: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Gender</label>
                            <select
                                className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:border-cureza-green focus:ring-cureza-green"
                                value={patientDetails.patient_gender}
                                onChange={(e) => setPatientDetails({ ...patientDetails, patient_gender: e.target.value })}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Select Doctor</label>
                            <select
                                className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:border-cureza-green focus:ring-cureza-green"
                                value={patientDetails.doctor_id || ''}
                                onChange={(e) => setPatientDetails({ ...patientDetails, doctor_id: parseInt(e.target.value) || undefined })}
                            >
                                <option value="">Choose a Doctor</option>
                                {doctors.map((doc: any) => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.name} ({doc.specialization})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Health Concern</label>
                            <textarea
                                className="w-full rounded-lg border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:border-cureza-green focus:ring-cureza-green"
                                placeholder="Describe your health concern/symptoms here..."
                                rows={3}
                                value={patientDetails.health_concern}
                                onChange={(e) => setPatientDetails({ ...patientDetails, health_concern: e.target.value })}
                            />
                        </div>
                    </div>
                    {/* Add more fields as needed or keep simple for UI demo */}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl h-14 border border-gray-200 dark:border-gray-600">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-5 hover:text-cureza-green transition-colors text-xl font-medium"
                        >
                            -
                        </button>
                        <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-5 hover:text-cureza-green transition-colors text-xl font-medium"
                        >
                            +
                        </button>
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`h-14 w-14 flex items-center justify-center rounded-xl border-2 transition-all ${isInWishlist(product.id)
                            ? 'border-red-200 bg-red-50 text-red-500'
                            : 'border-gray-200 hover:border-gray-900 text-gray-600 dark:text-gray-400 dark:border-gray-600 dark:hover:border-white'
                            }`}
                    >
                        <Heart size={24} className={isInWishlist(product.id) ? 'fill-red-500' : ''} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleAddToCart}
                        disabled={isLoading || (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock')}
                        className="h-14 rounded-xl font-bold text-lg border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                    >
                        {isLoading ? 'Adding...' : (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock') ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                        onClick={handleBuyNow}
                        disabled={isLoading || (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock')}
                        className="h-14 rounded-xl font-bold text-lg bg-cureza-green text-white hover:bg-green-700 shadow-xl shadow-green-200 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                    >
                        {isLoading ? 'Processing...' : (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock') ? 'Unavailable' : 'Buy Now'}
                    </button>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="flex flex-col items-center text-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                    <Truck size={24} className="text-blue-600" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
                    <ShieldCheck size={24} className="text-green-600" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
                    <RotateCcw size={24} className="text-purple-600" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Easy Returns</span>
                </div>
            </div>

            {/* Inline Upsell Section */}
            <InlineUpsell productId={product.id} categoryId={product.category_id} />
        </div>
    );
}
