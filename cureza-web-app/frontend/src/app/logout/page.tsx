'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
    const router = useRouter();
    const { logout } = useAuth();

    useEffect(() => {
        // Perform logout logic
        logout();

        // Wait for 2 seconds to show animation, then redirect to home
        const timer = setTimeout(() => {
            router.push('/');
        }, 2000);

        return () => clearTimeout(timer);
    }, [logout, router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-warm-sand dark:bg-gray-950">
            <div className="text-center space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-cureza-green/30 border-t-cureza-green rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-cureza-green animate-pulse" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-charcoal dark:text-gray-100 animate-pulse">
                    Logging out securely...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Thank you for visiting Cureza. See you soon!
                </p>
            </div>
        </div>
    );
}
