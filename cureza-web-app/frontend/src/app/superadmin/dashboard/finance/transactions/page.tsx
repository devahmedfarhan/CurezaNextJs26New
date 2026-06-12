'use client';

import { useState, useEffect } from 'react';
import { 
    Search, 
    Download, 
    Calendar, 
    Users, 
    Briefcase,
    Stethoscope, 
    DollarSign, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownLeft, 
    RefreshCcw,
    FileText,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Transaction {
    id: string;
    date: string;
    stakeholder_name: string;
    stakeholder_role: 'seller' | 'doctor' | 'customer';
    type: string;
    gross_amount: number;
    net_amount: number;
    commission: number;
    reference_id: string;
    description: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stakeholderType, setStakeholderType] = useState<'all' | 'seller' | 'doctor' | 'customer'>('all');
    const [txType, setTxType] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);

    // Stats aggregates computed from loaded data or API overview
    const [stats, setStats] = useState({
        totalVolume: 0,
        customerPayments: 0,
        doctorPayouts: 0,
        sellerPayouts: 0
    });

    useEffect(() => {
        fetchTransactions();
    }, [page, stakeholderType, txType, startDate, endDate]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (stakeholderType !== 'all') params.append('stakeholder_type', stakeholderType);
            if (txType !== 'all') params.append('type', txType);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (searchTerm) params.append('search', searchTerm);

            const res = await api.get(`/admin/finance/transactions?${params}`);
            setTransactions(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                per_page: res.data.per_page,
                total: res.data.total
            });

            // If it's page 1 and no role filters, compute stats from all loaded transaction values for visualization
            if (res.data.data) {
                let gross = 0;
                let cust = 0;
                let docPay = 0;
                let selPay = 0;
                res.data.data.forEach((t: Transaction) => {
                    if (t.stakeholder_role === 'customer' && t.type === 'order_payment') {
                        cust += t.gross_amount;
                    }
                    if (t.stakeholder_role === 'doctor' && t.type === 'payout') {
                        docPay += t.net_amount;
                    }
                    if (t.stakeholder_role === 'seller' && t.type === 'payout') {
                        selPay += t.net_amount;
                    }
                    gross += t.gross_amount;
                });
                setStats({
                    totalVolume: gross,
                    customerPayments: cust,
                    doctorPayouts: docPay,
                    sellerPayouts: selPay
                });
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchTransactions();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStakeholderType('all');
        setTxType('all');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const getRoleBadge = (role: 'seller' | 'doctor' | 'customer') => {
        switch (role) {
            case 'seller':
                return (
                    <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                        <Briefcase size={12} /> Seller
                    </span>
                );
            case 'doctor':
                return (
                    <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-100">
                        <Stethoscope size={12} /> Doctor
                    </span>
                );
            case 'customer':
                return (
                    <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-100">
                        <Users size={12} /> Customer
                    </span>
                );
        }
    };

    const getTxTypeBadge = (type: string) => {
        const styleMap: { [key: string]: string } = {
            earning: 'bg-green-50 text-green-700 border-green-100',
            payout: 'bg-red-50 text-red-700 border-red-100',
            order_payment: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            refund: 'bg-orange-50 text-orange-700 border-orange-100',
            commission_deduction: 'bg-pink-50 text-pink-700 border-pink-100',
            gateway_fee: 'bg-slate-100 text-slate-700 border-slate-200'
        };

        const displayMap: { [key: string]: string } = {
            earning: 'Earning',
            payout: 'Payout',
            order_payment: 'Payment Received',
            refund: 'Refunded',
            commission_deduction: 'Commission',
            gateway_fee: 'Gateway Fee'
        };

        const style = styleMap[type] || 'bg-gray-50 text-gray-700 border-gray-100';
        const display = displayMap[type] || type.replace('_', ' ');

        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${style}`}>
                {display}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#0f4c3a]">Unified Transactions Ledger</h1>
                    <p className="text-gray-500">Real-time consolidated ledger of all financial events for doctors, sellers, and customers.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchTransactions}
                        className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCcw size={18} />
                    </button>
                    <Link
                        href="/superadmin/dashboard/finance/tax"
                        className="flex items-center gap-2 bg-[#0f4c3a] text-white px-4 py-2 rounded-lg hover:bg-[#0a3528] transition-colors font-semibold"
                    >
                        <FileText size={18} />
                        Invoice Generator
                    </Link>
                </div>
            </div>

            {/* Quick Stat Aggregates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-green-50 text-green-700 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Loaded Page Volume</p>
                        <h4 className="text-xl font-bold text-gray-900">₹{stats.totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-xl">
                        <ArrowDownLeft size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Customer Payments</p>
                        <h4 className="text-xl font-bold text-gray-900">₹{stats.customerPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Doctor Payouts</p>
                        <h4 className="text-xl font-bold text-gray-900">₹{stats.doctorPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3.5 bg-blue-50 text-blue-700 rounded-xl">
                        <ArrowUpRight size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Seller Payouts</p>
                        <h4 className="text-xl font-bold text-gray-900">₹{stats.sellerPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                    </div>
                </div>
            </div>

            {/* Filter Control Dashboard */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    {/* Role Filter Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => { setStakeholderType('all'); setPage(1); }}
                            className={`px-4 py-2 text-xs font-bold rounded-md transition ${stakeholderType === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            All Roles
                        </button>
                        <button
                            onClick={() => { setStakeholderType('customer'); setPage(1); }}
                            className={`px-4 py-2 text-xs font-bold rounded-md transition ${stakeholderType === 'customer' ? 'bg-[#0f4c3a] text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Customers
                        </button>
                        <button
                            onClick={() => { setStakeholderType('doctor'); setPage(1); }}
                            className={`px-4 py-2 text-xs font-bold rounded-md transition ${stakeholderType === 'doctor' ? 'bg-[#0f4c3a] text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Doctors
                        </button>
                        <button
                            onClick={() => { setStakeholderType('seller'); setPage(1); }}
                            className={`px-4 py-2 text-xs font-bold rounded-md transition ${stakeholderType === 'seller' ? 'bg-[#0f4c3a] text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Sellers
                        </button>
                    </div>

                    {/* Text Search */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, order # or ref..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#0f4c3a] focus:border-[#0f4c3a]"
                        />
                    </form>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                    {/* Tx Type Filter */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tx Type</label>
                        <select
                            value={txType}
                            onChange={(e) => { setTxType(e.target.value); setPage(1); }}
                            className="w-full border border-gray-300 rounded-lg text-sm p-2 focus:outline-none focus:ring-1 focus:ring-[#0f4c3a]"
                        >
                            <option value="all">All Types</option>
                            <option value="earning">Earning / Booking</option>
                            <option value="payout">Payout</option>
                            <option value="order_payment">Order Payment</option>
                            <option value="refund">Refund</option>
                            <option value="commission_deduction">Commission</option>
                            <option value="gateway_fee">Gateway Fee</option>
                        </select>
                    </div>

                    {/* Date Filters */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            className="w-full border border-gray-300 rounded-lg text-sm p-2 focus:outline-none focus:ring-1 focus:ring-[#0f4c3a]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            className="w-full border border-gray-300 rounded-lg text-sm p-2 focus:outline-none focus:ring-1 focus:ring-[#0f4c3a]"
                        />
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="w-full text-center text-sm font-semibold py-2 text-[#0f4c3a] bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table / Ledger */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Stakeholder</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Reference</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Gross</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Comm.</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Net Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f4c3a] mx-auto"></div>
                                        <p className="mt-3">Loading transaction records...</p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No transaction logs found matching search criteria.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => {
                                    const isDebit = tx.type === 'payout' || tx.type === 'refund' || tx.type === 'commission_deduction' || tx.type === 'gateway_fee';
                                    return (
                                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900 text-sm">{tx.stakeholder_name}</div>
                                                <div className="mt-0.5">{getRoleBadge(tx.stakeholder_role)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getTxTypeBadge(tx.type)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {tx.reference_id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                                {tx.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                                ₹{tx.gross_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-pink-600 font-medium">
                                                {tx.commission > 0 ? `₹${tx.commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold ${isDebit ? 'text-red-600' : 'text-emerald-700'}`}>
                                                {isDebit ? '-' : '+'}₹{tx.net_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.last_page > 1 && (
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} entries)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} className="inline mr-1" /> Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={page === pagination.last_page}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next <ChevronRight size={16} className="inline ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
