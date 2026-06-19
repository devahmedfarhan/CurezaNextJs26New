'use client';

// Superadmin Users Dashboard Overview - SubNav removed as navigation is handled via sidebar.
import { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  Store, 
  Clock, 
  ArrowUpRight, 
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
                <div className="h-28 bg-white border-[0.5px] border-neutral-950/10 rounded-[10px]" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-32 bg-neutral-50 border-[0.5px] border-neutral-950/10 rounded-[10px]" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-96 lg:col-span-2 bg-neutral-50 border-[0.5px] border-neutral-950/10 rounded-[10px]" />
                    <div className="h-96 bg-neutral-50 border-[0.5px] border-neutral-950/10 rounded-[10px]" />
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
            subtext: "Active consumers on platform"
        },
        {
            title: "Total Doctors",
            count: stats?.total_doctors || 0,
            link: "/superadmin/dashboard/users/doctors",
            icon: Stethoscope,
            subtext: `${stats?.pending_doctors || 0} pending onboarding`
        },
        {
            title: "Registered Sellers",
            count: stats?.total_sellers || 0,
            link: "/superadmin/dashboard/users/sellers",
            icon: Store,
            subtext: `${stats?.pending_sellers || 0} pending verification`
        },
        {
            title: "Team & Admins",
            count: stats?.total_team || 0,
            link: "/superadmin/dashboard/users/team",
            icon: ShieldCheck,
            subtext: "Administrators and staff"
        }
    ];

    const approvalSections = [
        {
            title: "Doctor Onboarding Applications",
            count: stats?.pending_doctors || 0,
            link: "/superadmin/dashboard/users/doctors?view=pending_onboarding",
            desc: "Verify qualifications, medical council registrations, and identity proofs."
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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="relative overflow-hidden bg-white rounded-[10px] p-6 border-[0.5px] border-neutral-950/10">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Users size={120} />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-neutral-100 text-black rounded-lg">
                                <Users size={20} />
                            </div>
                            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
                                User Management Directory
                            </h1>
                        </div>
                        <p className="text-neutral-500 max-w-xl font-normal text-xs">
                            Directory of accounts, onboard compliance clearance, and administrative roles.
                        </p>
                    </div>
                </div>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => {
                    const Icon = card.icon;

                    return (
                        <div key={idx} className="bg-white rounded-[10px] border-[0.5px] border-neutral-950/10 p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-115 transition-transform text-neutral-900">
                                <Icon size={72} />
                            </div>
                            <div className="flex justify-between items-start">
                                <div className="p-2.5 rounded-lg border-[0.5px] border-neutral-950/10 bg-neutral-50 text-neutral-900">
                                    <Icon size={20} />
                                </div>
                                <Link href={card.link} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                                    <ArrowUpRight size={18} />
                                </Link>
                            </div>
                            <div className="mt-4 space-y-1">
                                <p className="text-xs font-medium text-neutral-500">{card.title}</p>
                                <h3 className="text-2xl font-semibold text-neutral-900">{card.count}</h3>
                                <p className="text-xs font-normal text-neutral-400">{card.subtext}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Approvals Central Console */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Pending Tasks List */}
                <div className="lg:col-span-2 bg-white rounded-[10px] border-[0.5px] border-neutral-950/10 p-6 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-neutral-950/5">
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold text-neutral-900">Approvals Central Console</h2>
                            <p className="text-xs text-neutral-400 font-normal">Approve or reject doctor qualifications and seller profile changes</p>
                        </div>
                        <span className="flex items-center text-xs font-medium text-neutral-700 bg-neutral-50 px-2.5 py-1 rounded-[10px] border border-neutral-950/10 gap-1.5">
                            <Clock size={12} />
                            {stats?.total_pending_approvals || 0} Pending
                        </span>
                    </div>

                    <div className="divide-y divide-neutral-950/5">
                        {approvalSections.map((sec, idx) => (
                            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-6 group">
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5">
                                        <h4 className="font-semibold text-neutral-800 text-sm truncate">{sec.title}</h4>
                                        {sec.count > 0 ? (
                                            <span className="bg-black text-white text-[10px] font-semibold px-2 py-0.5 rounded-[4px]">
                                                {sec.count} Pending
                                            </span>
                                        ) : (
                                            <span className="bg-neutral-50 text-neutral-400 text-[10px] font-medium px-2 py-0.5 rounded-[4px] border border-neutral-950/5">
                                                Cleared
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-500 leading-relaxed max-w-xl font-normal">{sec.desc}</p>
                                </div>
                                <div className="shrink-0">
                                    <Link 
                                        href={sec.link} 
                                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-[10px] border transition-all ${
                                            sec.count > 0 
                                                ? 'bg-black text-white border-black hover:bg-neutral-900'
                                                : 'bg-white text-neutral-500 border-neutral-950/10 hover:bg-neutral-50'
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

                {/* Right: Quick Action Hub */}
                <div className="bg-white rounded-[10px] border-[0.5px] border-neutral-950/10 p-6 space-y-6">
                    <div className="pb-4 border-b border-neutral-950/5 space-y-1">
                        <h3 className="text-base font-semibold text-neutral-900">Quick Shortcuts</h3>
                        <p className="text-xs text-neutral-400 font-normal">Quickly manage roles or add user accounts</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link 
                            href="/superadmin/dashboard/users/create?type=customer"
                            className="p-4 rounded-[10px] border-[0.5px] border-neutral-950/10 hover:border-neutral-950/20 hover:bg-neutral-50 transition-all flex items-center gap-3.5 group"
                        >
                            <div className="p-2.5 bg-neutral-100 text-neutral-900 rounded-lg group-hover:scale-105 transition-transform">
                                <Users size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-medium text-neutral-900">Add Customer</p>
                                <p className="text-[10px] text-neutral-400 font-normal mt-0.5">Create Customer Profile</p>
                            </div>
                        </Link>

                        <Link 
                            href="/superadmin/dashboard/users/create?type=doctor"
                            className="p-4 rounded-[10px] border-[0.5px] border-neutral-950/10 hover:border-neutral-950/20 hover:bg-neutral-50 transition-all flex items-center gap-3.5 group"
                        >
                            <div className="p-2.5 bg-neutral-100 text-neutral-900 rounded-lg group-hover:scale-105 transition-transform">
                                <Stethoscope size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-medium text-neutral-900">Add Doctor</p>
                                <p className="text-[10px] text-neutral-400 font-normal mt-0.5">Onboard Medical Practitioner</p>
                            </div>
                        </Link>

                        <Link 
                            href="/superadmin/dashboard/users/create?type=seller"
                            className="p-4 rounded-[10px] border-[0.5px] border-neutral-950/10 hover:border-neutral-950/20 hover:bg-neutral-50 transition-all flex items-center gap-3.5 group"
                        >
                            <div className="p-2.5 bg-neutral-100 text-neutral-900 rounded-lg group-hover:scale-105 transition-transform">
                                <Store size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-medium text-neutral-900">Add Seller</p>
                                <p className="text-[10px] text-neutral-400 font-normal mt-0.5">Register Corporate Merchant</p>
                            </div>
                        </Link>

                        <Link 
                            href="/superadmin/dashboard/users/team"
                            className="p-4 rounded-[10px] border-[0.5px] border-neutral-950/10 hover:border-neutral-950/20 hover:bg-neutral-50 transition-all flex items-center gap-3.5 group"
                        >
                            <div className="p-3 bg-neutral-100 text-neutral-900 rounded-lg group-hover:scale-105 transition-transform">
                                <ShieldCheck size={16} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-medium text-neutral-900">Configure RBAC Roles</p>
                                <p className="text-[10px] text-neutral-400 font-normal mt-0.5">Edit Permissions and Team Access</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
