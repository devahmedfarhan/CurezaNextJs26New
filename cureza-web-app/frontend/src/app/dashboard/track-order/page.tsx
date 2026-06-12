'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Truck, Package, MapPin } from 'lucide-react';

export default function TrackOrderPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Track Order</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">#ORD-2025-1001</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-bold text-charcoal dark:text-gray-100">Arriving by Nov 22</h3>
                        <p className="text-gray-500 dark:text-gray-400">Your package is on its way!</p>
                    </div>
                    <div className="w-full md:w-1/2 bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-cureza-green h-full w-3/4 rounded-full"></div>
                    </div>
                </div>

                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                    <div className="space-y-12">
                        {/* Step 1 */}
                        <div className="relative flex gap-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center z-10 ring-8 ring-white dark:ring-gray-900 shadow-sm">
                                <Truck size={24} />
                            </div>
                            <div className="pt-2">
                                <h4 className="font-bold text-lg text-charcoal dark:text-gray-100">Out for Delivery</h4>
                                <p className="text-gray-500 dark:text-gray-400">Nov 22, 08:00 AM • Bengaluru Hub</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Courier partner: Delhivery (Tracking ID: 123456789)</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex gap-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center z-10 ring-8 ring-white dark:ring-gray-900 shadow-sm">
                                <MapPin size={24} />
                            </div>
                            <div className="pt-2">
                                <h4 className="font-bold text-lg text-charcoal dark:text-gray-100">Reached Destination Hub</h4>
                                <p className="text-gray-500 dark:text-gray-400">Nov 21, 10:00 PM • Bengaluru Hub</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex gap-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center z-10 ring-8 ring-white dark:ring-gray-900 shadow-sm">
                                <Package size={24} />
                            </div>
                            <div className="pt-2">
                                <h4 className="font-bold text-lg text-charcoal dark:text-gray-100">Shipped</h4>
                                <p className="text-gray-500 dark:text-gray-400">Nov 21, 02:00 PM • Mumbai Warehouse</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex gap-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center z-10 ring-8 ring-white dark:ring-gray-900 shadow-sm">
                                <CheckCircle size={24} />
                            </div>
                            <div className="pt-2">
                                <h4 className="font-bold text-lg text-charcoal dark:text-gray-100">Order Placed</h4>
                                <p className="text-gray-500 dark:text-gray-400">Nov 20, 02:15 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
