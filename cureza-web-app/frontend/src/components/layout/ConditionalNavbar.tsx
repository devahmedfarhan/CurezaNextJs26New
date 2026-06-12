'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
    const pathname = usePathname();

    // Define paths where the main navbar should be hidden
    const hideNavbarPaths = [
        '/seller/dashboard', '/seller/onboarding', '/seller/approval',
        '/doctor/dashboard', '/doctor/onboarding', '/doctor/approval', '/doctor/register', '/doctor/login',
        '/superadmin'
    ];

    // Check if current path starts with any of the hidden paths
    const shouldHideNavbar = hideNavbarPaths.some(path => pathname.startsWith(path));

    if (shouldHideNavbar) {
        return null;
    }

    return <Navbar />;
}
