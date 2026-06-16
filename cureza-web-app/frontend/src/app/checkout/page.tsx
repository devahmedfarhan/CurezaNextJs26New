'use client';

import ShopfloCheckout from '@/components/checkout/ShopfloCheckout';

export default function CheckoutPage() {
    return (
        <div className="bg-gray-950/40 min-h-screen py-10 px-4 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/10 via-gray-950/30 to-black/10 backdrop-blur-3xl">
            <ShopfloCheckout />
        </div>
    );
}
