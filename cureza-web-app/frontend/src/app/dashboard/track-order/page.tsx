'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Truck, Package, MapPin, Search, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

interface TrackingStep {
    step: string;
    status: string;
    is_completed: boolean;
    is_current: boolean;
    timestamp: string | null;
    description: string;
}

interface TrackingData {
    order_id: number;
    order_number: string;
    current_status: string;
    tracking_id: string | null;
    tracking_provider: string | null;
    timeline: TrackingStep[];
}

export default function TrackOrderPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUserOrders();
    }, []);

    const fetchUserOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders');
            const orders = response.data || [];
            setUserOrders(orders);
            if (orders.length > 0) {
                const firstOrderId = orders[0].id.toString();
                setSelectedOrderId(firstOrderId);
                void fetchTrackingDetails(firstOrderId);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to load user orders:', err);
            setLoading(false);
        }
    };

    const fetchTrackingDetails = async (idOrNumber: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/orders/${idOrNumber}/track`);
            setTrackingData(response.data);
        } catch (err: any) {
            console.error('Failed to track order:', err);
            setError(err.response?.data?.message || 'Could not find tracking details for this order. Please verify the order number.');
            setTrackingData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (trimmed) {
            void fetchTrackingDetails(trimmed);
        }
    };

    const handleOrderSelect = (orderId: string) => {
        setSelectedOrderId(orderId);
        void fetchTrackingDetails(orderId);
    };

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'placed':
                return <CheckCircle size={20} />;
            case 'processing':
                return <Clock size={20} />;
            case 'shipped':
                return <Package size={20} />;
            case 'out_for_delivery':
                return <Truck size={20} />;
            case 'delivered':
                return <CheckCircle size={20} />;
            default:
                return <Package size={20} />;
        }
    };

    const getTrackingUrl = (provider: string, id: string) => {
        if (!provider || !id) return '';
        const p = provider.toLowerCase();
        if (p.includes('shiprocket')) return `https://shiprocket.co/tracking/${id}`;
        if (p.includes('delhivery')) return `https://www.delhivery.com/track/package/${id}`;
        if (p.includes('bluedart')) return `https://www.bluedart.com/trackdartresult?trackable_link=${id}`;
        if (p.includes('dtdc')) return `https://www.google.com/search?q=dtdc+tracking+${id}`;
        return `https://www.google.com/search?q=${provider}+tracking+${id}`;
    };

    // Calculate progress percentage based on completed steps
    const getProgressPercent = (timeline: TrackingStep[]) => {
        if (!timeline || timeline.length === 0) return 0;
        const completedCount = timeline.filter(step => step.is_completed).length;
        return (completedCount / timeline.length) * 100;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-charcoal dark:text-gray-100 tracking-tight">Track Order</h1>
                    <p className="text-xs text-gray-500 mt-1">Check the delivery status of your orders in real-time.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {userOrders.length > 0 && (
                        <div className="w-full sm:w-auto">
                            <select
                                value={selectedOrderId}
                                onChange={(e) => handleOrderSelect(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-semibold focus:outline-none"
                            >
                                <option value="" disabled>Select from your orders</option>
                                {userOrders.map((ord: any) => (
                                    <option key={ord.id} value={ord.id}>
                                        Order #{ord.order_number} ({new Date(ord.created_at).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Enter Order or Tracking ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-cureza-green"
                        />
                        <button type="submit" className="absolute right-2 text-gray-400 hover:text-cureza-green">
                            <Search size={14} />
                        </button>
                    </form>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cureza-green"></div>
                </div>
            )}

            {!loading && error && (
                <div className="p-8 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                    <AlertTriangle className="mx-auto text-red-500 mb-2" size={24} />
                    <p className="text-red-500 font-semibold text-sm">{error}</p>
                    <button
                        onClick={fetchUserOrders}
                        className="mt-4 px-4 py-2 bg-cureza-green text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Reset & View Recent Order
                    </button>
                </div>
            )}

            {!loading && !error && !trackingData && (
                <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-gray-500 text-sm">No orders available to track.</p>
                    <Link href="/shop" className="text-cureza-green font-bold hover:underline mt-2 inline-block text-xs">
                        Start Shopping
                    </Link>
                </div>
            )}

            {!loading && !error && trackingData && (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
                        <div className="text-center md:text-left">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Active Tracking</span>
                            <h3 className="text-lg font-bold text-charcoal dark:text-gray-100 mt-1">
                                Order #{trackingData.order_number}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                                Current Status: <span className="font-bold text-cureza-green">{trackingData.current_status.replace('_', ' ')}</span>
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full md:w-1/2 space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Order Placed</span>
                                <span>Delivered</span>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-cureza-green h-full transition-all duration-500" 
                                    style={{ width: `${getProgressPercent(trackingData.timeline)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Courier Information Block */}
                    {trackingData.tracking_id && (
                        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Tracking Details</span>
                                <span className="font-mono font-bold text-sm text-gray-900 dark:text-gray-100">{trackingData.tracking_id}</span>
                                {trackingData.tracking_provider && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({trackingData.tracking_provider})</span>
                                )}
                            </div>
                            {getTrackingUrl(trackingData.tracking_provider || '', trackingData.tracking_id) && (
                                <a
                                    href={getTrackingUrl(trackingData.tracking_provider || '', trackingData.tracking_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-cureza-green hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                >
                                    Track on Courier Website <ChevronRight size={14} />
                                </a>
                            )}
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="relative max-w-2xl mx-auto py-4">
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800"></div>

                        <div className="space-y-10">
                            {trackingData.timeline.map((step, index) => (
                                <div key={index} className="relative flex gap-8">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center z-10 border transition-all
                                        ${step.is_completed || step.is_current
                                            ? 'bg-green-50 dark:bg-green-950/20 text-cureza-green border-cureza-green'
                                            : 'bg-white dark:bg-gray-900 text-gray-300 border-gray-200 dark:border-gray-800'
                                        }`}
                                    >
                                        {getStepIcon(step.status)}
                                    </div>
                                    <div className={`pt-2 flex-1 ${step.is_completed || step.is_current ? 'opacity-100' : 'opacity-45'}`}>
                                        <h4 className={`font-bold text-sm ${step.is_current ? 'text-cureza-green text-base' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {step.step}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.description}</p>
                                        {step.timestamp && (
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono">{step.timestamp}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
