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
  Truck,
  Package,
  Star,
  Megaphone,
  CreditCard,
  Award,
  HelpCircle,
  Settings,
  Bell,
  RefreshCw,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function SuperAdminDashboardHome() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
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

    const stats = dashboardData?.stats ? {
        ...dashboardData.stats,
        total_revenue: dashboardData.stats.platform_gross_sales || 0,
        today_revenue: dashboardData.stats.today_platform_gross_sales || 0
    } : {
        total_sellers: 0,
        active_sellers: 0,
        pending_approvals: 0,
        total_doctors: 0,
        active_doctors: 0,
        total_users: 0,
        total_revenue: 0,
        total_orders: 0,
        today_orders: 0,
        today_revenue: 0,
        platform_gross_sales: 0,
        platform_net_revenue: 0,
        today_platform_gross_sales: 0,
        today_platform_net_revenue: 0,
        seller_gross_sales: 0,
        seller_net_earnings: 0,
        seller_platform_commission: 0,
        today_seller_gross_sales: 0,
        today_seller_net_earnings: 0,
        today_seller_platform_commission: 0,
        doctor_gross_sales: 0,
        doctor_net_earnings: 0,
        doctor_platform_commission: 0,
        today_doctor_gross_sales: 0,
        today_doctor_net_earnings: 0,
        today_doctor_platform_commission: 0,
        today_sellers: 0,
        today_doctors: 0,
        total_cod_orders: 0,
        today_cod_orders: 0,
        total_cod_amount: 0,
        today_cod_amount: 0,
        total_paid_orders: 0,
        today_paid_orders: 0,
        total_paid_amount: 0,
        today_paid_amount: 0,
        pending_payout_amount: 0
    };

    const recentOrders = dashboardData?.recent_orders || [];
    const recentActivities = dashboardData?.recent_activities || [];

    const modules = [
        {
            id: 'products',
            title: 'Products & Catalog',
            category: 'catalog',
            icon: Package,
            color: 'from-emerald-500 to-green-600',
            bgLight: 'bg-emerald-50/50 text-emerald-700 border-emerald-100',
            iconBg: 'bg-emerald-100/80 text-emerald-700',
            description: 'Manage product listings, categories, attributes, tags, bulk actions and scrapers.',
            metrics: [
                { label: 'Active Catalog', value: '1,420 Items' },
                { label: 'Pending Audits', value: `${stats.pending_approvals} Products`, warning: stats.pending_approvals > 0 },
                { label: 'Scraper Engine', value: 'Idle', success: true }
            ],
            links: [
                { title: 'All Products', url: '/superadmin/dashboard/products' },
                { title: 'Add New Product', url: '/superadmin/dashboard/products/create' },
                { title: 'Bulk Upload', url: '/superadmin/dashboard/products/bulk' },
                { title: 'Web Catalog Scraper', url: '/superadmin/dashboard/scraper' },
                { title: 'Categories', url: '/superadmin/dashboard/categories' },
                { title: 'Brands', url: '/superadmin/dashboard/brands' },
                { title: 'Attributes', url: '/superadmin/dashboard/attributes' },
                { title: 'Product Tags', url: '/superadmin/dashboard/products/tags' }
            ]
        },
        {
            id: 'ratings',
            title: 'Ratings & Reviews',
            category: 'users',
            icon: Star,
            color: 'from-amber-400 to-orange-500',
            bgLight: 'bg-amber-50/50 text-amber-800 border-amber-100',
            iconBg: 'bg-amber-100/80 text-amber-700',
            description: 'Monitor customer reviews for products, sellers, and doctor consultations.',
            metrics: [
                { label: 'Average Rating', value: '4.8 ★', success: true },
                { label: 'Seller Replies', value: '94% Rate' },
                { label: 'Doctor Reviews', value: '98 Positive' }
            ],
            links: [
                { title: 'Overview', url: '/superadmin/dashboard/ratings?tab=overview' },
                { title: 'Product Reviews', url: '/superadmin/dashboard/ratings?tab=products' },
                { title: 'Store Reviews', url: '/superadmin/dashboard/ratings?tab=sellers' },
                { title: 'Doctor Reviews', url: '/superadmin/dashboard/ratings?tab=doctors' },
                { title: 'Seller Replies', url: '/superadmin/dashboard/ratings?tab=replies' }
            ]
        },
        {
            id: 'orders',
            title: 'Orders & Refunds',
            category: 'catalog',
            icon: ShoppingBag,
            color: 'from-blue-500 to-indigo-600',
            bgLight: 'bg-blue-50/50 text-blue-800 border-blue-100',
            iconBg: 'bg-blue-100/80 text-blue-700',
            description: 'Track orders, process shipments, manage delivery logs and refund requests.',
            metrics: [
                { label: 'Lifetime Orders', value: stats.total_orders },
                { label: 'Today\'s Orders', value: stats.today_orders, success: stats.today_orders > 0 },
                { label: 'Refund Requests', value: '4 Pending', warning: true }
            ],
            links: [
                { title: 'All Orders', url: '/superadmin/dashboard/orders' },
                { title: 'Refund Requests', url: '/superadmin/dashboard/refunds' },
                { title: 'Shipments', url: '/superadmin/dashboard/shipments' }
            ]
        },
        {
            id: 'users',
            title: 'User Management',
            category: 'users',
            icon: Users,
            color: 'from-purple-500 to-pink-600',
            bgLight: 'bg-purple-50/50 text-purple-800 border-purple-100',
            iconBg: 'bg-purple-100/80 text-purple-700',
            description: 'Manage platform customers, sellers, doctor directories and team permissions.',
            metrics: [
                { label: 'Customers', value: stats.total_users },
                { label: 'Verified Doctors', value: `${stats.active_doctors}/${stats.total_doctors}` },
                { label: 'Registered Sellers', value: `${stats.active_sellers}/${stats.total_sellers}` }
            ],
            links: [
                { title: 'Overview', url: '/superadmin/dashboard/users' },
                { title: 'Customers', url: '/superadmin/dashboard/users/customers' },
                { title: 'Doctors', url: '/superadmin/dashboard/users/doctors' },
                { title: 'Sellers', url: '/superadmin/dashboard/users/sellers' },
                { title: 'Team & Admins', url: '/superadmin/dashboard/users/team' }
            ]
        },
        {
            id: 'marketing',
            title: 'Marketing & Promos',
            category: 'marketing',
            icon: Megaphone,
            color: 'from-rose-500 to-red-600',
            bgLight: 'bg-rose-50/50 text-rose-800 border-rose-100',
            iconBg: 'bg-rose-100/80 text-rose-700',
            description: 'Run targeted marketing campaigns, manage discount coupons and pixel tracking.',
            metrics: [
                { label: 'Active Coupons', value: '12 Codes', success: true },
                { label: 'Bundle Offers', value: '3 Active' },
                { label: 'Pixel Trackers', value: 'Connected', success: true }
            ],
            links: [
                { title: 'Offers & Coupons', url: '/superadmin/dashboard/marketing/offers' },
                { title: 'Bundle Offers', url: '/superadmin/dashboard/marketing/bundles' },
                { title: 'Email Campaigns', url: '/superadmin/dashboard/marketing/email' },
                { title: 'Automation', url: '/superadmin/dashboard/marketing/automation' },
                { title: 'Pixel Settings', url: '/superadmin/dashboard/marketing/pixel' }
            ]
        },
        {
            id: 'finance',
            title: 'Platform Finance',
            category: 'marketing',
            icon: CreditCard,
            color: 'from-teal-500 to-cyan-600',
            bgLight: 'bg-teal-50/50 text-teal-800 border-teal-100',
            iconBg: 'bg-teal-100/80 text-teal-700',
            description: 'Review ledgers, handle payouts, commission policies and audit simulator configs.',
            metrics: [
                { label: 'Total Revenue', value: `₹${parseFloat(stats.total_revenue).toLocaleString('en-IN')}` },
                { label: 'Payout Releases', value: `₹${parseFloat(stats.pending_payout_amount || 0).toLocaleString('en-IN')} Pending`, warning: (stats.pending_payout_amount || 0) > 0 },
                { label: 'Today\'s Revenue', value: `₹${parseFloat(stats.today_revenue).toLocaleString('en-IN')}`, success: stats.today_revenue > 0 }
            ],
            links: [
                { title: 'Finance Overview', url: '/superadmin/dashboard/finance' },
                { title: 'Business Ledgers', url: '/superadmin/dashboard/finance/sellers' },
                { title: 'Payout Releases', url: '/superadmin/dashboard/finance/payouts' },
                { title: 'Transactions Log', url: '/superadmin/dashboard/finance/transactions' },
                { title: 'Invoices & Taxes', url: '/superadmin/dashboard/finance/tax' },
                { title: 'Audit Desk Simulator', url: '/superadmin/dashboard/finance/simulators' },
                { title: 'Commission Policy', url: '/superadmin/dashboard/finance/commission' }
            ]
        },
        {
            id: 'support',
            title: 'Support & Tickets',
            category: 'users',
            icon: HelpCircle,
            color: 'from-sky-500 to-blue-600',
            bgLight: 'bg-sky-50/50 text-sky-850 border-sky-100',
            iconBg: 'bg-sky-100/80 text-sky-700',
            description: 'Address customer and merchant support tickets and SLA response analytics.',
            metrics: [
                { label: 'Open Tickets', value: '5 Tickets', warning: true },
                { label: 'Avg Resolution', value: '4.2 Hrs' },
                { label: 'SLA Rating', value: '99.1%', success: true }
            ],
            links: [
                { title: 'All Tickets', url: '/superadmin/dashboard/support' }
            ]
        },
        {
            id: 'circle',
            title: 'Cureza Circle',
            category: 'marketing',
            icon: Award,
            color: 'from-indigo-500 to-purple-700',
            bgLight: 'bg-indigo-50/50 text-indigo-850 border-indigo-100',
            iconBg: 'bg-indigo-100/80 text-indigo-700',
            description: 'Administer the Cureza community, challenges, referrals, badges, and rewards.',
            metrics: [
                { label: 'Active Users', value: '3,450 Members', success: true },
                { label: 'Challenges Active', value: '2 Live' },
                { label: 'Referral Signups', value: '124 Weekly' }
            ],
            links: [
                { title: 'Circle Home', url: '/superadmin/dashboard/community' },
                { title: 'Activity Log', url: '/superadmin/dashboard/community/activity' },
                { title: 'Referrals', url: '/superadmin/dashboard/community/referrals' },
                { title: 'Leaderboard', url: '/superadmin/dashboard/community/leaderboard' },
                { title: 'Challenges', url: '/superadmin/dashboard/community/challenges' },
                { title: 'Badges', url: '/superadmin/dashboard/community/badges' },
                { title: 'Rewards Shop', url: '/superadmin/dashboard/community/rewards' },
                { title: 'Circle Guidelines', url: '/superadmin/dashboard/community/guidelines' }
            ]
        },
        {
            id: 'cms',
            title: 'Content & CMS',
            category: 'catalog',
            icon: FileText,
            color: 'from-violet-500 to-fuchsia-600',
            bgLight: 'bg-violet-50/50 text-violet-850 border-violet-100',
            iconBg: 'bg-violet-100/80 text-violet-750',
            description: 'Publish posts, edit help FAQs, manage blog tags and customize site menus.',
            metrics: [
                { label: 'Total Posts', value: '28 Articles' },
                { label: 'FAQ Categories', value: '6 Themes' },
                { label: 'Active Authors', value: '4 Editors', success: true }
            ],
            links: [
                { title: 'All Posts', url: '/superadmin/dashboard/cms/blogs' },
                { title: 'Blog Categories', url: '/superadmin/dashboard/cms/categories' },
                { title: 'Blog Tags', url: '/superadmin/dashboard/cms/tags' },
                { title: 'Blog Authors', url: '/superadmin/dashboard/cms/blogs/authors' },
                { title: 'FAQ & Help', url: '/superadmin/dashboard/cms/faq' },
                { title: 'Menu Builder', url: '/superadmin/dashboard/menu' }
            ]
        },
        {
            id: 'shipping',
            title: 'Shipping & Checkout',
            category: 'settings',
            icon: Truck,
            color: 'from-slate-500 to-zinc-700',
            bgLight: 'bg-zinc-50 border-zinc-200 text-zinc-800',
            iconBg: 'bg-zinc-100/80 text-zinc-700',
            description: 'Manage shipping zones, default cart settings and checkout rules.',
            metrics: [
                { label: 'Active Zones', value: '3 Regions' },
                { label: 'Integrated Carriers', value: '4 Courier Co', success: true },
                { label: 'Shipping Rules', value: 'Unified' }
            ],
            links: [
                { title: 'Unified Settings', url: '/superadmin/dashboard/settings/checkout-cart' }
            ]
        },
        {
            id: 'notifications',
            title: 'Notifications & Flows',
            category: 'settings',
            icon: Bell,
            color: 'from-orange-500 to-amber-600',
            bgLight: 'bg-orange-50/50 text-orange-850 border-orange-100',
            iconBg: 'bg-orange-100/80 text-orange-700',
            description: 'Configure campaign templates, automated emails and AISensy WhatsApp flows.',
            metrics: [
                { label: 'Automations Active', value: '5 Flows', success: true },
                { label: 'AISensy Status', value: 'Connected', success: true },
                { label: 'Waitlisted Items', value: '12 Items' }
            ],
            links: [
                { title: 'Campaign Templates', url: '/superadmin/dashboard/settings/notifications?tab=templates' },
                { title: 'Automated Flows', url: '/superadmin/dashboard/settings/notifications?tab=flows' },
                { title: 'Product Waitlists', url: '/superadmin/dashboard/settings/notifications?tab=waitlist' },
                { title: 'AISensy WhatsApp', url: '/superadmin/dashboard/settings/notifications?tab=whatsapp' },
                { title: 'Delivery Logs', url: '/superadmin/dashboard/settings/notifications?tab=logs' }
            ]
        },
        {
            id: 'settings',
            title: 'Global Settings',
            category: 'settings',
            icon: Settings,
            color: 'from-gray-700 to-slate-900',
            bgLight: 'bg-slate-50 border-slate-200 text-slate-800',
            iconBg: 'bg-slate-200/80 text-slate-700',
            description: 'Update core system general settings, payment channels, and access roles.',
            metrics: [
                { label: 'DB Health', value: 'Operational', success: true },
                { label: 'Role Policies', value: '4 Roles Configured' },
                { label: 'Active Gateways', value: 'Stripe, Razorpay' }
            ],
            links: [
                { title: 'General Settings', url: '/superadmin/dashboard/settings/general' },
                { title: 'Payment Gateways', url: '/superadmin/dashboard/settings/payments' },
                { title: 'Legal Pages', url: '/superadmin/dashboard/settings/legal' },
                { title: 'Roles & Access', url: '/superadmin/dashboard/settings/rbac' },
                { title: 'Backup & Maintenance', url: '/superadmin/dashboard/settings/system' }
            ]
        }
    ];

    const filteredModules = modules.filter((m) => {
        const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
        
        const q = searchQuery.toLowerCase().trim();
        if (!q) return matchesCategory;

        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesSubMenu = m.links.some((l) => l.title.toLowerCase().includes(q));
        
        return matchesCategory && (matchesTitle || matchesDesc || matchesSubMenu);
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-pulse">
                <div className="flex justify-between items-center mb-2">
                    <div className="h-8 w-64 bg-gray-200 rounded-lg" />
                    <div className="h-10 w-40 bg-gray-200 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-32 bg-gray-200 rounded-lg" />
                    ))}
                </div>
                <div className="h-12 w-full bg-gray-200 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-72 bg-gray-200 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Dashboard Banner */}
            <div className="relative overflow-hidden bg-black text-white p-6 md:p-8 rounded-lg border-[0.5px] border-neutral-900/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider bg-neutral-800 text-neutral-200 border border-neutral-700">
                                Overview Console
                            </span>
                            {refreshing && (
                                <span className="text-xs text-neutral-400 font-semibold flex items-center gap-1">
                                    <RefreshCw className="animate-spin" size={12} /> Syncing
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Superadmin Control Center</h1>
                        <p className="text-neutral-400 text-sm mt-1 font-medium">Summarizing all platform micro-services, databases, and configuration panels.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <button 
                            onClick={() => fetchDashboardData(true)} 
                            className="bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold text-xs tracking-wider"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            Force Refresh
                        </button>
                        <Link
                            href="/superadmin/dashboard/products/create"
                            className="bg-white hover:bg-neutral-100 text-black px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-bold text-xs tracking-wider border border-neutral-200"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Add Product
                        </Link>
                    </div>
                </div>
            </div>

            {/* Core Highlight KPIs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Platform Total Revenue */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 relative overflow-hidden group hover:border-black/35 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-neutral-900">
                        <TrendingUp size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-neutral-900 text-white rounded-lg border-[0.5px] border-neutral-900/10">
                            <TrendingUp size={22} />
                        </div>
                        <span className="flex items-center text-[10px] font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-lg border border-neutral-200 uppercase tracking-wider">
                            Platform
                        </span>
                    </div>
                    <div className="mt-4 space-y-1.5">
                        <p className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">Total Platform Sales (Gross)</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{parseFloat(stats.platform_gross_sales).toLocaleString('en-IN')}</h3>
                        <div className="text-xs font-semibold text-gray-550 pt-1 border-t border-neutral-100 mt-2 space-y-1">
                            <div className="flex justify-between">
                                <span>Cureza Net Earnings:</span>
                                <span className="font-extrabold text-neutral-950">₹{parseFloat(stats.platform_net_revenue).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-emerald-600 font-bold">
                                <span>Today's Sales:</span>
                                <span>+₹{parseFloat(stats.today_platform_gross_sales).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Seller Sales */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-emerald-900">
                        <Store size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border-[0.5px] border-emerald-950/10">
                            <Store size={22} />
                        </div>
                        <Link href="/superadmin/dashboard/finance" className="text-gray-400 hover:text-gray-650 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1.5">
                        <p className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">Seller Sales (Gross)</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{parseFloat(stats.seller_gross_sales).toLocaleString('en-IN')}</h3>
                        <div className="text-xs font-semibold text-gray-550 pt-1 border-t border-neutral-100 mt-2 space-y-1">
                            <div className="flex justify-between">
                                <span>Seller Net:</span>
                                <span className="font-bold text-gray-800">₹{parseFloat(stats.seller_net_earnings).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Share:</span>
                                <span className="font-bold text-gray-800">₹{parseFloat(stats.seller_platform_commission).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-emerald-600 font-bold">
                                <span>Today Gross:</span>
                                <span>+₹{parseFloat(stats.today_seller_gross_sales).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Doctor Sales */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-blue-900">
                        <Activity size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border-[0.5px] border-neutral-950/10">
                            <Activity size={22} />
                        </div>
                        <Link href="/superadmin/dashboard/finance" className="text-gray-400 hover:text-gray-650 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1.5">
                        <p className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">Doctor Sales (Gross)</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{parseFloat(stats.doctor_gross_sales).toLocaleString('en-IN')}</h3>
                        <div className="text-xs font-semibold text-gray-550 pt-1 border-t border-neutral-100 mt-2 space-y-1">
                            <div className="flex justify-between">
                                <span>Doctor Net:</span>
                                <span className="font-bold text-gray-800">₹{parseFloat(stats.doctor_net_earnings).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Share:</span>
                                <span className="font-bold text-gray-800">₹{parseFloat(stats.doctor_platform_commission).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-emerald-600 font-bold">
                                <span>Today Gross:</span>
                                <span>+₹{parseFloat(stats.today_doctor_gross_sales).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 4: Orders overview */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 relative overflow-hidden group hover:border-rose-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-rose-900">
                        <ShoppingBag size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-rose-50 text-rose-700 rounded-lg border-[0.5px] border-neutral-950/10">
                            <ShoppingBag size={22} />
                        </div>
                        <Link href="/superadmin/dashboard/orders" className="text-gray-400 hover:text-gray-650 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1.5">
                        <p className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">Total Orders</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_orders}</h3>
                        <div className="text-xs font-semibold text-gray-550 pt-1 border-t border-neutral-100 mt-2 space-y-1">
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Added Today:</span>
                                <span>+{stats.today_orders} orders</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-neutral-400">
                                <span>Average/Day:</span>
                                <span>{stats.total_orders > 0 ? (stats.total_orders / 30).toFixed(1) : 0} orders</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 5: Sellers Added Today */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 relative overflow-hidden group hover:border-violet-500/55 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-violet-900">
                        <Users size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-violet-50 text-violet-700 rounded-lg border-[0.5px] border-violet-950/10">
                            <Users size={22} />
                        </div>
                        <Link href="/superadmin/dashboard/users/sellers" className="text-gray-400 hover:text-gray-650 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1.5">
                        <p className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">Sellers Registration</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_sellers}</h3>
                        <div className="text-xs font-semibold text-gray-550 pt-1 border-t border-neutral-100 mt-2 space-y-1">
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Registered Today:</span>
                                <span>+{stats.today_sellers} today</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Active / Pending:</span>
                                <span>{stats.active_sellers} / {stats.pending_approvals}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 6: Doctors Added Today */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 relative overflow-hidden group hover:border-teal-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-teal-900">
                        <Users size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-teal-50 text-teal-700 rounded-lg border-[0.5px] border-teal-950/10">
                            <Users size={22} />
                        </div>
                        <Link href="/superadmin/dashboard/users/doctors" className="text-gray-400 hover:text-gray-650 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1.5">
                        <p className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">Doctors Onboarding</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_doctors}</h3>
                        <div className="text-xs font-semibold text-gray-550 pt-1 border-t border-neutral-100 mt-2 space-y-1">
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Onboarded Today:</span>
                                <span>+{stats.today_doctors} today</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Verified / Active:</span>
                                <span>{stats.active_doctors} Doctors</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 7: COD Orders */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 relative overflow-hidden group hover:border-amber-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-amber-900">
                        <Truck size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-50 text-amber-700 rounded-lg border-[0.5px] border-neutral-950/10">
                            <Truck size={22} />
                        </div>
                        <span className="flex items-center text-[10px] font-bold text-amber-805 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 uppercase tracking-wider">
                            COD
                        </span>
                    </div>
                    <div className="mt-4 space-y-1.5">
                        <p className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">COD Orders Count</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_cod_orders}</h3>
                        <div className="text-xs font-semibold text-gray-550 pt-1 border-t border-neutral-100 mt-2 space-y-1">
                            <div className="flex justify-between">
                                <span>COD Paid Amount:</span>
                                <span className="font-bold">₹{parseFloat(stats.total_cod_amount).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Today's COD Orders:</span>
                                <span>+{stats.today_cod_orders} (₹{parseFloat(stats.today_cod_amount).toLocaleString('en-IN')})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 8: Paid Orders (Online Prepaid) */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 relative overflow-hidden group hover:border-slate-500/50 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all text-slate-900">
                        <CreditCard size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-slate-50 text-slate-700 rounded-lg border-[0.5px] border-neutral-950/10">
                            <CreditCard size={22} />
                        </div>
                        <span className="flex items-center text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 uppercase tracking-wider">
                            Prepaid
                        </span>
                    </div>
                    <div className="mt-4 space-y-1.5">
                        <p className="text-neutral-400 text-[10px] font-bold tracking-widest uppercase">Prepaid Orders Count</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_paid_orders}</h3>
                        <div className="text-xs font-semibold text-gray-550 pt-1 border-t border-neutral-100 mt-2 space-y-1">
                            <div className="flex justify-between">
                                <span>Prepaid Sales Value:</span>
                                <span className="font-bold">₹{parseFloat(stats.total_paid_amount).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Today's Prepaid Orders:</span>
                                <span>+{stats.today_paid_orders} (₹{parseFloat(stats.today_paid_amount).toLocaleString('en-IN')})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Filters and Real-Time Search Bar */}
            <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-4 md:p-6 space-y-4">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                    {/* Search Controls */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to filter module summaries (e.g. coupon, reviews, scraper)..."
                            className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border-[0.5px] border-neutral-950/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Category Selector segmented control */}
                    <div className="flex items-center gap-1 p-1 bg-neutral-50 border-[0.5px] border-neutral-950/10 rounded-lg overflow-x-auto scrollbar-none">
                        {[
                            { id: 'all', label: 'All Modules' },
                            { id: 'catalog', label: 'Catalog & Sales' },
                            { id: 'users', label: 'Users & Reviews' },
                            { id: 'marketing', label: 'Marketing & Circle' },
                            { id: 'settings', label: 'System & Settings' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedCategory(tab.id)}
                                className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all border border-transparent
                                    ${selectedCategory === tab.id 
                                        ? 'bg-white text-black border-[0.5px] border-neutral-950/10 font-bold' 
                                        : 'text-neutral-500 hover:text-black'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {searchQuery && (
                    <div className="text-xs text-gray-450 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Filter size={12} />
                        Found {filteredModules.length} modules matching &ldquo;{searchQuery}&rdquo;
                    </div>
                )}
            </div>

            {/* Modules Summaries Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => {
                    const IconComponent = module.icon;
                    return (
                        <div 
                            key={module.id} 
                            className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 hover:border-black/35 transition-all flex flex-col justify-between overflow-hidden relative group"
                        >
                            {/* Top thin line indicator */}
                            <div className="h-[1px] bg-black/10 group-hover:bg-black transition-colors" />
                            
                            <div className="p-6 flex-1 space-y-4">
                                {/* Card Header */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight group-hover:text-black transition-colors">
                                            {module.title}
                                        </h3>
                                        <span className="inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold border border-neutral-950/10 bg-neutral-50 text-neutral-600">
                                            {module.category === 'catalog' ? 'Catalog & Sales' : 
                                             module.category === 'users' ? 'Users & Reviews' : 
                                             module.category === 'marketing' ? 'Marketing & Circle' : 'System & Settings'}
                                        </span>
                                    </div>
                                    <div className="p-2 bg-neutral-50 text-black border-[0.5px] border-neutral-950/10 rounded-lg transition-transform group-hover:scale-105">
                                        <IconComponent size={20} />
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-gray-550 leading-relaxed font-medium">
                                    {module.description}
                                </p>

                                {/* Micro-Metrics Widget Block */}
                                <div className="bg-neutral-50 rounded-lg p-3 border-[0.5px] border-neutral-950/10 grid grid-cols-3 gap-2">
                                    {module.metrics.map((metric, idx) => (
                                        <div key={idx} className="text-center space-y-0.5">
                                            <p className="text-[9px] text-neutral-500 font-bold tracking-wider truncate">
                                                {metric.label}
                                            </p>
                                            <p className={`text-xs font-black tracking-tight truncate
                                                ${metric.warning ? 'text-red-600' : metric.success ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                {metric.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Sub-menus Quick links */}
                                <div className="space-y-2">
                                    <p className="text-[9px] text-neutral-400 font-bold tracking-widest">
                                        Submenus & Sections
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {module.links.map((link, idx) => {
                                            // Highlight text matches
                                            const isMatched = searchQuery && link.title.toLowerCase().includes(searchQuery.toLowerCase());
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url}
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border flex items-center gap-1
                                                        ${isMatched
                                                            ? 'bg-black text-white border-black font-bold scale-102' 
                                                            : 'bg-white text-gray-600 border-gray-150 hover:border-black hover:bg-black hover:text-white'}`}
                                                >
                                                    {link.title}
                                                    <ChevronRight size={10} className="opacity-40" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Link */}
                            <div className="px-6 py-3.5 bg-neutral-50/50 border-t-[0.5px] border-neutral-950/10 flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-semibold tracking-wider text-[10px]">
                                    {module.links.length} subsections
                                </span>
                                <Link 
                                    href={module.links[0]?.url || '#'} 
                                    className="text-slate-800 font-bold hover:text-black hover:underline transition-colors inline-flex items-center gap-1 text-[11px] tracking-wider"
                                >
                                    Access Panel
                                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>
                    );
                })}

                {filteredModules.length === 0 && (
                    <div className="col-span-full py-16 bg-white border-[0.5px] border-neutral-950/10 rounded-lg text-center p-8 space-y-3">
                        <AlertCircle className="mx-auto text-gray-300" size={48} />
                        <div className="space-y-1">
                            <h4 className="font-extrabold text-gray-800">No matching modules found</h4>
                            <p className="text-xs text-gray-400">Try adjusting your search keywords or switching filters.</p>
                        </div>
                        <button 
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                            className="bg-black text-white hover:bg-neutral-900 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-transparent"
                        >
                            Reset Dashboard Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Monitor Logs Rows (Recent Orders & Activity Logs) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders List */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Recent Sales Activity</h2>
                            <p className="text-xs text-neutral-400 font-semibold">Latest invoice summaries from storefront</p>
                        </div>
                        <Link 
                            href="/superadmin/dashboard/orders" 
                            className="text-black font-semibold hover:underline text-xs flex items-center gap-1"
                        >
                            All Orders <ChevronRight size={14} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold text-neutral-500 tracking-wider border-b-[0.5px] border-neutral-950/10">
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
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border
                                                    ${order.payment_status === 'paid' 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250/50' 
                                                        : 'bg-neutral-55 text-neutral-700 border-neutral-250/55'}`}>
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

                {/* Audit Logs */}
                <div className="bg-white rounded-lg border-[0.5px] border-neutral-950/10 p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Security Audit Logs</h2>
                            <p className="text-xs text-neutral-400 font-semibold">Latest administrator and staff actions</p>
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
                                    <div className="p-2 bg-neutral-50 border-[0.5px] border-neutral-950/10 text-black rounded-lg mt-0.5">
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
        </div>
    );
}
