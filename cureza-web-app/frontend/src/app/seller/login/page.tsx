'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Store, ShieldCheck, TrendingUp } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/context/AuthContext';
import AuthFooter from '@/components/common/AuthFooter';

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
        <div className="min-h-screen w-full bg-[#F8F3EF] flex flex-col text-[#052326] font-sans justify-between">
            <div className="w-full flex-1 flex flex-col lg:flex-row bg-[#F8F3EF] relative">
                {/* Left Side - Hero / Marketing */}
                <div className="hidden lg:flex lg:w-[45%] bg-[#052326] text-[#F8F3EF] p-16 flex-col justify-between relative overflow-hidden min-h-screen">
                    {/* Decorative glow element */}
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F0C417]/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F8F3EF]/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="relative z-10">
                        <Link href="/" className="hover:opacity-95 transition-opacity inline-block shrink-0">
                            <img src="/logo-white.svg" alt="Cureza Logo" className="h-9 w-auto object-contain" />
                        </Link>
                        
                        <div className="mt-24 space-y-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#F0C417]/20 text-[#F0C417] border border-[#F0C417]/30">
                                <Store size={10} className="animate-pulse" />
                                Merchant Network
                            </span>
                            <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-[#F8F3EF]">
                                Grow Your<br />
                                Wellness Business.
                            </h1>
                            <p className="text-sm xl:text-base text-[#F8F3EF]/80 font-medium leading-relaxed max-w-md">
                                Join our curated premium network of sellers reaching millions of health-conscious customers across India.
                            </p>
                        </div>

                        <div className="mt-16 space-y-5">
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <Store size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Direct Customer Access & Brand Pages</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Unified Insights & Logistics Support</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Trusted & Regulated Compliance Checks</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-[#F8F3EF]/50 font-bold uppercase tracking-widest space-y-2">
                        <div>© 2026 Cureza Wellness. Merchant Portal.</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium normal-case tracking-normal text-[#F8F3EF]/60 mt-2">
                            <Link href="/" className="hover:text-white hover:underline transition-colors">Home</Link>
                            <span className="text-[#F8F3EF]/30">•</span>
                            <Link href="/legal/privacy-policy" className="hover:text-white hover:underline transition-colors">Privacy Policy</Link>
                            <span className="text-[#F8F3EF]/30">•</span>
                            <Link href="/legal/terms-of-service" className="hover:text-white hover:underline transition-colors">Terms & Conditions</Link>
                            <span className="text-[#F8F3EF]/30">•</span>
                            <Link href="/support/faqs" className="hover:text-white hover:underline transition-colors">Help Center / FAQs</Link>
                        </div>
                    </div>

                    {/* Big decorative background icon */}
                    <div className="absolute right-[-10%] bottom-[-5%] opacity-[0.03] pointer-events-none">
                        <Store size={350} />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-16 bg-[#F8F3EF] min-h-screen">
                    <div className="w-full max-w-md space-y-8 bg-white border border-[#052326]/10 rounded-[10px] p-8 md:p-10">
                        <div className="text-center lg:text-left space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-[#052326]">
                                Seller Login
                            </h2>
                            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                                Access your vendor control center and manage inventory.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="email" className="text-xs font-bold text-[#052326]">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                            placeholder="seller@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="password" className="text-xs font-bold text-[#052326]">Password</label>
                                        <Link href="/seller/forgot-password" className="text-xs font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-[10px] p-3 text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative flex w-full justify-center items-center gap-2 rounded-[10px] bg-[#052326] py-3 px-4 text-xs font-bold tracking-widest text-[#F8F3EF] hover:bg-[#052326]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Signing In...' : 'Sign In to Dashboard'}
                                    {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </form>

                        <div className="text-center text-xs font-semibold mt-6">
                            <span className="text-gray-500">Don't have a seller account? </span>
                            <Link href="/seller/register" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                Register Now
                            </Link>
                        </div>

                        <div className="text-center text-[11px] font-semibold border-t border-gray-100 pt-4 mt-6 flex flex-col gap-2">
                            <div>
                                <span className="text-gray-400">Are you a customer? </span>
                                <Link href="/login" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                    Customer Login
                                </Link>
                            </div>
                            <div>
                                <span className="text-gray-400">Are you a doctor? </span>
                                <Link href="/doctor/login" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                    Doctor Portal
                                </Link>
                            </div>
                            <div className="border-t border-gray-100 pt-3 mt-2">
                                <Link href="/" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors text-xs">
                                    Go Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
