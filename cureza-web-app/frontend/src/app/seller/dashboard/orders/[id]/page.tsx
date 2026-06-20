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

    // Delhivery Courier Flow States
    const [shipment, setShipment] = useState<any>(null);
    const [pickupSlots, setPickupSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [weight, setWeight] = useState('0.5');
    const [length, setLength] = useState('10');
    const [width, setWidth] = useState('10');
    const [height, setHeight] = useState('10');
    const [isBooking, setIsBooking] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);

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

    const fetchShipmentInfo = async () => {
        try {
            const response = await axios.get(`/seller/orders/${id}/shipment`);
            if (response.data && response.data.shipment) {
                setShipment(response.data.shipment);
            } else {
                setShipment(null);
                fetchPickupSlots();
            }
        } catch (error) {
            console.error('Failed to fetch shipment details:', error);
        }
    };

    const fetchPickupSlots = async () => {
        try {
            const response = await axios.get(`/seller/orders/${id}/pickup-slots`);
            if (response.data && response.data.slots) {
                setPickupSlots(response.data.slots);
                if (response.data.slots.length > 0) {
                    setSelectedSlot(response.data.slots[0].time);
                }
            }
        } catch (error) {
            console.error('Failed to fetch pickup slots:', error);
        }
    };

    const handleBookShipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) {
            alert('Please select a pickup time slot');
            return;
        }
        setIsBooking(true);
        try {
            const response = await axios.post(`/seller/orders/${id}/book-shipment`, {
                pickup_slot: selectedSlot,
                weight: parseFloat(weight),
                dimensions_l: parseInt(length),
                dimensions_w: parseInt(width),
                dimensions_h: parseInt(height),
            });
            alert('Shipment booked successfully with Delhivery!');
            setShipment(response.data.shipment);
            fetchOrder();
        } catch (error: any) {
            console.error('Failed to book shipment:', error);
            alert(error.response?.data?.message || 'Failed to book shipment');
        } finally {
            setIsBooking(false);
        }
    };

    const handleSimulateStatus = async (status: string) => {
        if (!shipment) return;
        setIsSimulating(true);
        try {
            await axios.post(`/seller/orders/${shipment.id}/simulate-shipment`, { status });
            alert(status === 'picked_up' ? 'Package handover acknowledged. Shipment is now marked as Picked Up.' : `Shipment status updated to: ${status}`);
            fetchOrder();
        } catch (error: any) {
            console.error('Failed to update shipment status:', error);
            alert(error.response?.data?.message || 'Failed to update status');
        } finally {
            setIsSimulating(false);
        }
    };

    const fetchOrder = async () => {
        try {
            const response = await axios.get(`/seller/orders/${id}`);
            setOrder(response.data);
            fetchShipmentInfo();
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const itemsTotal = order ? order.items.reduce((acc: number, item: any) => acc + parseFloat(item.total), 0) : 0;
    const shippingAddress = order ? (order.shipping_address_json || {}) : {};
    const billingAddress = order ? (order.billing_address_json || {}) : {};
    const sellerProfile = order?.seller_profile || order?.sellerProfile || {};

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

                    </div>
                </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-6">Order Timeline</h2>
                <div className="relative px-4 md:px-8">
                    {/* Horizontal Line for Desktop */}
                    <div className="hidden md:block absolute top-6 left-[56px] right-[56px] h-0.5 bg-gray-100 dark:bg-gray-800">
                        <div
                            className="h-full bg-emerald-600 transition-all duration-500"
                            style={{ width: `${currentStatusIndex >= 0 ? (currentStatusIndex / (timelineStages.length - 1)) * 100 : 0}%` }}
                        ></div>
                    </div>
                    
                    {/* Vertical Line for Mobile */}
                    <div className="md:hidden absolute top-6 bottom-6 left-[28px] w-0.5 bg-gray-100 dark:bg-gray-800">
                        <div
                            className="w-full bg-emerald-600 transition-all duration-500"
                            style={{ height: `${currentStatusIndex >= 0 ? (currentStatusIndex / (timelineStages.length - 1)) * 100 : 0}%` }}
                        ></div>
                    </div>

                    <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
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
                                <div key={stage.status} className="flex flex-row md:flex-col items-center gap-4 md:gap-0 flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all z-10 shrink-0 ${
                                        isCurrent
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                                            : isCompleted
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                                    }`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex flex-col md:items-center text-left md:text-center">
                                        <p className={`md:mt-3 text-xs font-bold ${isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {stage.label}
                                        </p>
                                        {showDate && (
                                            <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 font-semibold md:whitespace-nowrap">
                                                {showDate}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items & Summary (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Delhivery Shipping Integration Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-6">
                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <Truck size={18} className="text-emerald-600" />
                            Delhivery Logistics & Payout Flow
                        </h3>

                        {/* Seller Default Pickup Point */}
                        <div className="mb-6 p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide mb-2">
                                <MapPin size={14} />
                                Default Pickup Address (Delhivery Agent Location)
                            </h4>
                            {sellerProfile?.pickup_address_line_1 ? (
                                <div className="text-xs text-gray-700 dark:text-gray-300 font-medium space-y-1">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                        {sellerProfile.pickup_address_line_1}
                                        {sellerProfile.pickup_address_line_2 ? `, ${sellerProfile.pickup_address_line_2}` : ''}
                                    </p>
                                    <p>{sellerProfile.pickup_address_city}, {sellerProfile.pickup_address_state} - {sellerProfile.pickup_address_pin_code}</p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{sellerProfile.pickup_address_country || 'India'}</p>
                                </div>
                            ) : (
                                <p className="text-xs text-red-500 font-semibold">
                                    No default pickup address configured. Please go to <Link href="/seller/dashboard/settings" className="underline hover:text-red-700 font-bold">Settings</Link> to configure your pickup point.
                                </p>
                            )}
                        </div>

                        {/* Step Timeline Container */}
                        <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 pl-8 space-y-8">
                            
                            {/* Step 1: Pack & Prep */}
                            <div className="relative">
                                <span className="absolute -left-[41px] top-0 bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
                                    ✓
                                </span>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Package size={15} className="text-emerald-600" />
                                        Step 1: Order Received & Packed
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Prepare and pack the items securely in standard packaging. Ensure the correct products are enclosed inside.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2: Book Courier Pickup & AWB */}
                            <div className="relative">
                                <span className={`absolute -left-[41px] top-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm ${
                                    shipment 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'bg-emerald-500 text-white border-2 border-emerald-100 animate-pulse'
                                }`}>
                                    {shipment ? '✓' : '2'}
                                </span>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Calendar size={15} className="text-emerald-600" />
                                        Step 2: Schedule Courier Pickup
                                    </h4>
                                    
                                    {!shipment ? (
                                        /* Booking Form if shipment doesn't exist */
                                        order.status !== 'cancelled' && order.status !== 'delivered' ? (
                                            <div className="mt-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200/50 dark:border-gray-800">
                                                <p className="text-[11px] text-gray-500 font-semibold mb-3">Configure package dimensions and choose your convenient pickup window to generate the AWB tracking number.</p>
                                                <form onSubmit={handleBookShipment} className="space-y-4">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Weight (kg)</label>
                                                            <input 
                                                                type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)}
                                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-xs font-bold focus:ring-emerald-500 focus:border-emerald-500 text-black dark:text-white" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Length (cm)</label>
                                                            <input 
                                                                type="number" value={length} onChange={e => setLength(e.target.value)}
                                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-xs font-bold text-black dark:text-white" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Width (cm)</label>
                                                            <input 
                                                                type="number" value={width} onChange={e => setWidth(e.target.value)}
                                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-xs font-bold text-black dark:text-white" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Height (cm)</label>
                                                            <input 
                                                                type="number" value={height} onChange={e => setHeight(e.target.value)}
                                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-xs font-bold text-black dark:text-white" 
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select Pickup Slot</label>
                                                        {pickupSlots.length > 0 ? (
                                                            <select 
                                                                value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}
                                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-xs font-bold text-black dark:text-white"
                                                            >
                                                                {pickupSlots.map(s => (
                                                                    <option key={s.id} value={s.time}>{s.label}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <p className="text-xs text-red-500 font-semibold">Loading available pickup slots...</p>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="submit" disabled={isBooking}
                                                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                                                    >
                                                        {isBooking ? 'Booking Pickup...' : 'Schedule Pickup & Get AWB'}
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 mt-2 font-medium">Delhivery pickup cannot be scheduled for cancelled or delivered orders.</p>
                                        )
                                    ) : (
                                        /* Display Shipment Details & Status */
                                        <div className="mt-3 space-y-4 bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl border border-gray-200/50 dark:border-gray-800">
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AWB / Tracking Number</p>
                                                    <p className="font-mono font-bold text-sm text-gray-900 dark:text-gray-150 mt-0.5">{shipment.tracking_number}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Courier Partner</p>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{shipment.courier_name}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Booked Pickup Window</p>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{shipment.pickup_time_slot}</p>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Package Dimensions</p>
                                                <div className="flex gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    <span>Weight: {parseFloat(shipment.weight).toFixed(2)} kg</span>
                                                    <span>Size: {shipment.dimensions_l}x{shipment.dimensions_w}x{shipment.dimensions_h} cm</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Courier Agent Handover */}
                            <div className="relative">
                                <span className={`absolute -left-[41px] top-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm ${
                                    !shipment 
                                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                                        : shipment.status === 'delivered' 
                                            ? 'bg-emerald-600 text-white' 
                                            : 'bg-emerald-500 text-white border-2 border-emerald-100'
                                }`}>
                                    {shipment && shipment.status === 'delivered' ? '✓' : '3'}
                                </span>
                                <div>
                                    <h4 className={`font-bold text-sm flex items-center gap-2 ${
                                        shipment ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                                    }`}>
                                        <Truck size={15} />
                                        Step 3: Handover to Delhivery Courier
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        The Delhivery agent will arrive at your pickup address during the scheduled time window. Please handover the packed order with the printed shipping label affixed.
                                    </p>

                                    {shipment && (
                                        <div className="mt-3 bg-white dark:bg-gray-850 p-4 rounded-xl border border-gray-200/50 dark:border-gray-800 space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-gray-500">Courier Tracking Status</span>
                                                <span className="font-extrabold capitalize text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 text-[10px]">
                                                    {shipment.status.replace(/_/g, ' ')}
                                                </span>
                                            </div>

                                            {shipment.status === 'pickup_scheduled' && (
                                                <button
                                                    onClick={() => handleSimulateStatus('picked_up')}
                                                    disabled={isSimulating}
                                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow cursor-pointer mt-2"
                                                >
                                                    {isSimulating ? 'Acknowledging...' : 'I Have Handed Over Package to Delivery Boy'}
                                                </button>
                                            )}

                                            <p className="text-[10px] text-gray-400 italic">This timeline updates automatically as Delhivery scans the package status.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 4: Payout Settlement */}
                            <div className="relative">
                                <span className={`absolute -left-[41px] top-0 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm ${
                                    shipment && shipment.status === 'delivered' 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                                }`}>
                                    {shipment && shipment.status === 'delivered' ? '✓' : '4'}
                                </span>
                                <div>
                                    <h4 className={`font-bold text-sm flex items-center gap-2 ${
                                        shipment && shipment.status === 'delivered' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                                    }`}>
                                        <CreditCard size={15} />
                                        Step 4: Customer Delivery & Payout
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Once delivered to the customer, shipping charges & platform commission are programmatically deducted. The net earnings credit instantly to your Cureza wallet.
                                    </p>

                                    {shipment && (
                                        <div className="mt-3 bg-gray-50/50 dark:bg-gray-800/10 p-3 rounded-lg border border-gray-200/40 dark:border-gray-800 space-y-1.5 text-[11px]">
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span>COD Remittance</span>
                                                <span className="font-bold capitalize text-gray-800 dark:text-gray-200">{shipment.remittance_status}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-500">
                                                <span>Seller Wallet Payout</span>
                                                <span className={`font-bold capitalize ${shipment.payout_status === 'paid' ? 'text-emerald-600' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {shipment.payout_status}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Logistics SLA & Guidelines Section */}
                        <div className="mt-8 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/30 rounded-xl p-4 space-y-3">
                            <h4 className="font-bold text-xs text-amber-800 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                                <AlertCircle size={14} />
                                Logistics SLA & Seller Guidelines
                            </h4>
                            <ul className="text-xs text-amber-900/75 dark:text-amber-400/80 space-y-2 list-disc pl-4 leading-normal font-medium">
                                <li><strong>Package Dimensions:</strong> Enter precise package size and weight. Errors might lead to courier pickup rejection or payout adjustments.</li>
                                <li><strong>AWB Shipping Label:</strong> Print the generated shipping label from the button above, cut it out, and paste it clearly on top of the box.</li>
                                <li><strong>Dispatch SLA:</strong> You must schedule your pickup slot within 24 hours of order confirmation to maintain your seller score rating.</li>
                                <li><strong>Wallet Payout Math:</strong> Payout is automatically calculated upon courier delivery as: <code>Subtotal (Items) - Platform Commission - Gateway Fees - Shipping Charge</code>.</li>
                            </ul>
                        </div>
                    </div>

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
                    </div>
                </div>
            </div>
        </div>
    );
}
