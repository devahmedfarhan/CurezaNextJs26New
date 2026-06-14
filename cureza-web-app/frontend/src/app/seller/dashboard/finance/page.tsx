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
    balance_before: number;
    balance_after: number;
    order_id: number | null;
    payout_id: number | null;
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
}

export default function SellerFinancePage() {
    const { showToast } = useToast();
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('30_days');
    const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'ledger'>('overview');
    
    // Payout request states
    const [payoutAmount, setPayoutAmount] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
    
    // Profit simulator state
    const [simulatorPrice, setSimulatorPrice] = useState('1000');
    const [simulatorPaymentMode, setSimulatorPaymentMode] = useState<'prepaid' | 'cod'>('prepaid');

    useEffect(() => {
        fetchFinanceData();
    }, [range]);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);
            const [summaryRes, transactionsRes, payoutsRes, settingsRes] = await Promise.all([
                axios.get(`/seller/finance/summary?range=${range}`),
                axios.get('/seller/finance/transactions?per_page=100'),
                axios.get('/seller/finance/payouts?per_page=50'),
                axios.get('/seller/settings').catch(err => {
                    console.error('Failed to load settings:', err);
                    return { data: { profile: null } };
                })
            ]);

            setSummary(summaryRes.data);
            setTransactions(transactionsRes.data.data || []);
            setPayoutRequests(payoutsRes.data.data || []);
            
            // Auto-fill payout amount with net yield after taxes
            if (summaryRes.data) {
                const summaryData = summaryRes.data;
                const gross = summaryData.summary.total_sales;
                const platformCommission = summaryData.summary.platform_commission;
                const gst = platformCommission * 0.18;
                const tcs = gross * 0.01;
                const tds = gross * 0.01;
                const totalTaxes = gst + tcs + tds;
                const taxRatio = summaryData.summary.net_earnings > 0 ? totalTaxes / summaryData.summary.net_earnings : 0;
                const estimatedTaxesOnBalance = summaryData.wallet.available_balance * taxRatio;
                const netDisbursableYieldOnLoad = Math.max(0, Math.floor((summaryData.wallet.available_balance - estimatedTaxesOnBalance) * 100) / 100);
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

    if (loading || !summary) {
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
    const platformRate = summary?.commission_rate?.platform ?? 25;
    const gatewayRate = summary?.commission_rate?.gateway ?? 2.5;

    const taxableValue = price / 1.18;
    const platformFee = price * (platformRate / 100);
    const gstOnPlatform = platformFee * 0.18;
    const tcs = price * 0.01;
    const tds = price * 0.01;
    const gatewayFee = simulatorPaymentMode === 'prepaid' ? (price * (gatewayRate / 100)) : 0;
    const netEarnings = price - platformFee - gstOnPlatform - tcs - tds - gatewayFee;
    
    // Available balance tax calculations
    let netDisbursableYield = 0;
    let estimatedTaxesOnBalance = 0;
    let taxRatio = 0;
    if (summary) {
        const gross = summary.summary.total_sales;
        const platformCommission = summary.summary.platform_commission;
        const gst = platformCommission * 0.18;
        const tcs = gross * 0.01;
        const tds = gross * 0.01;
        const totalTaxes = gst + tcs + tds;
        taxRatio = summary.summary.net_earnings > 0 ? totalTaxes / summary.summary.net_earnings : 0;
        estimatedTaxesOnBalance = summary.wallet.available_balance * taxRatio;
        netDisbursableYield = Math.max(0, Math.floor((summary.wallet.available_balance - estimatedTaxesOnBalance) * 100) / 100);
    }

    const tabs = [
        { id: 'overview', label: 'Financial Overview', icon: BarChart3 },
        { id: 'withdraw', label: 'Withdrawals & Payouts', icon: Landmark },
        { id: 'ledger', label: 'Operational Ledger', icon: CreditCard },
    ] as const;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
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
                        className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all border border-gray-800 active:scale-95 cursor-pointer"
                    >
                        <Download size={16} className="text-cureza-green" /> Data Export Portfolio
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
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
                                isActive
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200/50'
                                    : 'text-gray-500 bg-white border-gray-100 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon size={16} className={isActive ? 'text-cureza-green' : 'text-gray-400'} />
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
                            <div className="premium-card p-8 group bg-white relative overflow-hidden flex flex-col justify-between h-[390px]">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-emerald-50 text-cureza-green rounded-2xl group-hover:bg-cureza-green group-hover:text-white transition-all duration-500 shadow-inner">
                                                <DollarSign size={24} />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">Liquid Now</span>
                                        </div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-60">Settlement Ready</p>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">
                                            ₹{netDisbursableYield.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h3>
                                        <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider mb-4">Raw Balance: ₹{summary.wallet.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[9px] font-semibold text-gray-500 leading-relaxed mb-4">
                                        <p className="font-extrabold uppercase text-[7.5px] tracking-wider text-gray-400 mb-1">Card Logic & Source</p>
                                        <p className="mb-2">Your net wallet balance available for withdrawal after statutory taxes (GST, TCS, TDS) are deducted.</p>
                                        <div className="pt-1.5 border-t border-gray-200/50 flex justify-between text-[7px] font-black uppercase tracking-wider text-gray-400">
                                            <span>Formula</span>
                                            <span>Raw Balance - Taxes</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveTab('withdraw')}
                                        disabled={netDisbursableYield < 100}
                                        className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-0.5 active:scale-95 transition-all disabled:bg-gray-50 disabled:text-gray-300 disabled:shadow-none disabled:translate-y-0 cursor-pointer"
                                    >
                                        Authorize Transfer
                                    </button>
                                </div>
                            </div>

                            <div className="premium-card p-8 group overflow-hidden bg-white flex flex-col justify-between h-[390px]">
                                <div className="relative flex-1 flex flex-col justify-between">
                                    {(() => {
                                        const tvlRaw = Math.max(0, summary.wallet.total_earnings - summary.wallet.paid_amount);
                                        const tvlNet = Math.max(0, tvlRaw - (tvlRaw * taxRatio));
                                        return (
                                            <>
                                                <div>
                                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-6 w-fit group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                        <TrendingUp size={24} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-60">Total Value Locked</p>
                                                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">
                                                        ₹{tvlNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </h3>
                                                    <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider mb-4">Raw Value: ₹{tvlRaw.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                </div>

                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[9px] font-semibold text-gray-500 leading-relaxed mb-4">
                                                    <p className="font-extrabold uppercase text-[7.5px] tracking-wider text-gray-400 mb-1">Card Logic & Source</p>
                                                    <p className="mb-2">Total active net earnings locked in the system, after compliance taxes (GST, TCS, TDS) are deducted.</p>
                                                    <div className="pt-1.5 border-t border-gray-200/50 flex justify-between text-[7px] font-black uppercase tracking-wider text-gray-400">
                                                        <span>Formula</span>
                                                        <span>Raw TVL - Taxes</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic tracking-tight">Immutable Record Strength</p>
                                    </div>
                                </div>
                            </div>

                            <div className="premium-card p-8 group overflow-hidden bg-white flex flex-col justify-between h-[390px]">
                                <div className="relative flex-1 flex flex-col justify-between">
                                    {(() => {
                                        const paidRaw = summary.wallet.paid_amount;
                                        const paidNet = Math.max(0, paidRaw - (paidRaw * taxRatio));
                                        return (
                                            <>
                                                <div>
                                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl mb-6 w-fit group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                        <CreditCard size={24} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-60">Successfully Injected</p>
                                                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">
                                                        ₹{paidNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </h3>
                                                    <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider mb-4">Raw Paid: ₹{paidRaw.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                </div>

                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[9px] font-semibold text-gray-500 leading-relaxed mb-4">
                                                    <p className="font-extrabold uppercase text-[7.5px] tracking-wider text-gray-400 mb-1">Card Logic & Source</p>
                                                    <p className="mb-2">Earnings successfully processed, approved, and transferred to your bank account after tax withholding.</p>
                                                    <div className="pt-1.5 border-t border-gray-200/50 flex justify-between text-[7px] font-black uppercase tracking-wider text-gray-400">
                                                        <span>Formula</span>
                                                        <span>Raw Paid - Taxes</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <p className="text-[8px] font-black text-purple-500 uppercase tracking-widest italic tracking-tight">Bank Verification Complete</p>
                                    </div>
                                </div>
                            </div>

                            <div className="premium-card p-8 group overflow-hidden bg-white flex flex-col justify-between h-[390px]">
                                <div className="relative flex-1 flex flex-col justify-between">
                                    {(() => {
                                        const pendingRaw = summary.payouts.pending;
                                        const pendingNet = Math.max(0, pendingRaw - (pendingRaw * taxRatio));
                                        return (
                                            <>
                                                <div>
                                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl mb-6 w-fit group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                        <Clock size={24} />
                                                    </div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-60">In-Flight Pipeline</p>
                                                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">
                                                        ₹{pendingNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </h3>
                                                    <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider mb-4">Raw Pending: ₹{pendingRaw.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                </div>

                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[9px] font-semibold text-gray-500 leading-relaxed mb-4">
                                                    <p className="font-extrabold uppercase text-[7.5px] tracking-wider text-gray-400 mb-1">Card Logic & Source</p>
                                                    <p className="mb-2">Withdrawals requested and awaiting administrator audit, showing the net yield after tax withholding.</p>
                                                    <div className="pt-1.5 border-t border-gray-200/50 flex justify-between text-[7px] font-black uppercase tracking-wider text-gray-400">
                                                        <span>Formula</span>
                                                        <span>Raw Pending - Taxes</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="flex items-center gap-3 border-t border-gray-50 pt-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></div>
                                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest italic tracking-tight">Awaiting Protocol Approval</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart and Simulator Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recharts Chart Area */}
                            <div className="premium-card p-8 bg-white lg:col-span-2 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-black text-xl text-gray-900 tracking-tighter">Earnings Timeline Trend</h3>
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Daily net earnings trajectory</p>
                                    </div>
                                    <span className="text-[8px] font-black text-cureza-green uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">Live feed</span>
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
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 900 }} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 900 }} tickFormatter={(val) => `₹${val}`} />
                                            <Tooltip 
                                                contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', padding: '12px' }}
                                                labelStyle={{ color: '#9ca3af', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}
                                                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 900 }}
                                                formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Net Earnings']}
                                            />
                                            <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Profit Calculator Simulator */}
                            <div className="premium-card p-8 bg-white flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-gray-50 text-gray-900 rounded-2xl border border-gray-100">
                                            <Calculator size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-gray-900 tracking-tighter">Net Yield Simulator</h3>
                                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Verify operational margins instantly</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Gross Listing Price (INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                value={simulatorPrice}
                                                onChange={(e) => setSimulatorPrice(e.target.value)}
                                                className="w-full h-12 pl-8 pr-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-black focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {['100', '500', '1000', '5000'].map(preset => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => setSimulatorPrice(preset)}
                                                    className="px-3 py-1.5 bg-gray-50 border border-gray-100 hover:border-gray-300 rounded-lg text-[9px] font-black text-gray-600 transition-all uppercase cursor-pointer"
                                                >
                                                    ₹{preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Payment Method Toggle Selector */}
                                    <div className="space-y-1.5 mb-6">
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Method</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSimulatorPaymentMode('prepaid')}
                                                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
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
                                                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                                    simulatorPaymentMode === 'cod'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                        : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'
                                                }`}
                                            >
                                                COD (Self Delivery)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                            <span>Gross List Price</span>
                                            <span>₹{price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                                            <span>Taxable Value (built-in 18% GST)</span>
                                            <span>₹{taxableValue.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-rose-500">
                                            <span>Platform Fee ({platformRate}%)</span>
                                            <span>-₹{platformFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-rose-400">
                                            <span>GST on Platform Fee (18%)</span>
                                            <span>-₹{gstOnPlatform.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                            <span>TCS Deduction (1%)</span>
                                            <span>-₹{tcs.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                            <span>TDS Deduction (1%)</span>
                                            <span>-₹{tds.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-rose-500">
                                            <span>Gateway Charge ({gatewayRate}%)</span>
                                            <span>{gatewayFee > 0 ? `-₹${gatewayFee.toFixed(2)}` : '₹0.00 (COD Bypass)'}</span>
                                        </div>
                                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Net Payout ({price > 0 ? ((netEarnings / price) * 100).toFixed(1) : '0.0'}%)
                                            </span>
                                            <span className="text-lg font-black text-cureza-green">₹{netEarnings.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-start gap-2 text-[8px] font-black text-gray-400 uppercase tracking-widest italic leading-tight">
                                    <Info size={12} className="text-cureza-green shrink-0 mt-0.5" />
                                    <span>Values calculated in real-time according to retention parameters.</span>
                                </div>
                            </div>
                        </div>

                        {/* Segments Metrics */}
                        {(() => {
                            const gross = summary.summary.total_sales;
                            const platformCommission = summary.summary.platform_commission;
                            const gatewayFee = summary.summary.gateway_fee;
                            const netEarnings = summary.summary.net_earnings;

                            const gst = platformCommission * 0.18;
                            const tcs = gross * 0.01;
                            const tds = gross * 0.01;
                            const actualHandYield = Math.max(0, netEarnings - gst - tcs - tds);

                            return (
                                <div className="premium-card p-10 bg-white border-b-8 border-b-gray-900">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                        <div>
                                            <h3 className="font-black text-xl text-gray-900 tracking-tighter">Segmented Analytics Portfolio</h3>
                                            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2 italic">Current Audit Focus: {range.replace('_', ' ')} Window</p>
                                        </div>
                                        <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest shadow-inner group">
                                            <Info size={14} className="text-cureza-green" />
                                            Live Revenue Architecture Logic
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col justify-between h-[250px]">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-60">Market Aggregate</p>
                                                <p className="text-2xl font-black text-gray-900 tracking-tighter mb-2">
                                                    ₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            
                                            <div className="p-3 bg-white rounded-xl border border-gray-100/50 text-[8.5px] font-semibold text-gray-500 leading-normal mb-2">
                                                <p className="font-extrabold uppercase text-[7px] tracking-wider text-gray-400 mb-0.5">Segment Details</p>
                                                <p>Total gross sales before commissions for the selected audit cycle.</p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="px-2.5 py-1 bg-white text-gray-400 text-[8px] font-black rounded-xl shadow-sm border border-gray-100 group-hover:border-cureza-green group-hover:text-cureza-green transition-all">{summary.summary.order_count} NODES</span>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-rose-50/20 rounded-[2rem] border border-rose-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 h-[250px] flex flex-col justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1.5">Platform Charge ({summary.commission_rate.platform}%)</p>
                                                <p className="text-2xl font-black text-rose-600 tracking-tighter mb-2">
                                                    -₹{platformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            <div className="p-3 bg-white/80 rounded-xl border border-rose-100/50 text-[8.5px] font-semibold text-rose-500 leading-normal mb-2">
                                                <p className="font-extrabold uppercase text-[7px] tracking-wider text-rose-400 mb-0.5">Segment Details</p>
                                                <p>Platform commission fee applied on gross sales for the selected audit cycle ({Number(summary.commission_rate.platform).toFixed(2)}% standard rate).</p>
                                            </div>

                                            <div className="w-12 h-1 bg-rose-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                        </div>

                                        <div className="p-6 bg-rose-50/20 rounded-[2rem] border border-rose-100 group hover:bg-white hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500 h-[250px] flex flex-col justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1.5">Gateway Protocol ({summary.commission_rate.gateway}%)</p>
                                                <p className="text-2xl font-black text-rose-600 tracking-tighter mb-2">
                                                    -₹{gatewayFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            <div className="p-3 bg-white/80 rounded-xl border border-rose-100/50 text-[8.5px] font-semibold text-rose-500 leading-normal mb-2">
                                                <p className="font-extrabold uppercase text-[7px] tracking-wider text-rose-400 mb-0.5">Segment Details</p>
                                                <p>Payment processor gateway fee on gross sales for the selected audit cycle ({Number(summary.commission_rate.gateway).toFixed(2)}% standard rate for online payments, 0% for COD).</p>
                                            </div>

                                            <div className="w-12 h-1 bg-rose-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                        </div>

                                        <div className="p-6 bg-emerald-50 text-emerald-900 rounded-[2rem] border border-emerald-100 group hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-700 h-[250px] flex flex-col justify-between relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-3xl rounded-full -mr-12 -mt-12"></div>
                                            <div>
                                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Net Payout (Actual Yield)</p>
                                                <p className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
                                                    ₹{actualHandYield.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            <div className="p-3 bg-white/80 rounded-xl border border-emerald-100/50 text-[8.5px] font-semibold text-emerald-700 leading-normal mb-2 z-10">
                                                <p className="font-extrabold uppercase text-[7px] tracking-wider text-emerald-600 mb-0.5">Segment Details</p>
                                                <p>Actual earnings credited to your balance after Platform Commission, GST on Commission, TCS, and TDS deductions for the selected audit cycle.</p>
                                            </div>

                                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic bg-white/50 w-fit px-2.5 py-1 rounded-xl shadow-sm border border-emerald-100 z-10">Calculated Yield</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'withdraw' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Payout Request Form */}
                            <div className="premium-card p-8 bg-white lg:col-span-2 space-y-6">
                                <div>
                                    <h3 className="font-black text-xl text-gray-900 tracking-tighter">Authorize Capital Disbursement</h3>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Verify target bank parameters prior to submit</p>
                                </div>
                                
                                <form onSubmit={handleRequestPayout} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Account Holder Name</label>
                                            <input
                                                type="text"
                                                value={accountHolder}
                                                onChange={(e) => setAccountHolder(e.target.value)}
                                                required
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="Name as registered in bank records"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Bank Name</label>
                                            <input
                                                type="text"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                required
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="e.g. State Bank of India"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Account Number</label>
                                            <input
                                                type="text"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                required
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="Account Number"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">IFSC Code</label>
                                            <input
                                                type="text"
                                                value={ifscCode}
                                                onChange={(e) => setIfscCode(e.target.value)}
                                                required
                                                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                placeholder="SBIN0001234"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Extraction Amount (Min: ₹100.00)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">₹</span>
                                                <input
                                                    type="number"
                                                    value={payoutAmount}
                                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                                    max={netDisbursableYield}
                                                    min={100}
                                                    step={0.01}
                                                    required
                                                    className="w-full h-11 pl-8 pr-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-black focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {payoutAmount && parseFloat(payoutAmount) > netDisbursableYield && (
                                                <p className="text-[9.5px] font-black text-rose-500 uppercase tracking-wide px-1 mt-1.5 flex items-center gap-1.5 leading-tight">
                                                    <AlertCircle size={12} className="shrink-0" />
                                                    Your maximum disbursable amount is ₹{netDisbursableYield.toLocaleString('en-IN', { minimumFractionDigits: 2 })} after tax adjustments.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingPayout || !payoutAmount || parseFloat(payoutAmount) < 100 || parseFloat(payoutAmount) > netDisbursableYield}
                                        className="w-full py-4 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none cursor-pointer"
                                    >
                                        {isSubmittingPayout ? 'Registering transfer...' : 'Confirm Withdrawal Request'}
                                    </button>
                                </form>
                            </div>

                            {/* Wallet Summary Panel */}
                            <div className="premium-card p-8 bg-white flex flex-col justify-between">
                                <div className="space-y-6">
                                    <h3 className="font-black text-lg text-gray-900 tracking-tighter">Settlement Ledger</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Liquid Balance (Raw)</span>
                                            <span className="text-lg font-black text-gray-900">₹{summary.wallet.available_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        {(() => {
                                            const gross = summary.summary.total_sales;
                                            const platformCommission = summary.summary.platform_commission;
                                            const gst = platformCommission * 0.18;
                                            const tcs = gross * 0.01;
                                            const tds = gross * 0.01;
                                            const totalTaxes = gst + tcs + tds;
                                            
                                            const taxRatio = summary.summary.net_earnings > 0 ? totalTaxes / summary.summary.net_earnings : 0;
                                            const estimatedTaxesOnBalance = summary.wallet.available_balance * taxRatio;
                                            const netDisbursableYield = Math.max(0, summary.wallet.available_balance - estimatedTaxesOnBalance);

                                            return (
                                                <>
                                                    <div className="flex justify-between items-center text-rose-500 pb-3 border-b border-gray-50">
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Est. Taxes (GST + TCS + TDS)</span>
                                                        <span className="text-sm font-black">-₹{estimatedTaxesOnBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-emerald-600 pb-3 border-b border-gray-50 bg-emerald-50/20 px-3 py-2 rounded-xl">
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Net Disbursable Yield</span>
                                                        <span className="text-md font-black">₹{netDisbursableYield.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pending Payouts</span>
                                            <span className="text-sm font-black text-amber-600">₹{summary.payouts.pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Historical Disbursed</span>
                                            <span className="text-sm font-black text-purple-600">₹{summary.wallet.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-[9px] font-black text-blue-700 uppercase leading-relaxed tracking-wider">
                                        <Info size={14} className="inline mr-2 -mt-0.5" />
                                        Default details are fetched from profile records. Permanent bank edits must be configured in Account Settings.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Withdrawal Request Ledger */}
                        <div className="premium-card overflow-hidden bg-white">
                            <div className="p-8 border-b border-gray-50 flex items-center gap-6">
                                <div className="p-3 bg-gray-900 text-white rounded-2xl">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-gray-900 tracking-tighter">Disbursement Request Registry</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 opacity-60">Status tracking of pending and historical withdrawals</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="premium-table-header">
                                            <th className="px-8 py-4">Request Timestamp</th>
                                            <th className="px-8 py-4">Target Bank Details</th>
                                            <th className="px-8 py-4">Disbursement Capacity</th>
                                            <th className="px-8 py-4">Transaction Reference</th>
                                            <th className="px-8 py-4">Compliance Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {payoutRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-16 text-center">
                                                    <div className="flex flex-col items-center opacity-30">
                                                        <Clock size={48} className="mb-4" />
                                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Withdrawal Registry Empty</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            payoutRequests.map((req) => (
                                                <tr key={req.id} className="group hover:bg-gray-50/30 transition-all">
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-gray-900 tracking-tight">
                                                                {new Date(req.requested_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                                                                {new Date(req.requested_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="text-xs font-bold text-gray-700">
                                                            <p className="font-extrabold">{req.bank_details?.bank_name} ({req.bank_details?.account_holder_name})</p>
                                                            <p className="text-[9px] text-gray-400 font-black tracking-widest mt-0.5">A/C: {req.bank_details?.account_number ? `******${req.bank_details.account_number.slice(-4)}` : 'N/A'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        {(() => {
                                                            const reqNet = Number(req.requested_amount) - (Number(req.requested_amount) * taxRatio);
                                                            return (
                                                                <div className="flex flex-col gap-0.5 whitespace-nowrap">
                                                                    <span className="text-sm font-black text-gray-900">
                                                                        ₹{reqNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                    </span>
                                                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                                                                        Raw: ₹{Number(req.requested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-xs font-bold text-gray-500">{req.transaction_id || req.notes || '—'}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
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
                                    <h3 className="font-black text-xl text-gray-900 tracking-tighter">Operational Ledger Registry</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 opacity-60">Transactional Synchronicity Tracking</p>
                                </div>
                            </div>


                            
                            {/* Column Explanation Glossary */}
                            <div className="mx-8 mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                <p className="font-extrabold uppercase text-[8px] tracking-[0.2em] text-gray-400 mb-3">Column Reference Guide</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-[9px] font-semibold text-gray-500 leading-normal">
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-gray-900">Txn ID</p>
                                        <p>Unique immutable identifier for each ledger entry in the system.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-gray-400">Audit Timestamp</p>
                                        <p>The exact date and time the financial transaction event occurred.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-blue-500">Logic Classification</p>
                                        <p>The type of transaction event (e.g., earning, payout, refund, or adjustment).</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-indigo-500">Flow Direction</p>
                                        <p>Whether money was added (Credit ↑) or subtracted (Debit ↓) from your wallet.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-violet-500">Order Reference</p>
                                        <p>The linked Order ID this transaction is associated with (if applicable).</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-[9px] font-semibold text-gray-500 leading-normal">
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-purple-500">Network Descriptor</p>
                                        <p>Human-readable description of the transaction event and its context.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-emerald-500">Interactive Delta</p>
                                        <p>The exact amount of money added (credit) or subtracted (debit) in this entry.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-orange-500">Balance Before</p>
                                        <p>Your wallet balance immediately before this transaction was applied.</p>
                                    </div>
                                    <div className="space-y-1 p-3 bg-white rounded-xl border border-gray-100">
                                        <p className="font-extrabold uppercase text-[7px] tracking-wider text-gray-900">Balance After</p>
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
                                                <td colSpan={10} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center opacity-20">
                                                        <CreditCard size={48} className="mb-4" />
                                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Ledger Sequence Void</p>
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
                                                let netDisbursable = Math.abs(txn.amount);

                                                if (txn.type === 'earning') {
                                                    gross = txn.metadata?.order_total 
                                                        ? Number(txn.metadata.order_total) 
                                                        : (txn.order?.total_amount ? Number(txn.order.total_amount) : Math.abs(txn.amount) / 0.685);
                                                    
                                                    platformFee = txn.metadata?.platform_commission 
                                                        ? Number(txn.metadata.platform_commission) 
                                                        : gross * (platRate / 100);
                                                        
                                                    gst = platformFee * 0.18;
                                                    tcs = gross * 0.01;
                                                    tds = gross * 0.01;
                                                    
                                                    const isCOD = txn.order ? (txn.order as any).payment_method?.toLowerCase() === 'cod' : false;
                                                    gatewayFee = txn.metadata?.gateway_fee 
                                                        ? Number(txn.metadata.gateway_fee) 
                                                        : (isCOD ? 0 : gross * (gateRate / 100));
                                                        
                                                    netDisbursable = gross - platformFee - gst - tcs - tds - gatewayFee;
                                                }

                                                // Calculate proportional balance reductions for taxes
                                                const grossTotal = summary.summary.total_sales;
                                                const platCommTotal = summary.summary.platform_commission;
                                                const totalTaxes = (platCommTotal * 0.18) + (grossTotal * 0.01) + (grossTotal * 0.01);
                                                const taxRatio = summary.summary.net_earnings > 0 ? totalTaxes / summary.summary.net_earnings : 0;
                                                
                                                const balanceBeforeNet = Number(txn.balance_before) - (Number(txn.balance_before) * taxRatio);
                                                const balanceAfterNet = Number(txn.balance_after) - (Number(txn.balance_after) * taxRatio);
                                                const deltaNet = txn.type === 'earning' ? netDisbursable : (txn.type === 'payout' ? Math.abs(txn.amount) - (Math.abs(txn.amount) * taxRatio) : Math.abs(txn.amount));

                                                return (
                                                <tr key={txn.id} className="group hover:bg-gray-50/30 transition-all">
                                                    {/* Txn ID */}
                                                    <td className="px-6 py-5">
                                                        <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 font-mono tracking-tight">#{txn.id}</span>
                                                    </td>
                                                    {/* Audit Timestamp */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs font-black text-gray-900 tracking-tight whitespace-nowrap">{new Date(txn.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest opacity-60">{new Date(txn.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    {/* Logic Classification */}
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border shadow-sm whitespace-nowrap ${
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
                                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
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
                                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 w-fit font-mono">#{txn.order.order_number}</span>
                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{txn.order.status}</span>
                                                            </div>
                                                        ) : txn.payout ? (
                                                            <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 w-fit">Payout #{txn.payout.id}</span>
                                                        ) : (
                                                            <span className="text-[9px] font-bold text-gray-300">—</span>
                                                        )}
                                                    </td>
                                                    {/* Network Descriptor */}
                                                    <td className="px-6 py-5">
                                                        <p className="text-[11px] font-bold text-gray-500 leading-relaxed group-hover:text-gray-900 transition-colors max-w-[200px]">{txn.description}</p>
                                                    </td>
                                                    {/* Interactive Delta */}
                                                    <td className="px-6 py-5">
                                                        {txn.type === 'earning' || txn.type === 'payout' ? (
                                                            <div className="flex flex-col gap-0.5 whitespace-nowrap">
                                                                <span className={`text-xs font-black tracking-tighter ${isCredit ? 'text-cureza-green' : 'text-rose-600'}`}>
                                                                    {isCredit ? '+' : '-'}₹{deltaNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                                                                    Raw: ₹{Math.abs(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className={`text-sm font-black flex items-center gap-1 whitespace-nowrap ${isCredit ? 'text-cureza-green' : 'text-rose-600'}`}>
                                                                <span className="tracking-tighter">{isCredit ? '+' : '-'}₹{Math.abs(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    {/* Balance Before */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-0.5 whitespace-nowrap">
                                                            <span className="text-xs font-bold text-gray-600 tracking-tighter">
                                                                ₹{balanceBeforeNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </span>
                                                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                                                                Raw: ₹{Number(txn.balance_before).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Balance After */}
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-0.5 whitespace-nowrap">
                                                            <span className="text-sm font-black text-gray-900 group-hover:bg-gray-900 group-hover:text-white px-2 py-0.5 rounded transition-all tracking-tighter">
                                                                ₹{balanceAfterNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </span>
                                                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                                                                Raw: ₹{Number(txn.balance_after).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
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
            </div>
        </div>
    );
}
