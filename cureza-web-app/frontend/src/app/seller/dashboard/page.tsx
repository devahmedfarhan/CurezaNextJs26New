'use client';

import TicketList from '@/components/support/TicketList';

export default function SellerSupportPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Help & Support</h1>
                    <p className="text-sm text-gray-500 font-medium">Need help? Raise a ticket or track your existing support requests.</p>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TicketList role="seller" />
            </div>
        </div>
    );
}
