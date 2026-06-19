'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function SubmenuNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'refunds';

    const navItems = [
        { label: 'All Orders', href: '/superadmin/dashboard/orders' },
        { label: 'Refund Requests', href: '/superadmin/dashboard/refunds?tab=refunds' },
        { label: 'Cancelled Products', href: '/superadmin/dashboard/refunds?tab=cancelled' },
        { label: 'Shipments', href: '/superadmin/dashboard/shipments' },
    ];

    const isActive = (item: typeof navItems[0]) => {
        if (item.href.startsWith('/superadmin/dashboard/orders')) {
            return pathname === '/superadmin/dashboard/orders';
        }
        if (item.href.startsWith('/superadmin/dashboard/shipments')) {
            return pathname === '/superadmin/dashboard/shipments';
        }
        if (item.href.includes('tab=refunds')) {
            return pathname === '/superadmin/dashboard/refunds' && currentTab === 'refunds';
        }
        if (item.href.includes('tab=cancelled')) {
            return pathname === '/superadmin/dashboard/refunds' && currentTab === 'cancelled';
        }
        return false;
    };

    return (
        <div className="flex border-b border-neutral-950/10 dark:border-neutral-800 gap-6 overflow-x-auto pb-px">
            {navItems.map((item) => {
                const active = isActive(item);
                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`pb-3 text-xs font-semibold border-b-[1.5px] whitespace-nowrap transition-colors -mb-[1px] ${
                            active
                                ? 'border-black text-black dark:border-white dark:text-white'
                                : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white font-normal'
                        }`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </div>
    );
}
