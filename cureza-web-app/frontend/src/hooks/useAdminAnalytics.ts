import useSWR from 'swr';
import axios from '@/lib/api';
import { DashboardData, RevenueData, UserGrowthData, TopPerformanceData, SystemHealthData, Payout } from '@/types/admin-analytics';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useAdminAnalytics = () => {
    // Dashboard Overview
    const { data: dashboardStats, error: dashboardError, isLoading: dashboardLoading } = useSWR<DashboardData>('/admin/dashboard', fetcher);

    // Analytics Charts
    const { data: revenueData, error: revenueError, isLoading: revenueLoading } = useSWR<RevenueData[]>('/admin/analytics/revenue', fetcher);
    const { data: userGrowthData, error: userGrowthError, isLoading: userGrowthLoading } = useSWR<UserGrowthData[]>('/admin/analytics/user-growth', fetcher);
    const { data: topSellers, error: topSellersError, isLoading: topSellersLoading } = useSWR<TopPerformanceData>('/admin/analytics/top-performance', fetcher);
    const { data: systemHealth, error: systemHealthError, isLoading: systemHealthLoading } = useSWR<SystemHealthData>('/admin/analytics/system-health', fetcher);

    // Payouts
    const { data: payouts, error: payoutsError, isLoading: payoutsLoading, mutate: mutatePayouts } = useSWR<Payout[]>('/admin/payouts', fetcher);

    const approvePayout = async (id: number, transactionId: string) => {
        await axios.post(`/admin/payouts/${id}/approve`, { transaction_id: transactionId });
        mutatePayouts();
    };

    const rejectPayout = async (id: number, reason: string) => {
        await axios.post(`/admin/payouts/${id}/reject`, { reason });
        mutatePayouts();
    };

    return {
        dashboardStats,
        dashboardError,
        dashboardLoading,
        revenueData,
        revenueError,
        revenueLoading,
        userGrowthData,
        userGrowthError,
        userGrowthLoading,
        topSellers,
        topSellersError,
        topSellersLoading,
        systemHealth,
        systemHealthError,
        systemHealthLoading,
        payouts,
        payoutsError,
        payoutsLoading,
        approvePayout,
        rejectPayout,
    };
};
