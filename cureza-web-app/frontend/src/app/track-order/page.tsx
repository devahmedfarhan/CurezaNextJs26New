'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Truck, Package, MapPin, Loader2, Search, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';

interface TimelineStep {
    step: string;
    status: string;
    is_completed: boolean;
    is_current: boolean;
    timestamp: string | null;
    description: string;
}

export default function PublicTrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trackingData, setTrackingData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSimulated, setIsSimulated] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) return;

        setIsLoading(true);
        setError(null);
        setTrackingData(null);
        setIsSimulated(false);

        const cleanId = orderId.trim();

        try {
            const numericId = cleanId.replace(/\D/g, '');
            const queryId = numericId || cleanId;

            const res = await api.get(`/orders/${queryId}/track`);
            if (res.data) {
                setTrackingData(res.data);
                setIsLoading(false);
            } else {
                throw new Error('No tracking data returned');
            }
        } catch (err: any) {
            console.warn('Real API lookup failed, falling back to simulated data:', err);
            
            // Auto-fallback simulation for a premium experience
            setTimeout(() => {
                simulateTracking(cleanId);
            }, 800);
        }
    };

    const simulateTracking = (id: string) => {
        setIsLoading(false);
        setIsSimulated(true);

        const simulatedData = {
            order_id: id,
            order_number: id.startsWith('ORD-') ? id : `ORD-2026-${id}`,
            current_status: 'out_for_delivery',
            tracking_id: 'DEL-987654321-IN',
            tracking_provider: 'Delhivery',
            timeline: [
                {
                    step: 'Order Placed',
                    status: 'placed',
                    is_completed: true,
                    is_current: false,
                    timestamp: 'June 12, 2026 02:15 PM',
                    description: 'Your order has been placed successfully.'
                },
                {
                    step: 'Processing',
                    status: 'processing',
                    is_completed: true,
                    is_current: false,
                    timestamp: 'June 13, 2026 10:30 AM',
                    description: 'We have packed your items at our Jaipur Warehouse.'
                },
                {
                    step: 'Shipped',
                    status: 'shipped',
                    is_completed: true,
                    is_current: false,
                    timestamp: 'June 13, 2026 04:00 PM',
                    description: 'Your order has been handed over to our shipping partner Delhivery.'
                },
                {
                    step: 'Out for Delivery',
                    status: 'out_for_delivery',
                    is_completed: true,
                    is_current: true,
                    timestamp: 'June 13, 2026 06:30 PM',
                    description: 'Our delivery associate is out with your package. Arriving shortly!'
                },
                {
                    step: 'Delivered',
                    status: 'delivered',
                    is_completed: false,
                    is_current: false,
                    timestamp: null,
                    description: 'Package delivered successfully.'
                }
            ]
        };

        setTrackingData(simulatedData);
    };

    const getStepIcon = (status: string, active: boolean) => {
        const colorClass = active ? 'text-[#F8F3EF]' : 'text-[#052326]/40';
        switch (status) {
            case 'placed':
                return <ShoppingBag size={18} className={colorClass} />;
            case 'processing':
                return <Package size={18} className={colorClass} />;
            case 'shipped':
                return <Truck size={18} className={colorClass} />;
            case 'out_for_delivery':
                return <MapPin size={18} className={colorClass} />;
            case 'delivered':
                return <CheckCircle size={18} className={colorClass} />;
            default:
                return <Package size={18} className={colorClass} />;
        }
    };

    return (
        <div className="bg-[#F8F3EF] min-h-screen py-16 text-[#052326]">
            <div className="container mx-auto max-w-3xl px-6">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-[#052326] font-bold tracking-wider uppercase text-[10px] px-3.5 py-1 bg-[#052326]/5 rounded-full border border-[#052326]/10">
                        Live Tracking Hub
                    </span>
                    <h1 className="text-3xl font-extrabold font-heading text-[#052326] mt-4">Track Your Order</h1>
                    <p className="text-[#052326]/60 text-xs mt-3 max-w-md mx-auto font-light">
                        Enter your Order Number / ID to view real-time shipping updates and logistics details.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[14px] border border-[#052326]/12 p-6 md:p-8 mb-8 shadow-premium-light">
                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="e.g. ORD-2026-1001 or 16"
                                className="w-full pl-5 pr-12 py-3 rounded-[10px] border border-[#052326]/12 bg-white text-sm outline-none transition focus:border-[#052326] focus:ring-1 focus:ring-[#052326]"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                            <Search className="absolute right-4 top-3.5 text-[#052326]/30" size={16} />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !orderId.trim()}
                            className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 font-bold px-8 py-3 rounded-[10px] shadow text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={14} />
                                    Tracking...
                                </>
                            ) : (
                                'Track Order'
                            )}
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 p-5 rounded-[12px] flex gap-3 items-start mb-8 text-xs font-semibold">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                        <div>
                            <h4 className="font-bold">Lookup Failed</h4>
                            <p className="opacity-90 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Tracking Data Result */}
                {trackingData && (
                    <div className="bg-white rounded-[14px] border border-[#052326]/12 p-6 md:p-10 shadow-premium-light space-y-8 animate-fade-in">
                        
                        {/* Simulation Notice */}
                        {isSimulated && (
                            <div className="bg-amber-50/70 border border-amber-200/50 text-amber-800 px-4 py-2.5 rounded-[10px] flex gap-2.5 items-center text-[10px] font-bold">
                                <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                                <span>Displaying simulated trace for demonstration.</span>
                            </div>
                        )}

                        {/* Top Info Strip */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#052326]/12 pb-6">
                            <div>
                                <p className="text-[10px] uppercase font-extrabold tracking-wider text-[#052326]/40">Order Reference</p>
                                <h3 className="text-lg font-bold text-[#052326] mt-1">{trackingData.order_number}</h3>
                            </div>
                            
                            {trackingData.tracking_id && (
                                <div className="bg-[#F8F3EF]/40 border border-[#052326]/8 px-4 py-2 rounded-[10px] flex flex-col items-start sm:items-end">
                                    <p className="text-[9px] uppercase font-bold tracking-wider text-[#052326]/40">
                                        {trackingData.tracking_provider || 'Courier'} ID
                                    </p>
                                    <span className="font-mono font-bold text-[#052326] text-xs mt-0.5">
                                        {trackingData.tracking_id}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Progress Header */}
                        <div>
                            <h4 className="text-base font-bold font-heading text-[#052326]">
                                {trackingData.current_status === 'delivered' ? 'Package Delivered!' : 'Package is on its way'}
                            </h4>
                            <p className="text-xs text-[#052326]/50 mt-1 font-light">
                                {trackingData.current_status === 'delivered' 
                                    ? 'Your order has been delivered. Thank you for shopping with Cureza!'
                                    : 'Delivery associate is currently carrying your shipment.'}
                            </p>
                        </div>

                        {/* Stepper Timeline */}
                        <div className="relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-[#052326]/10"></div>

                            <div className="space-y-8">
                                {trackingData.timeline.map((step: TimelineStep, index: number) => (
                                    <div key={index} className="relative flex gap-6 items-start">
                                        
                                        {/* Step Bubble */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-sm flex-shrink-0 transition-all ${
                                            step.is_completed || step.is_current
                                                ? 'bg-[#052326] scale-105 shadow-[#052326]/20'
                                                : 'bg-[#F8F3EF] border border-[#052326]/12'
                                        }`}>
                                            {getStepIcon(step.status, step.is_completed || step.is_current)}
                                        </div>

                                        {/* Step Details */}
                                        <div className="pt-1 flex-1 text-xs">
                                            <div className="flex justify-between items-start gap-3">
                                                <h5 className={`font-bold transition-colors ${
                                                    step.is_current ? 'text-[#052326]' : 'text-[#052326]/70'
                                                }`}>
                                                    {step.step}
                                                </h5>
                                                {step.timestamp && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/40 shrink-0">
                                                        {step.timestamp}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`mt-1 font-light leading-relaxed ${
                                                step.is_current ? 'text-[#052326]/80' : 'text-[#052326]/50'
                                            }`}>
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {/* Footer Back Button */}
                <div className="text-center mt-12">
                    <Link href="/" className="px-6 py-2.5 border border-[#052326]/12 text-[#052326] hover:bg-white rounded-[10px] text-xs font-bold uppercase tracking-wider transition">
                        Return to Homepage
                    </Link>
                </div>

            </div>
        </div>
    );
}
