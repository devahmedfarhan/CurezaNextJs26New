'use client';

import Link from 'next/link';
import { ArrowLeft, Printer, Truck, Package, CheckCircle, Clock, MapPin, User, Mail, Phone, CreditCard, Calendar, FileText, AlertCircle, Save, Edit2 } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import axios from '@/lib/api';

export default function SellerOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [trackingId, setTrackingId] = useState('');
    const [trackingProvider, setTrackingProvider] = useState('');
    const [isEditingTracking, setIsEditingTracking] = useState(false);
    const [isSavingTracking, setIsSavingTracking] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    useEffect(() => {
        if (order) {
            setTrackingId(order.tracking_id || '');
            setTrackingProvider(order.tracking_provider || '');
        }
    }, [order]);

    const fetchOrder = async () => {
        try {
            const response = await axios.get(`/seller/orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const itemsTotal = order ? order.items.reduce((acc: number, item: any) => acc + parseFloat(item.total), 0) : 0;
    const shippingAddress = order ? (order.shipping_address_json || {}) : {};
    const billingAddress = order ? (order.billing_address_json || {}) : {};

    const handlePrintInvoice = () => {
        // Generate invoice number from order number
        const invoiceNumber = `INV-${order.order_number}`;

        // Create printable invoice content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .invoice-number { font-size: 24px; font-weight: bold; color: #059669; }
                    .info-section { margin: 20px 0; }
                    .info-label { font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f3f4f6; }
                    .total-row { font-weight: bold; background-color: #f9fafb; }
                    .footer { margin-top: 40px; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>INVOICE</h1>
                    <div class="invoice-number">${invoiceNumber}</div>
                    <p>Order #${order.order_number}</p>
                    <p>Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                
                <div class="info-section">
                    <p><span class="info-label">Customer:</span> ${order.user?.name || 'Guest Customer'}</p>
                    <p><span class="info-label">Email:</span> ${order.user?.email || shippingAddress.email || 'N/A'}</p>
                    <p><span class="info-label">Phone:</span> ${shippingAddress.phone || 'N/A'}</p>
                </div>
                
                <div class="info-section">
                    <p class="info-label">Shipping Address:</p>
                    <p>${shippingAddress.first_name} ${shippingAddress.last_name}<br>
                    ${shippingAddress.street_address}${shippingAddress.apartment ? ', ' + shippingAddress.apartment : ''}<br>
                    ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postcode}<br>
                    ${shippingAddress.country || 'India'}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>SKU</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((item: any) => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.product?.sku || 'N/A'}</td>
                                <td>${item.quantity}</td>
                                <td>₹${parseFloat(item.price).toFixed(2)}</td>
                                <td>₹${parseFloat(item.total).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="4" style="text-align: right;">Subtotal:</td>
                            <td>₹${itemsTotal.toFixed(2)}</td>
                        </tr>
                        ${order.igst > 0 ? `
                            <tr>
                                <td colspan="4" style="text-align: right;">IGST:</td>
                                <td>₹${parseFloat(order.igst).toFixed(2)}</td>
                            </tr>
                        ` : `
                            <tr>
                                <td colspan="4" style="text-align: right;">CGST:</td>
                                <td>₹${parseFloat(order.cgst).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" style="text-align: right;">SGST:</td>
                                <td>₹${parseFloat(order.sgst).toFixed(2)}</td>
                            </tr>
                        `}
                        <tr>
                            <td colspan="4" style="text-align: right;">Shipping:</td>
                            <td>₹${parseFloat(order.shipping_amount).toFixed(2)}</td>
                        </tr>
                        ${order.discount_amount > 0 ? `
                            <tr>
                                <td colspan="4" style="text-align: right;">Discount:</td>
                                <td>-₹${parseFloat(order.discount_amount).toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td colspan="4" style="text-align: right; font-size: 18px;">TOTAL:</td>
                            <td style="font-size: 18px;">₹${parseFloat(order.final_amount).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="info-section">
                    <p><span class="info-label">Payment Method:</span> ${order.payment_method.toUpperCase()}</p>
                    <p><span class="info-label">Payment Status:</span> ${order.payment_status.toUpperCase()}</p>
                </div>
                
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>This is a computer-generated invoice.</p>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handlePrintShippingLabel = () => {
        const labelContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Shipping Label - ${order.order_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .label-container { border: 3px solid #000; padding: 20px; max-width: 600px; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .section { margin: 15px 0; }
                    .section-title { font-weight: bold; font-size: 14px; margin-bottom: 5px; text-transform: uppercase; }
                    .address-box { border: 2px solid #000; padding: 15px; margin: 10px 0; }
                    .order-info { background: #f0f0f0; padding: 10px; margin: 10px 0; }
                    .barcode { text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="label-container">
                    <div class="header">
                        <h1 style="margin: 0;">SHIPPING LABEL</h1>
                    </div>
                    
                    <div class="order-info">
                        <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                        <p style="margin: 5px 0;"><strong>Shipping Method:</strong> ${order.shippingMethod?.name || 'Standard Shipping'}</p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">Ship To:</div>
                        <div class="address-box">
                            <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${shippingAddress.first_name} ${shippingAddress.last_name}</p>
                            <p style="margin: 5px 0;">${shippingAddress.street_address}</p>
                            ${shippingAddress.apartment ? `<p style="margin: 5px 0;">${shippingAddress.apartment}</p>` : ''}
                            <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postcode}</p>
                            <p style="margin: 5px 0;">${shippingAddress.country || 'India'}</p>
                            <p style="margin: 10px 0 5px 0;"><strong>Phone:</strong> ${shippingAddress.phone || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="barcode">
                        *${order.order_number}*
                    </div>
                    
                    <div class="section">
                        <p style="margin: 5px 0;"><strong>Total Items:</strong> ${order.items.length}</p>
                        <p style="margin: 5px 0;"><strong>Total Weight:</strong> ${order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} units</p>
                        <p style="margin: 5px 0;"><strong>Payment:</strong> ${order.payment_method.toUpperCase()} - ${order.payment_status.toUpperCase()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(labelContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await axios.put(`/seller/orders/${id}/status`, { status: newStatus });
            fetchOrder();
            alert(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update order status. Please try again.');
        }
    };

    const handleSaveTracking = async () => {
        if (!trackingId.trim()) {
            alert('Please enter a tracking ID');
            return;
        }

        setIsSavingTracking(true);
        try {
            await axios.put(`/seller/orders/${id}/tracking`, {
                tracking_id: trackingId,
                tracking_provider: trackingProvider
            });
            alert('Tracking information updated successfully');
            setIsEditingTracking(false);
            fetchOrder();
        } catch (error) {
            console.error('Failed to update tracking:', error);
            alert('Failed to update tracking information');
        } finally {
            setIsSavingTracking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order not found</h2>
                <p className="text-gray-500 mt-2">The order you're looking for doesn't exist or you don't have access to it.</p>
                <Link href="/seller/dashboard/orders" className="mt-4 inline-block px-4 py-2 bg-emerald-650 text-white rounded-lg hover:bg-emerald-700">
                    Back to Orders
                </Link>
            </div>
        );
    }

    // Order timeline stages
    const timelineStages = [
        { status: 'pending', label: 'Order Placed', icon: Package },
        { status: 'processing', label: 'Processing', icon: Clock },
        { status: 'shipped', label: 'Shipped', icon: Truck },
        { status: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const statusColors: any = {
        pending: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
        processing: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
        shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30',
        delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
        cancelled: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
    };

    const getStatusIndex = (status: string) => {
        return timelineStages.findIndex(s => s.status === status.toLowerCase());
    };

    const getStatusLabel = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'Pending';
            case 'processing': return 'Processing';
            case 'shipped': return 'Shipped';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const currentStatusIndex = getStatusIndex(order.status);

    const getImageUrl = (path: string | null) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        return path.startsWith('/') ? `${backend}${path}` : `${backend}/storage/${path}`;
    };

    return (
        <div className="space-y-6 pb-8 w-full">
            {/* Cancellation Banner */}
            {order.status.toLowerCase() === 'cancelled' && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="text-rose-500 flex-shrink-0" size={20} />
                    <div>
                        <h3 className="font-bold text-rose-950 dark:text-rose-400 text-sm">Order Cancelled</h3>
                        <p className="text-xs text-rose-700 dark:text-rose-300/85 font-medium mt-0.5">This order has been cancelled and will not be processed further.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-start gap-4">
                        <Link href="/seller/dashboard/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mt-1 border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-heading font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Order #{order.order_number}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span>{new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </div>
                                <span className="text-gray-300 dark:text-gray-700">•</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize ${statusColors[order.status.toLowerCase()] || statusColors.pending}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <button
                            onClick={handlePrintInvoice}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <Printer size={14} className="text-gray-500 dark:text-gray-400" />
                            Print Invoice
                        </button>
                        <button
                            onClick={handlePrintShippingLabel}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        >
                            <Package size={14} className="text-gray-500 dark:text-gray-400" />
                            Print Shipping Label
                        </button>

                        {/* Status Update Buttons */}
                        {order.status === 'pending' && (
                            <button
                                onClick={() => handleUpdateStatus('processing')}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors border border-transparent shadow-sm"
                            >
                                <Clock size={14} />
                                Mark as Processing
                            </button>
                        )}
                        {order.status === 'processing' && (
                            <button
                                onClick={() => handleUpdateStatus('shipped')}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors border border-transparent shadow-sm"
                            >
                                <Truck size={14} />
                                Mark as Shipped
                            </button>
                        )}
                        {order.status === 'shipped' && (
                            <button
                                onClick={() => handleUpdateStatus('delivered')}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors border border-transparent shadow-sm"
                            >
                                <CheckCircle size={14} />
                                Mark as Delivered
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-6">Order Timeline</h2>
                <div className="relative px-8">
                    <div className="absolute top-6 left-[56px] right-[56px] h-0.5 bg-gray-100 dark:bg-gray-800">
                        <div
                            className="h-full bg-emerald-600 transition-all duration-500"
                            style={{ width: `${currentStatusIndex >= 0 ? (currentStatusIndex / (timelineStages.length - 1)) * 100 : 0}%` }}
                        ></div>
                    </div>
                    <div className="relative flex justify-between">
                        {timelineStages.map((stage, index) => {
                            const Icon = stage.icon;
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;

                            // Show date
                            let showDate = '';
                            if (stage.status === 'pending') {
                                showDate = new Date(order.created_at).toLocaleString('en-IN', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                            } else if (isCurrent && order.status !== 'pending') {
                                showDate = new Date(order.updated_at).toLocaleString('en-IN', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                            }

                            return (
                                <div key={stage.status} className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all z-10 ${
                                        isCurrent
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                                            : isCompleted
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                                    }`}>
                                        <Icon size={18} />
                                    </div>
                                    <p className={`mt-3 text-xs font-bold text-center ${isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {stage.label}
                                    </p>
                                    {showDate && (
                                        <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 font-semibold whitespace-nowrap">
                                            {showDate}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items & Summary (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Order Items</h3>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">{order.items.length} Item(s) in This Order</p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-6">
                                    <div className="flex gap-6">
                                        {item.product?.image ? (
                                            <img
                                                src={getImageUrl(item.product.image)}
                                                alt={item.product_name}
                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-800 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                                                📦
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{item.product_name}</h4>
                                            {item.product?.brand && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                                    Brand: {item.product.brand.name}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-0.5">SKU: {item.product?.sku || 'N/A'}</p>

                                            {/* Patient Details */}
                                            {item.patient_name && (
                                                <div className="mt-3 p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800 max-w-md">
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Patient Information</p>
                                                    <div className="text-xs text-gray-650 dark:text-gray-400 space-y-1 font-medium">
                                                        <p><span className="text-gray-400 font-semibold">Name:</span> <span className="text-gray-800 dark:text-gray-200">{item.patient_name}</span></p>
                                                        {item.patient_age && <p><span className="text-gray-400 font-semibold">Age:</span> <span className="text-gray-800 dark:text-gray-200">{item.patient_age}</span></p>}
                                                        {item.patient_gender && <p><span className="text-gray-400 font-semibold">Gender:</span> <span className="text-gray-800 dark:text-gray-200">{item.patient_gender}</span></p>}
                                                        {item.health_concern && <p><span className="text-gray-400 font-semibold">Health Concern:</span> <span className="text-gray-800 dark:text-gray-200">{item.health_concern}</span></p>}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-550 dark:text-gray-400">
                                                <span>Qty: <span className="font-bold text-gray-900 dark:text-gray-100">{item.quantity}</span></span>
                                                <span className="text-gray-300 dark:text-gray-700">|</span>
                                                <span>Price: <span className="font-bold text-gray-900 dark:text-gray-100">₹{parseFloat(item.price).toFixed(2)}</span></span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-heading font-bold text-base text-gray-900 dark:text-gray-100">₹{parseFloat(item.total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pricing Summary inside the card */}
                        <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50/30 dark:bg-gray-900/30">
                            <div className="space-y-3 max-w-md ml-auto">
                                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Pricing Summary</h3>
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-gray-500 dark:text-gray-400">Subtotal (Your Items)</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">₹{itemsTotal.toFixed(2)}</span>
                                </div>

                                {/* Tax Breakdown */}
                                {order.igst > 0 ? (
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-500 dark:text-gray-400">IGST (Integrated GST)</span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">₹{parseFloat(order.igst).toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-gray-500 dark:text-gray-400">CGST (Central GST)</span>
                                            <span className="font-bold text-gray-900 dark:text-gray-100">₹{parseFloat(order.cgst).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-gray-500 dark:text-gray-400">SGST (State GST)</span>
                                            <span className="font-bold text-gray-900 dark:text-gray-100">₹{parseFloat(order.sgst).toFixed(2)}</span>
                                        </div>
                                    </>
                                )}

                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                        <span>Discount</span>
                                        <span className="font-bold">-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-gray-500 dark:text-gray-400">Shipping Charges</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {order.shipping_amount > 0 ? `₹${parseFloat(order.shipping_amount).toFixed(2)}` : 'Free'}
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Total Revenue</span>
                                        <span className="font-heading font-black text-lg text-emerald-600">₹{itemsTotal.toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-medium leading-relaxed">* This is your revenue from this order. Platform fees and final payout will be calculated separately.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Notes */}
                    {order.order_notes && (
                        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800 p-6">
                            <div className="flex items-start gap-3">
                                <FileText className="text-amber-500 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2">Customer Notes</h3>
                                    <p className="text-sm text-gray-605 dark:text-gray-400 font-medium leading-relaxed">{order.order_notes}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Customer & Address Info (1/3 width) */}
                <div className="space-y-6">
                    {/* Card 1: Customer Details & Payment */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6">
                        {/* Customer Info */}
                        <div className="mb-6">
                            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-4">Customer Details</h3>
                            {order.user ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <User size={18} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{order.user.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 tracking-wider mt-0.5">Customer ID: #{order.user.id}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            <Mail size={15} className="text-gray-400" />
                                            <a href={`mailto:${order.user.email}`} className="hover:text-emerald-600 transition-colors">
                                                {order.user.email}
                                            </a>
                                        </div>
                                        {shippingAddress.phone && (
                                            <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                <Phone size={15} className="text-gray-400" />
                                                <a href={`tel:${shippingAddress.phone}`} className="hover:text-emerald-600 transition-colors">
                                                    {shippingAddress.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-2">
                                    <User size={24} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500 text-sm font-semibold">Guest Customer</p>
                                    {shippingAddress.email && (
                                        <p className="text-xs text-gray-400 mt-1">{shippingAddress.email}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 my-5"></div>

                        {/* Payment Info */}
                        <div>
                            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-4">Payment Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-gray-500 dark:text-gray-400">Payment Method</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 capitalize">
                                        <CreditCard size={15} className="text-gray-400" />
                                        {order.payment_method?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span className="text-gray-500 dark:text-gray-400">Payment Status</span>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                        order.payment_status.toLowerCase() === 'paid'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                            : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                    }`}>
                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-4">
                                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Total Customer Paid</span>
                                    <span className="font-heading font-black text-lg text-emerald-600">₹{parseFloat(order.final_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Shipping & Delivery Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6 space-y-5">
                        {/* Shipping Address */}
                        <div>
                            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-4">Shipping Address</h3>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="text-gray-400" size={18} />
                                </div>
                                <div className="text-xs">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                        {shippingAddress.first_name} {shippingAddress.last_name}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed font-medium">
                                        {shippingAddress.street_address}
                                        {shippingAddress.apartment && <>, {shippingAddress.apartment}</>}
                                        <br />
                                        {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postcode}
                                        <br />
                                        {shippingAddress.country || 'India'}
                                    </p>
                                    {shippingAddress.phone && (
                                        <p className="text-gray-500 dark:text-gray-500 mt-2 font-semibold">
                                            Phone: {shippingAddress.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Billing Address (if different) */}
                        {billingAddress.street_address && billingAddress.street_address !== shippingAddress.street_address && (
                            <>
                                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-4">Billing Address</h3>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="text-gray-400" size={18} />
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                {billingAddress.first_name} {billingAddress.last_name}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed font-medium">
                                                {billingAddress.street_address}
                                                {billingAddress.apartment && <>, {billingAddress.apartment}</>}
                                                <br />
                                                {billingAddress.city}, {billingAddress.state} - {billingAddress.postcode}
                                                <br />
                                                {billingAddress.country || 'India'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Shipping Method */}
                        {order.shippingMethod && (
                            <>
                                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-4">Shipping Method</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Truck size={16} className="text-gray-400" />
                                            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{order.shippingMethod.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                                            Estimated Delivery: {order.shippingMethod.estimated_days}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Tracking Details */}
                        {(order.status === 'shipped' || order.status === 'processing' || order.status === 'delivered') && (
                            <>
                                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <Truck size={18} className="text-emerald-600" />
                                            Tracking Information
                                        </h3>
                                        {!isEditingTracking && (
                                            <button
                                                onClick={() => setIsEditingTracking(true)}
                                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1.5"
                                            >
                                                <Edit2 size={14} />
                                                {order.tracking_id ? 'Edit' : 'Add'}
                                            </button>
                                        )}
                                    </div>

                                    {isEditingTracking ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    Tracking ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={trackingId}
                                                    onChange={(e) => setTrackingId(e.target.value)}
                                                    placeholder="Enter tracking number"
                                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    Courier Provider
                                                </label>
                                                <select
                                                    value={trackingProvider}
                                                    onChange={(e) => setTrackingProvider(e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                                >
                                                    <option value="">Select Provider</option>
                                                    <option value="Shiprocket">Shiprocket</option>
                                                    <option value="Delhivery">Delhivery</option>
                                                    <option value="BlueDart">BlueDart</option>
                                                    <option value="DTDC">DTDC</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2 justify-end pt-1">
                                                <button
                                                    onClick={() => setIsEditingTracking(false)}
                                                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveTracking}
                                                    disabled={isSavingTracking}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <Save size={14} />
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
                                            {order.tracking_id ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 tracking-wider">Tracking ID</p>
                                                        <p className="font-mono font-medium text-base text-gray-900 dark:text-gray-100 mt-0.5">{order.tracking_id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 tracking-wider">Courier</p>
                                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mt-0.5">{order.tracking_provider || 'Not specified'}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 py-1">
                                                    <p className="text-xs font-semibold">No tracking information added yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
