'use client';

import TicketList from '@/components/support/TicketList';

export default function AdminSupportPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Support Admin Panel</h1>
            <TicketList role="admin" />
        </div>
    );
}
