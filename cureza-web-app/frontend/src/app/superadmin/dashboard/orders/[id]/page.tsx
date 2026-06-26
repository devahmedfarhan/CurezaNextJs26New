'use client';

import { useState, useEffect } from 'react';
import { 
    ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, User, CreditCard, 
    Printer, X, Wallet, Award, Activity, Globe, Monitor, DollarSign, 
    Map, Receipt, Calendar, Hash, Store, Mail, Phone, ExternalLink, FileText 
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import EditOrderModal from '@/components/admin/EditOrderModal';

interface UserAddress {
    id: number;
    name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
    type: string;
    is_default: boolean;
}

interface UserWallet {
    balance: string;
    points: number;
}

interface UserRecentOrder {
    id: number;
    order_number: string;
    created_at: string;
    status: string;
    final_amount: string;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
    registration_source?: string;
    registration_ip?: string;
    device_info?: string;
    referral_code?: string;
    wallet?: UserWallet | null;
    addresses?: UserAddress[];
    total_orders?: number;
    total_spent?: string;
    recent_orders?: UserRecentOrder[];
}

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
    total: string;
    seller: { 
        id: number;
        name: string; 
        email?: string; 
        phone?: string;
        seller_profile?: {
            contact_person?: string;
            gst_number?: string;
            pan_number?: string;
            pickup_address_line_1?: string;
            pickup_address_line_2?: string;
            pickup_address_city?: string;
            pickup_address_state?: string;
            pickup_address_pin_code?: string;
            pickup_address_country?: string;
        } | null;
        sellerProfile?: {
            contact_person?: string;
            gst_number?: string;
            pan_number?: string;
            pickup_address_line_1?: string;
            pickup_address_line_2?: string;
            pickup_address_city?: string;
            pickup_address_state?: string;
            pickup_address_pin_code?: string;
            pickup_address_country?: string;
        } | null;
        brand?: {
            name: string;
            slug?: string;
        } | null;
    } | null;
    product: { brand: { name: string } | null; is_prescription_required: boolean } | null;
    patient_name?: string | null;
    patient_age?: number | null;
    patient_gender?: string | null;
    health_concern?: string | null;
    prescription_path?: string | null;
    doctor?: { name: string; specialization?: string } | null;
}

interface Order {
    id: number;
    order_number: string;
    created_at: string;
    status: string;
    payment_status: string;
    payment_method: string;
    total_amount: string;
    final_amount: string;
    tax_amount: string;
    shipping_amount: string;
    discount_amount?: string;
    coupon_code?: string | null;
    order_notes?: string | null;
    shipping_address_json: any;
    user: UserInfo | null;
    items: OrderItem[];
    shipments: any[];
    tracking_id?: string;
    tracking_provider?: string;
    refunds?: any[];
}

