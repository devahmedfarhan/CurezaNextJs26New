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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cureza-green"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order not found</h2>
                <p className="text-gray-500 mt-2">The order you're looking for doesn't exist or you don't have access to it.</p>
                <Link href="/seller/dashboard/orders" className="mt-4 inline-block px-4 py-2 bg-cureza-green text-white rounded-lg hover:bg-green-700">
                    Back to Orders
                </Link>
            </div>
        );
    }

    const itemsTotal = order.items.reduce((acc: number, item: any) => acc + parseFloat(item.total), 0);
    const shippingAddress = order.shipping_address_json || {};
    const billingAddress = order.billing_address_json || {};

    // Order timeline stages
    const timelineStages = [
        { status: 'pending', label: 'Order Placed', icon: Package, color: 'yellow' },
        { status: 'processing', label: 'Processing', icon: Clock, color: 'blue' },
        { status: 'shipped', label: 'Shipped', icon: Truck, color: 'purple' },
        { status: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'green' }
    ];

    const statusColors: any = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        processing: 'bg-blue-100 text-blue-700 border-blue-200',
        shipped: 'bg-purple-100 text-purple-700 border-purple-200',
        delivered: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200'
    };

    const getStatusIndex = (status: string) => {
        return timelineStages.findIndex(s => s.status === status);
    };

    const currentStatusIndex = getStatusIndex(order.status);

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-start gap-4">
                        <Link href="/seller/dashboard/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors mt-1">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order #{order.order_number}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </div>
                                <span>•</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColors[order.status] || statusColors.pending}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrintInvoice}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Printer size={16} />
                            Print Invoice
                        </button>
                        <button
                            onClick={handlePrintShippingLabel}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Package size={16} />
                            Print Shipping Label
                        </button>

                        {/* Status Update Buttons */}
                        {order.status === 'pending' && (
                            <button
                                onClick={() => handleUpdateStatus('processing')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Clock size={16} />
                                Mark as Processing
                            </button>
                        )}
                        {order.status === 'processing' && (
                            <button
                                onClick={() => handleUpdateStatus('shipped')}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                            >
                                <Truck size={16} />
                                Mark as Shipped
                            </button>
                        )}
                        {order.status === 'shipped' && (
                            <button
                                onClick={() => handleUpdateStatus('delivered')}
                                className="flex items-center gap-2 px-4 py-2 bg-cureza-green text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                                <CheckCircle size={16} />
                                Mark as Delivered
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tracking Information Section */}
            {(order.status === 'shipped' || order.status === 'processing' || order.status === 'delivered') && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Truck size={20} className="text-cureza-green" />
                            Tracking Information
                        </h2>
                        {!isEditingTracking && (
                            <button
                                onClick={() => setIsEditingTracking(true)}
                                className="text-sm text-cureza-green hover:underline flex items-center gap-1"
                            >
                                <Edit2 size={14} />
                                {order.tracking_id ? 'Edit Tracking' : 'Add Tracking'}
                            </button>
                        )}
                    </div>

                    {isEditingTracking ? (
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tracking ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    placeholder="Enter tracking number"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cureza-green focus:border-transparent"
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Courier Provider
                                </label>
                                <select
                                    value={trackingProvider}
                                    onChange={(e) => setTrackingProvider(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cureza-green focus:border-transparent"
                                >
                                    <option value="">Select Provider</option>
                                    <option value="Shiprocket">Shiprocket</option>
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="BlueDart">BlueDart</option>
                                    <option value="DTDC">DTDC</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsEditingTracking(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTracking}
                                    disabled={isSavingTracking}
                                    className="px-4 py-2 bg-cureza-green text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
                            {order.tracking_id ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Tracking ID</p>
                                        <p className="font-mono font-medium text-lg text-gray-900 dark:text-gray-100">{order.tracking_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Courier</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{order.tracking_provider || 'Not specified'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-2">
                                    <p>No tracking information added yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Order Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Order Timeline</h2>
                <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    <div
                        className="absolute top-6 left-0 h-0.5 bg-cureza-green transition-all duration-500"
                        style={{ width: `${(currentStatusIndex / (timelineStages.length - 1)) * 100}%` }}
                    ></div>
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
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all z-10 ${isCompleted
                                        ? 'bg-cureza-green border-cureza-green text-white'
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                                        } ${isCurrent ? 'ring-4 ring-green-100 dark:ring-green-900' : ''}`}>
                                        <Icon size={20} />
                                    </div>
                                    <p className={`mt-3 text-xs font-medium text-center ${isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {stage.label}
                                    </p>
                                    {showDate && (
                                        <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
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
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Order Items</h3>
                            <p className="text-sm text-gray-500 mt-1">{order.items.length} item(s) in this order</p>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-6">
                                    <div className="flex gap-4">
                                        {item.product?.image ? (
                                            <img
                                                src={item.product.image}
                                                alt={item.product_name}
                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-4xl">
                                                📦
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100">{item.product_name}</h4>
                                            {item.product?.brand && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Brand: {item.product.brand.name}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.product?.sku || 'N/A'}</p>

                                            {/* Patient Details */}
                                            {item.patient_name && (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                                    <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Patient Information</p>
                                                    <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                        <p><span className="font-medium">Name:</span> {item.patient_name}</p>
                                                        {item.patient_age && <p><span className="font-medium">Age:</span> {item.patient_age}</p>}
                                                        {item.patient_gender && <p><span className="font-medium">Gender:</span> {item.patient_gender}</p>}
                                                        {item.health_concern && <p><span className="font-medium">Health Concern:</span> {item.health_concern}</p>}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">Qty: <span className="font-medium">{item.quantity}</span></span>
                                                <span className="text-sm text-gray-600 dark:text-gray-300">Price: <span className="font-medium">₹{parseFloat(item.price).toFixed(2)}</span></span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">₹{parseFloat(item.total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Pricing Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal (Your Items)</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">₹{itemsTotal.toFixed(2)}</span>
                            </div>

                            {/* Tax Breakdown */}
                            {order.igst > 0 ? (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">IGST (Integrated GST)</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">₹{parseFloat(order.igst).toFixed(2)}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">CGST (Central GST)</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">₹{parseFloat(order.cgst).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">SGST (State GST)</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">₹{parseFloat(order.sgst).toFixed(2)}</span>
                                    </div>
                                </>
                            )}

                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span className="font-medium">-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Shipping Charges</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {order.shipping_amount > 0 ? `₹${parseFloat(order.shipping_amount).toFixed(2)}` : 'Free'}
                                </span>
                            </div>

                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between">
                                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Total Revenue</span>
                                    <span className="font-bold text-lg text-cureza-green">₹{itemsTotal.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">* This is your revenue from this order. Platform fees and final payout will be calculated separately.</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.order_notes && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
                            <div className="flex items-start gap-3">
                                <FileText className="text-amber-600 dark:text-amber-400 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2">Customer Notes</h3>
                                    <p className="text-sm text-amber-800 dark:text-amber-200">{order.order_notes}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Customer & Address Info */}
                <div className="space-y-6">
                    {/* Customer Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Customer Details</h3>
                        {order.user ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-cureza-green/10 rounded-full flex items-center justify-center">
                                        <User size={20} className="text-cureza-green" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{order.user.name}</p>
                                        <p className="text-xs text-gray-500">Customer ID: #{order.user.id}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail size={16} className="text-gray-400" />
                                        <a href={`mailto:${order.user.email}`} className="text-gray-700 dark:text-gray-300 hover:text-cureza-green">
                                            {order.user.email}
                                        </a>
                                    </div>
                                    {shippingAddress.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone size={16} className="text-gray-400" />
                                            <a href={`tel:${shippingAddress.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-cureza-green">
                                                {shippingAddress.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <User size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500 text-sm">Guest Customer</p>
                                {shippingAddress.email && (
                                    <p className="text-xs text-gray-400 mt-1">{shippingAddress.email}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Information */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Payment Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase flex items-center gap-2">
                                    <CreditCard size={16} />
                                    {order.payment_method}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
                                <span className={`text-sm font-medium px-2 py-1 rounded ${order.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    {order.payment_status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Amount</span>
                                <span className="text-lg font-bold text-cureza-green">₹{parseFloat(order.final_amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Method */}
                    {order.shippingMethod && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Shipping Method</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Truck size={18} className="text-cureza-green" />
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{order.shippingMethod.name}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 ml-6">
                                    Estimated Delivery: {order.shippingMethod.estimated_days}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Shipping Address */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Shipping Address</h3>
                        <div className="flex items-start gap-3">
                            <MapPin className="text-cureza-green mt-1" size={20} />
                            <div className="text-sm">
                                <p className="font-bold text-gray-900 dark:text-gray-100">
                                    {shippingAddress.first_name} {shippingAddress.last_name}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                                    {shippingAddress.street_address}
                                    {shippingAddress.apartment && <>, {shippingAddress.apartment}</>}
                                    <br />
                                    {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postcode}
                                    <br />
                                    {shippingAddress.country || 'India'}
                                </p>
                                {shippingAddress.phone && (
                                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                                        Phone: {shippingAddress.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Billing Address (if different) */}
                    {billingAddress.street_address && billingAddress.street_address !== shippingAddress.street_address && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Billing Address</h3>
                            <div className="flex items-start gap-3">
                                <MapPin className="text-gray-400 mt-1" size={20} />
                                <div className="text-sm">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                        {billingAddress.first_name} {billingAddress.last_name}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
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
                    )}
                </div>
            </div>
        </div>
    );
}
