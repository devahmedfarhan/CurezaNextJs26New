'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Truck, MapPin, ChevronDown, ChevronUp, Plus, Lock, ArrowLeft, Tag, X, Edit2, ShieldCheck, Mail, Eye, EyeOff, Smartphone, Key, Zap, ShoppingCart, Coins } from 'lucide-react';
import axios from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/context/AuthContext';
import { indianLocations } from '@/data/indianLocations';
import Link from 'next/link';

const formatCapitalize = (text: string) => {
    if (!text) return '';
    return text.replace(/[a-zA-Z]+/g, (match) => {
        const upper = match.toUpperCase();
        if (['CGST', 'SGST', 'IGST', 'UPI', 'ID', 'GST'].includes(upper)) {
            return upper;
        }
        if (['GPAY', 'RUPAY', 'VISA', 'MASTERCARD'].includes(upper)) {
            if (upper === 'GPAY') return 'GPay';
            if (upper === 'RUPAY') return 'RuPay';
            if (upper === 'VISA') return 'Visa';
            if (upper === 'MASTERCARD') return 'Mastercard';
        }
        return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
    });
};

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
    const [isInitialized, setIsInitialized] = useState(false);

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
            if (isInitialized) return;
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
                setIsInitialized(true);
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
    }, [router, showToast, user, onClose, prefetchedData, prefetchedSettings, isInitialized]);

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
            setIsInitialized(true);
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
            setIsInitialized(true);
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
            setIsInitialized(false);
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
        <div className="flex-1 flex flex-col justify-center px-5 py-8 space-y-5 select-none bg-[#F2F2F2] dark:bg-[#031416]">
            <div className="text-center space-y-1">
                <h3 className="text-sm font-bold tracking-tight text-[#052326] dark:text-[#EDE8E1] capitalize">
                    Sign In to Checkout
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed max-w-[280px] mx-auto capitalize">
                    Please log in to your customer account to complete your purchase.
                </p>
            </div>

            {/* Toggle tabs for Password vs OTP login */}
            <div className="grid grid-cols-2 p-1 bg-[#052326]/5 dark:bg-white/5 rounded-[12px] border border-[#052326]/10 dark:border-white/10">
                <button
                    type="button"
                    onClick={() => {
                        setLoginMethod('password');
                        setLoginError('');
                    }}
                    className={`py-1.5 text-[10.5px] font-bold rounded-[12px] transition-all ${
                        loginMethod === 'password'
                            ? 'bg-white dark:bg-[#052326]/40 text-[#052326] dark:text-[#EDE8E1] border border-[#052326]/10 dark:border-white/5 shadow-sm'
                            : 'text-gray-550 hover:text-[#052326] dark:text-gray-400 dark:hover:text-[#EDE8E1]'
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
                    className={`py-1.5 text-[10.5px] font-bold rounded-[12px] transition-all ${
                        loginMethod === 'otp'
                            ? 'bg-white dark:bg-[#052326]/40 text-[#052326] dark:text-[#EDE8E1] border border-[#052326]/10 dark:border-white/5 shadow-sm'
                            : 'text-gray-550 hover:text-[#052326] dark:text-gray-400 dark:hover:text-[#EDE8E1]'
                    }`}
                >
                    OTP Login
                </button>
            </div>

            {loginMethod === 'password' ? (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    <div className="space-y-3">
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold capitalize text-gray-400">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={14} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full rounded-[12px] border border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 pl-9 pr-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                    placeholder="you@example.com"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1 text-left">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold capitalize text-gray-400">Password</label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={14} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="block w-full rounded-[12px] border border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 pl-9 pr-9 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
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
                        <div className="bg-red-55/10 border border-red-200/50 text-red-600 dark:text-red-400 text-[10.5px] font-bold rounded-[12px] p-2.5 text-center">
                            {loginError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-3 bg-[#052326] hover:bg-[#052326]/90 dark:bg-[#EDE8E1] dark:hover:bg-[#EDE8E1]/90 text-[#F8F3EF] dark:text-[#052326] font-bold rounded-[12px] shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50 text-xs capitalize"
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
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-bold capitalize text-gray-400">Mobile or Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Smartphone size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-[12px] border border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 pl-9 pr-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                        placeholder="you@example.com or +919999999999"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="bg-red-55/10 border border-red-200/50 text-red-600 dark:text-red-400 text-[10.5px] font-bold rounded-[12px] p-2.5 text-center">
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full py-3 bg-[#052326] hover:bg-[#052326]/90 dark:bg-[#EDE8E1] dark:hover:bg-[#EDE8E1]/90 text-[#F8F3EF] dark:text-[#052326] font-bold rounded-[12px] shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50 text-xs capitalize"
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
                            <div className="bg-[#F0C417]/5 dark:bg-[#F0C417]/10 border border-[#F0C417]/20 dark:border-[#F0C417]/10 rounded-[12px] p-2.5 flex items-center justify-between text-left">
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] text-gray-400 font-bold block capitalize leading-none mb-0.5">OTP Sent To</span>
                                    <span className="text-[11px] font-extrabold text-[#052326] dark:text-gray-200 block truncate">{loginId}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpSent(false);
                                        setLoginError('');
                                    }}
                                    className="text-[10px] font-bold text-[#052326] dark:text-[#F0C417] hover:underline pl-2 whitespace-nowrap"
                                >
                                    Change
                                </button>
                            </div>

                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-bold capitalize text-gray-400">Enter 4-Digit OTP</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Key size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength={4}
                                        className="block w-full rounded-[12px] border border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 pl-9 pr-3 placeholder:text-gray-400 text-xs font-semibold tracking-[0.4em] focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                        placeholder="••••"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="bg-red-55/10 border border-red-200/50 text-red-600 dark:text-red-400 text-[10.5px] font-bold rounded-[12px] p-2.5 text-center">
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
                                        className="text-[#052326] dark:text-[#F0C417] hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full py-3 bg-[#052326] hover:bg-[#052326]/90 dark:bg-[#EDE8E1] dark:hover:bg-[#EDE8E1]/90 text-[#F8F3EF] dark:text-[#052326] font-bold rounded-[12px] shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-50 text-xs capitalize"
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

            <div className="text-center pt-2.5 border-t border-[#052326]/10 dark:border-white/10">
                <span className="text-[10px] font-bold text-gray-400">
                    New to Cureza?{' '}
                    <Link
                        href="/register?redirect=/checkout"
                        className="text-[#052326] dark:text-[#F0C417] hover:underline font-bold"
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
        <div className="relative flex flex-col h-full bg-[#F2F2F2] dark:bg-[#031416] rounded-[8px] overflow-hidden border-[0.3px] border-[#00000050] dark:border-white/30">
            {/* Announcement Banner */}
            <div className="w-full bg-[#052326] text-[#EDE8E1] text-center py-2 text-[10px] tracking-wider font-bold capitalize flex items-center justify-center gap-1 leading-none">
                <span className="flex items-center gap-1"><Zap size={10} className="text-[#F0C417] fill-[#F0C417] animate-pulse" /> Limited Offer: Free Shipping on all orders above ₹500!</span>
            </div>

            {/* Premium Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#052326]/10 dark:border-white/10 bg-[#F2F2F2]/90 dark:bg-[#031416]/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                    {onClose ? (
                        <button onClick={onClose} className="p-1.5 hover:bg-[#052326]/5 dark:hover:bg-white/5 rounded-full transition text-[#052326] dark:text-[#EDE8E1]">
                            <X size={18} />
                        </button>
                    ) : (
                        <button onClick={() => router.push('/cart')} className="p-1.5 hover:bg-[#052326]/5 dark:hover:bg-white/5 rounded-full transition text-[#052326] dark:text-[#EDE8E1]">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    {publicSettings?.cart_drawer_logo_url ? (
                        <img src={publicSettings.cart_drawer_logo_url} alt="Logo" className="h-6 w-auto object-contain" />
                    ) : (
                        <img src="/logo-full.svg" alt="Cureza Logo" className="h-6 w-auto object-contain" />
                    )}
                </div>
                {user && (
                    <div className="text-right">
                        <span className="text-[10px] capitalize font-extrabold text-gray-400 tracking-wider block leading-none mb-1">Payable Amount</span>
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
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
                    {/* 1. Order Summary Collapsible Accordion */}
                    <div className="bg-white/85 dark:bg-[#052326]/30 border-[0.3px] border-[#00000050]/30 dark:border-white/20 rounded-[8px] overflow-hidden text-left">
                        <button
                            type="button"
                            onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                            className="w-full px-4 py-3 flex items-center justify-between font-bold text-[12px] text-[#052326] dark:text-[#EDE8E1] hover:bg-[#052326]/5 transition outline-none capitalize"
                        >
                            <span className="flex items-center gap-2">
                                <ShoppingCart size={13} className="text-[#052326] dark:text-[#EDE8E1]" /> Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                            </span>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <span className="text-[11px] font-bold text-[#052326] dark:text-[#EDE8E1]">₹{Number(checkoutSummary.final_total).toFixed(2)}</span>
                                {isOrderSummaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                        </button>

                        {isOrderSummaryOpen && (
                            <div className="px-4 pb-4 pt-1 border-t border-dashed border-[#052326]/10 dark:border-white/5 space-y-3">
                                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                                    {cartItems.map((item: any) => (
                                        <div key={item.id} className="flex justify-between gap-3 text-xs leading-tight">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-extrabold text-[#052326] dark:text-[#EDE8E1] block truncate capitalize">{formatCapitalize(item.title)}</span>
                                                <span className="text-[10px] text-[#052326]/60 dark:text-[#EDE8E1]/60 font-semibold capitalize">Qty: {item.quantity} × ₹{item.price}</span>
                                            </div>
                                            <span className="font-bold text-[#052326] dark:text-white whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 overflow-hidden rounded-[8px] border-[0.3px] border-[#00000050]/20 dark:border-white/10">
                                    <table className="w-full text-left border-collapse text-[10.5px]">
                                        <tbody>
                                            <tr className="border-b border-[#052326]/10 dark:border-white/10 bg-[#F2F2F2]/50 dark:bg-[#052326]/20">
                                                <td className="p-2.5 font-medium text-[#052326]/80 dark:text-[#EDE8E1]/80 capitalize">Taxable Value (Base Price)</td>
                                                <td className="p-2.5 text-right font-bold text-[#052326] dark:text-white">₹{(Number(checkoutSummary.subtotal || 0) - Number(checkoutSummary.total_tax || 0)).toFixed(2)}</td>
                                            </tr>
                                            {Number(checkoutSummary.discount || 0) > 0 && (
                                                <tr className="border-b border-[#052326]/10 dark:border-white/10">
                                                    <td className="p-2.5 font-bold text-[#052326] dark:text-[#F0C417] capitalize">Coupon/Promo Discount</td>
                                                    <td className="p-2.5 text-right font-bold text-[#052326] dark:text-[#F0C417]">-₹{Number(checkoutSummary.discount).toFixed(2)}</td>
                                                </tr>
                                            )}
                                            {Number(checkoutSummary.milestone_discount || 0) > 0 && (
                                                <tr className="border-b border-[#052326]/10 dark:border-white/10">
                                                    <td className="p-2.5 font-bold text-[#052326] dark:text-[#F0C417] capitalize">Milestone Reward Discount</td>
                                                    <td className="p-2.5 text-right font-bold text-[#052326] dark:text-[#F0C417]">-₹{Number(checkoutSummary.milestone_discount).toFixed(2)}</td>
                                                </tr>
                                            )}
                                            {Number(checkoutSummary.wallet_deduction || 0) > 0 && (
                                                <tr className="border-b border-[#052326]/10 dark:border-white/10">
                                                    <td className="p-2.5 font-bold text-orange-600 dark:text-orange-400 capitalize">Wallet Coins Applied</td>
                                                    <td className="p-2.5 text-right font-bold text-orange-600 dark:text-orange-400">-₹{Number(checkoutSummary.wallet_deduction).toFixed(2)}</td>
                                                </tr>
                                            )}
                                            <tr className="border-b border-[#052326]/10 dark:border-white/10">
                                                <td className="p-2.5 font-medium text-[#052326]/80 dark:text-[#EDE8E1]/80 capitalize">
                                                    {formatCapitalize(getTaxLabel())}
                                                </td>
                                                <td className="p-2.5 text-right font-bold text-[#052326] dark:text-white">₹{Number(checkoutSummary.total_tax || 0).toFixed(2)}</td>
                                            </tr>
                                            {Number(checkoutSummary.platform_fee || 0) > 0 && (
                                                <tr className="border-b border-[#052326]/10 dark:border-white/10">
                                                    <td className="p-2.5 font-medium text-[#052326]/80 dark:text-[#EDE8E1]/80 capitalize">Convenience Fee</td>
                                                    <td className="p-2.5 text-right font-bold text-[#052326] dark:text-white">₹{Number(checkoutSummary.platform_fee).toFixed(2)}</td>
                                                </tr>
                                            )}
                                            <tr className="border-b border-[#052326]/10 dark:border-white/10">
                                                <td className="p-2.5 font-medium text-[#052326]/80 dark:text-[#EDE8E1]/80 capitalize">Delivery Charge</td>
                                                <td className="p-2.5 text-right font-bold text-[#052326] dark:text-white">
                                                    {Number(checkoutSummary.shipping_cost || 0) === 0 ? 'FREE' : `₹${Number(checkoutSummary.shipping_cost).toFixed(2)}`}
                                                </td>
                                            </tr>
                                            <tr className="bg-[#F2F2F2] dark:bg-[#052326]/40 border-t border-[#052326]/15 dark:border-white/10">
                                                <td className="p-2.5 font-bold text-[#052326] dark:text-white capitalize">Total Price (Inclusive of all taxes)</td>
                                                <td className="p-2.5 text-right font-black text-[#052326] dark:text-white">₹{Number(checkoutSummary.final_total || checkoutSummary.total || 0).toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Delivery Address panel */}
                    <div className="bg-white/80 dark:bg-[#052326]/30 border-[0.3px] border-[#00000050]/30 dark:border-white/20 rounded-[8px] p-4 space-y-3.5 relative">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-[#052326] dark:text-[#EDE8E1] tracking-wider flex items-center gap-1.5 capitalize">
                                <MapPin size={12} className="text-[#052326] dark:text-[#F0C417] animate-pulse" /> Delivery Details
                            </span>
                            {savedAddresses.length > 0 && !showAddressForm && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(true)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-[#052326] dark:text-[#F0C417] hover:underline transition"
                                >
                                    <Edit2 size={10} /> Edit / Change
                                </button>
                            )}
                        </div>

                        {savedAddresses.length > 0 && !showAddressForm ? (
                            <div className="bg-[#052326]/5 dark:bg-white/5 p-3 rounded-[8px] border-[0.3px] border-[#00000050]/20 dark:border-white/10 text-left">
                                <div className="font-extrabold text-xs text-[#052326] dark:text-[#EDE8E1] capitalize">
                                    {formatCapitalize(billingAddress.first_name)} {formatCapitalize(billingAddress.last_name)}
                                </div>
                                <div className="text-[11px] text-[#052326]/80 dark:text-[#EDE8E1]/80 mt-1 leading-relaxed capitalize">
                                    {formatCapitalize(billingAddress.street_address)}, {billingAddress.apartment && `${formatCapitalize(billingAddress.apartment)}, `}
                                    {formatCapitalize(billingAddress.city)}, {formatCapitalize(billingAddress.state)} - {billingAddress.postcode}
                                </div>
                                <div className="text-[11px] text-[#052326]/60 dark:text-[#EDE8E1]/60 mt-2 font-bold">{billingAddress.phone}</div>
                            </div>
                        ) : (
                            <div className="space-y-3 animate-fadeIn">
                                {/* Saved Address list trigger if we have any */}
                                {savedAddresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressForm(false)}
                                        className="w-full text-center py-2 border border-dashed border-[#052326]/20 rounded-[8px] text-[10.5px] font-bold text-[#052326]/70 hover:bg-[#052326]/5 transition"
                                    >
                                        ← Choose from saved addresses
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-400 capitalize">First name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 px-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                            value={billingAddress.first_name}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-400 capitalize">Last name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 px-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                            value={billingAddress.last_name}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-400 capitalize">Street Address *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="House number, building name, street"
                                            className="block w-full rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 px-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                            value={billingAddress.street_address}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, street_address: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-400 capitalize">State *</label>
                                        <select
                                            className="block w-full rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 px-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                            value={billingAddress.state}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value, city: '' })}
                                        >
                                            <option value="">Select State</option>
                                            {Object.keys(indianLocations).map((state) => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-400 capitalize">City *</label>
                                        <select
                                            required
                                            className="block w-full rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 px-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
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
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-400 capitalize">PIN Code *</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            className="block w-full rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 px-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                            value={billingAddress.postcode}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, postcode: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-400 capitalize">Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            className="block w-full rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 px-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                            value={billingAddress.phone}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1 text-left">
                                        <label className="text-[10px] font-bold text-gray-400 capitalize">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            className="block w-full rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white py-2 px-3 placeholder:text-gray-400 text-xs font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                            value={billingAddress.email}
                                            onChange={(e) => setBillingAddress({ ...billingAddress, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delivery Timeline information strip */}
                        <div className="w-full bg-[#052326]/5 dark:bg-[#F0C417]/10 text-[#052326] dark:text-[#F0C417] rounded-[8px] px-3 py-2 text-[10.5px] font-bold flex items-center gap-1.5 border border-[#052326]/10 dark:border-[#F0C417]/20">
                            <Truck size={14} className="text-[#052326] dark:text-[#F0C417]" />
                            <span>Delivering to your location in 3-5 working days!</span>
                        </div>
                    </div>

                    {/* 3. Shipping Options Collapsible Accordion */}
                    <div className="bg-white/80 dark:bg-[#052326]/30 border-[0.3px] border-[#00000050]/30 dark:border-white/20 rounded-[8px] overflow-hidden text-left">
                        <button
                            type="button"
                            onClick={() => setIsShippingExpanded(!isShippingExpanded)}
                            className="w-full p-4 flex items-center justify-between font-bold text-[11px] text-[#052326] dark:text-[#EDE8E1] hover:bg-[#052326]/5 transition outline-none capitalize tracking-wider"
                        >
                            <span className="flex items-center gap-1.5">
                                <Truck size={13} className="text-[#052326] dark:text-[#EDE8E1]" /> Shipping: {activeShippingMethod ? (activeShippingMethod.name === 'Standard Delivery' ? 'shipping' : activeShippingMethod.name) : ''}
                            </span>
                            <div className="flex items-center gap-1 text-[#052326] dark:text-[#F0C417]">
                                <span className="text-[10.5px] font-bold capitalize">
                                    {activeShippingMethod ? (Number(activeShippingMethod.cost) === 0 ? 'free' : `₹${activeShippingMethod.cost}`) : ''}
                                </span>
                                {isShippingExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </div>
                        </button>

                        {isShippingExpanded && (
                            <div className="px-4 pb-4 space-y-2.5 border-t border-[#052326]/10 dark:border-white/10 pt-3">
                                {shippingMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center justify-between p-3 border-[0.3px] rounded-[8px] cursor-pointer transition ${
                                            selectedShippingMethodId === method.id
                                                ? 'border-[#052326] dark:border-[#F0C417] bg-[#052326]/5 dark:bg-[#F0C417]/5'
                                                : 'border-[#052326]/15 dark:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value={method.id}
                                                checked={selectedShippingMethodId === method.id}
                                                onChange={() => setSelectedShippingMethodId(method.id)}
                                                className="w-3.5 h-3.5 text-[#052326] dark:text-[#F0C417] focus:ring-0 focus:ring-offset-0"
                                            />
                                            <div className="text-left">
                                                <span className="font-extrabold text-xs text-[#052326] dark:text-[#EDE8E1] block capitalize">
                                                    {method.name === 'Standard Delivery' ? 'shipping' : method.name}
                                                </span>
                                                <span className="text-[10px] text-[#052326]/60 dark:text-[#EDE8E1]/60 font-semibold capitalize">{method.estimated_days}</span>
                                            </div>
                                        </div>
                                        <span className="font-black text-xs text-[#052326] dark:text-white capitalize">
                                            {Number(method.cost) === 0 ? 'free' : `₹${method.cost}`}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Coupons & Coins Section */}
                    <div className="bg-white/80 dark:bg-[#052326]/30 border-[0.3px] border-[#00000050]/30 dark:border-white/20 rounded-[8px] p-4 space-y-4">
                        <span className="text-[11px] font-black text-[#052326] dark:text-[#EDE8E1] tracking-wider flex items-center gap-1.5 capitalize">
                            <Tag size={13} className="text-[#052326] dark:text-[#EDE8E1]" /> Offers & Rewards
                        </span>

                        {/* Cureza Coins Cashback Banner */}
                        <div className="w-full border-[0.3px] border-dashed border-[#F0C417] bg-[#F0C417]/5 dark:bg-[#F0C417]/10 rounded-[8px] p-3 flex items-center justify-between text-left">
                            <div>
                                <span className="font-extrabold text-[11.5px] text-[#052326] dark:text-[#EDE8E1] flex items-center gap-1">Earn Cureza Coins <Coins size={13} className="text-[#F0C417]" /></span>
                                <span className="text-[9.5px] text-[#052326]/75 dark:text-[#EDE8E1]/75 font-semibold block mt-0.5 capitalize">Get 5% coins cashback on completing this purchase!</span>
                            </div>
                            <span className="bg-[#052326] text-white dark:bg-[#F0C417] dark:text-[#052326] font-extrabold text-[10px] px-2.5 py-1.5 rounded-[8px] shadow-md shadow-[#052326]/10 dark:shadow-[#F0C417]/10 animate-bounce">
                                +₹{((Number(checkoutSummary.subtotal) || 0) * 0.05).toFixed(0)} Cashback
                            </span>
                        </div>

                        {/* Coupon Input */}
                        {publicSettings?.cart_drawer_enable_coupons !== false && (
                            <div className="space-y-2 pt-2 border-t border-[#052326]/10 dark:border-white/10">
                                <label className="block text-[10.5px] font-bold text-[#052326]/70 dark:text-[#EDE8E1]/70 capitalize">Apply Promo Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="COUPON100"
                                        className="flex-1 rounded-[8px] border-[0.3px] border-[#052326]/15 dark:border-white/10 bg-white dark:bg-[#052326]/20 text-[#052326] dark:text-white text-xs px-3 py-2 uppercase font-semibold focus:outline-none focus:border-[#052326] focus:ring-0 transition-all"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={!!checkoutSummary.coupon_applied}
                                    />
                                    {checkoutSummary.coupon_applied ? (
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-900/30 text-red-600 rounded-[8px] text-xs font-bold transition capitalize"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={isApplyingCoupon || !couponCode}
                                            className="px-4 py-2 bg-[#052326] hover:bg-[#052326]/90 dark:bg-[#EDE8E1] dark:hover:bg-[#EDE8E1]/90 text-white dark:text-[#052326] rounded-[8px] text-xs font-bold disabled:opacity-50 transition capitalize"
                                        >
                                            {isApplyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                {checkoutSummary.coupon_applied && (
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold capitalize">
                                        ✓ Coupon "{checkoutSummary.coupon_applied}" applied successfully!
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 5. Payment Methods Selection */}
                    <div className="bg-white/80 dark:bg-[#052326]/30 border-[0.3px] border-[#00000050]/30 dark:border-white/20 rounded-[8px] p-4 space-y-3">
                        <span className="text-[11px] font-black text-[#052326] dark:text-[#EDE8E1] tracking-wider flex items-center gap-1.5 capitalize">
                            <CreditCard size={13} className="text-[#052326] dark:text-[#EDE8E1]" /> Choose Payment Method
                        </span>

                        <div className="space-y-2.5">
                            {(() => {
                                const paymentOptions = [
                                    {
                                        id: 'cod',
                                        title: 'Cash on Delivery',
                                        enabled: publicSettings?.cod_enabled,
                                        description: 'Pay with cash upon delivery.',
                                        icon: <Truck className="text-[#052326] dark:text-[#F0C417] w-4 h-4" />
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
                                        <div className="bg-red-50 text-red-600 p-3 rounded-[8px] text-center text-xs font-bold capitalize">
                                            No active payment methods configured.
                                        </div>
                                    );
                                }

                                return activePaymentOptions.map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`flex items-start p-3 border-[0.3px] rounded-[8px] cursor-pointer transition ${
                                            paymentMethod === opt.id
                                                ? 'border-[#052326] dark:border-[#F0C417] bg-[#052326]/5 dark:bg-[#F0C417]/5'
                                                : 'border-[#052326]/15 dark:border-white/10'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={opt.id}
                                            checked={paymentMethod === opt.id}
                                            onChange={() => setPaymentMethod(opt.id)}
                                            className="mt-0.5 w-3.5 h-3.5 text-[#052326] dark:text-[#F0C417] focus:ring-0 focus:ring-offset-0 bg-transparent"
                                        />
                                        <div className="ml-3 flex-1 text-left min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-extrabold text-xs text-[#052326] dark:text-[#EDE8E1] capitalize">{opt.title}</span>
                                                {opt.logo ? (
                                                    <img src={opt.logo} alt={opt.title} className="h-4 object-contain max-w-[65px]" />
                                                ) : (
                                                    opt.icon
                                                )}
                                            </div>
                                            {paymentMethod === opt.id && (
                                                <p className="text-[10px] text-[#052326]/60 dark:text-[#EDE8E1]/60 mt-1 leading-normal border-t border-[#052326]/10 dark:border-white/10 pt-1 capitalize">
                                                    {opt.description}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                ));
                            })()}
                        </div>

                        {/* Payment Gateways Tray */}
                        <div className="mt-3.5 pt-3.5 border-t border-[#052326]/10 dark:border-white/10 flex flex-col items-center gap-2">
                            <p className="text-[8.5px] text-[#052326]/50 dark:text-[#EDE8E1]/50 font-extrabold capitalize tracking-wider leading-none">Guaranteed Safe & Secure Checkout</p>
                            <div className="flex items-center justify-center gap-3 opacity-80 hover:opacity-100 transition-opacity duration-200">
                                {/* UPI */}
                                <div className="h-4 px-1.5 py-0.5 bg-white dark:bg-[#031416]/85 rounded border border-[#052326]/10 dark:border-white/5 text-[8px] font-black text-blue-600 tracking-tighter flex items-center justify-center">
                                    UPI
                                </div>
                                {/* Visa */}
                                <svg className="h-3.5 w-auto text-blue-800 dark:text-blue-600" viewBox="0 0 100 32" fill="currentColor">
                                    <path d="M15.2 2.1l-6 19.3h-4L1.7 5.2c-.3-1.1-1-1.5-2.2-1.9L.3 2.1h6.6c.9 0 1.6.6 1.8 1.4L10.3 17 14.1 2.1h4.1v17.2h3.9v-12l3.2 12.1h3.3l4.3-17.2h-3.6z" />
                                    <path d="M42.2 2.1H37c-1.3 0-2.3.7-2.8 1.8l-8 19.6h4.1l.8-2.3h5.1l.5 2.3h3.6L42.2 2.1zm-8.8 15.6l2-5.5.9 2.5 1.1 3H33.4z" />
                                    <path d="M57.6 13c-.2-4.1-5.7-4.3-5.7-6.2 0-.6.6-1.2 1.8-1.4 1.5-.2 2.8.2 3.6.5l.6-2.9c-.8-.3-2.1-.6-3.8-.6-4 0-6.8 2.1-6.8 5.2 0 2.3 2 3.5 3.6 4.3 1.6.8 2.2 1.3 2.2 2-.1 1-1.2 1.4-2.3 1.4-2 0-3.1-.5-4-1l-.6 3c.9.4 2.5.8 4.2.8 4.1.1 6.8-2 6.8-5.1z" />
                                </svg>
                                {/* Mastercard */}
                                <svg className="h-4.5 w-auto" viewBox="0 0 40 32" fill="currentColor">
                                    <circle cx="14" cy="16" r="12" fill="#EB001B" opacity="0.85"/>
                                    <circle cx="26" cy="16" r="12" fill="#F79E1B" opacity="0.85"/>
                                </svg>
                                {/* RuPay */}
                                <div className="h-4 px-1.5 py-0.5 bg-white dark:bg-[#031416]/85 rounded border border-[#052326]/10 dark:border-white/5 text-[8px] font-black text-amber-600 tracking-tight italic flex items-center justify-center">
                                    RuPay
                                </div>
                                {/* GPay */}
                                <div className="h-4 px-1.5 py-0.5 bg-white dark:bg-[#031416]/85 rounded border border-[#052326]/10 dark:border-white/5 text-[8px] font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center leading-none">
                                    <span className="text-blue-500 font-extrabold">G</span>
                                    <span className="text-red-500 font-extrabold">P</span>
                                    <span className="text-yellow-500 font-extrabold">a</span>
                                    <span className="text-green-500 font-extrabold">y</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Sticky Action Pay Button Footer */}
            {user && (
                <div className="px-5 py-4 border-t border-[#052326]/10 dark:border-white/10 bg-[#F2F2F2]/90 dark:bg-[#031416]/90 backdrop-blur-md sticky bottom-0 z-10 space-y-2">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isPageLoading || isLoading || !selectedShippingMethodId || !paymentMethod}
                        className="w-full py-3.5 bg-[#052326] dark:bg-[#EDE8E1] hover:bg-[#052326]/90 dark:hover:bg-[#EDE8E1]/90 text-white dark:text-[#052326] font-bold rounded-[8px] transition-all duration-300 shadow-[0_4px_14px_rgba(5,35,38,0.15)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 transform active:scale-[0.97] hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(240,196,23,0.2)] dark:hover:shadow-[0_4px_14px_rgba(240,196,23,0.35)] border border-[#052326]/10 dark:border-white/10 text-xs capitalize tracking-widest"
                    >
                        {isPageLoading ? (
                            <div className="animate-spin rounded-full h-4.5 w-4.5 border-t-2 border-b-2 border-white"></div>
                        ) : isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4.5 w-4.5 border-t-2 border-b-2 border-[#052326] dark:border-white mr-1"></div>
                                Placing Order...
                            </>
                        ) : (
                            <>
                                Pay Securely & Place Order <Lock size={14} className="animate-pulse" />
                            </>
                        )}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[9.5px] font-bold text-gray-400 capitalize">
                        <ShieldCheck size={12} className="text-[#052326] dark:text-[#F0C417]" />
                        <span>{publicSettings?.checkout_secure_badge_text || '100% Safe & Secure Checkout'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#052326]/10 dark:border-white/10 text-[10px] text-gray-500 font-semibold mt-1">
                        <div className="flex flex-col text-left">
                            <span className="text-[9px] capitalize tracking-wider text-[#052326]/55 dark:text-[#EDE8E1]/55 font-bold">Logged In As</span>
                            <span className="truncate max-w-[190px] font-extrabold text-[#052326]/80 dark:text-[#EDE8E1]/80">
                                {user.email} {user.phone ? `(${user.phone})` : ''}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="px-2.5 py-1 text-red-650 hover:text-white hover:bg-red-650 border border-red-200 dark:border-red-900/40 rounded-[8px] hover:border-red-600 transition text-[9.5px] font-extrabold capitalize"
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
                <div className="w-full max-w-[480px] h-[calc(100vh-40px)] my-[20px] select-none rounded-[8px] overflow-hidden border-[0.3px] border-[#00000050] dark:border-white/30 relative bg-[#F2F2F2] dark:bg-[#031416] animate-scaleUp">
                    {cardContent}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[480px] select-none rounded-[8px] overflow-hidden bg-[#F2F2F2] dark:bg-[#031416] mx-auto border-[0.3px] border-[#00000050] dark:border-white/30">
            {cardContent}
        </div>
    );
}
