'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, User, CreditCard, Printer, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import EditOrderModal from '@/components/admin/EditOrderModal';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
    total: string;
    seller: { name: string } | null;
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
    shipping_address_json: any;
    user: { name: string; email: string; phone?: string } | null;
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
        { status: 'Shipped', date: order.shipments && order.shipments.length > 0 ? new Date(order.shipments[0].shipped_at || Date.now()).toLocaleDateString() : 'Pending', completed: order.shipments && order.shipments.some(s => s.status === 'shipped' || s.status === 'delivered') },
        { status: 'Delivered', date: order.shipments && order.shipments.length > 0 && order.shipments[0].delivered_at ? new Date(order.shipments[0].delivered_at).toLocaleDateString() : 'Pending', completed: order.shipments && order.shipments.some(s => s.status === 'delivered') },
    ];

    if (order.status === 'cancelled') {
        timeline.push({ status: 'Cancelled', date: 'Order terminated', completed: true });
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'shipped': return 'bg-sky-100 text-sky-800 border-sky-200';
            case 'processing': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
            {/* Header section with modern background gradient */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/superadmin/dashboard/orders" className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-all">
                        <ArrowLeft size={20} className="text-white" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Order #{order.order_number}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusBadge(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <p className="text-teal-50 text-sm mt-1">Placed on {new Date(order.created_at).toLocaleString()} • {order.items.length} Items</p>
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
                        className="flex items-center gap-2 bg-white text-teal-800 px-4 py-2.5 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-sm text-sm"
                    >
                        <Printer size={18} />
                        Download Invoice
                    </button>

                    {/* Request Refund */}
                    {order.payment_status === 'paid' && (
                        <button
                            onClick={() => setIsRefundModalOpen(true)}
                            className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-sm text-sm"
                        >
                            Initiate Refund
                        </button>
                    )}

                    <button
                        className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors shadow-sm text-sm"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Update Order
                    </button>

                    <button
                        className="flex items-center gap-2 bg-rose-700 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-rose-800 transition-colors shadow-sm text-sm"
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Items */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <Package className="text-teal-600" size={20} />
                                Order Items
                            </h3>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-150 px-2.5 py-1 rounded-md">{order.items.length} Products</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col gap-4 hover:bg-slate-50/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl flex-shrink-0 flex items-center justify-center text-teal-600 font-bold border border-teal-100/50 shadow-inner">
                                            {item.product_name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-800 truncate text-base">{item.product_name}</h4>
                                            <p className="text-sm text-slate-500 mt-0.5">Brand: <span className="text-teal-600 font-medium">{item.product?.brand?.name || item.seller?.name || 'N/A'}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800 text-base">₹{item.total}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{item.quantity} x ₹{item.price}</p>
                                        </div>
                                    </div>
                                    {item.patient_name && (
                                        <div className="ml-0 sm:ml-20 bg-teal-50/40 border border-teal-100/50 rounded-xl p-4 text-xs text-slate-600 space-y-2">
                                            <div className="flex flex-wrap gap-4 justify-between font-medium">
                                                <div>Patient: <span className="text-slate-900 font-bold">{item.patient_name}</span> ({item.patient_age} yrs, {item.patient_gender})</div>
                                                <div>Doctor: <span className="text-slate-900 font-bold">Dr. {item.doctor?.name || 'N/A'}</span></div>
                                            </div>
                                            <div>Concern: <span className="italic text-slate-800">"{item.health_concern}"</span></div>
                                            <div className="flex items-center justify-between pt-2 border-t border-teal-100/30">
                                                <span className="font-medium">Prescription File:</span>
                                                {item.prescription_path ? (
                                                    <a 
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${item.prescription_path}`} 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-teal-700 font-bold hover:underline hover:text-teal-800 flex items-center gap-1 bg-white border border-teal-100 px-3 py-1 rounded-lg shadow-sm"
                                                    >
                                                        View Prescription PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-rose-500 font-bold">Pending Approval</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-50/80 p-6 border-t border-slate-100">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500 font-medium">Subtotal</span>
                                <span className="font-semibold text-slate-700">₹{order.total_amount}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500 font-medium">Shipping Charges</span>
                                <span className="font-semibold text-slate-700">₹{order.shipping_amount}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500 font-medium">GST / Taxes</span>
                                <span className="font-semibold text-slate-700">₹{order.tax_amount}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-slate-200/80 pt-4 mt-4">
                                <span className="text-slate-850">Grand Total</span>
                                <span className="text-emerald-600 text-xl font-extrabold">₹{order.final_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipment Details & AWB Tracking */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <Truck className="text-teal-600" size={20} />
                            Shipping & Courier Integration
                        </h3>
                        {order.tracking_id ? (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-450 font-medium">Courier Provider</span>
                                        <p className="font-bold text-slate-800 mt-0.5">{order.tracking_provider || 'Manual Courier'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-450 font-medium">AWB Tracking Number</span>
                                        <p className="font-bold text-slate-800 mt-0.5">{order.tracking_id}</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <a
                                        href={`https://track.cureza.com/?awb=${order.tracking_id}&provider=${encodeURIComponent(order.tracking_provider || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
                                    >
                                        Track Package Live
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-5 text-sm text-amber-800 flex items-start gap-3">
                                <div>
                                    <p className="font-semibold">No active tracking information available.</p>
                                    <p className="text-xs text-amber-700 mt-1">Please update this order status and insert courier details to activate shipment tracking.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
                        <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                            <Clock className="text-teal-600" size={20} />
                            Order Tracking Timeline
                        </h3>
                        <div className="relative pl-6 border-l-2 border-slate-150 space-y-8 ml-3">
                            {timeline.map((event, index) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[31px] top-1 h-5 w-5 rounded-full border-4 shadow-sm transition-all ${event.completed ? 'bg-emerald-500 border-emerald-100' : 'bg-white border-slate-200'
                                        }`}></div>
                                    <div>
                                        <p className={`font-bold text-sm ${event.completed ? 'text-slate-850' : 'text-slate-400'}`}>{event.status}</p>
                                        <p className="text-xs text-slate-450 mt-0.5">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <User className="text-slate-400" size={18} />
                            Customer Information
                        </h3>
                        <div className="space-y-3 text-sm text-slate-650">
                            <div>
                                <span className="text-xs text-slate-400 font-medium">Name</span>
                                <p className="font-bold text-slate-800">{order.user?.name || 'Guest'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 font-medium">Email</span>
                                <p className="font-bold text-slate-800">{order.user?.email || '-'}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 font-medium">Phone</span>
                                <p className="font-bold text-slate-800">{order.user?.phone || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <MapPin className="text-slate-400" size={18} />
                            Shipping Destination
                        </h3>
                        <div className="space-y-2 text-sm text-slate-650">
                            {order.shipping_address_json ? (
                                <>
                                    <p className="font-bold text-slate-800 mb-2">{order.shipping_address_json.name}</p>
                                    <p className="leading-relaxed">{order.shipping_address_json.line}</p>
                                    <p className="font-medium text-slate-800 mt-1">{order.shipping_address_json.city}, {order.shipping_address_json.state} - {order.shipping_address_json.zip}</p>
                                    <p className="text-xs text-slate-450 uppercase tracking-wider font-semibold mt-1">{order.shipping_address_json.country}</p>
                                </>
                            ) : (
                                <p className="italic text-slate-400">No shipping address provided</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <CreditCard className="text-slate-400" size={18} />
                            Payment Method Details
                        </h3>
                        <div className="space-y-4 text-sm text-slate-650">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-450">Payment Status</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-amber-50 text-amber-700 border-amber-250'}`}>
                                    {order.payment_status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-450">Payment Method</span>
                                <span className="font-bold text-slate-800 uppercase">{order.payment_method}</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Refunds Display */}
                    {order.refunds && order.refunds.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                <span className="text-rose-500 font-bold">Refund History</span>
                            </h3>
                            <div className="space-y-3">
                                {order.refunds.map((ref: any) => (
                                    <div key={ref.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 text-xs">
                                        <div className="flex justify-between font-bold text-slate-850">
                                            <span>₹{ref.amount}</span>
                                            <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${ref.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{ref.status}</span>
                                        </div>
                                        <p className="text-slate-500 mt-2 font-medium">Reason: {ref.reason}</p>
                                        {ref.admin_notes && <p className="text-slate-400 mt-1 italic">Notes: {ref.admin_notes}</p>}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-100 animate-fadeIn">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-lg">Initiate Refund</h3>
                            <button onClick={() => setIsRefundModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleRefundSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-450 uppercase mb-1">Refund Amount (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    max={order.final_amount}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold"
                                />
                                <span className="text-xs text-slate-450 mt-1 block">Maximum refundable: ₹{order.final_amount}</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-450 uppercase mb-1">Reason for Refund</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Customer returns damaged goods, etc."
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-450 uppercase mb-1">Admin Internal Notes (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="Internal comments on package delivery confirmation"
                                    value={refundNotes}
                                    onChange={(e) => setRefundNotes(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRefundModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-650 hover:bg-slate-50 font-semibold text-sm transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={refunding}
                                    className="px-5 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-semibold text-sm disabled:opacity-50 transition-all shadow-sm"
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


