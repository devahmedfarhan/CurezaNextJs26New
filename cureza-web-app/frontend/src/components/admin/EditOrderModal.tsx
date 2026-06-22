'use client';

import { useState } from 'react';
import { X, Info } from 'lucide-react';
import api from '@/lib/api';

interface EditOrderModalProps {
    order: any;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditOrderModal({ order, onClose, onUpdate }: EditOrderModalProps) {
    const [activeTab, setActiveTab] = useState<'status' | 'shipping'>('status');
    
    // Status & Tracking states
    const [status, setStatus] = useState(order.status);
    const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
    const [paymentMethod, setPaymentMethod] = useState(order.payment_method || '');
    const [trackingId] = useState(order.tracking_id || '');
    const [trackingProvider] = useState(order.tracking_provider || '');
    
    // Shipping Address states
    const [shippingAddress, setShippingAddress] = useState({
        name: order.shipping_address_json?.name || '',
        line: order.shipping_address_json?.line || '',
        city: order.shipping_address_json?.city || '',
        state: order.shipping_address_json?.state || '',
        zip: order.shipping_address_json?.zip || '',
        country: order.shipping_address_json?.country || 'India',
        phone: order.shipping_address_json?.phone || '',
    });
    
    const [loading, setLoading] = useState(false);

    const handleAddressChange = (field: string, value: string) => {
        setShippingAddress(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/admin/orders/${order.id}`, {
                status,
                payment_status: paymentStatus,
                payment_method: paymentMethod || null,
                shipping_address_json: shippingAddress,
                // Keep existing tracking info unchanged on update request (since it's read-only for superadmin)
                tracking_id: order.tracking_id || null,
                tracking_provider: order.tracking_provider || null
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update order:', error);
            alert('Failed to update order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 rounded-[10px] shadow-xl w-full max-w-lg mx-4 overflow-hidden border border-neutral-955/15 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b border-neutral-955/10 dark:border-neutral-800 bg-neutral-50/50 dark:bg-gray-850/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Update Order Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-955/10 dark:border-neutral-800 bg-neutral-50/10 dark:bg-gray-900/50 text-xs">
                    <button
                        type="button"
                        onClick={() => setActiveTab('status')}
                        className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all ${
                            activeTab === 'status'
                                ? 'border-black dark:border-white text-black dark:text-white font-bold'
                                : 'border-transparent text-gray-450 dark:text-gray-500 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        Status & Billing
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('shipping')}
                        className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all ${
                            activeTab === 'shipping'
                                ? 'border-black dark:border-white text-black dark:text-white font-bold'
                                : 'border-transparent text-gray-450 dark:text-gray-500 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        Shipping Address
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {activeTab === 'status' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-550 uppercase tracking-wider mb-1.5">Order Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value;
                                            setStatus(newStatus);
                                            if (newStatus === 'cod_reconciled') {
                                                setPaymentStatus('paid');
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        {order.payment_method?.toLowerCase() === 'cod' && (
                                            <option value="cod_reconciled">COD Reconciled</option>
                                        )}
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">Payment Status</label>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">Payment Method</label>
                                <input
                                    type="text"
                                    placeholder="e.g. COD, Razorpay, UPI"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all"
                                />
                            </div>

                            {/* Disabled Courier & Tracking Info */}
                            <div className="pt-2 border-t border-neutral-955/5 dark:border-neutral-800/50 space-y-4">
                                <div className="bg-neutral-50 dark:bg-gray-850/50 border border-neutral-955/10 dark:border-neutral-800 rounded-[10px] p-3 text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-2.5">
                                    <Info size={14} className="text-gray-400 dark:text-gray-555 mt-0.5 shrink-0" />
                                    <span>
                                        Delivery details are managed by the seller or Shiprocket automation. These fields are read-only.
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1.5">Courier Provider</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={trackingProvider || 'Not Booked Yet'}
                                            className="w-full px-3 py-2 border border-neutral-955/10 dark:border-neutral-800/80 rounded-[10px] bg-neutral-100/70 dark:bg-neutral-800/30 text-gray-400 dark:text-gray-500 text-xs outline-none cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-1.5">AWB Tracking Number</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={trackingId || 'Not Generated Yet'}
                                            className="w-full px-3 py-2 border border-neutral-955/10 dark:border-neutral-800/80 rounded-[10px] bg-neutral-100/70 dark:bg-neutral-800/30 text-gray-400 dark:text-gray-550 text-xs outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">Recipient Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={shippingAddress.name}
                                        onChange={(e) => handleAddressChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">Phone Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={shippingAddress.phone}
                                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">Address Line</label>
                                <textarea
                                    rows={2}
                                    required
                                    value={shippingAddress.line}
                                    onChange={(e) => handleAddressChange('line', e.target.value)}
                                    className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={shippingAddress.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">State</label>
                                    <input
                                        type="text"
                                        required
                                        value={shippingAddress.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">ZIP Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={shippingAddress.zip}
                                        onChange={(e) => handleAddressChange('zip', e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-450 dark:text-gray-555 uppercase tracking-wider mb-1.5">Country</label>
                                    <input
                                        type="text"
                                        required
                                        value={shippingAddress.country}
                                        onChange={(e) => handleAddressChange('country', e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-955/15 dark:border-neutral-800 rounded-[10px] bg-neutral-50/50 dark:bg-gray-850/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-black focus:border-black dark:text-white text-xs outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Actions */}
                    <div className="pt-4 flex justify-end gap-2.5 border-t border-neutral-955/10 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-neutral-955/10 dark:border-neutral-800 rounded-[10px] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold text-xs transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-[10px] font-semibold text-xs disabled:opacity-50 hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-all shadow-none"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
