'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ShippingSettingsPageRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push('/superadmin/dashboard/settings/checkout-cart');
    }, [router]);

    return (
        <div className="max-w-md mx-auto my-20 p-8 bg-white border border-gray-200 rounded-2xl shadow-sm text-center font-sans space-y-6">
            <div className="flex justify-center">
                <Loader2 className="animate-spin text-green-600" size={40} />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-950">Settings Unified</h2>
                <p className="text-gray-500 text-sm">
                    Shipping settings have been merged into the unified Checkout & Cart panel. Redirecting you there now...
                </p>
            </div>
            <div className="pt-2">
                <Link
                    href="/superadmin/dashboard/settings/checkout-cart"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 transition"
                >
                    Click here if not redirected automatically <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );
}
