'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { 
    Search, Bell, ChevronRight, Cpu, Layers, Terminal, 
    Settings, User, LogOut, Command, Plus, HelpCircle, 
    Activity, ListFilter, CheckCircle2, Shield, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import NotificationBell from '@/components/common/NotificationBell';
import { Skeleton } from "@/components/ui/skeleton"
import api from '@/lib/api';

const getPermissionForPath = (pathname: string): string | null => {
    if (pathname.includes('/superadmin/dashboard/analytics') || pathname.includes('/superadmin/dashboard/reports')) {
        return 'dashboard';
    }
    if (pathname.includes('/superadmin/dashboard/products') || pathname.includes('/superadmin/dashboard/scraper') || pathname.includes('/superadmin/dashboard/categories') || pathname.includes('/superadmin/dashboard/brands') || pathname.includes('/superadmin/dashboard/attributes')) {
        return 'products';
    }
    if (pathname.includes('/superadmin/dashboard/ratings') || pathname.includes('/superadmin/dashboard/reviews')) {
        return 'reviews';
    }
    if (pathname.includes('/superadmin/dashboard/orders') || pathname.includes('/superadmin/dashboard/refunds') || pathname.includes('/superadmin/dashboard/shipments')) {
        return 'orders';
    }
    if (pathname.includes('/superadmin/dashboard/users')) {
        return 'users';
    }
    if (pathname.includes('/superadmin/dashboard/approvals') || pathname.includes('/superadmin/dashboard/seller-requests')) {
        return 'users';
    }
    if (pathname.includes('/superadmin/dashboard/marketing')) {
        return 'marketing';
    }

    if (pathname.includes('/superadmin/dashboard/finance') || pathname.includes('/superadmin/dashboard/payouts')) {
        return 'finance';
    }
    if (pathname.includes('/superadmin/dashboard/support')) {
        return 'support';
    }
    if (pathname.includes('/superadmin/dashboard/community')) {
        return 'community';
    }
    if (pathname.includes('/superadmin/dashboard/cms') || pathname.includes('/superadmin/dashboard/menu')) {
        return 'cms';
    }
    if (pathname.includes('/superadmin/dashboard/settings') || pathname.includes('/superadmin/dashboard/communication')) {
        return 'settings';
    }
    return null;
};

