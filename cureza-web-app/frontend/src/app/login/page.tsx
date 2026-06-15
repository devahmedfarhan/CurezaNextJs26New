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
    const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
    const [googleClientId, setGoogleClientId] = useState('');

    // Fetch settings and initialize Google OAuth
    useEffect(() => {
        api.get('/settings/public')
            .then((res) => {
                setGoogleAuthEnabled(res.data.google_auth_enabled);
                setGoogleClientId(res.data.google_client_id);
            })
            .catch((err) => {
                console.error('Failed to load public settings:', err);
            });
    }, []);

    const handleGoogleCredential = async (response: any) => {
        try {
            setError('');
            const res = await api.post('/auth/google', {
                credential: response.credential,
            });

            // Update Auth Context & Cookie
            login(res.data.access_token, res.data.user);

            // Redirect logic
            if (redirect) {
                router.push(redirect);
            } else {
                if (res.data.user.role === 'admin') {
                    router.push('/superadmin/dashboard');
                } else if (res.data.user.role === 'vendor') {
                    router.push('/seller/dashboard');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google authentication failed.');
        }
    };

    useEffect(() => {
        if (!googleAuthEnabled || !googleClientId) return;

        // Dynamically load Google client script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            const google = (window as any).google;
            if (google) {
                google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleCredential,
                });
                
                // Render button
                const btnContainer = document.getElementById('google-signin-button');
                if (btnContainer) {
                    google.accounts.id.renderButton(btnContainer, {
                        theme: 'outline',
                        size: 'large',
                        width: btnContainer.clientWidth || 380,
                    });
                }
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [googleAuthEnabled, googleClientId]);

    // Redirect if already logged in

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
                                <Leaf size={10} className="animate-pulse" />
                                Premium Wellness
                            </span>
                            <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-[#F8F3EF]">
                                Your Journey to<br />
                                Holistic Health.
                            </h1>
                            <p className="text-sm xl:text-base text-[#F8F3EF]/80 font-medium leading-relaxed max-w-md">
                                Discover clinically validated Ayurvedic products, consult with certified experts, and embrace natural care.
                            </p>
                        </div>

                        <div className="mt-16 space-y-5">
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">100% Authentic & Certified Lab Sourced</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <Leaf size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Natural Organic Ingredients</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <Heart size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Practitioner Approved Regimens</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-[#F8F3EF]/50 font-bold uppercase tracking-widest space-y-2">
                        <div>© 2026 Cureza Wellness. All Rights Reserved.</div>
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

                    {/* Big decorative background leaf icon */}
                    <div className="absolute right-[-10%] bottom-[-5%] opacity-[0.03] pointer-events-none">
                        <Leaf size={350} />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-[55%] flex items-center justify-center px-5 py-6 md:px-8 md:py-8 bg-[#F8F3EF] min-h-screen">
                    <div className="w-full max-w-[430px] space-y-5 bg-white border border-[#052326]/10 rounded-[10px] p-5 md:p-6">
                        <div className="text-center lg:text-left space-y-1">
                            <h2 className="text-2xl font-black tracking-tight text-[#052326]">
                                Welcome Back
                            </h2>
                            <p className="text-[11px] text-gray-700 font-semibold leading-relaxed">
                                Sign in to access your personalized health journey and orders.
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div style={{ display: 'none' }} aria-hidden="true">
                                <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
                                <input type="email" name="spamtrap_email" tabIndex={-1} autoComplete="off" />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label htmlFor="email-address" className="text-[11px] font-bold tracking-wide text-[#052326]">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            id="email-address"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-2.5 pl-10 pr-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center gap-3">
                                        <label htmlFor="password" className="text-[11px] font-bold tracking-wide text-[#052326]">Password</label>
                                        <Link href="/forgot-password" className="text-[11px] font-bold text-[#052326] hover:text-[#F0C417] transition-colors whitespace-nowrap">
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
                                            autoComplete="current-password"
                                            required
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-2.5 pl-10 pr-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
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
                                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-[10px] p-3 text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2.5">
                                <button
                                    type="submit"
                                    className="group relative flex w-full justify-center items-center gap-2 rounded-[10px] bg-[#052326] py-2.5 px-4 text-xs font-bold tracking-widest text-[#F8F3EF] hover:bg-[#052326]/90 transition-all"
                                >
                                    Sign In
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="relative flex justify-center text-[10px] font-bold text-gray-500 py-0.5">
                                    <span className="bg-white px-3">Or</span>
                                </div>

                                <Link
                                    href="/login-otp"
                                    className="flex w-full justify-center items-center gap-2 rounded-[10px] border-2 border-[#052326] bg-transparent py-2.5 px-4 text-xs font-bold tracking-widest text-[#052326] hover:bg-[#052326]/5 transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                                    Sign In With OTP
                                </Link>
                            </div>
                        </form>

                        <div className="relative my-2.5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-bold text-gray-500">
                                <span className="px-3 bg-white">Or Continue With</span>
                            </div>
                        </div>

                        {googleAuthEnabled ? (
                            <div className="w-full flex justify-center py-1">
                                <div id="google-signin-button" className="w-full"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => alert('Google authentication is disabled.')} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-100 rounded-[10px] bg-gray-50 text-xs font-bold text-gray-500 cursor-not-allowed transition-colors" disabled>
                                    Google (Disabled)
                                </button>
                                <button type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-[10px] bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                    Facebook
                                </button>
                            </div>
                        )}

                        <div className="rounded-[10px] border border-gray-100 bg-[#F8F3EF]/70 p-3">
                            <p className="text-center text-[11px] font-bold text-gray-600">
                                Don't have an account?
                            </p>
                            <Link
                                href="/register"
                                className="mt-2.5 flex items-center justify-center gap-2 rounded-[10px] bg-[#052326] px-4 py-2.5 text-xs font-bold tracking-widest text-white hover:bg-[#052326]/90 transition-all"
                            >
                                Register Now
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            <Link
                                href="/seller/login"
                                className="flex items-center justify-between rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 hover:border-[#052326]/20 hover:bg-[#052326]/3 transition-all"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-gray-500">Seller Access</p>
                                    <p className="text-sm font-bold text-[#052326]">Vendor Login</p>
                                </div>
                                <ArrowRight size={14} className="text-gray-400" />
                            </Link>

                            <Link
                                href="/doctor/login"
                                className="flex items-center justify-between rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 hover:border-[#052326]/20 hover:bg-[#052326]/3 transition-all"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-gray-500">Doctor Access</p>
                                    <p className="text-sm font-bold text-[#052326]">Doctor Login</p>
                                </div>
                                <ArrowRight size={14} className="text-gray-400" />
                            </Link>
                        </div>

                        <Link
                            href="/"
                            className="mt-2 flex items-center justify-center gap-2 rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-bold tracking-widest text-[#052326] hover:bg-white hover:border-[#052326]/20 transition-all"
                        >
                            Go Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8F3EF] flex items-center justify-center font-bold text-[#052326]">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
