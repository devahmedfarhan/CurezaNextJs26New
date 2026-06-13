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
        <div className="min-h-screen flex bg-[#F8F3EF] text-[#052326] font-sans antialiased">
            {/* Left Side - Hero / Marketing */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#052326] text-[#F8F3EF] p-16 flex-col justify-between relative overflow-hidden">
                {/* Decorative glow element */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F0C417]/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F8F3EF]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="hover:opacity-95 transition-opacity inline-block shrink-0">
                        <img src="/logo-white.svg" alt="Cureza Logo" className="h-9 w-auto object-contain" />
                    </Link>
                    
                    <div className="mt-24 space-y-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#F0C417]/20 text-[#F0C417] border border-[#F0C417]/30">
                            <Stethoscope size={10} className="animate-pulse" />
                            Practitioner Network
                        </span>
                        <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-[#F8F3EF]">
                            Join top doctors <br />
                            <span className="text-[#F0C417]">healing the world.</span>
                        </h1>
                        <p className="text-sm xl:text-base text-[#F8F3EF]/80 font-medium leading-relaxed max-w-md">
                            Manage patient intakes, issue digital prescriptions, and consult with health-conscious individuals nationwide.
                        </p>
                    </div>

                    <div className="mt-16 space-y-5">
                        <div className="flex items-center gap-4 group">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Verified Practitioner Digital Badge</span>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                <Leaf size={20} />
                            </div>
                            <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Integrative Medicine Focus</span>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                <Heart size={20} />
                            </div>
                            <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Patient-Centric Health Tools</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-[#F8F3EF]/50 font-bold uppercase tracking-widest">
                    © 2026 Cureza Wellness • Doctor Portal
                </div>

                {/* Big decorative background icon */}
                <div className="absolute right-[-10%] bottom-[-5%] opacity-[0.03] pointer-events-none">
                    <Stethoscope size={350} />
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-16 bg-[#F8F3EF] relative">
                {/* Custom Nav */}
                <div className="absolute top-6 right-8 hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <Link href="/" className="hover:text-[#052326] transition-colors">Home</Link>
                    <Link href="/seller/login" className="hover:text-[#052326] transition-colors">Seller Portal</Link>
                </div>

                <div className="w-full max-w-md space-y-8 bg-white border border-[#052326]/10 rounded-3xl p-8 md:p-10 shadow-xl shadow-[#052326]/5">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-black tracking-tight text-[#052326]">
                            Doctor Login
                        </h2>
                        <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                            Access your clinic dashboard and consulting schedule.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-[#052326]/75">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full rounded-xl border border-[#052326]/12 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-4 placeholder:text-gray-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                        placeholder="doctor@cureza.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="password" className="text-xs font-black uppercase tracking-wider text-[#052326]/75">Password</label>
                                    <Link href="/forgot-password" className="text-xs font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full rounded-xl border border-[#052326]/12 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-4 placeholder:text-gray-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-[#052326] py-3 px-4 text-xs font-black uppercase tracking-widest text-[#F8F3EF] hover:bg-[#052326]/90 hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in to Clinic'}
                                {!isLoading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                            <span className="bg-white px-3">New to Cureza Network?</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/doctor/register"
                            className="flex w-full justify-center items-center gap-2 rounded-xl border-2 border-[#052326] bg-transparent py-3 px-4 text-xs font-black uppercase tracking-widest text-[#052326] hover:bg-[#052326]/5 transition-all"
                        >
                            Apply to join network
                        </Link>
                    </div>

                    <div className="text-center text-xs font-semibold border-t border-gray-100 pt-4 mt-6">
                        <span className="text-gray-400">Are you a customer? </span>
                        <Link href="/login" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                            Customer Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
