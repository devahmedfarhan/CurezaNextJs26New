'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ticketService, Ticket } from '@/services/ticketService';
import TicketChat from '@/components/support/TicketChat';

export default function TicketChatPage() {
    const params = useParams();
    const id = Number(params.id);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTicket();
        }
    }, [id]);

    const fetchTicket = async () => {
        try {
            const data = await ticketService.getTicket(id);
            setTicket(data);
        } catch (error) {
            console.error('Failed to fetch ticket', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-xs text-gray-500 font-medium p-8">Loading...</div>;
    if (!ticket) return <div className="text-xs text-gray-500 font-medium p-8">Ticket not found</div>;

    return (
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex justify-between items-center border-b-[0.35px] border-neutral-950/10 pb-4">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Ticket #{ticket.id}</h1>
                <span className="text-xs text-gray-550 font-medium">Managing as Admin</span>
            </div>
            <TicketChat
                ticket={ticket}
                currentUserRole="admin"
                onStatusChange={(newStatus) => setTicket({ ...ticket, status: newStatus })}
            />
        </div>
    );
}
