'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, User, CreditCard, Printer } from 'lucide-react';
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
    final_amount: string;
    tax_amount: string;
    shipping_amount: string;
    shipping_address_json: any;
    user: { name: string; email: string; phone?: string } | null;
    items: OrderItem[];
    shipments: any[];
}

export default function AdminOrderDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    const fetchOrder = async () => {
        if (!id) return;
        try {
            console.log('Fetching order details for ID:', id);
            console.log('Request URL:', `/admin/orders/${id}`);
            const response = await api.get(`/admin/orders/${id}`);
            console.log('Order fetch success:', response.status);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    if (loading) return <div className="p-6 text-center">Loading Order Details...</div>;
    if (!order) return <div className="p-6 text-center text-red-500">Order not found</div>;

    // Construct Timeline Logic
    const timeline = [
        { status: 'Order Placed', date: new Date(order.created_at).toLocaleString(), completed: true },
        { status: 'Payment (' + order.payment_status + ')', date: '-', completed: order.payment_status === 'paid' },
        { status: 'Processing', date: '-', completed: order.status !== 'pending' && order.status !== 'cancelled' },
        { status: 'Shipped', date: order.shipments.length > 0 ? new Date(order.shipments[0].shipped_at || Date.now()).toLocaleDateString() : 'Pending', completed: order.shipments.some(s => s.status === 'shipped' || s.status === 'delivered') },
        { status: 'Delivered', date: order.shipments.length > 0 ? new Date(order.shipments[0].delivered_at || Date.now()).toLocaleDateString() : 'Pending', completed: order.shipments.some(s => s.status === 'delivered') },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/superadmin/dashboard/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
                        <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString()} • {order.items.length} Items</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            try {
                                const response = await api.get(`/admin/orders/${order.id}/invoice`, {
                                    responseType: 'blob'
                                });
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
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Printer size={18} />
                        Download Invoice
                    </button>

                    {/* Edit Order Button */}
                    <button
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Edit Order
                    </button>

                    {/* Delete Order Button */}
                    <button
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="font-bold text-gray-900">Order Items</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">IMG</div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                                            <p className="text-sm text-gray-500">Brand: <span className="text-cureza-green">{item.product?.brand?.name || item.seller?.name || 'N/A'}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">₹{item.total}</p>
                                            <p className="text-sm text-gray-500">{item.quantity} x {item.price}</p>
                                        </div>
                                    </div>
                                    {item.patient_name && (
                                        <div className="ml-20 bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-600 space-y-2">
                                            <div className="flex flex-wrap gap-4 justify-between font-medium">
                                                <div>Patient: <span className="text-gray-950 font-semibold">{item.patient_name}</span> ({item.patient_age} yrs, {item.patient_gender})</div>
                                                <div>Doctor: <span className="text-gray-950 font-semibold">Dr. {item.doctor?.name || 'N/A'}</span></div>
                                            </div>
                                            <div> Concern: <span className="italic">"{item.health_concern}"</span></div>
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                                <span>Prescription Status:</span>
                                                {item.prescription_path ? (
                                                    <a 
                                                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${item.prescription_path}`} 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-cureza-green font-bold hover:underline flex items-center gap-1"
                                                    >
                                                        Download Prescription PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-red-500 font-bold">Pending Doctor Approval</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-gray-900">₹{order.shipping_amount}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium text-gray-900">₹{order.tax_amount}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-4 mt-4">
                                <span className="text-gray-900">Total</span>
                                <span className="text-cureza-green">₹{order.final_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6">Order Status</h3>
                        <div className="relative pl-4 border-l-2 border-gray-200 space-y-8">
                            {timeline.map((event, index) => (
                                <div key={index} className="relative">
                                    <div className={`absolute -left-[21px] top-1 h-4 w-4 rounded-full border-2 ${event.completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                                        }`}></div>
                                    <div>
                                        <p className={`font-medium ${event.completed ? 'text-gray-900' : 'text-gray-500'}`}>{event.status}</p>
                                        <p className="text-xs text-gray-500">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={18} className="text-gray-400" />
                            Customer Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                            <p className="text-gray-600">{order.user?.email || '-'}</p>
                            <p className="text-gray-600">{order.user?.phone || '-'}</p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-gray-400" />
                            Shipping Address
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            {order.shipping_address_json ? (
                                <>
                                    <p className="font-medium text-gray-900">{order.shipping_address_json.name}</p>
                                    <p>{order.shipping_address_json.line}</p>
                                    <p>{order.shipping_address_json.city}, {order.shipping_address_json.state} - {order.shipping_address_json.zip}</p>
                                    <p>{order.shipping_address_json.country}</p>
                                </>
                            ) : (
                                <p>No shipping address provided</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard size={18} className="text-gray-400" />
                            Payment Info
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">
                                    {order.payment_status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Method</span>
                                <span className="font-medium text-gray-900">{order.payment_method}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Order Modal */}
            {isEditModalOpen && order && (
                <EditOrderModal
                    order={order}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={fetchOrder}
                />
            )}
        </div>
    );
}
