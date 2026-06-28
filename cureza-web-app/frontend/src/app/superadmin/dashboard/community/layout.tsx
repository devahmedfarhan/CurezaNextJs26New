'use client';

import { usePathname } from 'next/navigation';

const routeMeta: Record<string, { title: string; description: string }> = {
    '/superadmin/dashboard/community': {
        title: 'Circle Home & XP Rules',
        description: 'Configure global XP rules, view participation statistics, and manage gamification assets.'
    },
    '/superadmin/dashboard/community/activity': {
        title: 'Points & XP Activity Log',
        description: 'Audit trail of all points credited and debited across the system.'
    },
    '/superadmin/dashboard/community/referrals': {
        title: 'Referrals Log',
        description: 'Track registration connections, invitation codes, and points distribution.'
    },
    '/superadmin/dashboard/community/messages': {
        title: 'Influencer Messages',
        description: 'Respond to influencer queries, partnership proposals, and product sample requests.'
    },
    '/superadmin/dashboard/community/challenges': {
        title: 'Challenges Manager',
        description: 'Create and modify ongoing quests that reward users with points.'
    },
    '/superadmin/dashboard/community/badges': {
        title: 'Badges & Achievements Manager',
        description: 'Create achievements that users automatically unlock as they perform wellness activities.'
    },
    '/superadmin/dashboard/community/rewards': {
        title: 'Rewards Shop Manager',
        description: 'Configure catalog items and process user points redemptions.'
    },
    '/superadmin/dashboard/community/guidelines': {
        title: 'Circle Guidelines Manual',
        description: 'Reference manual for configuring XP rules, processing user redemptions, and running CLI tools.'
    }
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const currentMeta = routeMeta[pathname] || {
        title: 'Cureza Circle & Gamification',
        description: 'Configure global XP rules, view participation statistics, and manage gamification assets.'
    };

    return (
        <div className="w-full space-y-6">
            {/* Dynamic Header */}
            <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{currentMeta.title}</h1>
                <p className="text-xs text-gray-500 font-normal mt-0.5">{currentMeta.description}</p>
            </div>

            {/* Page Content */}
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}
