'use client';

import TicketList from '@/components/support/TicketList';

export default function CustomerSupportPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Customer Support</h1>
            <TicketList role="customer" />
        </div>
    );
}
