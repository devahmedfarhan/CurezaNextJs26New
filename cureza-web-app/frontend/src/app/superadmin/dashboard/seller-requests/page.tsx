'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SellerRequestsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/superadmin/dashboard/users/sellers?view=seller_changes');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-cureza-green" />
            <span className="ml-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Redirecting to Seller Profile Changes...</span>
        </div>
    );
}
