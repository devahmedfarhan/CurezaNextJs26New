'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import api from '@/lib/api';

interface Refund {
    id: number;
    amount: string;
    reason: string;
    status: string;
    created_at: string;
    order: {
        id: number;
        order_number: string;
    };
    user: {
        name: string;
        email: string;
    };
}

export default function AdminRefundsPage() {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const params: any = { page };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'All') params.status = statusFilter;

            const response = await api.get('/admin/refunds', { params });
            const data = response.data;
            if (data.data) {
                setRefunds(data.data);
                setTotalPages(data.last_page);
            } else {
                setRefunds(data);
            }
        } catch (error) {
            console.error('Failed to fetch refunds:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchRefunds();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, page]);

    const handleApprove = async (id: number) => {
        if (!confirm('Are you sure you want to approve this refund?')) return;
        try {
            await api.post('/admin/refund/approve', { refund_id: id });
            fetchRefunds(); // Refresh list
        } catch (error) {
            console.error('Failed to approve refund:', error);
            alert('Failed to approve refund');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Refunds & Cancellations</h1>
                    <p className="text-gray-500">Manage refund requests and order cancellations</p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-cureza-green focus:border-cureza-green sm:text-sm transition-colors"
                        placeholder="Search by Refund ID or Order #..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === status
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Refunds List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={8} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : refunds.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-4 text-center">No refund requests found.</td></tr>
                            ) : (
                                refunds.map((refund) => (
                                    <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{refund.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cureza-green hover:underline cursor-pointer">{refund.order?.order_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{refund.user?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{refund.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{refund.reason}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${refund.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                refund.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {refund.status === 'approved' && <CheckCircle size={12} />}
                                                {refund.status === 'rejected' && <XCircle size={12} />}
                                                {refund.status === 'pending' && <AlertCircle size={12} />}
                                                {refund.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(refund.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {refund.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleApprove(refund.id)} className="text-green-600 hover:text-green-900" title="Approve">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900" title="Reject">
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="text-gray-400 hover:text-gray-600" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                    <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
}
