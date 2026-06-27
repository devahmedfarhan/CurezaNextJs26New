'use client';

import { useState, useEffect } from 'react';
import { 
    BarChart2, TrendingUp, Users, ShoppingCart, Sparkles, Sliders, AlertTriangle, 
    Play, RefreshCw, Info, PieChart, Layers, CheckCircle, Package, ArrowRight, TrendingDown, HelpCircle,
    DollarSign, Target, Calculator, Percent
} from 'lucide-react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as ChartTooltip, 
    PieChart as RechartsPieChart, 
    Pie, 
    Cell, 
    Legend 
} from 'recharts';
import { SellerDashboardService, DashboardSummary, SalesDataPoint, TopProduct } from '@/services/seller-dashboard';
import { useAuth } from '@/context/AuthContext';

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

const MOCK_PRODUCTS: TopProduct[] = [
    { product_id: 1, product_name: 'Organic Ashwagandha Pro Ext', units_sold: 45, revenue: 67500, stock_left: 15, image: null },
    { product_id: 2, product_name: 'Neem & Turmeric Skin Shield', units_sold: 32, revenue: 38400, stock_left: 8, image: null },
    { product_id: 3, product_name: 'Triphala Vitality Capsules', units_sold: 28, revenue: 26600, stock_left: 45, image: null }
];

const MOCK_ORDER_STATUS = {
    'Delivered': 98,
    'Processing': 24,
    'Shipped': 20,
    'Cancelled': 14
};

