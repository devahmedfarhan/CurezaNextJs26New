'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, MapPin, Truck, CreditCard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import axios from '@/lib/api';

// Update interfaces to match Laravel Order model
interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    total: string;
    product?: {
        brand?: {
            name: string;
        }
    }
}

interface OrderAddress {
    first_name: string;
    last_name: string;
    street_address: string;
    city: string;
    state: string;
    postcode: string;
    phone: string;
}

interface ShippingMethod {
    id: number;
    name: string;
    description: string;
    cost: string;
}

interface OrderDetails {
    id: number;
    order_number: string;
    created_at: string;
    payment_method: string;
    payment_status: string;
    shipping_method: ShippingMethod | null;
    // Database columns:
    total_amount: string;     // Subtotal
    discount_amount: string;
    tax_amount: string;
    shipping_amount: string;
    final_amount: string;     // Grand Total

    // Address JSON columns
    shipping_address_json: OrderAddress;

    items: OrderItem[];
    status: string;
}

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (orderId) {
            axios.get(`/orders/${orderId}`)
                .then((response) => {
                    // Controller returns model directly
                    setOrder(response.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to fetch order:', err);
                    setError('Failed to load order details');
                    setLoading(false);
                });
        }
    }, [orderId]);

    if (!orderId) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Order Confirmed</h1>
                <p className="mb-8">Thank you for your purchase.</p>
                <Link href="/shop" className="bg-cureza-green text-white px-6 py-3 rounded-lg">Continue Shopping</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cureza-green"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/shop" className="text-cureza-green hover:underline">Return to Shop</Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cureza-green"></div>
            </div>
        );
    }

    // Safe access for addresses
    const shipping = order.shipping_address_json || {} as OrderAddress;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Success Header */}
                    <div className="bg-white p-8 rounded-t-xl border-b text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600">Your order <span className="font-bold text-gray-900">#{order.order_number}</span> has been placed.</p>
                        <p className="text-sm text-gray-500 mt-2">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white p-8 rounded-b-xl shadow-sm border border-t-0 space-y-8">

                        {/* Items */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Items Ordered</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-bold text-gray-900">{item.product_name}</p>
                                            <p className="text-xs text-gray-500 font-medium uppercase mb-1">
                                                {item.product?.brand?.name || 'Brand'}
                                            </p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-gray-900">₹{parseFloat(item.total).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Addresses & Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin size={18} className="text-gray-400" /> Shipping Address
                                </h3>
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    <p className="font-medium text-gray-900">{shipping.first_name} {shipping.last_name}</p>
                                    <p>{shipping.street_address}</p>
                                    <p>{shipping.city}, {shipping.state} {shipping.postcode}</p>
                                    <p>{shipping.phone}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <CreditCard size={18} className="text-gray-400" /> Payment Info
                                </h3>
                                <div className="text-sm text-gray-600">
                                    <p>Method: <span className="font-medium uppercase">{order.payment_method}</span></p>
                                    <p>Payment Status: <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.payment_status}</span></p>
                                </div>
                                <h3 className="font-bold text-gray-900 mt-6 mb-3 flex items-center gap-2">
                                    <Truck size={18} className="text-gray-400" /> Shipping Method
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {(order.shipping_method?.name === 'Standard Delivery' || !order.shipping_method?.name)
                                        ? 'shipping'
                                        : order.shipping_method?.name}
                                </p>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span>
                                <span>₹{parseFloat(order.tax_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>{parseFloat(order.shipping_amount) === 0 ? 'free' : `₹${parseFloat(order.shipping_amount).toFixed(2)}`}</span>
                            </div>
                            {parseFloat(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span>₹{parseFloat(order.final_amount).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <Link href="/shop" className="inline-flex items-center gap-2 text-cureza-green font-bold hover:underline">
                                <ChevronLeft size={18} /> Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
