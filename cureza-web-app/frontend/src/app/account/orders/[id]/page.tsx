'use client';

import Link from 'next/link';
import { ArrowLeft, Download, MapPin, Package, Truck, CheckCircle } from 'lucide-react';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
    // In a real app, fetch order details using params.id
    const orderId = 'ORD-2025-1001';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/account/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Order Details</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">#{orderId} • Nov 20, 2025</p>
                </div>
                <button className="ml-auto flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Download size={16} /> Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Items & Tracking */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tracking Status */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 text-charcoal dark:text-gray-100">Order Status</h3>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="space-y-8">
                                <div className="relative flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center z-10 ring-4 ring-white dark:ring-gray-900">
                                        <CheckCircle size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal dark:text-gray-100">Delivered</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nov 22, 2025, 10:30 AM</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center z-10 ring-4 ring-white dark:ring-gray-900">
                                        <Truck size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal dark:text-gray-100">Out for Delivery</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nov 22, 2025, 8:00 AM</p>
                                    </div>
                                </div>
                                <div className="relative flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center z-10 ring-4 ring-white dark:ring-gray-900">
                                        <Package size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal dark:text-gray-100">Order Placed</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nov 20, 2025, 2:15 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <Link href="/dashboard/track-order" className="text-cureza-green font-bold hover:underline text-sm">
                                View Full Tracking Details &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-charcoal dark:text-gray-100">Items Ordered</h3>
                        <div className="space-y-4">
                            {[1, 2].map((item) => (
                                <div key={item} className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl">🌿</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-charcoal dark:text-gray-100">Organic Ashwagandha Powder</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">250g • Qty: 1</p>
                                    </div>
                                    <div className="font-bold text-charcoal dark:text-gray-100">₹350</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary & Address */}
                <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-charcoal dark:text-gray-100">Shipping Address</h3>
                        <div className="flex items-start gap-3">
                            <MapPin className="text-gray-400 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-charcoal dark:text-gray-100">John Doe</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    123, Green Valley Apartments, <br />
                                    MG Road, Indiranagar, <br />
                                    Bengaluru, Karnataka - 560038
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    +91 98765 43210
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-charcoal dark:text-gray-100">Payment Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>₹1,200</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Shipping</span>
                                <span>₹99</span>
                            </div>
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Discount</span>
                                <span>-₹0</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2 flex justify-between font-bold text-lg text-charcoal dark:text-gray-100">
                                <span>Total</span>
                                <span>₹1,299</span>
                            </div>
                        </div>
                        <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-500 dark:text-gray-400 text-center">
                            Paid via UPI (Google Pay)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
