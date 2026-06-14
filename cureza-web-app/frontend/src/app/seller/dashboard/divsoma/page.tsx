'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DivSomaRedirectPage() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const brandSlug = user?.brand?.slug || (user as any)?.seller_profile?.brand_name?.toLowerCase().replace(/\s+/g, '-') || 'brand';
            router.replace(`/seller/dashboard/${brandSlug}`);
        }
    }, [user, router]);

    return (
        <div className="flex h-[50vh] items-center justify-center bg-gray-55/20 rounded-3xl">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cureza-green"></div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Redirecting to your brand ledger...</span>
            </div>
        </div>
    );
}
