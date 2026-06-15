'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Footer from './Footer';

export default function ConditionalFooter() {
    const pathname = usePathname();

    // Define paths where the minimal footer should be shown
    const minimalFooterPaths = [
        '/seller/dashboard', '/seller/onboarding', '/seller/approval',
        '/doctor/dashboard', '/doctor/onboarding', '/doctor/approval'
    ];

    // Check if current path starts with any of the minimal footer paths
    const showMinimalFooter = minimalFooterPaths.some(path => pathname.startsWith(path));

    // Completely hide footer for superadmin, doctor/seller auth pages, and customer auth pages (50/50 layout)
    if (
        pathname.startsWith('/superadmin') || 
        pathname.startsWith('/login') || 
        pathname.startsWith('/register') || 
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/login-otp') ||
        pathname.startsWith('/seller/login') ||
        pathname.startsWith('/seller/register') ||
        pathname.startsWith('/seller/forgot-password') ||
        pathname.startsWith('/doctor/login') ||
        pathname.startsWith('/doctor/register')
    ) {
        return null;
    }

    if (showMinimalFooter) {
        return (
            <footer className="bg-background dark:bg-gray-950 py-6 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <p>© 2025 Cureza Wellness Pvt Ltd. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/legal/privacy-policy" className="hover:text-charcoal dark:hover:text-gray-200">Privacy Policy</Link>
                            <Link href="/legal/terms-of-service" className="hover:text-charcoal dark:hover:text-gray-200">Terms of Service</Link>
                            <Link href="/site-map" className="hover:text-charcoal dark:hover:text-gray-200">Sitemap</Link>
                            <Link href="/faq" className="hover:text-charcoal dark:hover:text-gray-200">Help Center</Link>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    return <Footer />;
}
