'use client';

import { useState, useEffect } from 'react';
import { ticketService, Ticket } from '@/services/ticketService';
import Link from 'next/link';
import { 
    Search, Plus, MessageSquare, Clock, AlertCircle, 
    CheckCircle2, Filter, ArrowRight, Inbox, RefreshCw,
    Calendar, Tag, User, ShieldAlert
} from 'lucide-react';

interface TicketListProps {
    role: 'customer' | 'seller' | 'doctor' | 'admin';
    onTicketClick?: (ticket: Ticket) => void;
}

export default function TicketList({ role, onTicketClick }: TicketListProps) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        role: role === 'admin' ? '' : undefined,
    });
    const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });

    useEffect(() => {
        fetchTickets();
    }, [page, filters]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await ticketService.getTickets({ ...filters, page });
            setTickets(data.data);
            
            const statsData = await ticketService.getTicketStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN': 
                return { 
                    bg: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30', 
                    accent: 'bg-emerald-500', 
                    icon: AlertCircle 
                };
            case 'IN_PROGRESS': 
                return { 
                    bg: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30', 
                    accent: 'bg-blue-500', 
                    icon: Clock 
                };
            case 'WAITING_FOR_USER': 
                return { 
                    bg: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30', 
                    accent: 'bg-amber-500', 
                    icon: MessageSquare 
                };
            case 'RESOLVED': 
                return { 
                    bg: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-800', 
                    accent: 'bg-gray-400', 
                    icon: CheckCircle2 
                };
            case 'CLOSED': 
                return { 
                    bg: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30', 
                    accent: 'bg-rose-500', 
                    icon: CheckCircle2 
                };
            default: 
                return { bg: 'bg-gray-50 text-gray-700 border-gray-100', accent: 'bg-gray-500', icon: AlertCircle };
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

    const formatStatusName = (status: string) => {
        return status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };



    // Filter tickets based on client-side search query
    const filteredTickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toString().includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Total Conversations Card */}
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-950 border border-black/[0.04] dark:border-white/[0.04] rounded-[8px] p-6 flex flex-col justify-between transition-all hover:border-black/[0.1] dark:hover:border-white/[0.1] hover:shadow-sm h-32">
                    <div className="flex justify-between items-center">
                        <span className="inline-flex px-2.5 py-1 bg-[#052326]/5 text-[#052326] rounded-[8px] text-[10px] font-bold tracking-wide">
                            Total Conversations
                        </span>
                        <MessageSquare size={14} className="text-[#052326]/40" />
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                        {stats.total}
                    </h3>
                </div>

                {/* Active Requests Card */}
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-950 border border-black/[0.04] dark:border-white/[0.04] rounded-[8px] p-6 flex flex-col justify-between transition-all hover:border-black/[0.1] dark:hover:border-white/[0.1] hover:shadow-sm h-32">
                    <div className="flex justify-between items-center">
                        <span className="inline-flex px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-[8px] text-[10px] font-bold tracking-wide">
                            Active Requests
                        </span>
                        <Clock size={14} className="text-amber-500/50" />
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight leading-none">
                        {stats.active}
                    </h3>
                </div>

                {/* Resolved Tickets Card */}
                <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-950 border border-black/[0.04] dark:border-white/[0.04] rounded-[8px] p-6 flex flex-col justify-between transition-all hover:border-black/[0.1] dark:hover:border-white/[0.1] hover:shadow-sm h-32">
                    <div className="flex justify-between items-center">
                        <span className="inline-flex px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-[8px] text-[10px] font-bold tracking-wide">
                            Resolved Tickets
                        </span>
                        <CheckCircle2 size={14} className="text-emerald-500/50" />
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                        {stats.resolved}
                    </h3>
                </div>
            </div>

            {/* Core Ticket Panel */}
            <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/[0.05] pb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Support Interaction Center</h2>
                        <p className="text-gray-400 text-[10px] font-bold mt-0.5">Manage and track your active requests</p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={fetchTickets}
                            className="p-2 border border-black/[0.05] dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-[8px] transition-all text-gray-500 shrink-0 flex items-center justify-center"
                            title="Refresh Tickets"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                        {role !== 'admin' && (
                            <Link 
                                href={`${getLinkPrefix()}/create`} 
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#052326] text-white rounded-[8px] hover:bg-emerald-800 transition-all font-bold text-xs hover:-translate-y-0.5"
                            >
                                <Plus size={13} />
                                Start Conversation
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col lg:flex-row gap-3 bg-gray-50/50 dark:bg-gray-800/20 p-3.5 rounded-[8px] border border-black/[0.05]">
                    <div className="relative flex-1">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets by subject or ticket ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-black/[0.05] focus:border-cureza-green rounded-[8px] text-[11px] font-semibold outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-gray-400 text-[9px] font-black shrink-0 mr-1">
                            <Filter size={11} />
                            Filters:
                        </div>
                        <select 
                            name="status" 
                            onChange={handleFilterChange} 
                            value={filters.status}
                            className="bg-white dark:bg-gray-900 border border-black/[0.05] rounded-[8px] px-3 py-1.5 text-[11px] font-bold focus:ring-2 focus:ring-green-500/10 cursor-pointer text-gray-600 dark:text-gray-300 outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="WAITING_FOR_USER">Waiting for Reply</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                        <select 
                            name="priority" 
                            onChange={handleFilterChange}
                            value={filters.priority}
                            className="bg-white dark:bg-gray-900 border border-black/[0.05] rounded-[8px] px-3 py-1.5 text-[11px] font-bold focus:ring-2 focus:ring-green-500/10 cursor-pointer text-gray-600 dark:text-gray-300 outline-none"
                        >
                            <option value="">All Priorities</option>
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                        </select>
                        {role === 'admin' && (
                            <select 
                                name="role" 
                                onChange={handleFilterChange}
                                value={filters.role}
                                className="bg-white dark:bg-gray-900 border border-black/[0.05] rounded-[8px] px-3 py-1.5 text-[11px] font-bold focus:ring-2 focus:ring-green-500/10 cursor-pointer text-gray-600 dark:text-gray-300 outline-none"
                            >
                                <option value="">All Regions</option>
                                <option value="seller">Seller Stream</option>
                                <option value="customer">Customer Stream</option>
                                <option value="doctor">Doctor Stream</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Ticket Card Stack List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-8 h-8 border-2 border-cureza-green border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-400 font-medium">Fetching support dashboard...</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/20 dark:bg-gray-800/10 rounded-[8px] border border-dashed border-black/[0.05] flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 rounded-[8px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                            <Inbox size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm">No Conversations Found</h3>
                            <p className="text-xs text-gray-400 max-w-xs mx-auto">Try resetting your filters or search queries to check for other active tickets.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {filteredTickets.map((ticket) => {
                            const config = getStatusConfig(ticket.status);
                            return (
                                <div 
                                    key={ticket.id} 
                                    className="group relative bg-white dark:bg-gray-900 border border-black/[0.05] hover:border-black/[0.1] rounded-[8px] p-5 transition-all hover:bg-gray-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-6 overflow-hidden"
                                >
                                    {/* Left Accent Bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${config.accent}`} />

                                    <div className="flex-1 min-w-0 space-y-2">
                                        {/* Status / ID / Date Meta block */}
                                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[8px] font-bold border ${config.bg}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${config.accent}`}></span>
                                                {formatStatusName(ticket.status)}
                                            </span>
                                            <span className="font-bold text-gray-400">ID: #{ticket.id}</span>
                                            
                                            <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                                            
                                            <span className="flex items-center gap-1 text-gray-400">
                                                <Calendar size={11} />
                                                {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            
                                            {role === 'admin' && ticket.creator && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                                                    <span className="flex items-center gap-1 text-gray-500 font-bold bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-[8px]">
                                                        <User size={10} />
                                                        {ticket.creator.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Subject (Full Clickable Area style) */}
                                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 group-hover:text-cureza-green transition-colors leading-snug truncate pr-4">
                                            {onTicketClick ? (
                                                <button 
                                                    onClick={() => onTicketClick(ticket)} 
                                                    className="hover:underline block text-left w-full font-bold focus:outline-none"
                                                >
                                                    {ticket.subject}
                                                </button>
                                            ) : (
                                                <Link 
                                                    href={`${getLinkPrefix()}/${ticket.id}`} 
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline block"
                                                >
                                                    {ticket.subject}
                                                </Link>
                                            )}
                                        </h3>

                                        {/* Category tags block */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/80 px-2 py-0.5 rounded-[8px] text-[10px] text-gray-500 dark:text-gray-400 font-bold border border-black/[0.02]">
                                                <Tag size={10} />
                                                {ticket.category}
                                            </span>

                                            {role === 'admin' && (
                                                <span className="text-[10px] bg-gray-50 text-gray-500 border border-black/[0.02] px-2 py-0.5 rounded-[8px] font-bold flex items-center gap-1">
                                                    <ShieldAlert size={10} />
                                                    {ticket.created_by_role} stream
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-black/[0.03] pt-3 md:pt-0 shrink-0">
                                        <span className={`inline-flex px-3 py-1 rounded-[8px] text-[9px] font-bold border ${
                                            ticket.priority === 'High' 
                                                ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30' 
                                                : 'bg-gray-50 border-gray-100 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                        }`}>
                                            {ticket.priority} Priority
                                        </span>

                                        <div className="flex items-center gap-2">
                                            {onTicketClick ? (
                                                <button 
                                                    onClick={() => onTicketClick(ticket)}
                                                    className="px-3.5 py-1.5 bg-[#052326] hover:bg-emerald-800 text-white rounded-[8px] transition-all font-bold text-xs flex items-center gap-1.5 hover:-translate-y-0.5 shadow-sm"
                                                >
                                                    <span>Reply</span>
                                                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                                </button>
                                            ) : (
                                                <Link 
                                                    href={`${getLinkPrefix()}/${ticket.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3.5 py-1.5 bg-[#052326] hover:bg-emerald-800 text-white rounded-[8px] transition-all font-bold text-xs flex items-center gap-1.5 hover:-translate-y-0.5 shadow-sm"
                                                >
                                                    <span>Reply</span>
                                                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
