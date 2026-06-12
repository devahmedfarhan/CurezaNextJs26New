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
        <div className="min-h-screen flex bg-warm-sand">
            {/* Left Side - Content */}
            <div className="hidden lg:flex lg:w-1/2 bg-cureza-green text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="text-3xl font-bold flex items-center gap-2 mb-12">
                        <span className="bg-white text-cureza-green p-1 rounded">Cz</span>
                        Cureza
                    </Link>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Secure Account<br />
                        Recovery.
                    </h1>
                    <p className="text-xl text-green-100 max-w-lg mb-8">
                        Don't worry, it happens to the best of us. We'll help you get back to your wellness journey in no time.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Shield size={20} />
                            </div>
                            <span className="font-medium">Secure OTP Verification</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Key size={20} />
                            </div>
                            <span className="font-medium">Instant Password Reset</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-green-100">
                    © 2025 Cureza Wellness Pvt Ltd.
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
                    <Lock size={400} />
                </div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 opacity-10">
                    <div className="w-80 h-80 rounded-full border-8 border-white"></div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">

                    {/* ===== STEP: EMAIL ===== */}
                    {step === 'email' && (
                        <>
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl font-bold tracking-tight text-charcoal">
                                    Reset Password
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter your email to receive a verification OTP
                                </p>
                            </div>

                            <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
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

                                {error && (
                                    <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-cureza-green py-2.5 px-4 text-sm font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cureza-green transition-all disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Sending OTP...</>
                                        ) : (
                                            <>Send OTP <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ===== STEP: OTP VERIFY ===== */}
                    {step === 'otp' && (
                        <>
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl font-bold tracking-tight text-charcoal">
                                    Verify OTP
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Enter the 4-digit OTP sent to <span className="font-semibold text-charcoal">{email}</span>
                                </p>
                            </div>

                            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-3 px-4 text-center text-2xl font-mono tracking-[0.8em] focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors"
                                        placeholder="0000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    />
                                    {devOtp && (
                                        <p className="text-xs text-indigo-500 font-mono text-center mt-2">DEV OTP: {devOtp}</p>
                                    )}
                                </div>

                                {/* Resend OTP */}
                                <div className="flex justify-center">
                                    {timer > 0 ? (
                                        <span className="text-sm text-gray-500">
                                            Resend OTP in <span className="font-semibold text-charcoal">00:{timer.toString().padStart(2, '0')}</span>
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="flex items-center gap-1 text-sm font-semibold text-cureza-green hover:underline"
                                        >
                                            <RefreshCw size={14} /> Resend OTP
                                        </button>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); setError(''); setOtp(''); }}
                                        className="flex-1 flex justify-center items-center gap-1 rounded-lg border border-gray-300 py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 4}
                                        className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-cureza-green py-2.5 px-4 text-sm font-bold text-white hover:bg-green-700 transition-all disabled:opacity-60"
                                    >
                                        Verify <ArrowRight size={16} />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {/* ===== STEP: RESET PASSWORD ===== */}
                    {step === 'reset' && (
                        <>
                            <div className="text-center lg:text-left">
                                <h2 className="text-3xl font-bold tracking-tight text-charcoal">
                                    Set New Password
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Create a strong password for your account
                                </p>
                            </div>

                            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        required
                                        minLength={8}
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="Min 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        required
                                        minLength={8}
                                        className="block w-full rounded-lg border border-gray-300 bg-white text-charcoal py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors sm:text-sm"
                                        placeholder="Re-enter password"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('otp'); setError(''); }}
                                        className="flex-1 flex justify-center items-center gap-1 rounded-lg border border-gray-300 py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex justify-center items-center gap-2 rounded-lg bg-cureza-green py-2.5 px-4 text-sm font-bold text-white hover:bg-green-700 transition-all disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Resetting...</>
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
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center ring-8 ring-green-50">
                                    <CheckCircle size={40} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-charcoal">Password Reset!</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Your password has been changed successfully. You can now log in with your new password.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cureza-green py-2.5 px-8 text-sm font-bold text-white hover:bg-green-700 transition-all"
                            >
                                Go to Login <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}

                    {/* Back to login link */}
                    {step !== 'done' && (
                        <div className="text-center text-sm">
                            <Link href="/login" className="flex items-center justify-center gap-1 font-medium text-gray-600 hover:text-cureza-green transition-colors">
                                <ArrowLeft size={14} /> Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
