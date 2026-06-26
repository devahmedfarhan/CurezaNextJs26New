'use client';

import { useEffect, useState } from 'react';
import { 
    DollarSign, Download, TrendingUp, CreditCard, ArrowUpRight, 
    ArrowDownRight, Calendar, Info, Landmark, Clock, Calculator, 
    BarChart3, AlertCircle, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import axios from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SellerGstDashboard from '../components/SellerGstDashboard';

interface FinanceSummary {
    summary: {
        total_sales: number;
        platform_commission: number;
        gateway_fee: number;
        net_earnings: number;
        order_count: number;
        shipping_charge?: number;
        platform_commission_gst?: number;
        tcs_deduction?: number;
        tds_deduction?: number;
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
        tcs?: number;
        tds?: number;
    };
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    description: string;
    balance_before: number;
    balance_after: number;
    order_id: number | null;
    payout_id: number | null;
    reconciliation_status?: string | null;
    tcs_deduction?: number;
    tds_deduction?: number;
    metadata: Record<string, any> | null;
    created_at: string;
    order?: {
        id: number;
        order_number: string;
        total_amount: number;
        status: string;
    } | null;
    payout?: {
        id: number;
        status: string;
    } | null;
}

interface PayoutRequest {
    id: number;
    amount: number;
    requested_amount: number;
    approved_amount: number | null;
    status: 'pending' | 'approved' | 'rejected';
    bank_details: {
        account_holder_name: string;
        account_number: string;
        ifsc_code: string;
        bank_name: string;
    };
    notes: string | null;
    requested_at: string;
    processed_at: string | null;
    transaction_id?: string | null;
}

const isDateInRange = (dateStr: string, selectedRange: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    switch (selectedRange) {
        case 'today':
            return date.toDateString() === now.toDateString();
        case '7_days':
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            return date >= sevenDaysAgo;
        case '30_days':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return date >= thirtyDaysAgo;
        case 'this_month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case 'last_month':
            const lastMonth = new Date();
            lastMonth.setMonth(now.getMonth() - 1);
            return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
        case 'all_time':
        default:
            return true;
    }
};

export default function SellerFinancePage() {
    const { showToast } = useToast();
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [lifetimeSummary, setLifetimeSummary] = useState<FinanceSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30_days');
    const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'ledger' | 'gst'>('overview');
    
    // Payout request states
    const [payoutAmount, setPayoutAmount] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
    
    // Profit simulator state
    const [simulatorPrice, setSimulatorPrice] = useState('1000');
    const [simulatorGstSlab, setSimulatorGstSlab] = useState('18');
    const [simulatorPaymentMode, setSimulatorPaymentMode] = useState<'prepaid' | 'cod'>('prepaid');

    useEffect(() => {
        fetchFinanceData();
    }, [range]);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);
            const [summaryRes, lifetimeSummaryRes, transactionsRes, payoutsRes, settingsRes] = await Promise.all([
                axios.get(`/seller/finance/summary?range=${range}`),
                axios.get('/seller/finance/summary?range=all_time'),
                axios.get('/seller/finance/transactions?per_page=100'),
                axios.get('/seller/finance/payouts?per_page=50'),
                axios.get('/seller/settings').catch(err => {
                    console.error('Failed to load settings:', err);
                    return { data: { profile: null } };
                })
            ]);

            setSummary(summaryRes.data);
            setLifetimeSummary(lifetimeSummaryRes.data);
            setTransactions(transactionsRes.data.data || []);
            setPayoutRequests(payoutsRes.data.data || []);
            
            // Auto-fill payout amount with available balance
            if (summaryRes.data) {
                const summaryData = summaryRes.data;
                const netDisbursableYieldOnLoad = summaryData.wallet.available_balance;
                setPayoutAmount(netDisbursableYieldOnLoad > 0 ? netDisbursableYieldOnLoad.toFixed(2) : '');
            }
            
            const profile = settingsRes.data?.profile || {};
            if (profile) {
                setAccountHolder(profile.account_holder_name || '');
                setAccountNumber(profile.bank_account_number || '');
                setIfscCode(profile.ifsc_code || '');
                setBankName(profile.bank_name || '');
            }
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
            showToast('Failed to retrieve financial metrics', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const amount = parseFloat(payoutAmount);
        if (!amount || amount < 100) {
            showToast('Minimum payout threshold is ₹100.00', 'error');
            return;
        }

        if (amount > netDisbursableYield) {
            showToast(`Disbursement amount exceeds net disbursable yield (Max: ₹${netDisbursableYield.toFixed(2)})`, 'error');
            return;
        }

        if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
            showToast('Please check all target bank parameters', 'error');
            return;
        }

        setIsSubmittingPayout(true);
        try {
            await axios.post('/seller/finance/request-payout', {
                amount,
                bank_details: {
                    account_holder_name: accountHolder,
                    account_number: accountNumber,
                    ifsc_code: ifscCode,
                    bank_name: bankName
                }
            });

            showToast('Disbursement request submitted successfully!', 'success');
            setPayoutAmount('');
            
            // Refresh data in background
            fetchFinanceData();
        } catch (error: any) {
            showToast(error.response?.data?.message || error.response?.data?.error || 'Failed to dispatch payout request', 'error');
        } finally {
            setIsSubmittingPayout(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`/seller/finance/export?type=transactions&range=${range}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `finance-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Report generated and downloaded successfully', 'success');
        } catch (error) {
            console.error('Failed to export data:', error);
            showToast('Data export failed', 'error');
        }
    };

    // Process transactions to format dynamic data points for Recharts
    const prepareChartData = () => {
        const earnings = transactions.filter(t => t.type === 'earning');
        
        // Group amounts by calendar date
        const grouped: { [key: string]: number } = {};
        earnings.forEach(t => {
            const dateStr = new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            grouped[dateStr] = (grouped[dateStr] || 0) + Number(t.amount);
        });

        const chartData = Object.keys(grouped).map(date => ({
            date,
            earnings: parseFloat(grouped[date].toFixed(2))
        })).reverse();

        if (chartData.length === 0) {
            return [{ date: 'No Data', earnings: 0 }];
        }

        return chartData;
    };

    if (loading || !summary || !lifetimeSummary) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cureza-green mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Loading ledger registries...</p>
                </div>
            </div>
        );
    }

    const price = parseFloat(simulatorPrice) || 0;
    const gstRate = parseFloat(simulatorGstSlab) || 0;
    const platformRate = summary?.commission_rate?.platform ?? 25;
    const gatewayRate = summary?.commission_rate?.gateway ?? 2.5;
    const profileTcsRate = summary?.commission_rate?.tcs ?? 1.00;
    const profileTdsRate = summary?.commission_rate?.tds ?? 1.00;

    const taxableValue = price / (1 + (gstRate / 100));
    const platformFee = price * (platformRate / 100);
    const gstOnPlatform = platformFee * 0.18; // Service GST remains standard 18%
    const tcs = taxableValue * (profileTcsRate / 100);
    const tds = price * (profileTdsRate / 100);
    const gatewayFee = simulatorPaymentMode === 'prepaid' ? (price * (gatewayRate / 100)) : 0;
    const netEarnings = price - platformFee - gstOnPlatform - tcs - tds - gatewayFee;
    
    // Available balance tax calculations (less any pending payouts)
    let netDisbursableYield = 0;
    let estimatedTaxesOnBalance = 0;
    let taxRatio = 0;
    if (summary) {
        // Net Withdrawable balance equals available balance minus pending payout requests
        netDisbursableYield = Math.max(0, summary.wallet.available_balance - summary.payouts.pending);
        estimatedTaxesOnBalance = 0;
    }

    const tabs = [
        { id: 'overview', label: 'Financial Overview', icon: BarChart3 },
        { id: 'withdraw', label: 'Withdrawals & Payouts', icon: Landmark },
        { id: 'ledger', label: 'Operational Ledger', icon: CreditCard },
        { id: 'gst', label: 'GST Compliance (GSTR)', icon: Calculator },
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Financial Intelligence</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                        <span className="text-xs font-semibold text-gray-500 capitalize italic">Net Retention Policy:</span>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-2.5 py-1 bg-gray-50 text-black rounded-lg text-xs font-semibold border border-gray-200">{Number(summary.commission_rate.platform).toFixed(2)}% Platform Fee</span>
                            <span className="text-black font-semibold">+</span>
                            <span className="px-2.5 py-1 bg-gray-50 text-black rounded-lg text-xs font-semibold border border-gray-200">{Number(summary.commission_rate.gateway).toFixed(2)}% Gateway Charge</span>
                            <span className="text-black font-semibold">=</span>
                            <span className="px-3 py-1 bg-emerald-50 text-black rounded-lg text-xs font-semibold border border-emerald-200 shadow-sm">{Number(summary.commission_rate.total).toFixed(2)}% Total Overhead</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            className="w-full lg:w-auto pl-12 pr-10 py-2.5 bg-white border border-gray-150 rounded-xl text-xs font-semibold text-gray-700 shadow-sm hover:shadow-md focus:ring-4 focus:ring-green-500/5 transition-all appearance-none cursor-pointer capitalize"
                        >
                            <option value="today">Cycle: Active Session</option>
                            <option value="7_days">Cycle: 168h Window</option>
                            <option value="30_days">Cycle: Monthly Audit</option>
                            <option value="this_month">Cycle: Current Quarter</option>
                            <option value="last_month">Cycle: Historical Log</option>
                            <option value="all_time">Cycle: Lifetime Aggregate</option>
                        </select>
                        <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-450" />
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-3 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold capitalize shadow-md hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
                    >
                        <Download size={16} className="text-white" /> Data Export Portfolio
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-100">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer shrink-0"
                            style={{
                                backgroundColor: isActive ? '#059669' : '#ffffff',
                                color: isActive ? '#ffffff' : '#4b5563',
                                borderColor: isActive ? '#059669' : '#e5e7eb'
                            }}
                        >
                            <Icon size={14} className={isActive ? 'text-white' : 'text-gray-400'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Render Tab Content */}
            <div className="min-w-0 w-full animate-in fade-in duration-300">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="premium-card p-6 group bg-white relative overflow-hidden flex flex-col justify-between h-auto min-h-[360px] md:h-[370px] rounded-xl border border-gray-100 shadow-sm">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-2.5 bg-emerald-50 text-cureza-green rounded-xl group-hover:bg-cureza-green group-hover:text-white transition-all duration-500 shadow-inner">
                                                <DollarSign size={20} />
                                            </div>
                                            <span className="text-[10px] font-semibold capitalize text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">Liquid Now</span>
                                        </div>
                                        <p className="text-[11px] font-semibold text-gray-500 capitalize mb-1">Withdrawable Balance (Net)</p>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                                            ₹{netDisbursableYield.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium normal-case mb-4">Total Wallet Balance: ₹{summary.wallet.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                    
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[10.5px] font-medium text-gray-550 leading-relaxed mb-4">
                                        <p className="font-semibold capitalize text-[10px] text-gray-400 mb-1.5">Detailed Breakdown</p>
                                        <div className="space-y-1 text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Total Balance (Gross):</span>
                                                <span className="font-semibold text-gray-800">₹{summary.wallet.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-rose-500">
                                                <span>Compliance Taxes (GST/TCS/TDS):</span>
                                                <span className="font-semibold">-₹{estimatedTaxesOnBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="pt-1.5 mt-1 border-t border-gray-200 flex justify-between font-bold text-emerald-600 text-[11px]">
                                                <span>Final Payout (Withdrawable):</span>
                                                <span>₹{netDisbursableYield.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveTab('withdraw')}
                                        disabled={netDisbursableYield < 100}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold capitalize shadow-md hover:-translate-y-0.5 active:scale-95 transition-all disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none disabled:translate-y-0 cursor-pointer"
                                    >
                                        Authorize Transfer
                                    </button>
                                </div>
                            </div>

                            <div className="premium-card p-6 group overflow-hidden bg-white flex flex-col justify-between h-auto min-h-[360px] md:h-[370px] rounded-xl border border-gray-100 shadow-sm">
                                <div className="relative flex-1 flex flex-col justify-between">
                                    {(() => {
                                        const tvlRaw = Math.max(0, summary.wallet.total_earnings - summary.wallet.paid_amount);
                                        const tvlNet = Math.max(0, tvlRaw - (tvlRaw * taxRatio));
                                        
                                        // Calculate breakdown of pending escrow amount
                                        const pendingTransactions = transactions.filter(t => t.type === 'earning' && t.metadata?.escrow_status === 'held');
                                        const pendingCODUnreconciled = pendingTransactions
                                            .filter(t => t.reconciliation_status === 'pending')
                                            .reduce((sum, t) => sum + Number(t.amount), 0);
                                        const pendingReadyToPayout = Math.max(0, summary.wallet.pending_amount - pendingCODUnreconciled);
                                        
                                        return (
                                            <>
                                                <div>
                                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mb-6 w-fit group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                        <TrendingUp size={20} />
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-gray-500 capitalize mb-1">Total Value Locked</p>
                                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                                                        ₹{tvlNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-medium normal-case mb-4">Raw Value: ₹{tvlRaw.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>

                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[10.5px] font-medium text-gray-550 leading-relaxed mb-4">
                                                    <p className="font-semibold capitalize text-[10px] text-gray-400 mb-1.5">Escrow & Reconciliation Breakdown</p>
                                                    <div className="space-y-1.5 text-gray-600">
                                                        <div className="flex justify-between items-center">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                Ready to Payout (Held in Escrow):
                                                            </span>
                                                            <span className="font-bold text-emerald-600">₹{pendingReadyToPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                                Pending Courier Recon (COD):
                                                            </span>
                                                            <span className="font-bold text-amber-600">₹{pendingCODUnreconciled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div className="pt-1.5 mt-1 border-t border-gray-200 flex justify-between font-semibold text-gray-450 text-[10px]">
                                                            <span>Total Escrow Balance:</span>
                                                            <span>₹{summary.wallet.pending_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <p className="text-[10px] font-semibold text-blue-500 capitalize tracking-tight">Immutable Record Strength</p>
                                    </div>
                                </div>
                            </div>

                            <div className="premium-card p-6 group overflow-hidden bg-white flex flex-col justify-between h-auto min-h-[360px] md:h-[370px] rounded-xl border border-gray-100 shadow-sm">
                                <div className="relative flex-1 flex flex-col justify-between">
                                    {(() => {
                                        const paidRaw = summary.wallet.paid_amount;
                                        const paidNet = Math.max(0, paidRaw - (paidRaw * taxRatio));
                                        return (
                                            <>
                                                <div>
                                                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl mb-6 w-fit group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                        <CreditCard size={20} />
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-gray-500 capitalize mb-1">Successful Payouts</p>
                                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                                                        ₹{paidNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-medium normal-case mb-4">Raw Paid: ₹{paidRaw.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>

                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-105 text-[11px] font-medium text-gray-550 leading-relaxed mb-4">
                                                    <p className="font-semibold capitalize text-[10px] text-gray-400 mb-1">Card Logic & Source</p>
                                                    <p className="mb-2 text-[10.5px]">Earnings successfully processed, approved, and transferred to your bank account after tax withholding.</p>
                                                    <div className="pt-1.5 border-t border-gray-200/50 flex justify-between text-[10px] font-semibold capitalize text-gray-400">
                                                        <span>Formula</span>
                                                        <span>Raw Paid - Taxes</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <p className="text-[10px] font-semibold text-purple-500 capitalize tracking-tight">Bank Verification Complete</p>
                                    </div>
                                </div>
                            </div>

                            <div className="premium-card p-6 group overflow-hidden bg-white flex flex-col justify-between h-auto min-h-[360px] md:h-[370px] rounded-xl border border-gray-100 shadow-sm">
                                <div className="relative flex-1 flex flex-col justify-between">
                                    {(() => {
                                        const pendingRaw = summary.payouts.pending;
                                        const pendingNet = Math.max(0, pendingRaw - (pendingRaw * taxRatio));
                                        return (
                                            <>
                                                <div>
                                                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl mb-6 w-fit group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                        <Clock size={20} />
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-gray-500 capitalize mb-1">In-Flight Pipeline</p>
                                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 tracking-tight">
                                                        ₹{pendingNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-medium normal-case mb-4">Raw Pending: ₹{pendingRaw.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>

                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] font-medium text-gray-550 leading-relaxed mb-4">
                                                    <p className="font-semibold capitalize text-[10px] text-gray-400 mb-1">Card Logic & Source</p>
                                                    <p className="mb-2 text-[10.5px]">Withdrawals requested and awaiting administrator audit, showing the net yield after tax withholding.</p>
                                                    <div className="pt-1.5 border-t border-gray-200/50 flex justify-between text-[10px] font-semibold capitalize text-gray-400">
                                                        <span>Formula</span>
                                                        <span>Raw Pending - Taxes</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></div>
                                        <p className="text-[10px] font-semibold text-amber-500 capitalize tracking-tight">Awaiting Protocol Approval</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Wallet Arithmetic Ledger */}
                        <div className="bg-white p-6 rounded-xl border border-gray-150 space-y-4 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-800 tracking-tight border-b border-gray-100 pb-2 flex items-center gap-2">
                                <Calculator size={16} className="text-emerald-600" /> Live Wallet Arithmetic Ledger
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Side: Withdrawable Balance & Total Value Locked */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-700">1. Withdrawable Balance (Net)</span>
                                            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">Formula: Available Balance - Pending Payouts</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Total Available Balance (Gross Available):</span>
                                                <span className="font-mono text-gray-800 font-semibold">₹{summary.wallet.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Pending Payout Requests (Liabilities):</span>
                                                <span className="font-mono text-gray-800 font-semibold">- ₹{summary.payouts.pending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold mt-1.5 text-emerald-600">
                                                <span>Net Disbursable Yield:</span>
                                                <span className="font-mono">₹{netDisbursableYield.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {(() => {
                                        const tvlRaw = Math.max(0, summary.wallet.total_earnings - summary.wallet.paid_amount);
                                        const tvlNet = tvlRaw;
                                        
                                        const pendingTransactions = transactions.filter(t => t.type === 'earning' && t.metadata?.escrow_status === 'held');
                                        const pendingCODUnreconciled = pendingTransactions
                                            .filter(t => t.reconciliation_status === 'pending')
                                            .reduce((sum, t) => sum + Number(t.amount), 0);
                                        const pendingReadyToPayout = Math.max(0, summary.wallet.pending_amount - pendingCODUnreconciled);
                                        
                                        return (
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-gray-700">2. Total Value Locked (TVL)</span>
                                                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">Formula: Total Earnings - Paid Payouts</span>
                                                </div>
                                                <div className="space-y-1.5 text-xs text-gray-600">
                                                    <div className="flex justify-between">
                                                        <span>Ready to Payout (Held in Escrow):</span>
                                                        <span className="font-mono text-gray-800 font-semibold">₹{pendingReadyToPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Pending Courier Recon (COD):</span>
                                                        <span className="font-mono text-gray-800 font-semibold">+ ₹{pendingCODUnreconciled.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold mt-1.5 text-blue-650">
                                                        <span>Net Value Locked:</span>
                                                        <span className="font-mono">₹{tvlNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Right Side: Successful Payouts & In-Flight Pipeline */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-700">3. Successful Payouts (Realized Earnings)</span>
                                            <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">Formula: Approved Settlements</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Total Settled Payouts:</span>
                                                <span className="font-mono text-gray-800 font-semibold">₹{summary.wallet.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold mt-1.5 text-purple-650">
                                                <span>Net Realized Earnings:</span>
                                                <span className="font-mono">₹{summary.wallet.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-700">4. In-Flight Pipeline (Awaiting Approval)</span>
                                            <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">Formula: Requested - Processed</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Requested and Pending Settlements:</span>
                                                <span className="font-mono text-gray-800 font-semibold">₹{summary.payouts.pending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold mt-1.5 text-amber-600">
                                                <span>Net Pipeline Volume:</span>
                                                <span className="font-mono">₹{summary.payouts.pending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart and Simulator Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recharts Chart Area */}
                            <div className="premium-card p-6 bg-white lg:col-span-2 space-y-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-800 tracking-tight">Earnings Timeline Trend</h3>
                                        <p className="text-xs font-semibold text-gray-500 capitalize mt-1">Daily net earnings trajectory</p>
                                    </div>
                                    <span className="text-[10px] font-semibold text-emerald-600 capitalize bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">Live Feed</span>
                                </div>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={prepareChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                                            <Tooltip 
                                                contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', padding: '12px' }}
                                                labelStyle={{ color: '#9ca3af', fontSize: '10px', fontWeight: 600, textTransform: 'capitalize' }}
                                                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}
                                                formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Net Earnings']}
                                            />
                                            <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Profit Calculator Simulator */}
                            <div className="premium-card p-6 bg-white flex flex-col justify-between rounded-xl border border-gray-100 shadow-sm">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-100">
                                            <Calculator size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800 tracking-tight">Net Yield Simulator</h3>
                                            <p className="text-xs font-semibold text-gray-500 capitalize">Verify operational margins instantly</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Gross Listing Price (INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                value={simulatorPrice}
                                                onChange={(e) => setSimulatorPrice(e.target.value)}
                                                className="w-full h-11 pl-8 pr-4 rounded-xl bg-gray-50 border border-gray-150 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {['100', '500', '1000', '5000'].map(preset => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => setSimulatorPrice(preset)}
                                                    className="px-3 py-1 bg-gray-50 border border-gray-100 hover:border-gray-300 rounded-lg text-[10px] font-semibold text-gray-650 transition-all uppercase cursor-pointer"
                                                >
                                                    ₹{preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Product GST Slab Dropdown */}
                                    <div className="space-y-1.5 mb-6">
                                        <label className="block text-xs font-semibold text-gray-500 capitalize px-1">Product GST Slab</label>
                                        <select
                                            value={simulatorGstSlab}
                                            onChange={(e) => setSimulatorGstSlab(e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-150 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none cursor-pointer"
                                        >
                                            <option value="0">0% GST (Nil Rated)</option>
                                            <option value="5">5% GST</option>
                                            <option value="12">12% GST</option>
                                            <option value="18">18% GST (Standard)</option>
                                            <option value="28">28% GST</option>
                                        </select>
                                    </div>

                                    {/* Payment Method Toggle Selector */}
                                    <div className="space-y-1.5 mb-6">
                                        <label className="block text-xs font-semibold text-gray-550 capitalize px-1">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSimulatorPaymentMode('prepaid')}
                                                className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                                                    simulatorPaymentMode === 'prepaid'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'
                                                }`}
                                            >
                                                Online / Prepaid
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSimulatorPaymentMode('cod')}
                                                className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                                                    simulatorPaymentMode === 'cod'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'
                                                }`}
                                            >
                                                COD (Self Delivery)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                            <span>Gross List Price</span>
                                            <span>₹{price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                                            <span>Taxable Value (built-in {gstRate}% GST)</span>
                                            <span>₹{taxableValue.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-rose-500">
                                            <span>Platform Fee ({platformRate}%)</span>
                                            <span>-₹{platformFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-rose-450">
                                            <span>GST on Platform Fee (18%)</span>
                                            <span>-₹{gstOnPlatform.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                            <span>TCS Deduction ({profileTcsRate}%)</span>
                                            <span>-₹{tcs.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                            <span>TDS Deduction ({profileTdsRate}%)</span>
                                            <span>-₹{tds.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-rose-500">
                                            <span>Gateway Charge ({gatewayRate}%)</span>
                                            <span>{gatewayFee > 0 ? `-₹${gatewayFee.toFixed(2)}` : '₹0.00 (COD Bypass)'}</span>
                                        </div>
                                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-500 capitalize">
                                                Net Payout ({price > 0 ? ((netEarnings / price) * 100).toFixed(1) : '0.0'}%)
                                            </span>
                                            <span className="text-lg font-bold text-emerald-600">₹{netEarnings.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-start gap-2 text-xs font-medium text-gray-500 normal-case leading-relaxed">
                                    <Info size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Values calculated in real-time according to retention parameters.</span>
                                </div>
                            </div>
                        </div>

                        {/* Segments Metrics */}
                        {(() => {
                            // Section 1: Active/Running Calculation (FIFO method)
                            const allEarnings = transactions
                                .filter(t => t.type === 'earning')
                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // oldest first

                            let runningPaidPool = summary.wallet.paid_amount;
                            const platRate = Number(summary?.commission_rate?.platform ?? 25);
                            const gateRate = Number(summary?.commission_rate?.gateway ?? 2.5);

                            const earningsWithUnpaidPortion = allEarnings.map(t => {
                                const grossVal = t.metadata?.order_total 
                                    ? Number(t.metadata.order_total) 
                                    : (t.order?.total_amount ? Number(t.order.total_amount) : Math.abs(t.amount) / 0.685);
                                
                                const platformFeeVal = t.metadata?.platform_commission 
                                    ? Number(t.metadata.platform_commission) 
                                    : grossVal * (platRate / 100);
                                    
                                const gstVal = t.metadata?.platform_commission_gst 
                                    ? Number(t.metadata.platform_commission_gst) 
                                    : platformFeeVal * 0.18;
                                const tcsVal = t.tcs_deduction !== undefined && t.tcs_deduction !== null
                                    ? Number(t.tcs_deduction)
                                    : (t.metadata?.tcs_amount 
                                        ? Number(t.metadata.tcs_amount) 
                                        : grossVal * 0.01);
                                const tdsVal = t.tds_deduction !== undefined && t.tds_deduction !== null
                                    ? Number(t.tds_deduction)
                                    : (t.metadata?.tds_amount 
                                        ? Number(t.metadata.tds_amount) 
                                        : grossVal * 0.01);
                                
                                const shippingCharge = t.metadata?.shipping_charge ? Number(t.metadata.shipping_charge) : 0;
                                const isCOD = t.order ? (t.order as any).payment_method?.toLowerCase() === 'cod' : false;
                                const gatewayFeeVal = t.metadata?.gateway_fee 
                                    ? Number(t.metadata.gateway_fee) 
                                    : (isCOD ? 0 : grossVal * (gateRate / 100));
                                    
                                const netYieldVal = Number(t.amount);

                                let unpaidYield = netYieldVal;
                                if (runningPaidPool > 0) {
                                    if (runningPaidPool >= netYieldVal) {
                                        unpaidYield = 0;
                                        runningPaidPool -= netYieldVal;
                                    } else {
                                        unpaidYield = netYieldVal - runningPaidPool;
                                        runningPaidPool = 0;
                                    }
                                }

                                const unpaidRatio = netYieldVal > 0 ? (unpaidYield / netYieldVal) : 1;

                                return {
                                    created_at: t.created_at,
                                    gross: grossVal * unpaidRatio,
                                    platformFee: platformFeeVal * unpaidRatio,
                                    gst: gstVal * unpaidRatio,
                                    gatewayFee: gatewayFeeVal * unpaidRatio,
                                    tcs: tcsVal * unpaidRatio,
                                    tds: tdsVal * unpaidRatio,
                                    shippingCharge: shippingCharge * unpaidRatio,
                                    orderCount: unpaidRatio > 0 ? 1 : 0
                                };
                            });

                            const rangeEarnings = earningsWithUnpaidPortion.filter(t => isDateInRange(t.created_at, range));
                            const gross = rangeEarnings.reduce((sum, t) => sum + t.gross, 0);
                            const platformCommission = rangeEarnings.reduce((sum, t) => sum + t.platformFee, 0);
                            const gst = rangeEarnings.reduce((sum, t) => sum + t.gst, 0);
                            const gatewayFee = rangeEarnings.reduce((sum, t) => sum + t.gatewayFee, 0);
                            const tcs = rangeEarnings.reduce((sum, t) => sum + t.tcs, 0);
                            const tds = rangeEarnings.reduce((sum, t) => sum + t.tds, 0);
                            const shippingCharge = rangeEarnings.reduce((sum, t) => sum + (t.shippingCharge || 0), 0);
                            const actualHandYield = Math.max(0, gross - platformCommission - gst - gatewayFee - tcs - tds - shippingCharge);
                            const orderCount = rangeEarnings.reduce((sum, t) => sum + t.orderCount, 0);

                            // Section 2: Lifetime / All-Time Calculation
                            const lifetimeGross = lifetimeSummary.summary.total_sales;
                            const lifetimePlatformCommission = lifetimeSummary.summary.platform_commission;
                            const lifetimeGatewayFee = lifetimeSummary.summary.gateway_fee;
                            const lifetimeShippingCharge = lifetimeSummary.summary.shipping_charge ?? 0;

                            const lifetimeGst = lifetimeSummary.summary.platform_commission_gst ?? (lifetimePlatformCommission * 0.18);
                            const lifetimeTcs = lifetimeSummary.summary.tcs_deduction ?? (lifetimeGross * (profileTcsRate / 100));
                            const lifetimeTds = lifetimeSummary.summary.tds_deduction ?? (lifetimeGross * (profileTdsRate / 100));
                            const lifetimeActualHandYield = lifetimeSummary.summary.net_earnings;
                            const lifetimeOrderCount = lifetimeSummary.summary.order_count;

                            return (
                                <div className="space-y-8">
                                    {/* Active Segmented Portfolio */}
                                    <div className="premium-card p-6 bg-white border-b-8 border-b-emerald-600 rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-800 tracking-tight">Segmented Analytics Portfolio (Active & In-Escrow)</h3>
                                                <p className="text-gray-500 text-xs font-semibold capitalize mt-2 italic">Current Audit Focus: {range.replace('_', ' ')} Window (Excludes Successful Payouts)</p>
                                            </div>
                                            <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-semibold text-gray-500 capitalize shadow-inner group">
                                                <Info size={14} className="text-cureza-green" />
                                                Running Revenue & Active Hold Logic
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                                            {/* Card 1: Gross Sales */}
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col justify-between h-[260px]">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-550 capitalize mb-1">Total Sales (Gross)</p>
                                                    <p className="text-xl font-extrabold text-gray-800 tracking-tight mb-2">
                                                        ₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white rounded-xl border border-gray-100/50 text-[10px] font-medium text-gray-550 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-gray-400 mb-0.5">Details</p>
                                                    <p>Total gross customer sales volume before platform fee deductions.</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2 py-0.5 bg-white text-gray-500 text-[9px] font-bold rounded-lg shadow-sm border border-gray-100 group-hover:border-emerald-600 group-hover:text-emerald-600 transition-all">{orderCount} Nodes</span>
                                                </div>
                                            </div>

                                            {/* Card 2: Platform Charge */}
                                            <div className="p-4 bg-rose-50/20 rounded-xl border border-rose-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-rose-500 capitalize mb-1">Platform Commission ({summary.commission_rate.platform}%)</p>
                                                    <p className="text-xl font-extrabold text-rose-600 tracking-tight mb-2">
                                                        -₹{platformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-rose-100/50 text-[10px] font-medium text-rose-500 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-rose-450 mb-0.5">Details</p>
                                                    <p>Standard B2B platform commission of {Number(summary.commission_rate.platform).toFixed(2)}% applied on gross sales.</p>
                                                </div>
                                                <div className="w-12 h-1 bg-rose-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 3: GST on Commission */}
                                            <div className="p-4 bg-rose-50/25 rounded-xl border border-rose-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-rose-500 capitalize mb-1">GST on Commission (18%)</p>
                                                    <p className="text-xl font-extrabold text-rose-600 tracking-tight mb-2">
                                                        -₹{gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-rose-100/50 text-[10px] font-medium text-rose-500 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-rose-450 mb-0.5">Details</p>
                                                    <p>18% Goods and Services Tax (GST) applied on platform commission fee.</p>
                                                </div>
                                                <div className="w-12 h-1 bg-rose-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 4: Gateway Fee */}
                                            <div className="p-4 bg-rose-50/20 rounded-xl border border-rose-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-rose-500 capitalize mb-1">Gateway Fee ({summary.commission_rate.gateway}%)</p>
                                                    <p className="text-xl font-extrabold text-rose-600 tracking-tight mb-2">
                                                        -₹{gatewayFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-rose-100/50 text-[10px] font-medium text-rose-500 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-rose-450 mb-0.5">Details</p>
                                                    <p>Gateway fee for online transactions. 0% is charged for cash-on-delivery (COD).</p>
                                                </div>
                                                <div className="w-12 h-1 bg-rose-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 5: Shipping Charges */}
                                            <div className="p-4 bg-rose-50/20 rounded-xl border border-rose-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-rose-500 capitalize mb-1">Shipping & Delivery</p>
                                                    <p className="text-xl font-extrabold text-rose-600 tracking-tight mb-2">
                                                        -₹{shippingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-rose-100/50 text-[10px] font-medium text-rose-500 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-rose-450 mb-0.5">Details</p>
                                                    <p>Fulfillments fees and shipping charges deducted by courier partners.</p>
                                                </div>
                                                <div className="w-12 h-1 bg-rose-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 6: TCS & TDS */}
                                            <div className="p-4 bg-amber-50/20 rounded-xl border border-amber-100 group hover:bg-white hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-amber-600 capitalize mb-1">Statutory Taxes ({(profileTcsRate + profileTdsRate).toFixed(2)}%)</p>
                                                    <p className="text-xl font-extrabold text-amber-700 tracking-tight mb-2">
                                                        -₹{(tcs + tds).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100/50 text-[10px] font-medium text-amber-700 leading-normal mb-2 font-mono">
                                                    <p className="font-semibold capitalize text-[9px] text-amber-600 mb-0.5">TCS: ₹{tcs.toFixed(2)} ({profileTcsRate}%) | TDS: ₹{tds.toFixed(2)} ({profileTdsRate}%)</p>
                                                    <p>Tax Collection at Source ({profileTcsRate}% TCS) and Tax Deducted at Source ({profileTdsRate}% TDS) withheld at source.</p>
                                                </div>
                                                <div className="w-12 h-1 bg-amber-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 7: Net Payout */}
                                            <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 group hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-700 h-[260px] flex flex-col justify-between relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-3xl rounded-full -mr-12 -mt-12"></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-700 capitalize mb-1">Net Payout (Actual Yield)</p>
                                                    <p className="text-xl font-extrabold text-gray-800 tracking-tight mb-2">
                                                        ₹{actualHandYield.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-100/50 text-[10px] font-medium text-emerald-700 leading-normal mb-2 z-10">
                                                    <p className="font-semibold capitalize text-[9px] text-emerald-600 mb-0.5">Yield Formula</p>
                                                    <p>Net balance generated after all commissions, GST, gateway, shipping, and TCS/TDS deductions (excluding successful payouts).</p>
                                                </div>
                                                <p className="text-[9px] font-bold text-emerald-600 capitalize bg-white/50 w-fit px-2 py-0.5 rounded-lg shadow-sm border border-emerald-100 z-10">Running Net Yield</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* All-Time Cumulative Segmented Portfolio */}
                                    <div className="premium-card p-6 bg-white border-b-8 border-b-purple-600 rounded-xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-800 tracking-tight">Segmented Analytics Portfolio (All-Time Cumulative)</h3>
                                                <p className="text-gray-500 text-xs font-semibold capitalize mt-2 italic font-medium">Lifetime Performance & Historical Settlement Aggregate</p>
                                            </div>
                                            <div className="flex items-center gap-4 px-4 py-2 bg-purple-50 rounded-xl border border-purple-100 text-xs font-semibold text-purple-600 capitalize shadow-inner group">
                                                <Info size={14} className="text-purple-600" />
                                                All-Time Performance Ledger Log
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                                            {/* Card 1: Gross Sales */}
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col justify-between h-[260px]">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-550 capitalize mb-1">Total Sales (Gross)</p>
                                                    <p className="text-xl font-extrabold text-gray-800 tracking-tight mb-2">
                                                        ₹{lifetimeGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white rounded-xl border border-gray-100/50 text-[10px] font-medium text-gray-550 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-gray-400 mb-0.5">Details</p>
                                                    <p>Total lifetime gross sales volume before platform fee deductions.</p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="px-2 py-0.5 bg-white text-gray-500 text-[9px] font-bold rounded-lg shadow-sm border border-gray-100 group-hover:border-purple-600 group-hover:text-purple-600 transition-all">{lifetimeOrderCount} Nodes</span>
                                                </div>
                                            </div>

                                            {/* Card 2: Platform Charge */}
                                            <div className="p-4 bg-purple-50/20 rounded-xl border border-purple-100 group hover:bg-white hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-purple-600 capitalize mb-1">Platform Commission ({lifetimeSummary.commission_rate.platform}%)</p>
                                                    <p className="text-xl font-extrabold text-purple-600 tracking-tight mb-2">
                                                        -₹{lifetimePlatformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-purple-100/50 text-[10px] font-medium text-purple-600 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-purple-450 mb-0.5">Details</p>
                                                    <p>Total platform commission of {Number(lifetimeSummary.commission_rate.platform).toFixed(2)}% applied on lifetime gross sales.</p>
                                                </div>
                                                <div className="w-12 h-1 bg-purple-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 3: GST on Commission */}
                                            <div className="p-4 bg-purple-50/25 rounded-xl border border-purple-100 group hover:bg-white hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-purple-600 capitalize mb-1">GST on Commission (18%)</p>
                                                    <p className="text-xl font-extrabold text-purple-600 tracking-tight mb-2">
                                                        -₹{lifetimeGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-purple-100/50 text-[10px] font-medium text-purple-600 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-purple-450 mb-0.5">Details</p>
                                                    <p>18% Goods and Services Tax (GST) applied on platform commission fee.</p>
                                                </div>
                                                <div className="w-12 h-1 bg-purple-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 4: Gateway Fee */}
                                            <div className="p-4 bg-purple-50/20 rounded-xl border border-purple-100 group hover:bg-white hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-purple-600 capitalize mb-1">Gateway Fee ({lifetimeSummary.commission_rate.gateway}%)</p>
                                                    <p className="text-xl font-extrabold text-purple-600 tracking-tight mb-2">
                                                        -₹{lifetimeGatewayFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-purple-100/50 text-[10px] font-medium text-purple-600 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-purple-450 mb-0.5">Details</p>
                                                    <p>Gateway fee for online transactions. 0% is charged for cash-on-delivery (COD).</p>
                                                </div>
                                                <div className="w-12 h-1 bg-purple-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 5: Shipping Charges */}
                                            <div className="p-4 bg-purple-50/20 rounded-xl border border-purple-100 group hover:bg-white hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-purple-600 capitalize mb-1">Shipping & Delivery</p>
                                                    <p className="text-xl font-extrabold text-purple-600 tracking-tight mb-2">
                                                        -₹{lifetimeShippingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-purple-100/50 text-[10px] font-medium text-purple-600 leading-normal mb-2">
                                                    <p className="font-semibold capitalize text-[9px] text-purple-450 mb-0.5">Details</p>
                                                    <p>Total lifetime shipping fees and delivery charges deducted by courier partners.</p>
                                                </div>
                                                <div className="w-12 h-1 bg-purple-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 6: TCS & TDS */}
                                            <div className="p-4 bg-amber-50/20 rounded-xl border border-amber-100 group hover:bg-white hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-500 h-[260px] flex flex-col justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-amber-600 capitalize mb-1">Statutory Taxes ({(profileTcsRate + profileTdsRate).toFixed(2)}%)</p>
                                                    <p className="text-xl font-extrabold text-amber-700 tracking-tight mb-2">
                                                        -₹{(lifetimeTcs + lifetimeTds).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100/50 text-[10px] font-medium text-amber-700 leading-normal mb-2 font-mono">
                                                    <p className="font-semibold capitalize text-[9px] text-amber-600 mb-0.5">TCS: ₹{lifetimeTcs.toFixed(2)} ({profileTcsRate}%) | TDS: ₹{lifetimeTds.toFixed(2)} ({profileTdsRate}%)</p>
                                                    <p>Tax Collection at Source ({profileTcsRate}% TCS) and Tax Deducted at Source ({profileTdsRate}% TDS) withheld at source.</p>
                                                </div>
                                                <div className="w-12 h-1 bg-amber-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                            </div>

                                            {/* Card 7: Net Payout */}
                                            <div className="p-4 bg-purple-50 text-purple-900 rounded-xl border border-purple-100 group hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-700 h-[260px] flex flex-col justify-between relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-3xl rounded-full -mr-12 -mt-12"></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-purple-700 capitalize mb-1">Lifetime Net Yield</p>
                                                    <p className="text-xl font-extrabold text-gray-800 tracking-tight mb-2">
                                                        ₹{lifetimeActualHandYield.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="p-2.5 bg-purple-100/50 rounded-xl border border-purple-100/50 text-[10px] font-medium text-purple-700 leading-normal mb-2 z-10">
                                                    <p className="font-semibold capitalize text-[9px] text-purple-650 mb-0.5">Yield Formula</p>
                                                    <p>Lifetime Net balance generated after all commissions, GST, gateway, shipping, and TCS/TDS deductions.</p>
                                                </div>
                                                <p className="text-[9px] font-bold text-purple-650 capitalize bg-white/50 w-fit px-2 py-0.5 rounded-lg shadow-sm border border-purple-100 z-10">Lifetime Yield</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'withdraw' && (
                    <div className="space-y-8">
                        {/* Escrow Hold Warning Help Banner */}
                        <div className="p-4 bg-emerald-50/50 border border-emerald-250 rounded-2xl flex gap-4 items-start shadow-sm animate-in slide-in-from-top-4 duration-300">
                            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                                <HelpCircle size={20} className="text-emerald-700" />
                            </div>
                            <div className="space-y-1.5">
                                <h4 className="text-sm font-bold text-emerald-800">Understanding Wallet Escrow & Courier Reconciliation holds</h4>
                                <p className="text-xs text-emerald-700 font-medium leading-relaxed normal-case">
                                    All order earnings are held in escrow for a standard <span className="font-bold">7-day hold period</span> to handle potential customer returns or disputes. 
                                    Prepaid orders enter the escrow queue immediately upon fulfillment. 
                                    Cash on Delivery (COD) orders must first be reconciled with the courier provider (marked as <span className="font-bold">Ready to Payout</span>) before starting their escrow countdown. 
                                    Once the 7-day window expires, balances are automatically transferred to your withdrawable <span className="font-bold">Liquid Balance</span>.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Payout Request Form */}
                            <div className="premium-card p-6 bg-white lg:col-span-2 space-y-6 rounded-xl border border-gray-100 shadow-sm">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-800 tracking-tight">Authorize Capital Disbursement</h3>
                                    <p className="text-xs font-semibold text-gray-500 capitalize mt-1">Verify target bank parameters prior to submit</p>
                                </div>
                                
                                <form onSubmit={handleRequestPayout} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500 capitalize px-1">Account Holder Name</label>
                                            <input
                                                type="text"
                                                value={accountHolder}
                                                onChange={(e) => setAccountHolder(e.target.value)}
                                                required
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="Name as registered in bank records"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 capitalize px-1">Bank Name</label>
                                            <input
                                                type="text"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                required
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="e.g. State Bank of India"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 capitalize px-1">Account Number</label>
                                            <input
                                                type="text"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                required
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="Account Number"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 capitalize px-1">IFSC Code</label>
                                            <input
                                                type="text"
                                                value={ifscCode}
                                                onChange={(e) => setIfscCode(e.target.value)}
                                                required
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="SBIN0001234"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-500 capitalize px-1">Extraction Amount (Min: ₹100.00)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₹</span>
                                                <input
                                                    type="number"
                                                    value={payoutAmount}
                                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                                    max={netDisbursableYield}
                                                    min={100}
                                                    step={0.01}
                                                    required
                                                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {payoutAmount && parseFloat(payoutAmount) > netDisbursableYield && (
                                                <p className="text-xs font-semibold text-rose-500 normal-case px-1 mt-1.5 flex items-center gap-1.5 leading-tight">
                                                    <AlertCircle size={12} className="shrink-0" />
                                                    Your maximum disbursable amount is ₹{netDisbursableYield.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingPayout || !payoutAmount || parseFloat(payoutAmount) < 100 || parseFloat(payoutAmount) > netDisbursableYield}
                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold capitalize shadow-md transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none cursor-pointer"
                                    >
                                        {isSubmittingPayout ? 'Registering transfer...' : 'Confirm Withdrawal Request'}
                                    </button>
                                </form>
                            </div>

                            {/* Wallet Summary Panel */}
                            <div className="premium-card p-6 bg-white flex flex-col justify-between rounded-xl border border-gray-100 shadow-sm">
                                <div className="space-y-6">
                                    <h3 className="font-bold text-lg text-gray-800 tracking-tight">Settlement Ledger</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                            <span className="text-xs font-semibold text-gray-500 capitalize">Liquid Balance (Net)</span>
                                            <span className="text-lg font-bold text-gray-800">₹{summary.wallet.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {(() => {
                                            const netDisbursableYield = summary.wallet.available_balance;
                                            return (
                                                <>
                                                    <div className="flex justify-between items-center text-rose-500 pb-3 border-b border-gray-50">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold capitalize">Est. Taxes (GST + TCS + TDS)</span>
                                                            <span className="text-[9px] text-gray-400 font-semibold normal-case">Deducted immediately at source</span>
                                                        </div>
                                                        <span className="text-sm font-semibold">-₹0.00</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-emerald-600 pb-3 border-b border-gray-50 bg-emerald-50/20 px-3 py-2 rounded-xl">
                                                        <span className="text-xs font-semibold capitalize">Net Disbursable Yield</span>
                                                        <span className="text-md font-bold">₹{netDisbursableYield.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                            <span className="text-xs font-semibold text-gray-500 capitalize">Pending Payouts</span>
                                            <span className="text-sm font-semibold text-amber-600">₹{summary.payouts.pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-gray-500 capitalize">Historical Disbursed</span>
                                            <span className="text-sm font-semibold text-purple-650">₹{summary.wallet.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs font-semibold text-blue-700 capitalize leading-relaxed">
                                        <Info size={14} className="inline mr-2 -mt-0.5" />
                                        Default details are fetched from profile records. Permanent bank edits must be configured in Account Settings.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Withdrawal Request Ledger */}
                        <div className="premium-card overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="p-6 border-b border-gray-50 flex items-center gap-6">
                                <div className="p-2.5 bg-gray-950 text-white rounded-xl">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-800 tracking-tight">Disbursement Request Registry</h3>
                                    <p className="text-xs font-semibold text-gray-500 capitalize mt-1">Status tracking of pending and historical withdrawals</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="premium-table-header">
                                            <th className="px-6 py-4 capitalize font-semibold text-gray-600">Request Timestamp</th>
                                            <th className="px-6 py-4 capitalize font-semibold text-gray-600">Target Bank Details</th>
                                            <th className="px-6 py-4 capitalize font-semibold text-gray-600">Disbursement Capacity</th>
                                            <th className="px-6 py-4 capitalize font-semibold text-gray-600">Transaction Reference</th>
                                            <th className="px-6 py-4 capitalize font-semibold text-gray-600">Compliance Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {payoutRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-16 text-center">
                                                    <div className="flex flex-col items-center opacity-30">
                                                        <Clock size={48} className="mb-4" />
                                                        <p className="text-xs font-semibold capitalize text-gray-400">Withdrawal Registry Empty</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            payoutRequests.map((req) => (
                                                <tr key={req.id} className="group hover:bg-gray-50/30 transition-all">
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold text-gray-800 tracking-tight">
                                                                {new Date(req.requested_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            <span className="text-[9px] text-gray-400 font-semibold capitalize tracking-wide mt-0.5">
                                                                {new Date(req.requested_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="text-xs font-bold text-gray-700">
                                                            <p className="font-semibold">{req.bank_details?.bank_name} ({req.bank_details?.account_holder_name})</p>
                                                            <p className="text-[9px] text-gray-400 font-semibold tracking-wide mt-0.5">A/C: {req.bank_details?.account_number ? `******${req.bank_details.account_number.slice(-4)}` : 'N/A'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-sm font-bold text-gray-900">
                                                            ₹{Number(req.requested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-bold text-gray-500">{req.transaction_id || req.notes || '—'}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1 rounded-xl text-[8px] font-semibold capitalize tracking-wide border ${
                                                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ledger' && (
                    <div className="space-y-8">
                        {/* Transaction History Table */}
                        <div className="premium-card overflow-hidden bg-white">
                            <div className="p-8 border-b border-gray-50 flex items-center gap-6">
                                <div className="p-3 bg-gray-900 text-white rounded-2xl">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 tracking-tight">Operational Ledger Registry</h3>
                                    <p className="text-[9px] font-semibold text-gray-400 capitalize tracking-wide mt-1 opacity-60">Transactional Synchronicity Tracking</p>
                                </div>
                            </div>


                            
                            {/* Column Explanation Glossary */}
                            <div className="mx-8 mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                <p className="font-semibold capitalize text-[9px] tracking-wide text-gray-400 mb-3">Column Reference Guide</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-[9px] font-semibold text-gray-500 leading-normal">
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-gray-900">Txn ID</p>
                                        <p>Unique immutable identifier for each ledger entry in the system.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-gray-400">Audit Timestamp</p>
                                        <p>The exact date and time the financial transaction event occurred.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-blue-500">Logic Classification</p>
                                        <p>The type of transaction event (e.g., earning, payout, refund, or adjustment).</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-indigo-500">Flow Direction</p>
                                        <p>Whether money was added (Credit ↑) or subtracted (Debit ↓) from your wallet.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-violet-500">Order Reference</p>
                                        <p>The linked Order ID this transaction is associated with (if applicable).</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-[9px] font-semibold text-gray-500 leading-normal">
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-purple-500">Network Descriptor</p>
                                        <p>Human-readable description of the transaction event and its context.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-emerald-500">Interactive Delta</p>
                                        <p>The exact amount of money added (credit) or subtracted (debit) in this entry.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-orange-500">Balance Before</p>
                                        <p>Your wallet balance immediately before this transaction was applied.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-semibold capitalize text-[8px] tracking-wide text-gray-900">Balance After</p>
                                        <p>Your wallet's running net balance immediately following this transaction.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="premium-table-header">
                                            <th className="px-6 py-5 whitespace-nowrap">Txn ID</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Audit Timestamp</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Logic Classification</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Flow Direction</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Order Reference</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Reconciliation Status</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Network Descriptor</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Interactive Delta</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Balance Before</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Balance After</th>
                                            <th className="px-6 py-5 whitespace-nowrap">Revenue Flow Pipeline</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center opacity-20">
                                                        <CreditCard size={48} className="mb-4" />
                                                        <p className="text-[9px] font-semibold capitalize tracking-wide text-gray-400">Ledger sequence void</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.map((txn) => {
                                                const isCredit = ['earning', 'adjustment'].includes(txn.type);
                                                
                                                // Platform parameters
                                                const platRate = Number(summary?.commission_rate?.platform ?? 25);
                                                const gateRate = Number(summary?.commission_rate?.gateway ?? 2.5);
                                                
                                                // Earning transaction metrics
                                                let gross = 0;
                                                let platformFee = 0;
                                                let gst = 0;
                                                let tcs = 0;
                                                let tds = 0;
                                                let gatewayFee = 0;
                                                let shippingCharge = 0;
                                                let netDisbursable = Math.abs(txn.amount);

                                                if (txn.type === 'earning') {
                                                    gross = txn.metadata?.order_total 
                                                        ? Number(txn.metadata.order_total) 
                                                        : (txn.order?.total_amount ? Number(txn.order.total_amount) : Math.abs(txn.amount) / 0.685);
                                                    
                                                    platformFee = txn.metadata?.platform_commission 
                                                        ? Number(txn.metadata.platform_commission) 
                                                        : gross * (platRate / 100);
                                                        
                                                    gst = txn.metadata?.platform_commission_gst 
                                                        ? Number(txn.metadata.platform_commission_gst) 
                                                        : platformFee * 0.18;
                                                    tcs = txn.tcs_deduction !== undefined && txn.tcs_deduction !== null
                                                        ? Number(txn.tcs_deduction)
                                                        : (txn.metadata?.tcs_amount 
                                                            ? Number(txn.metadata.tcs_amount) 
                                                            : gross * 0.01);
                                                    tds = txn.tds_deduction !== undefined && txn.tds_deduction !== null
                                                        ? Number(txn.tds_deduction)
                                                        : (txn.metadata?.tds_amount 
                                                            ? Number(txn.metadata.tds_amount) 
                                                            : gross * 0.01);
                                                    
                                                    shippingCharge = txn.metadata?.shipping_charge
                                                        ? Number(txn.metadata.shipping_charge)
                                                        : 0;
                                                    
                                                    const isCOD = txn.order ? (txn.order as any).payment_method?.toLowerCase() === 'cod' : false;
                                                    gatewayFee = txn.metadata?.gateway_fee 
                                                        ? Number(txn.metadata.gateway_fee) 
                                                        : (isCOD ? 0 : gross * (gateRate / 100));
                                                        
                                                    netDisbursable = gross - platformFee - gst - tcs - tds - gatewayFee - shippingCharge;
                                                }

                                                const balanceBeforeNet = Number(txn.balance_before);
                                                const balanceAfterNet = Number(txn.balance_after);
                                                const deltaNet = Math.abs(Number(txn.amount));

                                                return (
                                                <tr key={txn.id} className="group hover:bg-gray-50/30 transition-all">
                                                    {/* Txn ID */}
                                                    <td className="px-6 py-5">
                                                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 font-mono tracking-tight">#{txn.id}</span>
                                                    </td>
                                                    {/* Audit Timestamp */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-bold text-gray-900 tracking-tight whitespace-nowrap">{new Date(txn.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span className="text-[9px] text-gray-400 font-semibold capitalize tracking-wide opacity-60">{new Date(txn.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    {/* Logic Classification */}
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-xl text-[8px] font-semibold capitalize tracking-wide border shadow-sm whitespace-nowrap ${
                                                                txn.type === 'earning' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                txn.type === 'payout' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                txn.type === 'refund' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                txn.type === 'adjustment' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                txn.type === 'reversal' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                'bg-gray-100 text-gray-600 border-gray-200'
                                                            }`}>
                                                            {txn.type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    {/* Flow Direction */}
                                                    <td className="px-6 py-5">
                                                        <div className={`flex items-center gap-1.5 text-[9px] font-semibold capitalize tracking-wide ${
                                                                isCredit ? 'text-emerald-600' : 'text-rose-500'
                                                            }`}>
                                                            {isCredit ? (
                                                                <>
                                                                    <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform" />
                                                                    <span>Credit</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ArrowDownRight size={14} className="group-hover:rotate-45 transition-transform" />
                                                                    <span>Debit</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {/* Order Reference */}
                                                    <td className="px-6 py-5">
                                                        {txn.order ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 w-fit font-mono">#{txn.order.order_number}</span>
                                                                <span className="text-[8px] font-semibold text-gray-400 capitalize tracking-wide mt-0.5">{txn.order.status}</span>
                                                            </div>
                                                        ) : txn.payout ? (
                                                            <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 w-fit">Payout #{txn.payout.id}</span>
                                                        ) : (
                                                            <span className="text-[9px] font-semibold text-gray-300">—</span>
                                                        )}
                                                    </td>
                                                    {/* Reconciliation Status */}
                                                    <td className="px-6 py-5">
                                                        {(() => {
                                                            if (txn.type !== 'earning') {
                                                                return <span className="text-[9px] font-semibold text-gray-300">—</span>;
                                                            }
                                                            const isCOD = txn.order ? (txn.order as any).payment_method?.toLowerCase() === 'cod' : false;
                                                            const isReconciled = txn.reconciliation_status === 'reconciled' || !isCOD;
                                                            return (
                                                                <span className={`px-2.5 py-1 rounded-xl text-[8.5px] font-semibold capitalize tracking-wide border shadow-sm whitespace-nowrap ${
                                                                    isReconciled 
                                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                                        : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                                                }`}>
                                                                    {isReconciled ? 'Ready to Payout' : 'Pending Courier Recon'}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    {/* Network Descriptor */}
                                                    <td className="px-6 py-5">
                                                        <p className="text-[11px] font-bold text-gray-500 leading-relaxed group-hover:text-gray-900 transition-colors max-w-[200px]">{txn.description}</p>
                                                    </td>
                                                    {/* Interactive Delta */}
                                                    <td className="px-6 py-5">
                                                        <div className={`text-xs font-extrabold flex items-center gap-1 whitespace-nowrap ${isCredit ? 'text-cureza-green' : 'text-rose-600'}`}>
                                                            <span className="tracking-tighter">{isCredit ? '+' : '-'}₹{deltaNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </td>
                                                    {/* Balance Before */}
                                                    <td className="px-6 py-5">
                                                        <span className="text-xs font-semibold text-gray-600 tracking-tighter">
                                                            ₹{balanceBeforeNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </td>
                                                    {/* Balance After */}
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm font-bold text-gray-900 group-hover:bg-gray-900 group-hover:text-white px-2 py-0.5 rounded transition-all tracking-tight">
                                                            ₹{balanceAfterNet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </td>
                                                    {/* Revenue Flow Pipeline */}
                                                    <td className="px-6 py-5">
                                                        {(() => {
                                                            const net = Math.abs(txn.amount);
                                                            if (txn.type === 'earning') {
                                                                return (
                                                                    <div className="flex items-center gap-1 text-[8.5px] font-semibold text-gray-500 min-w-[380px] flex-wrap">
                                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono" title="Gross Sales / Customer Paid">
                                                                            ₹{gross.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-rose-50 px-1.5 py-0.5 rounded text-rose-600 font-mono" title={`Platform Commission (${platRate}%)`}>
                                                                            -₹{platformFee.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-rose-50/50 px-1.5 py-0.5 rounded text-rose-500 font-mono" title="GST on Commission (18%)">
                                                                            -₹{gst.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono" title="TCS (1%)">
                                                                            -₹{tcs.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono" title="TDS (1%)">
                                                                            -₹{tds.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-rose-50 px-1.5 py-0.5 rounded text-rose-500 font-mono" title={`Gateway Fee (${gateRate}%)`}>
                                                                            -₹{gatewayFee.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-rose-100/50 px-1.5 py-0.5 rounded text-rose-600 font-mono" title="Shipping & Delivery Charges">
                                                                            -₹{shippingCharge.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600 font-bold font-mono" title="Actual Hand Yield Net Payout">
                                                                            ₹{netDisbursable.toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            } else if (txn.type === 'payout') {
                                                                return (
                                                                    <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500 min-w-[220px]">
                                                                        <span className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 font-mono" title="Disbursement Requested">
                                                                            ₹{net.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600" title="Payout Processing">
                                                                            Gateway
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-blue-600 px-1.5 py-0.5 rounded text-white font-bold" title="Transferred to Registered Bank Account">
                                                                            Bank Account
                                                                        </span>
                                                                    </div>
                                                                );
                                                            } else if (txn.type === 'refund' || txn.type === 'reversal') {
                                                                return (
                                                                    <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500 min-w-[220px]">
                                                                        <span className="bg-rose-100 px-1.5 py-0.5 rounded text-rose-800 font-mono" title="Deducted from Wallet Balance">
                                                                            -₹{net.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600" title="Refund Processor">
                                                                            Gateway
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-rose-600 px-1.5 py-0.5 rounded text-white font-bold" title="Returned to Customer Account">
                                                                            Customer
                                                                        </span>
                                                                    </div>
                                                                );
                                                            } else {
                                                                return (
                                                                    <div className="flex items-center gap-1 text-[9px] font-semibold text-gray-500 min-w-[220px]">
                                                                        <span className="bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 font-mono" title="Adjustment Amount">
                                                                            {txn.amount >= 0 ? '+' : '-'}₹{net.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-400">→</span>
                                                                        <span className="bg-gray-900 px-1.5 py-0.5 rounded text-white font-bold" title="Applied directly to Wallet Balance">
                                                                            Wallet Balance
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }
                                                        })()}
                                                    </td>
                                                </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'gst' && <SellerGstDashboard />}
            </div>
        </div>
    );
}
