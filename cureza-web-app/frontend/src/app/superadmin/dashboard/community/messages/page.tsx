'use client';

import { useState, useEffect } from 'react';
import { Send, MessageSquare, Clock, CheckCircle2, User, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface InfluencerMessage {
    id: number;
    subject: string;
    message: string;
    status: 'pending' | 'replied';
    reply_text: string | null;
    created_at: string;
    replied_at: string | null;
    customer: {
        name: string;
        email: string;
    };
    replier?: {
        name: string;
    };
}

export default function AdminInfluencerMessages() {
    const [messages, setMessages] = useState<InfluencerMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('pending');

    // Reply Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState<InfluencerMessage | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/influencer-messages', {
                params: {
                    page,
                    status: statusFilter
                }
            });
            setMessages(res.data?.data?.data || []);
            setTotalPages(res.data?.data?.last_page || 1);
        } catch (err) {
            console.error("Error loading messages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [page, statusFilter]);

    const handleOpenModal = (msg: InfluencerMessage) => {
        setSelectedMsg(msg);
        setReplyText('');
        setIsModalOpen(true);
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMsg) return;
        setSubmitting(true);

        try {
            await api.post(`/admin/influencer-messages/${selectedMsg.id}/reply`, {
                reply_text: replyText
            });
            setIsModalOpen(false);
            fetchMessages();
        } catch (err) {
            console.error("Error sending reply:", err);
            alert("Failed to send reply.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            
            {/* Filters Row */}
            <div className="flex items-center justify-between bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 shadow-sm">
                <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filter Status</label>
                    <select 
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white focus:outline-none"
                    >
                        <option value="">All Messages</option>
                        <option value="pending">Pending Reply</option>
                        <option value="replied">Replied</option>
                    </select>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    Respond to influencer requests for collaborations, free samples, and payout inquiries.
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500 font-medium">No messages found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 border-b-[0.5px] border-black/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3 w-48">Customer</th>
                                    <th className="p-3 w-64">Subject & Inquiry</th>
                                    <th className="p-3">Date Sent</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Response</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-[0.5px] divide-neutral-950/10">
                                {messages.map((msg) => {
                                    let badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-150';
                                    if (msg.status === 'replied') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';

                                    return (
                                        <tr key={msg.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="p-3">
                                                <p className="font-semibold text-gray-900">{msg.customer.name}</p>
                                                <p className="text-[10px] text-gray-400">{msg.customer.email}</p>
                                            </td>
                                            <td className="p-3">
                                                <p className="font-semibold text-gray-900">{msg.subject}</p>
                                                <p className="text-gray-500 mt-1 italic">"{msg.message}"</p>
                                            </td>
                                            <td className="p-3 text-gray-500 font-medium">
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-block text-[10px] font-bold border rounded px-1.5 py-0.5 uppercase tracking-wider ${badgeColor}`}>
                                                    {msg.status === 'pending' ? 'Pending' : 'Replied'}
                                                </span>
                                            </td>
                                            <td className="p-3 max-w-xs">
                                                {msg.status === 'replied' ? (
                                                    <div className="space-y-0.5">
                                                        <p className="text-gray-600 font-normal italic">"{msg.reply_text}"</p>
                                                        <p className="text-[9px] text-gray-450 font-semibold">By {msg.replier?.name || 'Admin'} on {msg.replied_at ? new Date(msg.replied_at).toLocaleDateString() : ''}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                {msg.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleOpenModal(msg)}
                                                        className="bg-black text-white hover:bg-neutral-800 px-3 py-1.5 rounded-[10px] text-xs font-semibold uppercase tracking-wider transition-colors"
                                                    >
                                                        Reply
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 border-[0.5px] border-black/50 text-xs font-medium rounded-[10px] bg-white hover:bg-neutral-50 disabled:opacity-50 transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-medium text-neutral-650 bg-neutral-50 px-3 py-1.5 rounded-[10px] border-[0.5px] border-black/50">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 border-[0.5px] border-black/50 text-xs font-medium rounded-[10px] bg-white hover:bg-neutral-50 disabled:opacity-50 transition-all"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Reply Modal */}
            {isModalOpen && selectedMsg && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[12px] border border-black/30 w-full max-w-md p-6 space-y-4 shadow-xl">
                        
                        <div className="flex items-center justify-between pb-3 border-b border-gray-150">
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">Send Reply to Influencer</h3>
                                <p className="text-[10px] text-gray-400 mt-0.5">Customer: {selectedMsg.customer.name}</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-black font-semibold text-base"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-3 bg-neutral-50 rounded-lg border border-black/5 text-xs text-gray-700">
                                <span className="font-bold text-gray-800 block mb-1">Inquiry: {selectedMsg.subject}</span>
                                <p className="italic">"{selectedMsg.message}"</p>
                            </div>

                            <form onSubmit={handleSendReply} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700">Reply Message</label>
                                    <textarea 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write your response to the customer..."
                                        rows={4}
                                        className="w-full px-3 py-2 border-[0.5px] border-black/50 rounded-[10px] text-xs bg-white font-medium resize-none focus:outline-none focus:border-black"
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-neutral-50 text-gray-600 hover:bg-neutral-100 border border-gray-200 py-2.5 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-[#052326] text-white hover:bg-opacity-95 py-2.5 rounded-[10px] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Send size={12} />
                                        {submitting ? 'Sending...' : 'Send Response'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
