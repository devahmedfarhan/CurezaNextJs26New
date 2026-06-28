'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    User,
    MapPin,
    ShoppingBag,
    FileText,
    Wallet,
    Heart,
    Star,
    Share2,
    Settings,
    LogOut,
    Target,
    HelpCircle,
    Eye,
    Menu,
    X
} from 'lucide-react';

const SIDEBAR_SECTIONS = [
    {
        title: 'Overview',
        links: [
            { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        ]
    },
    {
        title: 'Orders & Purchases',
        links: [
            { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
            { name: 'Track Order', href: '/dashboard/track-order', icon: MapPin },
            { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
            { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
            { name: 'Recently Viewed', href: '/dashboard/recently-viewed', icon: Eye },
        ]
    },
    {
        title: 'Account Settings',
        links: [
            { name: 'My Profile', href: '/dashboard/profile', icon: User },
            { name: 'Address Book', href: '/dashboard/addresses', icon: MapPin },
        ]
    },
    {
        title: 'Wellness & Rewards',
        links: [
            { name: 'Cureza Circle', href: '/dashboard/circle', icon: Star },
            { name: 'Wallet & Rewards', href: '/dashboard/circle/rewards', icon: Wallet },
            { name: 'Refer & Earn', href: '/dashboard/circle/referrals', icon: Share2 },
            { name: 'My Reviews', href: '/dashboard/reviews', icon: Star },
            { name: 'Circle Guidelines', href: '/dashboard/circle/guidelines', icon: HelpCircle },
        ]
    },
    {
        title: 'Support',
        links: [
            { name: 'Support & FAQs', href: '/dashboard/support', icon: HelpCircle },
            { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ]
    }
];

interface UserType {
    name?: string;
    email?: string;
    profile_image_url?: string;
}

function ProfileHeader({ user }: { user: UserType | null | undefined }) {
    return (
        <div className="p-6 bg-gradient-to-br from-[#052326]/5 to-[#052326]/[0.02] dark:from-gray-800/20 dark:to-gray-900/5 border-b border-black/50">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#052326] text-white rounded-[10px] overflow-hidden flex items-center justify-center font-bold text-lg border border-black/20 shrink-0 shadow-sm relative group">
                    {user?.profile_image_url ? (
                        <img
                            src={user.profile_image_url}
                            alt={user.name || 'User'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-[#F8F3EF] tracking-wider select-none font-bold">
                            {user?.name 
                                ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) 
                                : 'U'}
                        </span>
                    )}
                </div>
                <div className="overflow-hidden flex flex-col">
                    <h3 className="font-bold text-sm text-[#052326] dark:text-gray-100 truncate tracking-tight">{user?.name || 'User'}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5 font-medium">{user?.email || 'email@example.com'}</p>
                    <div className="mt-1.5 self-start">
                        <span className="inline-flex items-center text-[9px] font-bold bg-[#052326]/10 dark:bg-white/10 text-[#052326] dark:text-gray-200 px-1.5 py-0.5 rounded-[4px] border border-[#052326]/10 dark:border-white/10 uppercase tracking-wider">
                            Customer Account
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarMenu({
    pathname,
    logout,
    closeMobileSidebar,
    className = "p-4 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar space-y-5"
}: {
    pathname: string;
    logout: () => void;
    closeMobileSidebar?: () => void;
    className?: string;
}) {
    return (
        <div className={className}>
            {SIDEBAR_SECTIONS.map((section, idx) => (
                <div key={idx} className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#052326]/40 dark:text-gray-500 font-bold px-3 block">
                        {section.title}
                    </span>
                    <div className="space-y-0.5">
                        {section.links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={closeMobileSidebar}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-xs transition-all ${isActive
                                        ? 'bg-[#052326] text-[#F8F3EF] font-bold shadow-md shadow-[#052326]/10'
                                        : 'text-gray-600 dark:text-gray-400 font-medium hover:bg-[#052326]/5 hover:text-[#052326]'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="pt-2 border-t border-black/50">
                <button
                    onClick={() => {
                        if (closeMobileSidebar) closeMobileSidebar();
                        logout();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut size={16} />
                    Logout Account
                </button>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    return (
        <div className="customer-theme bg-[#F2F2F2] dark:bg-[#121212] min-h-screen py-6 md:py-10 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
                    
                    {/* MOBILE SIDEBAR BACKDROP & DRAWER */}
                    {isSidebarOpen && (
                        <div 
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <aside 
                        className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white dark:bg-gray-900 border-r border-black/10 dark:border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
                            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div className="absolute top-4 right-4 z-50">
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
                                aria-label="Close sidebar"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="h-full flex flex-col overflow-hidden">
                            <ProfileHeader user={user} />
                            <SidebarMenu 
                                pathname={pathname} 
                                logout={logout} 
                                closeMobileSidebar={() => setIsSidebarOpen(false)}
                                className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-5"
                            />
                        </div>
                    </aside>
                    
                    {/* DESKTOP SIDEBAR */}
                    <aside className="hidden lg:block w-[280px] shrink-0 lg:sticky lg:top-6">
                        <div className="bg-white dark:bg-gray-900 border border-black/50 rounded-[8px] overflow-hidden">
                            <ProfileHeader user={user} />
                            <SidebarMenu pathname={pathname} logout={logout} />
                        </div>
                    </aside>

                    {/* MAIN CONTENT WRAPPER */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        {/* Header Notification Strip */}
                        <header className="flex items-center px-4 md:px-6 py-3.5 bg-white dark:bg-gray-900 border border-black/50 rounded-[10px] gap-2">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#052326] dark:text-gray-300 transition-colors"
                                aria-label="Open sidebar"
                            >
                                <Menu size={20} />
                            </button>
                            <span className="text-xs text-gray-400 font-semibold mr-auto">My Account</span>
                        </header>

                        {/* Page Content */}
                        <main className="bg-transparent">
                            {children}
                        </main>
                    </div>

                </div>
            </div>
        </div>
    );
}
