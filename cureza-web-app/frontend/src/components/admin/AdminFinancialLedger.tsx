'use client';

import { useState, useEffect } from 'react';
import { 
    Search, 
    Download, 
    Calendar, 
    Check, 
    X, 
    Eye, 
    Save, 
    CreditCard, 
    Landmark, 
    Percent, 
    ShieldAlert, 
    ArrowUpRight,
    ArrowDownLeft,
    ChevronLeft,
    ChevronRight,
    Info
} from 'lucide-react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

// TS Interfaces
interface SellerRevenue {
    seller_id: number;
    seller_name: string;
    brand_name: string;
    total_sales: number;
    platform_commission: number;
    gateway_fee: number;
    seller_earnings: number;
    wallet_balance: number;
    pending_payouts: number;
    commission_rate: {
        platform: number;
        gateway: number;
    };
    order_count: number;
    tcs_amount?: number;
    tds_amount?: number;
    gst_on_commission?: number;
}

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

interface Payout {
    id: number;
    seller_id: number;
    requested_amount: number;
    approved_amount: number | null;
    status: string;
    bank_details: {
        account_holder_name: string;
        account_number: string;
        ifsc_code: string;
        bank_name: string;
    } | null;
    requested_at: string;
    processed_at: string | null;
    seller: {
        id: number;
        name: string;
        email: string;
        seller_profile?: {
            brand_name: string;
        };
        seller_wallet?: {
            available_balance: number;
        };
        brand?: {
            name: string;
        };
    };
}

interface SellerCommissionConfig {
    id: number;
    seller_id: number;
    base_commission_percentage: number;
    payment_gateway_percentage: number;
    effective_commission_percentage: number;
    valid_from: string;
    valid_until: string | null;
    is_active: boolean;
    notes: string | null;
    seller?: {
        id: number;
        name: string;
        seller_profile?: {
            brand_name: string;
        };
        brand?: {
            name: string;
        };
    };
}

interface AdminFinancialLedgerProps {
    activeSection: 'transactions' | 'payouts' | 'commissions' | 'sellers';
}

