import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-warm-sand dark:bg-gray-950 pt-16 pb-8 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Info */}
                    <div>
                        <Link href="/" className="text-2xl font-bold text-cureza-green flex items-center gap-2 mb-4">
                            <span className="bg-cureza-green text-white p-1 rounded">Cz</span>
                            Cureza
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            India's most trusted multi-vendor marketplace for authentic Ayurvedic, Herbal, and Wellness products. Verified by Doctors.
                        </p>
                        <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                            <a href="#" className="hover:text-cureza-green"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-cureza-green"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-cureza-green"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-cureza-green"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-charcoal dark:text-gray-100 mb-4">Shop</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/shop" className="hover:text-cureza-green">All Products</Link></li>
                            <li><Link href="/new-launches" className="hover:text-cureza-green">New Launches</Link></li>
                            <li><Link href="/bestsellers" className="hover:text-cureza-green">Bestsellers</Link></li>
                            <li><Link href="/doctor" className="hover:text-cureza-green">Consult a Doctor</Link></li>
                            <li><Link href="/offers" className="hover:text-cureza-green">Offers & Coupons</Link></li>
                        </ul>
                    </div>

                    {/* Company & Community */}
                    <div>
                        <h3 className="font-bold text-charcoal dark:text-gray-100 mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/about" className="hover:text-cureza-green">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-cureza-green">Careers</Link></li>
                            <li><Link href="/press" className="hover:text-cureza-green">Press & Media</Link></li>
                            <li><Link href="/community" className="hover:text-cureza-green">Community</Link></li>
                            <li><Link href="/blog" className="hover:text-cureza-green">Blog</Link></li>
                            <li><Link href="/seller/sellerpolicy" className="hover:text-cureza-green">Seller Policy</Link></li>
                            <li><Link href="/legal/cancellation-returns" className="hover:text-cureza-green">Cancellation & Returns</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold text-charcoal dark:text-gray-100 mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link href="/track-order" className="hover:text-cureza-green">Track Order</Link></li>
                            <li><Link href="/faq" className="hover:text-cureza-green">Help Center / FAQ</Link></li>
                            <li><Link href="/returns" className="hover:text-cureza-green">Return Policy</Link></li>
                            <li><Link href="/seller" className="hover:text-cureza-green">Sell on Cureza</Link></li>
                            <li><Link href="/contact" className="hover:text-cureza-green">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <p>© 2025 Cureza Wellness Pvt Ltd. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/legal/privacy-policy" className="hover:text-charcoal dark:hover:text-gray-200">Privacy Policy</Link>
                        <Link href="/legal/terms-of-service" className="hover:text-charcoal dark:hover:text-gray-200">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
