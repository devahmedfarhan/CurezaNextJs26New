import { Shield, Truck, RotateCcw, BadgeCheck, Headset } from 'lucide-react';

export default function TrustIcons() {
    const badges = [
        {
            icon: Shield,
            title: 'Secure Payment',
            description: '100% Protected'
        },
        {
            icon: Truck,
            title: 'Free Shipping',
            description: 'On orders above ₹499'
        },
        {
            icon: RotateCcw,
            title: 'Easy Returns',
            description: '7-day return policy'
        },
        {
            icon: BadgeCheck,
            title: '100% Authentic',
            description: 'Verified products'
        },
        {
            icon: Headset,
            title: '24/7 Support',
            description: 'Always here to help'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-6 border-t border-gray-200 dark:border-gray-700">
            {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                    <div
                        key={badge.title}
                        className="flex flex-col items-center text-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-cureza-green flex items-center justify-center">
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-charcoal dark:text-gray-100">
                                {badge.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {badge.description}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
