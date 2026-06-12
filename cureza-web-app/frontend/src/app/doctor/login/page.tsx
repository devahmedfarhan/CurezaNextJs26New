'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { Stethoscope, ArrowRight, Mail, Lock, ShieldCheck, Leaf, Heart } from 'lucide-react';

export default function DoctorLoginPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Get CSRF cookie first
            await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });

            const response = await api.post('/doctor/login', { email, password });

            // Store token and user info
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            showToast('Login successful!', 'success');

            // Redirect based on status
            router.push('/doctor/dashboard');
        } catch (error: any) {
            console.error('Login failed:', error);
            const msg = error.response?.data?.message || 'Invalid credentials';
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Left Side - Marketing Content (Fixed/Sticky behavior handled by flex container) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden items-start">
                {/* Branding */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-16 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all group-hover:bg-white/20">
                            <Stethoscope className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Cureza.</span>
                    </Link>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl leading-[1.15]">
                            Join top doctors <br />
                            <span className="text-blue-400">healing the world.</span>
                        </h1>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Manage appointments, track patient history, and expand your practice with our integrated digital health ecosystem.
                        </p>
                    </div>

                    <div className="mt-12 space-y-5">
                        <div className="flex items-center gap-4 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 transition-colors group-hover:bg-blue-500/20 group-hover:border-blue-500/30">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Verified Practitioner Badge</span>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 transition-colors group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30">
                                <Leaf size={20} />
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Integrative Medicine Focus</span>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 transition-colors group-hover:bg-rose-500/20 group-hover:border-rose-500/30">
                                <Heart size={20} />
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Patient-Centric Tools</span>
                        </div>
                    </div>
                </div>

                {/* Footer Copy */}
                <div className="relative z-10 mt-12 text-xs text-slate-500 font-medium uppercase tracking-wider">
                    © 2025 Cureza Wellness • Doctor Portal
                </div>

                {/* Ambient Background Effects */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-900/90 pointer-events-none z-0" />
            </div>

            {/* Right Side - Login Form */}
            <div className="relative flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 lg:px-24 xl:px-32 bg-white">
                {/* Custom Nav */}
                <div className="absolute top-6 right-6 hidden lg:flex items-center gap-6 text-sm font-medium text-slate-500">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                    <Link href="/seller/login" className="hover:text-slate-900 transition-colors">Seller Portal</Link>
                </div>

                <div className="mx-auto w-full max-w-sm space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Stethoscope className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h2>
                        <p className="text-sm text-slate-500">
                            Enter your credentials to access your dashboard.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                    placeholder="doctor@hospital.com"
                                />
                                <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                                    <Mail size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-all">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-sans"
                                    placeholder="••••••••"
                                />
                                <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                                    <Lock size={16} />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`inline-flex items-center justify-center w-full h-10 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In <ArrowRight size={16} />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                            <span className="bg-white px-2 text-slate-500">New to Cureza?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/doctor/register"
                            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 w-full"
                        >
                            Apply to join network
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

