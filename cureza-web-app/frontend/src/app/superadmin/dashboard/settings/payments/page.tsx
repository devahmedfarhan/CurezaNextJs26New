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
    Settings,
    Shield,
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
            <div className="max-w-4xl space-y-6 flex flex-col justify-center items-center py-20 font-sans">
                <Loader2 className="animate-spin text-cureza-green" size={40} />
                <p className="text-gray-500 font-medium animate-pulse">Loading Payment Gateways...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6 pb-20 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payment Gateways</h1>
                    <p className="text-gray-500 text-sm mt-1">Activate, toggle, and configure credentials for global payment methods (WooCommerce-style)</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-cureza-green hover:bg-green-700 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Configurations
                </button>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm flex items-center gap-3 animate-fadeIn">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    <span className="text-green-800 text-sm font-medium">{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-center gap-3 animate-fadeIn">
                    <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
                </div>
            )}

            {/* 1. RAZORPAY GATEWAY */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
                <div className="p-6 flex justify-between items-start border-b border-gray-50 bg-gray-50/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm">
                            R
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                Razorpay
                                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-100">UPI & Cards</span>
                            </h3>
                            <p className="text-sm text-gray-500">Credit Card, Netbanking, UPI, and Wallet integrations for Indian sellers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-bold ${settings.razorpay_enabled === '1' ? 'text-green-600' : 'text-gray-400'}`}>
                            {settings.razorpay_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('razorpay_enabled')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.razorpay_enabled === '1' ? 'bg-cureza-green' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    settings.razorpay_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {settings.razorpay_enabled === '1' && (
                    <div className="p-6 space-y-6 bg-white animate-slideDown">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Key ID</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        value={settings.razorpay_key}
                                        onChange={(e) => handleInputChange('razorpay_key', e.target.value)}
                                        placeholder="rzp_test_xxxxxxxxx"
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Key Secret</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type={showRazorpaySecret ? 'text' : 'password'}
                                        value={settings.razorpay_secret}
                                        onChange={(e) => handleInputChange('razorpay_secret', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showRazorpaySecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Webhook Secret</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type={showRazorpayWebhook ? 'text' : 'password'}
                                        value={settings.razorpay_webhook_secret}
                                        onChange={(e) => handleInputChange('razorpay_webhook_secret', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowRazorpayWebhook(!showRazorpayWebhook)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showRazorpayWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. STRIPE GATEWAY */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
                <div className="p-6 flex justify-between items-start border-b border-gray-50 bg-gray-50/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm">
                            S
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                Stripe
                                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">Global Payments</span>
                            </h3>
                            <p className="text-sm text-gray-500">Accept worldwide Credit Cards, Apple Pay, and Google Pay wallets</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-bold ${settings.stripe_enabled === '1' ? 'text-green-600' : 'text-gray-400'}`}>
                            {settings.stripe_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('stripe_enabled')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.stripe_enabled === '1' ? 'bg-cureza-green' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    settings.stripe_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {settings.stripe_enabled === '1' && (
                    <div className="p-6 space-y-6 bg-white animate-slideDown">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Publishable Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        value={settings.stripe_key}
                                        onChange={(e) => handleInputChange('stripe_key', e.target.value)}
                                        placeholder="pk_test_xxxxxxxxx"
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Secret Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type={showStripeSecret ? 'text' : 'password'}
                                        value={settings.stripe_secret}
                                        onChange={(e) => handleInputChange('stripe_secret', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowStripeSecret(!showStripeSecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showStripeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Webhook Signing Secret</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type={showStripeWebhook ? 'text' : 'password'}
                                        value={settings.stripe_webhook_secret}
                                        onChange={(e) => handleInputChange('stripe_webhook_secret', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowStripeWebhook(!showStripeWebhook)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showStripeWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. PAYU GATEWAY */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
                <div className="p-6 flex justify-between items-start border-b border-gray-50 bg-gray-50/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm">
                            P
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                PayU
                                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-100">Enterprise Merchant</span>
                            </h3>
                            <p className="text-sm text-gray-500">Popular Indian gateway offering UPI, Cards, Netbanking & EMI options</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-bold ${settings.payu_enabled === '1' ? 'text-green-600' : 'text-gray-400'}`}>
                            {settings.payu_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('payu_enabled')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.payu_enabled === '1' ? 'bg-cureza-green' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    settings.payu_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {settings.payu_enabled === '1' && (
                    <div className="p-6 space-y-6 bg-white animate-slideDown">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Merchant Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        value={settings.payu_merchant_key}
                                        onChange={(e) => handleInputChange('payu_merchant_key', e.target.value)}
                                        placeholder="Merchant Key"
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Merchant Salt</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type={showPayuSalt ? 'text' : 'password'}
                                        value={settings.payu_merchant_salt}
                                        onChange={(e) => handleInputChange('payu_merchant_salt', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPayuSalt(!showPayuSalt)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPayuSalt ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction Mode</label>
                                <div className="relative">
                                    <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select 
                                        value={settings.payu_mode} 
                                        onChange={(e) => handleInputChange('payu_mode', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none text-sm text-gray-900"
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
                <div className="p-6 flex justify-between items-start border-b border-gray-50 bg-gray-50/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm">
                            Ph
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                PhonePe
                                <span className="text-xs bg-violet-50 text-violet-700 font-semibold px-2 py-0.5 rounded-full border border-violet-100">Fast UPI</span>
                            </h3>
                            <p className="text-sm text-gray-500">Direct integration with India's leading UPI payment container apps</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-bold ${settings.phonepe_enabled === '1' ? 'text-green-600' : 'text-gray-400'}`}>
                            {settings.phonepe_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('phonepe_enabled')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.phonepe_enabled === '1' ? 'bg-cureza-green' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    settings.phonepe_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {settings.phonepe_enabled === '1' && (
                    <div className="p-6 space-y-6 bg-white animate-slideDown">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Merchant ID</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        value={settings.phonepe_merchant_id}
                                        onChange={(e) => handleInputChange('phonepe_merchant_id', e.target.value)}
                                        placeholder="MIDxxxxxxxxxxxx"
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Salt Key</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type={showPhonepeSalt ? 'text' : 'password'}
                                        value={settings.phonepe_salt_key}
                                        onChange={(e) => handleInputChange('phonepe_salt_key', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none font-mono text-sm" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPhonepeSalt(!showPhonepeSalt)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPhonepeSalt ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Salt Index</label>
                                <div className="relative">
                                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        value={settings.phonepe_salt_index}
                                        onChange={(e) => handleInputChange('phonepe_salt_index', e.target.value)}
                                        placeholder="1"
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none text-sm font-semibold" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Transaction Mode</label>
                                <div className="relative">
                                    <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <select 
                                        value={settings.phonepe_mode} 
                                        onChange={(e) => handleInputChange('phonepe_mode', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cureza-green focus:border-transparent outline-none text-sm text-gray-900"
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200">
                <div className="p-6 flex justify-between items-start bg-gray-50/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                            <CreditCard size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                Cash on Delivery (COD)
                                <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full border border-green-100">Manual Payment</span>
                            </h3>
                            <p className="text-sm text-gray-500">Allow customers to pay in cash upon package delivery</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-sm font-bold ${settings.cod_enabled === '1' ? 'text-green-600' : 'text-gray-400'}`}>
                            {settings.cod_enabled === '1' ? 'Active' : 'Disabled'}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleToggleChange('cod_enabled')}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                settings.cod_enabled === '1' ? 'bg-cureza-green' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    settings.cod_enabled === '1' ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
