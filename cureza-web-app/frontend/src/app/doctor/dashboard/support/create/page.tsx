'use client';

import CreateTicketModal from '@/components/support/CreateTicketModal';
import { useRouter } from 'next/navigation';

export default function CreateTicketPage() {
    const router = useRouter();

    return (
        <CreateTicketModal
            role="doctor"
            onClose={() => router.push('/doctor/dashboard/support')}
        />
    );
}
