'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
    Clock, 
    User, 
    ShieldAlert, 
    Search, 
    Users, 
    Activity, 
    Shield, 
    Database, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    RefreshCw 
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
                return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'doctor':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'seller':
            case 'vendor':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'super_admin':
            case 'admin':
                return 'bg-purple-50 text-purple-700 border border-purple-200';
            default:
                return 'bg-slate-50 text-slate-700 border border-slate-200';
        }
    };

    const getActionBadgeStyles = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes('delete') || lower.includes('reject') || lower.includes('fail')) {
            return 'bg-red-50 text-red-600 border border-red-200';
        }
        if (lower.includes('create') || lower.includes('approve') || lower.includes('success') || lower.includes('verify')) {
            return 'bg-green-50 text-green-700 border border-green-200';
        }
        if (lower.includes('update')) {
            return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
        }
        return 'bg-sky-50 text-sky-700 border border-sky-200';
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gradient-to-r from-emerald-950 to-emerald-900 p-6 rounded-2xl text-white shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Audit Trail</h1>
                    <p className="text-emerald-100/80 text-sm mt-1">
                        Monitor and filter actions performed by customers, doctors, sellers, and system administrators.
                    </p>
                </div>
                <button 
                    onClick={() => fetchLogs(1, activeTab, search)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-all rounded-lg text-sm font-semibold border border-white/10 backdrop-blur-sm self-start md:self-auto"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh Logs
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search logs by action, IP, description..."
                        className="w-full pl-10 pr-24 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cureza-green/50 text-sm"
                    />
                    <button 
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-cureza-green text-white rounded-md text-xs font-semibold hover:bg-emerald-800 transition-all"
                    >
                        Search
                    </button>
                </form>

                {/* Total Stats */}
                <div className="text-sm text-gray-500 whitespace-nowrap">
                    Found <span className="font-bold text-gray-900">{total}</span> activity records
                </div>
            </div>

            {/* 4 Tabs Container */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-2 scrollbar-none">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setPage(1);
                            }}
                            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                                isActive 
                                    ? 'border-cureza-green text-cureza-green bg-emerald-50/40 rounded-t-lg font-extrabold' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 gap-3">
                        <Loader2 className="animate-spin text-cureza-green" size={40} />
                        <span className="text-gray-500 text-sm font-medium">Fetching Audit logs...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col justify-center items-center py-20 text-center px-4">
                        <Activity className="text-gray-300 mb-3" size={48} />
                        <h3 className="font-bold text-gray-700 text-lg">No Log Records Found</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-md">
                            No activities match the current filters. Modify your search query or select another stakeholder tab.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stakeholder</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Network Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-150">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Stakeholder Details */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {log.user ? (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-cureza-green flex items-center justify-center font-bold text-xs uppercase border border-emerald-100">
                                                                {log.user.name.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900 text-sm">{log.user.name}</span>
                                                                <span className="text-xs text-gray-500">{log.user.email}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getRoleBadgeStyles(log.user.role)}`}>
                                                                {log.user.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                                            S
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800 text-sm">System / Guest</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase w-max mt-1 ${getRoleBadgeStyles('system')}`}>
                                                                System
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Action Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getActionBadgeStyles(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>

                                            {/* Description details */}
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs md:max-w-md break-all">
                                                <p className="line-clamp-2" title={log.description}>{log.description || 'N/A'}</p>
                                            </td>

                                            {/* Network details */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-gray-800 font-semibold">{log.ip_address || 'localhost'}</span>
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[150px]" title={log.user_agent || 'N/A'}>
                                                        {log.user_agent || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Timestamp */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-gray-400" />
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
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{lastPage}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-all disabled:opacity-40 bg-white shadow-sm flex items-center justify-center"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === lastPage}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-white transition-all disabled:opacity-40 bg-white shadow-sm flex items-center justify-center"
                                    >
                                        <ChevronRight size={16} />
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
