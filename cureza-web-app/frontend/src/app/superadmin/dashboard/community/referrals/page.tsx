'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import api from '@/lib/api';

export default function AdminReferralsPage() {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        api.get('/admin/referrals', {
            params: { search, status, page }
        }).then((res) => {
            setReferrals(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total
            });
        }).catch((err) => {
            console.error("Error loading referrals log:", err);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, [page, status]);

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
                        placeholder="Search by referrer or referee..."
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
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 border-[0.5px] border-black/50 rounded-[10px] text-xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 bg-white"
                    >
                        <option value="">All Referrals</option>
                        <option value="pending">Pending Purchase</option>
                        <option value="completed">Completed Referrals</option>
                    </select>
                </div>
            </div>

            {/* Referrals Table */}
            <div className="bg-white rounded-[10px] border-[0.5px] border-black/50 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-xs text-gray-500 animate-pulse">Loading referrals logs...</div>
                ) : referrals.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">No referrals recorded matching criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 border-b-[0.5px] border-black/50 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3">Referrer (Invited By)</th>
                                    <th></th>
                                    <th className="p-3">Referee (Invited Friend)</th>
                                    <th className="p-3">Code Used</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">XP Credited</th>
                                    <th className="p-3">Invited At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-[0.5px] divide-neutral-950/10">
                                {referrals.map((item) => {
                                    const date = new Date(item.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    });
                                    const isCompleted = item.status === 'completed';

                                    return (
                                        <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.referrer?.name || 'System User'}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{item.referrer?.email || ''}</p>
                                                </div>
                                            </td>
                                            <td className="text-gray-400">
                                                <ArrowRight size={14} />
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.referred_user?.name || 'Registered User'}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{item.referred_user?.email || ''}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <code className="bg-neutral-50 px-2 py-0.5 rounded-[6px] border-[0.5px] border-black/50 text-xs font-mono text-gray-800 font-semibold">
                                                    {item.referral_code}
                                                </code>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-[6px] border-[0.5px] ${
                                                    isCompleted
                                                        ? 'bg-green-50 text-green-800 border-black/50'
                                                        : 'bg-neutral-50 text-neutral-600 border-black/50'
                                                }`}>
                                                    {isCompleted ? 'Completed' : 'Pending Order'}
                                                </span>
                                            </td>
                                            <td className={`p-3 font-semibold ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                                {isCompleted ? `+${item.reward_points} XP` : '0 XP'}
                                            </td>
                                            <td className="p-3 text-gray-400">{date}</td>
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
