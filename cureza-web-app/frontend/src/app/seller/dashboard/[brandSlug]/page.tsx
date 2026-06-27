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
    net_amount?: string | number;
    base_price?: string | number;
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
    
    const brandName = (user as any)?.brand?.name || (user as any)?.seller_profile?.brand_name || (user as any)?.sellerProfile?.brand_name || 'Brand';
    const pageTitle = `${brandName} x Cureza`;

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
                const lineTotal = item.net_amount !== undefined ? Number(item.net_amount) : (salePrice * qty);
                const taxableValue = Math.floor((lineTotal / 1.18) * 100) / 100; // assuming standard 18% GST built-in
                
                const commission = (item as any).commission_amt !== undefined 
                    ? Number((item as any).commission_amt) 
                    : Math.floor((lineTotal * (platRate / 100)) * 100) / 100;
                    
                const gstOnCommission = (item as any).gst_on_commission_amt !== undefined 
                    ? Number((item as any).gst_on_commission_amt) 
                    : Math.floor((commission * 0.18) * 100) / 100;
                    
                const tcs = (item as any).tcs_amt !== undefined 
                    ? Number((item as any).tcs_amt) 
                    : Math.floor(((item.base_price !== undefined ? Number(item.base_price) : lineTotal) * 0.01) * 100) / 100;
                    
                const tds = (item as any).tds_amt !== undefined 
                    ? Number((item as any).tds_amt) 
                    : Math.floor((lineTotal * 0.01) * 100) / 100;
                    
                const gatewayFee = (item as any).gateway_fee_amt !== undefined 
                    ? Number((item as any).gateway_fee_amt) 
                    : (isCOD ? 0 : Math.floor((lineTotal * (gateRate / 100)) * 100) / 100);
                    
                const shippingCharge = (item as any).shipping_charge_amt !== undefined 
                    ? Number((item as any).shipping_charge_amt) 
                    : 0;
                    
                const amountPayable = (item as any).amount_payable_amt !== undefined 
                    ? Number((item as any).amount_payable_amt) 
                    : Math.floor((lineTotal - commission - gstOnCommission - tcs - tds - gatewayFee - shippingCharge) * 100) / 100;
                
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
                    shippingCharge,
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
                "Shipping Charge", "Amount Payable", "Paid", "Balance"
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
                    r.shippingCharge.toFixed(2),
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

    const rows = getReportRows(orders);    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">{pageTitle}</h1>
                    <p className="text-gray-550 text-xs font-semibold mt-1 capitalize">
                        Reconciliation Ledger and Financial Export Console
                    </p>
                </div>
                
                <button
                    onClick={handleExportExcel}
                    disabled={exportLoading || loading}
                    className="w-full lg:w-auto flex justify-center items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold capitalize shadow-none hover:bg-emerald-700 active:scale-95 transition-all border-[0.5px] border-emerald-650 disabled:bg-gray-150 disabled:text-gray-400 disabled:border-transparent disabled:shadow-none disabled:scale-100 cursor-pointer"
                >
                    {exportLoading ? (
                        <>Generating Sheet...</>
                    ) : (
                        <>
                            <Download size={14} className="text-white" /> Export Database to Excel
                        </>
                    )}
                </button>
            </div>
            {/* Quick Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div className="premium-card p-6 bg-white border-[0.5px] border-black/50 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[140px] shadow-none">
                    <div>
                        <span className="text-[10px] font-semibold text-gray-500 capitalize block mb-1">Total Items Sold</span>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {rows.reduce((acc, r) => acc + r.qty, 0)} Units
                        </h3>
                    </div>
                    <div className="text-[9px] font-medium text-gray-505">Across {totalRecords} order transactions</div>
                </div>
                <div className="premium-card p-6 bg-white border-[0.5px] border-black/50 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[140px] shadow-none">
                    <div>
                        <span className="text-[10px] font-semibold text-gray-500 capitalize block mb-1">Net Selling Value</span>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                            ₹{rows.reduce((acc, r) => acc + r.lineTotal, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="text-[9px] font-medium text-gray-505 font-sans leading-relaxed">
                        Gross (MRP): ₹{rows.reduce((acc, r) => acc + (r.mrp * r.qty), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}<br />
                        Vendor Disc: -₹{rows.reduce((acc, r) => acc + r.discount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} | Coupon: -₹{rows.reduce((acc, r) => acc + ((r.salePrice * r.qty) - r.lineTotal), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="premium-card p-6 bg-white border-[0.5px] border-black/50 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[140px] shadow-none">
                    <div>
                        <span className="text-[10px] font-semibold text-rose-600 capitalize block mb-1">Platform Fees & Taxes</span>
                        <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
                            -₹{rows.reduce((acc, r) => acc + (r.commission + r.gstOnCommission + r.tcs + r.tds + r.gatewayFee), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="text-[9px] font-medium text-rose-500 font-sans leading-relaxed">
                        Comm+GST: ₹{rows.reduce((acc, r) => acc + (r.commission + r.gstOnCommission), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}<br />
                        TCS (1%): ₹{rows.reduce((acc, r) => acc + r.tcs, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} | TDS (1%): ₹{rows.reduce((acc, r) => acc + r.tds, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="premium-card p-6 bg-white border-[0.5px] border-black/50 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[140px] shadow-none">
                    <div>
                        <span className="text-[10px] font-semibold text-emerald-600 capitalize block mb-1">Amount Payable (Net)</span>
                        <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">
                            ₹{rows.reduce((acc, r) => acc + r.amountPayable, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="text-[9px] font-medium text-emerald-600 font-sans leading-relaxed">
                        Net Earnings (Wallet Balance)<br />
                        After Shipping Deduction: -₹{rows.reduce((acc, r) => acc + r.shippingCharge, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="premium-card p-6 bg-white border-[0.5px] border-black/50 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[140px] shadow-none">
                    <div>
                        <span className="text-[10px] font-semibold text-indigo-600 capitalize block mb-1">Settled & Remaining</span>
                        <div className="flex justify-between items-baseline mt-1 gap-2">
                            <div>
                                <span className="text-[8px] font-semibold text-gray-400 block uppercase">Settled</span>
                                <h4 className="text-sm font-bold text-emerald-650 tracking-tight">
                                    ₹{rows.reduce((acc, r) => acc + r.paid, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </h4>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] font-semibold text-gray-400 block uppercase">Remaining</span>
                                <h4 className="text-sm font-bold text-indigo-650 tracking-tight">
                                    ₹{rows.reduce((acc, r) => acc + r.balance, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className="text-[9px] font-medium text-indigo-500 font-sans leading-relaxed">
                        Total settlement progress for delivered items
                    </div>
                </div>
            </div>

            {/* Filter Dashboard */}
            <div className="bg-white p-6 rounded-2xl border-[0.5px] border-black/50 shadow-none space-y-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search customer, order no., product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-[0.5px] border-black/50 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green transition-all outline-none"
                        />
                    </form>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="w-full sm:w-auto bg-white border-[0.5px] border-black/50 rounded-xl px-4 py-2.5 text-xs font-semibold capitalize text-gray-700 outline-none cursor-pointer focus:border-cureza-green"
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
                            className="w-full sm:w-auto bg-white border-[0.5px] border-black/50 rounded-xl px-4 py-2.5 text-xs font-semibold capitalize text-gray-700 outline-none cursor-pointer focus:border-cureza-green"
                        >
                            <option value="All">All Payment Methods</option>
                            <option value="cod">COD Only</option>
                            <option value="prepaid">Prepaid / Online</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 capitalize mb-1.5 px-1">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            className="w-full border-[0.5px] border-black/50 rounded-xl p-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-cureza-green"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 capitalize mb-1.5 px-1">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            className="w-full border-[0.5px] border-black/50 rounded-xl p-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-cureza-green"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={resetFilters}
                            className="w-full py-2.5 border-[0.5px] border-black/50 hover:border-red-200 hover:bg-red-50/50 rounded-xl text-xs font-semibold text-red-600 transition-all capitalize cursor-pointer"
                        >
                            Reset Filter Parameters
                        </button>
                    </div>
                </div>
            </div>

            {/* Reconciliation Ledger Table */}
            <div className="premium-card overflow-hidden bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                <div className="p-6 border-b-[0.5px] border-black/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-cureza-green border-[0.5px] border-black/50 rounded-xl shrink-0">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-800 tracking-tight">Reconciliation Ledger</h3>
                            <p className="text-[11px] font-medium text-gray-500 capitalize mt-1">
                                Detailed statement with commission, tax splits, and payouts
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="premium-table-header border-b-[0.5px] border-black/50 bg-gray-50/50">
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize">Month & Year</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize">Date</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize">Order No.</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize">Customer Name</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize">Product</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize">Address</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-center">Qty</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">MRP</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Discount By Vendor</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Sale Price</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize">Prescription Link</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize">Tracking ID</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Total Value</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Taxable Value</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Commission</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">GST on Commission</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">TCS</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">TDS</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Gateway Fee</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Shipping Charge</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Amount Payable</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Paid</th>
                                <th className="px-5 py-4 text-[10px] font-semibold tracking-wide text-gray-550 whitespace-nowrap capitalize text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[11px] font-semibold text-gray-650">
                            {loading ? (
                                <tr>
                                    <td colSpan={23} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-[0.5px] border-cureza-green"></div>
                                            <span className="text-xs font-semibold capitalize text-gray-500 mt-2">Loading data portfolio...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={23} className="px-8 py-20 text-center text-gray-500 font-medium">
                                        No order data available matching active filter options.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((r, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/30 transition-all font-sans">
                                        <td className="px-5 py-4 whitespace-nowrap text-gray-500">{r.monthYear}</td>
                                        <td className="px-5 py-4 whitespace-nowrap text-gray-800">{r.dateStr}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span className="font-mono text-indigo-600 bg-indigo-50/70 px-2.5 py-0.5 rounded border-[0.5px] border-black/50 font-semibold">#{r.orderNumber}</span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-800">{r.customerName}</td>
                                        <td className="px-5 py-4 max-w-[200px] truncate" title={r.product}>{r.product}</td>
                                        <td className="px-5 py-4 max-w-[200px] truncate text-gray-500 font-medium" title={r.address}>{r.address}</td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap font-semibold">{r.qty}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap font-medium">₹{r.mrp.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-red-500 font-medium">{r.discount > 0 ? `₹${r.discount.toFixed(2)}` : '—'}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap font-semibold text-gray-800">₹{r.salePrice.toFixed(2)}</td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {r.prescriptionLink !== 'Non Prescription Product' ? (
                                                <a href={r.prescriptionLink} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 underline font-semibold">
                                                    View Rx
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 font-medium text-[10px]">Non Prescription Product</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap font-mono text-gray-400 font-medium">{r.trackingId}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap font-semibold text-gray-800">₹{r.lineTotal.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap font-medium">₹{r.taxableValue.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-500 font-medium">₹{r.commission.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-500 font-medium">₹{r.gstOnCommission.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-gray-500 font-medium">₹{r.tcs.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-gray-500 font-medium">₹{r.tds.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-500 font-medium">₹{r.gatewayFee.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-500 font-medium">₹{r.shippingCharge.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap font-semibold text-gray-800 bg-emerald-50/10">₹{r.amountPayable.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-emerald-600 font-semibold">₹{r.paid.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap text-rose-600 font-semibold">₹{r.balance.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                            {rows.length > 0 && (
                                <tr className="bg-gray-50 font-bold text-gray-800 border-t-[0.5px] border-b-[0.5px] border-black/50 text-[11px] capitalize tracking-wide">
                                    <td colSpan={6} className="px-5 py-4 text-left font-bold">Totals (Page)</td>
                                    <td className="px-5 py-4 text-center whitespace-nowrap font-semibold">{rows.reduce((acc, r) => acc + r.qty, 0)}</td>
                                    <td className="px-5 py-4 text-right">—</td>
                                    <td className="px-5 py-4 text-right text-red-600 whitespace-nowrap font-semibold">₹{rows.reduce((acc, r) => acc + r.discount, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right">—</td>
                                    <td className="px-5 py-4 text-center">—</td>
                                    <td className="px-5 py-4 text-left">—</td>
                                    <td className="px-5 py-4 text-right font-bold whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.lineTotal, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right whitespace-nowrap font-semibold">₹{rows.reduce((acc, r) => acc + r.taxableValue, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 whitespace-nowrap font-semibold">₹{rows.reduce((acc, r) => acc + r.commission, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 whitespace-nowrap font-semibold">₹{rows.reduce((acc, r) => acc + r.gstOnCommission, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-gray-800 whitespace-nowrap font-semibold">₹{rows.reduce((acc, r) => acc + r.tcs, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-gray-800 whitespace-nowrap font-semibold">₹{rows.reduce((acc, r) => acc + r.tds, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 whitespace-nowrap font-semibold">₹{rows.reduce((acc, r) => acc + r.gatewayFee, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 whitespace-nowrap font-semibold">₹{rows.reduce((acc, r) => acc + r.shippingCharge, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right font-bold text-gray-950 bg-emerald-50/20 whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.amountPayable, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-emerald-600 font-semibold whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.paid, 0).toFixed(2)}</td>
                                    <td className="px-5 py-4 text-right text-rose-600 font-semibold whitespace-nowrap">₹{rows.reduce((acc, r) => acc + r.balance, 0).toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {lastPage > 1 && (
                    <div className="p-5 border-t-[0.5px] border-black/50 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-semibold capitalize">
                            Showing page {page} of {lastPage} ({totalRecords} records)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3.5 py-2 border-[0.5px] border-black/50 rounded-xl text-xs font-semibold capitalize text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <ChevronLeft size={14} className="inline mr-1" /> Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                                disabled={page === lastPage}
                                className="px-3.5 py-2 border-[0.5px] border-black/50 rounded-xl text-xs font-semibold capitalize text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all cursor-pointer"
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
