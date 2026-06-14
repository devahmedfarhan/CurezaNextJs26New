'use client';

import { useState, useEffect } from 'react';
import { 
    Search, 
    Download, 
    Calendar, 
    Filter, 
    ArrowUpRight, 
    ArrowDownRight, 
    CreditCard, 
    TrendingUp, 
    Info, 
    RefreshCw, 
    FileText, 
    CheckCircle2, 
    XCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import axios from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: string | number;
    total: string | number;
    product_name?: string;
    product?: {
        name: string;
        original_price: string | number;
        price: string | number;
    };
}

interface Order {
    id: number;
    order_number: string;
    created_at: string;
    payment_method: string;
    payment_status: string;
    status: string;
    tracking_id: string | null;
    prescription_path: string | null;
    shipping_address_json: {
        first_name?: string;
        last_name?: string;
        street_address?: string;
        apartment?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
        phone?: string;
        email?: string;
    } | null;
    user?: {
        name: string;
        email: string;
    } | null;
    items: OrderItem[];
}

interface FinanceSummary {
    commission_rate: {
        platform: number;
        gateway: number;
        total: number;
    };
}

export default function DynamicBrandReconciliationPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const params = useParams();
    
    const brandName = user?.brand?.name || (user as any)?.seller_profile?.brand_name || (user as any)?.sellerProfile?.brand_name || 'Brand';
    const pageTitle = `${brandName.toUpperCase()} X CUREZA`;

    const [orders, setOrders] = useState<Order[]>([]);
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [page, statusFilter, paymentFilter, startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const apiParams: any = { page };
            if (statusFilter !== 'All') apiParams.status = statusFilter;
            if (paymentFilter !== 'All') apiParams.payment_method = paymentFilter;
            if (startDate) apiParams.start_date = startDate;
            if (endDate) apiParams.end_date = endDate;
            if (searchTerm) apiParams.search = searchTerm;

            const [ordersRes, summaryRes] = await Promise.all([
                axios.get('/seller/orders', { params: apiParams }),
                axios.get('/seller/finance/summary').catch(err => {
                    console.error('Failed to load finance summary:', err);
                    return { 
                        data: { 
                            commission_rate: { platform: 25, gateway: 2.5, total: 27.5 } 
                        } 
                    };
                })
            ]);

            setOrders(ordersRes.data.data || []);
            setLastPage(ordersRes.data.last_page || 1);
            setTotalRecords(ordersRes.data.total || 0);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            showToast('Failed to load sales and order data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('All');
        setPaymentFilter('All');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    // Flatten orders to order items for tabular representation
    const getReportRows = (ordersList: Order[]) => {
        const rows: any[] = [];
        const platRate = summary?.commission_rate?.platform ?? 25;
        const gateRate = summary?.commission_rate?.gateway ?? 2.5;

        ordersList.forEach(order => {
            order.items?.forEach(item => {
                const orderDate = new Date(order.created_at);
                const monthYear = orderDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
                const dateStr = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                
                const customerName = order.user?.name || 
                    [order.shipping_address_json?.first_name, order.shipping_address_json?.last_name].filter(Boolean).join(' ') || 
                    'Guest Client';
                
                const product = item.product_name || item.product?.name || 'Unknown Product';
                const address = order.shipping_address_json 
                    ? [
                        order.shipping_address_json.street_address,
                        order.shipping_address_json.apartment,
                        order.shipping_address_json.city,
                        order.shipping_address_json.state,
                        order.shipping_address_json.postcode,
                        order.shipping_address_json.country || 'India'
                      ].filter(Boolean).join(', ') 
                    : 'N/A';

                const qty = item.quantity || 1;
                const mrp = Number(item.product?.original_price || item.price || 0);
                const salePrice = Number(item.price || 0);
                const discount = Math.max(0, mrp - salePrice);
                
                const isCOD = order.payment_method?.toLowerCase() === 'cod';
                const codCollected = isCOD ? (salePrice * qty) : 0;
                
                // Prescription link resolver
                let prescriptionLink = 'Non Prescription Product';
                if (order.prescription_path) {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                    prescriptionLink = order.prescription_path.startsWith('http') 
                        ? order.prescription_path 
                        : `${backendUrl}/storage/${order.prescription_path}`;
                }

                const trackingId = order.tracking_id || '—';
                
                // Since delivery and COD cash collection is managed directly by the vendor's agents, Cureza charges no processing fees for COD.
                const codProcessingFee = 0;
                
                // Financial splits (multiplied by quantity for total row valuation)
                const lineTotal = salePrice * qty;
                const taxableValue = Math.floor((lineTotal / 1.18) * 100) / 100; // assuming standard 18% GST built-in
                const commission = Math.floor((lineTotal * (platRate / 100)) * 100) / 100;
                const gstOnCommission = Math.floor((commission * 0.18) * 100) / 100;
                const tcs = Math.floor((lineTotal * 0.01) * 100) / 100;
                const tds = Math.floor((lineTotal * 0.01) * 100) / 100;
                const gatewayFee = isCOD ? 0 : Math.floor((lineTotal * (gateRate / 100)) * 100) / 100;
                const amountPayable = Math.floor((lineTotal - commission - gstOnCommission - tcs - tds - gatewayFee) * 100) / 100;
                
                const isPaid = order.payment_status?.toLowerCase() === 'paid';
                const paid = (item as any).settled_paid !== undefined 
                    ? Number((item as any).settled_paid) 
                    : (isPaid ? amountPayable : 0);
                const balance = (item as any).settled_balance !== undefined 
                    ? Number((item as any).settled_balance) 
                    : Math.max(0, Math.floor((amountPayable - paid) * 100) / 100);

                rows.push({
                    monthYear,
                    dateStr,
                    orderNumber: order.order_number,
                    customerName,
                    product,
                    address,
                    qty,
                    mrp,
                    discount,
                    salePrice,
                    lineTotal,
                    codCollected,
                    prescriptionLink,
                    trackingId,
                    codProcessingFee,
                    taxableValue,
                    commission,
                    gstOnCommission,
                    tcs,
                    tds,
                    gatewayFee,
                    amountPayable,
                    paid,
                    balance,
                    paymentMethod: order.payment_method,
                    paymentStatus: order.payment_status,
                    orderStatus: order.status
                });
            });
        });

        return rows;
    };

    const handleExportExcel = async () => {
        try {
            setExportLoading(true);
            showToast('Preparing full ledger database export...', 'info');

            // Load ALL pages of data by requesting per_page=all
            const apiParams: any = { per_page: 'all' };
            if (statusFilter !== 'All') apiParams.status = statusFilter;
            if (paymentFilter !== 'All') apiParams.payment_method = paymentFilter;
            if (startDate) apiParams.start_date = startDate;
            if (endDate) apiParams.end_date = endDate;
            if (searchTerm) apiParams.search = searchTerm;

            const response = await axios.get('/seller/orders', { params: apiParams });
            const allOrdersList = response.data.data || [];
            
            if (allOrdersList.length === 0) {
                showToast('No records found to export', 'warning');
                return;
            }

            const rows = getReportRows(allOrdersList);

            // Generate CSV content with Excel friendly UTF-8 BOM
            const headers = [
                "Month & Year", "Date", "Order No.", "Customer Name", "Product", "Address", 
                "Qty", "MRP", "Discount By Vendor", "Sale Price", 
                "Prescription Link", 
                "Tracking ID", "Total Value", 
                "Taxable Value", "Commission", "GST on Commission", "TCS", "TDS", "Gateway Fee", 
                "Amount Payable", "Paid", "Balance"
            ];

            const csvRows = [headers.join(",")];

            rows.forEach(r => {
                const fields = [
                    r.monthYear,
                    r.dateStr,
                    `#${r.orderNumber}`,
                    `"${r.customerName.replace(/"/g, '""')}"`,
                    `"${r.product.replace(/"/g, '""')}"`,
                    `"${r.address.replace(/"/g, '""')}"`,
                    r.qty,
                    r.mrp.toFixed(2),
                    r.discount.toFixed(2),
                    r.salePrice.toFixed(2),
                    r.prescriptionLink,
                    r.trackingId,
                    r.lineTotal.toFixed(2),
                    r.taxableValue.toFixed(2),
                    r.commission.toFixed(2),
                    r.gstOnCommission.toFixed(2),
                    r.tcs.toFixed(2),
                    r.tds.toFixed(2),
                    r.gatewayFee.toFixed(2),
                    r.amountPayable.toFixed(2),
                    r.paid.toFixed(2),
                    r.balance.toFixed(2)
                ];
                csvRows.push(fields.join(","));
            });

            const csvContent = "\uFEFF" + csvRows.join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${brandName.toLowerCase().replace(/\s+/g, '-')}-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast('Database exported to Excel/CSV successfully!', 'success');
        } catch (error) {
            console.error('Failed to export ledger database:', error);
            showToast('Export process encountered an error', 'error');
        } finally {
            setExportLoading(false);
        }
    };

    const rows = getReportRows(orders);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{pageTitle}</h1>
                    <p className="text-gray-500 text-xs font-semibold mt-2 uppercase tracking-wider">
                        Reconciliation Ledger and Financial Export Console
                    </p>
                </div>
                
                <button
                    onClick={handleExportExcel}
                    disabled={exportLoading || loading}
                    className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all border border-gray-800 active:scale-95 disabled:bg-gray-150 disabled:text-gray-300 disabled:shadow-none disabled:translate-y-0 cursor-pointer"
                >
                    {exportLoading ? (
                        <>Generating Sheet...</>
                    ) : (
                        <>
                            <Download size={16} className="text-cureza-green" /> Export Database to Excel
                        </>
                    )}
                </button>
            </div>

            {/* Quick Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="premium-card p-6 bg-white relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Items Sold</span>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">
                            {rows.reduce((acc, r) => acc + r.qty, 0)} Units
                        </h3>
                    </div>
                    <div className="text-[8.5px] font-semibold text-gray-500">Across {totalRecords} order transactions</div>
                </div>

                <div className="premium-card p-6 bg-white relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Gross Selling Volume</span>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">
                            ₹{rows.reduce((acc, r) => acc + (r.salePrice * r.qty), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="text-[8.5px] font-semibold text-gray-500">Before platform charges & statutory deductions</div>
                </div>

                <div className="premium-card p-6 bg-white relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Platform Commission + GST</span>
                        <h3 className="text-2xl font-black text-rose-600 tracking-tighter">
                            -₹{rows.reduce((acc, r) => acc + (r.commission + r.gstOnCommission), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="text-[8.5px] font-semibold text-rose-500">Includes {summary?.commission_rate?.platform}% platform cut + 18% GST</div>
                </div>

                <div className="premium-card p-6 bg-white relative overflow-hidden flex flex-col justify-between h-[150px]">
                    <div>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Amount Payable (Net)</span>
                        <h3 className="text-2xl font-black text-cureza-green tracking-tighter">
                            ₹{rows.reduce((acc, r) => acc + r.amountPayable, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="text-[8.5px] font-semibold text-emerald-600">Net credited into wallet balance (minus TCS/TDS)</div>
                </div>
            </div>

            {/* Filter Dashboard */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search customer, order no., product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-semibold focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green transition-all"
                        />
                    </form>

                    <div className="flex flex-wrap gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-600"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        <select
                            value={paymentFilter}
                            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-600"
                        >
                            <option value="All">All Payment Methods</option>
                            <option value="cod">COD only</option>
                            <option value="prepaid">Prepaid / Online</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-[10px] font-bold text-gray-700 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 px-1">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            className="w-full border border-gray-200 rounded-xl p-2.5 text-[10px] font-bold text-gray-700 outline-none"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={resetFilters}
                            className="w-full py-2.5 border border-red-100 hover:border-red-300 rounded-xl text-[10px] font-black text-red-600 transition-all uppercase cursor-pointer"
                        >
                            Reset Filter Parameters
                        </button>
                    </div>
                </div>
            </div>

            {/* Reconciliation Ledger Table */}
            <div className="premium-card overflow-hidden bg-white">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-3 bg-gray-900 text-white rounded-2xl">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-gray-900 tracking-tighter">Reconciliation Ledger</h3>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 opacity-60">
                                Detailed statement with commission, tax splits, and payouts
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="premium-table-header border-b border-gray-100">
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap">Month & Year</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap">Date</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap">Order No.</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap">Customer Name</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap">Product</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap">Address</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-center">Qty</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">MRP</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Discount By Vendor</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Sale Price</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap">Prescription Link</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap">Tracking ID</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Total Value</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Taxable Value</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Commission</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">GST on Commission</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">TCS</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">TDS</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Gateway Fee</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Amount Payable</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Paid</th>
                                <th className="px-5 py-4 text-[9px] font-black tracking-wider text-gray-500 whitespace-nowrap text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[11px] font-semibold text-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={22} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cureza-green"></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-2">Loading data portfolio...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={22} className="px-8 py-20 text-center text-gray-400">
                                        No order data available matching active filter options.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((r, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/30 transition-all font-sans">
                                        <td className="px-5 py-4 whitespace-nowrap text-gray-500">{r.monthYear}</td>
                                        <td className="px-5 py-4 whitespace-nowrap text-gray-900">{r.dateStr}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 font-bold">#{r.orderNumber}</span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-900">{r.customerName}</td>
                                        <td className="px-5 py-4 max-w-[200px] truncate" title={r.product}>{r.product}</td>
                                        <td className="px-5 py-4 max-w-[200px] truncate text-gray-500" title={r.address}>{r.address}</td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap font-black">{r.qty}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">₹{r.mrp.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-red-500 font-medium">{r.discount > 0 ? `₹${r.discount.toFixed(2)}` : '—'}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-gray-900">₹{r.salePrice.toFixed(2)}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {r.prescriptionLink !== 'Non Prescription Product' ? (
                                                <a href={r.prescriptionLink} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 underline font-bold">
                                                    View Rx
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 font-medium text-[10px]">Non Prescription Product</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap font-mono text-gray-400">{r.trackingId}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap font-bold text-gray-900">₹{r.lineTotal.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">₹{r.taxableValue.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-500">₹{r.commission.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-500">₹{r.gstOnCommission.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-gray-500">₹{r.tcs.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-gray-500">₹{r.tds.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-500">₹{r.gatewayFee.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap font-black text-gray-950 bg-emerald-50/10">₹{r.amountPayable.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-emerald-600 font-bold">₹{r.paid.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-600 font-bold">₹{r.balance.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                            {rows.length > 0 && (
                                <tr className="bg-gray-50 font-black text-gray-900 border-t-2 border-b border-gray-200 text-[10px] uppercase tracking-wider">
                                    <td colSpan={6} className="px-5 py-4 text-left font-black">Totals (Page)</td>
                                    <td className="px-5 py-4 text-center whitespace-nowrap">{rows.reduce((acc, r) => acc + r.qty, 0)}</td>
                                    <td className="px-5 py-4 text-right">—</td>
                                    <td className="px-5 py-4 text-right text-red-600 whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.discount, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right">—</td>
                                    <td className="px-5 py-4 text-center">—</td>
                                    <td className="px-5 py-4 text-left">—</td>
                                    <td className="px-5 py-4 text-right font-black whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.lineTotal, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.taxableValue, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.commission, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.gstOnCommission, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-gray-900 whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.tcs, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-gray-900 whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.tds, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.gatewayFee, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right font-black text-gray-950 bg-emerald-50/20 whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.amountPayable, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-emerald-600 font-bold whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.paid, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 font-bold whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.balance, 0).toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {lastPage > 1 && (
                    <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                            Showing page {page} of {lastPage} ({totalRecords} records)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <ChevronLeft size={14} className="inline mr-1" /> Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                                disabled={page === lastPage}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                Next <ChevronRight size={14} className="inline ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
