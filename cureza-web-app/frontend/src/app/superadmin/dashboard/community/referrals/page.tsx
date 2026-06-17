'use client';

import { useState, useEffect } from 'react';
import { Search, Clock, Users, ArrowRight } from 'lucide-react';
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Referrals Log</h1>
                <p className="text-gray-500">Track registration connections, invitation codes, and points distribution.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
                    <input
                        type="text"
                        placeholder="Search by referrer or referee..."
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
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#052326] focus:border-[#052326]"
                    >
                        <option value="">All Referrals</option>
                        <option value="pending">Pending Purchase</option>
                        <option value="completed">Completed Referrals</option>
                    </select>
                </div>
            </div>

            {/* referrals Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 animate-pulse">Loading referrals logs...</div>
                ) : referrals.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No referrals recorded matching criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Referrer (Invited By)</th>
                                    <th></th>
                                    <th className="p-4">Referee (Invited Friend)</th>
                                    <th className="p-4">Code Used</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">XP Credited</th>
                                    <th className="p-4">Invited At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {referrals.map((item) => {
                                    const date = new Date(item.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    });

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.referrer?.name || 'System User'}</p>
                                                    <p className="text-xs text-gray-400">{item.referrer?.email || ''}</p>
                                                </div>
                                            </td>
                                            <td className="text-gray-400">
                                                <ArrowRight size={16} />
                                            </td>
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.referred_user?.name || 'Registered User'}</p>
                                                    <p className="text-xs text-gray-400">{item.referred_user?.email || ''}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-800 border border-gray-200">
                                                    {item.referral_code}
                                                </code>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                                    item.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {item.status === 'completed' ? 'Completed' : 'Pending Order'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-yellow-600">
                                                {item.status === 'completed' ? `+${item.reward_points} XP` : '0 XP'}
                                            </td>
                                            <td className="p-4 text-xs text-gray-400">{date}</td>
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
