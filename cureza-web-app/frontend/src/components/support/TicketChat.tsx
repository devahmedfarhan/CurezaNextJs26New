'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ticketService, Ticket, TicketMessage } from '@/services/ticketService';
import { 
    MessageSquare, Clock, AlertCircle, CheckCircle2, 
    Send, Paperclip, Phone, X, Check, FileText, Download,
    ShieldAlert, ArrowLeft
} from 'lucide-react';

interface TicketChatProps {
    ticket: Ticket;
    currentUserRole: string; // 'admin', 'seller', 'customer', 'doctor'
    onStatusChange?: (newStatus: string) => void;
}

const QUICK_TEMPLATES = [
    {
        label: 'Greeting',
        text: 'Hello! Thank you for contacting Cureza Support. How can we assist you today?',
        type: 'greeting'
    },
    {
        label: 'Pending Update',
        text: 'We have received your query and our team is looking into it. Please allow us some time to investigate. We will get back to you shortly.',
        type: 'pending'
    },
    {
        label: 'Resolve Ticket',
        text: 'Thank you for contacting Cureza. We hope your issue has been resolved. We are closing this ticket now. Let us know if you need anything else! Have a great day!',
        type: 'end',
        autoResolve: true
    }
];

const formatSenderName = (name: string | undefined | null) => {
    if (!name) return '';
    const cleaned = name.replace(/\s+\d+$/, '');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export default function TicketChat({ ticket: initialTicket, currentUserRole, onStatusChange }: TicketChatProps) {
    const [ticket, setTicket] = useState<Ticket>(initialTicket);
    const [newMessage, setNewMessage] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);
    const [sending, setSending] = useState(false);
    const [isInternal, setIsInternal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Callback request states
    const [showCallbackModal, setShowCallbackModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [callbackSuccessMsg, setCallbackSuccessMsg] = useState('');
    const [requestingCall, setRequestingCall] = useState(false);

    // Update local ticket state when prop changes
    useEffect(() => {
        setTicket(initialTicket);
    }, [initialTicket]);

    // Auto-refresh (polling) messages every 5 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const refreshedTicket = await ticketService.getTicket(ticket.id);
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

            // Refresh ticket data to ensure consistency
            const refreshedTicket = await ticketService.getTicket(ticket.id);
            setTicket(refreshedTicket);

        } catch (error) {
            console.error('Failed to reply', error);
            alert('Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleSendTemplateDirect = async (messageText: string, autoResolve?: boolean) => {
        if (autoResolve && !confirm('Are you sure you want to send the closure message and mark this ticket as RESOLVED?')) {
            return;
        }

        setSending(true);
        try {
            const data = new FormData();
            data.append('message', messageText);
            if (isInternal) data.append('is_internal_note', '1');

            const newMsg = await ticketService.replyTicket(ticket.id, data);

            if (autoResolve) {
                const updated = await ticketService.updateStatus(ticket.id, 'RESOLVED');
                if (onStatusChange) onStatusChange(updated.status);
            }

            // Refresh ticket data
            const refreshedTicket = await ticketService.getTicket(ticket.id);
            setTicket(refreshedTicket);

        } catch (error) {
            console.error('Failed to send template reply', error);
            alert('Failed to send template message.');
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
    };

    const handleRequestCallback = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.trim()) return;

        setRequestingCall(true);
        try {
            const data = new FormData();
            data.append('message', `📞 Callback Request: User wants to speak on the phone. Phone Number: ${phoneNumber}`);

            const newMsg = await ticketService.replyTicket(ticket.id, data);

            // Optimistically update UI
            const updatedMessages = [...(ticket.messages || []), newMsg];
            setTicket({ ...ticket, messages: updatedMessages });

            setShowCallbackModal(false);
            setPhoneNumber('');
            setCallbackSuccessMsg("We are calling you shortly. Currently, our customer executive is busy with another person.");

            // Refresh ticket data
            const refreshedTicket = await ticketService.getTicket(ticket.id);
            setTicket(refreshedTicket);
        } catch (error) {
            console.error('Failed to request callback', error);
            alert('Failed to send callback request.');
        } finally {
            setRequestingCall(false);
        }
    };

    const formatMessageTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusLabelColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-neutral-800 bg-neutral-50 border-neutral-250/20';
            case 'IN_PROGRESS': return 'text-neutral-800 bg-neutral-100 border-neutral-250/20';
            case 'WAITING_FOR_USER': return 'text-neutral-600 bg-neutral-50 border-neutral-200';
            case 'RESOLVED': return 'text-emerald-700 bg-emerald-50 border-emerald-150';
            case 'CLOSED': return 'text-rose-700 bg-rose-50 border-rose-150';
            default: return 'text-neutral-705 bg-neutral-50 border-neutral-200';
        }
    };

    const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin';

    const getBackUrl = () => {
        switch (currentUserRole) {
            case 'seller': return '/seller/dashboard/support';
            case 'doctor': return '/doctor/dashboard/support';
            case 'admin':
            case 'super_admin':
                return '/superadmin/dashboard/support';
            default: return '/dashboard/support';
        }
    };

    return (
        <div className="flex flex-col h-[650px] border-[0.35px] border-neutral-950/10 rounded-[10px] bg-white overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b-[0.35px] border-neutral-950/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={getBackUrl()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-black transition-colors mr-2 border-r-[0.35px] border-neutral-950/10 pr-2.5"
                        >
                            <ArrowLeft size={12} className="text-gray-400" />
                            <span>Back to Support</span>
                        </Link>
                        <span className={`px-2.5 py-0.5 rounded-[10px] text-[10px] font-medium uppercase tracking-wider border-[0.35px] ${getStatusLabelColor(ticket.status)}`}>
                            {ticket.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-medium text-gray-400">ID: #{ticket.id}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className="text-xs font-normal text-gray-500">{ticket.category} Stream</span>
                    </div>
                    <h2 className="text-base font-semibold text-gray-900 truncate" title={ticket.subject}>
                        {ticket.subject}
                    </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium tracking-normal">Change Status:</span>
                            <select
                                value={ticket.status}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                className="text-xs bg-white border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black font-medium text-gray-700 cursor-pointer outline-none"
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="WAITING_FOR_USER">Waiting for Reply</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                    )}

                    {!isAdmin && (currentUserRole === 'seller' || currentUserRole === 'doctor') && (
                        <button
                            type="button"
                            onClick={() => setShowCallbackModal(true)}
                            className="text-xs bg-black hover:bg-neutral-900 text-white font-medium px-4 py-2 rounded-[10px] flex items-center gap-1.5 transition-all"
                        >
                            <Phone size={12} />
                            Request Call
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
                {ticket.messages?.map((msg) => {
                    if (msg.is_internal_note && !isAdmin) return null;

                    const isMyRole = msg.sender_role === currentUserRole || 
                        (msg.sender_role === 'vendor' && currentUserRole === 'seller') ||
                        (msg.sender_role === 'seller' && currentUserRole === 'vendor') ||
                        ((msg.sender_role === 'admin' || msg.sender_role === 'super_admin') && 
                         (currentUserRole === 'admin' || currentUserRole === 'super_admin'));

                    return (
                        <div 
                            key={msg.id} 
                            className={`flex flex-col ${isMyRole ? 'items-end' : 'items-start'} space-y-1.5`}
                        >
                            {/* Sender Info Label */}
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 px-1 font-medium">
                                <span className="text-gray-600 dark:text-gray-300">
                                    {formatSenderName(msg.sender?.name || msg.sender_role)}
                                </span>
                                {msg.is_internal_note && (
                                    <span className="text-amber-700 bg-amber-50 px-1 rounded text-[8px] font-medium uppercase border-[0.35px] border-amber-500/10">Note</span>
                                )}
                                <span>•</span>
                                <span>{formatMessageTime(msg.created_at)}</span>
                            </div>

                            {/* Bubble Card */}
                             <div className={`max-w-[75%] rounded-[10px] px-4 py-3 border-[0.35px] text-xs leading-relaxed ${
                                 msg.is_internal_note 
                                     ? 'bg-amber-50/80 border-amber-500/10 text-amber-900 rounded-tl-none' 
                                     : isMyRole 
                                         ? 'bg-black text-white border-black rounded-tr-none' 
                                         : 'bg-white text-gray-800 border-neutral-950/10 rounded-tl-none'
                             }`}>
                                <p className="whitespace-pre-wrap">{msg.message}</p>

                                {/* Attachments */}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="mt-3 pt-2.5 border-t-[0.35px] border-neutral-950/10 space-y-1.5">
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
                                                 className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] text-[10px] font-medium border-[0.35px] transition-all ${
                                                     isMyRole 
                                                         ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
                                                         : 'bg-neutral-50 hover:bg-neutral-100 text-gray-600 border-neutral-950/10'
                                                 }`}
                                            >
                                                <Paperclip size={10} />
                                                <span className="truncate max-w-[150px]">{att.file_name}</span>
                                                <span className="opacity-60 font-normal">({Math.round(att.file_size / 1024)}KB)</span>
                                                <Download size={10} className="ml-auto" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Read / Seen Indicator */}
                            {isMyRole && !msg.is_internal_note && (
                                <div className="text-[9px] text-gray-400 font-bold px-1 select-none">
                                    {msg.is_read ? (
                                        <span className="text-cureza-green flex items-center gap-0.5">
                                            <Check size={9} /> Seen
                                        </span>
                                    ) : (
                                        <span>Sent</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input / Action Area */}
            {ticket.status === 'CLOSED' && !isAdmin ? (
                <div className="p-4 bg-neutral-50 border-t-[0.35px] border-neutral-950/10 text-center text-gray-400 text-xs font-medium uppercase tracking-wider">
                    This ticket has been marked as Closed.
                </div>
            ) : (
                <div className="p-4 border-t-[0.35px] border-neutral-950/10 bg-white space-y-3 shrink-0">
                    {/* Admin Response Templates */}
                    {isAdmin && (
                        <div className="p-3 bg-neutral-50 rounded-[10px] border-[0.35px] border-neutral-950/10">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Auto-Response Presets</p>
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_TEMPLATES.map((tmpl) => (
                                    <div key={tmpl.label} className="inline-flex items-center rounded-[10px] border-[0.35px] border-neutral-950/10 bg-white overflow-hidden p-0.5 text-[10px]">
                                        <button
                                            type="button"
                                            onClick={() => setNewMessage(tmpl.text)}
                                            className="px-2 py-1 font-medium text-gray-650 hover:bg-neutral-50 transition-colors"
                                        >
                                            {tmpl.label}
                                        </button>
                                        <div className="w-px h-3 bg-black/[0.05]"></div>
                                        <button
                                            type="button"
                                            onClick={() => handleSendTemplateDirect(tmpl.text, tmpl.autoResolve)}
                                            disabled={sending}
                                            className="px-2 py-1 font-semibold text-emerald-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                                        >
                                            Send
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleReply} className="space-y-3">
                        {isAdmin && (
                            <div className="flex items-center gap-2 select-none">
                                <input
                                    type="checkbox"
                                    id="internal"
                                    checked={isInternal}
                                    onChange={e => setIsInternal(e.target.checked)}
                                    className="rounded border-neutral-950/20 text-black focus:ring-black w-3.5 h-3.5"
                                    style={{ borderRadius: '4px' }}
                                />
                                <label htmlFor="internal" className="text-xs font-medium text-gray-500 cursor-pointer">
                                    Flag as Admin Internal Note (hidden from client)
                                </label>
                            </div>
                        )}

                        <div className="flex gap-2.5 items-end">
                            <div className="flex-1 relative">
                                <textarea
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder={isInternal ? "Type private admin note..." : "Write your message..."}
                                    rows={2}
                                    className="w-full border-[0.35px] border-neutral-950/10 focus:border-black rounded-[10px] pl-3 pr-10 py-2.5 text-xs outline-none bg-white dark:bg-gray-900 font-normal resize-none"
                                ></textarea>
                                
                                {/* Custom File Attachment Icon Button overlay */}
                                <div className="absolute right-2.5 bottom-2.5">
                                    <input
                                        type="file"
                                        id="attachments-selector"
                                        multiple
                                        className="hidden"
                                        onChange={e => setFiles(e.target.files)}
                                    />
                                    <label
                                        htmlFor="attachments-selector"
                                        className={`p-1.5 rounded-[10px] hover:bg-neutral-100 text-gray-400 cursor-pointer block transition-colors ${files && files.length > 0 ? 'bg-emerald-50 text-emerald-700' : ''}`}
                                        title="Attach documents"
                                    >
                                        <Paperclip size={14} />
                                    </label>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={sending || (!newMessage.trim() && !files)}
                                className="bg-black text-white px-4 py-2.5 rounded-[10px] hover:bg-neutral-900 disabled:opacity-50 h-[38px] flex items-center justify-center transition-all shrink-0"
                            >
                                {sending ? '...' : <Send size={14} />}
                            </button>
                        </div>
                        
                        {/* Selected files feedback pill */}
                        {files && files.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {Array.from(files).map((f, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 bg-gray-50 border-[0.35px] border-neutral-950/10 text-[9px] font-bold text-gray-600 px-2 py-0.5 rounded-[8px]">
                                        <Paperclip size={8} />
                                        {f.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Call Request Modal Overlay */}
            {showCallbackModal && (
                <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-[10px] border-[0.35px] border-neutral-950/10 max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-neutral-50 text-neutral-800 rounded-[10px] flex items-center justify-center border-[0.35px] border-neutral-950/10">
                                <Phone size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Request Callback</h3>
                                <p className="text-xs text-gray-500 font-normal">Our team will call you back on this number shortly.</p>
                            </div>
                        </div>
                        <form onSubmit={handleRequestCallback}>
                            <div className="mb-4">
                                <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your phone number (e.g. +91 98765 43210)"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full border-[0.35px] border-neutral-950/10 rounded-[10px] px-3.5 py-2.5 focus:border-black outline-none text-xs font-normal"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowCallbackModal(false)}
                                    className="px-4 py-2 border-[0.35px] border-neutral-950/10 text-xs font-medium text-gray-700 hover:bg-neutral-50 rounded-[10px] transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={requestingCall}
                                    className="bg-black hover:bg-neutral-900 disabled:opacity-50 text-white px-4 py-2 text-xs font-medium rounded-[10px] transition"
                                >
                                    {requestingCall ? 'Requesting...' : 'Request Callback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Feedback Modal Overlay */}
            {callbackSuccessMsg && (
                <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-[10px] border-[0.35px] border-neutral-950/10 max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border-[0.35px] border-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={24} />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Callback Requested</h3>
                        <p className="text-xs text-gray-500 mb-6 leading-relaxed font-normal">
                            {callbackSuccessMsg}
                        </p>
                        <button
                            type="button"
                            onClick={() => setCallbackSuccessMsg('')}
                            className="bg-black hover:bg-neutral-900 text-white px-6 py-2 text-xs font-medium rounded-[10px] transition w-full"
                        >
                            Okay, Got It
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
