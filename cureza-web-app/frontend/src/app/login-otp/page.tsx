'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Loader2, Phone, Mail, RotateCw } from 'lucide-react';
import axios from '@/lib/api';

export default function OtpLoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    // Step 1: Input (Email or Phone)
    // Step 2: OTP Verification
    const [step, setStep] = useState<1 | 2>(1);

    const [loginId, setLoginId] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [devOtp, setDevOtp] = useState<string | null>(null); // For demo

    // Timer for resend
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setDevOtp(null);

        try {
            const response = await axios.post('/auth/send-otp', { login_id: loginId });

            if (response.data.action === 'register_required') {
                setError(
                    <span>
                        {response.data.message} <Link href={`/register?login_id=${encodeURIComponent(loginId)}`} className="font-bold underline text-inherit">Create Account</Link>
                    </span>
                );
                return; // Stop here
            }

            // Success
            setStep(2);
            setTimeLeft(60); // 60 seconds cooldown
            if (response.data.dev_otp) {
                setDevOtp(response.data.dev_otp);
                console.log('DEV OTP:', response.data.dev_otp);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('/auth/verify-otp', {
                login_id: loginId,
                otp
            });

            if (response.data.action === 'login') {
                await login(response.data.access_token, response.data.user);
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.errors?.otp?.[0] || 'Invalid OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('/auth/send-otp', { login_id: loginId });
            setTimeLeft(60);
            if (response.data.dev_otp) {
                setDevOtp(response.data.dev_otp);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <h1 className="text-3xl font-bold text-cureza-green tracking-tight">Cureza</h1>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {step === 1 ? 'Login with OTP' : 'Verify Identity'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {step === 1
                        ? 'Enter your email or phone number to receive a one-time password'
                        : `Enter the code sent to ${loginId}`
                    }
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">

                    {error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label htmlFor="loginId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email or Phone Number
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="loginId"
                                        name="loginId"
                                        type="text"
                                        required
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-cureza-green focus:border-cureza-green sm:text-sm"
                                        placeholder="user@example.com or 9876543210"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cureza-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cureza-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    One-Time Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only numbers
                                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-cureza-green focus:border-cureza-green sm:text-sm text-center tracking-widest text-2xl font-mono"
                                        placeholder="0000"
                                    />
                                </div>
                            </div>

                            {devOtp && (
                                <div className="text-xs text-center text-blue-500 font-mono bg-blue-50 p-2 rounded">
                                    Dev Mode: Your OTP is {devOtp}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                                >
                                    Change Email/Phone
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={timeLeft > 0 || isLoading}
                                    className={`text-sm font-medium flex items-center gap-1 ${timeLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-cureza-green hover:text-green-700'}`}
                                >
                                    <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                    {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend OTP'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cureza-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cureza-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify & Login'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                    Or
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Link
                                href="/login"
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Sign in with Password
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
