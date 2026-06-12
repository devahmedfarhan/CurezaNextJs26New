'use client';

import CreateTicketModal from '@/components/support/CreateTicketModal';
import { useRouter } from 'next/navigation';

// For the customer dashboard, we'll render this as a page, wrapping the modal logic or just reusing the form.
// Since the modal is designed to be a modal, we can wrap it or extract the form.
// For simplicity and reusing the modal component, we will just render the modal here 
// and handle close by navigating back.

export default function CreateTicketPage() {
    const router = useRouter();

    return (
        <CreateTicketModal
            role="customer"
            onClose={() => router.push('/dashboard/support')}
        />
    );
}
