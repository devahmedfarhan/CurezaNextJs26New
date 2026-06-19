'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  Store, 
  ShieldAlert, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  Activity, 
  UserCheck, 
  FileCheck2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function UserManagementOverview() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/users/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch user management stats', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="flex justify-between items-center mb-2">
                    <div className="h-8 w-64 bg-gray-250 rounded-lg" />
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

    const cards = [
        {
            title: "Total Customers",
            count: stats?.total_customers || 0,
            link: "/superadmin/dashboard/users/customers",
            icon: Users,
            color: "purple",
            subtext: "Active consumers on platform"
        },
        {
            title: "Total Doctors",
            count: stats?.total_doctors || 0,
            link: "/superadmin/dashboard/users/doctors",
            icon: Stethoscope,
            color: "blue",
            subtext: `${stats?.pending_doctors || 0} pending onboarding`
        },
        {
            title: "Registered Sellers",
            count: stats?.total_sellers || 0,
            link: "/superadmin/dashboard/users/sellers",
            icon: Store,
            color: "emerald",
            subtext: `${stats?.pending_sellers || 0} pending verification`
        },
        {
            title: "Team & Admins",
            count: stats?.total_team || 0,
            link: "/superadmin/dashboard/users/team",
            icon: ShieldCheck,
            color: "indigo",
            subtext: "Administrators and staff"
        }
    ];

    const approvalSections = [
        {
            title: "Doctor Onboarding Applications",
            count: stats?.pending_doctors || 0,
            link: "/superadmin/dashboard/users/doctors?view=pending_onboarding",
            desc: "Verify qualifications, medical council registrations, and identify proofs."
        },
        {
            title: "Doctor Profile Change Requests",
            count: stats?.pending_doctor_updates || 0,
            link: "/superadmin/dashboard/users/doctors?view=profile_updates",
            desc: "Review updates to clinic address, specialization, or consult fees."
        },
        {
            title: "Seller Registration Requests",
            count: stats?.pending_sellers || 0,
            link: "/superadmin/dashboard/users/sellers?view=pending_onboarding",
            desc: "Check and approve new store setups and registration requests."
        },
        {
            title: "Store Profile Change Requests",
            count: stats?.pending_store_requests || 0,
            link: "/superadmin/dashboard/users/sellers?view=store_changes",
            desc: "Review proposed updates to store banner, description, and details."
        },
        {
            title: "Seller KYC & Bank Changes",
            count: stats?.pending_seller_requests || 0,
            link: "/superadmin/dashboard/users/sellers?view=seller_changes",
            desc: "Approve amendments to seller PAN, GST, bank details, and business proof."
        }
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management Directory</h1>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mt-1">Directory of accounts, onboard compliance clearance, and administrative roles.</p>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    const colorStyles = 
                        card.color === 'purple' ? { bg: 'bg-purple-50', text: 'text-purple-650', border: 'border-purple-100' } :
                        card.color === 'blue' ? { bg: 'bg-blue-50', text: 'text-blue-650', border: 'border-blue-100' } :
                        card.color === 'emerald' ? { bg: 'bg-emerald-50', text: 'text-emerald-650', border: 'border-emerald-100' } :
                        { bg: 'bg-indigo-50', text: 'text-indigo-650', border: 'border-indigo-100' };

                    return (
                        <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform ${colorStyles.text}`}>
                                <Icon size={80} />
                            </div>
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-2xl border ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border}`}>
                                    <Icon size={24} />
                                </div>
                                <Link href={card.link} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <ArrowUpRight size={18} />
                                </Link>
                            </div>
                            <div className="mt-4 space-y-1">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{card.title}</p>
                                <h3 className="text-2xl font-black text-gray-900">{card.count}</h3>
                                <p className="text-xs font-semibold text-gray-550">{card.subtext}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Approvals Central Console */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Pending Tasks List */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900">Approvals Central Console</h2>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Approve or reject doctor qualifications and seller profile changes</p>
                        </div>
                        <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-100 gap-1.5 animate-pulse">
                            <Clock size={12} />
                            {stats?.total_pending_approvals || 0} Pending
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {approvalSections.map((sec, idx) => (
                            <div key={idx} className="py-5 first:pt-0 last:pb-0 flex items-center justify-between gap-6 group">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5">
                                        <h4 className="font-extrabold text-gray-800 text-sm truncate">{sec.title}</h4>
                                        {sec.count > 0 ? (
                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                                                {sec.count} PENDING
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-450 text-[10px] font-black px-2 py-0.5 rounded-md border border-gray-150">
                                                CLEARED
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-450 leading-relaxed max-w-xl">{sec.desc}</p>
                                </div>
                                <div className="shrink-0">
                                    <Link 
                                        href={sec.link} 
                                        className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl border transition-all ${
                                            sec.count > 0 
                                                ? 'bg-gray-900 text-white border-gray-900 hover:bg-black hover:scale-[1.02] active:scale-[0.98]'
                                                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        Review
                                        <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Quick Action Hub & Help */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                    <div className="pb-4 border-b border-gray-50">
                        <h3 className="text-lg font-extrabold text-gray-900">Quick Shortcuts</h3>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Quickly manage roles or add user accounts</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link 
                            href="/superadmin/dashboard/users/create?type=customer"
                            className="p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/10 transition-all flex items-center gap-3.5 group"
                        >
                            <div className="p-3 bg-purple-50 text-purple-650 rounded-xl group-hover:scale-105 transition-transform">
                                <Users size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-800">Add Customer</p>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Create customer profile</p>
                            </div>
                        </Link>

                        <Link 
                            href="/superadmin/dashboard/users/create?type=doctor"
                            className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all flex items-center gap-3.5 group"
                        >
                            <div className="p-3 bg-blue-50 text-blue-650 rounded-xl group-hover:scale-105 transition-transform">
                                <Stethoscope size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-800">Add Doctor</p>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Onboard medical practitioner</p>
                            </div>
                        </Link>

                        <Link 
                            href="/superadmin/dashboard/users/create?type=seller"
                            className="p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all flex items-center gap-3.5 group"
                        >
                            <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl group-hover:scale-105 transition-transform">
                                <Store size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-800">Add Seller</p>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Register corporate merchant</p>
                            </div>
                        </Link>

                        <Link 
                            href="/superadmin/dashboard/users/team"
                            className="p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all flex items-center gap-3.5 group"
                        >
                            <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl group-hover:scale-105 transition-transform">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-800">Configure RBAC Roles</p>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Edit permissions and team access</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
