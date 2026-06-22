'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    Clock, 
    Search, 
    Users, 
    Activity, 
    Shield, 
    Database, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    RefreshCw,
    ShieldAlert
} from 'lucide-react';

interface LogUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface ActivityLog {
    id: number;
    user_id: number | null;
    action: string;
    description: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user?: LogUser;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'customer' | 'doctor' | 'seller' | 'system' | ''>('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const tabs = [
        { id: '', label: 'All Logs', icon: Activity },
        { id: 'customer', label: 'Customers', icon: Users },
        { id: 'doctor', label: 'Doctors', icon: Shield },
        { id: 'seller', label: 'Sellers', icon: Database },
        { id: 'system', label: 'System & Admin', icon: ShieldAlert },
    ];

    const fetchLogs = async (currentPage = 1, currentTab = activeTab, currentSearch = search) => {
        try {
            setLoading(true);
            const params: any = {
                page: currentPage,
            };
            if (currentTab) params.role = currentTab;
            if (currentSearch) params.search = currentSearch;

            const response = await api.get('/admin/settings/logs', { params });
            const { data, last_page, total: totalLogs } = response.data;
            setLogs(data);
            setLastPage(last_page);
            setTotal(totalLogs);
            setPage(currentPage);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1, activeTab, search);
    }, [activeTab]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs(1, activeTab, search);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            fetchLogs(newPage, activeTab, search);
        }
    };

    const formatTimestamp = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch (e) {
            return dateString;
        }
    };

    const getRoleBadgeStyles = (role?: string) => {
        switch (role?.toLowerCase()) {
            case 'customer':
            case 'doctor':
            case 'seller':
            case 'vendor':
                return 'bg-neutral-50 text-neutral-600 border border-black/5';
            case 'super_admin':
            case 'admin':
                return 'bg-neutral-900 text-white border border-black/10';
            default:
                return 'bg-neutral-50 text-neutral-600 border border-black/5';
        }
    };

    const getActionBadgeStyles = (action: string) => {
        const lower = action.toLowerCase();
        // Red is reserved for failure/error states
        if (lower.includes('delete') || lower.includes('reject') || lower.includes('fail')) {
            return 'bg-red-50 text-red-650 border border-red-200/50';
        }
        // Green is reserved for success/approval states
        if (lower.includes('create') || lower.includes('approve') || lower.includes('success') || lower.includes('verify')) {
            return 'bg-green-50 text-green-700 border border-green-200/50';
        }
        // General action styles must remain monochrome
        return 'bg-neutral-50 text-neutral-800 border border-black/10';
    };

    return (
        <div className="w-full space-y-6 pb-20 font-sans text-neutral-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b-[0.5px] border-black/10 pb-5">
                <div>
                    <h2 className="text-sm font-medium text-neutral-900 tracking-tight">System Audit Trail</h2>
                    <p className="text-neutral-500 text-xs mt-0.5">
                        Monitor and filter actions performed by customers, doctors, sellers, and system administrators.
                    </p>
                </div>
                <button 
                    onClick={() => fetchLogs(1, activeTab, search)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 border-[0.5px] border-black/10 hover:bg-neutral-50 transition-all rounded-[10px] text-xs font-medium text-neutral-800 shrink-0 bg-white"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh Logs
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/10 shadow-none flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search logs by action, IP, description..."
                        className="w-full pl-9 pr-20 py-2 bg-neutral-50/50 border-[0.5px] border-black/10 rounded-[10px] focus:border-black outline-none text-xs"
                    />
                    <button 
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black text-white rounded-[10px] text-[10px] font-medium hover:bg-neutral-900 transition-all"
                    >
                        Search
                    </button>
                </form>

                <div className="text-xs text-neutral-500 whitespace-nowrap">
                    Found <span className="font-medium text-neutral-900">{total}</span> activity records
                </div>
            </div>

            {/* Navigation Pills */}
            <div className="flex flex-wrap gap-2 pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setPage(1);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-[10px] transition-all border-[0.5px] ${
                                isActive 
                                    ? 'bg-black border-black text-white' 
                                    : 'border-black/10 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 bg-white'
                            }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/10 shadow-none overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 gap-3">
                        <Loader2 className="animate-spin text-black" size={28} />
                        <span className="text-neutral-450 text-xs font-normal">Fetching Audit logs...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col justify-center items-center py-20 text-center px-4 bg-neutral-50/10">
                        <Activity className="text-neutral-350 mb-3" size={32} />
                        <h3 className="font-medium text-neutral-700 text-sm">No Log Records Found</h3>
                        <p className="text-neutral-450 text-xs mt-1 max-w-sm font-normal">
                            No activities match the current filters. Modify your search query or select another stakeholder tab.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-black/10">
                                <thead className="bg-neutral-50/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[11px] font-medium text-neutral-500 tracking-normal capitalize">Stakeholder</th>
                                        <th className="px-5 py-3 text-left text-[11px] font-medium text-neutral-500 tracking-normal capitalize">Action</th>
                                        <th className="px-5 py-3 text-left text-[11px] font-medium text-neutral-500 tracking-normal capitalize">Description</th>
                                        <th className="px-5 py-3 text-left text-[11px] font-medium text-neutral-500 tracking-normal capitalize">Network Details</th>
                                        <th className="px-5 py-3 text-left text-[11px] font-medium text-neutral-500 tracking-normal capitalize">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-black/5">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50/30 transition-colors">
                                            {/* Stakeholder Details */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {log.user ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-neutral-100 text-black flex items-center justify-center font-bold text-xs uppercase border-[0.5px] border-black/5">
                                                                {log.user.name.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-neutral-900 text-xs">{log.user.name}</span>
                                                                <span className="text-[10px] text-neutral-450 font-normal">{log.user.email}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-0.5">
                                                            <span className={`px-1.5 py-0.5 rounded-[10px] text-[9px] font-medium uppercase ${getRoleBadgeStyles(log.user.role)}`}>
                                                                {log.user.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-neutral-50 text-neutral-450 border-[0.5px] border-black/5 flex items-center justify-center font-semibold text-xs">
                                                            S
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-neutral-700 text-xs">System / Guest</span>
                                                            <span className={`px-1.5 py-0.5 rounded-[10px] text-[9px] font-medium uppercase w-max mt-0.5 ${getRoleBadgeStyles('system')}`}>
                                                                System
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Action Badge */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded-[10px] text-[10px] font-medium ${getActionBadgeStyles(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>

                                            {/* Description details */}
                                            <td className="px-5 py-4 text-xs text-neutral-600 max-w-xs md:max-w-md break-all font-normal">
                                                <p className="line-clamp-2" title={log.description}>{log.description || 'N/A'}</p>
                                            </td>

                                            {/* Network details */}
                                            <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-550 font-mono font-normal">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-neutral-800 font-medium">{log.ip_address || 'localhost'}</span>
                                                    <span className="text-[9px] text-neutral-400 truncate max-w-[150px] font-normal" title={log.user_agent || 'N/A'}>
                                                        {log.user_agent || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Timestamp */}
                                            <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-600 font-normal">
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} className="text-neutral-400" />
                                                    {formatTimestamp(log.created_at)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {lastPage > 1 && (
                            <div className="px-5 py-3 bg-neutral-50/50 border-t-[0.5px] border-black/10 flex items-center justify-between">
                                <div className="text-xs text-neutral-550">
                                    Showing page <span className="font-medium text-neutral-900">{page}</span> of <span className="font-medium text-neutral-900">{lastPage}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="p-1.5 border-[0.5px] border-black/10 rounded-[10px] hover:bg-neutral-50 transition-all disabled:opacity-40 bg-white flex items-center justify-center"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === lastPage}
                                        className="p-1.5 border-[0.5px] border-black/10 rounded-[10px] hover:bg-neutral-50 transition-all disabled:opacity-40 bg-white flex items-center justify-center"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
