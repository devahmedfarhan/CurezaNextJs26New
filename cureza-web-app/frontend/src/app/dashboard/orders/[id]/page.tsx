'use client';

import Link from 'next/link';
import { ArrowLeft, Download, MapPin, Package, Truck, FileText, CreditCard, Calendar, Hash, CheckCircle, Clock, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '@/lib/api';
import { useParams } from 'next/navigation';

export default function OrderDetailsPage() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [trackingInfo, setTrackingInfo] = useState<{ id: string, provider: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchOrderDetails();
            fetchOrderTracking();
        }
    }, [params.id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`/orders/${params.id}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        }
        // Don't set loading false here, wait for both or handle individually
        // For simplicity, we can let the second call handle finishing loading
    };

    const fetchOrderTracking = async () => {
        try {
            const response = await axios.get(`/orders/${params.id}/track`);
            setTimeline(response.data.timeline || []);
            if (response.data.tracking_id) {
                setTrackingInfo({
                    id: response.data.tracking_id,
                    provider: response.data.tracking_provider
                });
            }
        } catch (error) {
            console.error('Failed to fetch tracking:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading order details...</div>;
    }

    if (!order) {
        return <div className="p-8 text-center">Order not found.</div>;
    }

    const billingAddress = order.billing_address_json || {};
    const shippingAddress = order.shipping_address_json || {};

    const handleDownloadInvoice = async () => {
        try {
            const response = await axios.get(`/orders/${params.id}/invoice`, {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.order_number}.html`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download invoice:', error);
            alert('Failed to download invoice. Please try again.');
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

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Order Details</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and track your order</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadInvoice}
                    className="flex items-center gap-2 px-4 py-2 bg-cureza-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                >
                    <Download size={16} /> Download Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Info & Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Content Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

                        {/* Order Info Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Order Number</div>
                                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Hash size={14} className="text-gray-400" />
                                    {order.order_number}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Order Date</div>
                                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Payment Method</div>
                                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 uppercase">
                                    <CreditCard size={14} className="text-gray-400" />
                                    {order.payment_method}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Order Status</div>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                    {order.status}
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Order Items</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-4 font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="pb-4 font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                            <th className="pb-4 font-bold text-gray-500 uppercase tracking-wider text-right">Price</th>
                                            <th className="pb-4 font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {order.items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="py-4 pr-4">
                                                    <div className="font-bold text-gray-900 dark:text-gray-100">{item.product_name}</div>
                                                    <div className="text-xs text-cureza-green font-medium uppercase mt-0.5">
                                                        {item.product?.brand?.name || 'Brand'}
                                                    </div>
                                                    {item.product?.short_description && (
                                                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{item.product.short_description}</div>
                                                    )}
                                                    {item.patient_name && (
                                                        <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded inline-block">
                                                            <span className="font-medium">Patient:</span> {item.patient_name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 text-center font-medium">{item.quantity}</td>
                                                <td className="py-4 text-right text-gray-600">₹{item.price}</td>
                                                <td className="py-4 text-right font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col md:flex-row justify-end">
                                <div className="w-full md:w-1/2 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="font-medium">₹{order.total_amount}</span>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Shipping ({order.shipping_method?.name || 'Standard'})</span>
                                        <span className="font-medium">₹{order.shipping_amount}</span>
                                    </div>

                                    {/* Tax Breakdown */}
                                    {Number(order.igst) > 0 ? (
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                            <span>IGST (5%)</span>
                                            <span className="font-medium">₹{order.igst}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                                <span>CGST (2.5%)</span>
                                                <span className="font-medium">₹{order.cgst}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                                <span>SGST (2.5%)</span>
                                                <span className="font-medium">₹{order.sgst}</span>
                                            </div>
                                        </>
                                    )}

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base font-bold text-gray-900 dark:text-gray-100">Total Amount</span>
                                            <span className="text-xl font-bold text-cureza-green">₹{order.final_amount}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 text-right mt-1">
                                            (Inclusive of all taxes)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Tracking & Addresses */}
                <div className="space-y-8">
                    {/* Tracking Timeline */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <Truck size={20} className="text-cureza-green" /> Tracking Status
                        </h3>

                        {trackingInfo && (
                            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tracking Number</div>
                                <div className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    {trackingInfo.id}
                                    <button
                                        onClick={() => navigator.clipboard.writeText(trackingInfo.id)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                        title="Copy"
                                    >
                                        <FileText size={14} className="text-gray-400" />
                                    </button>
                                    {getTrackingUrl(trackingInfo.provider, trackingInfo.id) && (
                                        <a
                                            href={getTrackingUrl(trackingInfo.provider, trackingInfo.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 text-xs bg-cureza-green text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                                        >
                                            Track Order
                                        </a>
                                    )}
                                </div>
                                {trackingInfo.provider && (
                                    <div className="mt-2 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Courier: </span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{trackingInfo.provider}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-8">
                            {timeline.map((step, index) => (
                                <div key={index} className="relative">
                                    {/* Dot */}
                                    <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 transition-colors duration-300
                                        ${step.is_completed || step.is_current
                                            ? 'bg-cureza-green border-cureza-green'
                                            : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                                        }`}
                                    />

                                    <div className={`${step.is_completed || step.is_current ? 'opacity-100' : 'opacity-50'}`}>
                                        <h4 className={`text-sm font-bold ${step.is_current ? 'text-cureza-green' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {step.step}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                                        {step.timestamp && (
                                            <p className="text-xs text-gray-400 mt-1 font-mono">{step.timestamp}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <MapPin size={14} /> Shipping Address
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                <p className="font-bold text-gray-900 dark:text-gray-200">{shippingAddress.first_name} {shippingAddress.last_name}</p>
                                <p>{shippingAddress.street_address}</p>
                                {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                                <p>{shippingAddress.city} - {shippingAddress.postcode}</p>
                                <p className="mt-1">{shippingAddress.phone}</p>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FileText size={14} /> Billing Address
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                <p className="font-bold text-gray-900 dark:text-gray-200">{billingAddress.first_name} {billingAddress.last_name}</p>
                                <p>{billingAddress.street_address}</p>
                                <p>{billingAddress.city} - {billingAddress.postcode}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
