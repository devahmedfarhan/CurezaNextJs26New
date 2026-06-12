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

const SIDEBAR_LINKS = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
    { name: 'Address Book', href: '/dashboard/addresses', icon: MapPin },
    { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
    { name: 'Wallet & Rewards', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Cureza Circle', href: '/dashboard/community', icon: Star },
    { name: 'Challenges', href: '/dashboard/challenges', icon: Target },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'My Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Refer & Earn', href: '/dashboard/referrals', icon: Share2 },
    { name: 'Public Profile', href: '/community/member/me', icon: User }, // 'me' will redirect or be handled
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Support & FAQs', href: '/dashboard/support', icon: HelpCircle },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-24">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-cureza-green text-white rounded-full overflow-hidden flex items-center justify-center font-bold text-xl border border-gray-200">
                                {user?.profile_image_url ? (
                                    <img
                                        src={user.profile_image_url}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-charcoal dark:text-gray-100 truncate">{user?.name || 'User'}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'email@example.com'}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="p-4 space-y-1">
                        {SIDEBAR_LINKS.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-green-50 dark:bg-green-900/20 text-cureza-green'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-charcoal dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.name}
                                </Link>
                            );
                        })}

                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-4"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="flex justify-end items-center p-4 bg-white rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
                    <NotificationBell />
                </header>
                {children}
            </main>
        </div>
    );
}
