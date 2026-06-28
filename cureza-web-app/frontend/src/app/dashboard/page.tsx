'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import { 
    ShoppingBag, 
    Wallet, 
    FileText, 
    Trophy, 
    ChevronRight, 
    ArrowUpRight, 
    Activity, 
    CheckCircle, 
    Calendar,
    ArrowRight,
    Sparkles,
    ShieldAlert
} from 'lucide-react';
import Slider from '@/components/common/Slider';

interface OverviewStats {
    balance: number;
    points: number;
    totalOrders: number;
    approvedPrescriptions: number;
}

export default function DashboardOverviewPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<OverviewStats>({
        balance: 0,
        points: 0,
        totalOrders: 0,
        approvedPrescriptions: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
    const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                // Fetch Wallet
                const walletRes = await api.get('/user/wallet').catch(() => ({ data: { balance: 0, points: 0 } }));
                
                // Fetch Orders
                const ordersRes = await api.get('/orders').catch(() => ({ data: [] }));
                
                // Fetch Prescriptions
                const prescRes = await api.get('/user/prescriptions').catch(() => ({ data: [] }));
                
                // Fetch Challenges
                const challengesRes = await api.get('/user/challenges').catch(() => ({ data: [] }));

                const orders = ordersRes.data || [];
                const prescriptions = prescRes.data || [];
                const challenges = challengesRes.data || [];

                setStats({
                    balance: walletRes.data.balance || 0,
                    points: walletRes.data.points || 0,
                    totalOrders: orders.length,
                    approvedPrescriptions: prescriptions.filter((p: any) => p.diagnosis).length
                });

                setRecentOrders(orders.slice(0, 2));
                setRecentPrescriptions(prescriptions.slice(0, 2));
                setActiveChallenges(challenges.filter((c: any) => c.status === 'in_progress').slice(0, 2));
            } catch (err) {
                console.error('Failed to load overview statistics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOverviewData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#052326]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* WELCOME BANNER CARD */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#052326] to-[#0b4435] text-[#F8F3EF] premium-dashboard-card p-6 md:p-8">
                {/* Decorative Blur Backgrounds */}
                <div className="absolute right-[-10%] top-[-20%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#F0C417] to-transparent opacity-20 blur-[60px] pointer-events-none" />
                <div className="absolute left-[30%] bottom-[-40%] w-[250px] h-[250px] rounded-full bg-gradient-to-tr from-emerald-500 to-transparent opacity-10 blur-[60px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-[#F0C417] mb-4">
                            <Sparkles size={12} /> Cureza Circle Member
                        </div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F8F3EF]">
                            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Wellness Seeker'}!
                        </h1>
                        <p className="text-sm text-[#F8F3EF]/75 mt-2 max-w-xl font-light">
                            Here is a snapshot of your personalized wellness journey, orders, and rewards points for today.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-[8px] p-4 min-w-[200px]">
                        <div className="w-10 h-10 rounded-[8px] bg-[#F0C417]/20 flex items-center justify-center text-[#F0C417]">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider text-[#F8F3EF]/60 font-semibold block">Cureza Points</span>
                            <span className="text-lg font-semibold text-[#F8F3EF]">{stats.points} pts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Wallet Balance */}
                <div className="bg-white dark:bg-gray-900 premium-dashboard-card p-5 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-green-50 dark:bg-green-950/20 text-[#052326] dark:text-green-300 rounded-[8px]">
                            <Wallet size={20} />
                        </div>
                        <Link href="/dashboard/wallet" className="text-xs text-gray-400 hover:text-[#052326] flex items-center gap-0.5 font-medium">
                            Manage <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Wallet Balance</span>
                        <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 block">₹{stats.balance.toFixed(2)}</span>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white dark:bg-gray-900 premium-dashboard-card p-5 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-300 rounded-[8px]">
                            <ShoppingBag size={20} />
                        </div>
                        <Link href="/dashboard/orders" className="text-xs text-gray-400 hover:text-[#052326] flex items-center gap-0.5 font-medium">
                            View all <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Total Orders</span>
                        <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 block">{stats.totalOrders} Orders</span>
                    </div>
                </div>

                {/* Prescriptions */}
                <div className="bg-white dark:bg-gray-900 premium-dashboard-card p-5 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-300 rounded-[8px]">
                            <FileText size={20} />
                        </div>
                        <Link href="/dashboard/prescriptions" className="text-xs text-gray-400 hover:text-[#052326] flex items-center gap-0.5 font-medium">
                            Verify <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Approved Prescriptions</span>
                        <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 block">{stats.approvedPrescriptions} Active</span>
                    </div>
                </div>

                {/* Circle Challenges */}
                <div className="bg-white dark:bg-gray-900 premium-dashboard-card p-5 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-300 rounded-[8px]">
                            <Activity size={20} />
                        </div>
                        <Link href="/dashboard/challenges" className="text-xs text-gray-400 hover:text-[#052326] flex items-center gap-0.5 font-medium">
                            Join <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Active Challenges</span>
                        <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 block">{activeChallenges.length} Ongoing</span>
                    </div>
                </div>
            </div>

            {/* TWO-COLUMN DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* COLUMN 1: RECENT ORDERS */}
                <div className="bg-white dark:bg-gray-900 premium-dashboard-card overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-semibold text-charcoal dark:text-gray-100 flex items-center gap-2">
                                <ShoppingBag size={18} className="text-[#052326]" />
                                Recent Orders
                            </h3>
                            <Link href="/dashboard/orders" className="text-xs font-semibold text-cureza-green hover:underline">
                                View History
                            </Link>
                        </div>

                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {recentOrders.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No orders found. 
                                    <Link href="/shop" className="text-cureza-green font-semibold block mt-1 hover:underline">
                                        Start shopping
                                    </Link>
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-850 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[8px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-lg">
                                                📦
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-charcoal dark:text-gray-100">Order #{order.order_number}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 font-medium">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm text-charcoal dark:text-gray-100 font-medium">₹{order.total_amount}</p>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold uppercase tracking-wider mt-1 ${(order.status === 'delivered' || order.status === 'cod_reconciled' || order.status === 'completed') ? 'bg-green-50 text-green-700' :
                                                order.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                                                'bg-yellow-50 text-yellow-700'
                                            }`}>
                                                {(order.status === 'cod_reconciled' || order.status === 'completed') ? 'delivered' : order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: RECENT PRESCRIPTIONS */}
                <div className="bg-white dark:bg-gray-900 premium-dashboard-card overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-semibold text-charcoal dark:text-gray-100 flex items-center gap-2">
                                <FileText size={18} className="text-[#052326]" />
                                Doctor Prescriptions
                            </h3>
                            <Link href="/dashboard/prescriptions" className="text-xs font-semibold text-cureza-green hover:underline">
                                View all
                            </Link>
                        </div>

                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {recentPrescriptions.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No active prescriptions found. 
                                    <Link href="/doctor" className="text-cureza-green font-semibold block mt-1 hover:underline">
                                        Consult a doctor
                                    </Link>
                                </div>
                            ) : (
                                recentPrescriptions.map((presc) => (
                                    <div key={presc.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-850 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-[8px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                                <FileText size={20} className="text-cureza-green" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-charcoal dark:text-gray-100 font-medium">Prescription #{presc.prescription_number}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 font-medium">By Dr. {presc.doctor?.name || 'Authorized Doctor'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Link 
                                                href={`/dashboard/prescriptions`}
                                                className="px-3 py-1.5 border border-cureza-green text-cureza-green rounded-[8px] text-xs font-semibold hover:bg-green-50 transition-all"
                                            >
                                                View PDF
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CHALLENGES PROMO SECTION */}
            {activeChallenges.length > 0 && (
                <div className="bg-white dark:bg-gray-900 premium-dashboard-card p-6">
                    <h3 className="font-semibold text-charcoal dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" />
                        Challenges In Progress
                    </h3>
                    <Slider>
                        {activeChallenges.map((challenge) => (
                            <div key={challenge.id} className="bg-gray-50 dark:bg-gray-850 p-4 rounded-[8px] border border-[#555555]/18 min-w-[280px] md:min-w-[340px]">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-sm text-charcoal dark:text-gray-100">{challenge.title}</h4>
                                    <span className="text-[10px] font-semibold text-[#F0C417] bg-[#F0C417]/10 px-2 py-0.5 rounded-[4px] border border-[#F0C417]/20">
                                        +{challenge.reward_points} pts
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{challenge.description}</p>
                                <div className="mt-4">
                                    <div className="flex justify-between text-[10px] font-semibold text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{challenge.current_value} / {challenge.goal_value}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-cureza-green rounded-full"
                                            style={{ width: `${Math.min((challenge.current_value / challenge.goal_value) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
        </div>
    );
}
