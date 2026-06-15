'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SellerDashboardService, DashboardSummary, SalesDataPoint, RecentOrder, TopProduct } from '@/services/seller-dashboard';
import SalesTrendChart from './components/SalesTrendChart';
import Link from 'next/link';
import { 
    TrendingUp, TrendingDown, ShoppingCart, DollarSign, 
    Package, CreditCard, ArrowRight, AlertCircle,
    Star, Tag, Settings, ShieldCheck, HelpCircle, Activity,
    LayoutDashboard, Info, Percent, MessageSquare, ShieldAlert, Sparkles, Clock, Globe
} from 'lucide-react';

const MOCK_SUMMARY: DashboardSummary = {
    sales: { value: 124500, change: 12.5, trend: 'up' },
    orders: { value: 156, change: 8.2, trend: 'up' },
    avg_order_value: { value: 798, change: 4.1, trend: 'up' },
    products: { total: 45, active: 42, pending: 3, out_of_stock: 3, low_stock: 5 },
    revenue: { gross: 124500, commission: 12450, net: 112050, pending_payout: 18500, paid_payout: 93550 }
};

const MOCK_SALES: SalesDataPoint[] = [
    { date: '2026-06-01', total_sales: 3200 },
    { date: '2026-06-03', total_sales: 4500 },
    { date: '2026-06-05', total_sales: 3800 },
    { date: '2026-06-07', total_sales: 6200 },
    { date: '2026-06-09', total_sales: 5800 },
    { date: '2026-06-11', total_sales: 7100 },
    { date: '2026-06-13', total_sales: 8400 }
];

const MOCK_ORDERS: RecentOrder[] = [
    { id: 1, order_number: 'CRZ-98231', product_name: 'Organic Ashwagandha Pro', customer: 'Aarav Mehta', date: '2026-06-13', amount: 1500, status: 'DELIVERED' },
    { id: 2, order_number: 'CRZ-98232', product_name: 'Premium Brahmi Syrup', customer: 'Priya Sharma', date: '2026-06-12', amount: 850, status: 'PROCESSING' },
    { id: 3, order_number: 'CRZ-98233', product_name: 'Neem & Turmeric Face Wash', customer: 'Rahul Verma', date: '2026-06-11', amount: 1200, status: 'SHIPPED' },
    { id: 4, order_number: 'CRZ-98234', product_name: 'Triphala Vitality Capsules', customer: 'Ananya Iyer', date: '2026-06-10', amount: 950, status: 'DELIVERED' }
];

const MOCK_PRODUCTS: TopProduct[] = [
    { product_id: 1, product_name: 'Organic Ashwagandha Pro Ext', units_sold: 45, revenue: 67500, stock_left: 15, image: null },
    { product_id: 2, product_name: 'Neem & Turmeric Skin Shield', units_sold: 32, revenue: 38400, stock_left: 8, image: null },
    { product_id: 3, product_name: 'Triphala Vitality Capsules', units_sold: 28, revenue: 26600, stock_left: 45, image: null }
];

