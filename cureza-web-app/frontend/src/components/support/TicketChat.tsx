'use client';
import { useState, useRef, useEffect } from 'react';
import { ticketService, Ticket, TicketMessage } from '@/services/ticketService';

interface TicketChatProps {
    ticket: Ticket;
    currentUserRole: string; // 'admin', 'seller', 'customer', 'doctor'
    onStatusChange?: (newStatus: string) => void;
}

export default function TicketChat({ ticket: initialTicket, currentUserRole, onStatusChange }: TicketChatProps) {
    const [ticket, setTicket] = useState<Ticket>(initialTicket);
    const [newMessage, setNewMessage] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);
    const [sending, setSending] = useState(false);
    const [isInternal, setIsInternal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Update local ticket state when prop changes
    useEffect(() => {
        setTicket(initialTicket);
    }, [initialTicket]);

    // Auto-refresh (polling) messages every 5 seconds so users don't have to manually reload
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const refreshedTicket = await ticketService.getTicket(ticket.id);
                // Compare messages length or specific attributes to update state
                const msgLengthChanged = (refreshedTicket.messages?.length !== ticket.messages?.length);
                const statusChanged = refreshedTicket.status !== ticket.status;
                const readStatusChanged = refreshedTicket.messages?.some((m: any, idx: number) => {
                    return m.is_read !== (ticket.messages && ticket.messages[idx]?.is_read);
                });

                if (msgLengthChanged || statusChanged || readStatusChanged) {
                    setTicket(refreshedTicket);
                }
            } catch (err) {
                console.error('Polling ticket updates failed:', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [ticket.id, ticket.messages, ticket.status]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket.messages]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !files) return;

        setSending(true);
        try {
            const data = new FormData();
            data.append('message', newMessage);
            if (isInternal) data.append('is_internal_note', '1');

            if (files) {
                for (let i = 0; i < files.length; i++) {
                    data.append('attachments[]', files[i]);
                }
            }

            const newMsg = await ticketService.replyTicket(ticket.id, data);

            // Optimistically update UI
            const updatedMessages = [...(ticket.messages || []), newMsg];
            setTicket({ ...ticket, messages: updatedMessages });

            setNewMessage('');
            setFiles(null);
            setIsInternal(false);

            // Refresh ticket data to ensure consistency (especially for status updates triggered by backend)
            const refreshedTicket = await ticketService.getTicket(ticket.id);
            setTicket(refreshedTicket);

        } catch (error) {
            console.error('Failed to reply', error);
            alert('Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Change status to ${newStatus}?`)) return;
        try {
            const updated = await ticketService.updateStatus(ticket.id, newStatus);
            setTicket({ ...ticket, status: updated.status });
            if (onStatusChange) onStatusChange(updated.status);
        } catch (error) {
            console.error('Failed to update status', error);
        }
    }

    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin';

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-white shadow-sm">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        {ticket.subject}
                        <span className="text-xs font-normal px-2 py-0.5 bg-gray-200 rounded text-gray-600">#{ticket.id}</span>
                    </h2>
                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>Status: <b className={ticket.status === 'OPEN' ? 'text-green-600' : 'text-gray-700'}>{ticket.status}</b></span>
                        <span>Category: <b>{ticket.category}</b></span>
                        <span>Priority: <b>{ticket.priority}</b></span>
                        {isAdmin && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="flex flex-wrap items-center gap-1.5">
                                    {ticket.created_by_role === 'doctor' && (
                                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                                            👨‍⚕️ Doctor Portal
                                        </span>
                                    )}
                                    {ticket.created_by_role === 'seller' && (
                                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                                            🏪 Seller Portal
                                        </span>
                                    )}
                                    {ticket.created_by_role === 'customer' && (
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                                            👤 Customer Portal
                                        </span>
                                    )}
                                    {ticket.creator && (
                                        <span className="text-xs font-semibold text-gray-600">
                                            User: <b className="text-gray-900">{ticket.creator.name} ({ticket.creator.email})</b>
                                        </span>
                                    )}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-semibold">Change Status:</span>
                        <select
                            value={ticket.status}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            className="text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer shadow-sm"
                        >
                            <option value="OPEN">🟢 Open</option>
                            <option value="IN_PROGRESS">🔵 In Progress</option>
                            <option value="WAITING_FOR_USER">🟠 Waiting for Reply</option>
                            <option value="RESOLVED">⚪ Resolved</option>
                            <option value="CLOSED">🔴 Closed</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {ticket.messages?.map((msg) => {
                    // Hide internal notes from non-admins
                    if (msg.is_internal_note && !isAdmin) return null;

                    const isMyRole = msg.sender_role === currentUserRole || 
                        ((msg.sender_role === 'admin' || msg.sender_role === 'super_admin') && 
                         (currentUserRole === 'admin' || currentUserRole === 'super_admin'));
                    const isStaff = msg.sender_role === 'admin' || msg.sender_role === 'super_admin';

                    return (
                        <div key={msg.id} className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'} ${msg.is_internal_note ? 'opacity-75' : ''}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${msg.is_internal_note ? 'bg-yellow-100 border border-yellow-300' :
                                isStaff ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'
                                }`}>
                                <div className="text-xs opacity-75 mb-1 flex justify-between gap-4">
                                    <span className="font-bold capitalize">{msg.sender_role} {msg.is_internal_note && '(Internal Note)'}</span>
                                    <span className="flex items-center gap-1.5">
                                        {new Date(msg.created_at).toLocaleString()}
                                        {isMyRole && !msg.is_internal_note && (
                                            <span className="text-[10px] font-extrabold tracking-wider uppercase ml-1 px-1 bg-black/10 rounded">
                                                {msg.is_read ? '✓ Seen' : '✓ Sent'}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <p className="whitespace-pre-wrap">{msg.message}</p>

                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {msg.attachments.map(att => (
                                            <button
                                                key={att.id}
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    try {
                                                        await ticketService.downloadAttachment(ticket.id, att.id, att.file_name);
                                                    } catch (err) {
                                                        alert('Failed to download: ' + err);
                                                    }
                                                }}
                                                className={`block text-xs underline text-left ${isStaff ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
                                            >
                                                📎 {att.file_name} ({Math.round(att.file_size / 1024)}KB)
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {ticket.status === 'CLOSED' && !isAdmin ? (
                <div className="p-4 bg-gray-100 text-center text-gray-500 text-sm">
                    This ticket is closed. You cannot reply.
                </div>
            ) : (
                <form onSubmit={handleReply} className="p-4 border-t bg-white rounded-b-lg">
                    {isAdmin && (
                        <div className="mb-2 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="internal"
                                checked={isInternal}
                                onChange={e => setIsInternal(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="internal" className="text-sm text-gray-600 select-none cursor-pointer">Internal Note (Visible only to admins)</label>
                        </div>
                    )}

                    <div className="flex gap-2 items-start">
                        <div className="flex-1">
                            <textarea
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Write your reply..."
                                rows={2}
                                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                            ></textarea>
                            <div className="mt-2">
                                <input
                                    type="file"
                                    multiple
                                    className="text-xs text-gray-500"
                                    onChange={e => setFiles(e.target.files)}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={sending || (!newMessage.trim() && !files)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 h-10 flex items-center"
                        >
                            {sending ? '...' : 'Send'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
