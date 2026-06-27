'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    CheckCircle, 
    Truck, 
    Package, 
    MapPin, 
    Loader2, 
    Search, 
    AlertCircle, 
    ShoppingBag, 
    Copy, 
    Check, 
    ExternalLink, 
    ChevronDown, 
    ChevronUp, 
    Clock, 
    Calendar,
    Phone,
    Mail,
    HelpCircle,
    BadgeAlert,
    ShieldCheck,
    Navigation,
    Home
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';

interface TimelineStep {
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
    timeline: TimelineStep[];
}

export default function PublicTrackOrderPage() {
    const { user } = useAuth();
    const [orderId, setOrderId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSimulated, setIsSimulated] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    // Fetch user's orders if logged in to show quick tracking cards
    const { data: userOrders } = useSWR(
        user ? '/orders' : null,
        (url) => api.get(url).then(res => res.data)
    );

    // Fetch real products from database/API for upselling
    const { data: rawProducts } = useSWR('/products', (url) => 
        api.get(url).then(res => res.data)
    );

    const upsellProducts = React.useMemo(() => {
        const list = Array.isArray(rawProducts) 
            ? rawProducts 
            : (rawProducts && Array.isArray(rawProducts.data) ? rawProducts.data : []);
        return list.slice(0, 4); // Display first 4 real products
    }, [rawProducts]);

    const handleTrack = async (e?: React.FormEvent, targetId?: string) => {
        if (e) e.preventDefault();
        const searchId = targetId || orderId;
        if (!searchId.trim()) return;

        setIsLoading(true);
        setError(null);
        setTrackingData(null);
        setIsSimulated(false);

        const cleanId = searchId.trim();

        // Check if it's a demo order
        if (cleanId.toUpperCase().includes('DEMO')) {
            setTimeout(() => {
                simulateTracking(cleanId);
            }, 800);
            return;
        }

        try {
            const res = await api.get(`/orders/${cleanId}/track`);
            if (res.data && res.data.timeline) {
                // Normalize status and timeline for customer side
                const normalized = { ...res.data };
                const backendStatus = normalized.current_status?.toLowerCase();
                
                if (backendStatus === 'cod_reconciled' || backendStatus === 'completed') {
                    normalized.current_status = 'delivered';
                }
                
                if (Array.isArray(normalized.timeline)) {
                    normalized.timeline = normalized.timeline.map((step: any) => {
                        const stepStatus = step.status?.toLowerCase();
                        if (stepStatus === 'cod_reconciled' || stepStatus === 'completed') {
                            return {
                                ...step,
                                step: 'Delivered',
                                status: 'delivered',
                                description: 'Package delivered safely. Secure OTP verified.'
                            };
                        }
                        return step;
                    });
                }
                setTrackingData(normalized);
            } else {
                throw new Error('No tracking data returned');
            }
        } catch (err: any) {
            console.error('API lookup failed:', err);
            setError(err.response?.data?.message || 'Order not found. Please verify the Order ID or check if it belongs to your account.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickTrack = (id: string) => {
        setOrderId(id);
        void handleTrack(undefined, id);
    };

    const simulateTracking = (id: string) => {
        setIsLoading(false);
        setIsSimulated(true);

        const type = id.toUpperCase();
        let status = 'processing';
        let provider = 'Delhivery';
        let trackId = 'DEL-MOCK-89201';

        if (type.includes('SHIPPED') || type.includes('2')) {
            status = 'shipped';
            trackId = 'DEL-MOCK-99182';
        } else if (type.includes('DELIVERED') || type.includes('3')) {
            status = 'delivered';
            provider = 'Shiprocket (BlueDart)';
            trackId = 'SR-MOCK-30018';
        }

        const dateOffset = (days: number) => {
            const d = new Date();
            d.setDate(d.getDate() - days);
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        };

        const simulatedData: TrackingData = {
            order_id: 999,
            order_number: id.startsWith('ORD-') ? id : `ORD-2026-${id}`,
            current_status: status,
            tracking_id: trackId,
            tracking_provider: provider,
            timeline: [
                {
                    step: 'Order Placed',
                    status: 'placed',
                    is_completed: true,
                    is_current: status === 'placed',
                    timestamp: dateOffset(3),
                    description: 'Your order has been placed successfully and payment is confirmed.'
                },
                {
                    step: 'Processing & Packed',
                    status: 'processing',
                    is_completed: ['processing', 'shipped', 'delivered'].includes(status),
                    is_current: status === 'processing',
                    timestamp: dateOffset(2),
                    description: 'We have packed your medical & wellness items at our Jaipur Warehouse.'
                },
                {
                    step: 'Shipped',
                    status: 'shipped',
                    is_completed: ['shipped', 'delivered'].includes(status),
                    is_current: status === 'shipped',
                    timestamp: status !== 'processing' ? dateOffset(1) : null,
                    description: status !== 'processing' ? 'Shipment has departed the origin center.' : 'Pending pickup from Jaipur warehouse.'
                },
                {
                    step: 'Out for Delivery',
                    status: 'out_for_delivery',
                    is_completed: status === 'delivered',
                    is_current: status === 'out_for_delivery',
                    timestamp: null,
                    description: 'Courier delivery agent is carrying your wellness package.'
                },
                {
                    step: 'Delivered',
                    status: 'delivered',
                    is_completed: status === 'delivered',
                    is_current: status === 'delivered',
                    timestamp: status === 'delivered' ? dateOffset(0) : null,
                    description: 'Package delivered safely. Secure OTP verified.'
                }
            ]
        };

        setTrackingData(simulatedData);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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

    const getTrackingUrl = (provider: string, id: string) => {
        if (!provider || !id) return '';
        const p = provider.toLowerCase();
        if (p.includes('shiprocket')) return `https://shiprocket.co/tracking/${id}`;
        if (p.includes('delhivery')) return `https://www.delhivery.com/track/package/${id}`;
        if (p.includes('bluedart')) return `https://www.bluedart.com/trackdartresult?trackable_link=${id}`;
        if (p.includes('dtdc')) return `https://www.google.com/search?q=dtdc+tracking+${id}`;
        return `https://www.google.com/search?q=${provider}+tracking+${id}`;
    };

    const getStatusIndex = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'placed') return 0;
        if (s === 'processing' || s === 'packed') return 1;
        if (s === 'shipped') return 2;
        if (s === 'out_for_delivery' || s === 'in_transit') return 3;
        if (s === 'delivered' || s === 'cod_reconciled' || s === 'completed') return 4;
        return -1;
    };

    const getProgressPercent = (timeline: TimelineStep[]) => {
        if (!timeline || timeline.length === 0) return 0;
        const completedCount = timeline.filter(step => step.is_completed).length;
        return ((completedCount - 1) / (timeline.length - 1)) * 100;
    };

    const faqs = [
        {
            q: "How long does it take for tracking updates to appear?",
            a: "Logistics systems usually take 12 to 24 hours to sync details online once the package has been handed over to the courier partner. Please check back later if your AWB is freshly generated."
        },
        {
            q: "Can I change my delivery address mid-transit?",
            a: "Once an order status shifts to 'Shipped', the delivery address cannot be modified directly from our side. However, you can contact the designated courier partner using the tracking link and request a re-route."
        },
        {
            q: "What does 'Out for Delivery' status mean?",
            a: "This means the delivery agent from the shipping provider (e.g. Delhivery) is carrying your package today and will attempt delivery at your shipping address by evening."
        },
        {
            q: "How can I verify the delivery of my order?",
            a: "For security, we utilize OTP (One-Time Password) verification at the time of delivery. Make sure you share the delivery code only when the package reaches you."
        },
        {
            q: "What should I do if my tracking status hasn't updated for days?",
            a: "It is normal for status updates to pause while shipments transition between major logistics hubs. If there is no update for more than 48 hours, please contact our support team."
        },
        {
            q: "Who will deliver my wellness products?",
            a: "We work with top-tier courier networks including Delhivery, Shiprocket, BlueDart, and DTDC to ensure safe and professional delivery of your products."
        },
        {
            q: "What happens if I am not at home during the delivery attempt?",
            a: "The delivery agent will typically call you or try again the next business day. Couriers usually make up to 3 delivery attempts before returning the shipment to our warehouse."
        },
        {
            q: "Can I schedule a specific delivery time slot?",
            a: "Standard deliveries are made between 9 AM and 7 PM. While we cannot guarantee a specific hour, you can coordinate directly with the delivery agent when they contact you."
        },
        {
            q: "Can I pay via cash on delivery (COD) at receipt?",
            a: "If you selected Cash on Delivery (COD) during checkout, you can pay the delivery agent in cash or via supported UPI QR codes upon package receipt."
        },
        {
            q: "How do I report a damaged package or missing items?",
            a: "Please inspect your parcel immediately. If the outer seal is broken or items are damaged, take photos and contact our support helpline within 24 hours with details."
        }
    ];

    // Stepper node labels
    const stepperNodes = [
        { label: 'Placed', status: 'placed' },
        { label: 'Packed', status: 'processing' },
        { label: 'Shipped', status: 'shipped' },
        { label: 'In Transit', status: 'out_for_delivery' },
        { label: 'Delivered', status: 'delivered' }
    ];

    const currentStatusIndex = trackingData ? getStatusIndex(trackingData.current_status) : -1;

    // Determine truck position on the route map path (percentage)
    const getRoutePercent = () => {
        if (currentStatusIndex === -1) return 0;
        if (currentStatusIndex === 0) return 5;
        if (currentStatusIndex === 1) return 20;
        if (currentStatusIndex === 2) return 50;
        if (currentStatusIndex === 3) return 80;
        if (currentStatusIndex === 4) return 98;
        return 0;
    };

    return (
        <div className="bg-[#F8F3EF]/30 min-h-screen pt-4 pb-12 text-[#052326] relative overflow-hidden">
            
            {/* Colorful Radial Mesh Background Blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#052326]/10 to-transparent blur-[120px] opacity-70" />
                <div className="absolute top-[20%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-[#052326]/10 to-transparent blur-[120px] opacity-60" />
                <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#052326]/5 to-transparent blur-[100px] opacity-40" />
                <svg className="absolute left-[50%] top-0 h-full w-[120rem] -translate-x-[50%] stroke-[#052326]/3 [mask-image:radial-gradient(100vw_50vh_at_top,white,transparent)]">
                    <defs>
                        <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse" x="50%">
                            <path d="M.5 60V.5H60" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern)" />
                </svg>
            </div>

            {/* Container adjusted to match Navbar Header width exactly */}
            <div className="container mx-auto px-4 md:px-6 relative z-10 space-y-8">
                
                {/* Colorful Hero Banner (Header) */}
                <div className="bg-gradient-to-r from-[#052326] via-[#103b41] to-[#1c4d52] text-[#F8F3EF] rounded-[10px] p-8 md:p-12 relative overflow-hidden shadow-xl border border-[#052326]/25 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#052326]/10 blur-[80px] -z-10" />
                    <div className="absolute left-[30%] bottom-0 w-60 h-60 rounded-full bg-[#052326]/10 blur-[70px] -z-10" />
                    
                    <div className="space-y-4 max-w-xl text-center md:text-left">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
                            </span>
                            Live Dispatch Status
                        </span>
                        <h1 className="text-3xl md:text-5xl font-semibold font-heading tracking-tight leading-tight">
                            Wellness Journey Tracker
                        </h1>
                        <p className="text-[#F8F3EF]/80 text-sm md:text-base font-normal leading-relaxed">
                            Follow your premium Ayurvedic, herbal, and wellness items directly from our verified partner facility to your doorstep in real-time.
                        </p>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[8px] w-72 text-center shadow-lg">
                        <div className="w-12 h-12 rounded-[6px] bg-white/10 flex items-center justify-center text-white mb-3 shadow-inner">
                            <Truck size={24} className="animate-bounce" />
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-white">Direct Dispatch</p>
                        <p className="text-xs text-white/70 mt-1 max-w-[180px]">Secure packing and speed air shipping across India.</p>
                    </div>
                </div>

                {/* Floating Search Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[10px] border border-[#052326]/8 p-6 md:p-8 shadow-[0_20px_50px_rgba(5,35,38,0.03)] -mt-12 md:-mt-16 mx-0 relative z-20"
                >
                    <form onSubmit={(e) => handleTrack(e)} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enter Order ID or tracking code (e.g. ORD-2026-1002)"
                                className="w-full pl-5 pr-12 py-4 rounded-[8px] border border-[#052326]/10 bg-white text-sm md:text-base outline-none transition focus:border-[#052326] focus:ring-4 focus:ring-[#052326]/5 shadow-inner font-medium text-[#052326]"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                            <Search className="absolute right-4.5 top-4.5 text-[#052326]/30" size={18} />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading || !orderId.trim()}
                            className="bg-[#052326] hover:bg-[#103b41] text-[#F8F3EF] font-semibold px-8 py-4 rounded-[8px] shadow-lg shadow-[#052326]/10 text-xs md:text-sm uppercase tracking-widest transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 border border-[#052326]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={14} />
                                    Locating...
                                </>
                            ) : (
                                'Track Package'
                            )}
                        </motion.button>
                    </form>
                    {/* Demo Presets Removed */}
                </motion.div>

                {/* Logged in User's Recent Orders */}
                {user && userOrders && userOrders.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-0"
                    >
                        <h4 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[#052326]/60 mb-3 flex items-center gap-2">
                            <ShoppingBag size={14} className="text-[#052326]/75" /> Quick-Track Your Recent Orders
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {userOrders.slice(0, 3).map((ord: any) => (
                                <motion.button
                                    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(5,35,38,0.06)' }}
                                    key={ord.id}
                                    onClick={() => handleQuickTrack(ord.order_number || ord.id.toString())}
                                    className="text-left bg-white border border-[#052326]/6 p-5 rounded-[10px] transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group"
                                >
                                    <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-[#052326]/2 blur-xl group-hover:bg-[#052326]/5 transition-colors" />
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-mono font-bold text-xs md:text-sm text-[#052326]">
                                                #{ord.order_number || ord.id}
                                            </span>
                                            <span className="text-[10px] md:text-xs uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#052326]/5 text-[#052326]/80 capitalize">
                                                {(ord.status === 'cod_reconciled' || ord.status === 'completed') ? 'delivered' : ord.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#052326]/50 mt-1">
                                            Ordered: {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="mt-5 pt-3 border-t border-[#052326]/5 flex justify-between items-center text-xs font-semibold text-[#052326]">
                                        <span>Live Track</span>
                                        <ArrowLeft size={12} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Loader State */}
                {isLoading && (
                    <div className="bg-white border border-[#052326]/8 rounded-[10px] p-16 text-center shadow-[0_20px_50px_rgba(5,35,38,0.02)] flex flex-col items-center justify-center gap-4 mx-0">
                        <div className="flex items-center justify-center relative w-16 h-16">
                            {/* Inner concentric glowing ring */}
                            <div className="w-16 h-16 rounded-full border border-[#052326]/20 animate-ping absolute pointer-events-none" />
                            <div className="w-12 h-12 rounded-full border border-dashed border-[#052326]/30 animate-spin absolute pointer-events-none" />
                            <Loader2 className="animate-spin text-[#052326] relative z-10" size={32} />
                        </div>
                        <div>
                            <p className="font-semibold text-base text-[#052326]">Accessing Courier Servers</p>
                            <p className="text-[#052326]/60 text-xs md:text-sm mt-1">Fetching live routing parameters and AWB tracking data...</p>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && !isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50/80 border border-red-200/50 text-red-950 p-6 rounded-[8px] flex gap-4 items-start mb-8 mx-0 shadow-sm"
                    >
                        <AlertCircle className="flex-shrink-0 mt-0.5 text-red-700" size={22} />
                        <div className="text-xs md:text-sm">
                            <h4 className="font-bold text-red-900 text-sm md:text-base">Package ID Not Registered</h4>
                            <p className="opacity-80 mt-1.5 leading-relaxed text-[#052326]/85">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Wide Results Board */}
                <AnimatePresence mode="wait">
                    {trackingData && !isLoading && (
                        <motion.div
                            key={trackingData.order_number}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-0"
                        >
                            
                            {/* Left Column: Visual Route Map & Logistics (Col Span 5) */}
                            <div className="lg:col-span-5 space-y-6">
                                
                                {/* 1. Elegant Interactive SVG Route Map */}
                                <div className="bg-white rounded-[10px] border border-[#052326]/8 p-6 shadow-[0_20px_50px_rgba(5,35,38,0.03)] space-y-5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#052326]/50 block border-b border-[#052326]/5 pb-3">
                                        Live Dispatch Route
                                    </span>
                                    
                                    {/* Visual Map Render */}
                                    <div className="relative py-8 px-4 bg-[#F8F3EF]/30 rounded-[8px] border border-[#052326]/5 overflow-hidden flex flex-col justify-between h-48">
                                        <div className="absolute inset-0 bg-[radial-gradient(#052326_0.8px,transparent_0.8px)] [background-size:12px_12px] opacity-10" />
                                        
                                        <div className="flex justify-between items-center relative z-10">
                                            {/* Origin Hub */}
                                            <div className="text-left">
                                                <div className="w-8 h-8 rounded-full bg-[#052326] text-white flex items-center justify-center shadow-md">
                                                    <Package size={14} />
                                                </div>
                                                <p className="text-xs font-semibold text-[#052326] mt-2">Jaipur Whse.</p>
                                                <p className="text-[11px] text-[#052326]/60">Origin Center</p>
                                            </div>

                                            {/* Destination Hub */}
                                            <div className="text-right flex flex-col items-end">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors duration-300 ${
                                                    currentStatusIndex === 4 ? 'bg-green-600 text-white' : 'bg-white border-2 border-dashed border-[#052326]/30 text-[#052326]'
                                                }`}>
                                                    <MapPin size={14} className={currentStatusIndex === 4 ? '' : 'animate-pulse'} />
                                                </div>
                                                <p className="text-xs font-semibold text-[#052326] mt-2">Delivery City</p>
                                                <p className="text-[11px] text-[#052326]/60">Destination</p>
                                            </div>
                                        </div>

                                        {/* Connecting Line and Moving Truck */}
                                        <div className="relative h-6 flex items-center mt-auto pb-4">
                                            <div className="absolute left-4 right-4 h-1 bg-[#052326]/10 rounded-full" />
                                            <div 
                                                className="absolute left-4 h-1 bg-[#052326] rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `calc(${getRoutePercent()}% - 16px)` }}
                                            />
                                            
                                            <motion.div 
                                                className="absolute z-20"
                                                style={{ left: `calc(${getRoutePercent()}% - 12px)` }}
                                                animate={{ y: [0, -2, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-[#052326] border-2 border-white shadow-lg flex items-center justify-center text-white">
                                                    <Truck size={12} className="animate-pulse" />
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs font-semibold text-[#052326]/70">
                                        <span className="flex items-center gap-1">
                                            <Navigation size={10} className="text-[#052326]" /> Trans-India Express Route
                                        </span>
                                        <span>Status: {trackingData.current_status.toUpperCase().replace(/_/g, ' ')}</span>
                                    </div>
                                </div>

                                {/* 2. Courier Shipment Information Card */}
                                <div className="bg-white rounded-[10px] border border-[#052326]/8 p-6 shadow-[0_20px_50px_rgba(5,35,38,0.03)] space-y-6">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#052326]/50 block border-b border-[#052326]/5 pb-3">
                                        Logistics Summary
                                    </span>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-semibold text-[#052326]/60">Logistics Partner</p>
                                            <p className="font-bold text-sm text-[#052326]">{trackingData.tracking_provider || 'Pending dispatch'}</p>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-[#052326]/5 pt-3">
                                            <p className="text-xs font-semibold text-[#052326]/60">AWB Code</p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-xs md:text-sm text-[#052326] bg-[#052326]/5 px-2.5 py-1 rounded-[8px] border border-[#052326]/8 shadow-sm">
                                                    {trackingData.tracking_id || 'Not generated'}
                                                </span>
                                                {trackingData.tracking_id && (
                                                    <button
                                                        onClick={() => handleCopy(trackingData.tracking_id!)}
                                                        className="p-1.5 hover:bg-[#052326]/5 rounded-[6px] text-[#052326]/50 hover:text-[#052326] transition-colors"
                                                        title="Copy Tracking ID"
                                                    >
                                                        {copied ? <Check size={14} className="text-green-600 animate-scale-up" /> : <Copy size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-[#052326]/5 pt-3">
                                            <p className="text-xs font-semibold text-[#052326]/60">Delivery Window</p>
                                            <p className="text-sm font-bold flex items-center gap-1.5 text-[#052326]">
                                                <Calendar size={14} className="text-[#052326]" />
                                                {trackingData.current_status === 'delivered' ? 'Package Delivered' : 'Within 3 - 5 business days'}
                                            </p>
                                        </div>
                                    </div>

                                    {trackingData.tracking_id && trackingData.tracking_provider && (
                                        <div className="pt-2">
                                            <motion.a
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                href={getTrackingUrl(trackingData.tracking_provider, trackingData.tracking_id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full inline-flex items-center justify-center gap-2 bg-[#052326] hover:bg-[#103b41] text-[#F8F3EF] font-semibold text-center px-4 py-3.5 rounded-[8px] text-xs md:text-sm uppercase tracking-widest transition-colors duration-300 shadow-md border border-[#052326]"
                                            >
                                                Courier Web Console <ExternalLink size={12} />
                                            </motion.a>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Support Contacts Desk */}
                                <div className="grid grid-cols-2 gap-3">
                                    <a 
                                        href="mailto:support@cureza.com"
                                        className="bg-white border border-[#052326]/6 hover:border-[#052326] p-4 rounded-[10px] flex flex-col items-center text-center gap-2 transition-all shadow-sm group"
                                    >
                                        <div className="w-8 h-8 rounded-[6px] bg-[#052326]/5 flex items-center justify-center text-[#052326] group-hover:bg-[#052326] group-hover:text-white transition-all">
                                            <Mail size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#052326]/60">Email Helpdesk</p>
                                            <p className="text-xs font-bold text-[#052326] mt-0.5">support@cureza.com</p>
                                        </div>
                                    </a>
                                    <a 
                                        href="https://wa.me/919999999999"
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="bg-white border border-[#052326]/6 hover:border-[#052326] p-4 rounded-[10px] flex flex-col items-center text-center gap-2 transition-all shadow-sm group"
                                    >
                                        <div className="w-8 h-8 rounded-[6px] bg-[#052326]/5 flex items-center justify-center text-[#052326] group-hover:bg-[#052326] group-hover:text-white transition-all">
                                            <Phone size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#052326]/60">WhatsApp Support</p>
                                            <p className="text-xs font-bold text-[#052326] mt-0.5">+91 99999 99999</p>
                                        </div>
                                    </a>
                                </div>

                            </div>

                            {/* Right Column: Steps Stepper & Journey Timeline (Col Span 7) */}
                            <div className="lg:col-span-7 space-y-6">
                                
                                {/* Horizontal Stepper Header (Vibrant status indicators) */}
                                <div className="bg-white rounded-[10px] border border-[#052326]/8 p-6 shadow-[0_20px_50px_rgba(5,35,38,0.03)]">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#052326]/50 block border-b border-[#052326]/5 pb-3">
                                        Milestone Progress
                                    </span>
                                    <div className="flex justify-between items-center pt-6 px-2 relative">
                                        
                                        <div className="absolute left-8 right-8 top-[44px] h-[3px] bg-[#F8F3EF] -z-10 rounded-full" />
                                        <div 
                                            className="absolute left-8 top-[44px] h-[3px] bg-[#052326] -z-10 rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `calc(${currentStatusIndex === -1 ? 0 : (currentStatusIndex / 4) * 100}% - 8px)` }}
                                        />

                                        {stepperNodes.map((node, nodeIdx) => {
                                            const nodeIndex = getStatusIndex(node.status);
                                            const isCompleted = nodeIndex <= currentStatusIndex;
                                            const isCurrent = nodeIndex === currentStatusIndex;

                                            return (
                                                <div key={nodeIdx} className="flex flex-col items-center space-y-3 relative">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 shadow relative ${
                                                        isCurrent 
                                                            ? 'bg-[#052326] ring-4 ring-[#052326]/10 scale-110' 
                                                            : isCompleted 
                                                            ? 'bg-[#052326]' 
                                                            : 'bg-white border-2 border-dashed border-[#052326]/12'
                                                    }`}>
                                                        {isCurrent && (
                                                            <span className="absolute inset-0 rounded-full bg-[#052326]/20 animate-ping pointer-events-none" />
                                                        )}
                                                        {getStepIcon(node.status, isCompleted || isCurrent)}
                                                    </div>
                                                    <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                                                        isCurrent ? 'text-[#052326]' : isCompleted ? 'text-[#052326]/70' : 'text-[#052326]/30'
                                                    }`}>
                                                        {node.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Vertical Timeline Details List */}
                                <div className="bg-white rounded-[10px] border border-[#052326]/8 p-6 md:p-8 shadow-[0_20px_50px_rgba(5,35,38,0.03)] relative">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#052326]/50 block border-b border-[#052326]/5 pb-3 mb-6">
                                        Detailed Status Milestones
                                    </span>
                                    
                                    <div className="absolute left-[38px] top-[74px] bottom-16 w-[2px] bg-[#052326]/8 rounded-full" />

                                    <div className="space-y-6">
                                        {trackingData.timeline.map((step, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`relative flex gap-5 items-start transition-opacity duration-300 ${
                                                    step.is_completed || step.is_current ? 'opacity-100' : 'opacity-35'
                                                }`}
                                            >
                                                
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ring-4 ring-white shadow-sm flex-shrink-0 transition-all duration-300 relative ${
                                                    step.is_current 
                                                        ? 'bg-[#052326] scale-110 shadow-md shadow-[#052326]/20'
                                                        : step.is_completed
                                                        ? 'bg-[#052326]'
                                                        : 'bg-[#F8F3EF] border border-[#052326]/12'
                                                }`}>
                                                    {step.is_current && (
                                                        <span className="absolute inset-0 rounded-full bg-[#052326]/20 animate-ping pointer-events-none" />
                                                    )}
                                                    {getStepIcon(step.status, step.is_completed || step.is_current)}
                                                </div>

                                                <div className={`flex-1 p-4.5 rounded-[10px] border transition-all duration-500 ${
                                                    step.is_current 
                                                        ? 'bg-[#052326]/5 border-[#052326]/15 shadow-sm'
                                                        : 'bg-white border-transparent'
                                                }`}>
                                                    <div className="flex flex-wrap justify-between items-baseline gap-2">
                                                        <h5 className={`font-bold text-sm transition-colors ${
                                                            step.is_current ? 'text-[#052326] text-base' : 'text-[#052326]/80'
                                                        }`}>
                                                            {step.step}
                                                        </h5>
                                                        {step.timestamp && (
                                                            <span className="text-xs font-semibold text-[#052326]/50 font-mono flex items-center gap-1">
                                                                <Clock size={12} /> {step.timestamp}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs md:text-sm mt-1.5 leading-relaxed ${
                                                        step.is_current ? 'text-[#052326]/80 font-medium' : 'text-[#052326]/60'
                                                    }`}>
                                                        {step.description}
                                                    </p>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapsible FAQ Helpdesk Accordion */}
                <div className="bg-white rounded-[10px] border border-[#052326]/8 p-6 md:p-8 shadow-[0_20px_50px_rgba(5,35,38,0.02)]">
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight font-heading text-[#052326] mb-6 flex items-center gap-2 border-b border-[#052326]/5 pb-4">
                        <HelpCircle size={22} className="text-[#052326]" /> Shipment Helpdesk & FAQs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div 
                                    key={index} 
                                    className={`p-4.5 rounded-[8px] border transition-all duration-300 ${
                                        isOpen ? 'bg-[#F8F3EF]/30 border-[#052326]/12 shadow-sm' : 'bg-white border-[#052326]/5 hover:border-[#052326]/10'
                                    }`}
                                >
                                    <button
                                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                                        className="w-full flex justify-between items-center text-left text-xs md:text-sm font-semibold text-[#052326] pr-4 transition-colors"
                                    >
                                        <span>{faq.q}</span>
                                        {isOpen ? <ChevronUp size={14} className="text-[#052326]" /> : <ChevronDown size={14} className="text-[#052326]/40" />}
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-[11px] md:text-xs text-[#052326]/60 pt-3 leading-relaxed border-t border-[#052326]/5 mt-3">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upselling Recommended Products */}
                {upsellProducts && upsellProducts.length > 0 && (
                    <div className="bg-white rounded-[10px] border border-[#052326]/8 p-6 md:p-8 shadow-[0_20px_50px_rgba(5,35,38,0.02)] space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#052326]/5 pb-4 gap-2">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-[6px]">
                                    ⚡ Limited Fast-Delivery Offer
                                </span>
                                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight font-heading text-[#052326] mt-2">
                                    Recommended Products From Your Recent Views
                                </h2>
                            </div>
                            <span className="text-[11px] text-[#052326]/50 font-medium">
                                Dispatching directly from Jaipur Warehouse
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {upsellProducts.map((product: any) => {
                                const productUrl = `/shop/${typeof product.category === 'object' ? product.category?.slug : (product.category?.toLowerCase() || 'general')}/${product.slug || product.id}`;
                                return (
                                    <div key={product.id} className="group bg-white border border-[#052326]/8 rounded-[10px] p-4 transition-all hover:border-[#052326]/20 flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden">
                                        <div className="space-y-3">
                                            {/* Product Image */}
                                            <div className="relative w-full aspect-square bg-[#F8F3EF]/50 rounded-[8px] overflow-hidden border border-[#052326]/5 flex items-center justify-center">
                                                <img 
                                                    src={(() => {
                                                        const imgSrc = product.image;
                                                        if (!imgSrc) return '/fallback.png';
                                                        if (imgSrc.startsWith('http')) return imgSrc;
                                                        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
                                                        if (imgSrc.startsWith('/')) return `${backend}${imgSrc}`;
                                                        return `${backend}/storage/${imgSrc}`;
                                                    })()}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Product Title */}
                                            <div>
                                                <p className="text-[10px] text-[#052326]/40 uppercase font-bold tracking-wider">
                                                    {typeof product.category === 'object' ? product.category?.name : (product.category || 'Wellness')}
                                                </p>
                                                <h4 className="font-bold text-xs md:text-sm text-[#052326] group-hover:text-[#00bba7] transition-colors line-clamp-2 mt-1">
                                                    {product.title}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-[#052326]/5 space-y-3">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs text-[#052326]/50 font-semibold">Price</span>
                                                <span className="font-bold text-xs md:text-sm text-[#052326]">
                                                    ₹{product.price}
                                                </span>
                                            </div>

                                            {/* Fast shipping notice */}
                                            <div className="bg-amber-50/50 border border-amber-200/40 p-2 rounded-[6px] text-xs leading-relaxed text-amber-950 font-medium">
                                                ⏳ Order in <span className="font-bold text-rose-700">3 Hours</span> for <span className="font-bold text-green-700">2-Day Delivery</span>!
                                            </div>

                                            <Link 
                                                href={productUrl}
                                                className="w-full inline-flex items-center justify-center bg-[#052326] hover:bg-[#103b41] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-[8px] transition-colors"
                                            >
                                                Order Now
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
