import Link from 'next/link';
import { Tag, CreditCard } from 'lucide-react';

export function BankOfferStrip() {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center gap-3 text-center">
                    <CreditCard size={24} className="flex-shrink-0" />
                    <p className="text-sm md:text-base font-semibold">
                        🎉 Get 10% Instant Discount on HDFC, ICICI & Axis Bank Cards | Min. Order ₹999
                    </p>
                    <Link href="/offers" className="text-yellow-300 hover:text-yellow-100 underline whitespace-nowrap text-sm md:text-base font-medium">
                        View Offers
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function SellerBannerStrip() {
    return (
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">Become a Seller on Cureza</h2>
                        <p className="text-lg text-green-100">
                            Reach millions of customers | Zero listing fee | Easy onboarding
                        </p>
                    </div>
                    <Link
                        href="/seller/register"
                        className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-green-50 transition shadow-lg whitespace-nowrap"
                    >
                        Start Selling
                    </Link>
                </div>
            </div>
        </div>
    );
}
