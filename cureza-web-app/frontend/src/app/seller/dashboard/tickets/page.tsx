'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TicketsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/seller/dashboard/support');
    }, [router]);

    return (
        <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cureza-green"></div>
        </div>
    );
}
