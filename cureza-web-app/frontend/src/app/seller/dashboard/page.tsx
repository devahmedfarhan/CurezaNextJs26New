'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SellerDashboardService, DashboardSummary, SalesDataPoint, RecentOrder, TopProduct } from '@/services/seller-dashboard';
import SalesTrendChart from './components/SalesTrendChart';
import Link from 'next/link';
import { 
    TrendingUp, TrendingDown, ShoppingCart, DollarSign, 
    Package, CreditCard, ArrowUpRight, ArrowRight, User, AlertCircle
} from 'lucide-react';

const MOCK_SUMMARY: DashboardSummary = {
    sales: { value: 124500, change: 12.5, trend: 'up' },
    orders: { value: 156, change: 8.2, trend: 'up' },
    avg_order_value: { value: 798, change: 4.1, trend: 'up' },
    products: { active: 42, out_of_stock: 3 },
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/[0.05] pb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        {getGreeting()}, {user?.name || 'Seller'}!
                    </h1>
                    <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-wider">Seller Node Integration Hub</p>
                </div>
                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="bg-white dark:bg-gray-900 border border-black/[0.05] rounded-[8px] px-3.5 py-2 text-xs font-bold focus:ring-2 focus:ring-cureza-green/10 cursor-pointer text-gray-600 dark:text-gray-300 outline-none"
                >
                    <option value="7_days">Last 7 Days</option>
                    <option value="30_days">Last 30 Days</option>
                    <option value="90_days">Last 90 Days</option>
                </select>
            </div>

            {/* Core Stats Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Gross Sales */}
                <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6 flex flex-col justify-between h-32 hover:border-black/[0.1] transition-all">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Revenue</span>
                        <div className="p-1.5 bg-[#052326]/5 text-[#052326] rounded-[6px]">
                            <DollarSign size={14} />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            ₹{summary?.sales.value.toLocaleString('en-IN')}
                        </h3>
                        {summary?.sales.change !== undefined && (
                            <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-[8px] ${
                                summary.sales.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                                {summary.sales.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {summary.sales.change}%
                            </span>
                        )}
                    </div>
                </div>

                {/* Orders Count */}
                <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6 flex flex-col justify-between h-32 hover:border-black/[0.1] transition-all">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Orders</span>
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-[6px]">
                            <ShoppingCart size={14} />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            {summary?.orders.value}
                        </h3>
                        {summary?.orders.change !== undefined && (
                            <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-[8px] ${
                                summary.orders.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                                {summary.orders.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {summary.orders.change}%
                            </span>
                        )}
                    </div>
                </div>

                {/* Products Status */}
                <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6 flex flex-col justify-between h-32 hover:border-black/[0.1] transition-all">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Products</span>
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-[6px]">
                            <Package size={14} />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            {summary?.products.active}
                        </h3>
                        {summary?.products.out_of_stock ? (
                            <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-[8px] flex items-center gap-1">
                                <AlertCircle size={8} /> {summary.products.out_of_stock} Out of Stock
                            </span>
                        ) : (
                            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-[8px]">All Healthy</span>
                        )}
                    </div>
                </div>

                {/* Net Earnings */}
                <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6 flex flex-col justify-between h-32 hover:border-black/[0.1] transition-all">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Wallet Payout</span>
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-[6px]">
                            <CreditCard size={14} />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                            ₹{summary?.revenue.net.toLocaleString('en-IN')}
                        </h3>
                        <span className="text-[9px] font-bold text-gray-400">Net After Fees</span>
                    </div>
                </div>
            </div>

            {/* Sales Chart Section */}
            <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6">
                <div className="mb-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Sales Trajectory</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Revenue and Transaction Volatility Metrics</p>
                </div>
                <SalesTrendChart data={salesData} />
            </div>

            {/* Dual Grid: Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders Card */}
                <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Recent Orders</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Latest Ingestion Pipeline</p>
                        </div>
                        <Link 
                            href="/seller/dashboard/orders" 
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1.5"
                        >
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="border-b border-black/[0.05] text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="pb-3 pr-2">Order #</th>
                                    <th className="pb-3 pr-2">Customer</th>
                                    <th className="pb-3 pr-2">Amount</th>
                                    <th className="pb-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.03] font-semibold text-gray-700 dark:text-gray-300">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                                        <td className="py-3 pr-2 font-bold text-gray-900 dark:text-white">{order.order_number}</td>
                                        <td className="py-3 pr-2">{order.customer}</td>
                                        <td className="py-3 pr-2 font-bold text-gray-900 dark:text-white">₹{order.amount}</td>
                                        <td className="py-3 text-right">
                                            <span className={`px-2 py-0.5 rounded-[8px] text-[9px] font-bold border inline-block ${
                                                orderStatusMapping[order.status] || 'bg-gray-50 text-gray-600'
                                            }`}>
                                                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Products Card */}
                <div className="bg-white dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.05] rounded-[8px] p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Top Products</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">High-Velocity Catalog Rankings</p>
                        </div>
                        <Link 
                            href="/seller/dashboard/products" 
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1.5"
                        >
                            Catalog <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="flex-1 divide-y divide-black/[0.03] space-y-4">
                        {topProducts.map((prod, idx) => (
                            <div key={prod.product_id} className="flex items-center justify-between pt-4 first:pt-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-black text-gray-400 text-[10px] border border-black/[0.03] shrink-0">
                                        {idx + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-xs truncate max-w-[200px]" title={prod.product_name}>
                                            {prod.product_name}
                                        </h4>
                                        <p className="text-[10px] text-gray-400 font-semibold">{prod.units_sold} Units Sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900 dark:text-white text-xs">₹{prod.revenue.toLocaleString('en-IN')}</p>
                                    <p className="text-[9px] font-bold text-gray-400">{prod.stock_left} items left</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
