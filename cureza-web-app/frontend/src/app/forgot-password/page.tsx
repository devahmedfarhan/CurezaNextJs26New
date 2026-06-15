'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, Shield, Key, Lock, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'email' | 'otp' | 'reset' | 'done'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [devOtp, setDevOtp] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0);

    // Timer countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Step 1: Send OTP to email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { login_id: email });
            const data = response.data;

            if (data.action === 'register_required') {
                setError('This email is not registered. Please create an account first.');
                setLoading(false);
                return;
            }

            // OTP sent successfully
            if (data.dev_otp) {
                setDevOtp(String(data.dev_otp));
            }
            setTimer(60);
            setStep('otp');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { login_id: email });
            if (response.data.dev_otp) {
                setDevOtp(String(response.data.dev_otp));
            }
            setTimer(60);
        } catch (err: any) {
            setError('Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and move to reset
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.length < 4) {
            setError('Please enter the 4-digit OTP.');
            return;
        }

        // OTP is valid — move to password reset step
        // We'll send OTP + new password together in final step
        setStep('reset');
    };

    // Step 3: Reset password with OTP
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                login_id: email,
                otp: otp,
                password: password,
                password_confirmation: passwordConfirmation,
            });
            setStep('done');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.otp?.[0] || 'Password reset failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#F8F3EF]">
            {/* Left Side - Content */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#052326] text-[#F8F3EF] p-16 flex-col justify-between relative overflow-hidden min-h-screen">
                {/* Decorative glow element */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F0C417]/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F8F3EF]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="hover:opacity-95 transition-opacity inline-block shrink-0">
                        <img src="/logo-white.svg" alt="Cureza Logo" className="h-9 w-auto object-contain" />
                    </Link>
                    
                    <div className="mt-24 space-y-6">
                        <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight text-[#F8F3EF]">
                            Secure Account<br />
                            Recovery.
                        </h1>
                        <p className="text-sm xl:text-base text-[#F8F3EF]/80 font-medium leading-relaxed max-w-md">
                            Don't worry, it happens to the best of us. We'll help you get back to your wellness journey in no time.
                        </p>
                    </div>

                    <div className="mt-16 space-y-5">
                        <div className="flex items-center gap-4 group">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417]">
                                <Shield size={20} />
                            </div>
                            <span className="text-sm font-bold text-[#F8F3EF]/90">Secure OTP Verification</span>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F3EF]/5 border border-[#F8F3EF]/10 text-[#F0C417]">
                                <Key size={20} />
                            </div>
                            <span className="text-sm font-bold text-[#F8F3EF]/90">Instant Password Reset</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-[#F8F3EF]/50 font-bold uppercase tracking-widest space-y-2">
                    <div>© 2026 Cureza Wellness. All Rights Reserved.</div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-[55%] flex items-center justify-center px-5 py-6 md:px-8 md:py-8 bg-[#F8F3EF] min-h-screen">
                <div className="w-full max-w-[430px] space-y-5 bg-white border border-[#052326]/10 rounded-[10px] p-5 md:p-6">

                    {/* ===== STEP: EMAIL ===== */}
                    {step === 'email' && (
                        <>
                            <div className="text-center lg:text-left space-y-1">
                                <h2 className="text-2xl font-black tracking-tight text-[#052326]">
                                    Reset Password
                                </h2>
                                <p className="text-[11px] text-gray-700 font-semibold leading-relaxed">
                                    Enter your email to receive a verification OTP
                                </p>
                            </div>

                            <form className="space-y-4" onSubmit={handleSendOtp}>
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

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-650 text-xs font-semibold rounded-[10px] p-3 text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative flex w-full justify-center items-center gap-2 rounded-[10px] bg-[#052326] py-2.5 px-4 text-xs font-bold tracking-widest text-[#F8F3EF] hover:bg-[#052326]/90 transition-all disabled:opacity-60"
                                >
                                    {loading ? (
                                        <><Loader2 size={14} className="animate-spin" /> Sending OTP...</>
                                    ) : (
                                        <>Send OTP <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ===== STEP: OTP VERIFY ===== */}
                    {step === 'otp' && (
                        <>
                            <div className="text-center lg:text-left space-y-1">
                                <h2 className="text-2xl font-black tracking-tight text-[#052326]">
                                    Verify OTP
                                </h2>
                                <p className="text-[11px] text-gray-700 font-semibold leading-relaxed">
                                    Enter the 4-digit OTP sent to <span className="font-bold text-[#052326]">{email}</span>
                                </p>
                            </div>

                            <form className="space-y-4" onSubmit={handleVerifyOtp}>
                                <div className="space-y-1">
                                    <label htmlFor="otp" className="text-[11px] font-bold tracking-wide text-[#052326]">OTP Code</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        required
                                        className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-2.5 px-4 text-center text-xl font-mono tracking-[0.6em] focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                        placeholder="0000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    />
                                    {devOtp && (
                                        <p className="text-[10px] text-indigo-650 font-mono text-center mt-2">DEV OTP: {devOtp}</p>
                                    )}
                                </div>

                                <div className="flex justify-center">
                                    {timer > 0 ? (
                                        <span className="text-xs text-gray-500 font-semibold">
                                            Resend OTP in 00:{timer.toString().padStart(2, '0')}
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="flex items-center gap-1 text-xs font-bold text-[#052326] hover:underline"
                                        >
                                            <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} /> Resend OTP
                                        </button>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-650 text-xs font-semibold rounded-[10px] p-3 text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); setError(''); setOtp(''); }}
                                        className="flex-1 flex justify-center items-center gap-1 rounded-[10px] border border-gray-300 py-2.5 px-4 text-xs font-bold tracking-widest text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 4}
                                        className="flex-1 flex justify-center items-center gap-2 rounded-[10px] bg-[#052326] py-2.5 px-4 text-xs font-bold tracking-widest text-[#F8F3EF] hover:bg-[#052326]/90 transition-all disabled:opacity-60"
                                    >
                                        Verify <ArrowRight size={14} />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ===== STEP: RESET PASSWORD ===== */}
                    {step === 'reset' && (
                        <>
                            <div className="text-center lg:text-left space-y-1">
                                <h2 className="text-2xl font-black tracking-tight text-[#052326]">
                                    Set New Password
                                </h2>
                                <p className="text-[11px] text-gray-700 font-semibold leading-relaxed">
                                    Create a strong password for your account
                                </p>
                            </div>

                            <form className="space-y-4" onSubmit={handleResetPassword}>
                                <div className="space-y-1">
                                    <label htmlFor="new-password" className="text-[11px] font-bold tracking-wide text-[#052326]">New Password</label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        required
                                        minLength={8}
                                        className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-2.5 px-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                        placeholder="Min 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="confirm-password" className="text-[11px] font-bold tracking-wide text-[#052326]">Confirm Password</label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        required
                                        minLength={8}
                                        className="block w-full rounded-[10px] border border-[#052326]/20 bg-[#F8F3EF]/40 text-[#052326] py-2.5 px-4 placeholder:text-gray-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#052326] focus:border-transparent transition-all"
                                        placeholder="Re-enter password"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-650 text-xs font-semibold rounded-[10px] p-3 text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('otp'); setError(''); }}
                                        className="flex-1 flex justify-center items-center gap-1 rounded-[10px] border border-gray-300 py-2.5 px-4 text-xs font-bold tracking-widest text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex justify-center items-center gap-2 rounded-[10px] bg-[#052326] py-2.5 px-4 text-xs font-bold tracking-widest text-[#F8F3EF] hover:bg-[#052326]/90 transition-all disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <><Loader2 size={14} className="animate-spin" /> Resetting...</>
                                        ) : (
                                            <>Reset Password</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ===== STEP: SUCCESS ===== */}
                    {step === 'done' && (
                        <div className="text-center space-y-5 py-4">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-100">
                                    <CheckCircle size={32} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-[#052326]">Password Reset!</h2>
                                <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">
                                    Your password has been changed successfully. You can now log in with your new password.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#052326] py-2.5 px-8 text-xs font-bold tracking-widest text-[#F8F3EF] hover:bg-[#052326]/90 transition-all"
                            >
                                Go to Login <ArrowRight size={14} />
                            </Link>
                        </div>
                    )}

                    {/* Back to login link */}
                    {step !== 'done' && (
                        <div className="pt-2 text-center text-xs">
                            <Link href="/login" className="inline-flex items-center justify-center gap-1 font-bold text-gray-600 hover:text-[#052326] transition-colors">
                                <ArrowLeft size={12} /> Back to Login
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
