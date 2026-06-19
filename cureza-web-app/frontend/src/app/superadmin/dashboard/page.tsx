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
                { label: 'Payout Releases', value: '₹42,500 Pending', warning: true },
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
                        <div key={n} className="h-32 bg-gray-200 rounded-3xl" />
                    ))}
                </div>
                <div className="h-12 w-full bg-gray-200 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-72 bg-gray-200 rounded-3xl" />
                    ))}
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
                                Overview Console
                            </span>
                            {refreshing && (
                                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                    <RefreshCw className="animate-spin" size={12} /> Syncing
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Superadmin Control Center</h1>
                        <p className="text-slate-350 text-sm mt-1 font-medium">Summarizing all platform micro-services, databases, and configuration panels.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <button 
                            onClick={() => fetchDashboardData(true)} 
                            className="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            Force Refresh
                        </button>
                        <Link
                            href="/superadmin/dashboard/products/create"
                            className="bg-cureza-green hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-950/20"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Add Product
                        </Link>
                    </div>
                </div>
            </div>

            {/* Core Highlight KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-emerald-600">
                        <DollarSign size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                            <DollarSign size={22} />
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
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-blue-650">
                        <ShoppingBag size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                            <ShoppingBag size={22} />
                        </div>
                        <Link href="/superadmin/dashboard/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Orders Placed</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_orders}</h3>
                        <p className="text-xs font-semibold text-gray-555 flex items-center gap-1">
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
                            <Store size={22} />
                        </div>
                        <Link href="/superadmin/dashboard/users/sellers" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="mt-4 space-y-1">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Registered Sellers</p>
                        <h3 className="text-2xl font-black text-gray-900">{stats.total_sellers}</h3>
                        <p className="text-xs font-semibold text-gray-550 flex items-center gap-1.5">
                            <span className="text-emerald-600 font-extrabold">{stats.active_sellers} active</span>
                            <span>•</span>
                            <span className="text-amber-605 font-extrabold flex items-center gap-0.5">
                                <Clock size={10} />
                                {stats.pending_approvals} pending
                            </span>
                        </p>
                    </div>
                </div>

                {/* Users/Doctors Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-purple-650">
                        <Users size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
                            <Users size={22} />
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

            {/* Interactive Filters and Real-Time Search Bar */}
            <div className="bg-white rounded-3xl border border-gray-100 p-4 md:p-6 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                    {/* Search Controls */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to filter module summaries (e.g. coupon, reviews, scraper)..."
                            className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cureza-green/30 focus:border-cureza-green transition-all"
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

                    {/* Category Selector Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
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
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                                    ${selectedCategory === tab.id 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                        : 'bg-white text-gray-600 border-gray-150 hover:bg-gray-50'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {searchQuery && (
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
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
                            className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
                        >
                            {/* Accent Bar */}
                            <div className={`h-1.5 bg-gradient-to-r ${module.color}`} />
                            
                            <div className="p-6 flex-1 space-y-4">
                                {/* Card Header */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight group-hover:text-cureza-green transition-colors">
                                            {module.title}
                                        </h3>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${module.bgLight}`}>
                                            {module.category === 'catalog' ? 'Catalog & Sales' : 
                                             module.category === 'users' ? 'Users & Reviews' : 
                                             module.category === 'marketing' ? 'Marketing & Circle' : 'System & Settings'}
                                        </span>
                                    </div>
                                    <div className={`p-2.5 rounded-2xl ${module.iconBg} transition-transform group-hover:scale-105`}>
                                        <IconComponent size={20} />
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-gray-550 leading-relaxed font-medium">
                                    {module.description}
                                </p>

                                {/* Micro-Metrics Widget Block */}
                                <div className="bg-gray-50/75 rounded-2xl p-3 border border-gray-100/50 grid grid-cols-3 gap-2">
                                    {module.metrics.map((metric, idx) => (
                                        <div key={idx} className="text-center space-y-0.5">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate">
                                                {metric.label}
                                            </p>
                                            <p className={`text-xs font-black tracking-tight truncate
                                                ${metric.warning ? 'text-amber-600' : metric.success ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                {metric.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Sub-menus Quick links */}
                                <div className="space-y-2">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
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
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-0.5
                                                        ${isMatched
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold shadow-sm scale-102' 
                                                            : 'bg-white text-gray-600 border-gray-150 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'}`}
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
                            <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-50 flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                                    {module.links.length} subsections
                                </span>
                                <Link 
                                    href={module.links[0]?.url || '#'} 
                                    className="text-slate-800 font-black hover:text-cureza-green transition-colors inline-flex items-center gap-1 text-[11px] uppercase tracking-wider"
                                >
                                    Access Panel
                                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>
                    );
                })}

                {filteredModules.length === 0 && (
                    <div className="col-span-full py-16 bg-white border border-gray-100 rounded-3xl text-center space-y-3">
                        <AlertCircle className="mx-auto text-gray-300" size={48} />
                        <div className="space-y-1">
                            <h4 className="font-extrabold text-gray-800">No matching modules found</h4>
                            <p className="text-xs text-gray-400">Try adjusting your search keywords or switching filters.</p>
                        </div>
                        <button 
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                            className="bg-slate-100 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                        >
                            Reset Dashboard Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Monitor Logs Rows (Recent Orders & Activity Logs) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Recent Sales Activity</h2>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Latest invoice summaries from storefront</p>
                        </div>
                        <Link 
                            href="/superadmin/dashboard/orders" 
                            className="text-cureza-green hover:underline text-xs font-extrabold uppercase tracking-wider flex items-center gap-1"
                        >
                            All Orders <ChevronRight size={14} />
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

                {/* Audit Logs */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Security Audit Logs</h2>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Latest administrator and staff actions</p>
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
        </div>
    );
}
