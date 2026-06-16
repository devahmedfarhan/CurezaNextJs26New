'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Store, 
  Activity, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  Plus, 
  AlertCircle,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function SuperAdminDashboardHome() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Failed to fetch admin dashboard statistics', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="flex justify-between items-center mb-2">
                    <div className="h-8 w-64 bg-gray-250 rounded-lg" />
                    <div className="h-10 w-40 bg-gray-250 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-32 bg-gray-200 rounded-3xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-96 lg:col-span-2 bg-gray-200 rounded-3xl" />
                    <div className="h-96 bg-gray-200 rounded-3xl" />
                </div>
            </div>
        );
    }

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

    const recentOrders = dashboardData?.recent_orders || [];
    const recentActivities = dashboardData?.recent_activities || [];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mt-1">Live metrics, system usage and administrative stats.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/superadmin/dashboard/products/create"
                        className="bg-cureza-green hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-150"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        New Product
                    </Link>
                </div>
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-cureza-green">
                        <DollarSign size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                            <DollarSign size={24} />
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 gap-1">
                            <TrendingUp size={12} />
                            Active
                        </span>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Sales Revenue</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{parseFloat(stats.total_revenue).toLocaleString('en-IN')}</h3>
                        <p className="text-xs font-semibold text-gray-550 flex items-center gap-1">
                            <span className="text-emerald-600 font-extrabold">₹{parseFloat(stats.today_revenue).toLocaleString('en-IN')}</span> today
                        </p>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-blue-600">
                        <ShoppingBag size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                            <ShoppingBag size={24} />
                        </div>
                        <Link href="/superadmin/dashboard/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Orders Placed</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_orders}</h3>
                        <p className="text-xs font-semibold text-gray-550 flex items-center gap-1">
                            <span className="text-blue-600 font-extrabold">{stats.today_orders}</span> new orders today
                        </p>
                    </div>
                </div>

                {/* Sellers Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-amber-600">
                        <Store size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                            <Store size={24} />
                        </div>
                        <Link href="/superadmin/dashboard/users/sellers" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Registered Sellers</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_sellers}</h3>
                        <p className="text-xs font-semibold text-gray-550 flex items-center gap-1.5">
                            <span className="text-emerald-600 font-extrabold">{stats.active_sellers} verified</span>
                            <span>•</span>
                            <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                                <Clock size={10} />
                                {stats.pending_approvals} pending
                            </span>
                        </p>
                    </div>
                </div>

                {/* Doctors & Users Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-purple-600">
                        <Users size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                            <Users size={24} />
                        </div>
                        <Link href="/superadmin/dashboard/users/customers" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Doctors & Customers</p>
                        <h3 className="text-2xl font-black text-gray-900">
                            {stats.total_users + stats.total_doctors}
                        </h3>
                        <p className="text-xs font-semibold text-gray-550 flex items-center gap-1.5">
                            <span className="text-purple-600 font-extrabold">{stats.total_doctors} Doctors</span>
                            <span>•</span>
                            <span className="text-gray-700 font-extrabold">{stats.total_users} Customers</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Navigation Panels / Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Orders List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Recent Orders</h2>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Latest sales activity across the shop</p>
                        </div>
                        <Link 
                            href="/superadmin/dashboard/orders" 
                            className="text-cureza-green hover:underline text-xs font-extrabold uppercase tracking-wider flex items-center gap-1"
                        >
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    <th className="py-3">Order ID</th>
                                    <th className="py-3">Customer</th>
                                    <th className="py-3">Amount</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-xs font-semibold text-gray-400">
                                            No recent orders found
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5 font-bold text-gray-900">
                                                #{order.id}
                                            </td>
                                            <td className="py-3.5">
                                                <div className="font-semibold text-gray-800">{order.user?.name || 'Guest User'}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{order.user?.email}</div>
                                            </td>
                                            <td className="py-3.5 font-extrabold text-gray-900">
                                                ₹{parseFloat(order.final_amount).toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3.5">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border
                                                    ${order.payment_status === 'paid' 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                    {order.payment_status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 text-right text-xs font-semibold text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity Logs */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Recent Activity</h2>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Audit logs of latest admin actions</p>
                        </div>
                        <Activity size={18} className="text-gray-400" />
                    </div>

                    <div className="space-y-4">
                        {recentActivities.length === 0 ? (
                            <div className="py-8 text-center text-xs font-semibold text-gray-400">
                                No recent activities logged
                            </div>
                        ) : (
                            recentActivities.map((activity: any) => (
                                <div key={activity.id} className="flex gap-3 items-start text-xs">
                                    <div className="p-2 bg-gray-50 border border-gray-100 text-gray-500 rounded-xl mt-0.5">
                                        <Activity size={12} />
                                    </div>
                                    <div className="space-y-0.5 flex-1">
                                        <p className="text-gray-800 font-semibold leading-relaxed">
                                            <strong className="text-gray-950 font-bold">{activity.user?.name || 'System'}</strong> {activity.description}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(activity.created_at).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                              ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Admin Actions Grid */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Administrative Shortcuts</h2>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Direct navigation to major submenus</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Link href="/superadmin/dashboard/products" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-cureza-green/20 hover:bg-green-50/10 transition-all text-center space-y-2 group">
                        <div className="p-3 bg-green-50 text-cureza-green rounded-xl group-hover:scale-105 transition-transform">
                            <ShoppingBag size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">Catalog & Products</span>
                    </Link>

                    <Link href="/superadmin/dashboard/users/sellers" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-cureza-green/20 hover:bg-green-50/10 transition-all text-center space-y-2 group">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                            <Store size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">Sellers Directory</span>
                    </Link>

                    <Link href="/superadmin/dashboard/users/doctors" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-cureza-green/20 hover:bg-green-50/10 transition-all text-center space-y-2 group">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">Doctors Directory</span>
                    </Link>

                    <Link href="/superadmin/dashboard/support" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-cureza-green/20 hover:bg-green-50/10 transition-all text-center space-y-2 group">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
                            <AlertCircle size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">Support Tickets</span>
                    </Link>

                    <Link href="/superadmin/dashboard/cms" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-cureza-green/20 hover:bg-green-50/10 transition-all text-center space-y-2 group">
                        <div className="p-3 bg-purple-50 text-purple-650 rounded-xl group-hover:scale-105 transition-transform">
                            <FileText size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">Banners & Pages</span>
                    </Link>

                    <Link href="/superadmin/dashboard/settings" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 hover:border-cureza-green/20 hover:bg-green-50/10 transition-all text-center space-y-2 group">
                        <div className="p-3 bg-gray-50 text-gray-650 rounded-xl group-hover:scale-105 transition-transform">
                            <Clock size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">System Logs & settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
