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
    Bell,
    Target,
    HelpCircle
} from 'lucide-react';
import NotificationBell from '@/components/common/NotificationBell';

const SIDEBAR_SECTIONS = [
    {
        title: 'Core Account',
        links: [
            { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
            { name: 'My Profile', href: '/dashboard/profile', icon: User },
            { name: 'Address Book', href: '/dashboard/addresses', icon: MapPin },
        ]
    },
    {
        title: 'Wellness Journey',
        links: [
            { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
            { name: 'Cureza Circle', href: '/dashboard/circle', icon: Star },
            { name: 'Challenges', href: '/dashboard/circle/challenges', icon: Target },
        ]
    },
    {
        title: 'Purchases & Rewards',
        links: [
            { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
            { name: 'Wallet & Rewards', href: '/dashboard/circle/rewards', icon: Wallet },
            { name: 'Circle Guidelines', href: '/dashboard/circle/guidelines', icon: HelpCircle },
            { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
            { name: 'My Reviews', href: '/dashboard/reviews', icon: Star },
            { name: 'Refer & Earn', href: '/dashboard/circle/referrals', icon: Share2 },
        ]
    },
    {
        title: 'Support & Settings',
        links: [
            { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
            { name: 'Support & FAQs', href: '/dashboard/support', icon: HelpCircle },
            { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        ]
    }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="bg-[#F8F3EF] min-h-screen py-10 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* SIDEBAR */}
                    <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-24">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800 overflow-hidden">
                            {/* Profile Info Header */}
                            <div className="p-6 bg-[#052326]/5 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#052326] text-white rounded-full overflow-hidden flex items-center justify-center font-bold text-xl border border-[#052326]/10 shrink-0">
                                        {user?.profile_image_url ? (
                                            <img
                                                src={user.profile_image_url}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[#F8F3EF]">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-sm text-[#052326] dark:text-gray-100 truncate">{user?.name || 'User'}</h3>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email || 'email@example.com'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Links */}
                            <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar space-y-5">
                                {SIDEBAR_SECTIONS.map((section, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <span className="text-[10px] uppercase tracking-wider text-[#052326]/40 dark:text-gray-500 font-extrabold px-3 block">
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
                                                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                                                            ? 'bg-[#052326] text-[#F8F3EF] shadow-md shadow-[#052326]/10'
                                                            : 'text-gray-600 dark:text-gray-400 hover:bg-[#052326]/5 hover:text-[#052326]'
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

                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={() => logout()}
                                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
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
                        <header className="flex justify-end items-center px-6 py-3.5 bg-white dark:bg-gray-900 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-800">
                            <span className="text-xs text-gray-400 font-semibold mr-auto">Cureza Customer Workspace</span>
                            <NotificationBell />
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
