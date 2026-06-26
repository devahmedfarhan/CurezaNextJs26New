'use client';

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
    Eye
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
            { name: 'Challenges', href: '/dashboard/circle/challenges', icon: Target },
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="customer-theme bg-[#F2F2F2] dark:bg-[#121212] min-h-screen py-6 md:py-10 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
                    
                    {/* SIDEBAR */}
                    <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-6">
                        <div className="bg-white dark:bg-gray-900 border border-black/50 rounded-[8px] overflow-hidden">
                            {/* Profile Info Header */}
                            <div className="p-6 bg-gradient-to-br from-[#052326]/5 to-[#052326]/[0.02] dark:from-gray-800/20 dark:to-gray-900/5 border-b border-black/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#052326] text-white rounded-[10px] overflow-hidden flex items-center justify-center font-bold text-lg border border-black/20 shrink-0 shadow-sm relative group">
                                        {user?.profile_image_url ? (
                                            <img
                                                src={user.profile_image_url}
                                                alt={user.name}
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

                            {/* Sidebar Links */}
                            <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar space-y-5">
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
                                        onClick={() => logout()}
                                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT WRAPPER */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        {/* Header Notification Strip */}
                        <header className="flex justify-end items-center px-6 py-3.5 bg-white dark:bg-gray-900 border border-black/50 rounded-[10px]">
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
