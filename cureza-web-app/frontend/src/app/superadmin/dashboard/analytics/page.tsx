'use client';

import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AnalyticsPage() {
    const {
        revenueData, revenueLoading,
        userGrowthData, userGrowthLoading,
        topSellers, topSellersLoading,
        systemHealth, systemHealthLoading
    } = useAdminAnalytics();

    if (revenueLoading || userGrowthLoading) return <div className="p-8">Loading analytics...</div>;

    const formattedRevenueData = revenueData?.map((item) => ({
        name: item.month || item.date || '',
        revenue: parseFloat(item.revenue),
        commission: parseFloat(item.commission)
    })) || [];

    const formattedUserGrowth = userGrowthData?.map((item) => ({
        name: item.date,
        users: item.total
    })) || [];

    const topSellersData = topSellers?.top_sellers?.map((item) => ({
        name: item.name,
        revenue: parseFloat(item.revenue)
    })) || [];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Revenue & Commission Trends</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Total Revenue" />
                            <Line type="monotone" dataKey="commission" stroke="#3B82F6" strokeWidth={2} name="Admin Commission" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">New User Registrations</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedUserGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Sellers */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Top Performing Sellers</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topSellersData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* System Health */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Products</p>
                        <p className="text-2xl font-bold">{systemHealth?.total_products ?? 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Appointments</p>
                        <p className="text-2xl font-bold">{systemHealth?.total_appointments ?? 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <p className="text-2xl font-bold">{systemHealth?.total_orders ?? 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
