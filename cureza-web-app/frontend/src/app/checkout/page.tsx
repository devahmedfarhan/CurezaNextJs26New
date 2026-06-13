'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Truck, MapPin, ChevronDown, ChevronUp, Plus, Lock, ArrowLeft, Tag } from 'lucide-react';
import axios from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/context/AuthContext';
import { indianLocations } from '@/data/indianLocations';

interface AddressData {
    id?: number;
    first_name: string;
    last_name: string;
    company_name?: string;
    country: string;
    street_address: string;
    apartment?: string;
    city: string;
    state: string;
    postcode: string;
    phone: string;
    email: string;
}

interface ShippingMethod {
    id: number;
    name: string;
    cost: number;
    estimated_days: string;
}

const initialAddress: AddressData = {
    first_name: '',
    last_name: '',
    company_name: '',
    country: 'India',
    street_address: '',
    apartment: '',
    city: '',
    state: 'Telangana', // Default as per user request example
    postcode: '',
    phone: '',
    email: ''
};

export default function CheckoutPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { clearCart, applyCoupon, removeCoupon, items: cartItems } = useCart();
    const { user } = useAuth();

    const [billingAddress, setBillingAddress] = useState<AddressData>(initialAddress);
    const [shippingAddress, setShippingAddress] = useState<AddressData>(initialAddress);
    const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
    const [orderNotes, setOrderNotes] = useState('');
    const [createAccount, setCreateAccount] = useState(false);
    const [saveAddressToBook, setSaveAddressToBook] = useState(true);
    const [couponCode, setCouponCode] = useState('');

    const [checkoutSummary, setCheckoutSummary] = useState<any>(null); // To store backend summary
    const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [publicSettings, setPublicSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                // Fetch public settings for payment gateways first
                let defaultPayment = '';
                try {
                    const settingsResponse = await axios.get('/settings/public');
                    const settings = settingsResponse.data;
                    setPublicSettings(settings);
                    
                    if (settings) {
                        if (settings.cod_enabled) {
                            defaultPayment = 'cod';
                        } else if (settings.razorpay_enabled) {
                            defaultPayment = 'razorpay';
                        } else if (settings.stripe_enabled) {
                            defaultPayment = 'stripe';
                        } else if (settings.payu_enabled) {
                            defaultPayment = 'payu';
                        } else if (settings.phonepe_enabled) {
                            defaultPayment = 'phonepe';
                        }

                        if (settings.checkout_save_address_default !== undefined) {
                            setSaveAddressToBook(settings.checkout_save_address_default);
                        }
                    }
                } catch (settingsError) {
                    console.error('Failed to fetch public settings:', settingsError);
                }

                const response = await axios.get('/checkout/initiate');
                setCheckoutSummary(response.data.summary);

                if (response.data.shipping_methods) {
                    setShippingMethods(response.data.shipping_methods);
                    // Select Standard Delivery by default
                    if (response.data.shipping_methods && response.data.shipping_methods.length > 0) {
                        const standardMethod = response.data.shipping_methods.find((m: any) => m.name === 'Standard Delivery');
                        if (standardMethod) {
                            setSelectedShippingMethodId(standardMethod.id);
                        } else {
                            setSelectedShippingMethodId(response.data.shipping_methods[0].id);
                        }
                    }
                }

                if (response.data.addresses && response.data.addresses.length > 0) {
                    // Map backend addresses to frontend format
                    const mappedAddresses = response.data.addresses.map((addr: any) => ({
                        id: addr.id,
                        first_name: addr.name ? addr.name.split(' ')[0] : '',
                        last_name: addr.name ? addr.name.split(' ').slice(1).join(' ') : '',
                        company_name: '',
                        country: addr.country || 'India',
                        street_address: addr.address_line_1 || '',
                        apartment: addr.address_line_2 || '',
                        city: addr.city || '',
                        state: addr.state || '',
                        postcode: addr.zip || '',
                        phone: addr.phone || '',
                        email: user?.email || '' // Use user email as fallback
                    }));
                    setSavedAddresses(mappedAddresses);
                    // Auto-select the default or first address
                    const defaultAddr = response.data.addresses.find((a: any) => a.is_default);
                    if (defaultAddr) {
                        // Find the mapped version
                        const mappedDefault = mappedAddresses.find((a: any) => a.id === defaultAddr.id);
                        setBillingAddress(mappedDefault || mappedAddresses[0]);
                    } else {
                        setBillingAddress(mappedAddresses[0]);
                    }
                } else {
                    setShowAddressForm(true);
                }

                // Apply default payment method
                setPaymentMethod(defaultPayment);
            } catch (error: any) {
                console.error('Failed to fetch checkout data:', error);
                if (error.response?.status === 400 && error.response?.data?.message === 'Cart is empty') {
                    showToast('Your cart is empty', 'error');
                    router.push('/cart');
                } else if (error.response?.status === 401) {
                    // Redirect to login if unauthenticated
                    router.push('/login?redirect=/checkout');
                }
            } finally {
                setIsPageLoading(false);
            }
        };

        fetchCheckoutData();
    }, [router, showToast, user]);

    // Calculate Totals when Address or Shipping Method changes
    useEffect(() => {
        const calculateTotals = async () => {
            if (!selectedShippingMethodId) return;

            const state = shipToDifferentAddress ? shippingAddress.state : billingAddress.state;
            if (!state) return;

            try {
                // We don't need to pass coupon_code here if it was applied via applyCoupon (stored in DB)
                // But passing it explicitly doesn't hurt if we want to preview input.
                // However, applyCoupon logic is separate.
                const response = await axios.post('/checkout/calculate', {
                    state: state,
                    shipping_method_id: selectedShippingMethodId,
                    // coupon_code: couponCode // Optional: if we want to test input field without applying? No, lets stick to DB.
                });

                setCheckoutSummary(response.data.summary);
            } catch (error) {
                console.error('Failed to calculate totals:', error);
            }
        };

        if (checkoutSummary) { // Only calculate if we already have initial data
            calculateTotals();
        }
    }, [billingAddress.state, shippingAddress.state, shipToDifferentAddress, selectedShippingMethodId]); // Trigger on these changes


    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        const result = await applyCoupon(couponCode);
        setIsApplyingCoupon(false);
        if (result.success) {
            showToast(result.message, 'success');
            // Re-calculate to reflect changes in summary (handled by applyCoupon updating context? 
            // Checkout page uses local checkoutSummary state. usage of applyCoupon updates CONTEXT summary.
            // We need to update LOCAL summary. 
            // Actually, applyCoupon returns { success, message }. 
            // We should re-trigger calculation or fetch updated summary.
            // Best: re-run calculateTotals logic or just use context summary?
            // Let's force a recalculation step.
            const state = shipToDifferentAddress ? shippingAddress.state : billingAddress.state;
            if (state && selectedShippingMethodId) {
                const response = await axios.post('/checkout/calculate', {
                    state: state,
                    shipping_method_id: selectedShippingMethodId
                });
                setCheckoutSummary(response.data.summary);
            }
        } else {
            showToast(result.message, 'error');
        }
    };

    // Remove Coupon Logic
    const handleRemoveCoupon = async () => {
        await removeCoupon();
        setCouponCode('');
        // Recalculate
        const state = shipToDifferentAddress ? shippingAddress.state : billingAddress.state;
        if (state && selectedShippingMethodId) {
            const response = await axios.post('/checkout/calculate', {
                state: state,
                shipping_method_id: selectedShippingMethodId
            });
            setCheckoutSummary(response.data.summary);
        }
    };

    const handleAddressSelect = (address: AddressData) => {
        setBillingAddress(address);
        if (!shipToDifferentAddress) {
            setShippingAddress(address);
        }
        setShowAddressForm(false);
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const orderData = {
                items: cartItems.map((item: any) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    patient_name: item.patientDetails?.patient_name || null,
                    patient_age: item.patientDetails?.patient_age || null,
                    patient_gender: item.patientDetails?.patient_gender || null,
                    health_concern: item.patientDetails?.health_concern || null,
                    prescription_path: item.patientDetails?.prescription_path || null,
                    doctor_id: item.patientDetails?.doctor_id || null,
                })),
                billing_address: billingAddress,
                shipping_address: shipToDifferentAddress ? shippingAddress : billingAddress,
                order_notes: orderNotes,
                payment_method: paymentMethod,
                create_account: createAccount, // For guests, if we enable guest checkout later
                save_address: user && (showAddressForm || savedAddresses.length === 0) && saveAddressToBook,
                shipping_method_id: selectedShippingMethodId
            };

            const response = await axios.post('/orders', orderData);

            if (response.status === 201) {
                clearCart();
                router.push(`/order-success?order_id=${response.data.order_id}`);
            }
        } catch (error: any) {
            console.error('Order placement failed:', error);
            showToast(error.response?.data?.message || 'Failed to place order', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cureza-green"></div>
            </div>
        );
    }

    if (!checkoutSummary) return null;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Custom Secure Header (Shopflo Style) */}
            <div className="bg-white border-b border-gray-200 py-4 mb-8 sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.push('/cart')}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-semibold transition"
                    >
                        <ArrowLeft size={16} /> Back to Cart
                    </button>
                    
                    <div className="text-xl font-black text-cureza-green tracking-widest uppercase font-sans flex items-center gap-1.5 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cureza-green text-white font-bold text-base">
                            C
                        </div>
                        Cureza
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100/60 shadow-sm">
                        <Lock size={12} className="text-green-600" />
                        {publicSettings?.checkout_secure_badge_text || '100% Safe & Secure Checkout'}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-24">
                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Checkout Steps */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Step 1 Card: Delivery Address */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <span className="w-8 h-8 rounded-full bg-cureza-green text-white font-extrabold flex items-center justify-center text-sm shadow-sm shadow-green-500/20">1</span>
                                <h2 className="text-xl font-extrabold text-charcoal">Delivery Address</h2>
                            </div>

                            {/* Address Book Selection */}
                            {savedAddresses.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <MapPin size={16} className="text-cureza-green" /> Select a Saved Address
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedAddresses.map((addr, index) => (
                                            <div
                                                key={addr.id || index}
                                                onClick={() => handleAddressSelect(addr)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                    billingAddress.id === addr.id
                                                        ? 'border-cureza-green bg-green-50/20 shadow-sm'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="font-bold text-gray-900">{addr.first_name} {addr.last_name}</div>
                                                <div className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                                                    {addr.street_address}, {addr.apartment && `${addr.apartment}, `}
                                                    {addr.city}, {addr.state} - {addr.postcode}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-2 font-medium">{addr.phone}</div>
                                            </div>
                                        ))}

                                        {/* Add New Address Button */}
                                        <div
                                            onClick={() => {
                                                setBillingAddress(initialAddress);
                                                setShowAddressForm(true);
                                            }}
                                            className={`p-4 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-cureza-green hover:bg-green-50/10 flex flex-col items-center justify-center text-gray-500 hover:text-cureza-green transition-all min-h-[120px] ${
                                                showAddressForm ? 'border-cureza-green bg-green-50/10 text-cureza-green' : ''
                                            }`}
                                        >
                                            <Plus size={24} />
                                            <span className="font-bold mt-2">Add New Address</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Billing Details Form */}
                            {(showAddressForm || savedAddresses.length === 0) && (
                                <div className="space-y-6 pt-2 border-t border-gray-50 mt-4">
                                    <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                                        <CreditCard className="text-cureza-green" size={20} /> Billing Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">First name *</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.first_name}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, first_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Last name *</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.last_name}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, last_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Company name (optional)</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.company_name}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, company_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Country / Region *</label>
                                            <select
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.country}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                                            >
                                                <option value="India">India</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Street address *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="House number and street name"
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green mb-2"
                                                value={billingAddress.street_address}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, street_address: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Apartment, suite, unit, etc. (optional)"
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.apartment}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, apartment: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Town / City *</label>
                                            <select
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.city}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                                                disabled={!billingAddress.state}
                                            >
                                                <option value="">Select City</option>
                                                {billingAddress.state && indianLocations[billingAddress.state]?.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">State *</label>
                                            <select
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.state}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value, city: '' })}
                                            >
                                                <option value="">Select State</option>
                                                {Object.keys(indianLocations).map((state) => (
                                                    <option key={state} value={state}>{state}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">PIN Code *</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.postcode}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, postcode: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Phone *</label>
                                            <input
                                                type="tel"
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.phone}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Email address *</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={billingAddress.email}
                                                onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                                            />
                                        </div>

                                        {/* Create Account Checkbox - Only show if user is NOT logged in */}
                                        {!user && (
                                            <div className="md:col-span-2 mt-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green h-4 w-4"
                                                        checked={createAccount}
                                                        onChange={(e) => setCreateAccount(e.target.checked)}
                                                    />
                                                    <span className="text-gray-700 font-semibold select-none text-sm">Create an account?</span>
                                                </label>
                                            </div>
                                        )}

                                        {/* Save Address to Address Book Checkbox - Only show if user IS logged in */}
                                        {user && (
                                            <div className="md:col-span-2 mt-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green h-4 w-4"
                                                        checked={saveAddressToBook}
                                                        onChange={(e) => setSaveAddressToBook(e.target.checked)}
                                                    />
                                                    <span className="text-gray-700 font-semibold select-none text-sm">Save this address to my address book</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Shipping Address Toggle & Form */}
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green h-4 w-4"
                                        checked={shipToDifferentAddress}
                                        onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                                    />
                                    <span className="text-base font-bold text-charcoal flex items-center gap-2 select-none">
                                        <Truck className="text-cureza-green" size={18} /> Ship to a different address?
                                    </span>
                                </label>

                                {shipToDifferentAddress && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fadeIn">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">First name *</label>
                                            <input
                                                type="text"
                                                required={shipToDifferentAddress}
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={shippingAddress.first_name}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Last name *</label>
                                            <input
                                                type="text"
                                                required={shipToDifferentAddress}
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={shippingAddress.last_name}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Company name (optional)</label>
                                            <input
                                                type="text"
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={shippingAddress.company_name}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, company_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Country / Region *</label>
                                            <select
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={shippingAddress.country}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                            >
                                                <option value="India">India</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Street address *</label>
                                            <input
                                                type="text"
                                                required={shipToDifferentAddress}
                                                placeholder="House number and street name"
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green mb-2"
                                                value={shippingAddress.street_address}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, street_address: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Apartment, suite, unit, etc. (optional)"
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={shippingAddress.apartment}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Town / City *</label>
                                            <select
                                                required={shipToDifferentAddress}
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={shippingAddress.city}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                                disabled={!shippingAddress.state}
                                            >
                                                <option value="">Select City</option>
                                                {shippingAddress.state && indianLocations[shippingAddress.state]?.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">State *</label>
                                            <select
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={shippingAddress.state}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value, city: '' })}
                                            >
                                                <option value="">Select State</option>
                                                {Object.keys(indianLocations).map((state) => (
                                                    <option key={state} value={state}>{state}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">PIN Code *</label>
                                            <input
                                                type="text"
                                                required={shipToDifferentAddress}
                                                maxLength={6}
                                                className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                                value={shippingAddress.postcode}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Order Notes (optional) - Conditionally Visible */}
                            {publicSettings?.checkout_order_notes_enabled && (
                                <div className="border-t border-gray-100 pt-6 mt-6 space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Order notes (optional)</label>
                                    <textarea
                                        className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                        placeholder="Notes about your order, e.g. special notes for delivery."
                                        rows={3}
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Step 2 Card: Shipping Method */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <span className="w-8 h-8 rounded-full bg-cureza-green text-white font-extrabold flex items-center justify-center text-sm shadow-sm shadow-green-500/20">2</span>
                                <h2 className="text-xl font-extrabold text-charcoal">Shipping Method</h2>
                            </div>
                            <div className="space-y-4">
                                {shippingMethods.map((method) => (
                                    <label 
                                        key={method.id} 
                                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:border-cureza-green transition-colors ${
                                            selectedShippingMethodId === method.id 
                                                ? 'border-cureza-green bg-green-50/10' 
                                                : 'border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="shipping_method"
                                                value={method.id}
                                                checked={selectedShippingMethodId === method.id}
                                                onChange={() => setSelectedShippingMethodId(method.id)}
                                                className="w-4 h-4 text-cureza-green focus:ring-cureza-green"
                                            />
                                            <div>
                                                <div className="font-bold text-gray-900">{method.name}</div>
                                                <div className="text-sm text-gray-500">{method.estimated_days}</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-gray-900">
                                            {method.cost === 0 ? 'Free' : `₹${method.cost}`}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Step 3 Card: Payment Options */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <span className="w-8 h-8 rounded-full bg-cureza-green text-white font-extrabold flex items-center justify-center text-sm shadow-sm shadow-green-500/20">3</span>
                                <h2 className="text-xl font-extrabold text-charcoal">Payment Options</h2>
                            </div>

                            <div className="space-y-4">
                                {(() => {
                                    const paymentOptions = [
                                        {
                                            id: 'cod',
                                            title: 'Cash on Delivery',
                                            enabled: publicSettings?.cod_enabled,
                                            description: 'Pay with cash upon delivery.',
                                            logo: null,
                                            icon: <Truck className="text-cureza-green w-5 h-5" />
                                        },
                                        {
                                            id: 'razorpay',
                                            title: 'Razorpay Secure',
                                            enabled: publicSettings?.razorpay_enabled,
                                            description: 'Pay securely using Credit or Debit cards, Netbanking, or UPI via Razorpay.',
                                            logo: 'https://cdn.razorpay.com/static/assets/logo/payment.svg',
                                            icon: null
                                        },
                                        {
                                            id: 'stripe',
                                            title: 'Credit / Debit Card (Stripe)',
                                            enabled: publicSettings?.stripe_enabled,
                                            description: 'Pay securely with Credit Card, Debit Card, or international cards through Stripe.',
                                            logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_blue.svg',
                                            icon: null
                                        },
                                        {
                                            id: 'payu',
                                            title: 'PayU Checkout',
                                            enabled: publicSettings?.payu_enabled,
                                            description: 'Easy and secure check out with Cards, UPI, Netbanking via PayU.',
                                            logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/PayU_logo.svg',
                                            icon: null
                                        },
                                        {
                                            id: 'phonepe',
                                            title: 'PhonePe UPI & Cards',
                                            enabled: publicSettings?.phonepe_enabled,
                                            description: 'Instant and secure payment using PhonePe UPI app, Cards, or Wallets.',
                                            logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/PhonePe_Logo.svg',
                                            icon: null
                                        }
                                    ];

                                    const activePaymentOptions = paymentOptions.filter(opt => opt.enabled);

                                    if (activePaymentOptions.length === 0) {
                                        return (
                                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center text-red-600 text-sm font-semibold">
                                                No active payment methods. Please contact the administrator.
                                            </div>
                                        );
                                    }

                                    return activePaymentOptions.map((opt) => (
                                        <div 
                                            key={opt.id} 
                                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                paymentMethod === opt.id 
                                                    ? 'border-cureza-green bg-green-50/10 shadow-sm' 
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                            onClick={() => setPaymentMethod(opt.id)}
                                        >
                                            <label className="flex items-start cursor-pointer w-full">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={opt.id}
                                                    checked={paymentMethod === opt.id}
                                                    onChange={() => setPaymentMethod(opt.id)}
                                                    className="mt-1 w-4 h-4 text-cureza-green focus:ring-cureza-green"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="block font-bold text-charcoal">{opt.title}</span>
                                                        {opt.logo ? (
                                                            <img src={opt.logo} alt={opt.title} className="h-5 object-contain max-w-[80px]" />
                                                        ) : (
                                                            opt.icon
                                                        )}
                                                    </div>
                                                    {paymentMethod === opt.id && (
                                                        <p className="text-sm text-gray-600 mt-2 animate-fadeIn border-t border-gray-100 pt-2 leading-relaxed">
                                                            {opt.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    ));
                                })()}
                            </div>

                            <div className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="#" className="text-cureza-green hover:underline">privacy policy</a>.
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !selectedShippingMethodId || !paymentMethod}
                                className="w-full bg-gradient-to-r from-cureza-green to-green-700 hover:from-green-700 hover:to-green-800 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Place Order & Pay Securely <Lock size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24 space-y-6">
                            <h3 className="text-xl font-bold text-charcoal pb-4 border-b border-gray-100">Order Summary</h3>

                            {/* Product List */}
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                {cartItems.map((item: any) => (
                                    <div key={item.id} className="flex justify-between gap-4 text-sm pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="text-gray-700 flex-1">
                                            <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5 tracking-wider">{item.brand}</div>
                                            <span className="font-semibold text-charcoal block line-clamp-2">{item.title}</span>
                                            <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                                            {item.patientDetails && (
                                                <div className="text-[11px] text-gray-500 mt-1 bg-gray-50 p-1.5 rounded">
                                                    Patient: {item.patientDetails.patient_name}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-bold text-charcoal whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Section */}
                            <div className="border-t border-gray-100 pt-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Have a coupon?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        className="flex-1 rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green uppercase text-sm"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!checkoutSummary.coupon_applied}
                                    />
                                    {checkoutSummary.coupon_applied ? (
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={isApplyingCoupon || !couponCode}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 transition-colors"
                                        >
                                            {isApplyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                {checkoutSummary.coupon_applied && (
                                    <div className="mt-2 text-xs text-green-600 font-bold flex items-center gap-1">
                                        <Tag size={12} /> Coupon "{checkoutSummary.coupon_applied}" applied!
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-charcoal">₹{checkoutSummary.subtotal}</span>
                                </div>
                                {checkoutSummary.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                                        <span>Discount</span>
                                        <span>-₹{checkoutSummary.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>
                                    {selectedShippingMethodId ? (
                                        <span className={checkoutSummary.shipping_cost === 0 ? "text-green-600 font-semibold text-sm" : "font-bold text-charcoal"}>
                                            {checkoutSummary.shipping_cost === 0 ? 'Free' : `₹${checkoutSummary.shipping_cost}`}
                                        </span>
                                    ) : (
                                        <span className="text-xs italic text-orange-500">Select method</span>
                                    )}
                                </div>
                                {checkoutSummary.igst > 0 ? (
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>IGST</span>
                                        <span className="font-semibold">₹{checkoutSummary.igst}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>CGST</span>
                                            <span className="font-semibold">₹{checkoutSummary.cgst}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>SGST</span>
                                            <span className="font-semibold">₹{checkoutSummary.sgst}</span>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between text-lg font-extrabold text-charcoal pt-3 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>₹{checkoutSummary.final_total}</span>
                                </div>
                                <div className="text-[10px] text-gray-400 text-right font-medium">
                                    (includes ₹{checkoutSummary.total_tax} Tax)
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
