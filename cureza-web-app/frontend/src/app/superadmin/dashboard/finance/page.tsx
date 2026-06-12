'use client';

import { useState, useEffect } from 'react';
import { 
    Search, 
    Download, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Calendar, 
    Users, 
    Briefcase,
    Stethoscope, 
    CheckCircle2, 
    XCircle,
    Info 
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface FinanceOverview {
    revenue: {
        total: number;
        platform_commission: number;
        gateway_fees: number;
        seller_earnings: number;
    };
    payouts: {
        pending_amount: number;
        approved_amount: number;
        rejected_count: number;
        total_requests: number;
    };
    refunds: {
        total: number;
        count: number;
    };
    net_platform_earnings: number;
}

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
}

interface DoctorRevenue {
    doctor_id: number;
    doctor_name: string;
    specialization: string;
    gross_sales: number;
    doctor_earnings: number;
    platform_commission: number;
    pending_payouts: number;
    bank_account_holder: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_ifsc: string | null;
    bookings_count: number;
}

interface DoctorAggregates {
    total_gross: number;
    total_doctor_earnings: number;
    total_commission: number;
}

export default function AdminFinancePage() {
    const [overview, setOverview] = useState<FinanceOverview | null>(null);
    const [sellers, setSellers] = useState<SellerRevenue[]>([]);
    const [doctors, setDoctors] = useState<DoctorRevenue[]>([]);
    const [doctorAggregates, setDoctorAggregates] = useState<DoctorAggregates | null>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'sellers' | 'doctors'>('sellers');

    useEffect(() => {
        fetchFinanceData();
    }, [startDate, endDate]);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
 
            const [overviewRes, sellersRes, doctorsRes] = await Promise.all([
                api.get(`/admin/finance/overview?${params}`),
                api.get(`/admin/finance/sellers?${params}`),
                api.get(`/admin/finance/doctors?${params}`)
            ]);
 
            setOverview(overviewRes.data);
            setSellers(sellersRes.data.data || []);
            setDoctors(doctorsRes.data.data || []);
            setDoctorAggregates(doctorsRes.data.aggregates || null);
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
        } finally {
            setLoading(false);
        }
    };
 
    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            params.append('type', activeTab);
 
            const response = await api.get(`/admin/finance/export?${params}`, {
                responseType: 'blob'
            });
 
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `finance-${activeTab}-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    };

    const filteredSellers = sellers.filter(seller =>
        seller.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDoctors = doctors.filter(doc =>
        doc.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || !overview) {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance & Revenue Board</h1>
                    <p className="text-gray-500">Monitor overall sales, splits, payouts, and collections across the platform.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download size={18} />
                        Export Report
                    </button>
                    <Link
                        href="/superadmin/dashboard/finance/payouts"
                        className="flex items-center gap-2 bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold"
                    >
                        Manage Payouts
                    </Link>
                </div>
            </div>

            {/* Segmented Tab Control */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl max-w-md">
                <button
                    onClick={() => { setActiveTab('sellers'); setSearchTerm(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'sellers' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Briefcase size={16} />
                    Products & Vendors
                </button>
                <button
                    onClick={() => { setActiveTab('doctors'); setSearchTerm(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'doctors' ? 'bg-[#0f4c3a] text-white shadow-sm' : 'text-gray-500 hover:text-[#0f4c3a]'}`}
                >
                    <Stethoscope size={16} />
                    Doctor Consultations
                </button>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Date Range Filter:</span>
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Start Date"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="End Date"
                    />
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="text-sm text-cureza-green hover:underline"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Content 1: SELLERS & PRODUCTS */}
            {activeTab === 'sellers' && (
                <>
                    {/* Seller Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in-50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign size={24} /></div>
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Gross</span>
                            </div>
                            <p className="text-sm text-gray-500">Total Gross Sales</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{overview.revenue.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={24} /></div>
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Commission</span>
                            </div>
                            <p className="text-sm text-gray-500">Platform Commission</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{overview.revenue.platform_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Users size={24} /></div>
                                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pending Payouts</span>
                            </div>
                            <p className="text-sm text-gray-500">Sellers Pending Balance</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{overview.payouts.pending_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={24} /></div>
                                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Refunds</span>
                            </div>
                            <p className="text-sm text-gray-500">Refunds Processed</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{overview.refunds.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>

                    {/* Seller Breakdown List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="font-bold text-gray-900">Seller-wise Revenue Ledger</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search sellers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Seller / Brand</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Platform Comm</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway Fee</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Seller Earning (Net)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSellers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No sellers found</td>
                                        </tr>
                                    ) : (
                                        filteredSellers.map((seller) => (
                                            <tr key={seller.seller_id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">{seller.seller_name}</div>
                                                    <div className="text-xs text-gray-400">{seller.brand_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    ₹{seller.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-green-600 font-bold">
                                                    ₹{seller.platform_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({seller.commission_rate.platform}%)
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-red-500 font-bold">
                                                    -₹{seller.gateway_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({seller.commission_rate.gateway}%)
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">
                                                    ₹{seller.seller_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Tab Content 2: DOCTORS */}
            {activeTab === 'doctors' && (
                <>
                    {/* Doctor Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-50">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-50 text-[#0f4c3a] rounded-lg"><DollarSign size={24} /></div>
                                <span className="text-xs font-bold text-[#0f4c3a] bg-emerald-50 px-2 py-1 rounded-full">Consultations</span>
                            </div>
                            <p className="text-sm text-gray-500">Gross Booking Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{(doctorAggregates?.total_gross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-[#e6c280]/20 text-[#0f4c3a] rounded-lg"><TrendingUp size={24} /></div>
                                <span className="text-xs font-bold text-[#0f4c3a] bg-[#e6c280]/20 px-2 py-1 rounded-full">Net Earnings</span>
                            </div>
                            <p className="text-sm text-gray-500">Paid/Payable to Doctors</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{(doctorAggregates?.total_doctor_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-amber-50 text-amber-700 rounded-lg"><TrendingDown size={24} /></div>
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">Commission</span>
                            </div>
                            <p className="text-sm text-gray-500">Platform Commission Retained</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{(doctorAggregates?.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>

                    {/* Doctor Ledger Table */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-gray-900">Doctor Consultation splits ledger</h3>
                                <p className="text-xs text-gray-500">Monitor earnings shares (Video 85%, Chat 80%, Follow-Up 100%) and payout release thresholds.</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search doctors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Bookings</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Gross Booking sales</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-red-500 uppercase">Commission Taken</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-[#0f4c3a] uppercase">Net Earning</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Bank Details</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Auto Payout Release</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDoctors.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No doctors found</td>
                                        </tr>
                                    ) : (
                                        filteredDoctors.map((doc) => {
                                            const thresholdReached = doc.doctor_earnings >= 1000;
                                            return (
                                                <tr key={doc.doctor_id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">{doc.doctor_name}</div>
                                                        <div className="text-xs text-gray-400">{doc.specialization}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{doc.bookings_count}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                                        ₹{doc.gross_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-red-500 font-bold">
                                                        -₹{doc.platform_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-[#0f4c3a]">
                                                        ₹{doc.doctor_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                        {doc.bank_name ? (
                                                            <div>
                                                                <p className="font-bold text-gray-700">{doc.bank_name}</p>
                                                                <p>A/C: {doc.bank_account_number}</p>
                                                                <p className="text-[10px] text-gray-400">IFSC: {doc.bank_ifsc}</p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-amber-600 font-semibold flex items-center gap-1"><Info size={12} /> KYC Incomplete</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                        {thresholdReached ? (
                                                            <span className="px-3 py-1 bg-emerald-100 text-[#0f4c3a] font-black rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border border-emerald-200">
                                                                <CheckCircle2 size={10} /> Ready to Release
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-amber-50 text-amber-700 font-bold rounded-full text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border border-amber-100">
                                                                <XCircle size={10} /> Pending Threshold (₹1000)
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
