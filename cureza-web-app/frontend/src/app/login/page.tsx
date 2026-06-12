'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Heart, ShieldCheck, Leaf } from 'lucide-react';
import { Turnstile } from '@/components/common/Turnstile';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (redirect) {
                router.replace(redirect);
            } else {
                router.replace('/dashboard');
            }
        }
    }, [user, router, redirect]);

    if (user) {
        return null; // Or a loading spinner while redirecting
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/login', {
                email,
                password,
                cf_turnstile_token: turnstileToken || undefined,
            });

            // Update Auth Context
            login(response.data.access_token, response.data.user);

            // Redirect to homepage or requested page
            if (redirect) {
                router.push(redirect);
            } else {
                // Role-based redirect
                if (response.data.user.role === 'admin') {
                    router.push('/superadmin/dashboard');
                } else if (response.data.user.role === 'vendor') {
                    router.push('/seller/dashboard');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
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
                        Your Journey to<br />
                        Holistic Wellness.
                    </h1>
                    <p className="text-xl text-green-100 max-w-lg mb-8">
                        Discover authentic Ayurvedic products, consult with top experts, and embrace a healthier lifestyle.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="font-medium">100% Authentic & Verified</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Leaf size={20} />
                            </div>
                            <span className="font-medium">Natural & Herbal Remedies</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Heart size={20} />
                            </div>
                            <span className="font-medium">Trusted by Doctors</span>
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
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to access your personalized wellness journey
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div style={{ display: 'none' }} aria-hidden="true">
                            <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
                            <input type="email" name="spamtrap_email" tabIndex={-1} autoComplete="off" />
                        </div>
                        <div className="space-y-4">
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
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <Link href="/forgot-password" className="text-xs font-medium text-cureza-green hover:text-green-700">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
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
                                Sign in
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="relative flex justify-center text-sm py-2">
                                <span className="bg-white px-2 text-gray-500">Or</span>
                            </div>

                            <Link
                                href="/login-otp"
                                className="flex w-full justify-center items-center gap-2 rounded-lg border border-cureza-green py-2.5 px-4 text-sm font-bold text-cureza-green hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cureza-green transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                                Sign in with OTP
                            </Link>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className="text-lg">G</span> Google
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className="text-lg">f</span> Facebook
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link href="/register" className="font-bold text-cureza-green hover:text-green-700 transition-colors">
                            Register now
                        </Link>
                    </div>

                    <div className="text-center text-sm mt-4 border-t border-gray-100 pt-4">
                        <div className="mb-2">
                            <span className="text-gray-600">Are you a seller? </span>
                            <Link href="/seller/login" className="font-bold text-cureza-green hover:text-green-700 transition-colors">
                                Login as Vendor
                            </Link>
                        </div>
                        <div>
                            <span className="text-gray-600">Are you a doctor? </span>
                            <Link href="/doctor/login" className="font-bold text-cureza-green hover:text-green-700 transition-colors">
                                Login as Doctor
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-warm-sand flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
