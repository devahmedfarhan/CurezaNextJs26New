'use client';

import TicketList from '@/components/support/TicketList';

export default function DoctorSupportPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-base font-bold text-gray-800 tracking-tight">Support</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">Submit and track support tickets</p>
            </div>
            <TicketList role="doctor" />
        </div>
    );
}