// Quick navigation actions for search command palette
const SEARCHABLE_PAGES = [
    { title: 'Sellers Directory', path: '/superadmin/dashboard/users/sellers', keywords: 'sellers vendors stores accounts' },
    { title: 'Doctors Onboarding & Directory', path: '/superadmin/dashboard/users/doctors', keywords: 'doctors kyc verification md' },
    { title: 'Product Change Requests', path: '/superadmin/dashboard/products/change-requests', keywords: 'products updates edit approvals change' },
    { title: 'All Products List', path: '/superadmin/dashboard/products', keywords: 'products inventory stock catalog' },
    { title: 'Categories & Taxonomy', path: '/superadmin/dashboard/categories', keywords: 'categories subcategories classification' },
    { title: 'Customer Support Tickets', path: '/superadmin/dashboard/support', keywords: 'support tickets helpline chat issues' },
    { title: 'Order History & Statuses', path: '/superadmin/dashboard/orders', keywords: 'orders invoices tracks sales' },
    { title: 'Refund Requests & Settlements', path: '/superadmin/dashboard/refunds', keywords: 'refunds chargebacks payments finance' },
    { title: 'Blog CMS Posts', path: '/superadmin/dashboard/cms/blogs', keywords: 'blogs posts articles writer' },
    { title: 'General System Settings', path: '/superadmin/dashboard/settings/general', keywords: 'settings timezone configurations profile' },
    { title: 'Payment Gateways Configuration', path: '/superadmin/dashboard/settings/payments', keywords: 'payments razorpay gateways stripe' },
    { title: 'System Audits & Logs', path: '/superadmin/dashboard/settings/logs', keywords: 'logs activity audits tracking backup' },
    { title: 'User Reviews & Star Ratings', path: '/superadmin/dashboard/ratings', keywords: 'ratings reviews feedback stars' }
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Custom menu states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    
    // Stats indicators
    const [systemLoad, setSystemLoad] = useState('8%');
    const [apiLatency, setApiLatency] = useState('14ms');
    const [pendingActionCount, setPendingActionCount] = useState(0);

    const searchRef = useRef<HTMLDivElement>(null);
    const quickActionsRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Fetch quick stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                if (res.data?.stats?.pending_approvals) {
                    setPendingActionCount(res.data.stats.pending_approvals);
                }
            } catch {
                // Safe fallback to notification unread count or mock
                try {
                    const resNotif = await api.get('/notifications/unread-count');
                    setPendingActionCount(resNotif.data.count || 0);
                } catch {
                    setPendingActionCount(0);
                }
            }
        };

        if (user && (user.role === 'admin' || user.role === 'super_admin')) {
            void fetchStats();
        }

        // Simulate micro-fluctuations in load and latency for realism
        const interval = setInterval(() => {
            setSystemLoad(`${Math.floor(Math.random() * 8) + 4}%`);
            setApiLatency(`${Math.floor(Math.random() * 10) + 8}ms`);
        }, 10000);

        return () => clearInterval(interval);
    }, [user]);

    // Keyboard shortcut to focus search input (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setSearchFocused(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close menus on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (searchRef.current && !searchRef.current.contains(target)) {
                setSearchFocused(false);
            }
            if (quickActionsRef.current && !quickActionsRef.current.contains(target)) {
                setQuickActionsOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
                setProfileMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Authorization checks
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/superadmin/login');
            } else if (user.role !== 'admin' && user.role !== 'super_admin') {
                router.push('/unauthorized');
            } else if (user.role === 'admin') {
                const requiredPermission = getPermissionForPath(pathname);
                if (requiredPermission && (!user.permissions || !user.permissions.includes(requiredPermission))) {
                    router.push('/unauthorized');
                }
            }
        }
    }, [user, isLoading, router, pathname]);

    // Breadcrumbs Generation Helper
    const generateBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        // Exclude root segments
        const breadcrumbSegments = segments.filter(s => s !== 'superadmin' && s !== 'dashboard');
        
        return (
            <nav className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                <span className="hover:text-neutral-900 cursor-pointer" onClick={() => router.push('/superadmin/dashboard')}>
                    SuperAdmin
                </span>
                <ChevronRight size={12} className="text-neutral-300" />
                <span className="hover:text-neutral-900 cursor-pointer" onClick={() => router.push('/superadmin/dashboard')}>
                    Dashboard
                </span>
                {breadcrumbSegments.map((segment, index) => {
                    const path = `/superadmin/dashboard/${breadcrumbSegments.slice(0, index + 1).join('/')}`;
                    const label = segment
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());
                    const isLast = index === breadcrumbSegments.length - 1;

                    return (
                        <div key={path} className="flex items-center gap-1.5">
                            <ChevronRight size={12} className="text-neutral-300" />
                            {isLast ? (
                                <span className="text-neutral-900 font-semibold truncate max-w-[120px] sm:max-w-none">
                                    {label}
                                </span>
                            ) : (
                                <span className="hover:text-neutral-900 cursor-pointer truncate max-w-[80px] sm:max-w-none" onClick={() => router.push(path)}>
                                    {label}
                                </span>
                            )}
                        </div>
                    );
                })}
            </nav>
        );
    };

    // Filtering search results for quick actions command palette
    const filteredSearchResults = SEARCHABLE_PAGES.filter(page => 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        page.keywords.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show Skeleton Layout while loading
    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b-[0.5px] border-black/50 px-4 bg-white sticky top-0 z-10">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-4 w-px bg-gray-200 mx-2" />
                        <div className="flex flex-1 items-center justify-between">
                            <div className="flex items-center gap-4 w-96">
                                <Skeleton className="h-9 w-full rounded-lg" />
                            </div>
                            <div className="flex items-center gap-6">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <div className="flex items-center gap-3 pl-6 border-l-[0.5px] border-black/50">
                                    <div className="text-right hidden sm:block space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-10 w-10 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 overflow-y-auto bg-white">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-48 rounded-lg" />
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Skeleton className="h-32 rounded-lg" />
                                <Skeleton className="h-32 rounded-lg" />
                                <Skeleton className="h-32 rounded-lg" />
                                <Skeleton className="h-32 rounded-lg" />
                            </div>
                            <Skeleton className="h-96 rounded-lg" />
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return null;
    }

    return (
        <SidebarProvider className="superadmin-theme">
            <AppSidebar />
            <SidebarInset className="bg-neutral-50/20">
                {/* Premium Detailed Super Admin Header */}
                <header className="flex h-16 shrink-0 items-center border-b-[0.5px] border-black/50 px-6 bg-white sticky top-0 z-40 transition-all">
                    
                    {/* Left: Sidebar toggle & Breadcrumbs */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <SidebarTrigger className="-ml-1 text-neutral-500 hover:text-neutral-900 border-[0.5px] border-black/50 rounded-lg hover:bg-neutral-50 p-1.5 bg-white" />
                        <div className="h-4 w-px bg-neutral-950/10" />
                        <div className="hidden md:block truncate">
                            {generateBreadcrumbs()}
                        </div>
                    </div>

                    {/* Middle: Premium Global Command Search */}
                    <div className="flex-1 max-w-md mx-4 relative hidden sm:block" ref={searchRef}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                placeholder="Search dashboards, routes, actions..."
                                className="w-full pl-9 pr-14 py-2 bg-neutral-50 hover:bg-neutral-100/50 border-[0.5px] border-black/50 rounded-lg text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all placeholder-neutral-400 text-neutral-900"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-white border-[0.5px] border-black/50 rounded text-[9px] font-bold text-neutral-400">
                                <Command size={10} />
                                <span>K</span>
                            </div>
                        </div>

                        {/* Search Results Dropdown Overlay */}
                        {searchFocused && (
                            <div className="absolute left-0 right-0 mt-1.5 bg-white border-[0.5px] border-black/50 rounded-lg overflow-hidden z-50 flex flex-col max-h-[360px] animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="p-2 border-b-[0.5px] bg-neutral-50/50 border-black/50 text-[10px] font-bold text-neutral-400 tracking-wider uppercase flex justify-between">
                                    <span>Quick Navigator</span>
                                    <span>{filteredSearchResults.length} pages found</span>
                                </div>
                                <div className="overflow-y-auto py-1">
                                    {filteredSearchResults.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-neutral-400">
                                            No matched dashboard pages found.
                                        </div>
                                    ) : (
                                        filteredSearchResults.map((page) => (
                                            <button
                                                key={page.path}
                                                onClick={() => {
                                                    router.push(page.path);
                                                    setSearchFocused(false);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center justify-between text-xs font-semibold text-neutral-800 transition-colors"
                                            >
                                                <span>{page.title}</span>
                                                <span className="text-[10px] text-neutral-400 font-normal font-mono bg-neutral-50 px-1.5 py-0.5 rounded border-[0.5px] border-black/50">
                                                    {page.path.replace('/superadmin/dashboard', '..')}
                                                </span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Quick actions, Status, Notification Bell, User menu */}
                    <div className="flex items-center gap-4 shrink-0">
                        
                        {/* System Status Indicators (Pulsing badge) */}
                        <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-neutral-50 border-[0.5px] border-black/50 rounded-lg text-[10px] font-bold text-neutral-500">
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neutral-950"></span>
                                </span>
                                <span>API: {apiLatency}</span>
                            </div>
                            <div className="w-px h-3 bg-neutral-950/10" />
                            <div className="flex items-center gap-1">
                                <Cpu size={12} className="text-neutral-400" />
                                <span>System: {systemLoad}</span>
                            </div>
                            {pendingActionCount > 0 && (
                                <>
                                    <div className="w-px h-3 bg-neutral-950/10" />
                                    <div 
                                        className="flex items-center gap-1 hover:text-neutral-900 cursor-pointer"
                                        onClick={() => router.push('/superadmin/dashboard/users/sellers')}
                                    >
                                        <AlertTriangle size={12} className="text-neutral-600 animate-pulse" />
                                        <span className="text-neutral-800">{pendingActionCount} pending verify</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Quick Actions Hub */}
                        <div className="relative" ref={quickActionsRef}>
                            <button
                                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold rounded-lg border-[0.5px] border-black/50 transition-colors"
                            >
                                <Plus size={14} />
                                <span className="hidden sm:inline">Actions</span>
                            </button>

                            {quickActionsOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border-[0.5px] border-black/50 rounded-lg overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="p-2 border-b-[0.5px] bg-neutral-50/50 border-black/50 text-[10px] font-bold text-neutral-400 tracking-wider uppercase">
                                        SuperAdmin Shortcuts
                                    </div>
                                    <div className="flex flex-col py-1">
                                        <button
                                            onClick={() => {
                                                router.push('/superadmin/dashboard/users/sellers');
                                                setQuickActionsOpen(false);
                                            }}
                                            className="px-4 py-2 text-left text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                                        >
                                            <span>Verify Seller Requests</span>
                                            <ArrowUpRight size={12} className="text-neutral-400" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/superadmin/dashboard/users/doctors');
                                                setQuickActionsOpen(false);
                                            }}
                                            className="px-4 py-2 text-left text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                                        >
                                            <span>Verify Doctor KYC</span>
                                            <ArrowUpRight size={12} className="text-neutral-400" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/superadmin/dashboard/products/change-requests');
                                                setQuickActionsOpen(false);
                                            }}
                                            className="px-4 py-2 text-left text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                                        >
                                            <span>Review Product Changes</span>
                                            <ArrowUpRight size={12} className="text-neutral-400" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/superadmin/dashboard/cms/blogs');
                                                setQuickActionsOpen(false);
                                            }}
                                            className="px-4 py-2 text-left text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                                        >
                                            <span>Compose Blog Post</span>
                                            <ArrowUpRight size={12} className="text-neutral-400" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push('/superadmin/dashboard/settings/logs');
                                                setQuickActionsOpen(false);
                                            }}
                                            className="px-4 py-2 text-left text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
                                        >
                                            <span>System Logs & Backups</span>
                                            <ArrowUpRight size={12} className="text-neutral-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Real-time Notification Bell */}
                        <NotificationBell />

                        {/* Profile menu dropdown (Detailed popover) */}
                        <div className="relative pl-2 border-l-[0.5px] border-black/50 flex items-center" ref={profileMenuRef}>
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center gap-2 hover:opacity-85 focus:outline-none"
                            >
                                <div className="w-9 h-9 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg flex items-center justify-center font-bold text-xs border-[0.5px] border-black/50 transition-colors uppercase">
                                    {user?.name ? user.name.substring(0, 2) : 'AD'}
                                </div>
                            </button>

                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-2 top-full w-72 bg-white border-[0.5px] border-black/50 rounded-lg overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                                    {/* User Details */}
                                    <div className="p-4 border-b-[0.5px] border-black/50 bg-neutral-50/50">
                                        <p className="text-xs font-bold text-neutral-900 truncate">{user?.name || 'Admin User'}</p>
                                        <p className="text-[10px] text-neutral-500 truncate mt-0.5">{user?.email || 'admin@cureza.com'}</p>
                                        <div className="mt-2.5 inline-flex items-center gap-1 text-[9px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded border-[0.5px] border-black/50">
                                            <Shield size={10} />
                                            <span>{user?.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMINISTRATOR'}</span>
                                        </div>
                                    </div>

                                    {/* Privileges & Permissions List */}
                                    <div className="p-4 border-b-[0.5px] border-black/50 text-[10px]">
                                        <p className="font-bold text-neutral-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                                            <Activity size={10} className="text-neutral-500" />
                                            Privileges Checklist
                                        </p>
                                        <div className="grid grid-cols-2 gap-1 font-semibold text-neutral-700">
                                            <span className="flex items-center gap-1 truncate"><CheckCircle2 size={10} className="text-neutral-900 shrink-0" /> Full Access</span>
                                            <span className="flex items-center gap-1 truncate"><CheckCircle2 size={10} className="text-neutral-900 shrink-0" /> KYC Approvals</span>
                                            <span className="flex items-center gap-1 truncate"><CheckCircle2 size={10} className="text-neutral-900 shrink-0" /> CMS Controls</span>
                                            <span className="flex items-center gap-1 truncate"><CheckCircle2 size={10} className="text-neutral-900 shrink-0" /> Financial Logs</span>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="flex flex-col py-1">
                                        <button
                                            onClick={() => {
                                                router.push('/superadmin/dashboard/settings/general');
                                                setProfileMenuOpen(false);
                                            }}
                                            className="px-4 py-2 text-left text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                            <Settings size={14} className="text-neutral-400" />
                                            <span>System Settings</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setProfileMenuOpen(false);
                                            }}
                                            className="px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50/50 flex items-center gap-2 border-t-[0.5px] border-black/50"
                                        >
                                            <LogOut size={14} className="text-red-500" />
                                            <span>Log out account</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </header>

                {/* Dashboard Children Pages */}
                <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
