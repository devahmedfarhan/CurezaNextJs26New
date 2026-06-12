'use client';
import { useState, useEffect } from 'react';
import { ticketService, Ticket } from '@/services/ticketService';
import Link from 'next/link';

interface TicketListProps {
    role: 'customer' | 'seller' | 'doctor' | 'admin';
}

export default function TicketList({ role }: TicketListProps) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        role: role === 'admin' ? '' : undefined, // Only admin can filter by role
    });

    useEffect(() => {
        fetchTickets();
    }, [page, filters]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await ticketService.getTickets({ ...filters, page });
            setTickets(data.data);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1); // Reset to page 1
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' };
            case 'IN_PROGRESS': return { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' };
            case 'WAITING_FOR_USER': return { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' };
            case 'RESOLVED': return { bg: 'bg-gray-50 text-gray-700 border-gray-100', dot: 'bg-gray-500' };
            case 'CLOSED': return { bg: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' };
            default: return { bg: 'bg-gray-50 text-gray-700 border-gray-100', dot: 'bg-gray-500' };
        }
    };

    const getLinkPrefix = () => {
        switch (role) {
            case 'seller': return '/seller/dashboard/support';
            case 'doctor': return '/doctor/dashboard/support';
            case 'admin': return '/superadmin/dashboard/support';
            default: return '/dashboard/support';
        }
    };

    return (
        <div className="premium-card p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Support Interaction Center</h2>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Manage and track your active requests</p>
                </div>

                {role !== 'admin' && ( // Admin doesn't create tickets here usually
                    <Link href={`${getLinkPrefix()}/create`} className="px-6 py-3 bg-cureza-green text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 font-bold text-sm hover:-translate-y-0.5">
                        Start New Conversation
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <select name="status" onChange={handleFilterChange} className="bg-white border-none rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm focus:ring-4 focus:ring-green-500/10 cursor-pointer text-gray-600">
                    <option value="">All Statuses</option>
                    <option value="OPEN">🟢 Open</option>
                    <option value="IN_PROGRESS">🔵 In Progress</option>
                    <option value="WAITING_FOR_USER">🟠 Waiting for Reply</option>
                    <option value="RESOLVED">⚪ Resolved</option>
                </select>
                <select name="priority" onChange={handleFilterChange} className="bg-white border-none rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm focus:ring-4 focus:ring-green-500/10 cursor-pointer text-gray-600">
                    <option value="">All Priorities</option>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">🔴 High Priority</option>
                </select>
                {role === 'admin' && (
                    <select name="role" onChange={handleFilterChange} className="bg-white border-none rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm focus:ring-4 focus:ring-green-500/10 cursor-pointer text-gray-600">
                        <option value="">All Regions</option>
                        <option value="seller">Seller Stream</option>
                        <option value="customer">Customer Stream</option>
                        <option value="doctor">Doctor Stream</option>
                    </select>
                )}
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-10">Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No tickets found.</div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => {
                        const config = getStatusConfig(ticket.status);
                        return (
                            <div key={ticket.id} className="group border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-100 hover:bg-gray-50/30 transition-all">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${config.bg}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                                                {ticket.status.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">#{ticket.id}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(ticket.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-cureza-green transition-colors leading-snug">
                                            <Link href={`${getLinkPrefix()}/${ticket.id}`}>
                                                {ticket.subject}
                                            </Link>
                                        </h3>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="bg-gray-100/50 px-3 py-1 rounded-lg">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                                    Category: <span className="text-gray-900">{ticket.category}</span>
                                                </p>
                                            </div>
                                            {role === 'admin' && (
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {ticket.created_by_role === 'doctor' && (
                                                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg font-extrabold uppercase tracking-wider">
                                                            👨‍⚕️ Doctor Portal
                                                        </span>
                                                    )}
                                                    {ticket.created_by_role === 'seller' && (
                                                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-lg font-extrabold uppercase tracking-wider">
                                                            🏪 Seller Portal
                                                        </span>
                                                    )}
                                                    {ticket.created_by_role === 'customer' && (
                                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-lg font-extrabold uppercase tracking-wider">
                                                            👤 Customer Portal
                                                        </span>
                                                    )}
                                                    {ticket.creator && (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-wider">
                                                            Requester: <span className="text-gray-900 font-extrabold">{ticket.creator.name}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <span className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest border shadow-sm ${ticket.priority === 'High' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                            {ticket.priority} Priority
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
