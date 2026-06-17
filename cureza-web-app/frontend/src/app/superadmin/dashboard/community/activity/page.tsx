'use client';

import { useState, useEffect } from 'react';
import { Clock, Search, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Points & XP Activity Log</h1>
                <p className="text-gray-500">Audit trail of all points credited and debited across the system.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
                    <input
                        type="text"
                        placeholder="Search by user name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                    />
                    <button type="submit" className="bg-[#052326] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90">
                        Search
                    </button>
                </form>

                <div className="flex gap-4 w-full md:w-auto shrink-0 justify-end">
                    <select
                        value={type}
                        onChange={(e) => { setType(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                    >
                        <option value="">All Transactions</option>
                        <option value="credit">Credits Only</option>
                        <option value="debit">Debits Only</option>
                    </select>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 animate-pulse">Loading activity logs...</div>
                ) : activities.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No activities recorded matching criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Points</th>
                                    <th className="p-4">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
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
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                {user ? (
                                                    <div>
                                                        <p className="font-bold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 font-medium">System / Seed User</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    isEarn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {isEarn ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                                    {isEarn ? 'Credit' : 'Debit'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600 font-medium">{item.description}</td>
                                            <td className={`p-4 font-bold text-base ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                                                {isEarn ? '+' : '-'}{item.points} XP
                                            </td>
                                            <td className="p-4 text-xs text-gray-400 flex items-center gap-1.5 mt-2.5">
                                                <Clock size={14} /> {formattedDate}
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
                    <p className="text-xs text-gray-500 font-medium">Total: {pagination.total} records</p>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-bold self-center px-2">Page {page} of {pagination.last_page}</span>
                        <button
                            disabled={page >= pagination.last_page}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
