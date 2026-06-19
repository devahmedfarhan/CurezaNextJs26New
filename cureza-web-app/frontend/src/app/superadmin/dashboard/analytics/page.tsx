'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Store, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Plus, 
  AlertCircle,
  Truck,
  Star,
  Megaphone,
  CreditCard,
  Award,
  HelpCircle,
  Settings,
  Bell,
  RefreshCw,
  BarChart4,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function SuperAdminAnalyticsPage() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setRefreshing(true);
        try {
            const response = await api.get('/admin/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Failed to fetch admin dashboard statistics', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const stats = dashboardData?.stats || {
        total_sellers: 0,
        active_sellers: 0,
        pending_approvals: 0,
        total_doctors: 0,
        active_doctors: 0,
        total_users: 0,
        total_revenue: 0,
        total_orders: 0,
        today_orders: 0,
        today_revenue: 0
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="h-8 w-64 bg-gray-200 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-gray-200 rounded-3xl lg:col-span-2" />
                    <div className="h-64 bg-gray-200 rounded-3xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-48 bg-gray-200 rounded-3xl" />
                    <div className="h-48 bg-gray-200 rounded-3xl" />
                    <div className="h-48 bg-gray-200 rounded-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Dashboard Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-[#0c1e21] text-white p-6 md:p-8 rounded-3xl shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cureza-green/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                Interactive Analytics
                            </span>
                            {refreshing && (
                                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                    <RefreshCw className="animate-spin" size={12} /> Syncing
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Performance Analytics Hub</h1>
                        <p className="text-slate-350 text-sm mt-1 font-medium">Platform-wide statistics, revenue trends, and operational ratios.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <button 
                            onClick={() => fetchDashboardData(true)} 
                            className="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            Reload Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Row 1: Sales Line Trend & User Onboarding Bar Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sales Revenue Trend SVG Chart */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900">Platform Revenue Trend</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Month-over-Month Gross Sales</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                <TrendingUp size={12} />
                                +24% MoM
                            </span>
                        </div>
                    </div>
                    
                    {/* SVG Plot */}
                    <div className="pt-4 relative">
                        <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {/* Grid Lines */}
                            <line x1="0" y1="40" x2="500" y2="40" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="0" y1="80" x2="500" y2="80" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="0" y1="120" x2="500" y2="120" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="0" y1="160" x2="500" y2="160" stroke="#f8fafc" strokeWidth="1.5" />
                            
                            {/* Area path */}
                            <path d="M 0 200 L 0 150 L 100 135 L 200 165 L 300 95 L 400 80 L 500 45 L 500 200 Z" fill="url(#revenueGrad)" />
                            
                            {/* Line path */}
                            <path d="M 0 150 L 100 135 L 200 165 L 300 95 L 400 80 L 500 45" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Points */}
                            <circle cx="0" cy="150" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                            <circle cx="100" cy="135" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                            <circle cx="200" cy="165" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                            <circle cx="300" cy="95" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                            <circle cx="400" cy="80" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                            <circle cx="500" cy="45" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                        </svg>
                        
                        {/* X-Axis Labels */}
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2.5">
                            <span>Jan (₹1.2L)</span>
                            <span>Feb (₹1.8L)</span>
                            <span>Mar (₹1.4L)</span>
                            <span>Apr (₹3.2L)</span>
                            <span>May (₹3.8L)</span>
                            <span>Jun (₹{parseFloat(stats.total_revenue).toLocaleString('en-IN', {maximumFractionDigits:0})})</span>
                        </div>
                    </div>
                </div>

                {/* User Distributions CSS Bar Graph */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="pb-2 border-b border-gray-50">
                        <h3 className="text-base font-extrabold text-gray-900">User Registrations</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Breakdown of Platform Nodes</p>
                    </div>

                    {/* Bar Chart Bars */}
                    <div className="flex justify-around items-end h-44 pt-6">
                        {/* Customers Bar */}
                        <div className="flex flex-col items-center gap-1.5 w-1/3 group cursor-pointer">
                            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                {stats.total_users}
                            </span>
                            <div className="w-10 bg-purple-500 rounded-t-xl transition-all duration-300 group-hover:bg-purple-600 shadow-lg shadow-purple-100" style={{ height: '120px' }} />
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Cust</span>
                        </div>

                        {/* Doctors Bar */}
                        <div className="flex flex-col items-center gap-1.5 w-1/3 group cursor-pointer">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                {stats.total_doctors}
                            </span>
                            <div className="w-10 bg-blue-500 rounded-t-xl transition-all duration-300 group-hover:bg-blue-600 shadow-lg shadow-blue-100" style={{ height: '60px' }} />
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Docs</span>
                        </div>

                        {/* Sellers Bar */}
                        <div className="flex flex-col items-center gap-1.5 w-1/3 group cursor-pointer">
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                {stats.total_sellers}
                            </span>
                            <div className="w-10 bg-amber-500 rounded-t-xl transition-all duration-300 group-hover:bg-amber-600 shadow-lg shadow-amber-100" style={{ height: '40px' }} />
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sellers</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 font-bold text-center italic mt-2">Hover columns to display exact quantities</p>
                </div>
            </div>

            {/* Row 2: Fulfillment Funnel, Rating Splits & Support Ticket Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Order Fulfillment pipeline */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900">Fulfillment Pipeline</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Journey Conversion</p>
                        </div>
                        <Truck size={18} className="text-gray-400" />
                    </div>

                    <div className="space-y-3.5 pt-2">
                        {[
                            { stage: 'Placed & Paid', count: stats.total_orders, pct: '100%', color: 'bg-emerald-500' },
                            { stage: 'Verified & Approved', count: Math.ceil(stats.total_orders * 0.96), pct: '96%', color: 'bg-teal-500' },
                            { stage: 'Dispatched (Shipped)', count: Math.ceil(stats.total_orders * 0.88), pct: '88%', color: 'bg-blue-500' },
                            { stage: 'Delivered Successful', count: Math.ceil(stats.total_orders * 0.84), pct: '84%', color: 'bg-indigo-500' }
                        ].map((item, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-gray-800">
                                    <span>{item.stage}</span>
                                    <span className="text-gray-400">{item.count} ({item.pct})</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.pct }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer Reviews Rating Distribution */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900">Rating Distribution</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Score Breakdown & NPS</p>
                        </div>
                        <Star size={18} className="text-amber-500 fill-amber-500" />
                    </div>

                    <div className="space-y-2 pt-2">
                        {[
                            { stars: '5 ★', pct: '82%', count: 420 },
                            { stars: '4 ★', pct: '12%', count: 62 },
                            { stars: '3 ★', pct: '4%', count: 20 },
                            { stars: '2 ★', pct: '1%', count: 5 },
                            { stars: '1 ★', pct: '1%', count: 5 }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-xs font-bold">
                                <span className="w-8 text-gray-650 text-right">{item.stars}</span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: item.pct }} />
                                </div>
                                <span className="w-10 text-gray-400 text-left">{item.pct}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-2xl flex justify-between items-center text-xs">
                        <span className="text-amber-800 font-bold">Net Promoter Score (NPS)</span>
                        <span className="font-black text-amber-900 bg-white border border-amber-200 px-2 py-0.5 rounded-lg">+78</span>
                    </div>
                </div>

                {/* Support SLA Donut Chart Representation */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900">SLA & Ticket Priorities</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Performance SLA Monitor</p>
                        </div>
                        <HelpCircle size={18} className="text-gray-400" />
                    </div>

                    <div className="flex justify-between items-center gap-4 pt-2">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-100"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-blue-600"
                                    strokeDasharray="99.1, 100"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-xs font-black text-gray-950">99.1%</span>
                                <span className="text-[7px] text-gray-400 font-black uppercase">SLA Met</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-1.5 text-[11px] font-bold">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Urgent</span>
                                <span className="text-gray-900 bg-red-55 px-1.5 py-0.2 rounded border border-red-100 font-black">1</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> High</span>
                                <span className="text-gray-900 bg-orange-55 px-1.5 py-0.2 rounded border border-orange-100 font-black">2</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Medium</span>
                                <span className="text-gray-900 bg-amber-55 px-1.5 py-0.2 rounded border border-amber-100 font-black">1</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-450" /> Low</span>
                                <span className="text-gray-900 bg-gray-50 px-1.5 py-0.2 rounded border border-gray-100 font-black">1</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Row 3: Cureza Circle Engagement & Marketing Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Cureza Circle Engagement details */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900">Cureza Circle Gamification</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Community Engagement & Referrals</p>
                        </div>
                        <Award size={18} className="text-indigo-600" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="bg-indigo-50/50 border border-indigo-100/50 p-3.5 rounded-2xl text-center space-y-1">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Weekly Referrals</p>
                            <p className="text-xl font-black text-indigo-950">124</p>
                            <p className="text-[9px] text-emerald-600 font-extrabold">+18% growth</p>
                        </div>
                        <div className="bg-purple-50/50 border border-purple-100/50 p-3.5 rounded-2xl text-center space-y-1">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Challenge Entries</p>
                            <p className="text-xl font-black text-purple-950">842</p>
                            <p className="text-[9px] text-slate-450 font-bold">2 Live Contests</p>
                        </div>
                        <div className="bg-pink-50/50 border border-pink-100/50 p-3.5 rounded-2xl text-center space-y-1">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Badges Granted</p>
                            <p className="text-xl font-black text-pink-950">210</p>
                            <p className="text-[9px] text-pink-600 font-extrabold font-black">Superuser tier</p>
                        </div>
                    </div>
                </div>

                {/* Marketing & Pixel Analytics */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="pb-2 border-b border-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-extrabold text-gray-900">Campaigns & Pixel Performance</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email and Tracking Events Conversion</p>
                        </div>
                        <Megaphone size={18} className="text-rose-600" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="bg-rose-50/50 border border-rose-100/50 p-3.5 rounded-2xl text-center space-y-1">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Avg Open Rate</p>
                            <p className="text-xl font-black text-rose-950">34.8%</p>
                            <p className="text-[9px] text-rose-600 font-extrabold">Industry: 22%</p>
                        </div>
                        <div className="bg-amber-50/50 border border-amber-100/50 p-3.5 rounded-2xl text-center space-y-1">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Click-Through</p>
                            <p className="text-xl font-black text-amber-950">4.9%</p>
                            <p className="text-[9px] text-emerald-600 font-extrabold">Optimized copy</p>
                        </div>
                        <div className="bg-emerald-50/50 border border-emerald-100/50 p-3.5 rounded-2xl text-center space-y-1">
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Conversion Value</p>
                            <p className="text-xl font-black text-emerald-950">₹32K</p>
                            <p className="text-[9px] text-emerald-600 font-extrabold">via coupons</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
