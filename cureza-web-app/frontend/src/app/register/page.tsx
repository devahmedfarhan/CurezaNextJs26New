'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Phone, ArrowRight, Heart, ShieldCheck, Leaf, Store } from 'lucide-react';

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
    const [error, setError] = useState('');
    const { login } = useAuth();

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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['customer', 'vendor', 'doctor'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`py-2 px-4 rounded-lg text-sm font-medium capitalize border transition-colors ${role === r
                                                ? 'bg-cureza-green text-white border-cureza-green'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
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
                                        type="password"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
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
                                        type="password"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

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
