'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Truck, MapPin, ChevronDown, ChevronUp, Plus } from 'lucide-react';
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
    const [couponCode, setCouponCode] = useState('');

    const [checkoutSummary, setCheckoutSummary] = useState<any>(null); // To store backend summary
    const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
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
                save_address: user && showAddressForm, // Save address if user is logged in and entered a new one
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
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Checkout</h1>

                <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Billing & Shipping */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Address Book Selection */}
                        {savedAddresses.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
                                    <MapPin className="text-cureza-green" /> Select Address
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {savedAddresses.map((addr, index) => (
                                        <div
                                            key={addr.id || index}
                                            onClick={() => handleAddressSelect(addr)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${billingAddress.id === addr.id
                                                ? 'border-cureza-green bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-bold text-gray-900">{addr.first_name} {addr.last_name}</div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {addr.street_address}, {addr.apartment && `${addr.apartment}, `}
                                                {addr.city}, {addr.state} - {addr.postcode}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">{addr.phone}</div>
                                        </div>
                                    ))}

                                    {/* Add New Address Button */}
                                    <div
                                        onClick={() => {
                                            setBillingAddress(initialAddress);
                                            setShowAddressForm(true);
                                        }}
                                        className={`p-4 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-cureza-green hover:bg-gray-50 flex flex-col items-center justify-center text-gray-500 hover:text-cureza-green transition-all ${showAddressForm ? 'border-cureza-green bg-gray-50' : ''}`}
                                    >
                                        <Plus size={24} />
                                        <span className="font-medium mt-2">Add New Address</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing Details Form */}
                        {(showAddressForm || savedAddresses.length === 0) && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
                                    <CreditCard className="text-cureza-green" /> Billing Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">First name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={billingAddress.first_name}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Last name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={billingAddress.last_name}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Company name (optional)</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={billingAddress.company_name}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, company_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Country / Region *</label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={billingAddress.country}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                                        >
                                            <option value="India">India</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Street address *</label>
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
                                        <label className="text-sm font-medium text-gray-700">Town / City *</label>
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
                                        <label className="text-sm font-medium text-gray-700">State *</label>
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
                                        <label className="text-sm font-medium text-gray-700">PIN Code *</label>
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
                                        <label className="text-sm font-medium text-gray-700">Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={billingAddress.phone}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Email address *</label>
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
                                        <div className="md:col-span-2">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green"
                                                    checked={createAccount}
                                                    onChange={(e) => setCreateAccount(e.target.checked)}
                                                />
                                                <span className="text-gray-700 font-medium">Create an account?</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Shipping Address Toggle */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <label className="flex items-center space-x-2 cursor-pointer mb-4">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-cureza-green focus:ring-cureza-green"
                                    checked={shipToDifferentAddress}
                                    onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                                />
                                <span className="text-lg font-bold text-charcoal flex items-center gap-2">
                                    <Truck className="text-cureza-green" /> Ship to a different address?
                                </span>
                            </label>

                            {shipToDifferentAddress && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">First name *</label>
                                        <input
                                            type="text"
                                            required={shipToDifferentAddress}
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={shippingAddress.first_name}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Last name *</label>
                                        <input
                                            type="text"
                                            required={shipToDifferentAddress}
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={shippingAddress.last_name}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Company name (optional)</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={shippingAddress.company_name}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, company_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Country / Region *</label>
                                        <select
                                            className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                            value={shippingAddress.country}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                        >
                                            <option value="India">India</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Street address *</label>
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
                                        <label className="text-sm font-medium text-gray-700">Town / City *</label>
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
                                        <label className="text-sm font-medium text-gray-700">State *</label>
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
                                        <label className="text-sm font-medium text-gray-700">PIN Code *</label>
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

                            <div className="mt-6 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Order notes (optional)</label>
                                <textarea
                                    className="w-full rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green"
                                    placeholder="Notes about your order, e.g. special notes for delivery."
                                    rows={3}
                                    value={orderNotes}
                                    onChange={(e) => setOrderNotes(e.target.value)}
                                />
                            </div>
                        </div>


                        {/* Shipping Methods */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
                                <Truck className="text-cureza-green" /> Shipping Method
                            </h2>
                            <div className="space-y-4">
                                {shippingMethods.map((method) => (
                                    <label key={method.id} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:border-cureza-green transition-colors">
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
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-xl font-bold mb-6 text-charcoal">Your Order</h3>

                            {/* Product List */}
                            <div className="space-y-4 mb-6 border-b pb-6">
                                <div className="flex justify-between font-bold text-sm text-gray-600 uppercase">
                                    <span>Product</span>
                                    <span>Subtotal</span>
                                </div>
                                {cartItems.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div className="text-gray-700">
                                            <div className="text-xs text-gray-500 mb-0.5">{item.brand}</div>
                                            <span className="font-medium text-charcoal">{item.title}</span>
                                            <span className="text-gray-500"> × {item.quantity}</span>
                                            {item.patientDetails && (
                                                <div className="text-xs text-gray-500 mt-1">Patient: {item.patientDetails.patient_name}</div>
                                            )}
                                        </div>
                                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>


                            {/* Coupon Section */}
                            <div className="mb-6 border-b pb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        className="flex-1 rounded-lg border-gray-300 focus:border-cureza-green focus:ring-cureza-green uppercase"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!checkoutSummary.coupon_applied}
                                    />
                                    {checkoutSummary.coupon_applied ? (
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={isApplyingCoupon || !couponCode}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black disabled:opacity-50"
                                        >
                                            {isApplyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                {checkoutSummary.coupon_applied && (
                                    <div className="mt-2 text-sm text-green-600 font-medium">
                                        Coupon "{checkoutSummary.coupon_applied}" applied!
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 mb-6 border-b pb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-charcoal">₹{checkoutSummary.subtotal}</span>
                                </div>
                                {checkoutSummary.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-bold">-₹{checkoutSummary.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    {selectedShippingMethodId ? (
                                        <span className={checkoutSummary.shipping_cost === 0 ? "text-green-600 font-medium" : "font-bold text-charcoal"}>
                                            {checkoutSummary.shipping_cost === 0 ? 'Free' : `₹${checkoutSummary.shipping_cost}`}
                                        </span>
                                    ) : (
                                        <span className="text-sm italic text-orange-500">Select method below</span>
                                    )}
                                </div>
                                {checkoutSummary.igst > 0 ? (
                                    <div className="flex justify-between text-gray-600">
                                        <span>IGST</span>
                                        <span className="font-medium">₹{checkoutSummary.igst}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-gray-600">
                                            <span>CGST</span>
                                            <span className="font-medium">₹{checkoutSummary.cgst}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>SGST</span>
                                            <span className="font-medium">₹{checkoutSummary.sgst}</span>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-between text-xl font-bold text-charcoal pt-2">
                                    <span>Total</span>
                                    <span>₹{checkoutSummary.final_total}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    (includes ₹{checkoutSummary.total_tax} Tax)
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="space-y-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <label className="flex items-start cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                            className="mt-1 w-4 h-4 text-cureza-green focus:ring-cureza-green"
                                        />
                                        <div className="ml-3">
                                            <span className="block font-bold text-charcoal">Cash on delivery</span>
                                            {paymentMethod === 'cod' && (
                                                <p className="text-sm text-gray-600 mt-1 animate-fadeIn">
                                                    Pay with cash upon delivery.
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <label className="flex items-start cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="razorpay"
                                            checked={paymentMethod === 'razorpay'}
                                            onChange={() => setPaymentMethod('razorpay')}
                                            className="mt-1 w-4 h-4 text-cureza-green focus:ring-cureza-green"
                                        />
                                        <div className="ml-3">
                                            <span className="block font-bold text-charcoal">Razorpay Secure</span>
                                            {paymentMethod === 'razorpay' && (
                                                <div className="mt-2">
                                                    <img src="https://cdn.razorpay.com/static/assets/logo/payment.svg" alt="Razorpay" className="h-6" />
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 mb-6">
                                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="#" className="text-cureza-green hover:underline">privacy policy</a>.
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !selectedShippingMethodId}
                                className="w-full bg-cureza-green text-white font-bold py-4 rounded-lg hover:bg-green-800 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    'Place order'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div >
        </div >
    );
}
