'use client';

import { useState } from 'react';
import TicketList from '@/components/support/TicketList';
import TicketChat from '@/components/support/TicketChat';
import { Ticket } from '@/services/ticketService';
import { X, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminSupportPage() {
    const [openTickets, setOpenTickets] = useState<Ticket[]>([]);

    const handleTicketClick = (ticket: Ticket) => {
        // Prevent opening duplicates
        if (openTickets.some(t => t.id === ticket.id)) return;
        setOpenTickets(prev => [...prev, ticket]);
    };

    const handleCloseChat = (ticketId: number) => {
        setOpenTickets(prev => prev.filter(t => t.id !== ticketId));
    };

    const handleStatusChangeOnPanel = (ticketId: number, newStatus: string) => {
        setOpenTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
    };

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Support Operations Hub</h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Super Admin workspace. Click tickets to open multiple live chats in parallel.
                </p>
            </div>

            {/* Split layout based on active opened tickets */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left side: Ticket list */}
                <div className={`w-full ${openTickets.length > 0 ? 'lg:w-[350px] xl:w-[420px] shrink-0' : 'w-full'} transition-all duration-300`}>
                    <TicketList role="admin" onTicketClick={handleTicketClick} />
                </div>

                {/* Right side: Multi-chat panels workspace */}
                {openTickets.length > 0 ? (
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                <MessageSquare size={13} />
                                Active live chats ({openTickets.length})
                            </span>
                            <button 
                                onClick={() => setOpenTickets([])} 
                                className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                                Close All Chats
                            </button>
                        </div>

                        {/* Responsive grid of chat windows */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {openTickets.map((t) => (
                                <div 
                                    key={t.id} 
                                    className="relative bg-white rounded-[8px] border border-black/[0.05] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
                                >
                                    {/* Overlay close button on the chat window */}
                                    <button
                                        onClick={() => handleCloseChat(t.id)}
                                        className="absolute right-14 top-3.5 p-1 hover:bg-gray-150 rounded-full text-gray-400 hover:text-gray-600 z-50 transition-colors"
                                        title="Close Chat Panel"
                                    >
                                        <X size={15} />
                                    </button>

                                    <TicketChat 
                                        ticket={t} 
                                        currentUserRole="admin" 
                                        onStatusChange={(status) => handleStatusChangeOnPanel(t.id, status)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex flex-1 min-h-[400px] border border-dashed border-black/[0.05] rounded-[8px] items-center justify-center text-center p-8 bg-gray-50/20">
                        <div className="space-y-2 max-w-sm">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto">
                                <AlertCircle size={20} />
                            </div>
                            <h4 className="font-bold text-gray-700 text-sm">No Live Chats Active</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Click on any support request in the list on the left to pin its live conversation window side-by-side.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
