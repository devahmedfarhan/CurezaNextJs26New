'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    CreditCard, 
    Key, 
    Save, 
    Loader2, 
    CheckCircle, 
    AlertCircle, 
    Eye, 
    EyeOff,
    Laptop,
    Database
} from 'lucide-react';

export default function AdminPaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // State for WooCommerce-style payment gateways
    const [settings, setSettings] = useState({
        // Razorpay
        razorpay_enabled: '1',
        razorpay_key: '',
        razorpay_secret: '',
        razorpay_webhook_secret: '',

        // Stripe
        stripe_enabled: '0',
        stripe_key: '',
        stripe_secret: '',
        stripe_webhook_secret: '',

        // PayU
        payu_enabled: '0',
        payu_merchant_key: '',
        payu_merchant_salt: '',
        payu_mode: 'sandbox',

        // PhonePe
        phonepe_enabled: '0',
        phonepe_merchant_id: '',
        phonepe_salt_key: '',
        phonepe_salt_index: '1',
        phonepe_mode: 'sandbox',

        // Cash on Delivery
        cod_enabled: '1',
    });

    // Eye toggles for secret fields
    const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
    const [showRazorpayWebhook, setShowRazorpayWebhook] = useState(false);
    const [showStripeSecret, setShowStripeSecret] = useState(false);
    const [showStripeWebhook, setShowStripeWebhook] = useState(false);
    const [showPayuSalt, setShowPayuSalt] = useState(false);
    const [showPhonepeSalt, setShowPhonepeSalt] = useState(false);

    useEffect(() => {
        fetchPaymentSettings();
    }, []);

    const fetchPaymentSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            const data = response.data;

            if (data.payment) {
                const updatedSettings = { ...settings };
                data.payment.forEach((item: any) => {
                    if (item.key in updatedSettings) {
                        (updatedSettings as any)[item.key] = item.value || '';
                    }
                });
                setSettings(updatedSettings);
            }
        } catch (err: any) {
            setErrorMessage('Failed to load payment credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleChange = (key: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: prev[key as keyof typeof prev] === '1' ? '0' : '1'
        }));
    };

    const handleInputChange = (key: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        const settingsArray = Object.keys(settings).map((key) => ({
            key,
            value: (settings as any)[key],
        }));

        try {
            const response = await api.post('/admin/settings', { settings: settingsArray });
            setSuccessMessage(response.data.message || 'Payment configurations updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.message || 'Failed to save configurations.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full space-y-6 flex flex-col justify-center items-center py-20 font-sans">
                <Loader2 className="animate-spin text-black" size={32} />
                <p className="text-xs text-neutral-500 font-normal animate-pulse">Loading Payment Gateways...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-20 font-sans text-neutral-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-black/10 pb-5">
                <div>
                    <h2 className="text-sm font-medium text-neutral-900 tracking-tight">Payment Gateways</h2>
                    <p className="text-neutral-500 text-xs mt-0.5">Activate, toggle, and configure credentials for payment methods.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black hover:bg-neutral-900 text-white px-4 py-2 rounded-[10px] flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 text-xs shrink-0"
                >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Configurations
                </button>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="bg-green-50 border-l-2 border-green-600 p-4 rounded-[10px] flex items-center gap-3 animate-fadeIn">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                    <span className="text-green-800 text-xs font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-2 border-red-600 p-4 rounded-[10px] flex items-center gap-3 animate-fadeIn">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                    <span className="text-red-800 text-xs font-medium">{errorMessage}</span>
                </div>
            )}

            {/* 1. RAZORPAY GATEWAY */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden transition-all duration-200">
                <div className="p-5 flex justify-between items-start border-b border-black/10 bg-neutral-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-black/10 rounded-[10px] flex items-center justify-center text-black font-bold text-base shadow-none">
                            R
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                                Razorpay
                                <span className="text-[10px] bg-neutral-100 text-neutral-850 font-medium px-2 py-0.5 rounded-full border border-black/5">UPI & Cards</span>
                            </h3>
                            <p className="text-xs text-neutral-500 font-normal">Credit Card, Netbanking, UPI, and Wallet integrations for Indian sellers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${settings.razorpay_enabled === '1' ? 'text-green-600' : 'text-neutral-400'}`}>
                            {settings.razorpay_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('razorpay_enabled')}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.razorpay_enabled === '1' ? 'bg-black' : 'bg-neutral-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                    settings.razorpay_enabled === '1' ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {settings.razorpay_enabled === '1' && (
                    <div className="p-5 space-y-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50/30 p-4 rounded-[10px] border border-black/10">
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Key ID</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type="text" 
                                        value={settings.razorpay_key}
                                        onChange={(e) => handleInputChange('razorpay_key', e.target.value)}
                                        placeholder="rzp_test_xxxxxxxxx"
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Key Secret</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type={showRazorpaySecret ? 'text' : 'password'}
                                        value={settings.razorpay_secret}
                                        onChange={(e) => handleInputChange('razorpay_secret', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-9 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                                    >
                                        {showRazorpaySecret ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Webhook Secret</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type={showRazorpayWebhook ? 'text' : 'password'}
                                        value={settings.razorpay_webhook_secret}
                                        onChange={(e) => handleInputChange('razorpay_webhook_secret', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-9 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowRazorpayWebhook(!showRazorpayWebhook)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                                    >
                                        {showRazorpayWebhook ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. STRIPE GATEWAY */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden transition-all duration-200">
                <div className="p-5 flex justify-between items-start border-b border-black/10 bg-neutral-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-black/10 rounded-[10px] flex items-center justify-center text-black font-bold text-base shadow-none">
                            S
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                                Stripe
                                <span className="text-[10px] bg-neutral-100 text-neutral-850 font-medium px-2 py-0.5 rounded-full border border-black/5">Global Payments</span>
                            </h3>
                            <p className="text-xs text-neutral-500 font-normal">Accept worldwide Credit Cards, Apple Pay, and Google Pay wallets</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${settings.stripe_enabled === '1' ? 'text-green-600' : 'text-neutral-400'}`}>
                            {settings.stripe_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('stripe_enabled')}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.stripe_enabled === '1' ? 'bg-black' : 'bg-neutral-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                    settings.stripe_enabled === '1' ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {settings.stripe_enabled === '1' && (
                    <div className="p-5 space-y-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50/30 p-4 rounded-[10px] border border-black/10">
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Publishable Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type="text" 
                                        value={settings.stripe_key}
                                        onChange={(e) => handleInputChange('stripe_key', e.target.value)}
                                        placeholder="pk_test_xxxxxxxxx"
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Secret Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type={showStripeSecret ? 'text' : 'password'}
                                        value={settings.stripe_secret}
                                        onChange={(e) => handleInputChange('stripe_secret', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-9 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowStripeSecret(!showStripeSecret)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                                    >
                                        {showStripeSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Webhook Signing Secret</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type={showStripeWebhook ? 'text' : 'password'}
                                        value={settings.stripe_secret}
                                        onChange={(e) => handleInputChange('stripe_webhook_secret', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-9 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                                    >
                                        {showStripeWebhook ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. PAYU GATEWAY */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden transition-all duration-200">
                <div className="p-5 flex justify-between items-start border-b border-black/10 bg-neutral-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-black/10 rounded-[10px] flex items-center justify-center text-black font-bold text-base shadow-none">
                            P
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                                PayU
                                <span className="text-[10px] bg-neutral-100 text-neutral-850 font-medium px-2 py-0.5 rounded-full border border-black/5">Enterprise Merchant</span>
                            </h3>
                            <p className="text-xs text-neutral-500 font-normal">Popular Indian gateway offering UPI, Cards, Netbanking & EMI options</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${settings.payu_enabled === '1' ? 'text-green-600' : 'text-neutral-400'}`}>
                            {settings.payu_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('payu_enabled')}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.payu_enabled === '1' ? 'bg-black' : 'bg-neutral-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                    settings.payu_enabled === '1' ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {settings.payu_enabled === '1' && (
                    <div className="p-5 space-y-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50/30 p-4 rounded-[10px] border border-black/10">
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Merchant Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type="text" 
                                        value={settings.payu_merchant_key}
                                        onChange={(e) => handleInputChange('payu_merchant_key', e.target.value)}
                                        placeholder="Merchant Key"
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Merchant Salt</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type={showPayuSalt ? 'text' : 'password'}
                                        value={settings.payu_merchant_salt}
                                        onChange={(e) => handleInputChange('payu_merchant_salt', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-9 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPayuSalt(!showPayuSalt)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                                    >
                                        {showPayuSalt ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Transaction Mode</label>
                                <div className="relative">
                                    <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <select 
                                        value={settings.payu_mode} 
                                        onChange={(e) => handleInputChange('payu_mode', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-black/10 rounded-[10px] outline-none text-xs text-neutral-900"
                                    >
                                        <option value="sandbox">Sandbox (Testing)</option>
                                        <option value="production">Production (Live)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. PHONEPE GATEWAY */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden transition-all duration-200">
                <div className="p-5 flex justify-between items-start border-b border-black/10 bg-neutral-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-black/10 rounded-[10px] flex items-center justify-center text-black font-bold text-base shadow-none">
                            Ph
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                                PhonePe
                                <span className="text-[10px] bg-neutral-100 text-neutral-850 font-medium px-2 py-0.5 rounded-full border border-black/5">Fast UPI</span>
                            </h3>
                            <p className="text-xs text-neutral-500 font-normal">Direct integration with India's leading UPI payment container apps</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${settings.phonepe_enabled === '1' ? 'text-green-600' : 'text-neutral-400'}`}>
                            {settings.phonepe_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('phonepe_enabled')}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.phonepe_enabled === '1' ? 'bg-black' : 'bg-neutral-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                    settings.phonepe_enabled === '1' ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {settings.phonepe_enabled === '1' && (
                    <div className="p-5 space-y-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50/30 p-4 rounded-[10px] border border-black/10">
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Merchant ID</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type="text" 
                                        value={settings.phonepe_merchant_id}
                                        onChange={(e) => handleInputChange('phonepe_merchant_id', e.target.value)}
                                        placeholder="MIDxxxxxxxxxxxx"
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Salt Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type={showPhonepeSalt ? 'text' : 'password'}
                                        value={settings.phonepe_salt_key}
                                        onChange={(e) => handleInputChange('phonepe_salt_key', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-9 pr-9 py-2 bg-white border border-black/10 rounded-[10px] outline-none font-mono text-xs font-normal text-neutral-900" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPhonepeSalt(!showPhonepeSalt)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                                    >
                                        {showPhonepeSalt ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Salt Index</label>
                                <div className="relative">
                                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <input 
                                        type="text" 
                                        value={settings.phonepe_salt_index}
                                        onChange={(e) => handleInputChange('phonepe_salt_index', e.target.value)}
                                        placeholder="1"
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-black/10 rounded-[10px] outline-none text-xs text-neutral-900 font-semibold" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Transaction Mode</label>
                                <div className="relative">
                                    <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                    <select 
                                        value={settings.phonepe_mode} 
                                        onChange={(e) => handleInputChange('phonepe_mode', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-white border border-black/10 rounded-[10px] outline-none text-xs text-neutral-900 font-normal"
                                    >
                                        <option value="sandbox">UAT (Sandbox Testing)</option>
                                        <option value="production">Production (Live)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 5. CASH ON DELIVERY (COD) */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 overflow-hidden transition-all duration-200 animate-fadeIn">
                <div className="p-5 flex justify-between items-start bg-neutral-50/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-black/10 rounded-[10px] flex items-center justify-center text-black shadow-none">
                            <CreditCard size={18} />
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                                Cash on Delivery (COD)
                                <span className="text-[10px] bg-neutral-100 text-neutral-850 font-medium px-2 py-0.5 rounded-full border border-black/5">Manual Payment</span>
                            </h3>
                            <p className="text-xs text-neutral-500 font-normal">Allow customers to pay in cash upon package delivery</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${settings.cod_enabled === '1' ? 'text-green-600' : 'text-neutral-400'}`}>
                            {settings.cod_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('cod_enabled')}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.cod_enabled === '1' ? 'bg-black' : 'bg-neutral-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                    settings.cod_enabled === '1' ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
