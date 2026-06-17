'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Search, Bell } from 'lucide-react';
import NotificationBell from '@/components/common/NotificationBell';
import { Skeleton } from "@/components/ui/skeleton"

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
        return 'approvals';
    }
    if (pathname.includes('/superadmin/dashboard/marketing')) {
        return 'marketing';
    }
    if (pathname.includes('/superadmin/dashboard/events')) {
        return 'events';
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
    if (pathname.includes('/superadmin/dashboard/settings')) {
        return 'settings';
    }
    return null;
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

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

    // Show Skeleton Layout while loading
    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm sticky top-0 z-10">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-4 w-px bg-gray-200 mx-2" />
                        <div className="flex flex-1 items-center justify-between">
                            <div className="flex items-center gap-4 w-96">
                                <Skeleton className="h-9 w-full rounded-lg" />
                            </div>
                            <div className="flex items-center gap-6">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                                    <div className="text-right hidden sm:block space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 overflow-y-auto">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Skeleton className="h-32 rounded-xl" />
                                <Skeleton className="h-32 rounded-xl" />
                                <Skeleton className="h-32 rounded-xl" />
                                <Skeleton className="h-32 rounded-xl" />
                            </div>
                            <Skeleton className="h-96 rounded-xl" />
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
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm sticky top-0 z-10">
                    <SidebarTrigger className="-ml-1" />
                    <div className="h-4 w-px bg-gray-200 mx-2" />

                    <div className="flex flex-1 items-center justify-between">
                        <div className="flex items-center gap-4 w-96">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Global Search (Users, Orders, Products)..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cureza-green/50"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <NotificationBell />
                            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-800">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-gray-500">{user?.email || 'Super Admin'}</p>
                                </div>
                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center font-bold text-gray-600">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
