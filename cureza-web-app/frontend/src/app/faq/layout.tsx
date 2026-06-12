import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'FAQ & Help Center - Cureza | Customer Support & Answers',
    description: 'Find answers to frequently asked questions about Cureza. Get help with orders, returns, payments, account support, and more. 24/7 customer assistance available.',
};

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children;
}
