'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Phone, ArrowRight, Heart, ShieldCheck, Leaf, Store, Check, X, Eye, EyeOff } from 'lucide-react';
import { Turnstile } from '@/components/common/Turnstile';
import AuthFooter from '@/components/common/AuthFooter';

function RegisterContent() {
    const searchParams = useSearchParams();
    const prefillLoginId = searchParams.get('login_id') || '';
    const referredBy = searchParams.get('ref') || '';

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

            // Redirect to homepage
            window.location.href = '/';
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
                referred_by: referredBy || undefined,
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
                                Join the<br />
                                Wellness Revolution.
                            </h1>
                            <p className="text-sm xl:text-base text-[#F8F3EF]/80 font-medium leading-relaxed max-w-md">
                                Create your account to access exclusive wellness products, expert consultations, and a community dedicated to health.
                            </p>
                        </div>

                        <div className="mt-16 space-y-5">
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Personalized Health Journey</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <Leaf size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Curated Natural Products</span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417] transition-all duration-300 group-hover:bg-[#F8F3EF]/10">
                                    <Heart size={20} />
                                </div>
                                <span className="text-sm font-bold text-[#F8F3EF]/90 group-hover:text-white transition-colors">Secure & Private</span>
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
                <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-16 bg-[#F8F3EF] min-h-screen">
                    <div className="w-full max-w-md space-y-8 bg-white border border-[#052326]/10 rounded-[10px] p-8 md:p-10">
                        <div className="text-center lg:text-left space-y-2">
                            <h2 className="text-3xl font-black tracking-tight text-[#052326]">
                                Create Account
                            </h2>
                            <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                                Join the community for a healthier lifestyle
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div style={{ display: 'none' }} aria-hidden="true">
                                <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
                                <input type="email" name="spamtrap_email" tabIndex={-1} autoComplete="off" />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label htmlFor="name" className="text-xs font-bold text-[#052326]">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                            <User size={16} />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="email-address" className="text-xs font-bold text-[#052326]">Email Address</label>
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
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="phone" className="text-xs font-bold text-[#052326]">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                            <Phone size={16} />
                                        </div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                            placeholder="+91 98765 43210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {role === 'vendor' && (
                                    <div className="space-y-1">
                                        <label htmlFor="brandName" className="text-xs font-bold text-[#052326]">Brand Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                                <Store size={16} />
                                            </div>
                                            <input
                                                id="brandName"
                                                name="brandName"
                                                type="text"
                                                required
                                                className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                                placeholder="Your Brand Name"
                                                value={brandName}
                                                onChange={(e) => setBrandName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label htmlFor="password" className="text-xs font-bold text-[#052326]">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-10 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
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
                                            <div className="mt-3 space-y-1.5 bg-gray-50 p-3 rounded-[10px] border border-gray-100">
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

                                <div className="space-y-1">
                                    <label htmlFor="password-confirm" className="text-xs font-bold text-[#052326]">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            id="password-confirm"
                                            name="password-confirm"
                                            type={showPasswordConfirmation ? "text" : "password"}
                                            required
                                            className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-3 pl-10 pr-10 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
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
                                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-[10px] p-3 text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    className="group relative flex w-full justify-center items-center gap-2 rounded-[10px] bg-[#052326] py-3 px-4 text-xs font-bold tracking-widest text-[#F8F3EF] hover:bg-[#052326]/90 transition-all"
                                >
                                    Create Account
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </form>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-bold text-gray-500">
                                <span className="px-3 bg-white">Or Continue With</span>
                            </div>
                        </div>

                        {googleAuthEnabled ? (
                            <div className="w-full flex justify-center py-2">
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

                        <div className="text-center text-xs font-semibold mt-6">
                            <span className="text-gray-500">Already have an account? </span>
                            <Link href="/login" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                Sign In
                            </Link>
                        </div>

                        <div className="text-center text-[11px] font-semibold border-t border-gray-100 pt-4 mt-6 flex flex-col gap-2">
                            <div>
                                <span className="text-gray-400">Are you a seller? </span>
                                <Link href="/seller/register" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                    Join as Vendor
                                </Link>
                            </div>
                            <div>
                                <span className="text-gray-400">Are you a doctor? </span>
                                <Link href="/doctor/register" className="font-bold text-[#052326] hover:text-[#F0C417] transition-colors">
                                    Apply to join network
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

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-warm-sand flex items-center justify-center">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    );
}