export default function AdminOrderDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    
    // Refund fields
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundNotes, setRefundNotes] = useState('');
    const [refunding, setRefunding] = useState(false);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            console.log('Fetching order details for ID:', id);
            const response = await api.get(`/admin/orders/${id}`);
            setOrder(response.data);
            setRefundAmount(response.data.final_amount);
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    if (loading) return <div className="p-6 text-center text-gray-500 font-medium animate-pulse">Loading Order Details...</div>;
    if (!order) return <div className="p-6 text-center text-red-500 font-semibold">Order not found</div>;

    const handleRefundSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRefunding(true);
        try {
            await api.post('/admin/refunds', {
                order_id: order.id,
                amount: parseFloat(refundAmount),
                reason: refundReason,
                admin_notes: refundNotes
            });
            alert('Refund request initiated successfully.');
            setIsRefundModalOpen(false);
            setRefundReason('');
            setRefundNotes('');
            fetchOrder();
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to create refund request');
        } finally {
            setRefunding(false);
        }
    };

    // Construct Timeline Logic
    const timeline = [
        { status: 'Order Placed', date: new Date(order.created_at).toLocaleString(), completed: true },
        { status: 'Payment (' + order.payment_status + ')', date: order.payment_status === 'paid' ? 'Completed' : 'Pending', completed: order.payment_status === 'paid' },
        { status: 'Processing', date: order.status !== 'pending' && order.status !== 'cancelled' ? 'Active' : 'Pending', completed: order.status !== 'pending' && order.status !== 'cancelled' },
    ];

    if (order.shipments && order.shipments.length > 0) {
        order.shipments.forEach((shipment, index) => {
            const prefix = order.shipments.length > 1 ? `[Shipment #${index + 1}] ` : '';
            const isPickupScheduled = ['pickup_scheduled', 'picked_up', 'out_for_delivery', 'delivered'].includes(shipment.status);
            const isPickedUp = ['picked_up', 'out_for_delivery', 'delivered'].includes(shipment.status);
            const isOutForDelivery = ['out_for_delivery', 'delivered'].includes(shipment.status);
            const isDelivered = shipment.status === 'delivered';

            timeline.push({
                status: `${prefix}Shipment Created (${shipment.courier_name || 'Pending Courier'})`,
                date: new Date(shipment.created_at).toLocaleString(),
                completed: true
            });

            timeline.push({
                status: `${prefix}Pickup Scheduled`,
                date: shipment.pickup_scheduled_at ? new Date(shipment.pickup_scheduled_at).toLocaleString() : (isPickupScheduled ? 'Scheduled' : 'Pending'),
                completed: isPickupScheduled
            });

            timeline.push({
                status: `${prefix}Picked Up (In Transit)`,
                date: shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleString() : (isPickedUp ? 'In Transit' : 'Pending'),
                completed: isPickedUp
            });

            timeline.push({
                status: `${prefix}Out For Delivery`,
                date: isOutForDelivery ? 'Out for Delivery' : 'Pending',
                completed: isOutForDelivery
            });

            timeline.push({
                status: `${prefix}Delivered`,
                date: shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleString() : (isDelivered ? 'Delivered' : 'Pending'),
                completed: isDelivered
            });

            if (shipment.status === 'cancelled') {
                timeline.push({
                    status: `${prefix}Shipment Cancelled`,
                    date: 'Terminated',
                    completed: true
                });
            }
        });
    } else {
        timeline.push({
            status: 'Shipped',
            date: 'Pending',
            completed: false
        });
        timeline.push({
            status: 'Delivered',
            date: 'Pending',
            completed: false
        });
    }

    if (order.status === 'cancelled') {
        timeline.push({ status: 'Cancelled', date: 'Order terminated', completed: true });
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-50 text-green-700 border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30';
            case 'shipped': return 'bg-sky-50 text-sky-700 border-sky-200/50 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
            case 'processing': return 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
            default: return 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-850 dark:text-neutral-350 dark:border-neutral-800';
        }
    };

    // Calculate customer stats
    const totalOrders = order.user?.total_orders || 0;
    const totalSpent = parseFloat(order.user?.total_spent || '0');
    const aov = totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : '0.00';

    // Calculate discount dynamically if stored discount_amount is 0 but final < subtotal + shipping + tax
    const subtotalNum = parseFloat(order.total_amount || '0');
    const shippingNum = parseFloat(order.shipping_amount || '0');
    const taxNum = parseFloat(order.tax_amount || '0');
    const finalNum = parseFloat(order.final_amount || '0');
    const calculatedDiscount = subtotalNum + shippingNum + taxNum - finalNum;
    const discountToShow = parseFloat(order.discount_amount || '0') > 0 
        ? parseFloat(order.discount_amount || '0') 
        : (calculatedDiscount > 0 ? calculatedDiscount : 0);

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Header section with modern design language */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[10px] p-6 border-black/50 border-[0.5px] dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/superadmin/dashboard/orders" className="p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-[0.5px] border-black/10 dark:border-neutral-700 rounded-[10px] transition-all">
                        <ArrowLeft size={16} className="text-black dark:text-white" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Order #{order.order_number}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border-[0.5px] ${getStatusBadge(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-gray-550 dark:text-gray-400 text-xs mt-1.5">Placed on {new Date(order.created_at).toLocaleString()} • {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={async () => {
                            try {
                                const response = await api.get(`/admin/orders/${order.id}/invoice`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `invoice-${order.order_number}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (error) {
                                console.error('Failed to download invoice:', error);
                                alert('Failed to download invoice');
                            }
                        }}
                        className="flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-black dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white px-4 py-2.5 rounded-[10px] font-medium transition-all active:scale-95 text-xs border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none"
                    >
                        <Printer size={16} />
                        Invoice
                    </button>

                    {/* Request Refund */}
                    {order.payment_status === 'paid' && (
                        <button
                            onClick={() => setIsRefundModalOpen(true)}
                            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 px-4 py-2.5 rounded-[10px] font-medium transition-all active:scale-95 text-xs border-[0.5px] border-red-200/50 dark:border-red-900/30 shadow-none"
                        >
                            Refund
                        </button>
                    )}

                    <button
                        className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 px-4 py-2.5 rounded-[10px] font-medium transition-all active:scale-95 text-xs border-[0.5px] border-transparent shadow-none"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Update Order
                    </button>

                    <button
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-[10px] font-medium transition-all active:scale-95 text-xs border-[0.5px] border-transparent shadow-none"
                        onClick={async () => {
                            if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                                try {
                                    await api.delete(`/admin/orders/${order.id}`);
                                    window.location.href = '/superadmin/dashboard/orders';
                                } catch (error) {
                                    console.error('Failed to delete order:', error);
                                    alert('Failed to delete order');
                                }
                            }
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Order Details Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order details & fulfillment */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Customer Notes banner if present */}
                    {order.order_notes && (
                        <div className="bg-amber-50/50 dark:bg-amber-955/10 border-[0.5px] border-amber-250/30 dark:border-amber-900/30 rounded-[10px] p-5 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-3">
                            <FileText className="text-amber-700 dark:text-amber-500 mt-0.5 flex-shrink-0" size={18} />
                            <div>
                                <h4 className="font-bold uppercase tracking-wider text-[10px]">Customer Order Note</h4>
                                <p className="mt-1 italic font-medium">"{order.order_notes}"</p>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none overflow-hidden">
                        <div className="p-6 border-b-[0.5px] border-black/50 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center gap-2">
                                <Package className="text-black dark:text-white" size={18} />
                                Order Items & Fulfillment
                            </h3>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-[10px]">
                                {order.items.length} {order.items.length === 1 ? 'Product' : 'Products'}
                            </span>
                        </div>
                        
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {order.items.map((item) => {
                                const sellerProfile = item.seller?.seller_profile || item.seller?.sellerProfile;
                                const brandName = item.product?.brand?.name || item.seller?.brand?.name || item.seller?.name || 'N/A';
                                
                                return (
                                    <div key={item.id} className="p-6 flex flex-col gap-4 hover:bg-neutral-50/30 dark:hover:bg-neutral-800/10 transition-all">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="h-14 w-14 bg-neutral-100 dark:bg-neutral-800 rounded-[10px] flex-shrink-0 flex items-center justify-center text-gray-900 dark:text-white font-bold border-[0.5px] border-black/50 dark:border-neutral-800">
                                                    {item.product_name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{item.product_name}</h4>
                                                    <p className="text-xs text-gray-550 dark:text-gray-400 mt-1 flex items-center gap-1">
                                                        Brand: <span className="text-black dark:text-white font-semibold">{brandName}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">₹{item.total}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.quantity} x ₹{item.price}</p>
                                            </div>
                                        </div>

                                        {/* Seller details for marketplace tracking */}
                                        <div className="bg-neutral-50 dark:bg-neutral-800/20 border-[0.5px] border-black/10 dark:border-neutral-800 rounded-[10px] p-4 text-xs">
                                            <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-semibold mb-2">
                                                <Store size={14} className="text-gray-500" />
                                                <span>Fulfillment Seller Details</span>
                                            </div>
                                            {item.seller ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600 dark:text-gray-400">
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Seller Name / Store</span>
                                                        <p className="font-medium text-gray-900 dark:text-white mt-0.5">{item.seller.name}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Contact Person</span>
                                                        <p className="font-medium text-gray-900 dark:text-white mt-0.5">{sellerProfile?.contact_person || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email Address</span>
                                                        <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                                                            {item.seller.email ? (
                                                                <a href={`mailto:${item.seller.email}`} className="hover:underline text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                                    {item.seller.email} <ExternalLink size={10} />
                                                                </a>
                                                            ) : '-'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phone Number</span>
                                                        <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                                                            {item.seller.phone ? (
                                                                <a href={`tel:${item.seller.phone}`} className="hover:underline">
                                                                    {item.seller.phone}
                                                                </a>
                                                            ) : '-'}
                                                        </p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pickup Address</span>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                                                            {sellerProfile?.pickup_address_line_1 ? (
                                                                <>
                                                                    {sellerProfile.pickup_address_line_1}
                                                                    {sellerProfile.pickup_address_line_2 && `, ${sellerProfile.pickup_address_line_2}`}
                                                                    {`, ${sellerProfile.pickup_address_city}, ${sellerProfile.pickup_address_state} - ${sellerProfile.pickup_address_pin_code}`}
                                                                    {`, ${sellerProfile.pickup_address_country || 'India'}`}
                                                                </>
                                                            ) : 'No pickup address defined'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">GSTIN</span>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">{sellerProfile?.gst_number || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">PAN Number</span>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5">{sellerProfile?.pan_number || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 dark:text-gray-500 italic">No seller information available for this product.</p>
                                            )}
                                        </div>

                                        {/* Prescription Details (Cureza Healthcare Store Specific) */}
                                        {item.patient_name && (
                                            <div className="bg-blue-50/20 dark:bg-blue-950/10 border-[0.5px] border-blue-100 dark:border-blue-900/30 rounded-[10px] p-4 text-xs space-y-2">
                                                <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-400 font-semibold">
                                                    <FileText size={14} />
                                                    <span>Prescription & Health Concern Details</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600 dark:text-gray-400">
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Patient Info</span>
                                                        <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                                                            {item.patient_name} ({item.patient_age} yrs, {item.patient_gender})
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Consulting Doctor</span>
                                                        <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                                                            Dr. {item.doctor?.name || 'N/A'} {item.doctor?.specialization && `(${item.doctor.specialization})`}
                                                        </p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Health Concern</span>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 mt-0.5 italic">"{item.health_concern}"</p>
                                                    </div>
                                                    <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-black/5 dark:border-neutral-800">
                                                        <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">Verification File</span>
                                                        {item.prescription_path ? (
                                                            <a 
                                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${item.prescription_path}`} 
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-gray-900 dark:text-white font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 border-[0.5px] border-black/50 dark:border-neutral-800 px-3 py-1.5 rounded-[10px] shadow-none text-xs transition-colors"
                                                            >
                                                                View Prescription Document <ExternalLink size={12} />
                                                            </a>
                                                        ) : (
                                                            <span className="text-red-500 dark:text-red-400 font-semibold uppercase tracking-wider text-[10px] bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/30">
                                                                Pending Doctor Approval
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Financial calculations */}
                        <div className="bg-neutral-50/50 dark:bg-neutral-800/20 p-6 border-t-[0.5px] border-black/50 dark:border-neutral-800 space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">₹{order.total_amount}</span>
                            </div>
                            
                            {discountToShow > 0 && (
                                <div className="flex justify-between text-xs text-green-600 dark:text-green-400 font-semibold font-mono">
                                    <span className="font-medium flex items-center gap-1 font-sans">
                                        Discount {order.coupon_code ? `(Coupon: ${order.coupon_code})` : ''}
                                    </span>
                                    <span className="font-bold">-₹{discountToShow.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Shipping Charges</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">₹{order.shipping_amount}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">GST / Taxes (Inclusive)</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">₹{order.tax_amount}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold border-t-[0.5px] border-black/50 dark:border-neutral-800 pt-4 mt-4">
                                <span className="text-gray-900 dark:text-white">Grand Total</span>
                                <span className="text-black dark:text-white text-base font-bold">₹{order.final_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipment Details & AWB Tracking */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-4 flex items-center gap-2">
                            <Truck className="text-black dark:text-white" size={18} />
                            Shipping & Courier Integration
                        </h3>
                        {order.tracking_id ? (
                            <div className="bg-neutral-50 dark:bg-neutral-800/30 border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="text-gray-450 dark:text-gray-500 font-medium">Courier Provider</span>
                                        <p className="font-semibold text-gray-900 dark:text-white mt-0.5 text-sm">{order.tracking_provider || 'Manual Courier'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-450 dark:text-gray-500 font-medium">AWB Tracking Number</span>
                                        <p className="font-semibold text-gray-900 dark:text-white mt-0.5 text-sm">{order.tracking_id}</p>
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <a
                                        href={`https://track.cureza.com/?awb=${order.tracking_id}&provider=${encodeURIComponent(order.tracking_provider || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-[10px] text-xs font-semibold hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors shadow-none border-[0.5px] border-transparent"
                                    >
                                        Track Package Live <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50/50 dark:bg-amber-955/10 border-[0.5px] border-amber-250/20 dark:border-amber-900/30 rounded-[10px] p-5 text-sm text-amber-850 dark:text-amber-400 flex items-start gap-3">
                                <div>
                                    <p className="font-semibold text-xs">No active tracking information available.</p>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-1">Please update this order status and insert courier details to activate shipment tracking.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-6 flex items-center gap-2">
                            <Clock className="text-black dark:text-white" size={18} />
                            Order Tracking Timeline
                        </h3>
                        <div className="relative pl-6 border-l-[0.5px] border-black/50 dark:border-neutral-800 space-y-8 ml-3">
                            {timeline.map((event, index) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[31px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-gray-900 transition-all shadow-none ${
                                        event.completed ? 'bg-green-500 dark:bg-green-400' : 'bg-neutral-200 dark:bg-neutral-800'
                                    }`}></div>
                                    <div>
                                        <p className={`font-semibold text-sm ${event.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>{event.status}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer Profile Analytics & Notes */}
                <div className="space-y-6">
                    
                    {/* Customer Identity Card */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'G'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {order.user?.name || 'Guest Customer'}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-750 dark:text-green-400 border-[0.5px] border-green-200/50 rounded-full text-[10px] font-bold uppercase">
                                        Registered
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t-[0.5px] border-black/10 dark:border-neutral-800 text-xs">
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider text-[9px] mt-0.5">Email</span>
                                <span className="font-semibold text-gray-900 dark:text-white text-right break-all">
                                    {order.user?.email ? (
                                        <a href={`mailto:${order.user.email}`} className="hover:underline flex items-center justify-end gap-1 text-indigo-600 dark:text-indigo-400">
                                            {order.user.email} <ExternalLink size={10} />
                                        </a>
                                    ) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider text-[9px] mt-0.5">Phone</span>
                                <span className="font-semibold text-gray-900 dark:text-white text-right">
                                    {order.user?.phone ? (
                                        <a href={`tel:${order.user.phone}`} className="hover:underline">
                                            {order.user.phone}
                                        </a>
                                    ) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider text-[9px] mt-0.5">Joined Date</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                    {order.user?.created_at ? new Date(order.user.created_at).toLocaleDateString() : '-'}
                                </span>
                            </div>
                            {order.user?.referral_code && (
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider text-[9px] mt-0.5">Referral Code</span>
                                    <span className="font-bold text-gray-805 dark:text-gray-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[10px]">
                                        {order.user.referral_code}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Acquisition Details & IP Logging */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                            <Globe size={16} className="text-gray-450" />
                            Acquisition & Tracking
                        </h3>
                        <div className="space-y-3.5 text-xs">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Signup Source</span>
                                <p className="font-bold text-gray-900 dark:text-white mt-1 capitalize flex items-center gap-1">
                                    <Activity size={12} className="text-indigo-500" />
                                    {order.user?.registration_source || 'Direct Web Registration'}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Registration IP</span>
                                <p className="font-semibold text-gray-900 dark:text-white mt-0.5 font-mono">
                                    {order.user?.registration_ip || 'N/A (Historical Account)'}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Device & User Agent</span>
                                <p className="text-gray-700 dark:text-gray-300 mt-0.5 font-medium leading-relaxed break-words">
                                    {order.user?.device_info || 'Unknown Browser Agent'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Value statistics */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                            <DollarSign size={16} className="text-gray-450" />
                            Customer Lifetime Value (LTV)
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-[10px] text-center border-[0.5px] border-black/10 dark:border-neutral-800">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Orders</span>
                                <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">{totalOrders}</p>
                            </div>
                            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-[10px] text-center border-[0.5px] border-black/10 dark:border-neutral-800 col-span-2">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Total Spent</span>
                                <p className="font-bold text-lg text-gray-900 dark:text-white mt-1">₹{totalSpent.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-[10px] border-[0.5px] border-black/10 dark:border-neutral-800 flex justify-between items-center text-xs">
                            <span className="text-gray-400 uppercase font-bold text-[10px]">Average Order Value</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹{aov}</span>
                        </div>
                    </div>

                    {/* Customer Wallet & Loyalty Points */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                            <Wallet size={16} className="text-gray-450" />
                            Wallet & Rewards
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-green-50/20 dark:bg-green-950/10 border-[0.5px] border-green-200/20 rounded-[10px] p-4 flex items-center gap-3">
                                <Wallet size={20} className="text-green-600 dark:text-green-400" />
                                <div>
                                    <span className="text-[9px] text-gray-400 uppercase font-bold">Balance</span>
                                    <p className="font-bold text-sm text-green-700 dark:text-green-400">₹{order.user?.wallet?.balance || '0.00'}</p>
                                </div>
                            </div>
                            <div className="bg-amber-50/20 dark:bg-amber-955/10 border-[0.5px] border-amber-200/20 rounded-[10px] p-4 flex items-center gap-3">
                                <Award size={20} className="text-amber-600 dark:text-amber-400" />
                                <div>
                                    <span className="text-[9px] text-gray-400 uppercase font-bold">Points</span>
                                    <p className="font-bold text-sm text-amber-700 dark:text-amber-400">{order.user?.wallet?.points || '0'} pts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Destination */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-4 flex items-center gap-2">
                            <MapPin className="text-gray-400 dark:text-gray-500" size={18} />
                            Shipping Destination
                        </h3>
                        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                            {order.shipping_address_json ? (
                                <>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{order.shipping_address_json.name}</p>
                                    <p className="leading-relaxed font-medium">{order.shipping_address_json.line}</p>
                                    {order.shipping_address_json.line2 && <p className="leading-relaxed font-medium">{order.shipping_address_json.line2}</p>}
                                    <p className="font-bold text-gray-950 dark:text-white mt-1 text-sm">{order.shipping_address_json.city}, {order.shipping_address_json.state} - {order.shipping_address_json.zip}</p>
                                    <p className="text-[10px] text-gray-450 dark:text-gray-500 uppercase tracking-wider font-bold mt-1.5">{order.shipping_address_json.country}</p>
                                </>
                            ) : (
                                <p className="italic text-gray-450 dark:text-gray-550">No shipping address provided</p>
                            )}
                        </div>
                    </div>

                    {/* Saved Addresses list */}
                    {order.user?.addresses && order.user.addresses.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                                <Map size={16} className="text-gray-450" />
                                Saved Addresses ({order.user.addresses.length})
                            </h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                {order.user.addresses.map((addr) => (
                                    <div key={addr.id} className="border-[0.5px] border-black/10 dark:border-neutral-800 rounded-[10px] p-3 text-[11px] bg-neutral-50 dark:bg-neutral-800/10 space-y-1">
                                        <div className="flex justify-between items-center font-bold">
                                            <span className="capitalize text-gray-900 dark:text-white">{addr.type} Address</span>
                                            {addr.is_default && (
                                                <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-150">DEFAULT</span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{addr.name}</p>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {addr.address_line_1}
                                            {addr.address_line_2 && `, ${addr.address_line_2}`}
                                        </p>
                                        <p className="text-gray-605 dark:text-gray-400 font-medium">
                                            {addr.city}, {addr.state} - {addr.zip}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Customer Purchase History (Past orders) */}
                    {order.user?.recent_orders && order.user.recent_orders.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                                <Receipt size={16} className="text-gray-450" />
                                Recent Customer Orders
                            </h3>
                            <div className="space-y-3">
                                {order.user.recent_orders.map((histOrder) => (
                                    <div key={histOrder.id} className="border-[0.5px] border-black/10 dark:border-neutral-800 rounded-[10px] p-3 text-[11px] bg-neutral-50 dark:bg-neutral-800/10 flex justify-between items-center">
                                        <div>
                                            <Link href={`/superadmin/dashboard/orders/${histOrder.id}`} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                                #{histOrder.order_number}
                                            </Link>
                                            <p className="text-gray-400 mt-1">{new Date(histOrder.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-900 dark:text-white">₹{histOrder.final_amount}</span>
                                            <div className="mt-1">
                                                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-850">
                                                    {histOrder.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-4 flex items-center gap-2">
                            <CreditCard className="text-gray-400 dark:text-gray-500" size={18} />
                            Payment Method Details
                        </h3>
                        <div className="space-y-4 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-450 dark:text-gray-500">Payment Status</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border-[0.5px] capitalize ${
                                    order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30' : 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                }`}>
                                    {order.payment_status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-450 dark:text-gray-500">Payment Method</span>
                                <span className="font-bold text-gray-900 dark:text-white uppercase">{order.payment_method}</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Refunds Display */}
                    {order.refunds && order.refunds.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-[10px] border-[0.5px] border-black/50 dark:border-neutral-800 shadow-none">
                            <h3 className="font-semibold text-red-650 dark:text-red-400 text-sm mb-4">
                                Refund History
                            </h3>
                            <div className="space-y-3">
                                {order.refunds.map((ref: any) => (
                                    <div key={ref.id} className="border-[0.5px] border-black/50 dark:border-neutral-800 rounded-[10px] p-4 bg-neutral-50 dark:bg-neutral-800/30 text-xs">
                                        <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                            <span>₹{ref.amount}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border-[0.5px] ${
                                                ref.status === 'approved' ? 'bg-green-55 text-green-755 border-green-200/50 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30' : 'bg-amber-55 text-amber-755 border-amber-250/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                            }`}>{ref.status}</span>
                                        </div>
                                        <p className="text-gray-550 dark:text-gray-400 mt-2 font-medium">Reason: {ref.reason}</p>
                                        {ref.admin_notes && <p className="text-gray-400 dark:text-gray-500 mt-1 italic">Notes: {ref.admin_notes}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Order Status and Tracking Modal */}
            {isEditModalOpen && order && (
                <EditOrderModal
                    order={order}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={fetchOrder}
                />
            )}

            {/* Manual Refund Dialog */}
            {isRefundModalOpen && order && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-[10px] shadow-xl w-full max-w-md mx-4 overflow-hidden border border-neutral-955/15 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-neutral-955/10 dark:border-neutral-800 bg-neutral-50/50 dark:bg-gray-850/50">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Initiate Refund</h3>
                            <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleRefundSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-1.5">Refund Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    max={order.final_amount}
                                    className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all"
                                />
                                <span className="text-[10px] text-gray-450 dark:text-gray-500 mt-1 block">Maximum refundable: ₹{order.final_amount}</span>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-1.5">Reason for Refund</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Customer returns damaged goods, etc."
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-550 uppercase tracking-wider mb-1.5">Admin Internal Notes (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Internal comments on package delivery confirmation"
                                    value={refundNotes}
                                    onChange={(e) => setRefundNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2.5 border-t border-neutral-955/10 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsRefundModalOpen(false)}
                                    className="px-4 py-2 border border-neutral-955/10 dark:border-neutral-800 rounded-[10px] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold text-xs transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={refunding}
                                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-[10px] font-semibold text-xs disabled:opacity-50 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all shadow-none"
                                >
                                    {refunding ? 'Processing...' : 'Confirm Refund'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
