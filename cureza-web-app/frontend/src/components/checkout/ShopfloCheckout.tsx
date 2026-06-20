'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Truck, MapPin, ChevronDown, ChevronUp, Plus, Lock, ArrowLeft, Tag, X, Edit2, ShieldCheck, Mail, Eye, EyeOff, Smartphone, Key } from 'lucide-react';
import axios from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/context/AuthContext';
import { indianLocations } from '@/data/indianLocations';
import Link from 'next/link';

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

interface ShopfloCheckoutProps {
    isModal?: boolean;
    onClose?: () => void;
    prefetchedData?: any;
    prefetchedSettings?: any;
}

const initialAddress: AddressData = {
    first_name: '',
    last_name: '',
    company_name: '',
    country: 'India',
    street_address: '',
    apartment: '',
    city: '',
    state: 'Telangana',
    postcode: '',
    phone: '',
    email: ''
};

export default function ShopfloCheckout({ isModal = false, onClose, prefetchedData, prefetchedSettings }: ShopfloCheckoutProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const { clearCart, applyCoupon, removeCoupon, items: cartItems } = useCart();
    const { user, login, logout } = useAuth();

    // Inline login states
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // OTP login states
    const [loginId, setLoginId] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    // OTP countdown timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const [billingAddress, setBillingAddress] = useState<AddressData>(initialAddress);
    const [shippingAddress, setShippingAddress] = useState<AddressData>(initialAddress);
    const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
    const [orderNotes, setOrderNotes] = useState('');
    const [createAccount, setCreateAccount] = useState(false);
    const [saveAddressToBook, setSaveAddressToBook] = useState(true);
    const [couponCode, setCouponCode] = useState('');

    const [checkoutSummary, setCheckoutSummary] = useState<any>(null);
    const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [publicSettings, setPublicSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const getTaxLabel = () => {
        const isIgst = Number(checkoutSummary?.igst || 0) > 0;
        const slabs = Object.values(checkoutSummary?.items_breakdown || {})
            .map((item: any) => Number(item.gst_slab || 0))
            .filter(slab => slab > 0);
        const uniqueSlabs = Array.from(new Set(slabs));
        const slabStr = uniqueSlabs.length > 0 
            ? uniqueSlabs.map(s => `${s}%`).join(' & ') 
            : '';
        const taxType = isIgst ? 'IGST' : 'CGST + SGST';
        return slabStr ? `Taxes (${taxType} ${slabStr})` : `Taxes (${taxType})`;
    };

    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);

    // Accordion visibility states
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
    const [isShippingExpanded, setIsShippingExpanded] = useState(false);
    const [isAddressExpanded, setIsAddressExpanded] = useState(true);

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                let settings = prefetchedSettings;
                let initiateData = prefetchedData;

                if (!settings || !initiateData) {
                    const [settingsResponse, initiateResponse] = await Promise.all([
                        settings ? Promise.resolve({ data: settings }) : axios.get('/settings/public'),
                        initiateData ? Promise.resolve({ data: initiateData }) : axios.get('/checkout/initiate')
                    ]);
                    settings = settingsResponse.data;
                    initiateData = initiateResponse.data;
                }

                setPublicSettings(settings);

                let defaultPayment = '';
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

                setCheckoutSummary(initiateData.summary);

                if (initiateData.shipping_methods) {
                    setShippingMethods(initiateData.shipping_methods);
                    if (initiateData.shipping_methods.length > 0) {
                        const standardMethod = initiateData.shipping_methods.find((m: any) => m.name === 'Standard Delivery');
                        if (standardMethod) {
                            setSelectedShippingMethodId(standardMethod.id);
                        } else {
                            setSelectedShippingMethodId(initiateData.shipping_methods[0].id);
                        }
                    }
                }

                if (initiateData.addresses && initiateData.addresses.length > 0) {
                    const mappedAddresses = initiateData.addresses.map((addr: any) => ({
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
                        email: user?.email || ''
                    }));
                    setSavedAddresses(mappedAddresses);
                    const defaultAddr = initiateData.addresses.find((a: any) => a.is_default);
                    if (defaultAddr) {
                        const mappedDefault = mappedAddresses.find((a: any) => a.id === defaultAddr.id);
                        setBillingAddress(mappedDefault || mappedAddresses[0]);
                    } else {
                        setBillingAddress(mappedAddresses[0]);
                    }
                } else {
                    setShowAddressForm(true);
                }

                setPaymentMethod(defaultPayment);
            } catch (error: any) {
                if (error.response?.status === 400 && error.response?.data?.message === 'Cart is empty') {
                    showToast('Your cart is empty', 'error');
                    if (onClose) onClose();
                    else router.push('/cart');
                } else {
                    console.error('Failed to fetch checkout data:', error);
                    if (error.response?.status === 401) {
                        if (onClose) {
                            logout(true);
                        } else {
                            router.push('/login?redirect=/checkout');
                        }
                    }
                }
            } finally {
                setIsPageLoading(false);
            }
        };

        fetchCheckoutData();
    }, [router, showToast, user, onClose, prefetchedData, prefetchedSettings]);

    // Calculate Totals when parameters change
    useEffect(() => {
        const calculateTotals = async () => {
            if (!selectedShippingMethodId) return;
            const state = shipToDifferentAddress ? shippingAddress.state : billingAddress.state;
            if (!state) return;

            try {
                const response = await axios.post('/checkout/calculate', {
                    state: state,
                    shipping_method_id: selectedShippingMethodId,
                    payment_method: paymentMethod
                });

                setCheckoutSummary(response.data.summary);
                if (response.data.shipping_methods) {
                    setShippingMethods(response.data.shipping_methods);
                }
            } catch (error) {
                console.error('Failed to calculate totals:', error);
            }
        };

        if (checkoutSummary) {
            calculateTotals();
        }
    }, [billingAddress.state, shippingAddress.state, shipToDifferentAddress, selectedShippingMethodId, paymentMethod]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        const result = await applyCoupon(couponCode);
        setIsApplyingCoupon(false);
        if (result.success) {
            showToast(result.message, 'success');
            const state = shipToDifferentAddress ? shippingAddress.state : billingAddress.state;
            if (state && selectedShippingMethodId) {
                const response = await axios.post('/checkout/calculate', {
                    state: state,
                    shipping_method_id: selectedShippingMethodId,
                    payment_method: paymentMethod
                });
                setCheckoutSummary(response.data.summary);
            }
        } else {
            showToast(result.message, 'error');
        }
    };

    const handleRemoveCoupon = async () => {
        await removeCoupon();
        setCouponCode('');
        const state = shipToDifferentAddress ? shippingAddress.state : billingAddress.state;
        if (state && selectedShippingMethodId) {
            const response = await axios.post('/checkout/calculate', {
                state: state,
                shipping_method_id: selectedShippingMethodId,
                payment_method: paymentMethod
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

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setIsLoggingIn(true);
        try {
            const response = await axios.post('/login', {
                email: loginEmail,
                password: loginPassword,
            });

            if (response.data.user.role !== 'customer') {
                setLoginError('Only customers can place orders. Please log in with a customer account.');
                return;
            }

            // Update Auth Context & Cookie
            login(response.data.access_token, response.data.user);
            showToast('Welcome back! Logged in successfully.', 'success');

            // Prefetch/Init checkout for the logged in user
            setIsPageLoading(true);
            const initiateResponse = await axios.get('/checkout/initiate');
            const initiateData = initiateResponse.data;

            setCheckoutSummary(initiateData.summary);

            // Re-apply settings
            let defaultPayment = '';
            if (publicSettings) {
                if (publicSettings.cod_enabled) {
                    defaultPayment = 'cod';
                } else if (publicSettings.razorpay_enabled) {
                    defaultPayment = 'razorpay';
                } else if (publicSettings.stripe_enabled) {
                    defaultPayment = 'stripe';
                } else if (publicSettings.payu_enabled) {
                    defaultPayment = 'payu';
                } else if (publicSettings.phonepe_enabled) {
                    defaultPayment = 'phonepe';
                }
            }
            setPaymentMethod(defaultPayment || 'cod');

            if (initiateData.shipping_methods) {
                setShippingMethods(initiateData.shipping_methods);
                if (initiateData.shipping_methods.length > 0) {
                    const standardMethod = initiateData.shipping_methods.find((m: any) => m.name === 'Standard Delivery');
                    if (standardMethod) {
                        setSelectedShippingMethodId(standardMethod.id);
                    } else {
                        setSelectedShippingMethodId(initiateData.shipping_methods[0].id);
                    }
                }
            }

            if (initiateData.addresses && initiateData.addresses.length > 0) {
                const mappedAddresses = initiateData.addresses.map((addr: any) => ({
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
                    email: response.data.user.email || ''
                }));
                setSavedAddresses(mappedAddresses);
                const defaultAddr = initiateData.addresses.find((a: any) => a.is_default);
                const mappedDefault = defaultAddr ? mappedAddresses.find((a: any) => a.id === defaultAddr.id) : null;
                setBillingAddress(mappedDefault || mappedAddresses[0]);
                setShowAddressForm(false);
            } else {
                setSavedAddresses([]);
                setBillingAddress(initialAddress);
                setShowAddressForm(true);
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            setLoginError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoggingIn(false);
            setIsPageLoading(false);
        }
    };

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!loginId.trim()) {
            setLoginError('Please enter email address or phone number.');
            return;
        }
        setLoginError('');
        setIsLoggingIn(true);
        try {
            const response = await axios.post('/auth/send-otp', {
                login_id: loginId,
            });

            if (response.data.action === 'register_required') {
                setLoginError(response.data.message || 'This email or phone number is not registered. Please create an account first.');
                return;
            }

            if (response.data.error) {
                setLoginError(response.data.message || 'Failed to send OTP.');
                return;
            }

            setOtpSent(true);
            setOtpTimer(30);
            showToast('OTP sent successfully!', 'success');

            if (response.data.dev_otp) {
                console.log('DEV OTP:', response.data.dev_otp);
                showToast(`[Dev Mode] OTP is ${response.data.dev_otp}`, 'info');
            }
        } catch (err: any) {
            console.error('Failed to send OTP:', err);
            setLoginError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode.trim() || otpCode.length !== 4) {
            setLoginError('Please enter a valid 4-digit OTP.');
            return;
        }
        setLoginError('');
        setIsLoggingIn(true);
        try {
            const response = await axios.post('/auth/verify-otp', {
                login_id: loginId,
                otp: otpCode,
            });

            if (response.data.action === 'register_required') {
                setLoginError(response.data.message || 'Identity verified. Please complete registration.');
                return;
            }

            if (response.data.user.role !== 'customer') {
                setLoginError('Only customers can place orders. Please log in with a customer account.');
                return;
            }

            // Update Auth Context & Cookie
            login(response.data.access_token, response.data.user);
            showToast('Welcome back! Logged in successfully.', 'success');

            // Prefetch/Init checkout for the logged in user
            setIsPageLoading(true);
            const initiateResponse = await axios.get('/checkout/initiate');
            const initiateData = initiateResponse.data;

            setCheckoutSummary(initiateData.summary);

            // Re-apply settings
            let defaultPayment = '';
            if (publicSettings) {
                if (publicSettings.cod_enabled) {
                    defaultPayment = 'cod';
                } else if (publicSettings.razorpay_enabled) {
                    defaultPayment = 'razorpay';
                } else if (publicSettings.stripe_enabled) {
                    defaultPayment = 'stripe';
                } else if (publicSettings.payu_enabled) {
                    defaultPayment = 'payu';
                } else if (publicSettings.phonepe_enabled) {
                    defaultPayment = 'phonepe';
                }
            }
            setPaymentMethod(defaultPayment || 'cod');

            if (initiateData.shipping_methods) {
                setShippingMethods(initiateData.shipping_methods);
                if (initiateData.shipping_methods.length > 0) {
                    const standardMethod = initiateData.shipping_methods.find((m: any) => m.name === 'Standard Delivery');
                    if (standardMethod) {
                        setSelectedShippingMethodId(standardMethod.id);
                    } else {
                        setSelectedShippingMethodId(initiateData.shipping_methods[0].id);
                    }
                }
            }

            if (initiateData.addresses && initiateData.addresses.length > 0) {
                const mappedAddresses = initiateData.addresses.map((addr: any) => ({
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
                    email: response.data.user.email || ''
                }));
                setSavedAddresses(mappedAddresses);
                const defaultAddr = initiateData.addresses.find((a: any) => a.is_default);
                const mappedDefault = defaultAddr ? mappedAddresses.find((a: any) => a.id === defaultAddr.id) : null;
                setBillingAddress(mappedDefault || mappedAddresses[0]);
                setShowAddressForm(false);
            } else {
                setSavedAddresses([]);
                setBillingAddress(initialAddress);
                setShowAddressForm(true);
            }
        } catch (err: any) {
            console.error('OTP verification failed:', err);
            setLoginError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setIsLoggingIn(false);
            setIsPageLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsPageLoading(true);
        try {
            await logout(true); // Call logout with skipRedirect = true
            // Also reset checkout state variables to default
            setBillingAddress(initialAddress);
            setShippingAddress(initialAddress);
            setSavedAddresses([]);
            setCheckoutSummary(null);
            setLoginId('');
            setOtpCode('');
            setOtpSent(false);
            setOtpTimer(0);
            showToast('Logged out successfully.', 'success');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsPageLoading(false);
        }
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
                create_account: createAccount,
                save_address: user && (showAddressForm || savedAddresses.length === 0) && saveAddressToBook,
                shipping_method_id: selectedShippingMethodId
            };

            const response = await axios.post('/orders', orderData);

            if (response.status === 201) {
                clearCart();
                if (onClose) onClose();
                router.push(`/order-success?order_id=${response.data.order_id}`);
            }
        } catch (error: any) {
            console.error('Order placement failed:', error);
            showToast(error.response?.data?.message || 'Failed to place order', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const activeShippingMethod = shippingMethods.find(m => m.id === selectedShippingMethodId);

    // Inline Login Form JSX
    const loginContent = (
        <div className="flex-1 flex flex-col justify-center px-5 py-8 space-y-5 select-none bg-white dark:bg-gray-900">
            <div className="text-center space-y-1">
                <h3 className="text-sm font-black tracking-tight text-gray-900 dark:text-white uppercase">
                    Sign In to Checkout
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed max-w-[280px] mx-auto">
                    Please log in to your customer account to complete your purchase.
                </p>
            </div>

            {/* Toggle tabs for Password vs OTP login */}
            <div className="grid grid-cols-2 p-1 bg-gray-55/60 dark:bg-gray-955/60 rounded-xl border border-gray-105 dark:border-gray-805">
                <button
                    type="button"
                    onClick={() => {
                        setLoginMethod('password');
                        setLoginError('');
                    }}
                    className={`py-1.5 text-[10.5px] font-extrabold rounded-lg transition-all ${
                        loginMethod === 'password'
                            ? 'bg-white dark:bg-gray-850 text-green-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    Password Login
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setLoginMethod('otp');
                        setLoginError('');
                    }}
                    className={`py-1.5 text-[10.5px] font-extrabold rounded-lg transition-all ${
                        loginMethod === 'otp'
                            ? 'bg-white dark:bg-gray-850 text-green-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    OTP Login
                </button>
            </div>

            {loginMethod === 'password' ? (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={14} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full rounded-xl border border-gray-205 dark:border-gray-805 bg-gray-50/50 dark:bg-gray-955/40 text-gray-905 dark:text-white py-2 pl-9 pr-3 placeholder:text-gray-400 text-xs font-bold focus:outline-none focus:border-green-600 focus:ring-0 transition-all"
                                    placeholder="you@example.com"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold uppercase text-gray-400">Password</label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={14} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full rounded-xl border border-gray-205 dark:border-gray-805 bg-gray-50/50 dark:bg-gray-955/40 text-gray-905 dark:text-white py-2 pl-9 pr-9 placeholder:text-gray-400 text-xs font-bold focus:outline-none focus:border-green-600 focus:ring-0 transition-all"
                                    placeholder="••••••••"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-605 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {loginError && (
                        <div className="bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-[10.5px] font-bold rounded-xl p-2.5 text-center">
                            {loginError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl shadow-lg shadow-green-600/10 flex items-center justify-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 text-xs"
                    >
                        {isLoggingIn ? (
                            <>
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white mr-1"></div>
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In & Continue
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="space-y-4">
                    {!otpSent ? (
                        <form className="space-y-4" onSubmit={handleSendOtp}>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-gray-400">Mobile or Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Smartphone size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-xl border border-gray-205 dark:border-gray-805 bg-gray-50/50 dark:bg-gray-955/40 text-gray-905 dark:text-white py-2 pl-9 pr-3 placeholder:text-gray-400 text-xs font-bold focus:outline-none focus:border-green-600 focus:ring-0 transition-all"
                                        placeholder="you@example.com or +919999999999"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-[10.5px] font-bold rounded-xl p-2.5 text-center">
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl shadow-lg shadow-green-600/10 flex items-center justify-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 text-xs"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white mr-1"></div>
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleVerifyOtp}>
                            <div className="bg-green-50/55 dark:bg-green-955/10 border border-green-100 dark:border-green-950/40 rounded-xl p-2.5 flex items-center justify-between text-left">
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] text-gray-400 font-bold block uppercase leading-none mb-0.5">OTP Sent To</span>
                                    <span className="text-[11px] font-extrabold text-gray-800 dark:text-gray-200 block truncate">{loginId}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpSent(false);
                                        setLoginError('');
                                    }}
                                    className="text-[10px] font-extrabold text-green-600 hover:text-green-700 underline pl-2 whitespace-nowrap"
                                >
                                    Change
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-gray-400">Enter 4-Digit OTP</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Key size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength={4}
                                        className="block w-full rounded-xl border border-gray-205 dark:border-gray-805 bg-gray-50/50 dark:bg-gray-955/40 text-gray-905 dark:text-white py-2 pl-9 pr-3 placeholder:text-gray-400 text-xs font-bold tracking-[0.4em] focus:outline-none focus:border-green-600 focus:ring-0 transition-all"
                                        placeholder="••••"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="bg-red-50 dark:bg-red-955/30 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 text-[10.5px] font-bold rounded-xl p-2.5 text-center">
                                    {loginError}
                                </div>
                            )}

                            <div className="flex justify-between items-center text-[10.5px] font-bold">
                                <span className="text-gray-400">Didn't receive OTP?</span>
                                {otpTimer > 0 ? (
                                    <span className="text-gray-450">Resend in {otpTimer}s</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleSendOtp()}
                                        className="text-green-600 hover:text-green-700 underline"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl shadow-lg shadow-green-600/10 flex items-center justify-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 text-xs"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-white mr-1"></div>
                                        Verifying OTP...
                                    </>
                                ) : (
                                    <>
                                        Verify & Continue
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            )}

            <div className="text-center pt-2.5 border-t border-gray-100 dark:border-gray-850">
                <span className="text-[10px] font-bold text-gray-400">
                    New to Cureza?{' '}
                    <Link
                        href="/register?redirect=/checkout"
                        className="text-green-600 hover:text-green-700 underline"
                        onClick={() => {
                            if (onClose) onClose();
                        }}
                    >
                        Create an account
                    </Link>
                </span>
            </div>
        </div>
    );

    // Render inner content of the checkout card
    const cardContent = (
        <div className="relative flex flex-col h-full bg-white dark:bg-gray-900 rounded-[28px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-2xl">
            {/* Announcement Banner */}
            <div className="w-full bg-[#020202] text-white text-center py-2 text-[10px] tracking-wider font-extrabold uppercase flex items-center justify-center gap-1.5 leading-none">
                <span>⚡ Limited Offer: Free Shipping on all orders above ₹500!</span>
            </div>

            {/* Premium Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-850">
                <div className="flex items-center gap-2">
                    {onClose ? (
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                            <X size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    ) : (
                        <button onClick={() => router.push('/cart')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                            <ArrowLeft size={18} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    )}
                    <span className="text-lg font-black text-green-600 tracking-wider uppercase">CUREZA</span>
                </div>
                {user && (
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block leading-none mb-1">Payable Amount</span>
                        <div className="flex items-center gap-1.5 justify-end">
                            {isPageLoading ? (
                                <div className="h-4 bg-gray-105 dark:bg-gray-800 rounded w-12 animate-pulse"></div>
                            ) : (
                                <>
                                    {checkoutSummary?.discount > 0 && (
                                        <span className="text-[11px] line-through text-gray-405 font-medium">₹{(Number(checkoutSummary.final_total) + Number(checkoutSummary.discount)).toFixed(2)}</span>
                                    )}
                                    <span className="text-sm font-black text-gray-900 dark:text-white">₹{Number(checkoutSummary?.final_total || 0).toFixed(2)}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isPageLoading ? (
                /* Beautiful Loading Skeleton for card body */
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 animate-pulse bg-white dark:bg-gray-900">
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-955/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-150 dark:bg-gray-800/80 rounded-xl w-full"></div>
                    </div>
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-955/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 space-y-3">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-150 dark:bg-gray-800/80 rounded-xl w-full"></div>
                        <div className="h-10 bg-gray-150 dark:bg-gray-800/80 rounded-xl w-full"></div>
                    </div>
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-955/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-150 dark:bg-gray-800/80 rounded-xl w-full"></div>
                    </div>
                </div>
            ) : !user ? (
                /* Login Form */
                loginContent
            ) : !checkoutSummary ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-red-500 font-bold">
                    Failed to initialize checkout. Please try again.
                </div>
            ) : (
                /* Scrollable Container */
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">

                    {/* 1. Order Summary Collapsible Accordion */}
                    <div className="bg-gray-50/50 dark:bg-gray-950/40 rounded-2xl border border-gray-200/60 dark:border-gray-800/80 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                            className="w-full px-4 py-3 flex items-center justify-between font-bold text-[12px] text-gray-800 dark:text-gray-200 hover:bg-gray-55 transition outline-none"
                        >
                            <span className="flex items-center gap-2">
                                🛒 Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                            </span>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <span className="text-[11px]">₹{Number(checkoutSummary.final_total).toFixed(2)}</span>
                                {isOrderSummaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                        </button>

                        {isOrderSummaryOpen && (
                            <div className="px-4 pb-4 pt-1 border-t border-dashed border-gray-200 dark:border-gray-800 space-y-3">
                                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                    {cartItems.map((item: any) => (
                                        <div key={item.id} className="flex justify-between gap-3 text-xs leading-tight">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-extrabold text-gray-800 dark:text-gray-200 block truncate">{item.title}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity} × ₹{item.price}</span>
                                            </div>
                                            <span className="font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                                    <table className="w-full text-left border-collapse text-[10.5px]">
                                        <tbody>
                                            <tr className="border-b border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-950/20">
                                                <td className="p-2 font-medium text-gray-600 dark:text-gray-400">Taxable Value (Base Price)</td>
                                                <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">₹{(Number(checkoutSummary.subtotal || 0) - Number(checkoutSummary.total_tax || 0)).toFixed(2)}</td>
                                            </tr>
                                            {Number(checkoutSummary.discount || 0) > 0 && (
                                                <tr className="border-b border-gray-150 dark:border-gray-850">
                                                    <td className="p-2 font-medium text-green-600 dark:text-green-400 font-bold">Coupon/Promo Discount</td>
                                                    <td className="p-2 text-right font-bold text-green-600 dark:text-green-400">-₹{Number(checkoutSummary.discount).toFixed(2)}</td>
                                                </tr>
                                            )}
                                            {Number(checkoutSummary.milestone_discount || 0) > 0 && (
                                                <tr className="border-b border-gray-150 dark:border-gray-850">
                                                    <td className="p-2 font-medium text-green-600 dark:text-green-400 font-bold">Milestone Reward Discount</td>
                                                    <td className="p-2 text-right font-bold text-green-600 dark:text-green-400">-₹{Number(checkoutSummary.milestone_discount).toFixed(2)}</td>
                                                </tr>
                                            )}
                                            {Number(checkoutSummary.wallet_deduction || 0) > 0 && (
                                                <tr className="border-b border-gray-150 dark:border-gray-850">
                                                    <td className="p-2 font-medium text-orange-600 dark:text-orange-400 font-bold">Wallet Coins Applied</td>
                                                    <td className="p-2 text-right font-bold text-orange-600 dark:text-orange-400">-₹{Number(checkoutSummary.wallet_deduction).toFixed(2)}</td>
                                                </tr>
                                            )}
                                            <tr className="border-b border-gray-150 dark:border-gray-850">
                                                <td className="p-2 font-medium text-gray-600 dark:text-gray-400">
                                                    {getTaxLabel()}
                                                </td>
                                                <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">₹{Number(checkoutSummary.total_tax || 0).toFixed(2)}</td>
                                            </tr>
                                            {Number(checkoutSummary.platform_fee || 0) > 0 && (
                                                <tr className="border-b border-gray-150 dark:border-gray-850">
                                                    <td className="p-2 font-medium text-gray-600 dark:text-gray-400">Convenience Fee</td>
                                                    <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">₹{Number(checkoutSummary.platform_fee).toFixed(2)}</td>
                                                </tr>
                                            )}
                                            <tr className="border-b border-gray-150 dark:border-gray-850">
                                                <td className="p-2 font-medium text-gray-600 dark:text-gray-400">Delivery Charge</td>
                                                <td className="p-2 text-right font-semibold text-gray-900 dark:text-white">
                                                    {Number(checkoutSummary.shipping_cost || 0) === 0 ? 'FREE' : `₹${Number(checkoutSummary.shipping_cost).toFixed(2)}`}
                                                </td>
                                            </tr>
                                            <tr className="bg-gray-55/50 dark:bg-gray-950/40">
                                                <td className="p-2 font-bold text-gray-900 dark:text-white">Total Price (Inclusive of all taxes)</td>
                                                <td className="p-2 text-right font-black text-gray-900 dark:text-white">₹{Number(checkoutSummary.final_total || checkoutSummary.total || 0).toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Delivery Address panel */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-255 dark:border-gray-800 p-4 space-y-3.5 relative">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin size={12} className="text-green-600 animate-pulse" /> 1. Delivery Details
                            </span>
                            {savedAddresses.length > 0 && !showAddressForm && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(true)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-700 transition"
                                >
                                    <Edit2 size={10} /> Edit / Change
                                </button>
                            )}
                        </div>

                        {savedAddresses.length > 0 && !showAddressForm ? (
                            <div className="bg-gray-50/50 dark:bg-gray-950/20 p-3 rounded-xl border border-gray-105 dark:border-gray-800/80">
                                <div className="font-extrabold text-xs text-gray-800 dark:text-gray-200">
                                    {billingAddress.first_name} {billingAddress.last_name}
                                </div>
                                <div className="text-[11px] text-gray-550 dark:text-gray-400 mt-1 leading-relaxed">
                                    {billingAddress.street_address}, {billingAddress.apartment && `${billingAddress.apartment}, `}
                                    {billingAddress.city}, {billingAddress.state} - {billingAddress.postcode}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-2 font-bold">{billingAddress.phone}</div>
                            </div>
                        ) : (
                            <div className="space-y-3 animate-fadeIn">
                                {/* Saved Address list trigger if we have any */}
                                {savedAddresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressForm(false)}
                                        className="w-full text-center py-2 border border-dashed border-gray-300 rounded-xl text-[10.5px] font-bold text-gray-500 hover:bg-gray-50 transition"
                                    >
                                        ← Choose from saved addresses
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">First name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full rounded-xl border-gray-250 dark:border-gray-800 text-xs px-3 py-2 bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
                                            value={billingAddress.first_name}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Last name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full rounded-xl border-gray-255 dark:border-gray-800 text-xs px-3 py-2 bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
                                            value={billingAddress.last_name}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Street Address *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="House number, building name, street"
                                            className="w-full rounded-xl border-gray-255 dark:border-gray-805 text-xs px-3 py-2 bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
                                            value={billingAddress.street_address}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, street_address: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">State *</label>
                                        <select
                                            className="w-full rounded-xl border-gray-255 dark:border-gray-805 text-xs px-3 py-2 bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
                                            value={billingAddress.state}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value, city: '' })}
                                        >
                                            <option value="">Select State</option>
                                            {Object.keys(indianLocations).map((state) => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">City *</label>
                                        <select
                                            required
                                            className="w-full rounded-xl border-gray-255 dark:border-gray-805 text-xs px-3 py-2 bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
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
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">PIN Code *</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            className="w-full rounded-xl border-gray-255 dark:border-gray-805 text-xs px-3 py-2 bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
                                            value={billingAddress.postcode}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, postcode: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full rounded-xl border-gray-255 dark:border-gray-805 text-xs px-3 py-2 bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
                                            value={billingAddress.phone}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full rounded-xl border-gray-255 dark:border-gray-805 text-xs px-3 py-2 bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
                                            value={billingAddress.email}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delivery Timeline information strip */}
                        <div className="w-full bg-[#E8F8EE] dark:bg-green-955/20 text-[#1B922E] dark:text-green-400 rounded-xl px-3 py-2 text-[10.5px] font-bold flex items-center gap-1.5 border border-green-100/60 dark:border-green-950/40">
                            <span>🚚</span>
                            <span>Delivering to your location in 3-5 working days!</span>
                        </div>
                    </div>

                    {/* 3. Shipping Options Collapsible Accordion */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-255 dark:border-gray-800 overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setIsShippingExpanded(!isShippingExpanded)}
                            className="w-full p-4 flex items-center justify-between font-black text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:bg-gray-55 dark:hover:bg-gray-955/30 transition outline-none"
                        >
                            <span className="flex items-center gap-1.5">
                                ⚡ 2. Shipping: {activeShippingMethod ? (activeShippingMethod.name === 'Standard Delivery' ? 'shipping' : activeShippingMethod.name) : ''}
                            </span>
                            <div className="flex items-center gap-1 text-green-600">
                                <span className="text-[10.5px] font-bold">
                                    {activeShippingMethod ? (Number(activeShippingMethod.cost) === 0 ? 'free' : `₹${activeShippingMethod.cost}`) : ''}
                                </span>
                                {isShippingExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </div>
                        </button>

                        {isShippingExpanded && (
                            <div className="px-4 pb-4 space-y-2.5 border-t border-gray-100 dark:border-gray-850 pt-3">
                                {shippingMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer hover:border-green-600 transition ${
                                            selectedShippingMethodId === method.id
                                                ? 'border-green-600 bg-green-50/10'
                                                : 'border-gray-205 dark:border-gray-805'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value={method.id}
                                                checked={selectedShippingMethodId === method.id}
                                                onChange={() => setSelectedShippingMethodId(method.id)}
                                                className="w-3.5 h-3.5 text-green-600 focus:ring-green-600 focus:ring-0"
                                            />
                                            <div className="text-left">
                                                <span className="font-extrabold text-xs text-gray-805 dark:text-gray-202 block">
                                                    {method.name === 'Standard Delivery' ? 'shipping' : method.name}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-semibold">{method.estimated_days}</span>
                                            </div>
                                        </div>
                                        <span className="font-black text-xs text-gray-800 dark:text-gray-200">
                                            {Number(method.cost) === 0 ? 'free' : `₹${method.cost}`}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Coupons & Coins Section */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-255 dark:border-gray-800 p-4 space-y-4">
                        <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none">
                            🎟️ 3. Offers & Rewards
                        </span>

                        {/* Cureza Coins Cashback Banner */}
                        <div className="w-full border border-dashed border-orange-500 bg-orange-50/35 dark:bg-orange-955/10 rounded-2xl p-3 flex items-center justify-between text-left">
                            <div>
                                <span className="font-extrabold text-[11.5px] text-gray-850 dark:text-gray-105 block">Earn Cureza Coins 🪙</span>
                                <span className="text-[9.5px] text-gray-550 font-semibold block mt-0.5">Get 5% coins cashback on completing this purchase!</span>
                            </div>
                            <span className="bg-orange-500 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shadow-sm shadow-orange-500/10 animate-bounce">
                                +₹{((Number(checkoutSummary.subtotal) || 0) * 0.05).toFixed(0)} Cashback
                            </span>
                        </div>

                        {/* Coupon Input */}
                        {publicSettings?.cart_drawer_enable_coupons !== false && (
                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                                <label className="block text-[10.5px] font-bold text-gray-500 uppercase">Apply Promo Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="COUPON100"
                                        className="flex-1 rounded-xl border-gray-255 dark:border-gray-800 text-xs px-3 py-2 uppercase bg-white dark:bg-gray-955 font-bold focus:border-green-600 focus:ring-0"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!checkoutSummary.coupon_applied}
                                    />
                                    {checkoutSummary.coupon_applied ? (
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={isApplyingCoupon || !couponCode}
                                            className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold disabled:opacity-50 transition"
                                        >
                                            {isApplyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                {checkoutSummary.coupon_applied && (
                                    <p className="text-[10px] text-green-600 font-bold">
                                        ✓ Coupon "{checkoutSummary.coupon_applied}" applied successfully!
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 5. Payment Methods Selection */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-255 dark:border-gray-800 p-4 space-y-3">
                        <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block leading-none">
                            💳 4. Choose Payment Method
                        </span>

                        <div className="space-y-2.5">
                            {(() => {
                                const paymentOptions = [
                                    {
                                        id: 'cod',
                                        title: 'Cash on Delivery',
                                        enabled: publicSettings?.cod_enabled,
                                        description: 'Pay with cash upon delivery.',
                                        icon: <Truck className="text-green-600 w-4 h-4" />
                                    },
                                    {
                                        id: 'razorpay',
                                        title: 'Razorpay Secure',
                                        enabled: publicSettings?.razorpay_enabled,
                                        description: 'Pay securely using UPI, Card, Netbanking.',
                                        logo: 'https://cdn.razorpay.com/static/assets/logo/payment.svg'
                                    },
                                    {
                                        id: 'stripe',
                                        title: 'Credit / Debit Card (Stripe)',
                                        enabled: publicSettings?.stripe_enabled,
                                        description: 'Pay with International Cards securely through Stripe.',
                                        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_blue.svg'
                                    },
                                    {
                                        id: 'payu',
                                        title: 'PayU Secure',
                                        enabled: publicSettings?.payu_enabled,
                                        description: 'Pay securely using PayU (UPI, Cards, Netbanking).',
                                        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/PayU.svg'
                                    },
                                    {
                                        id: 'phonepe',
                                        title: 'PhonePe Secure',
                                        enabled: publicSettings?.phonepe_enabled,
                                        description: 'Pay securely using PhonePe (UPI, Cards, Netbanking).',
                                        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/PhonePe_Logo.svg'
                                    }
                                ];

                                const activePaymentOptions = paymentOptions.filter(opt => opt.enabled);

                                if (activePaymentOptions.length === 0) {
                                    return (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-xs font-bold">
                                            No active payment methods configured.
                                        </div>
                                    );
                                }

                                return activePaymentOptions.map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-start p-3 border-2 rounded-xl cursor-pointer hover:border-green-600 transition ${
                                            paymentMethod === opt.id
                                                ? 'border-green-600 bg-green-50/10'
                                                : 'border-gray-205 dark:border-gray-805'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={opt.id}
                                            checked={paymentMethod === opt.id}
                                            onChange={() => setPaymentMethod(opt.id)}
                                            className="mt-0.5 w-3.5 h-3.5 text-green-600 focus:ring-0"
                                        />
                                        <div className="ml-3 flex-1 text-left min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-extrabold text-xs text-gray-808 dark:text-gray-202">{opt.title}</span>
                                                {opt.logo ? (
                                                    <img src={opt.logo} alt={opt.title} className="h-4 object-contain max-w-[65px]" />
                                                ) : (
                                                    opt.icon
                                                )}
                                            </div>
                                            {paymentMethod === opt.id && (
                                                <p className="text-[10px] text-gray-400 mt-1 leading-normal border-t border-gray-105/10 pt-1">
                                                    {opt.description}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                ));
                            })()}
                        </div>
                    </div>

                </div>
            )}

            {/* Sticky Action Pay Button Footer */}
            {user && (
                <div className="px-5 py-4 border-t border-gray-150 dark:border-gray-850 bg-white dark:bg-gray-900 sticky bottom-0 z-10 space-y-2">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isPageLoading || isLoading || !selectedShippingMethodId || !paymentMethod}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-xl shadow-green-600/10 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 text-[13px]"
                    >
                        {isPageLoading ? (
                            <div className="animate-spin rounded-full h-4.5 w-4.5 border-t-2 border-b-2 border-white"></div>
                        ) : isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4.5 w-4.5 border-t-2 border-b-2 border-white mr-1"></div>
                                Placing Order...
                            </>
                        ) : (
                            <>
                                Pay Securely & Place Order <Lock size={14} className="animate-pulse" />
                            </>
                        )}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[9.5px] font-bold text-gray-400">
                        <ShieldCheck size={12} className="text-green-600" />
                        <span>{publicSettings?.checkout_secure_badge_text || '100% Safe & Secure Checkout'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-500 font-semibold mt-1">
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] uppercase tracking-wider text-gray-450 font-bold">Logged in as</span>
                            <span className="truncate max-w-[190px] font-extrabold text-gray-700 dark:text-gray-300">
                                {user.email} {user.phone ? `(${user.phone})` : ''}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="px-2.5 py-1 text-red-650 hover:text-white hover:bg-red-650 border border-red-200 dark:border-red-900/40 rounded-lg hover:border-red-600 transition text-[9.5px] font-extrabold"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-[6px] z-[99999] flex items-center justify-center p-4">
                <div className="w-full max-w-[420px] h-[90vh] max-h-[720px] select-none rounded-[28px] overflow-hidden shadow-2xl relative bg-white dark:bg-gray-900 animate-scaleUp">
                    {cardContent}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[420px] select-none rounded-[28px] overflow-hidden bg-white dark:bg-gray-900 mx-auto">
            {cardContent}
        </div>
    );
}