export default function AdminFinancialLedger({ activeSection }: AdminFinancialLedgerProps) {
    // Shared filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // State definitions
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(1);
    const [txTotalRecords, setTxTotalRecords] = useState(0);
    const [txStakeholderType, setTxStakeholderType] = useState<'all' | 'seller' | 'doctor' | 'customer'>('all');
    const [txType, setTxType] = useState('all');

    // Payout states
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [payoutsFilter, setPayoutsFilter] = useState('pending');
    const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
    const [payoutModalOpen, setPayoutModalOpen] = useState(false);
    const [payoutTxId, setPayoutTxId] = useState('');

    const [eligibleSellers, setEligibleSellers] = useState<any[]>([]);
    const [directPayoutModalOpen, setDirectPayoutModalOpen] = useState(false);
    const [selectedSellerForDirectPayout, setSelectedSellerForDirectPayout] = useState<any>(null);
    const [directPayoutAmount, setDirectPayoutAmount] = useState('');

    // Commission states
    const [commissions, setCommissions] = useState<SellerCommissionConfig[]>([]);
    const [unconfiguredSellers, setUnconfiguredSellers] = useState<any[]>([]);
    const [commissionModalOpen, setCommissionModalOpen] = useState(false);
    const [selectedSellerForComm, setSelectedSellerForComm] = useState<any>(null);
    const [baseCommRate, setBaseCommRate] = useState(25);
    const [gatewayCommRate, setGatewayCommRate] = useState(2);
    const [commValidFrom, setCommValidFrom] = useState(new Date().toISOString().split('T')[0]);
    const [commNotes, setCommNotes] = useState('');

    // Seller summary states
    const [sellers, setSellers] = useState<SellerRevenue[]>([]);

    useEffect(() => {
        setTxPage(1);
        fetchData();
    }, [activeSection, txStakeholderType, txType, payoutsFilter, startDate, endDate]);

    useEffect(() => {
        // Debounced search trigger
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (searchTerm) params.append('search', searchTerm);

            if (activeSection === 'transactions') {
                params.append('page', txPage.toString());
                params.append('per_page', '10');
                if (txStakeholderType !== 'all') params.append('stakeholder_type', txStakeholderType);
                if (txType !== 'all') params.append('type', txType);
                const res = await api.get(`/admin/finance/transactions?${params}`);
                setTransactions(res.data.data || []);
                setTxTotalPages(res.data.last_page || 1);
                setTxTotalRecords(res.data.total || 0);
            } else if (activeSection === 'payouts') {
                if (payoutsFilter === 'eligible') {
                    const tempParams = new URLSearchParams();
                    if (searchTerm) tempParams.append('search', searchTerm);
                    tempParams.append('per_page', '100');
                    const res = await api.get(`/admin/finance/sellers?${tempParams}`);
                    const allSellers = res.data.data || [];
                    const eligible = allSellers.filter((s: any) => s.wallet_balance > 0);
                    setEligibleSellers(eligible);
                } else {
                    const endpoint = payoutsFilter === 'pending'
                        ? `/admin/payouts/pending?${params}`
                        : `/admin/payouts?status=${payoutsFilter}&${params}`;
                    const res = await api.get(endpoint);
                    setPayouts(res.data.data || []);
                }
            } else if (activeSection === 'commissions') {
                const [commRes, unconfiguredRes] = await Promise.all([
                    api.get(`/admin/commissions?${params}`),
                    api.get(`/admin/commissions/unconfigured?${params}`)
                ]);
                setCommissions(commRes.data.data || []);
                setUnconfiguredSellers(unconfiguredRes.data || []);
            } else if (activeSection === 'sellers') {
                const res = await api.get(`/admin/finance/sellers?${params}`);
                setSellers(res.data.data || []);
            }
        } catch (error) {
            console.error(`Error loading active section [${activeSection}]:`, error);
        } finally {
            setLoading(false);
        }
    };

    // CSV Exports
    const handleExportLedger = async (type: 'gst' | 'settlement') => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            params.append('type', type === 'gst' ? 'sellers' : 'overview');

            const response = await api.get(`/admin/finance/export?${params}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `platform-${type}-audit-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export CSV report:', error);
            alert('Failed to export report.');
        }
    };

    // Approve Payout
    const handleApprovePayout = async (payoutId: number) => {
        if (!payoutTxId.trim()) {
            alert('Please enter bank transaction reference ID (UTR).');
            return;
        }
        try {
            await api.post(`/admin/payouts/${payoutId}/approve`, {
                transaction_id: payoutTxId
            });
            alert('Payout approved and wallet balances adjusted successfully!');
            setPayoutModalOpen(false);
            setSelectedPayout(null);
            setPayoutTxId('');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Failed to approve payout.');
        }
    };

    // Reject Payout
    const handleRejectPayout = async (payoutId: number) => {
        const reason = prompt('Please enter the reason for rejecting this payout request:');
        if (reason === null) return; 
        if (!reason.trim()) {
            alert('A rejection reason is required.');
            return;
        }
        try {
            await api.post(`/admin/payouts/${payoutId}/reject`, {
                reason: reason
            });
            alert('Payout request rejected.');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Failed to reject payout.');
        }
    };

    // Direct Payout Submit
    const handleDirectPayoutSubmit = async () => {
        if (!selectedSellerForDirectPayout) return;
        const amount = parseFloat(directPayoutAmount);
        if (!amount || amount < 100) {
            alert('Minimum direct payout capacity threshold is ₹100.00.');
            return;
        }
        if (amount > selectedSellerForDirectPayout.wallet_balance) {
            alert(`Settle amount exceeds maximum withdrawable balance.`);
            return;
        }
        if (!payoutTxId.trim()) {
            alert('Please enter bank transaction reference ID (UTR).');
            return;
        }

        try {
            await api.post(`/admin/payouts/direct`, {
                seller_id: selectedSellerForDirectPayout.seller_id,
                amount: amount,
                transaction_id: payoutTxId
            });
            alert('Direct settlement payout processed and wallet ledger records updated successfully!');
            setDirectPayoutModalOpen(false);
            setSelectedSellerForDirectPayout(null);
            setPayoutTxId('');
            setDirectPayoutAmount('');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || error.response?.data?.message || 'Failed to execute direct payout.');
        }
    };

    // Commission Update
    const handleUpdateCommission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSellerForComm) return;

        if (baseCommRate < 22 || baseCommRate > 27) {
            alert('Base commission rate must be between 22% and 27%.');
            return;
        }
        if (gatewayCommRate < 2 || gatewayCommRate > 3) {
            alert('Payment gateway fee rate must be between 2% and 3%.');
            return;
        }

        try {
            await api.post(`/admin/commissions/seller/${selectedSellerForComm.id}`, {
                base_commission_percentage: baseCommRate,
                payment_gateway_percentage: gatewayCommRate,
                valid_from: commValidFrom,
                notes: commNotes
            });
            alert('Commission split configuration override updated successfully!');
            setCommissionModalOpen(false);
            setSelectedSellerForComm(null);
            setCommNotes('');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to configure commission rate.');
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[10px] border border-neutral-950/10">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={15} />
                        <input
                            type="text"
                            placeholder="Filter registers by name, ID or brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-neutral-950/10 rounded-[10px] text-xs w-full focus:outline-none focus:ring-1 focus:ring-black placeholder-neutral-400 font-medium"
                        />
                    </div>

                    <div className="flex items-center border border-neutral-950/10 rounded-[10px] px-3 py-1.5 text-xs gap-2 bg-neutral-50/50">
                        <Calendar size={14} className="text-neutral-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent focus:outline-none text-neutral-700 font-medium cursor-pointer"
                        />
                        <span className="text-neutral-300">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent focus:outline-none text-neutral-700 font-medium cursor-pointer"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-red-500 hover:text-red-700 font-bold ml-1"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleExportLedger('gst')}
                        className="flex items-center gap-2 bg-white border border-neutral-950/10 text-neutral-700 px-4 py-2 rounded-[10px] hover:bg-neutral-50 transition-all font-semibold text-xs active:scale-95"
                    >
                        <Download size={14} />
                        Export GSTR CSV
                    </button>
                    <button
                        onClick={() => handleExportLedger('settlement')}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-[10px] hover:bg-neutral-900 transition-all font-semibold text-xs active:scale-95"
                    >
                        <Download size={14} />
                        Export Settlements CSV
                    </button>
                </div>
            </div>

            {/* Section Views */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                >
                    {/* SECTION 1: CONSOLIDATED TRANSACTIONS LOG */}
                    {activeSection === 'transactions' && (
                        <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-950/10 pb-4">
                                <div>
                                    <h3 className="font-semibold text-black text-base flex items-center gap-2">
                                        <CreditCard size={18} /> Consolidated Platform Ledgers
                                    </h3>
                                    <p className="text-xs text-neutral-450 mt-1">Audit log of customer orders, wallet disbursements, PG cuts, and compliance deductions.</p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                    {['all', 'customer', 'seller', 'doctor'].map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => setTxStakeholderType(role as any)}
                                            className={`px-3 py-1.5 rounded-[10px] capitalize transition-all border ${
                                                txStakeholderType === role
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-neutral-700 border-neutral-950/10 hover:bg-neutral-50'
                                            }`}
                                        >
                                            {role}s
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Filter by Ledger Event Type</label>
                                    <select
                                        value={txType}
                                        onChange={(e) => setTxType(e.target.value)}
                                        className="w-full border border-neutral-950/10 rounded-[10px] text-xs p-2.5 bg-neutral-50/50 font-semibold focus:outline-none focus:border-black"
                                    >
                                        <option value="all">All event classes</option>
                                        <option value="earning">Commission Earning share</option>
                                        <option value="payout">Settlements Payout released</option>
                                        <option value="order_payment">Customer Cart orders</option>
                                        <option value="refund">Reversed Settlements (Refunds)</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-12 text-center text-neutral-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                    <p className="mt-2 text-xs font-medium">Fetching register entries...</p>
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-12 text-xs text-neutral-450 font-semibold bg-neutral-50 rounded-[10px] border border-neutral-950/10">
                                    No ledger event rows match your active search terms.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                        <thead>
                                            <tr className="text-neutral-500 font-semibold border-b border-neutral-950/10">
                                                <th className="py-3 px-4 font-semibold">Date / Time</th>
                                                <th className="py-3 px-4 font-semibold">Partner Target</th>
                                                <th className="py-3 px-4 font-semibold">Role</th>
                                                <th className="py-3 px-4 font-semibold">Event Class</th>
                                                <th className="py-3 px-4 font-semibold">Ref ID</th>
                                                <th className="py-3 px-4 font-semibold">Description</th>
                                                <th className="py-3 px-4 text-right font-semibold">Gross Vol</th>
                                                <th className="py-3 px-4 text-right font-semibold">Platform Fee</th>
                                                <th className="py-3 px-4 text-right font-semibold">Net Payout Flow</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50">
                                            {transactions.map((tx) => {
                                                const isDebit = tx.type === 'payout' || tx.type === 'refund';
                                                return (
                                                    <tr key={tx.id} className="hover:bg-neutral-50 transition-colors">
                                                        <td className="py-3.5 px-4 text-neutral-400 font-mono">
                                                            {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', {
                                                                day: '2-digit', month: 'short', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            }) : 'N/A'}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-neutral-900">{tx.stakeholder_name}</td>
                                                        <td className="py-3.5 px-4 capitalize font-semibold text-neutral-500">{tx.stakeholder_role}</td>
                                                        <td className="py-3.5 px-4">
                                                            <span className={`px-2 py-0.5 rounded-[10px] text-[9px] font-semibold border ${
                                                                tx.type === 'order_payment' ? 'bg-neutral-50 text-neutral-805 border-neutral-200' :
                                                                tx.type === 'payout' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                tx.type === 'refund' ? 'bg-red-50 text-red-700 border-red-155' :
                                                                'bg-green-50 text-green-700 border-green-150'
                                                            }`}>
                                                                {tx.type.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-medium text-neutral-500">{tx.reference_id}</td>
                                                        <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate font-medium">{tx.description}</td>
                                                        <td className="py-3.5 px-4 text-right font-bold text-neutral-900">₹{tx.gross_amount.toLocaleString('en-IN')}</td>
                                                        <td className="py-3.5 px-4 text-right text-red-650 font-bold">
                                                            {tx.commission > 0 ? `₹${tx.commission.toLocaleString('en-IN')}` : '—'}
                                                        </td>
                                                        <td className={`py-3.5 px-4 text-right font-extrabold ${isDebit ? 'text-red-650' : 'text-green-700'}`}>
                                                            {isDebit ? '-' : '+'}₹{tx.net_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination controls */}
                            {txTotalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-neutral-950/10 pt-4 text-xs font-semibold">
                                    <span className="text-neutral-450 font-normal">
                                        Showing page {txPage} of {txTotalPages} ({txTotalRecords} rows)
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTxPage(p => Math.max(1, p - 1))}
                                            disabled={txPage === 1}
                                            className="px-3.5 py-1.5 border border-neutral-950/10 rounded-[10px] bg-white hover:bg-neutral-50 disabled:opacity-50 transition-all font-semibold active:scale-95"
                                        >
                                            Previous Page
                                        </button>
                                        <button
                                            onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                                            disabled={txPage === txTotalPages}
                                            className="px-3.5 py-1.5 border border-neutral-950/10 rounded-[10px] bg-white hover:bg-neutral-50 disabled:opacity-50 transition-all font-semibold active:scale-95"
                                        >
                                            Next Page
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: WITHDRAWAL & PAYOUT RELEASES */}
                    {activeSection === 'payouts' && (
                        <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-950/10 pb-4">
                                <div>
                                    <h3 className="font-semibold text-black text-base flex items-center gap-2">
                                        <Landmark size={18} /> Settlements Withdrawal Requests Queue
                                    </h3>
                                    <p className="text-xs text-neutral-450 mt-1">Verify linked escrow balances, upload UTR bank confirmation codes, and dispatch vendor payouts.</p>
                                    <div className="flex bg-neutral-100 p-1 rounded-[10px] gap-1 text-xs font-semibold border border-neutral-950/10">
                                        {['pending', 'approved', 'rejected', 'eligible'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => setPayoutsFilter(st)}
                                                className={`px-3 py-1 rounded-[10px] capitalize transition-all ${payoutsFilter === st ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                                            >
                                                {st === 'eligible' ? 'Eligible Sellers for Payout' : `${st} requests`}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="py-12 text-center text-neutral-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                    <p className="mt-2 text-xs font-medium">Scanning queue...</p>
                                </div>
                            ) : payoutsFilter === 'eligible' ? (
                                eligibleSellers.length === 0 ? (
                                    <div className="text-center py-12 text-xs text-neutral-450 font-semibold bg-neutral-50 rounded-[10px] border border-neutral-950/10">
                                        No sellers are currently eligible for payout (wallet available balances are zero or negative).
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-semibold border-b border-neutral-950/10">
                                                    <th className="py-3 px-4 font-semibold">Seller Profile & Brand</th>
                                                    <th className="py-3 px-4 font-semibold">Withdrawable Balance</th>
                                                    <th className="py-3 px-4 font-semibold">Pending Escrow Hold</th>
                                                    <th className="py-3 px-4 font-semibold">Bank Routing Details</th>
                                                    <th className="py-3 px-4 text-center font-semibold">Manual Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50 font-medium">
                                                {eligibleSellers.map(s => (
                                                    <tr key={s.seller_id} className="hover:bg-neutral-50 transition-colors">
                                                        <td className="py-3.5 px-4">
                                                            <div className="font-bold text-neutral-900">{s.seller_name}</div>
                                                            <div className="text-[9px] text-neutral-400 font-medium">{s.brand_name && s.brand_name !== 'N/A' ? s.brand_name : s.seller_name}</div>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-extrabold text-green-700">₹{s.wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="py-3.5 px-4 text-amber-700 font-bold">₹{s.pending_payouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                                        <td className="py-3.5 px-4">
                                                            {s.bank_details ? (
                                                                <div className="font-semibold text-neutral-700">
                                                                    <p>{s.bank_details.bank_name} ({s.bank_details.account_holder_name})</p>
                                                                    <p className="font-mono text-[9px] text-neutral-400">A/C: {s.bank_details.account_number} (IFSC: {s.bank_details.ifsc_code})</p>
                                                                </div>
                                                            ) : <span className="text-red-655 font-bold">Bank Credentials Missing</span>}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSellerForDirectPayout(s);
                                                                    setDirectPayoutAmount(s.wallet_balance.toString());
                                                                    setDirectPayoutModalOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-black text-white hover:bg-neutral-900 rounded-[10px] font-bold text-[10px] active:scale-95 transition-all"
                                                            >
                                                                Settle & Transfer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            ) : payouts.length === 0 ? (
                                <div className="text-center py-12 text-xs text-neutral-450 font-semibold bg-neutral-50 rounded-[10px] border border-neutral-950/10">
                                    No {payoutsFilter} settlement release requests are pending.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                        <thead>
                                            <tr className="text-neutral-500 font-semibold border-b border-neutral-950/10">
                                                <th className="py-3 px-4 font-semibold">Seller Profile & Brand</th>
                                                <th className="py-3 px-4 font-semibold">Requested Sum</th>
                                                <th className="py-3 px-4 font-semibold">Available Wallet Ledger</th>
                                                <th className="py-3 px-4 font-semibold">Submission Date</th>
                                                <th className="py-3 px-4 font-semibold">Associated Routing Bank Info</th>
                                                <th className="py-3 px-4 text-center font-semibold">Process Release</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50">
                                            {payouts.map(p => (
                                                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-bold text-neutral-900">{p.seller.name}</div>
                                                        <div className="text-[9px] text-neutral-400 font-medium">{p.seller.brand?.name || p.seller.seller_profile?.brand_name || p.seller.name}</div>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-bold text-neutral-900">₹{p.requested_amount.toLocaleString('en-IN')}</td>
                                                    <td className="py-3.5 px-4 text-neutral-500 font-semibold">₹{(p.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN')}</td>
                                                    <td className="py-3.5 px-4 text-neutral-400 font-medium">{new Date(p.requested_at).toLocaleDateString('en-IN')}</td>
                                                    <td className="py-3.5 px-4">
                                                        {p.bank_details ? (
                                                            <div className="font-semibold text-neutral-700">
                                                                <p>{p.bank_details.bank_name}</p>
                                                                <p className="font-mono text-[9px] text-neutral-400">No: {p.bank_details.account_number} (IFSC: {p.bank_details.ifsc_code})</p>
                                                            </div>
                                                        ) : <span className="text-red-655 font-bold">Bank Credentials Missing</span>}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button
                                                                onClick={() => { setSelectedPayout(p); setPayoutModalOpen(true); }}
                                                                className="p-1.5 bg-white text-black border border-neutral-950/10 rounded-[8px] hover:bg-neutral-50 transition-all"
                                                                title="View details"
                                                            >
                                                                <Eye size={13} />
                                                            </button>
                                                            {p.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => { setSelectedPayout(p); setPayoutModalOpen(true); }}
                                                                        className="p-1.5 bg-green-50 text-green-700 border border-green-150 rounded-[8px] hover:bg-green-100/50 transition-all"
                                                                        title="Approve Settlement"
                                                                    >
                                                                        <Check size={13} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectPayout(p.id)}
                                                                        className="p-1.5 bg-red-50 text-red-655 border border-red-100 rounded-[8px] hover:bg-red-100/50 transition-all"
                                                                        title="Reject Request"
                                                                    >
                                                                        <X size={13} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 3: COMMISSION SPLIT CONTROLS */}
                    {activeSection === 'commissions' && (
                        <div className="space-y-6">
                            {/* Alert banners */}
                            {unconfiguredSellers.length > 0 && (
                                <div className="bg-amber-50/50 border border-amber-900/10 p-4 rounded-[10px] flex items-start gap-3 text-xs text-amber-800 animate-pulse">
                                    <Info className="flex-shrink-0 mt-0.5 text-amber-700" size={16} />
                                    <div>
                                        <p className="font-bold text-amber-900">Unconfigured Active Vendors</p>
                                        <p className="mt-1 text-amber-800/90 font-medium">
                                            The following {unconfiguredSellers.length} vendors are currently using default baseline rates. Click to set customized overrides:
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {unconfiguredSellers.map(s => (
                                                <span 
                                                    key={s.id}
                                                    onClick={() => {
                                                        setSelectedSellerForComm(s);
                                                        setBaseCommRate(25);
                                                        setGatewayCommRate(2);
                                                        setCommissionModalOpen(true);
                                                    }}
                                                    className="bg-white border border-amber-900/10 px-2.5 py-0.5 rounded-[10px] cursor-pointer hover:bg-neutral-50 text-amber-900 font-bold active:scale-95 transition-all"
                                                >
                                                    Set Custom for {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Active Profiles Table */}
                            <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/15 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-950/10 pb-4">
                                    <div>
                                        <h3 className="font-semibold text-black text-base flex items-center gap-2">
                                            <Percent size={18} /> Active Vendor Commission Profiles
                                        </h3>
                                        <p className="text-xs text-neutral-500">Configure B2B platform split rates. Custom values overwrite standard 25% commissions.</p>
                                    </div>
                                    <div className="bg-neutral-50 px-3 py-1 rounded-[10px] border border-neutral-950/10 text-xs font-bold text-neutral-600">
                                        Policy Ranges: Base commission (22% - 27%) | Payment Gateway (2% - 3%)
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="py-12 text-center text-neutral-450">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                        <p className="mt-2 text-xs font-medium">Scanning profiles...</p>
                                    </div>
                                ) : (commissions.length === 0 && unconfiguredSellers.length === 0) ? (
                                    <div className="text-center py-12 text-xs text-neutral-450 font-semibold bg-neutral-50 border border-neutral-950/10 rounded-[10px]">
                                        No vendor accounts registered.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                            <thead>
                                                <tr className="text-neutral-500 font-semibold border-b border-neutral-950/10">
                                                    <th className="py-3 px-4 font-semibold">Vendor Shop Name</th>
                                                    <th className="py-3 px-4 font-semibold">Base Commission Rate</th>
                                                    <th className="py-3 px-4 font-semibold">Gateway Processing Fee</th>
                                                    <th className="py-3 px-4 font-semibold">Effective Cut Rate</th>
                                                    <th className="py-3 px-4 font-semibold">Policy Start Date</th>
                                                    <th className="py-3 px-4 font-semibold">Audit Reference Notes</th>
                                                    <th className="py-3 px-4 text-center font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-50 font-medium">
                                                {/* Customized configuration Profiles */}
                                                {commissions.map((c) => (
                                                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                                                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                                                            <div className="flex items-center gap-1.5">
                                                                {c.seller?.name || 'Seller ID #' + c.seller_id}
                                                                <span className="bg-neutral-105 text-black text-[9px] font-bold px-2 py-0.5 rounded-[10px] border border-neutral-950/10 uppercase tracking-wider">Custom Profile</span>
                                                            </div>
                                                            <div className="text-[10px] text-neutral-400 font-normal">{c.seller?.brand?.name || c.seller?.seller_profile?.brand_name || c.seller?.name || 'N/A'}</div>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-neutral-750">{c.base_commission_percentage}%</td>
                                                        <td className="py-3.5 px-4 text-neutral-500 font-semibold">{c.payment_gateway_percentage}%</td>
                                                        <td className="py-3.5 px-4 text-black font-extrabold">{c.effective_commission_percentage}%</td>
                                                        <td className="py-3.5 px-4 text-neutral-400 font-mono">{new Date(c.valid_from).toLocaleDateString('en-IN')}</td>
                                                        <td className="py-3.5 px-4 text-neutral-500 italic max-w-xs truncate font-normal">{c.notes || '—'}</td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSellerForComm({ id: c.seller_id, name: c.seller?.name || 'Seller ID #' + c.seller_id });
                                                                    setBaseCommRate(c.base_commission_percentage);
                                                                    setGatewayCommRate(c.payment_gateway_percentage);
                                                                    setCommNotes(c.notes || '');
                                                                    setCommissionModalOpen(true);
                                                                }}
                                                                className="px-2.5 py-1.5 bg-white text-black rounded-[10px] border border-neutral-950/10 hover:bg-neutral-50 font-bold active:scale-95 transition-all"
                                                            >
                                                                Override Policy
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Global Fallback active profiles */}
                                                {unconfiguredSellers.map((s) => (
                                                    <tr key={'unconf-' + s.id} className="hover:bg-neutral-50 transition-colors bg-neutral-50/20">
                                                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                                                            <div className="flex items-center gap-1.5">
                                                                {s.name}
                                                                <span className="bg-neutral-100 text-neutral-500 text-[9px] font-bold px-2 py-0.5 rounded-[10px] border border-neutral-950/10 uppercase tracking-wider">Fallback Default</span>
                                                            </div>
                                                            <div className="text-[10px] text-neutral-400 font-normal">{s.brand?.name || s.seller_profile?.brand_name || s.name || 'N/A'}</div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-neutral-450 font-normal">25.00% (Baseline)</td>
                                                        <td className="py-3.5 px-4 text-neutral-450 font-normal">2.50% (Baseline)</td>
                                                        <td className="py-3.5 px-4 text-black font-semibold">27.50%</td>
                                                        <td className="py-3.5 px-4 text-neutral-400 font-mono">System Default</td>
                                                        <td className="py-3.5 px-4 text-neutral-500 italic font-normal">Standard global split configuration</td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSellerForComm(s);
                                                                    setBaseCommRate(25);
                                                                    setGatewayCommRate(2.5);
                                                                    setCommNotes('');
                                                                    setCommissionModalOpen(true);
                                                                }}
                                                                className="px-2.5 py-1.5 bg-black text-white rounded-[10px] hover:bg-neutral-900 font-bold active:scale-95 transition-all"
                                                            >
                                                                Configure Custom
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECTION 4: SELLERS BUSINESS LEDGER */}
                    {activeSection === 'sellers' && (
                        <div className="bg-white p-6 rounded-[10px] border-[0.5px] border-neutral-950/10 space-y-6">
                            <div>
                                <h3 className="font-semibold text-black text-base flex items-center gap-2">
                                    <Landmark size={18} /> Sellers Financial Ledgers
                                </h3>
                                <p className="text-xs text-neutral-450 mt-1">Aggregated sales volume, active platform commissions, statutory deductions (TCS/TDS), and wallet pending/available accounts.</p>
                            </div>

                            {loading ? (
                                <div className="py-12 text-center text-neutral-400">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                                    <p className="mt-2 text-xs font-medium">Aggregating balances...</p>
                                </div>
                            ) : sellers.length === 0 ? (
                                <div className="text-center py-12 text-xs text-neutral-450 font-semibold bg-neutral-50 rounded-[10px] border border-neutral-950/10">
                                    No seller business ledgers found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-neutral-100 text-left text-xs">
                                        <thead>
                                            <tr className="text-neutral-500 font-semibold border-b border-neutral-950/10">
                                                <th className="py-3 px-4 font-semibold">Seller Profile</th>
                                                <th className="py-3 px-4 font-semibold">Total Sales (Gross)</th>
                                                <th className="py-3 px-4 font-semibold">Commission Split</th>
                                                <th className="py-3 px-4 font-semibold">GST on Commission (18%)</th>
                                                <th className="py-3 px-4 font-semibold">Gateway Processing Fee</th>
                                                <th className="py-3 px-4 font-semibold">Statutory Deductions (1% TCS + 1% TDS)</th>
                                                <th className="py-3 px-4 font-semibold">Net Earnings</th>
                                                <th className="py-3 px-4 font-semibold">Settled Paid Amount</th>
                                                <th className="py-3 px-4 font-semibold">Pending Escrow Hold</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50 font-medium">
                                            {sellers.map((sel) => {
                                                const tcs = sel.tcs_amount ?? (sel.total_sales * 0.01);
                                                const tds = sel.tds_amount ?? (sel.total_sales * 0.01);
                                                const withholdings = tcs + tds;
                                                return (
                                                    <tr key={sel.seller_id} className="hover:bg-neutral-50 transition-colors">
                                                        <td className="py-3.5 px-4 font-bold text-neutral-900">
                                                            <div>{sel.seller_name}</div>
                                                            <div className="text-[10px] text-neutral-400 font-normal">{sel.brand_name || sel.seller_name}</div>
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-neutral-900">₹{sel.total_sales.toLocaleString('en-IN')}</td>
                                                        <td className="py-3.5 px-4 text-red-655 font-bold">₹{sel.platform_commission.toLocaleString('en-IN')} ({sel.commission_rate.platform}%)</td>
                                                        <td className="py-3.5 px-4 text-red-655/90 font-bold">₹{parseFloat(String(sel.gst_on_commission ?? (sel.platform_commission * 0.18))).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (18%)</td>
                                                        <td className="py-3.5 px-4 text-neutral-500 font-semibold">₹{sel.gateway_fee.toLocaleString('en-IN')} ({sel.commission_rate.gateway}%)</td>
                                                        <td className="py-3.5 px-4 text-neutral-500 font-semibold">
                                                            <div>₹{withholdings.toLocaleString('en-IN')}</div>
                                                            <div className="text-[8px] text-neutral-450 font-normal font-sans">TCS: 1% | TDS: 1%</div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-green-700 font-extrabold">₹{sel.seller_earnings.toLocaleString('en-IN')}</td>
                                                        <td className="py-3.5 px-4 font-bold text-neutral-900">₹{sel.wallet_balance.toLocaleString('en-IN')}</td>
                                                        <td className="py-3.5 px-4 font-bold text-amber-700">₹{sel.pending_payouts.toLocaleString('en-IN')}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* MODAL 1: PAYOUT DETAILS VIEW & APPROVAL ACTION */}
            {payoutModalOpen && selectedPayout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-[10px] p-6 max-w-lg w-full border-[0.5px] border-neutral-950/15 relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => { setPayoutModalOpen(false); setSelectedPayout(null); setPayoutTxId(''); }}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                            <Landmark size={18} /> Payout Settlement Request
                        </h3>
                        
                        <div className="space-y-4 text-xs font-semibold text-neutral-600">
                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                <h4 className="font-bold text-black border-b border-neutral-950/10 pb-1 mb-2">Merchant Registration details</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><p className="text-neutral-450 font-normal">Name</p><p className="font-bold text-neutral-900">{selectedPayout.seller.name}</p></div>
                                    <div><p className="text-neutral-450 font-normal">Brand</p><p className="font-bold text-neutral-900">{selectedPayout.seller.brand?.name || selectedPayout.seller.seller_profile?.brand_name || selectedPayout.seller.name}</p></div>
                                    <div><p className="text-neutral-450 font-normal">Email</p><p className="font-normal text-neutral-700">{selectedPayout.seller.email}</p></div>
                                    <div><p className="text-neutral-450 font-normal">Wallet Balance</p><p className="font-extrabold text-green-700">₹{(selectedPayout.seller.seller_wallet?.available_balance || 0).toLocaleString('en-IN')}</p></div>
                                </div>
                            </div>

                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                <h4 className="font-bold text-black border-b border-neutral-950/10 pb-1 mb-2">Disbursement Request Parameters</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><p className="text-neutral-450 font-normal">Requested Settlement</p><p className="font-extrabold text-lg text-black">₹{selectedPayout.requested_amount.toLocaleString('en-IN')}</p></div>
                                    <div><p className="text-neutral-450 font-normal">Status</p><span className="inline-block bg-neutral-100 text-black px-2 py-0.5 rounded-[10px] border border-neutral-950/10 text-[10px] font-bold uppercase tracking-wider">{selectedPayout.status}</span></div>
                                    <div><p className="text-neutral-450 font-normal">Request Timestamp</p><p className="font-normal text-neutral-700">{new Date(selectedPayout.requested_at).toLocaleString('en-IN')}</p></div>
                                </div>
                            </div>

                            {selectedPayout.bank_details ? (
                                <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                    <h4 className="font-bold text-black border-b border-neutral-950/10 pb-1 mb-2">Target Bank Routing Details</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><p className="text-neutral-450 font-normal">Account Holder Name</p><p className="font-bold text-neutral-900">{selectedPayout.bank_details.account_holder_name}</p></div>
                                        <div><p className="text-neutral-450 font-normal">Bank Name</p><p className="font-bold text-neutral-900">{selectedPayout.bank_details.bank_name}</p></div>
                                        <div><p className="text-neutral-450 font-normal">Account Number</p><p className="font-mono font-bold text-neutral-950">{selectedPayout.bank_details.account_number}</p></div>
                                        <div><p className="text-neutral-450 font-normal">IFSC Bank Code</p><p className="font-mono font-bold text-neutral-950">{selectedPayout.bank_details.ifsc_code}</p></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 text-red-700 text-center border border-red-150 p-3 rounded-[10px] font-bold">
                                    Caution: No bank coordinates are mapped to this profile.
                                </div>
                            )}

                            {selectedPayout.status === 'pending' && (
                                <div className="border-t border-neutral-950/10 pt-4 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-700 mb-1">Enter Bank UTR Transaction Reference ID</label>
                                        <input
                                            type="text"
                                            value={payoutTxId}
                                            onChange={(e) => setPayoutTxId(e.target.value)}
                                            placeholder="e.g. UTR202606200921"
                                            className="w-full px-3 py-2 border border-neutral-950/10 bg-white rounded-[10px] text-xs focus:ring-1 focus:ring-black focus:outline-none placeholder-neutral-450 font-mono font-semibold"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprovePayout(selectedPayout.id)}
                                            className="flex-1 py-2.5 bg-black text-white rounded-[10px] font-bold hover:bg-neutral-900 transition-all active:scale-95"
                                        >
                                            Commit & Approve Payout
                                        </button>
                                        <button
                                            onClick={() => handleRejectPayout(selectedPayout.id)}
                                            className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-150 rounded-[10px] font-bold hover:bg-red-100/50 transition-all active:scale-95"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: COMMISSION RATE OVERRIDE CONFIGURATION MODAL */}
            {commissionModalOpen && selectedSellerForComm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-[10px] p-6 max-w-md w-full border-[0.5px] border-neutral-950/15 relative">
                        <button 
                            onClick={() => { setCommissionModalOpen(false); setSelectedSellerForComm(null); }}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-base font-bold text-black mb-1 flex items-center gap-1.5">
                            <Percent size={16} /> Commission Override Configuration
                        </h3>
                        <p className="text-xs text-neutral-450 mb-4">Set customized splitting rules for vendor: <span className="font-bold text-neutral-750">{selectedSellerForComm.name}</span></p>

                        <form onSubmit={handleUpdateCommission} className="space-y-4 text-xs font-semibold text-neutral-600">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">Base Commission % (22 - 27)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={baseCommRate}
                                        onChange={(e) => setBaseCommRate(Number(e.target.value))}
                                        className="w-full border border-neutral-950/10 rounded-[10px] p-2 bg-white text-black font-bold focus:outline-none focus:border-black outline-none"
                                        min={22}
                                        max={27}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Gateway fee % (2 - 3)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={gatewayCommRate}
                                        onChange={(e) => setGatewayCommRate(Number(e.target.value))}
                                        className="w-full border border-neutral-950/10 rounded-[10px] p-2 bg-white text-black font-bold focus:outline-none focus:border-black outline-none"
                                        min={2}
                                        max={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-400 font-bold uppercase tracking-wider text-[9px] mb-1">Effective Platform Cut</label>
                                <div className="p-3 bg-neutral-50 text-black font-extrabold text-sm rounded-[10px] border border-neutral-950/10">
                                    {(baseCommRate + gatewayCommRate).toFixed(2)}% of Gross Sales
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1">Effective Start Date</label>
                                <input
                                    type="date"
                                    value={commValidFrom}
                                    onChange={(e) => setCommValidFrom(e.target.value)}
                                    className="w-full border border-neutral-950/10 rounded-[10px] p-2 bg-white text-black font-medium focus:outline-none focus:border-black cursor-pointer outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Audit Justification Notes</label>
                                <textarea
                                    value={commNotes}
                                    onChange={(e) => setCommNotes(e.target.value)}
                                    className="w-full border border-neutral-950/10 rounded-[10px] p-2 focus:outline-none bg-white text-black font-medium focus:border-black"
                                    rows={3}
                                    placeholder="Provide business reason or reference code for changing split models..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 bg-black text-white rounded-[10px] font-bold hover:bg-neutral-900 flex items-center justify-center gap-2 transition-colors active:scale-95"
                            >
                                <Save size={15} />
                                Commit Split Overrides
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: DIRECT PAYOUT SUBMISSION */}
            {directPayoutModalOpen && selectedSellerForDirectPayout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-[10px] p-6 max-w-lg w-full border-[0.5px] border-neutral-950/15 relative max-h-[90vh] overflow-y-auto">
                        <button 
                            onClick={() => { setDirectPayoutModalOpen(false); setSelectedSellerForDirectPayout(null); setPayoutTxId(''); setDirectPayoutAmount(''); }}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                        >
                            <X size={20} />
                        </button>
                        
                        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                            <Landmark size={18} /> Direct Vendor Payout (Settle & Transfer)
                        </h3>
                        
                        <div className="space-y-4 text-xs font-semibold text-neutral-600">
                            <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                <h4 className="font-bold text-black border-b border-neutral-950/10 pb-1 mb-2">Merchant Target details</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><p className="text-neutral-450 font-normal">Name</p><p className="font-bold text-neutral-900">{selectedSellerForDirectPayout.seller_name}</p></div>
                                    <div><p className="text-neutral-450 font-normal">Brand</p><p className="font-bold text-neutral-900">{selectedSellerForDirectPayout.brand_name && selectedSellerForDirectPayout.brand_name !== 'N/A' ? selectedSellerForDirectPayout.brand_name : selectedSellerForDirectPayout.seller_name}</p></div>
                                    <div><p className="text-neutral-450 font-normal">Withdrawable Balance</p><p className="font-extrabold text-green-700">₹{selectedSellerForDirectPayout.wallet_balance.toLocaleString('en-IN')}</p></div>
                                    <div><p className="text-neutral-450 font-normal">Pending Escrow</p><p className="font-bold text-amber-700">₹{selectedSellerForDirectPayout.pending_payouts.toLocaleString('en-IN')}</p></div>
                                </div>
                            </div>

                            {selectedSellerForDirectPayout.bank_details ? (
                                <div className="bg-neutral-50 p-4 rounded-[10px] border border-neutral-950/10">
                                    <h4 className="font-bold text-black border-b border-neutral-950/10 pb-1 mb-2">Target Bank Coordinates</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><p className="text-neutral-450 font-normal">Account Holder Name</p><p className="font-bold text-neutral-900">{selectedSellerForDirectPayout.bank_details.account_holder_name}</p></div>
                                        <div><p className="text-neutral-450 font-normal">Bank Name</p><p className="font-bold text-neutral-900">{selectedSellerForDirectPayout.bank_details.bank_name}</p></div>
                                        <div><p className="text-neutral-450 font-normal">Account Number</p><p className="font-mono font-bold text-neutral-950">{selectedSellerForDirectPayout.bank_details.account_number}</p></div>
                                        <div><p className="text-neutral-450 font-normal">IFSC Bank Code</p><p className="font-mono font-bold text-neutral-950">{selectedSellerForDirectPayout.bank_details.ifsc_code}</p></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 text-red-700 text-center border border-red-150 p-3 rounded-[10px] font-bold">
                                    Caution: No bank coordinates mapped to this profile. Direct payout might fail or require external manual routing.
                                </div>
                            )}

                            <div className="border-t border-neutral-950/10 pt-4 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">Payout Amount (Max: ₹{selectedSellerForDirectPayout.wallet_balance.toLocaleString('en-IN')})</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={directPayoutAmount}
                                        onChange={(e) => setDirectPayoutAmount(e.target.value)}
                                        max={selectedSellerForDirectPayout.wallet_balance}
                                        min={100}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-neutral-950/10 bg-white rounded-[10px] text-xs focus:ring-1 focus:ring-black focus:outline-none placeholder-neutral-450 font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 mb-1">Enter Bank UTR Transaction Reference ID</label>
                                    <input
                                        type="text"
                                        value={payoutTxId}
                                        onChange={(e) => setPayoutTxId(e.target.value)}
                                        placeholder="e.g. UTR202606200921"
                                        className="w-full px-3 py-2 border border-neutral-950/10 bg-white rounded-[10px] text-xs focus:ring-1 focus:ring-black focus:outline-none placeholder-neutral-450 font-mono font-semibold"
                                    />
                                </div>
                                <button
                                    onClick={handleDirectPayoutSubmit}
                                    disabled={!payoutTxId.trim() || !directPayoutAmount || parseFloat(directPayoutAmount) < 100 || parseFloat(directPayoutAmount) > selectedSellerForDirectPayout.wallet_balance}
                                    className="w-full py-2.5 bg-black text-white rounded-[10px] font-bold hover:bg-neutral-900 transition-all active:scale-95 disabled:bg-neutral-100 disabled:text-neutral-400"
                                >
                                    Settle & Process Transfer Immediately
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