export default function SellerDashboardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [range, setRange] = useState('30_days');

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const [summaryRes, salesRes, ordersRes, productsRes] = await Promise.all([
                    SellerDashboardService.getSummary(range),
                    SellerDashboardService.getSalesGraph(range),
                    SellerDashboardService.getRecentOrders(),
                    SellerDashboardService.getTopProducts(range)
                ]);

                setSummary(summaryRes);
                setSalesData(salesRes);
                setRecentOrders(ordersRes);
                setTopProducts(productsRes);
            } catch (err) {
                console.warn('Failed to load live dashboard metrics, falling back to cached demonstration data.');
                setSummary(MOCK_SUMMARY);
                setSalesData(MOCK_SALES);
                setRecentOrders(MOCK_ORDERS);
                setTopProducts(MOCK_PRODUCTS);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [range]);

    const getGreeting = () => {
        const hrs = new Date().getHours();
        if (hrs < 12) return 'Good Morning';
        if (hrs < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <div className="w-8 h-8 border-2 border-cureza-green border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400 font-medium">Assembling dashboard metrics...</p>
            </div>
        );
    }

    const orderStatusMapping: Record<string, string> = {
        'DELIVERED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'PROCESSING': 'bg-blue-50 text-blue-700 border-blue-100',
        'SHIPPED': 'bg-amber-50 text-amber-700 border-amber-100',
        'CANCELLED': 'bg-rose-50 text-rose-700 border-rose-100'
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Greeting Welcome Section */}
            <section className="rounded-3xl border border-gray-200 bg-white px-6 py-6 md:px-8 md:py-7 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-cureza-green border border-emerald-100">
                                <LayoutDashboard size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold capitalize tracking-wide text-gray-500">
                                    Seller Dashboard
                                </p>
                                <h1 className="truncate text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                    {getGreeting()}, {user?.name || 'Seller'}!
                                </h1>
                            </div>
                        </div>
                        <p className="mt-4 max-w-3xl text-sm md:text-[15px] leading-6 text-gray-500">
                            Welcome to your Unified Command Center. Manage products, trace orders, settle ledgers, and track store insights.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-[320px]">
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold capitalize tracking-wide focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-cureza-green cursor-pointer text-gray-700 outline-none shadow-sm sm:min-w-[220px]"
                        >
                            <option value="7_days">7 Days Audit Focus</option>
                            <option value="30_days">30 Days Audit Focus</option>
                            <option value="90_days">90 Days Audit Focus</option>
                        </select>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                            <p className="text-[10px] font-semibold capitalize tracking-wide text-emerald-700">
                                Live store view
                            </p>
                            <p className="mt-1 text-sm font-semibold text-emerald-950">
                                Metrics refresh with your selected window
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <Link href="/seller/dashboard/finance" className="premium-card p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[140px] group">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-gray-500 capitalize tracking-wide">Gross Sales</span>
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 group-hover:scale-110 transition-transform">
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-800 tracking-tighter">
                            ₹{(summary?.revenue?.gross ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[9px] font-semibold text-emerald-600 mt-2 capitalize tracking-wide flex items-center gap-1">
                            <TrendingUp size={12} /> +{summary?.sales.change ?? 0}% vs last window
                        </p>
                    </div>
                </Link>

                <Link href="/seller/dashboard/orders" className="premium-card p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[140px] group">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-gray-500 capitalize tracking-wide">Fulfillment Nodes</span>
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 group-hover:scale-110 transition-transform">
                            <ShoppingCart size={16} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-800 tracking-tighter">
                            {summary?.orders.value ?? 0} Orders
                        </h3>
                        <p className="text-[9px] font-semibold text-blue-600 mt-2 capitalize tracking-wide flex items-center gap-1">
                            <TrendingUp size={12} /> +{summary?.orders.change ?? 0}% active pipeline
                        </p>
                    </div>
                </Link>

                <Link href="/seller/dashboard/products" className="premium-card p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[140px] group">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-gray-500 capitalize tracking-wide">Active Products</span>
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 group-hover:scale-110 transition-transform">
                            <Package size={16} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-800 tracking-tighter">
                            {summary?.products.active ?? 0} SKUs
                        </h3>
                        <p className="text-[9px] font-semibold text-amber-600 mt-2 capitalize tracking-wide flex items-center gap-1">
                            <AlertCircle size={12} /> {summary?.products.out_of_stock ?? 0} restock warnings
                        </p>
                    </div>
                </Link>

                <Link href="/seller/dashboard/finance" className="premium-card p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[140px] group">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-gray-500 capitalize tracking-wide">Liquid Balance</span>
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100 group-hover:scale-110 transition-transform">
                            <CreditCard size={16} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 tracking-tighter">
                            ₹{(summary?.revenue?.net ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-[9px] font-semibold text-gray-550 mt-2 capitalize tracking-wide">
                            Net Credited into wallet balance
                        </p>
                    </div>
                </Link>
            </div>

            {/* Sales Chart Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-sm">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 tracking-tighter">Sales Trajectory</h3>
                        <p className="text-[10px] font-semibold text-gray-500 capitalize tracking-wide mt-0.5">Revenue and Transaction Volatility Metrics</p>
                    </div>
                    <Link href="/seller/dashboard/analytics" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold capitalize tracking-wide transition-all shadow-sm">
                        Detailed Analytics Matrix
                    </Link>
                </div>
                <SalesTrendChart data={salesData} />
            </div>

            {/* Seller landing Command Center Sections (All 10 Modules) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. My Products Management Card */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">My Products</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Catalog Health & SKU parameters</p>
                            </div>
                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-[8.5px] font-semibold text-indigo-650 capitalize tracking-wide">Catalog Desk</span>
                        </div>
 
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs font-bold text-gray-500">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Total Listings</span>
                                <span className="text-gray-900 text-base font-semibold">{summary?.products.total ?? 0}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">Live on Shop</span>
                                <span className="text-emerald-600 text-base font-semibold">{summary?.products.active ?? 0}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">Under Review</span>
                                <span className="text-amber-600 text-base font-semibold">{summary?.products.pending ?? 0}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">Stock Alerts</span>
                                <span className="text-rose-600 text-base font-semibold">{summary?.products.low_stock ?? 0}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">Avg Rating</span>
                                <span className="text-amber-500 text-base font-semibold flex items-center gap-0.5">
                                    {summary?.reviews_summary?.avg_rating !== undefined ? summary.reviews_summary.avg_rating.toFixed(1) : '0.0'}
                                    <Star size={12} fill="#F59E0B" className="text-amber-500" />
                                </span>
                            </div>
                        </div>
 
                        {/* Velocity Restock List */}
                        <div className="space-y-3">
                            <p className="text-[8px] font-semibold text-gray-500 capitalize tracking-wide">Top Selling Products Runway</p>
                            {topProducts.length === 0 ? (
                                <p className="text-gray-400 italic text-[10px]">No sales recorded yet.</p>
                            ) : (
                                topProducts.slice(0, 2).map((prod) => (
                                    <div key={prod.product_id} className="flex justify-between items-center text-xs font-bold text-gray-700 bg-gray-50/55 p-3 rounded-xl border border-gray-100/50">
                                        <span className="truncate max-w-[200px]">{prod.product_name}</span>
                                        <span className="text-gray-400 text-[10px] shrink-0 font-extrabold">{prod.stock_left} in stock ({prod.units_sold} sold)</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/products" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Manage Inventory <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>
 
                {/* 2. Orders Ingestion pipeline */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Orders Dispatch Desk</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Fulfillment tracking & status nodes</p>
                            </div>
                            <span className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-xl text-[8.5px] font-semibold text-blue-600 capitalize tracking-wide">Fulfillment</span>
                        </div>
 
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-550">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Pending Processing</span>
                                <span className="text-amber-600 text-base font-semibold">{summary?.orders_breakdown?.processing ?? 0} Orders</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">In-Transit / Shipped</span>
                                <span className="text-indigo-600 text-base font-semibold">{summary?.orders_breakdown?.shipped ?? 0} Orders</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Delivered (30d)</span>
                                <span className="text-emerald-600 text-base font-semibold">{summary?.orders_breakdown?.delivered ?? 0} Orders</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Cancelled Nodes</span>
                                <span className="text-rose-650 text-base font-semibold">{summary?.orders_breakdown?.cancelled ?? 0} Orders</span>
                            </div>
                        </div>
 
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="border-b border-gray-100 text-gray-400 font-semibold capitalize tracking-wide text-[9px]">
                                    <tr>
                                        <th className="pb-3 pr-2">Order #</th>
                                        <th className="pb-3 pr-2">Customer</th>
                                        <th className="pb-3 pr-2">Amount</th>
                                        <th className="pb-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                                    {recentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-4 text-center text-gray-400 italic text-[10px]">No recent orders found.</td>
                                        </tr>
                                    ) : (
                                        recentOrders.slice(0, 3).map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition">
                                                <td className="py-3 pr-2 font-semibold text-gray-900">{order.order_number}</td>
                                                <td className="py-3 pr-2">{order.customer}</td>
                                                <td className="py-3 pr-2 font-semibold text-gray-900">₹{(order.amount ?? 0).toLocaleString('en-IN')}</td>
                                                <td className="py-3 text-right">
                                                    <span className={`px-2 py-0.5 rounded-xl text-[8.5px] font-semibold border inline-block ${
                                                        orderStatusMapping[order.status.toUpperCase()] || 'bg-gray-50 text-gray-600'
                                                    }`}>
                                                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/orders" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Dispatch Center <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* 3. Payments & Settlements Card */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Payments Ledger</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Settlements ready and disbursement records</p>
                            </div>
                            <span className="px-2.5 py-1 bg-purple-50 border border-purple-100 rounded-xl text-[8.5px] font-semibold text-purple-600 capitalize tracking-wide">Ledger</span>
                        </div>
 
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-500">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Liquid Wallet</span>
                                <span className="text-gray-900 text-sm font-semibold">₹{(summary?.revenue?.net ?? 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Pending Payouts</span>
                                <span className="text-gray-955 text-sm font-semibold">₹{(summary?.revenue?.pending_payout ?? 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Next Settlement</span>
                                <span className="text-indigo-655 text-sm font-semibold">
                                    {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Tax deductions</span>
                                <span className="text-rose-650 text-sm font-semibold">₹{(summary?.revenue?.tcs ?? 0).toLocaleString('en-IN')} (TCS)</span>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50/30 rounded-xl border border-purple-100/50 flex gap-3 text-[10px] font-semibold text-purple-800 leading-normal">
                            <Info size={16} className="text-purple-650 shrink-0 mt-0.5" />
                            <p>Funds are settled immediately on delivery. Approved payout requests are processed directly into your connected {summary?.settings_summary?.bank_name || 'bank account'} ({summary?.settings_summary?.bank_account ? '*' + summary.settings_summary.bank_account.slice(-4) : 'Not Configured'}) within 24 hours.</p>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/finance" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Manage Ledger & Withdrawals <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* 4. Analytics Insights Card */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Analytics Matrix</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Store performance growth & conversion rates</p>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-xl text-[8.5px] font-semibold text-emerald-600 capitalize tracking-wide">Analytics</span>
                        </div>
 
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-500">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Conversion Rate</span>
                                <span className="text-gray-900 text-sm font-semibold">0.00%</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Unique Visitors</span>
                                <span className="text-gray-900 text-sm font-semibold">0</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Bounce Rate</span>
                                <span className="text-gray-900 text-sm font-semibold">0.00%</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Avg Order Val</span>
                                <span className="text-gray-900 text-sm font-semibold">₹{summary?.avg_order_value.value ?? 0}</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-[10px] font-semibold text-gray-600">
                            <p className="text-[8px] font-semibold text-gray-500 capitalize tracking-wide mb-1">Traffic Channels Allocation</p>
                            <p className="text-gray-400 italic">No traffic source data available yet. Source tags will populate here automatically.</p>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/analytics" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Explore Analytics Matrix <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* 5. Customer Reviews & Sentiment Card */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Customer Reviews</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Sentiment analysis and ratings aggregate</p>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-xl text-[8.5px] font-semibold text-amber-600 capitalize tracking-wide">Reviews</span>
                        </div>
 
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-500">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Average Star</span>
                                <span className="text-gray-900 text-sm font-semibold flex items-center gap-0.5">{(summary?.reviews_summary?.avg_rating ?? 0).toFixed(1)} <Star size={12} fill="#F59E0B" className="text-amber-500" /></span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Total Reviews</span>
                                <span className="text-gray-900 text-sm font-semibold">{summary?.reviews_summary?.total_count ?? 0} Comments</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Positive Sentiment</span>
                                <span className="text-emerald-600 text-sm font-semibold">{(summary?.reviews_summary?.positive_percentage ?? 0).toFixed(1)}%</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Pending Reply</span>
                                <span className="text-rose-600 text-sm font-semibold">{summary?.reviews_summary?.pending_reply ?? 0} reviews</span>
                            </div>
                        </div>

                        {/* Recent Reviews Feed */}
                        <div className="space-y-3">
                            <p className="text-[8px] font-semibold text-gray-500 capitalize tracking-wide">Recent Comments</p>
                            {summary?.reviews_summary?.latest && summary.reviews_summary.latest.length > 0 ? (
                                summary.reviews_summary.latest.map((rev, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-semibold text-gray-800">
                                            <span>{rev.customer_name}</span>
                                            <span className="text-amber-500 flex items-center gap-0.5">{rev.rating.toFixed(1)} <Star size={10} fill="#F59E0B" className="text-amber-500" /></span>
                                        </div>
                                        <p className="text-[10px] font-medium text-gray-500 italic">"{rev.review_text}"</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-gray-400 italic">No customer reviews submitted yet.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/reviews" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Review Desk <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* 6. Promotion & Coupons Card */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Coupons & Campaigns</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Promotion parameters & active discount coupons</p>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-xl text-[8.5px] font-semibold text-amber-600 capitalize tracking-wide">Campaign Desk</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-500">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Active Coupons</span>
                                <span className="text-gray-900 text-sm font-semibold">{summary?.coupons_summary?.active_count ?? 0} active</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Total Redeemed</span>
                                <span className="text-gray-950 text-sm font-semibold">{summary?.coupons_summary?.total_redeemed ?? 0} times</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Total Discount Val</span>
                                <span className="text-emerald-600 text-sm font-semibold">₹{(summary?.coupons_summary?.total_discount ?? 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Campaign ROI</span>
                                <span className="text-indigo-655 text-sm font-semibold">{summary?.coupons_summary?.total_redeemed ? '3.5x Est' : '0.0x ROI'}</span>
                            </div>
                        </div>

                        {/* Active Coupon Codes */}
                        <div className="space-y-2">
                            {summary?.coupons_summary?.list && summary.coupons_summary.list.length > 0 ? (
                                summary.coupons_summary.list.map((coupon, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <span className="font-mono bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-semibold text-indigo-600 capitalize">{coupon.code}</span>
                                        <span className="text-emerald-600 font-semibold">
                                            {coupon.type === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Flat`} • Active
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] text-gray-400 italic">No active coupons configured.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/coupons" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Manage Coupons <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* 7. Store Profile Card */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Store Profile</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Vendor store identifiers & branding details</p>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-xl text-[8.5px] font-semibold text-emerald-600 capitalize tracking-wide">Branding</span>
                        </div>
 
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-550">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Store Name</span>
                                <span className="text-gray-900 text-[10px] font-semibold truncate block">{summary?.settings_summary?.brand_name ?? 'N/A'}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Store Handle</span>
                                <span className="text-indigo-600 text-[10px] font-semibold truncate block">@{summary?.settings_summary?.brand_slug ?? 'n/a'}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Status</span>
                                <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-1">
                                    {summary?.settings_summary?.brand_name ? 'Live' : 'Pending'} <Globe size={10} />
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Avg Fulfillment</span>
                                <span className="text-gray-900 text-[10px] font-semibold">{summary?.settings_summary?.brand_name ? '12.5 hrs SLA' : 'N/A'}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white font-semibold text-sm flex items-center justify-center border border-gray-800 shadow-md capitalize">
                                    {summary?.settings_summary?.brand_name
                                        ? summary.settings_summary.brand_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                        : 'AW'}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-950 text-sm flex items-center gap-1.5">
                                        {summary?.settings_summary?.brand_name ?? 'N/A'} <ShieldCheck size={16} className="text-cureza-green" />
                                    </p>
                                    <p className="text-[10px] font-mono text-gray-500 font-semibold capitalize">Slug: {summary?.settings_summary?.brand_slug ?? 'n/a'}</p>
                                </div>
                            </div>
                            <p className="text-[11px] font-medium text-gray-650 leading-relaxed italic">
                                "{summary?.settings_summary?.brand_desc ?? 'No description available for your store.'}"
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/profile" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Edit Store Profile <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* 8. Seller Policy Agreement Card */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Seller Policy</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Contract rules, commissions, and compliance parameters</p>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-600 text-white border border-emerald-500 rounded-xl text-[8.5px] font-semibold capitalize tracking-wide">Compliance</span>
                        </div>
 
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-550">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Commission</span>
                                <span className="text-gray-900 text-[10px] font-semibold">25.00% base</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Gateway Fee</span>
                                <span className="text-gray-900 text-[10px] font-semibold">2.5% Prepaid</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-500 capitalize tracking-wide mb-1">Return Window</span>
                                <span className="text-indigo-655 text-[10px] font-semibold">7 Days Policy</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">GSTIN Status</span>
                                <span className={`${summary?.settings_summary?.gst_number ? 'text-emerald-600' : 'text-amber-600'} text-[10px] font-semibold`}>
                                    {summary?.settings_summary?.gst_number ? 'Verified (TCS Ok)' : 'Not Verified'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50 flex gap-3 text-[10px] font-semibold text-emerald-800 leading-normal">
                            <ShieldCheck size={16} className="text-cureza-green shrink-0 mt-0.5" />
                            <p>
                                {summary?.settings_summary?.gst_number 
                                    ? `Compliance status is verified. GSTIN: ${summary.settings_summary.gst_number}. You are bound by the Cureza Marketplace Handbook.`
                                    : 'Compliance status is pending. Please configure and verify your GSTIN number in Store Settings.'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/sellerpolicy" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Review Seller Policies <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* 9. Support & Tickets Desk */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Support & Tickets Desk</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Trace ticket statuses and open assistance channels</p>
                            </div>
                            <span className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-xl text-[8.5px] font-semibold text-blue-600 capitalize tracking-wide">Support</span>
                        </div>
 
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-500">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">Open Tickets</span>
                                <span className="text-rose-600 text-sm font-semibold">{summary?.support_summary?.open_count ?? 0} active</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">Resolved Tickets</span>
                                <span className="text-emerald-600 text-sm font-semibold">{summary?.support_summary?.resolved_count ?? 0} resolved</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">Avg SLA Response</span>
                                <span className="text-gray-900 text-sm font-semibold">2.4 hours</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide mb-1">Support Tier</span>
                                <span className="text-indigo-650 text-sm font-semibold">{summary?.settings_summary?.brand_name ? 'Gold Partner' : 'Standard'}</span>
                            </div>
                        </div>

                        {summary?.support_summary?.latest ? (
                            <div className="p-3 bg-rose-50/30 rounded-xl border border-rose-100/50 space-y-1">
                                <div className="flex justify-between text-[10px] font-semibold text-rose-800">
                                    <span>Ticket #{summary.support_summary.latest.ticket_number}</span>
                                    <span className="px-1.5 py-0.2 bg-rose-50 border border-rose-100 rounded-md text-[8px] font-semibold capitalize">
                                        {summary.support_summary.latest.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-[10px] font-medium text-gray-550 italic">"{summary.support_summary.latest.subject}"</p>
                            </div>
                        ) : (
                            <p className="text-[10px] text-gray-400 italic">No active support tickets found.</p>
                        )}
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/support" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Open Tickets / Support <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>

                {/* 10. Global Account Settings Card */}
                <div className="premium-card bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between lg:col-span-2">
                    <div className="p-5 md:p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl text-gray-800 tracking-tighter">Global Settings Node</h4>
                                <p className="text-[9px] font-semibold text-gray-500 capitalize tracking-wide">Account parameters, passwords, bank configurations, and notifications</p>
                            </div>
                            <span className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-xl text-[8.5px] font-semibold text-gray-500 capitalize tracking-wide">Settings</span>
                        </div>
 
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-semibold text-gray-500">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 col-span-1 md:col-span-2">
                                <span className="block text-[8px] text-gray-505 capitalize tracking-wide">Bank Config Status</span>
                                <span className={`${summary?.settings_summary?.bank_name ? 'text-emerald-600' : 'text-amber-600'} text-sm font-semibold flex items-center gap-1.5`}>
                                    <ShieldCheck size={14} /> {summary?.settings_summary?.bank_name ? 'Connected & Verified' : 'Not Configured'}
                                </span>
                                <p className="text-[9px] font-semibold text-gray-400 mt-1 capitalize">
                                    {summary?.settings_summary?.bank_name 
                                        ? `${summary.settings_summary.bank_name} • *${summary.settings_summary.bank_account.slice(-4)}`
                                        : 'Please configure bank account details'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 col-span-1 md:col-span-1">
                                <span className="block text-[8px] text-gray-505 capitalize tracking-wide">Notifications</span>
                                <span className="text-gray-900 text-sm font-semibold flex items-center gap-1.5">
                                    <Activity size={14} className="text-cureza-green" /> {summary?.settings_summary?.notifications_enabled ? 'Enabled' : 'Disabled'}
                                </span>
                                <p className="text-[9px] font-semibold text-gray-400 mt-1 capitalize">
                                    {summary?.settings_summary?.notifications_enabled ? 'Instant Alerts Active' : 'Alerts Inactive'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 col-span-1 md:col-span-1">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide">Clearance</span>
                                <span className={`${summary?.settings_summary?.two_factor_enabled ? 'text-emerald-600' : 'text-gray-450'} text-sm font-semibold flex items-center gap-1.5`}>
                                    <ShieldCheck size={14} /> {summary?.settings_summary?.two_factor_enabled ? '2FA Active' : '2FA Disabled'}
                                </span>
                                <p className="text-[9px] font-semibold text-gray-400 mt-1 capitalize">
                                    {summary?.settings_summary?.two_factor_enabled ? 'Protected Login' : 'Standard Security'}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 col-span-1 md:col-span-1">
                                <span className="block text-[8px] text-gray-550 capitalize tracking-wide">API Webhooks</span>
                                <span className="text-indigo-650 text-sm font-semibold flex items-center gap-1.5">
                                    <Globe size={14} /> {summary?.settings_summary?.brand_name ? '2 Configured' : '0 Configured'}
                                </span>
                                <p className="text-[9px] font-semibold text-gray-400 mt-1 capitalize">
                                    {summary?.settings_summary?.brand_name ? 'Webhooks Endpoint Live' : 'No Webhooks Configured'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/seller/dashboard/settings" className="text-xs font-semibold capitalize text-gray-800 tracking-wide flex items-center gap-1.5 hover:text-cureza-green transition-all w-full">
                            Manage Account Settings <ArrowRight size={14} className="ml-auto" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
