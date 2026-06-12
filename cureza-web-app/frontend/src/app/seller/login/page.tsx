'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Store, ShieldCheck, TrendingUp } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function SellerLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: '/' });
            const response = await api.post('/seller/login', { email, password });

            showToast('Login successful! Welcome back.', 'success');
            // Use the login function from context which handles redirection based on role
            login(response.data.access_token, response.data.user);
            router.push('/seller/dashboard');
        } catch (err: any) {
            // Display the specific error message from the backend (e.g., "Your account is pending approval")
            const errorMessage = err.response?.data?.errors?.email?.[0] || err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-warm-sand">
            {/* Left Side - Content */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="text-3xl font-bold flex items-center gap-2 mb-12">
                        <span className="bg-white text-blue-600 p-1 rounded">Cz</span>
                        Cureza Seller
                    </Link>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Grow Your<br />
                        Wellness Business.
                    </h1>
                    <p className="text-xl text-blue-100 max-w-lg mb-8">
                        Join thousands of sellers reaching health-conscious customers across India.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Store size={20} />
                            </div>
                            <span className="font-medium">Reach Millions of Customers</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <TrendingUp size={20} />
                            </div>
                            <span className="font-medium">Boost Your Sales</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="font-medium">Secure & Trusted Platform</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-blue-100">
                    © 2025 Cureza Wellness Pvt Ltd.
                </div>

                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
                    <Store size={400} />
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-charcoal">
                            Seller Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Access your seller dashboard and manage your products
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="seller@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <Link href="/seller/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700">
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
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                disabled={loading}
                                className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign in to Dashboard'}
                                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have a seller account? </span>
                        <Link href="/seller/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            Register now
                        </Link>
                    </div>

                    <div className="text-center text-sm border-t border-gray-100 pt-4">
                        <span className="text-gray-600">Are you a customer? </span>
                        <Link href="/login" className="font-bold text-cureza-green hover:text-green-700 transition-colors">
                            Customer Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
