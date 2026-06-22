'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '@/lib/api';

export default function AdminActivityPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        api.get('/admin/community/activity', {
            params: { search, type, page }
        }).then((res) => {
            setActivities(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total
            });
        }).catch((err) => {
            console.error("Error loading activity log:", err);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, [page, type]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadData();
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-[10px] border-[0.5px] border-black/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:max-w-md">
                    <input
                        type="text"
                        placeholder="Search by user name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white"
                    />
                    <button type="submit" className="bg-black text-white px-3 py-1.5 rounded-[10px] text-xs font-medium hover:bg-neutral-800 transition-colors">
                        Search
                    </button>
                </form>

                <div className="flex gap-4 w-full sm:w-auto shrink-0 justify-end">
                    <select
                        value={type}
                        onChange={(e) => { setType(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white"
                    >
                        <option value="">All Transactions</option>
                        <option value="credit">Credits Only</option>
                        <option value="debit">Debits Only</option>
                    </select>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-xs text-gray-500 animate-pulse">Loading activity logs...</div>
                ) : activities.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">No activities recorded matching criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 border-b-[0.5px] border-black/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">User</th>
                                    <th className="p-3">Action</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Points</th>
                                    <th className="p-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-[0.5px] divide-neutral-950/10">
                                {activities.map((item) => {
                                    const isEarn = item.type === 'credit';
                                    const user = item.wallet?.user;
                                    const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });

                                    return (
                                        <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="p-3">
                                                {user ? (
                                                    <div>
                                                        <p className="font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">{user.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 font-normal">System / Seed User</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-medium border-[0.5px] ${
                                                    isEarn 
                                                        ? 'bg-green-50 text-green-800 border-black/50' 
                                                        : 'bg-red-50 text-red-800 border-black/50'
                                                }`}>
                                                    {isEarn ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                                                    {isEarn ? 'Credit' : 'Debit'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600 font-normal">{item.description}</td>
                                            <td className={`p-3 font-semibold text-sm ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                                                {isEarn ? '+' : '-'}{item.points} XP
                                            </td>
                                            <td className="p-3 text-gray-400">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    <span>{formattedDate}</span>
                                                </div>
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
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-xs text-gray-400 font-normal">Total: {pagination.total} records</p>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="px-2.5 py-1 border-[0.5px] border-black/50 rounded-[10px] text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-medium self-center px-2 text-gray-600">Page {page} of {pagination.last_page}</span>
                        <button
                            disabled={page >= pagination.last_page}
                            onClick={() => setPage(page + 1)}
                            className="px-2.5 py-1 border-[0.5px] border-black/50 rounded-[10px] text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