export default function SellerAnalyticsPage() {
    const { user } = useAuth();
    const [range, setRange] = useState('30_days');
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // States for data
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [orderStatus, setOrderStatus] = useState<Record<string, number>>({});

    // Sliders & Simulation parameters
    const [forecastGrowth, setForecastGrowth] = useState(15); // in %
    const [forecastCodRatio, setForecastCodRatio] = useState(40); // % of COD orders
    
    // Tool 2: Pricing & ROI Optimizer states
    const [simCostPrice, setSimCostPrice] = useState('450');
    const [simSellingPrice, setSimSellingPrice] = useState('999');
    const [simDiscount, setSimDiscount] = useState('10'); // % discount

    // Tool 4: Payout Goal Planner states
    const [simTargetPayout, setSimTargetPayout] = useState('50000');

    // Active tool tab
    const [activeTool, setActiveTool] = useState<'forecaster' | 'pricing' | 'inventory' | 'planner'>('forecaster');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        loadData();
    }, [range]);

    useEffect(() => {
        if (summary) {
            if (summary.cod_ratio !== undefined) {
                setForecastCodRatio(Math.round(summary.cod_ratio));
            }
        }
    }, [summary]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [summaryRes, salesRes, productsRes, statusRes] = await Promise.all([
                SellerDashboardService.getSummary(range),
                SellerDashboardService.getSalesGraph(range),
                SellerDashboardService.getTopProducts(range),
                SellerDashboardService.getOrderStatus()
            ]);

            setSummary(summaryRes);
            setSalesData(salesRes);
            setTopProducts(productsRes);
            
            // Format order status object
            const formattedStatus: Record<string, number> = {};
            if (statusRes) {
                Object.keys(statusRes).forEach(k => {
                    const formattedKey = k.charAt(0).toUpperCase() + k.slice(1);
                    formattedStatus[formattedKey] = Number(statusRes[k]);
                });
            }
            setOrderStatus(Object.keys(formattedStatus).length ? formattedStatus : MOCK_ORDER_STATUS);
        } catch (err) {
            console.warn('Fallback to mock data in Analytics Page');
            setSummary(MOCK_SUMMARY);
            setSalesData(MOCK_SALES);
            setTopProducts(MOCK_PRODUCTS);
            setOrderStatus(MOCK_ORDER_STATUS);
        } finally {
            setLoading(false);
        }
    };

    // Forecaster Calculations
    const baseRevenue = summary?.revenue?.gross ?? 0;
    const projectedGross = baseRevenue * (1 + forecastGrowth / 100);
    const platRate = summary?.commission_rate?.platform ?? 25; // platform active rate
    const gateRate = summary?.commission_rate?.gateway ?? 2.5; // gateway active rate

    const projectedPlatformComm = projectedGross * (platRate / 100);
    const prepaidPortion = projectedGross * (1 - forecastCodRatio / 100);
    const projectedGatewayFee = prepaidPortion * (gateRate / 100);
    
    // Tax split on projected (TCS is 1% of GST-exclusive base; TDS is 1% of gross total)
    const projectedGst = projectedPlatformComm * 0.18;
    const projectedTcs = (projectedGross / 1.18) * 0.01;
    const projectedTds = projectedGross * 0.01;
    
    const projectedNetEarnings = Math.max(0, projectedGross - projectedPlatformComm - projectedGatewayFee - projectedGst - projectedTcs - projectedTds);

    const daysCount = range === '7_days' ? 7 : range === '30_days' ? 30 : 90;

    // Pricing & ROI Calculations
    const costPriceVal = Number(simCostPrice) || 0;
    const originalPriceVal = Number(simSellingPrice) || 0;
    const discountPct = Number(simDiscount) || 0;
    const discountAmt = originalPriceVal * (discountPct / 100);
    const simulatedSalePrice = Math.max(0, originalPriceVal - discountAmt);

    const simComm = simulatedSalePrice * (platRate / 100);
    const simGst = simComm * 0.18;
    const simTcs = (simulatedSalePrice / 1.18) * 0.01;
    const simTds = simulatedSalePrice * 0.01;
    // assume average gateway fee based on cod ratio
    const simGate = simulatedSalePrice * (1 - forecastCodRatio / 100) * (gateRate / 100);
    
    const simNetEarnings = Math.max(0, simulatedSalePrice - simComm - simGst - simTcs - simTds - simGate);
    const simProfit = Math.max(-costPriceVal, simNetEarnings - costPriceVal);
    const simMargin = simulatedSalePrice > 0 ? (simProfit / simulatedSalePrice) * 100 : 0;
    const simRoi = costPriceVal > 0 ? (simProfit / costPriceVal) * 100 : 0;
    
    // Break-even price calculator (solve where NetEarnings = CostPrice)
    const retentionRatio = 1 - (platRate / 100) - ((platRate / 100) * 0.18) - (0.01 / 1.18) - 0.01 - ((1 - forecastCodRatio / 100) * (gateRate / 100));
    const breakEvenPrice = retentionRatio > 0 ? (costPriceVal / retentionRatio) : 0;

    // Goal Planner Calculations
    const targetPayoutVal = Number(simTargetPayout) || 50000;
    const requiredGrossSales = retentionRatio > 0 ? (targetPayoutVal / retentionRatio) : 0;
    const avgOrderVal = summary?.avg_order_value?.value ?? 0;
    const requiredOrders = avgOrderVal > 0 ? Math.ceil(requiredGrossSales / avgOrderVal) : 0;
    const requiredCommission = requiredGrossSales * (platRate / 100);

    // Pie chart formatting
    const pieData = Object.keys(orderStatus).map(key => ({
        name: key,
        value: orderStatus[key]
    }));

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <div className="w-8 h-8 border-[0.5px] border-[#052326] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400 font-medium">Loading intelligence console...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Intelligence & Insights</h1>
                    <p className="text-gray-500 mt-2 text-xs sm:text-sm font-medium italic border-l-[0.5px] border-[#052326] pl-4 sm:pl-5 leading-relaxed">
                        Granular analysis of marketplace performance, commission logic, and forecasting node matrices.
                    </p>
                </div>
                
                <div className="relative w-full lg:w-auto">
                    <select 
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="w-full lg:w-auto bg-white border-[0.5px] border-black/50 rounded-2xl px-10 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-widest shadow-none focus:outline-none focus:ring-4 focus:ring-[#052326]/10 focus:border-[#052326] transition-all cursor-pointer appearance-none outline-none"
                    >
                        <option value="7_days">7 Days Audit Focus</option>
                        <option value="30_days">30 Days Audit Focus</option>
                        <option value="90_days">90 Days Audit Focus</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <TrendingUp size={16} />
                    </div>
                </div>
            </div>

            {/* Top Stat Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: 'Gross Sales Volume', value: `₹${(summary?.revenue?.gross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', trend: `+${(summary?.sales?.change || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`, sub: 'Sales pipeline gross' },
                    { label: 'Active Pipeline Nodes', value: `${summary?.orders?.value || 0} Orders`, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', trend: `+${summary?.orders?.change || 0}%`, sub: 'Fulfillment operations' },
                    { label: 'Net Wallet Balance', value: `₹${(summary?.revenue?.net || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', trend: 'Cleared', sub: 'Ready for withdrawal' },
                    { label: 'Conversion Yield', value: `${(summary?.conversion_yield?.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`, icon: BarChart2, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', trend: summary?.conversion_yield?.trend || 'Healthy', sub: summary?.conversion_yield?.sub || 'Calculated index rate' },
                ].map((stat) => (
                    <div key={stat.label} className="premium-card p-5 sm:p-8 group relative overflow-hidden bg-white border-[0.5px] border-black/50 shadow-none rounded-3xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
                        <div className="relative">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 sm:p-4 rounded-[1.25rem] ${stat.bg} ${stat.color} shadow-inner border-[0.5px] group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <span className="text-[9px] font-black px-3 py-1 rounded-xl shadow-none border-[0.5px] bg-emerald-50 text-emerald-600 border-black/50">
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 tracking-tighter">{stat.value}</h3>
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 opacity-60">{stat.label}</p>
                            <div className="h-1 w-12 bg-gray-100 rounded-full group-hover:bg-[#052326] group-hover:w-full transition-all duration-700"></div>
                            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-tight">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphs Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Sales trajectory */}
                <div className="premium-card p-8 bg-white border-[0.5px] border-black/50 rounded-3xl shadow-none flex flex-col group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-black text-xl text-gray-900 tracking-tighter">Strategic Sales Trajectory</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">Temporal Revenue Mapping</p>
                        </div>
                        <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border-[0.5px] border-black/50 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-[#052326]"></span> Live Stream
                        </span>
                    </div>

                    <div className="flex-1 min-h-[280px] w-full">
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSalesAnalytics" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#052326" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#052326" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                                        tickFormatter={(value) => {
                                            try {
                                                const date = new Date(value);
                                                return isNaN(date.getTime()) ? value : `${date.getDate()}/${date.getMonth() + 1}`;
                                            } catch {
                                                return value;
                                            }
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                                    />
                                    <ChartTooltip
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                                        formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Sales Volume']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total_sales"
                                        stroke="#052326"
                                        fillOpacity={1}
                                        fill="url(#colorSalesAnalytics)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-gray-400 text-xs">Assembling visual trajectory...</div>
                        )}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="premium-card p-8 bg-white border-[0.5px] border-black/50 rounded-3xl shadow-none flex flex-col group">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-black text-xl text-gray-900 tracking-tighter">Order Status Summary</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">Check your orders progress at a glance</p>
                        </div>
                        <span className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border-[0.5px] border-black/50 text-[9px] font-black uppercase tracking-widest text-indigo-600">
                            Status Overview
                        </span>
                    </div>

                    <div className="flex-1 min-h-[280px] w-full flex items-center justify-center">
                        {isMounted ? (
                            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="w-[180px] h-[180px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip formatter={(value: any) => [`${value} Orders`]} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-3 shrink-0 pr-4">
                                    {(() => {
                                        const totalOrdersCount = pieData.reduce((acc, curr) => acc + curr.value, 0);
                                        return pieData.map((entry, index) => {
                                            const pct = totalOrdersCount > 0 ? ((entry.value / totalOrdersCount) * 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                                            return (
                                                <div key={entry.name} className="flex items-center gap-3 text-xs font-bold text-gray-700">
                                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-black min-w-[80px]">{entry.name}</span>
                                                    <span className="text-gray-900 font-extrabold">{entry.value} Orders ({pct}%)</span>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-gray-400 text-xs">Loading order status summary...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Interactive Seller Tools Console */}
            <div className="premium-card bg-white border-[0.5px] border-black/50 rounded-3xl shadow-none overflow-hidden">
                <div className="p-4 sm:p-8 bg-gray-50 border-b-[0.5px] border-black/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="text-[#052326] shrink-0" />
                                        <div>
                                            <h3 className="font-black text-lg sm:text-xl text-gray-900 tracking-tighter">Seller Account Tools & Simulators</h3>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Interactive pricing, Restock Runways, Payout Goals, and Strategic projections</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex overflow-x-auto border-[0.5px] border-black/50 rounded-2xl bg-white p-1 gap-1 w-full xl:w-auto scrollbar-none">
                                        <button 
                                            onClick={() => setActiveTool('forecaster')}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                                                activeTool === 'forecaster' ? 'bg-[#101828] text-white shadow-none hover:bg-[#052326] hover:text-[#101828] border-black/50 border-[0.5px]' : 'text-gray-500 hover:text-[#101828]'
                                            }`}
                                        >
                                            <TrendingUp size={12} className="inline mr-1" /> Revenue Forecaster
                                        </button>
                                        <button 
                                            onClick={() => setActiveTool('pricing')}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                                                activeTool === 'pricing' ? 'bg-[#101828] text-white shadow-none hover:bg-[#052326] hover:text-[#101828] border-black/50 border-[0.5px]' : 'text-gray-500 hover:text-[#101828]'
                                            }`}
                                        >
                                            <Calculator size={12} className="inline mr-1" /> Pricing & ROI Optimizer
                                        </button>
                                        <button 
                                            onClick={() => setActiveTool('inventory')}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                                                activeTool === 'inventory' ? 'bg-[#101828] text-white shadow-none hover:bg-[#052326] hover:text-[#101828] border-black/50 border-[0.5px]' : 'text-gray-500 hover:text-[#101828]'
                                            }`}
                                        >
                                            <Package size={12} className="inline mr-1" /> Restock Runway Analyst
                                        </button>
                                        <button 
                                            onClick={() => setActiveTool('planner')}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                                                activeTool === 'planner' ? 'bg-[#101828] text-white shadow-none hover:bg-[#052326] hover:text-[#101828] border-black/50 border-[0.5px]' : 'text-gray-500 hover:text-[#101828]'
                                            }`}
                                        >
                            <Target size={12} className="inline mr-1" /> Payout Goal Planner
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-8">
                    {/* Tool 1: Revenue Forecaster */}
                    {activeTool === 'forecaster' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Sliders panel */}
                            <div className="space-y-6 lg:col-span-1 p-4 sm:p-6 bg-gray-50 rounded-2xl border-[0.5px] border-black/50">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b-[0.5px] border-black/50 pb-3">Projection Parameters</h4>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-black text-gray-600">
                                        <span>Target Growth Rate</span>
                                        <span className="text-[#052326]">+{forecastGrowth}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="-50" 
                                        max="100" 
                                        value={forecastGrowth}
                                        onChange={(e) => setForecastGrowth(Number(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#052326]" 
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase">
                                        <span>-50% Decline</span>
                                        <span>+100% Surge</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between items-center text-xs font-black text-gray-600">
                                        <span>COD Payment Ratio</span>
                                        <span className="text-indigo-600">{forecastCodRatio}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={forecastCodRatio}
                                        onChange={(e) => setForecastCodRatio(Number(e.target.value))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                    />
                                    <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase">
                                        <span>0% Prepaid Only</span>
                                        <span>100% COD Only</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-xl border-[0.5px] border-black/50 text-[9px] font-semibold text-emerald-800 flex gap-2">
                                    <Info size={14} className="shrink-0 text-[#052326] mt-0.5" />
                                    <p>Increasing your Prepaid Mix decreases COD logistic management, but online payment processors charge a standard 2.50% Gateway Fee.</p>
                                </div>
                            </div>

                            {/* Projections Output Panel */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Projected Gross Volume</span>
                                        <h3 className="text-xl font-black text-gray-900">₹{projectedGross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Based on ₹{baseRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} base</p>
                                    </div>

                                    <div className="p-5 bg-emerald-50/20 border-[0.5px] border-black/50 rounded-2xl shadow-none">
                                        <span className="text-[8px] font-black text-[#052326] uppercase tracking-widest block mb-1">Projected Net Payout (Actual Yield)</span>
                                        <h3 className="text-xl font-black text-[#052326]">₹{projectedNetEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-[8px] font-bold text-emerald-600 mt-1 uppercase">Approx {projectedGross > 0 ? ((projectedNetEarnings / projectedGross) * 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}% retention rate</p>
                                    </div>
                                </div>

                                <div className="p-6 border-[0.5px] border-black/50 rounded-2xl space-y-3">
                                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b-[0.5px] border-black/50 pb-2">Deductions Breakdown Simulator</h5>
                                    
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Platform Commission ({platRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</span>
                                        <span>-₹{projectedPlatformComm.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>GST on Commission (18%)</span>
                                        <span>-₹{projectedGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>TCS Levy (1%)</span>
                                        <span>-₹{projectedTcs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>TDS Levy (1%)</span>
                                        <span>-₹{projectedTds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Gateway Fee ({gateRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% on {(100 - forecastCodRatio).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% prepaid)</span>
                                        <span>-₹{projectedGatewayFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="border-t-[0.5px] border-black/50 pt-3 flex justify-between items-center text-sm font-black text-gray-900">
                                        <span>Total Estimated Deductions</span>
                                        <span className="text-rose-600">₹{(projectedGross - projectedNetEarnings).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tool 2: Pricing & ROI Optimizer */}
                    {activeTool === 'pricing' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                            {/* Inputs Panel */}
                            <div className="space-y-4 lg:col-span-1 p-4 sm:p-6 bg-gray-50 rounded-2xl border-[0.5px] border-black/50">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b-[0.5px] border-black/50 pb-3 mb-2">Cost & Pricing Parameters</h4>
                                
                                <div className="space-y-1">
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">Source / Cost Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                        <input 
                                            type="number" 
                                            value={simCostPrice}
                                            onChange={(e) => setSimCostPrice(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2.5 bg-white border-[0.5px] border-black/50 rounded-xl text-xs font-bold focus:ring-4 focus:ring-[#052326]/10 focus:border-[#052326] outline-none"
                                            placeholder="Cost price"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">Gross Selling Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                                        <input 
                                            type="number" 
                                            value={simSellingPrice}
                                            onChange={(e) => setSimSellingPrice(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2.5 bg-white border-[0.5px] border-black/50 rounded-xl text-xs font-bold focus:ring-4 focus:ring-[#052326]/10 focus:border-[#052326] outline-none"
                                            placeholder="List price"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[8px] font-black text-gray-400 uppercase px-1">
                                        <span>Customer Discount (%)</span>
                                        <span className="text-red-500 font-extrabold">{simDiscount}% Off</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="70" 
                                        value={simDiscount}
                                        onChange={(e) => setSimDiscount(e.target.value)}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" 
                                    />
                                    <div className="flex justify-between text-[7px] font-black text-gray-400 uppercase">
                                        <span>0% Full Price</span>
                                        <span>70% Clearout</span>
                                    </div>
                                </div>
                            </div>

                            {/* ROI Outputs Panel */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Simulated Sale Price</span>
                                        <h3 className="text-xl font-black text-gray-900">₹{simulatedSalePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-[8px] font-bold text-red-500 mt-1 uppercase">Saved ₹{discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for client</p>
                                    </div>

                                    <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Simulated Net Profit</span>
                                        <h3 className={`text-xl font-black ${simProfit >= 0 ? 'text-[#052326]' : 'text-red-600'}`}>
                                            {simProfit >= 0 ? '' : '-'}₹{Math.abs(simProfit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h3>
                                        <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">ROI: <span className={simRoi >= 0 ? 'text-[#052326] font-extrabold' : 'text-red-500 font-extrabold'}>{simRoi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span></p>
                                    </div>

                                    <div className="p-5 bg-indigo-50/10 border-[0.5px] border-black/50 rounded-2xl shadow-none">
                                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Calculated Break-Even</span>
                                        <h3 className="text-xl font-black text-indigo-900">₹{breakEvenPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-[8px] font-bold text-indigo-500 mt-1 uppercase">Min Selling Price to cover costs</p>
                                    </div>
                                </div>

                                <div className="p-6 border-[0.5px] border-black/50 rounded-2xl space-y-2">
                                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b-[0.5px] border-gray-55 pb-2">Single Order Retention Breakdowns</h5>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Product Cost Price</span>
                                        <span>₹{costPriceVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Platform Commission & GST</span>
                                        <span className="text-red-500">-₹{(simComm + simGst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Compliance Taxes (TCS + TDS)</span>
                                        <span className="text-red-500">-₹{(simTcs + simTds).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Gateway Fee (Weighted)</span>
                                        <span className="text-red-500">-₹{simGate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="border-t-[0.5px] border-black/50 pt-2 flex justify-between items-center text-xs font-black text-gray-900">
                                        <span>Net Disbursable Order Value</span>
                                        <span className="text-[#052326]">₹{simNetEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tool 3: Restock Runway Analyst */}
                    {activeTool === 'inventory' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest border-b-[0.5px] border-black/50 pb-3">Stock Exhaustion and Velocity Matrix</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {topProducts.map((prod) => {
                                    const units = prod.units_sold || 1;
                                    const velocity = units / daysCount; // units sold per day
                                    const stock = prod.stock_left || 0;
                                    const runwayDays = velocity > 0 ? Math.ceil(stock / velocity) : 999;
                                    
                                    let statusText = 'Healthy Stock';
                                    let badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                                    if (runwayDays < 10) {
                                        statusText = 'Critical Refill';
                                        badgeColor = 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse';
                                    } else if (runwayDays < 20) {
                                        statusText = 'Low Runway';
                                        badgeColor = 'bg-amber-50 text-amber-600 border-amber-100';
                                    }

                                    return (
                                        <div key={prod.product_id} className="p-5 border-[0.5px] border-black/50 rounded-2xl space-y-4 hover:border-gray-300 transition-all bg-white">
                                            <div className="flex justify-between items-start gap-2">
                                                <h5 className="font-extrabold text-xs text-gray-900 truncate max-w-[70%]" title={prod.product_name}>{prod.product_name}</h5>
                                                <span className={`px-2 py-0.5 rounded-xl text-[8px] font-black uppercase tracking-wider border-[0.5px] shrink-0 ${badgeColor}`}>
                                                    {statusText}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-gray-500">
                                                <div className="p-3 bg-gray-50 rounded-xl">
                                                    <span className="block text-[8px] text-gray-400 uppercase tracking-widest mb-1">Velocity</span>
                                                    <span className="text-gray-900 font-black">{velocity.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} units/day</span>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-xl">
                                                    <span className="block text-[8px] text-gray-400 uppercase tracking-widest mb-1">Stock Left</span>
                                                    <span className="text-gray-900 font-black">{stock} units</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase">
                                                    <span>Stock Runway</span>
                                                    <span className="text-gray-900 font-extrabold">{runwayDays === 999 ? 'Infinite' : `${runwayDays} Days left`}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${
                                                            runwayDays < 10 ? 'bg-rose-500' : runwayDays < 20 ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                        style={{ width: `${Math.min(100, Math.max(5, runwayDays * 2))}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tool 4: Payout Goal Planner */}
                    {activeTool === 'planner' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                            {/* Target Payout Inputs */}
                            <div className="space-y-4 lg:col-span-1 p-4 sm:p-6 bg-gray-50 rounded-2xl border-[0.5px] border-black/50">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b-[0.5px] border-black/50 pb-3 mb-2">Payout Targets</h4>
                                
                                <div className="space-y-2">
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">Desired Monthly Net Payout (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">₹</span>
                                        <input 
                                            type="number" 
                                            value={simTargetPayout}
                                            onChange={(e) => setSimTargetPayout(e.target.value)}
                                            className="w-full pl-8 pr-4 py-2.5 bg-white border-[0.5px] border-black/50 rounded-xl text-xs font-bold focus:ring-4 focus:ring-[#052326]/10 focus:border-[#052326] outline-none"
                                            placeholder="Target payout"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-indigo-50/50 rounded-xl border-[0.5px] border-black/50 text-[9.5px] font-medium text-indigo-700 space-y-1">
                                    <p className="font-extrabold uppercase text-[8px] tracking-wider">Parameters Used:</p>
                                    <p>• Platform Cut: {platRate}% (+18% GST)</p>
                                    <p>• Gateway Charge: {gateRate}% on Prepaid</p>
                                    <p>• Prepaid vs COD mix: {100 - forecastCodRatio}% / {forecastCodRatio}%</p>
                                           {/* Planner Outputs Panel */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Target Net Payout</span>
                                        <h3 className="text-xl font-black text-emerald-600">₹{targetPayoutVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Your Monthly Bank Payout Goal</p>
                                    </div>

                                    <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Required Gross Sales</span>
                                        <h3 className="text-xl font-black text-gray-900">₹{requiredGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                        <p className="text-[8px] font-bold text-indigo-500 mt-1 uppercase">Sales target to hit payout</p>
                                    </div>

                                    <div className="p-5 bg-white border-[0.5px] border-black/50 rounded-2xl shadow-none">
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Estimated Orders Count</span>
                                        <h3 className="text-xl font-black text-gray-900">{requiredOrders} Orders</h3>
                                        <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Based on ₹{avgOrderVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Average Order Value</p>
                                    </div>
                                </div>

                                <div className="p-6 border-[0.5px] border-black/50 rounded-2xl space-y-3">
                                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b-[0.5px] border-black/50 pb-2">Target Revenue Structure Projection</h5>
                                    
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Required Gross Revenue</span>
                                        <span>₹{requiredGrossSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Estimated Platform Commission</span>
                                        <span className="text-rose-600">-₹{requiredCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span>Estimated Taxes & Gateway Fees</span>
                                        <span className="text-rose-600">-₹{(requiredGrossSales - targetPayoutVal - requiredCommission).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="border-t-[0.5px] border-black/50 pt-3 flex justify-between items-center text-sm font-black text-gray-900">
                                        <span>Estimated Take-Home (Net Payout)</span>
                                        <span className="text-[#052326]">₹{targetPayoutVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>                             </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* High velocity table */}
            <div className="premium-card overflow-hidden bg-white border-[0.5px] border-black/50 rounded-3xl shadow-none">
                <div className="p-4 sm:p-8 border-b-[0.5px] border-black/50 flex justify-between items-center bg-gray-50/20">
                    <div>
                        <h3 className="font-black text-xl text-gray-900 tracking-tighter">High-Velocity Catalog Nodes</h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-60">Performance Leaderboard Ranking</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="premium-table-header border-b-[0.5px] border-black/50">
                                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[9px] font-black tracking-wider text-gray-500 uppercase">Product Descriptor</th>
                                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[9px] font-black tracking-wider text-gray-500 uppercase text-center">Units Sold</th>
                                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[9px] font-black tracking-wider text-gray-500 uppercase text-right">Net Return Portfolio</th>
                                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[9px] font-black tracking-wider text-gray-500 uppercase text-right">Status Runway</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                            {topProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 sm:px-8 py-10 text-center text-gray-400">No high velocity products found for this audit window.</td>
                                </tr>
                            ) : (
                                topProducts.map((prod, idx) => {
                                    const runway = prod.units_sold > 0 ? Math.ceil(prod.stock_left / (prod.units_sold / daysCount)) : 999;
                                    return (
                                        <tr key={prod.product_id} className="group hover:bg-gray-50/30 transition-all">
                                            <td className="px-4 sm:px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-[10px] border-[0.5px] border-black/50 group-hover:bg-white group-hover:shadow-md transition-all">
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <h4 className="font-black text-gray-950 group-hover:text-[#052326] transition-colors text-sm">{prod.product_name}</h4>
                                                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">Rank #{idx + 1} Node</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-8 py-4 text-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-gray-50 text-gray-900 font-extrabold border-[0.5px] border-black/50 shadow-inner">
                                                    {prod.units_sold} Units
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-8 py-4 text-right">
                                                <p className="font-black text-gray-950 text-base">₹{Number(prod.revenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Success Injected</span>
                                            </td>
                                            <td className="px-4 sm:px-8 py-4 text-right">
                                                <span className={`px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase border-[0.5px] tracking-wider ${
                                                    runway < 10 ? 'bg-rose-50 text-rose-600 border-black/50' :
                                                    runway < 20 ? 'bg-amber-50 text-amber-600 border-black/50' :
                                                    'bg-emerald-50 text-emerald-600 border-black/50'
                                                }`}>
                                                    {runway === 999 ? 'Infinite Runway' : `${runway} Days Runway`}
                                                </span>
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
    );
}
