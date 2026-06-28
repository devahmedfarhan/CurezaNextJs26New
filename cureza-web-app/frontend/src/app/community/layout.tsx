import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cureza Circle - Loyalty Rewards, Community & Gamification',
    description: 'Join Cureza Circle and earn XP, unlock tiers, collect badges, and redeem exclusive wellness rewards. Connect with customers, influencers, sellers, and doctors in India\'s wellness community.',
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
