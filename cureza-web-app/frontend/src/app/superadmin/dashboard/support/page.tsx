'use client';

import { useState } from 'react';
import TicketList from '@/components/support/TicketList';
import TicketChat from '@/components/support/TicketChat';
import { Ticket } from '@/services/ticketService';
import { X, MessageSquare, AlertCircle, HelpCircle } from 'lucide-react';

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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Support Operations Hub</h1>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
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
                        <div className="flex items-center justify-between border-b-[0.35px] border-black/50 pb-3">
                            <span className="text-xs font-medium tracking-normal text-gray-500 flex items-center gap-1.5">
                                <MessageSquare size={13} />
                                Active Live Chats ({openTickets.length})
                            </span>
                            <button 
                                onClick={() => setOpenTickets([])} 
                                className="text-xs font-medium text-red-650 hover:text-red-750 hover:bg-red-50/50 px-2.5 py-1 rounded-[10px] transition-colors"
                            >
                                Close All Chats
                            </button>
                        </div>

                        {/* Responsive grid of chat windows */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {openTickets.map((t) => (
                                <div 
                                    key={t.id} 
                                    className="relative bg-white rounded-[10px] border-[0.35px] border-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
                                >
                                    {/* Overlay close button on the chat window */}
                                    <button
                                        onClick={() => handleCloseChat(t.id)}
                                        className="absolute right-14 top-3.5 p-1 hover:bg-neutral-100 rounded-full text-gray-400 hover:text-gray-600 z-50 transition-colors"
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
                    <div className="hidden lg:flex flex-1 min-h-[400px] border-[0.35px] border-dashed border-black/50 rounded-[10px] items-center justify-center text-center p-8 bg-neutral-50/10">
                        <div className="space-y-2 max-w-sm">
                            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-gray-400 mx-auto">
                                <AlertCircle size={20} />
                            </div>
                            <h4 className="font-medium text-gray-800 text-sm">No Live Chats Active</h4>
                            <p className="text-xs text-gray-500 font-normal leading-relaxed">
                                Click on any support request in the list on the left to pin its live conversation window side-by-side.
                            </p>
                        </div>
                    </div>
                )}

            </div>

            {/* Tutorial & Guidelines Section */}
            <div className="bg-neutral-50 border-[0.35px] border-black/50 rounded-[10px] p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-black" />
                    <h3 className="text-sm font-semibold text-gray-900">How It Works & Guidelines | Support Operations Hub</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-600 leading-relaxed font-normal">
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">1. Live Chat Management (Live Chat Kaise Handle Karein)</h4>
                        <p>
                            Aap left side par diye gaye tickets me se kisi bhi ticket par click kar ke active chats panel open kar sakte hain. Multiple tickets par click kar ke aap parallel me multiple chats monitor aur reply kar sakte hain.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">2. Internal Notes & Status Updates</h4>
                        <p>
                            Chat ke dauran aap status dropdown se ticket ka status change kar sakte hain (jaise: Open, In Progress, Resolved). "Flag as Admin Internal Note" check box select karke aap aisi private notes add kar sakte hain jo sirf admins ko dikhegi, customer se hidden rahegi.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">3. Callback Requests (Phone Call Alerts)</h4>
                        <p>
                            Sellers aur Doctors support panel se dynamic callback request send kar sakte hain. Jab aisi request aayegi toh system me alert notification create hoga aur chat thread me callback ticket generate ho jayegi taaki admin direct reach out kar sake.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
