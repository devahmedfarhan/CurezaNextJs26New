'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Smartphone, Lock } from 'lucide-react';

export default function OTPVerificationPage() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join('');
        console.log('Verifying OTP:', otpValue);
        // Add verification logic here
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
                        Secure<br />
                        Verification.
                    </h1>
                    <p className="text-xl text-green-100 max-w-lg mb-8">
                        Protecting your account is our top priority. Please verify your identity to proceed.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="font-medium">Two-Factor Authentication</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Smartphone size={20} />
                            </div>
                            <span className="font-medium">Mobile Verification</span>
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
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-charcoal">
                            Verify OTP
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Enter the 6-digit code sent to your phone/email
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-gray-300 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-cureza-green focus:border-transparent transition-colors"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                />
                            ))}
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative flex w-full justify-center items-center gap-2 rounded-lg bg-cureza-green py-2.5 px-4 text-sm font-bold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cureza-green transition-all"
                            >
                                Verify & Proceed
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-sm">
                        <p className="text-gray-600 mb-2">Didn't receive code?</p>
                        <button className="font-bold text-cureza-green hover:text-green-700 transition-colors">
                            Resend OTP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
