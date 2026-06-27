'use client';

import Link from 'next/link';
import { Package, ChevronRight, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '@/lib/api';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/orders');
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48" />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-48" />
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-pulse p-6 flex flex-col md:flex-row gap-6">
                                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20" />
                                    </div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/6" />
                                </div>
                                <div className="flex flex-row md:flex-col justify-between items-end min-w-[120px] gap-2">
                                    <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">My Orders</h1>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-cureza-green"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                                🔍
                            </button>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                            <p className="text-gray-500">No orders found.</p>
                            <Link href="/shop" className="text-cureza-green font-bold hover:underline mt-2 inline-block">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 flex flex-col md:flex-row gap-6">
                                    {/* Image */}
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center text-3xl">
                                        📦
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row justify-between mb-2">
                                            <h3 className="font-bold text-lg text-charcoal dark:text-gray-100">Order #{order.order_number}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                order.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Items:</span> {order.items?.length || 0} items
                                        </p>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="flex flex-row md:flex-col justify-between items-end min-w-[120px]">
                                        <p className="font-bold text-xl text-charcoal dark:text-gray-100">₹{order.total_amount}</p>
                                        <Link
                                            href={`/account/orders/${order.id}`}
                                            className="flex items-center gap-1 text-cureza-green font-medium hover:underline mt-2"
                                        >
                                            View Details <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
