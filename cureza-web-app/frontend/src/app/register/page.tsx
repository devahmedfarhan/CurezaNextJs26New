'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Phone, ArrowRight, Heart, ShieldCheck, Leaf, Store, Check, X, Eye, EyeOff } from 'lucide-react';
import { Turnstile } from '@/components/common/Turnstile';

function RegisterContent() {
    const searchParams = useSearchParams();
    const prefillLoginId = searchParams.get('login_id') || '';

    // Determine if prefill is email or phone
    const isEmail = prefillLoginId.includes('@');
    const isPhone = /^\d+$/.test(prefillLoginId.replace(/\D/g, ''));

    const [name, setName] = useState('');
    const [email, setEmail] = useState(isEmail ? prefillLoginId : '');
    const [phone, setPhone] = useState(isPhone ? prefillLoginId : '');
    const [role, setRole] = useState('customer');
    const [brandName, setBrandName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const getPasswordStrength = (pwd: string) => {
        let s = 0;
        if (pwd.length >= 12) s++;
        if (/[A-Z]/.test(pwd)) s++;
        if (/[a-z]/.test(pwd)) s++;
        if (/[0-9]/.test(pwd)) s++;
        if (/[^A-Za-z0-9]/.test(pwd)) s++;
        return s;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        try {
            // CSRF cookie is not needed for token-based API auth
            // await api.get('/sanctum/csrf-cookie', { baseURL: '/' });

            const response = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                role,
                phone,
                brand_name: role === 'vendor' ? brandName : undefined,
                cf_turnstile_token: turnstileToken || undefined,
            });

            // Store token and user data
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

            // Redirect to homepage
            window.location.href = '/';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-warm-sand">
            {/* Left Side - Content */}
            <div className="hidden lg:flex lg:w-1/2 bg-cureza-green text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="text-3xl font-bold flex items-center gap-2 mb-12">
                        <span className="bg-white text-cureza-green p-1 rounded">Cz</span>
                        Cureza
                    </Link>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Join the<br />
                        Wellness Revolution.
                    </h1>
                    <p className="text-xl text-green-100 max-w-lg mb-8">
                        Create your account to access exclusive wellness products, expert consultations, and a community dedicated to health.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Heart size={20} />
                            </div>
                            <span className="font-medium">Personalized Health Journey</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Leaf size={20} />
                            </div>
                            <span className="font-medium">Curated Natural Products</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="font-medium">Secure & Private</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-green-100">
                    © 2025 Cureza Wellness Pvt Ltd.
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
                    <Leaf size={400} />
                </div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 opacity-10">
                    <div className="w-80 h-80 rounded-full border-8 border-white"></div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-charcoal">
                            Create Account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Join the community for a healthier lifestyle
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div style={{ display: 'none' }} aria-hidden="true">
                            <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
                            <input type="email" name="spamtrap_email" tabIndex={-1} autoComplete="off" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>



                            {role === 'vendor' && (
                                <div>
                                    <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Store size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            id="brandName"
                                            name="brandName"
                                            type="text"
                                            required
                                            className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                            placeholder="Your Brand Name"
                                            value={brandName}
                                            onChange={(e) => setBrandName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {password && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                            <span>Password Strength:</span>
                                            <span className={getPasswordStrength(password) <= 2 ? 'text-red-500' : getPasswordStrength(password) <= 4 ? 'text-yellow-600' : 'text-green-600'}>
                                                {getPasswordStrength(password) <= 2 ? 'Weak' : getPasswordStrength(password) <= 4 ? 'Medium' : 'Strong'}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getPasswordStrength(password) <= 2 ? 'bg-red-500' : getPasswordStrength(password) <= 4 ? 'bg-yellow-500' : 'bg-green-500'} transition-all duration-300`}
                                                style={{ width: `${(getPasswordStrength(password) / 5) * 100}%` }}
                                            />
                                        </div>
                                        <div className="mt-3 space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {[
                                                { label: 'At least 12 characters long', met: password.length >= 12 },
                                                { label: 'Contains uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
                                                { label: 'Contains lowercase letter (a-z)', met: /[a-z]/.test(password) },
                                                { label: 'Contains number (0-9)', met: /[0-9]/.test(password) },
                                                { label: 'Contains special character (@, #, $, etc.)', met: /[^A-Za-z0-9]/.test(password) },
                                            ].map((cond, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-[11px]">
                                                    {cond.met ? (
                                                        <Check size={12} className="text-green-600 flex-shrink-0" />
                                                    ) : (
                                                        <X size={12} className="text-red-400 flex-shrink-0" />
                                                    )}
                                                    <span className={`transition-all ${cond.met ? 'line-through text-gray-400 font-medium' : 'text-gray-600'}`}>
                                                        {cond.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="password-confirm"
                                        name="password-confirm"
                                        type={showPasswordConfirmation ? "text" : "password"}
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Turnstile
                            sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000SH'}
                            onVerify={setTurnstileToken}
                        />

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-cureza-green py-2.5 px-4 text-sm font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cureza-green transition-all"
                            >
                                Create Account
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link href="/login" className="font-bold text-cureza-green hover:text-green-700 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-warm-sand flex items-center justify-center">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
