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
                    bg: 'bg-neutral-50 text-neutral-800 border-neutral-950/10 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800', 
                    accent: 'bg-neutral-500', 
                    icon: AlertCircle 
                };
            case 'IN_PROGRESS': 
                return { 
                    bg: 'bg-neutral-100 text-neutral-800 border-neutral-950/10 dark:bg-neutral-850 dark:text-neutral-300 dark:border-neutral-800', 
                    accent: 'bg-neutral-600', 
                    icon: Clock 
                };
            case 'WAITING_FOR_USER': 
                return { 
                    bg: 'bg-neutral-50 text-neutral-600 border-neutral-950/10 dark:bg-neutral-900/60 dark:text-neutral-450 dark:border-neutral-850', 
                    accent: 'bg-neutral-400', 
                    icon: MessageSquare 
                };
            case 'RESOLVED': 
                return { 
                    bg: 'bg-emerald-50 text-emerald-700 border-emerald-500/10 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30', 
                    accent: 'bg-emerald-500', 
                    icon: CheckCircle2 
                };
            case 'CLOSED': 
                return { 
                    bg: 'bg-rose-50 text-rose-700 border-rose-500/10 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30', 
                    accent: 'bg-rose-500', 
                    icon: CheckCircle2 
                };
            default: 
                return { bg: 'bg-neutral-50 text-neutral-700 border-neutral-950/10', accent: 'bg-neutral-500', icon: AlertCircle };
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
                <div className="bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 rounded-[10px] p-6 flex flex-col justify-between transition-all hover:border-neutral-950/20 h-32">
                    <div className="flex justify-between items-center">
                        <span className="inline-flex px-2.5 py-1 bg-neutral-100 text-neutral-800 border-[0.35px] border-neutral-950/10 rounded-[10px] text-[10px] font-medium tracking-normal">
                            Total Conversations
                        </span>
                        <MessageSquare size={14} className="text-gray-400" />
                    </div>
                    <h3 className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight leading-none">
                        {stats.total}
                    </h3>
                </div>

                {/* Active Requests Card */}
                <div className="bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 rounded-[10px] p-6 flex flex-col justify-between transition-all hover:border-neutral-950/20 h-32">
                    <div className="flex justify-between items-center">
                        <span className="inline-flex px-2.5 py-1 bg-neutral-100 text-neutral-850 rounded-[10px] text-[10px] font-medium tracking-normal border-[0.35px] border-neutral-950/10">
                            Active Requests
                        </span>
                        <Clock size={14} className="text-gray-400" />
                    </div>
                    <h3 className="text-4xl font-semibold text-gray-805 dark:text-gray-200 tracking-tight leading-none">
                        {stats.active}
                    </h3>
                </div>

                {/* Resolved Tickets Card */}
                <div className="bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 rounded-[10px] p-6 flex flex-col justify-between transition-all hover:border-neutral-950/20 h-32">
                    <div className="flex justify-between items-center">
                        <span className="inline-flex px-2.5 py-1 bg-emerald-50 text-emerald-700 border-[0.35px] border-emerald-500/10 rounded-[10px] text-[10px] font-medium tracking-normal">
                            Resolved Tickets
                        </span>
                        <CheckCircle2 size={14} className="text-emerald-550/60" />
                    </div>
                    <h3 className="text-4xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                        {stats.resolved}
                    </h3>
                </div>
            </div>

            {/* Core Ticket Panel */}
            <div className="bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 rounded-[10px] p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-[0.35px] border-neutral-950/10 pb-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Support Interaction Center</h2>
                        <p className="text-gray-500 text-xs font-normal mt-0.5">Manage and track your active requests</p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={fetchTickets}
                            className="p-2 border-[0.35px] border-neutral-950/10 hover:bg-neutral-50 dark:hover:bg-gray-800 rounded-[10px] transition-all text-gray-555 shrink-0 flex items-center justify-center bg-white"
                            title="Refresh Tickets"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                        {role !== 'admin' && (
                            <Link 
                                href={`${getLinkPrefix()}/create`} 
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-[10px] hover:bg-neutral-900 transition-all font-medium text-xs"
                            >
                                <Plus size={13} />
                                Start Conversation
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col lg:flex-row gap-3 bg-neutral-50/50 dark:bg-gray-800/20 p-3.5 rounded-[10px] border-[0.35px] border-neutral-950/10">
                    <div className="relative flex-1">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets by subject or ticket ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 focus:border-black rounded-[10px] text-xs font-normal outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-gray-500 text-xs font-medium shrink-0 mr-1">
                            <Filter size={11} />
                            Filters:
                        </div>
                        <select 
                            name="status" 
                            onChange={handleFilterChange} 
                            value={filters.status}
                            className="bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-1.5 text-xs font-normal focus:ring-1 focus:ring-black cursor-pointer text-gray-700 dark:text-gray-300 outline-none"
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
                            className="bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-1.5 text-xs font-normal focus:ring-1 focus:ring-black cursor-pointer text-gray-700 dark:text-gray-300 outline-none"
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
                                className="bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 rounded-[10px] px-3 py-1.5 text-xs font-normal focus:ring-1 focus:ring-black cursor-pointer text-gray-700 dark:text-gray-300 outline-none"
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
                        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-400 font-medium">Fetching support dashboard...</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-50/20 dark:bg-gray-800/10 rounded-[10px] border-[0.35px] border-dashed border-neutral-950/10 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
                        <div className="w-12 h-12 rounded-[10px] bg-neutral-55 flex items-center justify-center text-gray-400">
                            <Inbox size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-300 text-sm">No Conversations Found</h3>
                            <p className="text-xs text-gray-455 max-w-xs mx-auto">Try resetting your filters or search queries to check for other active tickets.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {filteredTickets.map((ticket) => {
                            const config = getStatusConfig(ticket.status);
                            return (
                                <div 
                                    key={ticket.id} 
                                    className="group relative bg-white dark:bg-gray-900 border-[0.35px] border-neutral-950/10 hover:border-black rounded-[10px] p-5 transition-all hover:bg-neutral-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pl-6 overflow-hidden"
                                >
                                    {/* Left Accent Bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${config.accent}`} />

                                    <div className="flex-1 min-w-0 space-y-2">
                                        {/* Status / ID / Date Meta block */}
                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[10px] font-medium border-[0.35px] ${config.bg}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${config.accent}`}></span>
                                                {formatStatusName(ticket.status)}
                                            </span>
                                            <span className="font-medium text-gray-400">ID: #{ticket.id}</span>
                                            
                                            <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                                            
                                            <span className="flex items-center gap-1 text-gray-455 font-normal">
                                                <Calendar size={11} />
                                                {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            
                                            {role === 'admin' && ticket.creator && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                                                    <span className="flex items-center gap-1 text-gray-500 font-medium bg-neutral-50 dark:bg-gray-800 px-2 py-0.5 rounded-[10px] border-[0.35px] border-neutral-950/10">
                                                        <User size={10} />
                                                        {ticket.creator.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {/* Subject (Full Clickable Area style) */}
                                        <h3 className="font-medium text-base text-gray-900 dark:text-gray-100 group-hover:text-black transition-colors leading-snug truncate pr-4">
                                            {onTicketClick ? (
                                                <button 
                                                    onClick={() => onTicketClick(ticket)} 
                                                    className="hover:underline block text-left w-full font-medium focus:outline-none"
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
                                            <span className="flex items-center gap-1 bg-neutral-50 dark:bg-gray-800/80 px-2 py-0.5 rounded-[10px] text-xs text-gray-505 dark:text-gray-400 font-medium border-[0.35px] border-neutral-950/10">
                                                <Tag size={10} />
                                                {ticket.category}
                                            </span>

                                            {role === 'admin' && (
                                                <span className="text-xs bg-neutral-50 text-gray-500 border-[0.35px] border-neutral-950/10 px-2 py-0.5 rounded-[10px] font-medium flex items-center gap-1">
                                                    <ShieldAlert size={10} />
                                                    {ticket.created_by_role} Stream
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Column */}
                                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t-[0.35px] md:border-t-0 border-neutral-950/10 pt-3 md:pt-0 shrink-0">
                                        <span className={`inline-flex px-3 py-1 rounded-[10px] text-[10px] font-medium border-[0.35px] ${
                                            ticket.priority === 'High' 
                                                ? 'bg-rose-50 border-rose-500/10 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30' 
                                                : 'bg-neutral-50 border-neutral-950/10 text-gray-550 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                        }`}>
                                            {ticket.priority} Priority
                                        </span>

                                        <div className="flex items-center gap-2">
                                            {onTicketClick ? (
                                                <button 
                                                    onClick={() => onTicketClick(ticket)}
                                                    className="px-3.5 py-1.5 bg-black hover:bg-neutral-900 text-white rounded-[10px] transition-all font-medium text-xs flex items-center gap-1.5"
                                                >
                                                    <span>Reply</span>
                                                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                                </button>
                                            ) : (
                                                <Link 
                                                    href={`${getLinkPrefix()}/${ticket.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3.5 py-1.5 bg-black hover:bg-neutral-900 text-white rounded-[10px] transition-all font-medium text-xs flex items-center gap-1.5"
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
