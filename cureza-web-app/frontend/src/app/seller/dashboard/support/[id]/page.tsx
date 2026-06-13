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

    if (loading) return <div>Loading...</div>;
    if (!ticket) return <div>Ticket not found</div>;

    return (
        <div className="w-full">
            <TicketChat ticket={ticket} currentUserRole="seller" />
        </div>
    );
}
