'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Download, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Calendar, Info } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FinanceSummary {
    summary: {
        total_sales: number;
        platform_commission: number;
        gateway_fee: number;
        net_earnings: number;
        order_count: number;
    };
    wallet: {
        total_earnings: number;
        pending_amount: number;
        available_balance: number;
        paid_amount: number;
        on_hold_amount: number;
    };
    payouts: {
        pending: number;
        approved: number;
    };
    commission_rate: {
        platform: number;
        gateway: number;
        total: number;
    };
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    description: string;
    balance_after: number;
    created_at: string;
}

export default function SellerFinancePage() {
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30_days');
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');

    useEffect(() => {
        fetchFinanceData();
    }, [range]);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const [summaryRes, transactionsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/seller/finance/summary?range=${range}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/seller/finance/transactions?per_page=10`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setSummary(summaryRes.data);
            setTransactions(transactionsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/seller/finance/request-payout`, {
                amount: parseFloat(payoutAmount),
                bank_details: {
                    account_holder_name: 'Seller Name',
                    account_number: '1234567890',
                    ifsc_code: 'SBIN0001234',
                    bank_name: 'State Bank of India'
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Payout request submitted successfully!');
            setShowPayoutModal(false);
            setPayoutAmount('');
            fetchFinanceData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to request payout');
        }
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/seller/finance/export?type=transactions&range=${range}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `finance-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    };

    if (loading || !summary) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cureza-green mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading finance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Intelligence</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">Net Retention Policy:</span>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black border border-gray-200">{summary.commission_rate.platform}% Platform Fee</span>
                            <span className="text-gray-300 font-black">+</span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black border border-gray-200">{summary.commission_rate.gateway}% Gateway Charge</span>
                            <span className="text-gray-300 font-black">=</span>
                            <span className="px-4 py-1.5 bg-gray-900 text-white rounded-xl text-[10px] font-black shadow-lg shadow-gray-200">{summary.commission_rate.total}% Total Overhead</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            className="w-full lg:w-auto pl-12 pr-10 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-[10px] font-black text-gray-700 shadow-sm hover:shadow-md focus:ring-8 focus:ring-green-500/5 transition-all appearance-none cursor-pointer uppercase tracking-widest"
                        >
                            <option value="today">Cycle: Active Session</option>
                            <option value="7_days">Cycle: 168h Window</option>
                            <option value="30_days">Cycle: Monthly Audit</option>
                            <option value="this_month">Cycle: Current Quarter</option>
                            <option value="last_month">Cycle: Historical Log</option>
                            <option value="all_time">Cycle: Lifetime Aggregate</option>
                        </select>
                        <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all border border-gray-800 active:scale-95"
                    >
                        <Download size={16} className="text-cureza-green" /> Data Export Portfolio
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="premium-card p-10 group bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-emerald-50 text-cureza-green rounded-2xl group-hover:bg-cureza-green group-hover:text-white transition-all duration-500 shadow-inner">
                                <DollarSign size={28} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">Liquid Now</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 opacity-60">Settlement Ready</p>
                        <h3 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter">
                            ₹{summary.wallet.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        <button
                            onClick={() => setShowPayoutModal(true)}
                            disabled={summary.wallet.available_balance < 100}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 active:scale-95 transition-all disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none disabled:translate-y-0"
                        >
                            Authorize Transfer
                        </button>
                    </div>
                </div>

                <div className="premium-card p-10 group overflow-hidden bg-white">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-8 w-fit group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <TrendingUp size={28} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 opacity-60">Total Value Locked</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                        ₹{summary.wallet.total_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="flex items-center gap-3 mt-6 border-t border-gray-50 pt-6">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic tracking-tight">Immutable Record Strength</p>
                    </div>
                </div>

                <div className="premium-card p-10 group overflow-hidden bg-white">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl mb-8 w-fit group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <CreditCard size={28} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 opacity-60">Successfully Injected</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                        ₹{summary.wallet.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="flex items-center gap-3 mt-6 border-t border-gray-50 pt-6">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest italic tracking-tight">Bank Verification Complete</p>
                    </div>
                </div>

                <div className="premium-card p-10 group overflow-hidden bg-white">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl mb-8 w-fit group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <Calendar size={28} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 opacity-60">In-Flight Pipeline</p>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                        ₹{summary.payouts.pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="flex items-center gap-3 mt-6 border-t border-gray-50 pt-6">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></div>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic tracking-tight">Awaiting Protocol Approval</p>
                    </div>
                </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="premium-card p-12 bg-white border-b-8 border-b-gray-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h3 className="font-black text-2xl text-gray-900 tracking-tighter">Segmented Analytics Portfolio</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">Current Audit Focus: {range.replace('_', ' ')} Window</p>
                    </div>
                    <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-inner group cursor-help">
                        <Info size={16} className="text-cureza-green group-hover:animate-spin" />
                        Live Revenue Architecture Logic
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col justify-between h-48">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 opacity-60">Market Aggregate</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">
                                ₹{summary.summary.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white text-gray-400 text-[9px] font-black rounded-xl shadow-sm border border-gray-100 group-hover:border-cureza-green group-hover:text-cureza-green transition-all">{summary.summary.order_count} NODES</span>
                        </div>
                    </div>
                    <div className="p-8 bg-rose-50/20 rounded-[2.5rem] border border-rose-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 h-48 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-2">Platform Charge ({summary.commission_rate.platform}%)</p>
                            <p className="text-3xl font-black text-rose-600 tracking-tighter">
                                -₹{summary.summary.platform_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-12 h-1.5 bg-rose-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                    </div>
                    <div className="p-8 bg-rose-50/20 rounded-[2.5rem] border border-rose-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 h-48 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-2">Gateway Protocol ({summary.commission_rate.gateway}%)</p>
                            <p className="text-3xl font-black text-rose-600 tracking-tighter">
                                -₹{summary.summary.gateway_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-12 h-1.5 bg-rose-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                    </div>
                    <div className="p-8 bg-emerald-50 text-emerald-900 rounded-[2.5rem] border border-emerald-100 group hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-700 h-48 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-3xl rounded-full -mr-12 -mt-12"></div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Net Disbursable</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter">
                                ₹{summary.summary.net_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic bg-white/50 w-fit px-3 py-1 rounded-xl shadow-sm border border-emerald-100">Calculated Yield Aggregate</p>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="premium-card overflow-hidden bg-white">
                <div className="p-10 border-b border-gray-50 flex items-center gap-6">
                    <div className="p-4 bg-gray-900 text-white rounded-[1.5rem] shadow-2xl shadow-gray-200 rotate-3 group-hover:rotate-0 transition-transform">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-2xl text-gray-900 tracking-tighter">Operational Ledger Registry</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5 opacity-60">Transactional Synchronicity Tracking</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="premium-table-header">
                                <th className="px-10 py-6">Audit Timestamp</th>
                                <th className="px-10 py-6">Logic Classification</th>
                                <th className="px-10 py-6">Network Descriptor</th>
                                <th className="px-10 py-6">Interactive Delta</th>
                                <th className="px-10 py-6">Workspace Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <CreditCard size={64} className="mb-6" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Ledger Sequence Void</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((txn) => (
                                    <tr key={txn.id} className="group hover:bg-gray-50/30 transition-all">
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-gray-900 tracking-tight">{new Date(txn.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest opacity-60">{new Date(txn.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${txn.type === 'earning' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                txn.type === 'payout' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                {txn.type}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-xs font-bold text-gray-500 leading-relaxed group-hover:text-gray-900 transition-colors">{txn.description}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={`text-base font-black flex items-center gap-2 ${txn.type === 'earning' ? 'text-cureza-green' : 'text-rose-600'}`}>
                                                {txn.type === 'earning' ? <ArrowUpRight size={18} className="rotate-0 group-hover:rotate-45 transition-transform" /> : <ArrowDownRight size={18} className="rotate-0 group-hover:rotate-45 transition-transform" />}
                                                <span className="tracking-tighter">₹{Math.abs(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-base font-black text-gray-900 group-hover:bg-gray-900 group-hover:text-white px-3 py-1 rounded-lg transition-all tracking-tighter">₹{txn.balance_after.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[4rem] p-16 max-w-2xl w-full shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] border border-white/20 animate-in zoom-in-95 duration-700 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cureza-green via-emerald-400 to-cureza-green"></div>
                        <div className="flex flex-col items-center text-center mb-12">
                            <div className="p-8 bg-emerald-50 text-cureza-green rounded-[3rem] shadow-2xl shadow-emerald-100 mb-8 border border-white group">
                                <DollarSign size={56} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">Capital Disbursement</h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed italic">Synchronizing liquid assets with your <br /> verified merchant repository.</p>
                        </div>

                        <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 mb-12 flex justify-between items-center shadow-inner">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Liquid Capacity</p>
                                <p className="text-4xl font-black text-gray-900 tracking-tighter">
                                    ₹{summary.wallet.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                <CreditCard className="text-gray-300" size={24} />
                            </div>
                        </div>

                        <div className="space-y-6 mb-12">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">Extraction Quantity (Threshold: ₹100.00)</label>
                            <div className="relative group">
                                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 group-focus-within:text-cureza-green transition-colors">₹</span>
                                <input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    max={summary.wallet.available_balance}
                                    min={100}
                                    step={0.01}
                                    className="w-full h-24 px-16 rounded-[2.5rem] bg-gray-50 border-2 border-transparent focus:border-cureza-green focus:bg-white text-3xl font-black focus:ring-[20px] focus:ring-green-500/5 transition-all outline-none text-center tracking-tighter shadow-inner"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <button
                                onClick={() => setShowPayoutModal(false)}
                                className="flex-1 py-6 bg-gray-50 text-gray-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-[0.98] border border-transparent hover:border-gray-200"
                            >
                                Rollback Process
                            </button>
                            <button
                                onClick={handleRequestPayout}
                                disabled={!payoutAmount || parseFloat(payoutAmount) < 100 || parseFloat(payoutAmount) > summary.wallet.available_balance}
                                className="flex-1 py-6 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black hover:shadow-gray-400/20 hover:-translate-y-1 transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none disabled:translate-y-0 active:scale-[0.98]"
                            >
                                Confirm Injection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
