'use client';

import { useState, useEffect } from 'react';
import { Star, Heart, ShieldAlert, ShieldCheck, Truck, RotateCcw, AlertTriangle, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import InlineUpsell from '@/components/product/InlineUpsell';
import axios from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ShopfloCheckout from '@/components/checkout/ShopfloCheckout';

interface ProductInfoProps {
  product: any;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart, isLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { user } = useAuth();

  const activeVariants = product.variants || [];

  const [quantity, setQuantity] = useState(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
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
      await addToCart(productToBag, quantity, product.is_prescription_required ? patientDetails : undefined, false);
      setIsCheckoutModalOpen(true);
    } catch (error) {
      showToast("Failed to process buy now", "error");
    }
  };

  const handleWishlist = () => {
    if (!user) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    toggleWishlist(product.id);
  };

  const attributeTypes = selectedVariant ? Object.keys(selectedVariant.attributes).filter(k => !k.endsWith('_name')) : [];

  const displayPrice = selectedVariant ? parseFloat(selectedVariant.price) : product.price;
  const displayOriginalPrice = selectedVariant ? parseFloat(selectedVariant.original_price) : product.original_price;
  const displaySku = selectedVariant ? selectedVariant.sku : product.sku;

  const currentDiscount = displayOriginalPrice > displayPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  return (
    <div className="space-y-6 text-[#052326] relative">
      
      {/* Editorial Category Pill & Stock Status */}
      <div className="flex items-center gap-3">
        {product.brand && (
          <span className="text-[10px] font-bold tracking-wider text-[#052326] bg-[#052326]/5 border border-[#052326]/10 px-3 py-1 rounded-[6px] uppercase">
            {typeof product.brand === 'object' ? product.brand.name : product.brand}
          </span>
        )}
        {(() => {
          const status = selectedVariant ? selectedVariant.stock_status : product.stock_status;
          if (status === 'low_stock') {
            return (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-[6px] flex items-center gap-1.5 animate-pulse border border-amber-200">
                HURRY! LOW STOCK
              </span>
            );
          }
          if (status === 'out_of_stock') {
            return (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-[6px] flex items-center gap-1.5 border border-red-200">
                OUT OF STOCK
              </span>
            );
          }
          return (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-[6px] flex items-center gap-1.5 border border-green-200">
              IN STOCK
            </span>
          );
        })()}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        {product.title}
      </h1>

      {/* Metadata Badges */}
      <div className="flex flex-wrap items-center gap-3">
        {product.category && (
          <div className="flex items-center bg-[#F8F3EF] border border-[#052326]/10 px-3 py-1 rounded-[8px] text-[10px] uppercase font-bold tracking-wider">
            <span className="text-[#052326]/50 mr-2 border-r border-[#052326]/10 pr-2">Category</span>
            <span>{typeof product.category === 'object' ? product.category.name : product.category}</span>
          </div>
        )}
        {product.concern && (
          <div className="flex items-center bg-[#052326]/5 border border-[#052326]/10 px-3 py-1 rounded-[8px] text-[10px] uppercase font-bold tracking-wider">
            <span className="text-[#052326]/50 mr-2 border-r border-[#052326]/10 pr-2">Concern</span>
            <span>{typeof product.concern === 'object' ? product.concern.name : product.concern}</span>
          </div>
        )}
      </div>

      {/* Ratings summary */}
      <div className="flex items-center gap-4 text-xs font-semibold pb-4 border-b border-[#052326]/10">
        <div className="flex items-center gap-1">
          <Star size={14} className="text-[#F0C417] fill-[#F0C417]" />
          <span className="font-bold text-sm">{product.rating || '0.0'}</span>
          <span className="text-[#052326]/60 underline ml-1 cursor-pointer">
            ({product.reviews_count || 0} Reviews)
          </span>
        </div>
        
        {(product.bought_last_month > 0 || product.boughtLastMonth > 0) && (
          <span className="text-[10px] font-bold tracking-wider uppercase bg-[#F0C417]/10 text-[#052326] px-2.5 py-1 rounded-[6px] border border-[#F0C417]/20">
            {product.bought_last_month || product.boughtLastMonth}+ ordered last month
          </span>
        )}

        {displaySku && (
          <span className="text-[#052326]/50 ml-auto font-light">SKU: {displaySku}</span>
        )}
      </div>

      {/* Price block (10-14px border radius) */}
      <div className="bg-white border border-[#052326]/10 p-5 rounded-[12px] shadow-sm">
        <div className="flex items-baseline gap-4 mb-1">
          <span className="text-4xl font-bold">₹{displayPrice}</span>
          {displayOriginalPrice > displayPrice && (
            <>
              <span className="text-xl text-[#052326]/40 line-through">₹{displayOriginalPrice}</span>
              <span className="text-xs font-bold text-[#052326] bg-[#F0C417] px-2.5 py-1 rounded-[6px] shadow-sm">
                {currentDiscount}% OFF
              </span>
            </>
          )}
        </div>
        <p className="text-[10px] font-semibold text-[#052326]/40 uppercase tracking-wider">Inclusive of all local taxes</p>
      </div>

      {/* Variant Picker */}
      {activeVariants.length > 0 && (
        <div className="space-y-4 pt-2">
          {attributeTypes.map(attrKey => {
            const availableOptions = Array.from(new Set(activeVariants.map((v: any) => v.attributes[attrKey])));

            return (
              <div key={attrKey} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#052326]/60">Select {attrKey}</span>
                  <span className="font-bold text-[#052326]/40 uppercase tracking-wider">Selected: {selectedVariant.attributes[`${attrKey}_name`] || selectedVariant.attributes[attrKey]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.map((opt: any) => {
                    const isSelected = selectedVariant.attributes[attrKey] === opt;
                    const matchingVariant = activeVariants.find((v: any) => v.attributes[attrKey] === opt);
                    const optionName = matchingVariant?.attributes[`${attrKey}_name`] || opt;

                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          const currentAttributes = { ...selectedVariant.attributes };
                          currentAttributes[attrKey] = opt;
                          let nextVariant = activeVariants.find((v: any) => {
                            const vAttrs = v.attributes;
                            return Object.keys(currentAttributes)
                              .filter(k => !k.endsWith('_name'))
                              .every(k => vAttrs[k] === currentAttributes[k]);
                          });
                          if (!nextVariant) {
                            nextVariant = activeVariants.find((v: any) => v.attributes[attrKey] === opt);
                          }
                          if (nextVariant) setSelectedVariant(nextVariant);
                        }}
                        className={`px-4 py-2.5 rounded-[10px] border text-xs font-bold transition-all duration-300 ${
                          isSelected
                            ? 'border-[#052326] bg-[#052326] text-[#F8F3EF] shadow-sm'
                            : 'border-[#052326]/10 bg-white text-[#052326]/70 hover:border-[#052326]/30'
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

      {/* Description */}
      {(product.short_description || product.shortDescription) && (
        <div className="relative pl-4 border-l border-[#052326]/10 py-1">
          <div
            className="text-xs md:text-sm text-[#052326]/80 leading-relaxed font-light font-sans"
            dangerouslySetInnerHTML={{ __html: product.short_description || product.shortDescription }}
          />
        </div>
      )}

      {/* Prescription Warning / Consultation Requirements Panel */}
      {product.is_prescription_required && (
        <div className="bg-[#D32F2F]/5 border border-[#D32F2F]/15 rounded-[12px] p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#D32F2F] font-bold text-sm tracking-wider uppercase">
            <ShieldAlert className="w-5 h-5" />
            <span>Prescription Required</span>
          </div>
          <p className="text-xs text-[#052326]/80 font-light leading-relaxed">
            This specialized formulation contains clinical extracts that require verified medical onboarding. Please enter patient information to validate orders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/60">Patient Name</label>
              <input
                type="text"
                className="w-full text-xs h-10 px-3 border border-[#052326]/10 rounded-[10px] outline-none focus:border-[#052326] bg-white transition-colors"
                placeholder="Full Name"
                value={patientDetails.patient_name}
                onChange={(e) => setPatientDetails({ ...patientDetails, patient_name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/60">Age</label>
              <input
                type="number"
                className="w-full text-xs h-10 px-3 border border-[#052326]/10 rounded-[10px] outline-none focus:border-[#052326] bg-white transition-colors"
                placeholder="Age"
                value={patientDetails.patient_age || ''}
                onChange={(e) => setPatientDetails({ ...patientDetails, patient_age: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/60">Gender</label>
              <select
                className="w-full text-xs h-10 px-2 border border-[#052326]/10 rounded-[10px] outline-none focus:border-[#052326] bg-white transition-colors"
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
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/60">Select Consultant Doctor</label>
              <select
                className="w-full text-xs h-10 px-2 border border-[#052326]/10 rounded-[10px] outline-none focus:border-[#052326] bg-white transition-colors"
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
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/60">Health Concern & Symptoms</label>
              <textarea
                className="w-full text-xs p-3 border border-[#052326]/10 rounded-[10px] outline-none focus:border-[#052326] bg-white transition-colors"
                placeholder="Briefly describe your symptoms here..."
                rows={2}
                value={patientDetails.health_concern}
                onChange={(e) => setPatientDetails({ ...patientDetails, health_concern: e.target.value })}
              />
            </div>
          </div>

          {/* Dosage warnings guides (Task 59) */}
          <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-3 flex items-start gap-3 mt-4 text-xs text-amber-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-semibold block uppercase tracking-wider text-[9px] mb-0.5">Clinical Dosage Notice</span>
              <span>This formulation contains active scheduled phyto-ingredients. Daily intake must strictly match doctor prescriptions. Avoid alcohol during use.</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Actions Box */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center bg-white rounded-[10px] h-12 border border-[#052326]/10">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 text-[#052326] hover:text-[#F0C417] text-lg font-bold"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 text-[#052326] hover:text-[#F0C417] text-lg font-bold"
            >
              +
            </button>
          </div>

          {/* Wishlist Button (10-14px border radius) */}
          <button
            onClick={handleWishlist}
            className={`h-12 w-12 flex items-center justify-center rounded-[10px] border transition-all ${
              isInWishlist(product.id)
                ? 'border-[#D32F2F]/20 bg-[#D32F2F]/5 text-[#D32F2F]'
                : 'border-[#052326]/10 hover:border-[#052326]/30 text-[#052326]/70'
            }`}
          >
            <Heart size={20} className={isInWishlist(product.id) ? 'fill-[#D32F2F]' : ''} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock')}
            className="h-12 rounded-[10px] font-bold text-xs uppercase tracking-wider border border-[#052326] text-[#052326] hover:bg-[#052326] hover:text-[#F8F3EF] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock') ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isLoading || (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock')}
            className="h-12 rounded-[10px] font-bold text-xs uppercase tracking-wider bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 shadow-sm hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock') ? 'Unavailable' : 'Buy Now'}
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="flex items-center justify-center gap-2 p-3 bg-white border border-[#052326]/10 rounded-[10px]">
          <Truck size={16} className="text-[#052326]/70" />
          <span className="text-[9px] font-bold text-[#052326]/70 uppercase tracking-wider">Fast Delivery</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-3 bg-white border border-[#052326]/10 rounded-[10px]">
          <ShieldCheck size={16} className="text-[#052326]/70" />
          <span className="text-[9px] font-bold text-[#052326]/70 uppercase tracking-wider">Authentic</span>
        </div>
        <div className="flex items-center justify-center gap-2 p-3 bg-white border border-[#052326]/10 rounded-[10px]">
          <RotateCcw size={16} className="text-[#052326]/70" />
          <span className="text-[9px] font-bold text-[#052326]/70 uppercase tracking-wider">Easy Returns</span>
        </div>
      </div>

      {/* Mobile Sticky Action Bar Footer (Task 65) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#052326]/10 p-3 flex items-center justify-between shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#052326]/40 uppercase tracking-wider">Total price</span>
          <span className="text-base font-bold text-[#052326]">₹{displayPrice}</span>
        </div>
        <button
          onClick={handleBuyNow}
          disabled={isLoading || (selectedVariant ? selectedVariant.stock_status === 'out_of_stock' : product.stock_status === 'out_of_stock')}
          className="px-6 py-3 bg-[#052326] text-[#F8F3EF] text-xs font-bold uppercase tracking-wider rounded-[10px] transition-all"
        >
          {product.is_prescription_required ? "Rx Consult" : "Buy Now"}
        </button>
      </div>

      {/* Inline Upsell */}
      <div className="pt-4">
        <InlineUpsell productId={product.id} categoryId={product.category_id} />
      </div>

      {isCheckoutModalOpen && (
        <ShopfloCheckout 
          isModal 
          onClose={() => setIsCheckoutModalOpen(false)} 
        />
      )}
    </div>
  );
}
